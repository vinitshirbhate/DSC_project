import { Context, Next } from "hono";
import { RedisSingleton } from "../db/redis.cache";
import { RateLimitCache } from "../db/ratelimit.memory";

export const rateLimiter = async (c: Context, next: Next) => {
  const LIMIT = 10;
  const WINDOW = 60;

  try {
    const redisClient = RedisSingleton.getInstance(c);
    const ip =
      c.req.header("cf-connecting-ip") ??
      c.req.header("CF-Connecting-IP") ??
      "127.0.0.1";
    const path = c.req.routePath;
    const cacheKey = `ip:${ip}:${path}`;

    let reqs = RateLimitCache.getIp(cacheKey) ?? 0;

    if (reqs >= LIMIT) throw new Error("RATE-LIMIT");

    RateLimitCache.incrementIp(cacheKey, WINDOW);

    let reqs_redis = (await redisClient.get<number>(cacheKey)) ?? 0;

    if (reqs_redis >= LIMIT) throw new Error("RATE-LIMIT");

    await redisClient.set(cacheKey, reqs_redis + 1);
    await redisClient.expire(cacheKey, WINDOW);

    await next();
  } catch (error) {
    return c.json({ message: error instanceof Error ? error.message : error, success: false }, 429);
  }
};
