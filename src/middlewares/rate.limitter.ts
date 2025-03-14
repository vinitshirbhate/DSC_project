import { Context, Next } from "hono";
import { RedisSingleton } from "../db/redis.cache";

export const rateLimiter = async (c : Context,next : Next) => {
    try {
        const redisClient = RedisSingleton.getInstance(c)
        console.log(c.req)
    } catch (error) {
        return c.json({
            message : error instanceof Error ? error.message : error,
            success : false
        }, 500)
    }
}