import { describe, it, expect, vi } from "vitest";
import { userRouter } from "../../src/routes/user.routes";
import { UserController } from "../../src/controllers/user.controller";

vi.mock("../../src/controllers/user.controller", () => ({
  UserController: {
    postUser: vi.fn((c) => c.json({ success: true }, 201)),
    getUserById: vi.fn((c) => c.json({ id: "test-id" })),
    getUserByEmail: vi.fn((c) => c.json({ email: "test@example.com" })),
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

  it("should get current user", async () => {
    const res = await userRouter.request("/me");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Hello me!");
  });
});
