import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";

vi.mock("detect-port", () => ({
  default: vi.fn(),
}));

vi.mock("chalk", () => ({
  default: {
    green: vi.fn((msg) => msg),
    red: vi.fn((msg) => msg),
  },
}));

describe("Port Utilities", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.PORT = "3000";
    process.env.VITE_BACKEND_PORT = "3001";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("getBackendPort", () => {
    test("should return the configured backend port when available", async () => {
      const detect = (await import("detect-port")).default as ReturnType<typeof vi.fn>;
      detect.mockResolvedValue(3001);

      const { getBackendPort } = await import("../portUtils");
      const result = await getBackendPort();
      expect(result).toBe(3001);
    });

    test("should return alternative port when configured port is in use", async () => {
      const detect = (await import("detect-port")).default as ReturnType<typeof vi.fn>;
      const alternativePort = 3002;
      detect.mockResolvedValue(alternativePort);

      const { getBackendPort } = await import("../portUtils");
      const result = await getBackendPort();
      expect(result).toBe(alternativePort);
    });

    test("should handle errors gracefully", async () => {
      const detect = (await import("detect-port")).default as ReturnType<typeof vi.fn>;
      detect.mockRejectedValue(new Error("Port detection failed"));

      const { getBackendPort } = await import("../portUtils");
      const result = await getBackendPort();
      expect(result).toBeUndefined();
    });
  });
});
