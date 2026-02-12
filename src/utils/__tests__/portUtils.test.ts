import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("detect-port");
vi.mock("chalk", () => ({
  default: {
    green: vi.fn((msg: string) => msg),
    red: vi.fn((msg: string) => msg),
  },
}));

describe("portUtils", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("exports frontendPort from process.env.PORT", async () => {
    process.env.PORT = "3000";
    const { frontendPort } = await import("../portUtils");
    expect(frontendPort).toBe("3000");
  });

  it("exports backendPort from process.env.VITE_BACKEND_PORT", async () => {
    process.env.VITE_BACKEND_PORT = "3001";
    const { backendPort } = await import("../portUtils");
    expect(backendPort).toBe("3001");
  });

  describe("getBackendPort", () => {
    it("returns the configured port when it is available", async () => {
      process.env.VITE_BACKEND_PORT = "3001";

      const detect = (await import("detect-port")).default;
      vi.mocked(detect).mockResolvedValue(3001 as never);

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const { getBackendPort } = await import("../portUtils");
      const port = await getBackendPort();

      expect(port).toBe(3001);
      expect(detect).toHaveBeenCalledWith(3001);
      consoleSpy.mockRestore();
    });

    it("returns a different port when configured port is in use", async () => {
      process.env.VITE_BACKEND_PORT = "3001";

      const detect = (await import("detect-port")).default;
      vi.mocked(detect).mockResolvedValue(3002 as never);

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const { getBackendPort } = await import("../portUtils");
      const port = await getBackendPort();

      expect(port).toBe(3002);
      expect(detect).toHaveBeenCalledWith(3001);
      consoleSpy.mockRestore();
    });

    it("handles errors from detect-port", async () => {
      process.env.VITE_BACKEND_PORT = "3001";

      const detect = (await import("detect-port")).default;
      vi.mocked(detect).mockRejectedValue(new Error("detection failed") as never);

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const { getBackendPort } = await import("../portUtils");
      const result = await getBackendPort();

      expect(result).toBeUndefined();
      consoleSpy.mockRestore();
    });
  });
});
