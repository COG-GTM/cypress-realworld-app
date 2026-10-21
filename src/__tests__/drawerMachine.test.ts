import { describe, expect, it } from "vitest";
import { interpret } from "xstate";
import { drawerMachine } from "../machines/drawerMachine";

const startDrawer = (context = { aboveSmallBreakpoint: true }) =>
  interpret(drawerMachine.withContext(context as any)).start();

describe("drawerMachine", () => {
  it("starts with the desktop drawer open and the mobile drawer closed", () => {
    const service = startDrawer();

    expect(service.state.value).toEqual({ desktop: "open", mobile: "closed" });
    service.stop();
  });

  it("toggles the desktop drawer", () => {
    const service = startDrawer();

    service.send("TOGGLE_DESKTOP");
    expect(service.state.matches({ desktop: "closed" })).toBe(true);

    service.send("TOGGLE_DESKTOP");
    expect(service.state.matches({ desktop: "open" })).toBe(true);
    service.stop();
  });

  it("closes the desktop drawer", () => {
    const service = startDrawer();

    service.send("CLOSE_DESKTOP");

    expect(service.state.matches({ desktop: "closed" })).toBe(true);
    expect(service.state.matches({ mobile: "closed" })).toBe(true);
    service.stop();
  });

  it("toggles, opens and closes the mobile drawer independently of the desktop drawer", () => {
    const service = startDrawer();

    service.send("TOGGLE_MOBILE");
    expect(service.state.value).toEqual({ desktop: "open", mobile: "open" });

    service.send("TOGGLE_MOBILE");
    expect(service.state.value).toEqual({ desktop: "open", mobile: "closed" });

    service.send("OPEN_MOBILE");
    expect(service.state.matches({ mobile: "open" })).toBe(true);

    service.send("CLOSE_MOBILE");
    expect(service.state.matches({ mobile: "closed" })).toBe(true);
    service.stop();
  });

  it("ignores OPEN_MOBILE when the mobile drawer is already open", () => {
    const service = startDrawer();

    service.send("OPEN_MOBILE");
    const { changed } = service.send("OPEN_MOBILE");

    expect(changed).toBe(false);
    expect(service.state.matches({ mobile: "open" })).toBe(true);
    service.stop();
  });

  it("does not re-open the desktop drawer when the breakpoint has not changed", () => {
    const service = startDrawer({ aboveSmallBreakpoint: true });

    service.send("CLOSE_DESKTOP");
    service.send("OPEN_DESKTOP");

    expect(service.state.matches({ desktop: "closed" })).toBe(true);
    service.stop();
  });

  it("shouldOpenDesktop only allows opening when the breakpoint changed", () => {
    const shouldOpenDesktop = drawerMachine.options.guards!.shouldOpenDesktop as any;
    const previous = { history: { context: { aboveSmallBreakpoint: true } } };

    expect(
      shouldOpenDesktop(
        { aboveSmallBreakpoint: false },
        { type: "OPEN_DESKTOP" },
        { state: previous }
      )
    ).toBe(true);
    expect(
      shouldOpenDesktop(
        { aboveSmallBreakpoint: true },
        { type: "OPEN_DESKTOP" },
        { state: previous }
      )
    ).toBe(false);
  });
});
