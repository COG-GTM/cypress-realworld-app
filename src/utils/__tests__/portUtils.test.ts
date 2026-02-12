import { describe, expect, it, vi, beforeEach } from "vitest";
import detect from "detect-port";

vi.mock("detect-port");
vi.mock("chalk", () => ({
  default: {
    green: vi.fn((msg: string) => msg),
    red: vi.fn((msg: string) => msg),
  },
}));

describe("portUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports frontendPort from process.env.PORT", async () => {
    const originalPort = process.env.PORT;
    process.env.PORT = "3000";
    vi.resetModules();
    const { frontendPort } = await import("../portUtils");
    expect(frontendPort).toBe("3000");
    process.env.PORT = originalPort;
  });

  it("exports backendPort from process.env.VITE_BACKEND_PORT", async () => {
    const originalPort = process.env.VITE_BACKEND_PORT;
    process.env.VITE_BACKEND_PORT = "3001";
    vi.resetModules();
    const { backendPort } = await import("../portUtils");
    expect(backendPort).toBe("3001");
    process.env.VITE_BACKEND_PORT = originalPort;
  });

  it("getBackendPort returns the configured port when available", async () => {
    const originalPort = process.env.VITE_BACKEND_PORT;
    process.env.VITE_BACKEND_PORT = "3001";
    vi.resetModules();
    vi.mocked(detect).mockResolvedValue(3001);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const { getBackendPort } = await import("../portUtils");
    const port = await getBackendPort();

    expect(port).toBe(3001);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
    process.env.VITE_BACKEND_PORT = originalPort;
  });

  it("getBackendPort returns an alternate port when configured port is in use", async () => {
    const originalPort = process.env.VITE_BACKEND_PORT;
    process.env.VITE_BACKEND_PORT = "3001";
    vi.resetModules();
    vi.mocked(detect).mockResolvedValue(3002);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const { getBackendPort } = await import("../portUtils");
    const port = await getBackendPort();

    expect(port).toBe(3002);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
    process.env.VITE_BACKEND_PORT = originalPort;
  });

  it("getBackendPort handles errors from detect-port", async () => {
    const originalPort = process.env.VITE_BACKEND_PORT;
    process.env.VITE_BACKEND_PORT = "3001";
    vi.resetModules();
    vi.mocked(detect).mockRejectedValue(new Error("detection failed"));

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const { getBackendPort } = await import("../portUtils");
    const result = await getBackendPort();

    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
    process.env.VITE_BACKEND_PORT = originalPort;
  });
});
