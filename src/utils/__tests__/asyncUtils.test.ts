import { describe, expect, it, vi, beforeEach } from "vitest";
import axios from "axios";

vi.mock("axios", () => {
  const mockAxiosInstance = {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

describe("asyncUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports an httpClient created with withCredentials", async () => {
    const { httpClient } = await import("../asyncUtils");
    expect(axios.create).toHaveBeenCalledWith({ withCredentials: true });
    expect(httpClient).toBeDefined();
  });

  it("interceptor adds Authorization header when VITE_AUTH0 is set", async () => {
    const originalEnv = { ...process.env };
    process.env.VITE_AUTH0 = "true";
    process.env.VITE_AUTH_TOKEN_NAME = "authToken";

    const mockGetItem = vi.spyOn(Storage.prototype, "getItem").mockReturnValue("test-token");

    vi.resetModules();
    vi.mock("axios", () => {
      let interceptorFn: Function;
      const mockAxiosInstance = {
        interceptors: {
          request: {
            use: vi.fn((fn: Function) => {
              interceptorFn = fn;
            }),
          },
          response: { use: vi.fn() },
        },
      };
      return {
        default: {
          create: vi.fn(() => mockAxiosInstance),
        },
        __getInterceptor: () => interceptorFn,
      };
    });

    const axiosMod = await import("axios");
    await import("../asyncUtils");

    const getInterceptor = (axiosMod as any).__getInterceptor;
    const interceptor = getInterceptor();
    const config = { headers: {} as Record<string, string> };
    const result = interceptor(config);

    expect(result.headers["Authorization"]).toBe("Bearer test-token");

    mockGetItem.mockRestore();
    process.env = originalEnv;
  });

  it("interceptor does not add Authorization header when no auth env vars are set", async () => {
    const originalEnv = { ...process.env };
    delete process.env.VITE_AUTH0;
    delete process.env.VITE_OKTA;
    delete process.env.VITE_AWS_COGNITO;
    delete process.env.VITE_GOOGLE;

    vi.resetModules();
    vi.mock("axios", () => {
      let interceptorFn: Function;
      const mockAxiosInstance = {
        interceptors: {
          request: {
            use: vi.fn((fn: Function) => {
              interceptorFn = fn;
            }),
          },
          response: { use: vi.fn() },
        },
      };
      return {
        default: {
          create: vi.fn(() => mockAxiosInstance),
        },
        __getInterceptor: () => interceptorFn,
      };
    });

    const axiosMod = await import("axios");
    await import("../asyncUtils");

    const getInterceptor = (axiosMod as any).__getInterceptor;
    const interceptor = getInterceptor();
    const config = { headers: {} as Record<string, string> };
    const result = interceptor(config);

    expect(result.headers["Authorization"]).toBeUndefined();

    process.env = originalEnv;
  });
});
