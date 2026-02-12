import { describe, expect, it, beforeEach } from "vitest";
import { interpret, InterpreterFrom } from "xstate";
import { createTransactionMachine } from "../createTransactionMachine";
import { User } from "../../models";

const mockSender: Partial<User> = {
  id: "sender-1",
  firstName: "Alice",
  lastName: "Smith",
  username: "alice",
};

const mockReceiver: Partial<User> = {
  id: "receiver-1",
  firstName: "Bob",
  lastName: "Jones",
  username: "bob",
};

const createTestMachine = () =>
  createTransactionMachine
    .withConfig({
      services: {
        transactionDataMachine: () => () => {},
      },
    })
    .withContext({
      sender: undefined as unknown as User,
      receiver: undefined as unknown as User,
      transactionDetails: undefined as unknown as any,
    });

describe("createTransactionMachine", () => {
  let service: InterpreterFrom<typeof createTransactionMachine>;

  beforeEach(() => {
    service?.stop();
  });

  it("should start in stepOne state", () => {
    const machine = createTestMachine();
    service = interpret(machine).start();
    expect(service.state.matches("stepOne")).toBe(true);
  });

  describe("step transitions", () => {
    it("should transition from stepOne to stepTwo on SET_USERS", () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send({ type: "SET_USERS", sender: mockSender, receiver: mockReceiver } as any);
      expect(service.state.matches("stepTwo")).toBe(true);
    });

    it("should transition from stepTwo to stepThree on CREATE", () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send({ type: "SET_USERS", sender: mockSender, receiver: mockReceiver } as any);
      service.send({
        type: "CREATE",
        amount: "50",
        description: "Test payment",
        senderId: mockSender.id,
        receiverId: mockReceiver.id,
      } as any);
      expect(service.state.matches("stepThree")).toBe(true);
    });

    it("should transition from stepThree back to stepOne on RESET", () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send({ type: "SET_USERS", sender: mockSender, receiver: mockReceiver } as any);
      service.send({ type: "CREATE", amount: "50", description: "Test" } as any);
      service.send("RESET");
      expect(service.state.matches("stepOne")).toBe(true);
    });

    it("should complete full step cycle: stepOne → stepTwo → stepThree → stepOne", () => {
      const machine = createTestMachine();
      service = interpret(machine).start();

      expect(service.state.matches("stepOne")).toBe(true);
      service.send({ type: "SET_USERS", sender: mockSender, receiver: mockReceiver } as any);
      expect(service.state.matches("stepTwo")).toBe(true);
      service.send({ type: "CREATE", amount: "25", description: "Lunch" } as any);
      expect(service.state.matches("stepThree")).toBe(true);
      service.send("RESET");
      expect(service.state.matches("stepOne")).toBe(true);
    });
  });

  describe("context updates", () => {
    it("should set sender and receiver when transitioning to stepTwo", () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send({ type: "SET_USERS", sender: mockSender, receiver: mockReceiver } as any);

      expect(service.state.context.sender).toEqual(mockSender);
      expect(service.state.context.receiver).toEqual(mockReceiver);
    });

    it("should set transaction details when transitioning to stepThree", () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send({ type: "SET_USERS", sender: mockSender, receiver: mockReceiver } as any);

      const transactionPayload = {
        type: "CREATE",
        amount: "100",
        description: "Dinner",
        senderId: mockSender.id,
        receiverId: mockReceiver.id,
      };
      service.send(transactionPayload as any);

      expect(service.state.context.transactionDetails).toEqual(transactionPayload);
    });

    it("should reset to stepOne and invoke clearContext on RESET", () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send({ type: "SET_USERS", sender: mockSender, receiver: mockReceiver } as any);
      service.send({ type: "CREATE", amount: "50", description: "Test" } as any);
      service.send("RESET");

      expect(service.state.matches("stepOne")).toBe(true);
    });
  });

  describe("invalid transitions", () => {
    it("should not transition on CREATE from stepOne", () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send("CREATE");
      expect(service.state.matches("stepOne")).toBe(true);
    });

    it("should not transition on RESET from stepOne", () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send("RESET");
      expect(service.state.matches("stepOne")).toBe(true);
    });

    it("should not transition on RESET from stepTwo", () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send({ type: "SET_USERS", sender: mockSender, receiver: mockReceiver } as any);
      service.send("RESET");
      expect(service.state.matches("stepTwo")).toBe(true);
    });
  });
});
