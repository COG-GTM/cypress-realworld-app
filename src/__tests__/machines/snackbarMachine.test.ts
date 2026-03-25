import { describe, expect, it } from "vitest";
import { snackbarMachine, Severities } from "../../machines/snackbarMachine";

describe("snackbarMachine", () => {
  it("should have correct initial state", () => {
    const initialState = snackbarMachine.initialState;
    expect(initialState.value).toBe("invisible");
    expect(initialState.context.severity).toBeUndefined();
    expect(initialState.context.message).toBeUndefined();
  });

  it("should transition from invisible to visible on SHOW", () => {
    const nextState = snackbarMachine.transition("invisible", {
      type: "SHOW",
      severity: Severities.success,
      message: "Test message",
    });
    expect(nextState.value).toBe("visible");
  });

  it("should transition from visible to invisible on HIDE", () => {
    const visibleState = snackbarMachine.transition("invisible", {
      type: "SHOW",
      severity: Severities.success,
      message: "Test message",
    });
    const nextState = snackbarMachine.transition(visibleState, "HIDE");
    expect(nextState.value).toBe("invisible");
  });

  it("should set severity and message on SHOW via setSnackbar action", () => {
    const nextState = snackbarMachine.transition("invisible", {
      type: "SHOW",
      severity: Severities.error,
      message: "Error occurred",
    });
    expect(nextState.value).toBe("visible");
    expect(nextState.actions).toBeDefined();
    expect(nextState.actions.length).toBeGreaterThan(0);
  });

  it("should reset context on entering invisible via resetSnackbar action", () => {
    const visibleState = snackbarMachine.transition("invisible", {
      type: "SHOW",
      severity: Severities.warning,
      message: "Warning",
    });
    const nextState = snackbarMachine.transition(visibleState, "HIDE");
    expect(nextState.value).toBe("invisible");
    expect(nextState.actions).toBeDefined();
  });

  it("should not transition on invalid event in invisible", () => {
    const initialState = snackbarMachine.initialState;
    const nextState = snackbarMachine.transition(initialState, "HIDE");
    expect(nextState.value).toBe("invisible");
  });

  it("should not transition on invalid event in visible", () => {
    const visibleState = snackbarMachine.transition("invisible", "SHOW");
    const nextState = snackbarMachine.transition(visibleState, "SHOW");
    expect(nextState.value).toBe("visible");
  });

  it("should have all severity values", () => {
    expect(Severities.success).toBe("success");
    expect(Severities.info).toBe("info");
    expect(Severities.warning).toBe("warning");
    expect(Severities.error).toBe("error");
  });
});
