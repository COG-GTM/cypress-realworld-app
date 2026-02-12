import { describe, it, expect, vi } from "vitest";

describe("portUtils", () => {
  it("exports frontendPort from env", async () => {
    const { frontendPort } = await import("../portUtils");
    expect(frontendPort).toBe(process.env.PORT);
  });

  it("exports backendPort from env", async () => {
    const { backendPort } = await import("../portUtils");
    expect(backendPort).toBe(process.env.VITE_BACKEND_PORT);
  });

  it("exports getBackendPort as a function", async () => {
    const { getBackendPort } = await import("../portUtils");
    expect(typeof getBackendPort).toBe("function");
  });
});
