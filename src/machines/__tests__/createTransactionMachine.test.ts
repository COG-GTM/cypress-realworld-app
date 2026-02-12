import { describe, it, expect, vi } from "vitest";
import { interpret } from "xstate";
import { createTransactionMachine } from "../createTransactionMachine";

vi.mock("../../utils/asyncUtils", () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(),
    interceptors: { request: { use: vi.fn() } },
    defaults: { withCredentials: true },
  },
}));

vi.mock("../../utils/historyUtils", () => ({
  history: {
    push: vi.fn(),
    location: { pathname: "/" },
    listen: vi.fn(),
  },
}));

vi.mock("../authMachine", () => ({
  authService: {
    send: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    state: { value: "unauthorized", context: {} },
    onTransition: vi.fn().mockReturnThis(),
  },
  authMachine: {},
}));

describe("createTransactionMachine", () => {
  it("has an initial state of stepOne", () => {
    expect(createTransactionMachine.initialState.value).toBe("stepOne");
  });

  it("transitions from stepOne to stepTwo on SET_USERS", () => {
    const nextState = createTransactionMachine.transition("stepOne", {
      type: "SET_USERS",
      sender: { id: "sender-1" },
      receiver: { id: "receiver-1" },
    } as any);
    expect(nextState.value).toBe("stepTwo");
  });

  it("transitions from stepTwo to stepThree on CREATE", () => {
    const nextState = createTransactionMachine.transition("stepTwo", {
      type: "CREATE",
      transactionType: "payment",
      amount: "100",
      description: "test",
    } as any);
    expect(nextState.value).toBe("stepThree");
  });

  it("transitions from stepThree back to stepOne on RESET", () => {
    const nextState = createTransactionMachine.transition("stepThree", "RESET");
    expect(nextState.value).toBe("stepOne");
  });

  it("reaches stepTwo on SET_USERS via interpret", () => {
    const sender = { id: "s1", firstName: "Alice" };
    const receiver = { id: "r1", firstName: "Bob" };
    const service = interpret(createTransactionMachine).start();
    service.send({ type: "SET_USERS", sender, receiver } as any);
    expect(service.state.value).toBe("stepTwo");
    service.stop();
  });

  it("reaches stepThree on CREATE via interpret", () => {
    const sender = { id: "s1", firstName: "Alice" };
    const receiver = { id: "r1", firstName: "Bob" };
    const service = interpret(createTransactionMachine).start();
    service.send({ type: "SET_USERS", sender, receiver } as any);
    service.send({
      type: "CREATE",
      transactionType: "payment",
      amount: "50",
      description: "lunch",
    } as any);
    expect(service.state.value).toBe("stepThree");
    service.stop();
  });

  it("clears context on entering stepOne", () => {
    const nextState = createTransactionMachine.transition("stepThree", "RESET");
    expect(nextState.value).toBe("stepOne");
  });

  it("can be started with interpret", () => {
    const service = interpret(createTransactionMachine);
    service.start();
    expect(service.state.value).toBe("stepOne");
    service.stop();
  });
});
