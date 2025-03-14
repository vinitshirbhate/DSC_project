import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Context } from "hono";
import { rateLimiter } from "../../src/middlewares/rate.limitter";
import { RedisSingleton } from "../../src/db/redis.cache";
import { RateLimitCache } from "../../src/db/ratelimit.memory";

vi.mock("../../src/db/redis.cache", () => ({
  RedisSingleton: {
    getInstance: vi.fn(),
  },
}));

vi.mock("../../src/db/ratelimit.memory", () => ({
  RateLimitCache: {
    getIp: vi.fn(),
    incrementIp: vi.fn(),
  },
}));

describe("rateLimiter middleware", () => {
  const mockRedisClient = {
    get: vi.fn(),
    set: vi.fn(),
    expire: vi.fn(),
  };

  const mockNext = vi.fn();

  let mockContext: Partial<Context>;

  beforeEach(() => {
    mockContext = {
      req: {
        header: vi.fn((header: string): string | null => {
          if (header === "cf-connecting-ip" || header === "CF-Connecting-IP") {
            return "192.168.1.1";
          }
          return null;
        }),
        routePath: "/test/path",
      },
      json: vi.fn().mockReturnThis(),
    } as unknown as Partial<Context>;

    vi.mocked(RedisSingleton.getInstance).mockReturnValue(
      mockRedisClient as any
    );
    vi.mocked(RateLimitCache.getIp).mockReset();
    vi.mocked(RateLimitCache.incrementIp).mockReset();
    vi.mocked(mockRedisClient.get).mockReset();
    vi.mocked(mockRedisClient.set).mockReset();
    vi.mocked(mockRedisClient.expire).mockReset();
    vi.mocked(mockNext).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should allow requests below the limit and call next()", async () => {
    const cacheKey = "ip:192.168.1.1:/test/path";
    vi.mocked(RateLimitCache.getIp).mockReturnValue(5);
    vi.mocked(mockRedisClient.get).mockResolvedValue(5);

    await rateLimiter(mockContext as Context, mockNext);

    expect(RedisSingleton.getInstance).toHaveBeenCalledWith(mockContext);
    expect(mockContext.req?.header).toHaveBeenCalledWith("cf-connecting-ip");
    expect(RateLimitCache.getIp).toHaveBeenCalledWith(cacheKey);
    expect(RateLimitCache.incrementIp).toHaveBeenCalledWith(cacheKey, 60);
    expect(mockRedisClient.get).toHaveBeenCalledWith(cacheKey);
    expect(mockRedisClient.set).toHaveBeenCalledWith(cacheKey, 6);
    expect(mockRedisClient.expire).toHaveBeenCalledWith(cacheKey, 60);
    expect(mockNext).toHaveBeenCalled();
    expect(mockContext.json).not.toHaveBeenCalled();
  });

  it("should block requests exceeding memory cache limit", async () => {
    vi.mocked(RateLimitCache.getIp).mockReturnValue(10);

    await rateLimiter(mockContext as Context, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockContext.json).toHaveBeenCalledWith(
      { message: "RATE-LIMIT", success: false },
      429
    );
  });

  it("should block requests exceeding Redis cache limit", async () => {
    vi.mocked(RateLimitCache.getIp).mockReturnValue(5);
    vi.mocked(mockRedisClient.get).mockResolvedValue(10);

    await rateLimiter(mockContext as Context, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockContext.json).toHaveBeenCalledWith(
      { message: "RATE-LIMIT", success: false },
      429
    );
  });

  it("should handle null Redis response and initialize counter", async () => {
    vi.mocked(RateLimitCache.getIp).mockReturnValue(5);
    vi.mocked(mockRedisClient.get).mockResolvedValue(null);

    await rateLimiter(mockContext as Context, mockNext);

    expect(mockRedisClient.set).toHaveBeenCalledWith(
      "ip:192.168.1.1:/test/path",
      1
    );
    expect(mockNext).toHaveBeenCalled();
  });

  it("should handle null memory cache response and proceed", async () => {
    vi.mocked(RateLimitCache.getIp).mockReturnValue(0);
    vi.mocked(mockRedisClient.get).mockResolvedValue(5);

    await rateLimiter(mockContext as Context, mockNext);

    expect(RateLimitCache.incrementIp).toHaveBeenCalledWith(
      "ip:192.168.1.1:/test/path",
      60
    );
    expect(mockNext).toHaveBeenCalled();
  });

  it("should use fallback IP when headers are not present", async () => {
    (mockContext.req!.header as any) = vi.fn().mockReturnValue(null);
    vi.mocked(RateLimitCache.getIp).mockReturnValue(5);
    vi.mocked(mockRedisClient.get).mockResolvedValue(5);

    await rateLimiter(mockContext as Context, mockNext);

    expect(RateLimitCache.getIp).toHaveBeenCalledWith(
      "ip:127.0.0.1:/test/path"
    );
    expect(mockNext).toHaveBeenCalled();
  });

  it("should handle generic errors in the middleware", async () => {
    vi.mocked(mockRedisClient.get).mockRejectedValue(
      new Error("Redis connection error")
    );

    await rateLimiter(mockContext as Context, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockContext.json).toHaveBeenCalledWith(
      { message: "Redis connection error", success: false },
      429
    );
  });

  it("should handle non-Error objects in the catch block", async () => {
    vi.mocked(mockRedisClient.get).mockRejectedValue("String error");

    await rateLimiter(mockContext as Context, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockContext.json).toHaveBeenCalledWith(
      { message: "String error", success: false },
      429
    );
  });
});
