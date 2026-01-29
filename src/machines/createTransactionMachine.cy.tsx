import { interpret } from "xstate";
import { createTransactionMachine } from "./createTransactionMachine";
import { User, DefaultPrivacyLevel } from "../models";

describe("CreateTransactionMachine State Transitions", () => {
  let createTransactionService;

  const sender: User = {
    id: "sender-id",
    uuid: "sender-uuid",
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    password: "password",
    email: "john@example.com",
    phoneNumber: "555-555-5555",
    balance: 100000,
    avatar: "https://example.com/avatar.png",
    defaultPrivacyLevel: DefaultPrivacyLevel.public,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  const receiver: User = {
    id: "receiver-id",
    uuid: "receiver-uuid",
    firstName: "Jane",
    lastName: "Smith",
    username: "janesmith",
    password: "password",
    email: "jane@example.com",
    phoneNumber: "555-555-5556",
    balance: 50000,
    avatar: "https://example.com/avatar2.png",
    defaultPrivacyLevel: DefaultPrivacyLevel.public,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  beforeEach(() => {
    createTransactionService = interpret(createTransactionMachine);
    createTransactionService.start();
  });

  afterEach(() => {
    createTransactionService.stop();
  });

  it("starts in stepOne state", () => {
    expect(createTransactionService.state.value).to.equal("stepOne");
  });

  it("transitions to stepTwo on SET_USERS event", () => {
    createTransactionService.send({ type: "SET_USERS", sender, receiver });
    expect(createTransactionService.state.value).to.equal("stepTwo");
  });

  it("sets sender and receiver in context on SET_USERS", () => {
    createTransactionService.send({ type: "SET_USERS", sender, receiver });
    expect(createTransactionService.state.context.sender).to.deep.equal(sender);
    expect(createTransactionService.state.context.receiver).to.deep.equal(receiver);
  });

  it("transitions to stepThree on CREATE event from stepTwo", () => {
    createTransactionService.send({ type: "SET_USERS", sender, receiver });
    createTransactionService.send({
      type: "CREATE",
      amount: "100",
      description: "Test payment",
      transactionType: "payment",
    });
    expect(createTransactionService.state.value).to.equal("stepThree");
  });

  it("sets transaction details in context on CREATE", () => {
    createTransactionService.send({ type: "SET_USERS", sender, receiver });
    const transactionDetails = {
      type: "CREATE",
      amount: "100",
      description: "Test payment",
      transactionType: "payment",
    };
    createTransactionService.send(transactionDetails);
    expect(createTransactionService.state.context.transactionDetails).to.exist;
  });

  it("transitions back to stepOne on RESET event from stepThree", () => {
    createTransactionService.send({ type: "SET_USERS", sender, receiver });
    createTransactionService.send({
      type: "CREATE",
      amount: "100",
      description: "Test payment",
      transactionType: "payment",
    });
    createTransactionService.send({ type: "RESET" });
    expect(createTransactionService.state.value).to.equal("stepOne");
  });

  it("clears context on RESET", () => {
    createTransactionService.send({ type: "SET_USERS", sender, receiver });
    createTransactionService.send({
      type: "CREATE",
      amount: "100",
      description: "Test payment",
      transactionType: "payment",
    });
    createTransactionService.send({ type: "RESET" });
    expect(createTransactionService.state.context.sender).to.be.undefined;
    expect(createTransactionService.state.context.receiver).to.be.undefined;
  });

  describe("Full Transaction Flow", () => {
    it("completes a full payment transaction flow", () => {
      expect(createTransactionService.state.value).to.equal("stepOne");

      createTransactionService.send({ type: "SET_USERS", sender, receiver });
      expect(createTransactionService.state.value).to.equal("stepTwo");

      createTransactionService.send({
        type: "CREATE",
        amount: "50",
        description: "Lunch payment",
        transactionType: "payment",
      });
      expect(createTransactionService.state.value).to.equal("stepThree");

      createTransactionService.send({ type: "RESET" });
      expect(createTransactionService.state.value).to.equal("stepOne");
    });

    it("completes a full request transaction flow", () => {
      expect(createTransactionService.state.value).to.equal("stepOne");

      createTransactionService.send({ type: "SET_USERS", sender, receiver });
      expect(createTransactionService.state.value).to.equal("stepTwo");

      createTransactionService.send({
        type: "CREATE",
        amount: "75",
        description: "Dinner request",
        transactionType: "request",
      });
      expect(createTransactionService.state.value).to.equal("stepThree");

      createTransactionService.send({ type: "RESET" });
      expect(createTransactionService.state.value).to.equal("stepOne");
    });
  });
});
