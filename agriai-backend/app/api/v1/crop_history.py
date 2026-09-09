import uuid
from typing import List

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.crop_history import CropHistory
from app.db.models.user import User
from app.dependencies import get_current_user, get_db
from app.schemas.crop_history import CropHistoryCreate, CropHistoryResponse
from app.utils.ownership import verify_farm_owner

router = APIRouter(prefix="/farms", tags=["crop-history"])


@router.post(
    "/{farm_id}/crop-history",
    response_model=CropHistoryResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_crop_history(
    farm_id: uuid.UUID,
    body: CropHistoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await verify_farm_owner(farm_id, current_user.user_id, db)
    entry = CropHistory(farm_id=farm_id, **body.model_dump())
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.get("/{farm_id}/crop-history", response_model=List[CropHistoryResponse])
async def list_crop_history(
    farm_id: uuid.UUID,
    response: Response,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await verify_farm_owner(farm_id, current_user.user_id, db)

    base_q = select(CropHistory).where(CropHistory.farm_id == farm_id)
    total_result = await db.execute(select(func.count()).select_from(base_q.subquery()))
    total = total_result.scalar_one()

    entries_result = await db.execute(
        base_q.order_by(CropHistory.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    entries = entries_result.scalars().all()

    response.headers["X-Total-Count"] = str(total)
    return entries
