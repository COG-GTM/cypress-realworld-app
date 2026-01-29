import { describe, expect, test } from "vitest";
import { history } from "../historyUtils";

describe("History Utilities", () => {
  describe("history", () => {
    test("should be defined", () => {
      expect(history).toBeDefined();
    });

    test("should have push method", () => {
      expect(typeof history.push).toBe("function");
    });

    test("should have replace method", () => {
      expect(typeof history.replace).toBe("function");
    });

    test("should have go method", () => {
      expect(typeof history.go).toBe("function");
    });

    test("should have goBack method", () => {
      expect(typeof history.goBack).toBe("function");
    });

    test("should have goForward method", () => {
      expect(typeof history.goForward).toBe("function");
    });

    test("should have listen method", () => {
      expect(typeof history.listen).toBe("function");
    });

    test("should have location property", () => {
      expect(history.location).toBeDefined();
      expect(history.location).toHaveProperty("pathname");
    });

    test("should have length property", () => {
      expect(typeof history.length).toBe("number");
    });

    test("should have action property", () => {
      expect(history.action).toBeDefined();
    });
  });
});
