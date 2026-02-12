import { MemoryRouter } from "react-router-dom";
import { Machine, interpret } from "xstate";
import TransactionCreateStepThree from "./TransactionCreateStepThree";
import { DefaultPrivacyLevel } from "../models";

const receiver = {
  id: "receiver1",
  uuid: "receiver-uuid",
  firstName: "Jane",
  lastName: "Doe",
  username: "janedoe",
  password: "hashed",
  email: "jane@example.com",
  phoneNumber: "555-5678",
  balance: 30000,
  avatar: "https://example.com/avatar2.png",
  defaultPrivacyLevel: DefaultPrivacyLevel.public,
  createdAt: new Date("2024-01-01"),
  modifiedAt: new Date("2024-01-01"),
};

const sender = {
  id: "sender1",
  uuid: "sender-uuid",
  firstName: "John",
  lastName: "Smith",
  username: "johnsmith",
  password: "hashed",
  email: "john@example.com",
  phoneNumber: "555-1234",
  balance: 50000,
  avatar: "https://example.com/avatar1.png",
  defaultPrivacyLevel: DefaultPrivacyLevel.public,
  createdAt: new Date("2024-01-01"),
  modifiedAt: new Date("2024-01-01"),
};

function createMockService(transactionType: string, amount: string, description: string) {
  const mockMachine = Machine({
    id: "createTransaction",
    initial: "stepThree",
    context: {
      receiver,
      sender,
      transactionDetails: {
        transactionType,
        amount,
        description,
        senderId: sender.id,
        receiverId: receiver.id,
      },
    },
    states: {
      stepOne: {},
      stepTwo: {},
      stepThree: {
        on: {
          RESET: "stepOne",
        },
      },
    },
  });

  const service = interpret(mockMachine);
  service.start();
  return service;
}

describe("TransactionCreateStepThree", () => {
  it("renders confirmation view for payment", () => {
    const service = createMockService("payment", "50", "Test payment");

    cy.mount(
      <MemoryRouter>
        <TransactionCreateStepThree createTransactionService={service as any} />
      </MemoryRouter>
    );

    cy.contains("Jane Doe").should("be.visible");
    cy.contains("Paid").should("be.visible");
    cy.contains("Test payment").should("be.visible");
    cy.get("[data-test='new-transaction-return-to-transactions']").should("be.visible");
    cy.get("[data-test='new-transaction-create-another-transaction']").should("be.visible");
  });

  it("renders confirmation view for request", () => {
    const service = createMockService("request", "100", "Test request");

    cy.mount(
      <MemoryRouter>
        <TransactionCreateStepThree createTransactionService={service as any} />
      </MemoryRouter>
    );

    cy.contains("Jane Doe").should("be.visible");
    cy.contains("Requested").should("be.visible");
    cy.contains("Test request").should("be.visible");
  });

  it("renders return to transactions button", () => {
    const service = createMockService("payment", "25", "Return test");

    cy.mount(
      <MemoryRouter>
        <TransactionCreateStepThree createTransactionService={service as any} />
      </MemoryRouter>
    );

    cy.get("[data-test='new-transaction-return-to-transactions']")
      .should("be.visible")
      .and("contain", "Return To Transactions");
  });

  it("renders create another transaction button", () => {
    const service = createMockService("payment", "75", "Another test");

    cy.mount(
      <MemoryRouter>
        <TransactionCreateStepThree createTransactionService={service as any} />
      </MemoryRouter>
    );

    cy.get("[data-test='new-transaction-create-another-transaction']")
      .should("be.visible")
      .and("contain", "Create Another Transaction");
  });
});
