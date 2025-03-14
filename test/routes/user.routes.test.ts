import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserController } from "../../src/controllers/user.controller";
import { userRouter } from "../../src/routes/user.routes";

vi.mock("../../src/middlewares/auth.middleware", () => ({
  authMiddleware: vi.fn((c, next) => {
    c.set("user", { id: "test-id", email: "test@example.com" });
    return next();
  }),
}));

vi.mock("../../src/controllers/user.controller", () => ({
  UserController: {
    postUser: vi.fn((c) => c.json({ success: true }, 201)),
    getUserById: vi.fn((c) => c.json({ id: "test-id" })),
    getUserByEmail: vi.fn((c) => c.json({ email: "test@example.com" })),
    login: vi.fn((c) =>
      c.json({
        success: true,
        token: "test-token",
        refreshToken: "test-refresh-token",
        user: { id: "test-id", email: "test@example.com" },
      })
    ),
    logout: vi.fn((c) =>
      c.json(
        {
          message: "Logout successful!",
          success: true,
        },
        200
      )
    ),
    refresh: vi.fn((c) =>
      c.json(
        {
          message: "Token refreshed successfully!",
          token: "new-access-token",
          user: {
            id: "test-id",
            name: "Test User",
            email: "test@example.com",
            refreshToken: "new-refresh-token",
          },
          success: true,
        },
        200
      )
    ),
    me: vi.fn((c) =>
      c.json({
        message: "Authorized",
        success: true,
        payload: {
          id: "r7flvzwcjiclfjgzdi0pzziq",
          email: "john@example.com",
          exp: 1741529684,
        },
      })
    ),
  },
}));

vi.mock("../../src/middlewares/auth.middleware.ts", async () => {
  return {
    authMiddleware: vi.fn(async (c, next) => {
      c.set("jwtPayload", {
        id: "r7flvzwcjiclfjgzdi0pzziq",
        email: "john@example.com",
        exp: 1741529684,
      });
      await next();
    }),
  };
});

vi.mock("../../src/middlewares/rate.limitter.ts", async () => {
  return {
    rateLimiter: vi.fn(async (c, next) => await next()),
  };
});

describe("User Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it("should handle user login", async () => {
    const res = await userRouter.request("/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });
    expect(res.status).toBe(200);
    expect(UserController.login).toHaveBeenCalled();
    const data = await res.json();
    expect(data).toStrictEqual({
      success: true,
      token: "test-token",
      refreshToken: "test-refresh-token",
      user: { id: "test-id", email: "test@example.com" },
    });
  });

  it("should handle logout with authentication", async () => {
    const res = await userRouter.request("/logout", {
      method: "POST",
      headers: {
        Authorization: "Bearer test-token",
      },
    });
    expect(res.status).toBe(200);
    expect(UserController.logout).toHaveBeenCalled();
    const data = await res.json();
    expect(data).toStrictEqual({
      message: "Logout successful!",
      success: true,
    });
  });

  it("should handle token refresh with valid refresh token", async () => {
    const res = await userRouter.request("/refresh?token=test-refresh-token");
    expect(res.status).toBe(200);
    expect(UserController.refresh).toHaveBeenCalled();
    const data = await res.json();
    expect(data).toStrictEqual({
      message: "Token refreshed successfully!",
      token: "new-access-token",
      user: {
        id: "test-id",
        name: "Test User",
        email: "test@example.com",
        refreshToken: "new-refresh-token",
      },
      success: true,
    });
  });

  it("should get current user with authentication", async () => {
    const res = await userRouter.request("/me", {
      headers: {
        Authorization: "Bearer test-token",
      },
    });
    expect(res.status).toBe(200);
    expect(UserController.me).toHaveBeenCalled();
    const data = await res.json();
    expect(data).toStrictEqual({
      message: "Authorized",
      success: true,
      payload: {
        id: "r7flvzwcjiclfjgzdi0pzziq",
        email: "john@example.com",
        exp: 1741529684,
      },
    });
  });
});
