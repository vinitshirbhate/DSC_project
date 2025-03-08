import { Context } from "hono";
import { getPrismaClient } from "../db/prisma";
import { RedisSingleton } from "../db/redis.cache";

export const healthCheck = async (c: Context) => {
  try {
    const prismaCheck = getPrismaClient(c.env.DATABASE_URL!);
    await prismaCheck.$queryRaw`SELECT 1`;

    const redisCheck = RedisSingleton.getInstance(c);
    const redisPing = await redisCheck.ping();
    if (redisPing !== "PONG") {
      throw new Error("Redis not connected");
    }
    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "authBackend",
      version: "1.0.0",
      checks: {
        database: "connected",
        cache: "connected",
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Service unhealthy";
    return c.json(
      {
        status: "error",
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      503
    );
  }
};
