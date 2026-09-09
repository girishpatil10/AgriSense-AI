import uuid
from typing import List

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.farm import Farm
from app.db.models.user import User
from app.dependencies import get_current_user, get_db
from app.schemas.farm import FarmCreate, FarmResponse, FarmUpdate
from app.utils.ownership import verify_farm_owner

router = APIRouter(prefix="/farms", tags=["farms"])


@router.post("", response_model=FarmResponse, status_code=status.HTTP_201_CREATED)
async def create_farm(
    body: FarmCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    farm = Farm(user_id=current_user.user_id, **body.model_dump())
    db.add(farm)
    await db.commit()
    await db.refresh(farm)
    return farm


@router.get("", response_model=List[FarmResponse])
async def list_farms(
    response: Response,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    base_q = select(Farm).where(
        Farm.user_id == current_user.user_id, Farm.is_deleted == False  # noqa: E712
    )
    total_result = await db.execute(select(func.count()).select_from(base_q.subquery()))
    total = total_result.scalar_one()

    farms_result = await db.execute(
        base_q.order_by(Farm.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    farms = farms_result.scalars().all()

    response.headers["X-Total-Count"] = str(total)
    return farms


@router.get("/{farm_id}", response_model=FarmResponse)
async def get_farm(
    farm_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await verify_farm_owner(farm_id, current_user.user_id, db)


@router.put("/{farm_id}", response_model=FarmResponse)
async def update_farm(
    farm_id: uuid.UUID,
    body: FarmUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    farm = await verify_farm_owner(farm_id, current_user.user_id, db)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(farm, field, value)
    await db.commit()
    await db.refresh(farm)
    return farm


@router.delete("/{farm_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_farm(
    farm_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    farm = await verify_farm_owner(farm_id, current_user.user_id, db)
    farm.is_deleted = True
    await db.commit()
