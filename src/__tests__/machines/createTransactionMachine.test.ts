import { describe, it, expect } from "vitest";
import { createTransactionMachine } from "../../machines/createTransactionMachine";

describe("createTransactionMachine", () => {
  it("should start in stepOne state", () => {
    expect(createTransactionMachine.initialState.value).toBe("stepOne");
  });

  it("should transition from stepOne to stepTwo on SET_USERS", () => {
    const nextState = createTransactionMachine.transition("stepOne", {
      type: "SET_USERS",
      sender: { id: "sender1" },
      receiver: { id: "receiver1" },
    } as any);
    expect(nextState.value).toBe("stepTwo");
  });

  it("should transition from stepTwo to stepThree on CREATE", () => {
    const nextState = createTransactionMachine.transition("stepTwo", {
      type: "CREATE",
      transactionType: "payment",
      amount: 100,
    } as any);
    expect(nextState.value).toBe("stepThree");
  });

  it("should transition from stepThree to stepOne on RESET", () => {
    const nextState = createTransactionMachine.transition("stepThree", "RESET");
    expect(nextState.value).toBe("stepOne");
  });

  it("should ignore CREATE event in stepOne", () => {
    const nextState = createTransactionMachine.transition("stepOne", "CREATE");
    expect(nextState.value).toBe("stepOne");
  });

  it("should ignore RESET event in stepOne", () => {
    const nextState = createTransactionMachine.transition("stepOne", "RESET");
    expect(nextState.value).toBe("stepOne");
  });

  it("should ignore SET_USERS event in stepTwo", () => {
    const nextState = createTransactionMachine.transition("stepTwo", "SET_USERS");
    expect(nextState.value).toBe("stepTwo");
  });

  it("should ignore SET_USERS event in stepThree", () => {
    const nextState = createTransactionMachine.transition("stepThree", "SET_USERS");
    expect(nextState.value).toBe("stepThree");
  });

  it("should complete full flow: stepOne → stepTwo → stepThree → stepOne", () => {
    let state = createTransactionMachine.initialState;
    expect(state.value).toBe("stepOne");

    state = createTransactionMachine.transition(state, {
      type: "SET_USERS",
      sender: { id: "s1" },
      receiver: { id: "r1" },
    } as any);
    expect(state.value).toBe("stepTwo");

    state = createTransactionMachine.transition(state, {
      type: "CREATE",
      transactionType: "payment",
      amount: 50,
    } as any);
    expect(state.value).toBe("stepThree");

    state = createTransactionMachine.transition(state, "RESET");
    expect(state.value).toBe("stepOne");
  });

  it("should fire entry actions when entering stepTwo on SET_USERS", () => {
    const state = createTransactionMachine.transition(createTransactionMachine.initialState, {
      type: "SET_USERS",
      sender: { id: "s1", username: "senderUser" },
      receiver: { id: "r1", username: "receiverUser" },
    } as any);
    expect(state.value).toBe("stepTwo");
    // Entry actions should be present (assign actions have type "xstate.assign")
    expect(state.actions.length).toBeGreaterThan(0);
  });

  it("should fire entry actions when entering stepThree on CREATE", () => {
    // First get to stepTwo
    const stepTwoState = createTransactionMachine.transition(
      createTransactionMachine.initialState,
      {
        type: "SET_USERS",
        sender: { id: "s1" },
        receiver: { id: "r1" },
      } as any
    );

    const event = {
      type: "CREATE",
      transactionType: "payment",
      amount: 100,
      description: "Test payment",
    } as any;

    const state = createTransactionMachine.transition(stepTwoState, event);
    expect(state.value).toBe("stepThree");
    // Entry actions should be present (assign actions have type "xstate.assign")
    expect(state.actions.length).toBeGreaterThan(0);
  });

  it("should transition back to stepOne on RESET from stepThree", () => {
    // Navigate to stepThree first
    let state = createTransactionMachine.transition(createTransactionMachine.initialState, {
      type: "SET_USERS",
      sender: { id: "s1" },
      receiver: { id: "r1" },
    } as any);
    state = createTransactionMachine.transition(state, {
      type: "CREATE",
      transactionType: "payment",
    } as any);
    expect(state.value).toBe("stepThree");

    // Reset back to stepOne
    state = createTransactionMachine.transition(state, "RESET");
    expect(state.value).toBe("stepOne");
  });
});
