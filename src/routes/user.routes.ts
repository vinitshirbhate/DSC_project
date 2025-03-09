import { Hono } from "hono";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const userRouter = new Hono()
  .post("/login", UserController.login)
  .post("/register", UserController.postUser)
  .get("/user", UserController.getUserById)
  .get("/user/:email", UserController.getUserByEmail)
  .post("/logout", authMiddleware, UserController.logout)
  .get("/refresh", UserController.refresh)
  .get("/me", authMiddleware, UserController.me);
