import time
import functools
import os
from logger import logger

def retry(times=3, delay=5, error_message="Operation failed"):
    """Retry decorator with logging and delay between attempts."""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_exc = None
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exc = e
                    logger.warning(f"{error_message}: {e} (Attempt {attempt}/{times})")
                    if attempt < times:
                        time.sleep(delay)
            raise last_exc
        return wrapper
    return decorator


def ensure_dirs(*dirs):
    """Ensure that the specified directories exist (thread-safe)."""
    for d in dirs:
        try:
            os.makedirs(d, exist_ok=True)
        except Exception as e:
            logger.error(f"Failed to create directory '{d}': {e}")
            raise e
        else:
            logger.info(f"Directory ready: {d}")