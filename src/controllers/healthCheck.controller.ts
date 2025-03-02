import { Context } from "hono";

export const healthCheck = async (c: Context) => {
  try {
    //TODO: add health check logic

    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "your-service-name",
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
