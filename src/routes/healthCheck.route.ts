import { Hono } from "hono";
import { healthCheck } from "../controllers/healthCheck.controller";
import { rateLimiter } from "../middlewares/rate.limitter";

export const healthCheckRouter = new Hono()
    .use(rateLimiter)
    .get("/", healthCheck);
