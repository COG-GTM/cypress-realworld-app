import { describe, expect, it } from "vitest";
import { drawerMachine } from "../../machines/drawerMachine";

describe("drawerMachine", () => {
  it("should have correct initial state", () => {
    const initialState = drawerMachine.initialState;
    expect(initialState.value).toEqual({
      desktop: "open",
      mobile: "closed",
    });
  });

  describe("desktop states", () => {
    it("should toggle desktop from open to closed", () => {
      const initialState = drawerMachine.initialState;
      const nextState = drawerMachine.transition(initialState, "TOGGLE_DESKTOP");
      expect(nextState.value).toEqual({
        desktop: "closed",
        mobile: "closed",
      });
    });

    it("should toggle desktop from closed to open", () => {
      const closedState = drawerMachine.transition(drawerMachine.initialState, "TOGGLE_DESKTOP");
      const nextState = drawerMachine.transition(closedState, "TOGGLE_DESKTOP");
      expect(nextState.value).toEqual({
        desktop: "open",
        mobile: "closed",
      });
    });

    it("should close desktop with CLOSE_DESKTOP", () => {
      const initialState = drawerMachine.initialState;
      const nextState = drawerMachine.transition(initialState, "CLOSE_DESKTOP");
      expect(nextState.value).toEqual({
        desktop: "closed",
        mobile: "closed",
      });
    });
  });

  describe("mobile states", () => {
    it("should toggle mobile from closed to open", () => {
      const initialState = drawerMachine.initialState;
      const nextState = drawerMachine.transition(initialState, "TOGGLE_MOBILE");
      expect(nextState.value).toEqual({
        desktop: "open",
        mobile: "open",
      });
    });

    it("should toggle mobile from open to closed", () => {
      const openState = drawerMachine.transition(drawerMachine.initialState, "TOGGLE_MOBILE");
      const nextState = drawerMachine.transition(openState, "TOGGLE_MOBILE");
      expect(nextState.value).toEqual({
        desktop: "open",
        mobile: "closed",
      });
    });

    it("should open mobile with OPEN_MOBILE", () => {
      const initialState = drawerMachine.initialState;
      const nextState = drawerMachine.transition(initialState, "OPEN_MOBILE");
      expect(nextState.value).toEqual({
        desktop: "open",
        mobile: "open",
      });
    });

    it("should close mobile with CLOSE_MOBILE", () => {
      const openState = drawerMachine.transition(drawerMachine.initialState, "OPEN_MOBILE");
      const nextState = drawerMachine.transition(openState, "CLOSE_MOBILE");
      expect(nextState.value).toEqual({
        desktop: "open",
        mobile: "closed",
      });
    });
  });
});
