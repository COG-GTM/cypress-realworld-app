import { interpret, Machine } from "xstate";
import { MemoryRouter } from "react-router-dom";
import TransactionCreateStepThree from "./TransactionCreateStepThree";

const mockCreateTransactionMachine = Machine({
  id: "mockCreateTransaction",
  initial: "stepThree",
  context: {
    sender: {
      id: "sender-1",
      uuid: "sender-uuid",
      firstName: "Alice",
      lastName: "Smith",
      username: "alice",
      password: "hashed",
      email: "alice@test.com",
      phoneNumber: "111-111-1111",
      avatar: "https://example.com/alice.svg",
      defaultPrivacyLevel: "public",
      balance: 100000,
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
    receiver: {
      id: "receiver-1",
      uuid: "receiver-uuid",
      firstName: "Bob",
      lastName: "Jones",
      username: "bob",
      password: "hashed",
      email: "bob@test.com",
      phoneNumber: "222-222-2222",
      avatar: "https://example.com/bob.svg",
      defaultPrivacyLevel: "public",
      balance: 50000,
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
    transactionDetails: {
      transactionType: "payment",
      amount: "50",
      description: "Test payment",
    },
  },
  states: {
    stepThree: {
      on: {
        RESET: "stepThree",
      },
    },
  },
});

describe("TransactionCreateStepThree", () => {
  let createTransactionService: any;

  beforeEach(() => {
    createTransactionService = interpret(mockCreateTransactionMachine);
    createTransactionService.start();
  });

  it("renders receiver name", () => {
    cy.mount(
      <MemoryRouter>
        <TransactionCreateStepThree createTransactionService={createTransactionService} />
      </MemoryRouter>
    );

    cy.contains("Bob").should("be.visible");
    cy.contains("Jones").should("be.visible");
  });

  it("renders transaction details", () => {
    cy.mount(
      <MemoryRouter>
        <TransactionCreateStepThree createTransactionService={createTransactionService} />
      </MemoryRouter>
    );

    cy.contains("Paid").should("be.visible");
    cy.contains("Test payment").should("be.visible");
  });

  it("renders return to transactions button", () => {
    cy.mount(
      <MemoryRouter>
        <TransactionCreateStepThree createTransactionService={createTransactionService} />
      </MemoryRouter>
    );

    cy.get("[data-test=new-transaction-return-to-transactions]")
      .should("be.visible")
      .and("contain", "Return To Transactions");
  });

  it("renders create another transaction button", () => {
    cy.mount(
      <MemoryRouter>
        <TransactionCreateStepThree createTransactionService={createTransactionService} />
      </MemoryRouter>
    );

    cy.get("[data-test=new-transaction-create-another-transaction]")
      .should("be.visible")
      .and("contain", "Create Another Transaction");
  });
});
