"""Redis sliding-window rate limiter."""
import time

from fastapi import HTTPException, Request, status
from redis.asyncio import Redis

from app.config import settings
from app.state import get_redis_client


async def rate_limit(request: Request) -> None:
    redis: Redis = get_redis_client()
    ip = request.client.host if request.client else "unknown"
    key = f"rate:{ip}"
    now = int(time.time())
    window = 60  # 1 minute
    limit = settings.RATE_LIMIT_PER_MINUTE

    pipe = redis.pipeline()
    pipe.zremrangebyscore(key, 0, now - window)
    pipe.zadd(key, {str(now): now})
    pipe.zcard(key)
    pipe.expire(key, window)
    results = await pipe.execute()

    count: int = results[2]
    if count > limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"code": "RATE_LIMITED", "message": "Too many requests, slow down."},
        )
