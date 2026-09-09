import asyncio
import functools
import time
from enum import Enum
from typing import Any, Callable, TypeVar

from app.state import get_redis_client

T = TypeVar("T")

class CircuitState(Enum):
    CLOSED = "CLOSED"
    OPEN = "OPEN"
    HALF_OPEN = "HALF_OPEN"

class CircuitBreakerError(Exception):
    pass

def circuit_breaker(
    service_name: str, 
    failure_threshold: int = 3, 
    recovery_timeout: int = 60
):
    def decorator(func: Callable[..., Any]):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            redis = get_redis_client()
            if not redis:
                # If redis is not available, just call the function
                return await func(*args, **kwargs)

            state_key = f"cb:{service_name}:state"
            failure_key = f"cb:{service_name}:failures"
            last_failure_key = f"cb:{service_name}:last_failure"

            state_bytes = await redis.get(state_key)
            state = state_bytes.decode() if state_bytes else CircuitState.CLOSED.value

            if state == CircuitState.OPEN.value:
                last_failure_bytes = await redis.get(last_failure_key)
                last_failure = float(last_failure_bytes.decode()) if last_failure_bytes else 0
                
                if time.time() - last_failure > recovery_timeout:
                    state = CircuitState.HALF_OPEN.value
                    await redis.set(state_key, state)
                else:
                    raise CircuitBreakerError(f"Circuit breaker for {service_name} is OPEN")

            try:
                result = await func(*args, **kwargs)
                
                # If successful, reset failures and close circuit
                if state != CircuitState.CLOSED.value:
                    await redis.set(state_key, CircuitState.CLOSED.value)
                    await redis.delete(failure_key)
                    await redis.delete(last_failure_key)
                
                return result
            except Exception as e:
                # Increment failure count
                failures = await redis.incr(failure_key)
                await redis.set(last_failure_key, str(time.time()))

                if failures >= failure_threshold:
                    await redis.set(state_key, CircuitState.OPEN.value)
                
                raise e

        return wrapper
    return decorator
