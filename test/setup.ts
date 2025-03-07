import { beforeEach, vi } from "vitest";

// Mock global Cloudflare Worker environment
globalThis.Request = Request;
globalThis.Response = Response;
globalThis.Headers = Headers;

// Reset mocks before each test
beforeEach(() => {
  vi.resetAllMocks();
});
