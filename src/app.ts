import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { userRouter } from "./routes/user.routes";
import { healthCheckRouter } from "./routes/healthCheck.route";

const app = new Hono<{
  Bindings : {
    DATABASE_URL : string,
    UPSTASH_REDIS_REST_URL : string,
    UPSTASH_REDIS_REST_TOKEN : string
  }
}>();

app.use(logger());
app.use("/*", cors());
const apiRoutes = app
  .basePath("/api/v1")
  .route("/", userRouter)
  .route("/healthCheck", healthCheckRouter);
export default app;
export type ApiRoutes = typeof apiRoutes;
