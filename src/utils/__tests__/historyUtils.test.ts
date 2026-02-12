import { describe, it, expect } from "vitest";
import { history } from "../historyUtils";

describe("historyUtils", () => {
  it("exports a browser history instance", () => {
    expect(history).toBeDefined();
    expect(typeof history.push).toBe("function");
    expect(typeof history.replace).toBe("function");
    expect(typeof history.go).toBe("function");
    expect(typeof history.listen).toBe("function");
  });

  it("has a location property", () => {
    expect(history.location).toBeDefined();
    expect(history.location).toHaveProperty("pathname");
  });
});
