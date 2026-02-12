import { MemoryRouter } from "react-router-dom";
import { interpret, Machine, assign } from "xstate";
import TransactionCreateStepThree from "./TransactionCreateStepThree";
import { DefaultPrivacyLevel } from "../models";

const sender = {
  id: "user1",
  uuid: "uuid-1",
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

const receiver = {
  id: "user2",
  uuid: "uuid-2",
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

function createStepThreeService(transactionType: string, amount: string, description: string) {
  const machine = Machine(
    {
      id: "createTransaction",
      initial: "stepThree",
      context: {
        sender,
        receiver,
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
    },
    {
      actions: {
        clearContext: assign(() => ({})),
      },
    }
  );
  return interpret(machine).start();
}

describe("TransactionCreateStepThree", () => {
  it("renders receiver name and transaction summary", () => {
    const service = createStepThreeService("payment", "50", "Test payment");

    cy.mount(
      <MemoryRouter>
        <TransactionCreateStepThree createTransactionService={service as any} />
      </MemoryRouter>
    );

    cy.contains("Jane Doe").should("be.visible");
    cy.contains("Paid").should("be.visible");
    cy.contains("Test payment").should("be.visible");
  });

  it("renders Return To Transactions button", () => {
    const service = createStepThreeService("payment", "50", "Test payment");

    cy.mount(
      <MemoryRouter>
        <TransactionCreateStepThree createTransactionService={service as any} />
      </MemoryRouter>
    );

    cy.get("[data-test='new-transaction-return-to-transactions']").should("be.visible");
  });

  it("renders Create Another Transaction button", () => {
    const service = createStepThreeService("payment", "50", "Test payment");

    cy.mount(
      <MemoryRouter>
        <TransactionCreateStepThree createTransactionService={service as any} />
      </MemoryRouter>
    );

    cy.get("[data-test='new-transaction-create-another-transaction']").should("be.visible");
  });

  it("renders request transaction type correctly", () => {
    const service = createStepThreeService("request", "100", "Dinner split");

    cy.mount(
      <MemoryRouter>
        <TransactionCreateStepThree createTransactionService={service as any} />
      </MemoryRouter>
    );

    cy.contains("Requested").should("be.visible");
    cy.contains("Dinner split").should("be.visible");
  });
});
