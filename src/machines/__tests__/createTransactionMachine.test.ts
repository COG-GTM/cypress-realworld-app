import { describe, it, expect, vi } from "vitest";
import { Machine, assign, interpret } from "xstate";

vi.mock("../../utils/asyncUtils", () => ({
  httpClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock("../../utils/portUtils", () => ({
  backendPort: "3001",
}));

import { createTransactionMachine } from "../createTransactionMachine";

describe("createTransactionMachine", () => {
  it("should start in stepOne", () => {
    const service = interpret(createTransactionMachine).start();
    expect(service.state.value).toBe("stepOne");
    service.stop();
  });

  it("should transition from stepOne to stepTwo on SET_USERS", () => {
    const service = interpret(createTransactionMachine).start();
    service.send({
      type: "SET_USERS",
      sender: { id: "s1", firstName: "John" },
      receiver: { id: "r1", firstName: "Jane" },
    } as any);

    const stateValue = service.state.value;
    expect(typeof stateValue === "object" || stateValue === "stepTwo").toBe(true);
    service.stop();
  });

  it("should transition from stepTwo to stepThree on CREATE", () => {
    const service = interpret(createTransactionMachine).start();

    service.send({
      type: "SET_USERS",
      sender: { id: "s1" },
      receiver: { id: "r1" },
    } as any);

    service.send({
      type: "CREATE",
      transactionType: "payment",
      amount: "100",
      description: "Test",
    } as any);

    expect(service.state.value).toBe("stepThree");
    service.stop();
  });

  it("should transition from stepThree back to stepOne on RESET", () => {
    const service = interpret(createTransactionMachine).start();

    service.send({
      type: "SET_USERS",
      sender: { id: "s1" },
      receiver: { id: "r1" },
    } as any);

    service.send({
      type: "CREATE",
      transactionType: "request",
      amount: "50",
      description: "Lunch",
    } as any);

    expect(service.state.value).toBe("stepThree");

    service.send("RESET");
    expect(service.state.value).toBe("stepOne");
    service.stop();
  });

  it("should define correct states and transitions", () => {
    const states = createTransactionMachine.config.states;
    expect(states).toHaveProperty("stepOne");
    expect(states).toHaveProperty("stepTwo");
    expect(states).toHaveProperty("stepThree");

    expect(states!.stepOne!.on).toHaveProperty("SET_USERS");
    expect(states!.stepTwo!.on).toHaveProperty("CREATE");
    expect(states!.stepThree!.on).toHaveProperty("RESET");
  });
});
