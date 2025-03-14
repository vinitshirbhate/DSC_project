import { Context, Hono, Next } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { userRouter } from "./routes/user.routes";
import { healthCheckRouter } from "./routes/healthCheck.route";
import docsRouter from "./routes/docs.routes";
import { prometheus } from "@hono/prometheus";
import { metricsMiddleware } from "./metrics";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    UPSTASH_REDIS_REST_URL: string;
    UPSTASH_REDIS_REST_TOKEN: string;
    ACCESS_SECRET: string;
    REFERSH_SECRET: string;
  };
}>();
const { printMetrics, registerMetrics } = prometheus();
// the below code does not work
//service core:user:authbackend: Uncaught ReferenceError: client is not defined
//giving this error

// const collectDefaultMetrics = client.collectDefaultMetrics;
// collectDefaultMetrics({ register: client.register });
app.use("*", registerMetrics);
app.use(logger());
app.use("/*", cors());
const apiRoutes = app
  .get("/metrics", printMetrics)
  .basePath("/api/v1")
  .route("/", userRouter)
  .route("/", docsRouter)
  .route("/healthCheck", healthCheckRouter);

export default app;
export type ApiRoutes = typeof apiRoutes;
