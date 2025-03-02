import { Hono } from "hono";
import { healthCheck } from "../controllers/healthCheck.controller";

export const healthCheckRouter = new Hono().get("/", healthCheck);
