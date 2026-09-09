from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.dependencies import get_current_user, get_db, get_redis
from app.db.models.user import User
from app.schemas.auth import (
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UpdateProfileRequest,
    ChangePasswordRequest,
    UserResponse,
)
from app.services.auth_service import (
    blacklist_refresh_token,
    create_access_token,
    create_refresh_token,
    hash_password,
    is_token_blacklisted,
    verify_password,
    verify_token,
)
from app.utils.errors import ApiError
from app.utils.rate_limit import rate_limit

router = APIRouter(prefix="/auth", tags=["auth"])

MAX_FAILED_ATTEMPTS = 5


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    body: RegisterRequest,
    db: AsyncSession = Depends(get_db),
    _rl=Depends(rate_limit),
):
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise ApiError("EMAIL_TAKEN", "An account with this email already exists.", 409)

    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        full_name=body.full_name,
        phone=body.phone,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),
    redis=Depends(get_redis),
    _rl=Depends(rate_limit),
):
    result = await db.execute(select(User).where(User.email == body.email))
    user: User | None = result.scalar_one_or_none()

    if not user:
        raise ApiError("INVALID_CREDENTIALS", "Invalid email or password.", 401)

    if user.is_locked:
        raise ApiError("ACCOUNT_LOCKED", "Account is locked due to too many failed attempts.", 403)

    if not verify_password(body.password, user.password_hash):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
            user.is_locked = True
        await db.commit()
        raise ApiError("INVALID_CREDENTIALS", "Invalid email or password.", 401)

    # Successful login — reset counter
    user.failed_login_attempts = 0
    await db.commit()

    access_token = create_access_token(str(user.user_id), user.role)
    refresh_token = create_refresh_token(str(user.user_id))

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    body: RefreshRequest,
    db: AsyncSession = Depends(get_db),
    redis=Depends(get_redis),
):
    try:
        payload = verify_token(body.refresh_token)
    except ValueError:
        raise ApiError("INVALID_TOKEN", "Invalid or expired refresh token.", 401)

    if payload.get("type") != "refresh":
        raise ApiError("INVALID_TOKEN", "Not a refresh token.", 401)

    if await is_token_blacklisted(body.refresh_token, redis):
        raise ApiError("TOKEN_REVOKED", "Refresh token has been revoked.", 401)

    user_id: str = payload.get("sub")
    result = await db.execute(select(User).where(User.user_id == user_id))
    user: User | None = result.scalar_one_or_none()

    if not user or not user.is_active or user.is_locked:
        raise ApiError("UNAUTHORIZED", "User not found or inactive.", 401)

    # Rotate: blacklist old refresh token
    await blacklist_refresh_token(body.refresh_token, redis)

    access_token = create_access_token(str(user.user_id), user.role)
    new_refresh_token = create_refresh_token(str(user.user_id))

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    body: LogoutRequest,
    redis=Depends(get_redis),
):
    await blacklist_refresh_token(body.refresh_token, redis)


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    body: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.full_name is not None:
        current_user.full_name = body.full_name
    if body.phone is not None:
        current_user.phone = body.phone
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.post("/me/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(body.current_password, current_user.password_hash):
        raise ApiError("INVALID_PASSWORD", "Current password is incorrect.", 400)
    current_user.password_hash = hash_password(body.new_password)
    await db.commit()
