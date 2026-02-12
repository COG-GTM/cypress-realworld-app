import { describe, expect, test } from "vitest";
import { httpClient } from "../asyncUtils";

describe("asyncUtils", () => {
  test("httpClient is an axios instance with withCredentials", () => {
    expect(httpClient).toBeDefined();
    expect(httpClient.defaults.withCredentials).toBe(true);
  });

  test("httpClient has request interceptors", () => {
    expect(httpClient.interceptors.request).toBeDefined();
  });
});
