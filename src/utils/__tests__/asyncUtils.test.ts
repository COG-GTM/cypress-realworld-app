import { describe, expect, it, vi, beforeEach } from "vitest";
import axios from "axios";

vi.mock("axios", () => {
  const interceptors = {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  };
  const instance = {
    interceptors,
    defaults: { withCredentials: true },
  };
  return {
    default: {
      create: vi.fn(() => instance),
    },
  };
});

describe("asyncUtils", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("creates an httpClient with withCredentials set to true", async () => {
    const { httpClient } = await import("../asyncUtils");
    expect(axios.create).toHaveBeenCalledWith({ withCredentials: true });
    expect(httpClient).toBeDefined();
  });

  it("registers a request interceptor", async () => {
    const { httpClient } = await import("../asyncUtils");
    expect(httpClient.interceptors.request.use).toHaveBeenCalledTimes(1);
  });

  it("interceptor returns config without auth header when no auth env vars are set", async () => {
    delete process.env.VITE_AUTH0;
    delete process.env.VITE_OKTA;
    delete process.env.VITE_AWS_COGNITO;
    delete process.env.VITE_GOOGLE;

    vi.mock("axios", () => {
      let capturedInterceptor: Function;
      const interceptors = {
        request: {
          use: vi.fn((fn: Function) => {
            capturedInterceptor = fn;
          }),
        },
        response: { use: vi.fn() },
      };
      const instance = {
        interceptors,
        defaults: { withCredentials: true },
        __getCapturedInterceptor: () => capturedInterceptor,
      };
      return {
        default: {
          create: vi.fn(() => instance),
        },
      };
    });

    const { httpClient } = await import("../asyncUtils");
    const interceptorFn = (httpClient as any).__getCapturedInterceptor();
    const config = { headers: {} };
    const result = interceptorFn(config);
    expect(result).toEqual(config);
    expect(result.headers).not.toHaveProperty("Authorization");
  });

  it("interceptor adds Authorization header when VITE_AUTH0 is set", async () => {
    process.env.VITE_AUTH0 = "true";
    process.env.VITE_AUTH_TOKEN_NAME = "authToken";

    const mockGetItem = vi.spyOn(Storage.prototype, "getItem").mockReturnValue("test-token");

    vi.mock("axios", () => {
      let capturedInterceptor: Function;
      const interceptors = {
        request: {
          use: vi.fn((fn: Function) => {
            capturedInterceptor = fn;
          }),
        },
        response: { use: vi.fn() },
      };
      const instance = {
        interceptors,
        defaults: { withCredentials: true },
        __getCapturedInterceptor: () => capturedInterceptor,
      };
      return {
        default: {
          create: vi.fn(() => instance),
        },
      };
    });

    const { httpClient } = await import("../asyncUtils");
    const interceptorFn = (httpClient as any).__getCapturedInterceptor();
    const config = { headers: {} as Record<string, string> };
    const result = interceptorFn(config);
    expect(result.headers["Authorization"]).toBe("Bearer test-token");
    expect(mockGetItem).toHaveBeenCalledWith("authToken");

    delete process.env.VITE_AUTH0;
    delete process.env.VITE_AUTH_TOKEN_NAME;
    mockGetItem.mockRestore();
  });
});
