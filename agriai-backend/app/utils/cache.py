import hashlib
import json
from typing import Any

from app.state import get_redis_client


async def cache_get(key: str) -> dict | None:
    redis = get_redis_client()
    if not redis:
        return None
    val = await redis.get(key)
    if val:
        return json.loads(val)
    return None


async def cache_set(key: str, value: dict, ttl: int = 3600) -> None:
    redis = get_redis_client()
    if not redis:
        return
    await redis.set(key, json.dumps(value, default=str), ex=ttl)


def make_cache_key(prefix: str, **kwargs: Any) -> str:
    """Generate a sha256 hash key based on the prefix and sorted inputs."""
    sorted_items = sorted(kwargs.items())
    key_str = f"{prefix}:" + json.dumps(sorted_items, default=str)
    hashed = hashlib.sha256(key_str.encode("utf-8")).hexdigest()
    return f"{prefix}:{hashed}"
