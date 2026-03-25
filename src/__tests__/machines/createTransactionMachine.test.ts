import { describe, expect, it } from "vitest";
import { createTransactionMachine } from "../../machines/createTransactionMachine";

describe("createTransactionMachine", () => {
  it("should have correct initial state", () => {
    const initialState = createTransactionMachine.initialState;
    expect(initialState.value).toBe("stepOne");
  });

  it("should transition from stepOne to stepTwo on SET_USERS", () => {
    const nextState = createTransactionMachine.transition("stepOne", {
      type: "SET_USERS",
      sender: { id: "sender1" },
      receiver: { id: "receiver1" },
    });
    expect(nextState.value).toBe("stepTwo");
  });

  it("should transition from stepTwo to stepThree on CREATE", () => {
    const nextState = createTransactionMachine.transition("stepTwo", "CREATE");
    expect(nextState.value).toBe("stepThree");
  });

  it("should transition from stepThree to stepOne on RESET", () => {
    const nextState = createTransactionMachine.transition("stepThree", "RESET");
    expect(nextState.value).toBe("stepOne");
  });

  it("should not transition from stepOne on invalid event", () => {
    const nextState = createTransactionMachine.transition("stepOne", "CREATE");
    expect(nextState.value).toBe("stepOne");
  });

  it("should not transition from stepTwo on invalid event", () => {
    const nextState = createTransactionMachine.transition("stepTwo", "RESET");
    expect(nextState.value).toBe("stepTwo");
  });

  it("should complete full transaction creation flow", () => {
    let state = createTransactionMachine.initialState;
    expect(state.value).toBe("stepOne");

    state = createTransactionMachine.transition(state, {
      type: "SET_USERS",
      sender: { id: "sender1" },
      receiver: { id: "receiver1" },
    });
    expect(state.value).toBe("stepTwo");

    state = createTransactionMachine.transition(state, "CREATE");
    expect(state.value).toBe("stepThree");

    state = createTransactionMachine.transition(state, "RESET");
    expect(state.value).toBe("stepOne");
  });

  it("should have the machine id set to createTransaction", () => {
    expect(createTransactionMachine.id).toBe("createTransaction");
  });

  it("should transition back from stepThree to stepOne via RESET after full flow", () => {
    let state = createTransactionMachine.transition("stepOne", {
      type: "SET_USERS",
      sender: { id: "s1" },
      receiver: { id: "r1" },
    });
    state = createTransactionMachine.transition(state, "CREATE");
    state = createTransactionMachine.transition(state, "RESET");
    expect(state.value).toBe("stepOne");
  });
});
