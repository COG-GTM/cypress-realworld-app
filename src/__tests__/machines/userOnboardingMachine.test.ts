import { describe, expect, it } from "vitest";
import { userOnboardingMachine } from "../../machines/userOnboardingMachine";

describe("userOnboardingMachine", () => {
  it("should have correct initial state", () => {
    const initialState = userOnboardingMachine.initialState;
    expect(initialState.value).toBe("stepOne");
  });

  it("should transition from stepOne to stepTwo on NEXT", () => {
    const nextState = userOnboardingMachine.transition("stepOne", "NEXT");
    expect(nextState.value).toBe("stepTwo");
  });

  it("should transition from stepTwo to stepThree on NEXT", () => {
    const nextState = userOnboardingMachine.transition("stepTwo", "NEXT");
    expect(nextState.value).toBe("stepThree");
  });

  it("should transition from stepTwo to stepOne on PREV", () => {
    const nextState = userOnboardingMachine.transition("stepTwo", "PREV");
    expect(nextState.value).toBe("stepOne");
  });

  it("should transition from stepThree to stepTwo on PREV", () => {
    const nextState = userOnboardingMachine.transition("stepThree", "PREV");
    expect(nextState.value).toBe("stepTwo");
  });

  it("should transition from stepThree to done on NEXT", () => {
    const nextState = userOnboardingMachine.transition("stepThree", "NEXT");
    expect(nextState.value).toBe("done");
  });

  it("done should be a final state", () => {
    const nextState = userOnboardingMachine.transition("stepThree", "NEXT");
    expect(nextState.done).toBe(true);
  });

  it("should transition from idle to stepOne on NEXT", () => {
    const nextState = userOnboardingMachine.transition("idle", "NEXT");
    expect(nextState.value).toBe("stepOne");
  });

  it("should not go back from stepOne on PREV", () => {
    const nextState = userOnboardingMachine.transition("stepOne", "PREV");
    expect(nextState.value).toBe("stepOne");
  });

  it("should complete full onboarding flow", () => {
    let state = userOnboardingMachine.initialState;
    expect(state.value).toBe("stepOne");

    state = userOnboardingMachine.transition(state, "NEXT");
    expect(state.value).toBe("stepTwo");

    state = userOnboardingMachine.transition(state, "NEXT");
    expect(state.value).toBe("stepThree");

    state = userOnboardingMachine.transition(state, "NEXT");
    expect(state.value).toBe("done");
    expect(state.done).toBe(true);
  });
});
