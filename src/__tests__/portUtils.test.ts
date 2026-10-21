import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const detectMock = vi.fn();
vi.mock("detect-port", () => ({ default: (...args: any[]) => detectMock(...args) }));

describe("portUtils", () => {
  const originalBackendPort = process.env.VITE_BACKEND_PORT;
  const originalPort = process.env.PORT;

  beforeEach(() => {
    vi.resetModules();
    detectMock.mockReset();
    process.env.VITE_BACKEND_PORT = "3001";
    process.env.PORT = "3000";
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.VITE_BACKEND_PORT = originalBackendPort;
    process.env.PORT = originalPort;
    vi.restoreAllMocks();
  });

  const loadPortUtils = () => import("../utils/portUtils");

  it("reads the frontend and backend ports from the environment", async () => {
    const { frontendPort, backendPort } = await loadPortUtils();

    expect(frontendPort).toBe("3000");
    expect(backendPort).toBe("3001");
  });

  it("returns the configured backend port when it is available", async () => {
    detectMock.mockResolvedValue(3001);
    const { getBackendPort } = await loadPortUtils();

    const port = await getBackendPort();

    expect(detectMock).toHaveBeenCalledWith(3001);
    expect(port).toBe(3001);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Backend server running at http://localhost:3001")
    );
  });

  it("falls back to the next free port when the configured port is taken", async () => {
    detectMock.mockResolvedValue(3005);
    const { getBackendPort } = await loadPortUtils();

    const port = await getBackendPort();

    expect(port).toBe(3005);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Failed to start the backend server on port 3001")
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Starting the backend server on port 3005")
    );
  });

  it("logs and resolves undefined when port detection fails", async () => {
    detectMock.mockRejectedValue(new Error("EACCES"));
    const { getBackendPort } = await loadPortUtils();

    const port = await getBackendPort();

    expect(port).toBeUndefined();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("EACCES"));
  });
});
