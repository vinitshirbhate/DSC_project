import { Hono } from "hono";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { rateLimiter } from "../middlewares/rate.limitter";

export const userRouter = new Hono()
  .post("/login", rateLimiter, UserController.login)
  .post("/register", rateLimiter, UserController.postUser)
  .get("/user", rateLimiter, UserController.getUserById)
  .get("/user/:email", rateLimiter, UserController.getUserByEmail)
  .post("/logout", rateLimiter, authMiddleware, UserController.logout)
  .get("/refresh", rateLimiter, UserController.refresh)
  .get("/me", rateLimiter, authMiddleware, UserController.me);
