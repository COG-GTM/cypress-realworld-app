import { describe, expect, it, beforeEach, vi } from "vitest";
import { interpret, InterpreterFrom } from "xstate";

vi.mock("../../utils/asyncUtils", () => ({
  httpClient: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock("../../utils/historyUtils", () => ({
  history: {
    push: vi.fn(),
    location: { pathname: "/" },
  },
}));

vi.mock("../../utils/portUtils", () => ({
  backendPort: 3001,
}));

import { createTransactionMachine } from "../createTransactionMachine";
import { User, TransactionCreatePayload } from "../../models";

describe("createTransactionMachine", () => {
  const machineWithContext = createTransactionMachine.withContext({
    sender: {} as User,
    receiver: {} as User,
    transactionDetails: {} as TransactionCreatePayload,
  });
  let service: InterpreterFrom<typeof machineWithContext>;

  const sender = {
    id: "sender-1",
    uuid: "s-uuid",
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    password: "pass",
    email: "john@test.com",
    phoneNumber: "555-1234",
    balance: 10000,
    avatar: "avatar.png",
    defaultPrivacyLevel: "public" as const,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  const receiver = {
    id: "receiver-1",
    uuid: "r-uuid",
    firstName: "Jane",
    lastName: "Smith",
    username: "janesmith",
    password: "pass",
    email: "jane@test.com",
    phoneNumber: "555-5678",
    balance: 5000,
    avatar: "avatar2.png",
    defaultPrivacyLevel: "public" as const,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = interpret(machineWithContext).start();
  });

  it("should start in stepOne state", () => {
    expect(service.state.matches("stepOne")).toBe(true);
  });

  it("should transition from stepOne to stepTwo on SET_USERS event", () => {
    service.send({ type: "SET_USERS", sender, receiver } as any);
    expect(service.state.matches("stepTwo")).toBe(true);
  });

  it("should set sender and receiver in context on SET_USERS", () => {
    service.send({ type: "SET_USERS", sender, receiver } as any);
    expect(service.state.context.sender.id).toBe(sender.id);
    expect(service.state.context.sender.firstName).toBe(sender.firstName);
    expect(service.state.context.receiver.id).toBe(receiver.id);
    expect(service.state.context.receiver.firstName).toBe(receiver.firstName);
  });

  it("should transition from stepTwo to stepThree on CREATE event", () => {
    service.send({ type: "SET_USERS", sender, receiver } as any);
    expect(service.state.matches("stepTwo")).toBe(true);

    const transactionDetails = {
      type: "CREATE",
      amount: "50",
      description: "Test payment",
      transactionType: "payment",
    };
    service.send(transactionDetails as any);
    expect(service.state.matches("stepThree")).toBe(true);
  });

  it("should set transaction details in context on CREATE", () => {
    service.send({ type: "SET_USERS", sender, receiver } as any);

    const transactionDetails = {
      type: "CREATE",
      amount: "50",
      description: "Test payment",
      transactionType: "payment",
    };
    service.send(transactionDetails as any);

    expect(service.state.context.transactionDetails).toBeDefined();
    expect((service.state.context.transactionDetails as any).amount).toBe("50");
    expect((service.state.context.transactionDetails as any).description).toBe("Test payment");
  });

  it("should transition from stepThree back to stepOne on RESET event", () => {
    service.send({ type: "SET_USERS", sender, receiver } as any);
    service.send({ type: "CREATE", amount: "50", description: "Test" } as any);
    expect(service.state.matches("stepThree")).toBe(true);

    service.send("RESET");
    expect(service.state.matches("stepOne")).toBe(true);
  });

  it("should clear context when returning to stepOne via RESET", () => {
    service.send({ type: "SET_USERS", sender, receiver } as any);
    expect(service.state.context.sender.id).toBe(sender.id);

    service.send({ type: "CREATE", amount: "50", description: "Test" } as any);
    service.send("RESET");

    expect(service.state.matches("stepOne")).toBe(true);
  });

  it("should not transition from stepOne on CREATE event", () => {
    service.send("CREATE");
    expect(service.state.matches("stepOne")).toBe(true);
  });

  it("should not transition from stepOne on RESET event", () => {
    service.send("RESET");
    expect(service.state.matches("stepOne")).toBe(true);
  });

  it("should not transition from stepTwo on RESET event", () => {
    service.send({ type: "SET_USERS", sender, receiver } as any);
    expect(service.state.matches("stepTwo")).toBe(true);

    service.send("RESET");
    expect(service.state.matches("stepTwo")).toBe(true);
  });

  it("should complete the full step flow: stepOne -> stepTwo -> stepThree -> stepOne", () => {
    expect(service.state.matches("stepOne")).toBe(true);

    service.send({ type: "SET_USERS", sender, receiver } as any);
    expect(service.state.matches("stepTwo")).toBe(true);

    service.send({ type: "CREATE", amount: "100", description: "Full flow" } as any);
    expect(service.state.matches("stepThree")).toBe(true);

    service.send("RESET");
    expect(service.state.matches("stepOne")).toBe(true);
  });
});
