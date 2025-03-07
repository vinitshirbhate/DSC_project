import { Hono } from "hono";
import { UserController } from "../controllers/user.controller";

export const userRouter = new Hono()
  .get("/login", async (c) => {
    return c.text("Hello login!");
  })
  .post("/register", UserController.postUser)
  .get("/user",UserController.getUserById)
  .get("/user/:email",UserController.getUserByEmail)
  .post("/logout", async (c) => {
    return c.text("Hello logout!");
  })
  .get("/me", async (c) => {
    return c.text("Hello me!");
  });
