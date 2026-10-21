import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { interpret } from "xstate";
import { snackbarMachine, Severities } from "../machines/snackbarMachine";

describe("snackbarMachine", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts invisible with an empty context", () => {
    const service = interpret(snackbarMachine).start();

    expect(service.state.value).toBe("invisible");
    expect(service.state.context).toEqual({ severity: undefined, message: undefined });
    service.stop();
  });

  it("shows a message with a severity", () => {
    const service = interpret(snackbarMachine).start();

    // @ts-ignore - SHOW carries a payload
    service.send({ type: "SHOW", severity: Severities.success, message: "Transaction Submitted!" });

    expect(service.state.value).toBe("visible");
    expect(service.state.context).toEqual({
      severity: Severities.success,
      message: "Transaction Submitted!",
    });
    service.stop();
  });

  it("hides and resets the message on HIDE", () => {
    const service = interpret(snackbarMachine).start();

    // @ts-ignore - SHOW carries a payload
    service.send({ type: "SHOW", severity: Severities.error, message: "Something went wrong" });
    service.send("HIDE");

    expect(service.state.value).toBe("invisible");
    expect(service.state.context).toEqual({ severity: undefined, message: undefined });
    service.stop();
  });

  it("automatically hides after 3 seconds", () => {
    const service = interpret(snackbarMachine).start();

    // @ts-ignore - SHOW carries a payload
    service.send({ type: "SHOW", severity: Severities.info, message: "Heads up" });

    vi.advanceTimersByTime(2999);
    expect(service.state.value).toBe("visible");

    vi.advanceTimersByTime(1);
    expect(service.state.value).toBe("invisible");
    expect(service.state.context.message).toBeUndefined();
    service.stop();
  });

  it("ignores HIDE while invisible", () => {
    const service = interpret(snackbarMachine).start();

    const { changed } = service.send("HIDE");

    expect(changed).toBe(false);
    expect(service.state.value).toBe("invisible");
    service.stop();
  });
});
