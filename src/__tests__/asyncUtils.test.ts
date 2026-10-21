import { afterEach, describe, expect, it } from "vitest";
import { httpClient } from "../utils/asyncUtils";

describe("asyncUtils httpClient", () => {
  const originalAdapter = httpClient.defaults.adapter;

  afterEach(() => {
    httpClient.defaults.adapter = originalAdapter;
  });

  it("sends credentials with every request", () => {
    expect(httpClient.defaults.withCredentials).toBe(true);
  });

  it("registers a request interceptor", () => {
    // @ts-ignore - handlers is not part of the public type definitions
    expect(httpClient.interceptors.request.handlers).toHaveLength(1);
  });

  it("does not add an Authorization header when no auth provider is configured", async () => {
    let sentConfig: any;
    httpClient.defaults.adapter = async (config) => {
      sentConfig = config;
      return { data: { ok: true }, status: 200, statusText: "OK", headers: {}, config };
    };

    const response = await httpClient.get("http://localhost:3001/checkAuth");

    expect(response.data).toEqual({ ok: true });
    expect(sentConfig.withCredentials).toBe(true);
    expect(sentConfig.headers.Authorization).toBeUndefined();
  });

  it("rejects with the response when the server returns an error status", async () => {
    httpClient.defaults.adapter = async (config) =>
      Promise.reject(
        Object.assign(new Error("Request failed with status code 401"), {
          config,
          response: { status: 401, data: { error: "Unauthorized" } },
        })
      );

    await expect(httpClient.get("http://localhost:3001/checkAuth")).rejects.toMatchObject({
      response: { status: 401, data: { error: "Unauthorized" } },
    });
  });
});
