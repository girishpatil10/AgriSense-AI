import uuid
from typing import List

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.soil_report import SoilReport
from app.db.models.user import User
from app.dependencies import get_current_user, get_db
from app.schemas.soil import SoilReportCreate, SoilReportResponse
from app.utils.errors import ApiError
from app.utils.ownership import verify_farm_owner

router = APIRouter(prefix="/farms", tags=["soil-reports"])


@router.post(
    "/{farm_id}/soil-reports",
    response_model=SoilReportResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_soil_report(
    farm_id: uuid.UUID,
    body: SoilReportCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await verify_farm_owner(farm_id, current_user.user_id, db)
    report = SoilReport(farm_id=farm_id, **body.model_dump())
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


@router.get("/{farm_id}/soil-reports", response_model=List[SoilReportResponse])
async def list_soil_reports(
    farm_id: uuid.UUID,
    response: Response,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await verify_farm_owner(farm_id, current_user.user_id, db)

    base_q = select(SoilReport).where(SoilReport.farm_id == farm_id)
    total_result = await db.execute(select(func.count()).select_from(base_q.subquery()))
    total = total_result.scalar_one()

    reports_result = await db.execute(
        base_q.order_by(SoilReport.reported_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    reports = reports_result.scalars().all()

    response.headers["X-Total-Count"] = str(total)
    return reports


@router.delete(
    "/{farm_id}/soil-reports/{report_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_soil_report(
    farm_id: uuid.UUID,
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await verify_farm_owner(farm_id, current_user.user_id, db)

    result = await db.execute(
        select(SoilReport).where(
            SoilReport.report_id == report_id, SoilReport.farm_id == farm_id
        )
    )
    report = result.scalar_one_or_none()
    if report is None:
        raise ApiError("REPORT_NOT_FOUND", "Soil report not found.", 404)

    await db.delete(report)
    await db.commit()
