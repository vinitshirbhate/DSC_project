import { describe, it, expect, vi } from "vitest";
import { userRouter } from "../../src/routes/user.routes";
import { UserController } from "../../src/controllers/user.controller";
import { authMiddleware } from "../../src/middlewares/auth.middleware";

vi.mock("../../src/middlewares/auth.middleware", () => ({
  authMiddleware: vi.fn((c, next) => {
    // Attach a mock user object to the context
    c.set("user", { id: "test-id", email: "test@example.com" });
    return next();
  }),
}));

vi.mock("../../src/controllers/user.controller", () => ({
  UserController: {
    postUser: vi.fn((c) => c.json({ success: true }, 201)),
    getUserById: vi.fn((c) => c.json({ id: "test-id" })),
    getUserByEmail: vi.fn((c) => c.json({ email: "test@example.com" })),
    deleteUser: vi.fn((c) => c.json({ id: "deleted-id" }, 200)),
    me: vi.fn((c) => {
      const user = c.get("user");
      return c.json({ user });
    }),
  },
}));

describe("User Routes", () => {
  it("should handle user registration", async () => {
    const res = await userRouter.request("/register", { method: "POST" });
    expect(res.status).toBe(201);
    expect(UserController.postUser).toHaveBeenCalled();
  });

  it("should get user by ID", async () => {
    const res = await userRouter.request("/user");
    expect(res.status).toBe(200);
    expect(UserController.getUserById).toHaveBeenCalled();
  });

  it("should get user by email", async () => {
    const email = "test@example.com";
    const res = await userRouter.request(`/user/${email}`);
    expect(res.status).toBe(200);
    expect(UserController.getUserByEmail).toHaveBeenCalled();
  });

  it("should handle logout", async () => {});
  it("should handle delete user", async () => {
    const res = await userRouter.request("/deleteUser", { method: "DELETE" });
    expect(res.status).toBe(200);
    expect(UserController.deleteUser).toHaveBeenCalled();
    const data = await res.json();
    expect(data).toEqual({ id: "deleted-id" });
  });
  it("should get current user from /me endpoint", async () => {
    const res = await userRouter.request("/me");
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toEqual({
      user: {
        id: "test-id",
        email: "test@example.com",
      },
    });
    expect(UserController.me).toHaveBeenCalled();
    expect(authMiddleware).toHaveBeenCalled();
  });
});
