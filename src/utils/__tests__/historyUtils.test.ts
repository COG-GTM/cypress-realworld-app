import { describe, expect, test } from "vitest";
import { history } from "../historyUtils";

describe("historyUtils", () => {
  test("exports a history object", () => {
    expect(history).toBeDefined();
  });

  test("history has push method", () => {
    expect(typeof history.push).toBe("function");
  });

  test("history has replace method", () => {
    expect(typeof history.replace).toBe("function");
  });

  test("history has location property", () => {
    expect(history.location).toBeDefined();
    expect(history.location).toHaveProperty("pathname");
  });
});
