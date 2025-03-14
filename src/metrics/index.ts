import { Context, Next } from "hono";
import { Counter, Histogram, Registry } from "prom-client";
const registry = new Registry();

const requestCounter = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  registers: [registry],
  labelNames: ["method", "route", "status_code"],
});

const httpRequestDurationMilliseconds = new Histogram({
  name: "http_request_duration_ms",
  help: "Duration of HTTP requests in ms",
  registers: [registry],
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 5, 15, 50, 100, 300, 500, 1000, 3000, 5000],
});

export const metricsMiddleware = async (c: Context, next: Next) => {
  const start = Date.now();

  await next();

  const duration = Date.now() - start;
  const { method, url } = c.req;
  const status_code = c.res.status;

  requestCounter.labels(method, url, status_code.toString()).inc();

  httpRequestDurationMilliseconds
    .labels(method, url, status_code.toString())
    .observe(duration);
};
