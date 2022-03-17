import redis

from .env import REDIS_HOST, REDIS_PORT

db = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0)
