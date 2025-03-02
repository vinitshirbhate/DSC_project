import { Hono } from "hono";

export const userRouter = new Hono()
  .get("/login", async (c) => {
    return c.text("Hello login!");
  })
  .get("/register", async (c) => {
    return c.text("Hello register!");
  })
  .post("/logout", async (c) => {
    return c.text("Hello logout!");
  })
  .get("/me", async (c) => {
    return c.text("Hello me!");
  });
