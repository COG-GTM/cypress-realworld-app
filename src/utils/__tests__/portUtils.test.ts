import { describe, expect, test, vi } from "vitest";
import { frontendPort, backendPort, getBackendPort } from "../portUtils";

vi.mock("detect-port", () => ({
  default: vi.fn(),
}));

describe("portUtils", () => {
  test("frontendPort reads from process.env.PORT", () => {
    expect(frontendPort).toBe(process.env.PORT);
  });

  test("backendPort reads from process.env.VITE_BACKEND_PORT", () => {
    expect(backendPort).toBe(process.env.VITE_BACKEND_PORT);
  });

  test("getBackendPort is a function", () => {
    expect(typeof getBackendPort).toBe("function");
  });
});
