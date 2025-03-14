import { Hono } from "hono";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { rateLimiter } from "../middlewares/rate.limitter";
import { metricsMiddleware } from "../metrics";

export const userRouter = new Hono()
  .use("*", metricsMiddleware)
  .post("/login", rateLimiter, UserController.login)
  .post("/register", rateLimiter, UserController.postUser)
  .get("/user", rateLimiter, UserController.getUserById)
  .get("/user/:email", rateLimiter, UserController.getUserByEmail)
  .post("/logout", rateLimiter, authMiddleware, UserController.logout)
  .delete("/deleteUser", rateLimiter, UserController.deleteUser)
  .get("/refresh", rateLimiter, UserController.refresh)
  .get("/me", rateLimiter, authMiddleware, UserController.me);
