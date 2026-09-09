import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.farm import Farm
from app.utils.errors import ApiError


async def verify_farm_owner(
    farm_id: uuid.UUID, user_id: uuid.UUID, session: AsyncSession
) -> Farm:
    """Return the farm if it belongs to user_id and is not deleted, else raise ApiError."""
    result = await session.execute(
        select(Farm).where(Farm.farm_id == farm_id, Farm.is_deleted == False)  # noqa: E712
    )
    farm = result.scalar_one_or_none()
    if farm is None:
        raise ApiError("FARM_NOT_FOUND", "Farm not found.", 404)
    if farm.user_id != user_id:
        raise ApiError("FORBIDDEN", "You do not have access to this farm.", 403)
    return farm
