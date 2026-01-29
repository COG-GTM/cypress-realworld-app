import { describe, expect, test, vi, beforeEach } from "vitest";

describe("Async Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe("httpClient", () => {
    test("should export httpClient", async () => {
      const { httpClient } = await import("../asyncUtils");
      expect(httpClient).toBeDefined();
    });

    test("httpClient should have interceptors", async () => {
      const { httpClient } = await import("../asyncUtils");
      expect(httpClient.interceptors).toBeDefined();
      expect(httpClient.interceptors.request).toBeDefined();
    });

    test("httpClient should have request methods", async () => {
      const { httpClient } = await import("../asyncUtils");
      expect(typeof httpClient.get).toBe("function");
      expect(typeof httpClient.post).toBe("function");
      expect(typeof httpClient.put).toBe("function");
      expect(typeof httpClient.delete).toBe("function");
    });
  });
});
