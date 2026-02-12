import { describe, expect, it, vi } from "vitest";

vi.mock("history", () => ({
  createBrowserHistory: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    listen: vi.fn(),
    location: { pathname: "/", search: "", hash: "", state: undefined },
  })),
}));

describe("historyUtils", () => {
  it("exports a history object", async () => {
    const { history } = await import("../historyUtils");
    expect(history).toBeDefined();
  });

  it("history object is created via createBrowserHistory", async () => {
    const { createBrowserHistory } = await import("history");
    await import("../historyUtils");
    expect(createBrowserHistory).toHaveBeenCalled();
  });

  it("history object has expected navigation methods", async () => {
    const { history } = await import("../historyUtils");
    expect(history.push).toBeDefined();
    expect(history.replace).toBeDefined();
    expect(history.go).toBeDefined();
    expect(history.listen).toBeDefined();
  });
});
