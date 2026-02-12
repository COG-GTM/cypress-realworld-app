import TransactionCreateStepTwo from "./TransactionCreateStepTwo";
import { User } from "../models";

describe("TransactionCreateStepTwo", () => {
  const sender: User = {
    id: "sender-1",
    uuid: "sender-uuid",
    firstName: "Alice",
    lastName: "Smith",
    username: "alice",
    password: "hashed",
    email: "alice@test.com",
    phoneNumber: "111-111-1111",
    avatar: "https://example.com/alice.svg",
    defaultPrivacyLevel: "public" as any,
    balance: 100000,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  const receiver: User = {
    id: "receiver-1",
    uuid: "receiver-uuid",
    firstName: "Bob",
    lastName: "Jones",
    username: "bob",
    password: "hashed",
    email: "bob@test.com",
    phoneNumber: "222-222-2222",
    avatar: "https://example.com/bob.svg",
    defaultPrivacyLevel: "public" as any,
    balance: 50000,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  it("renders the receiver name", () => {
    const createTransaction = cy.stub();
    const showSnackbar = cy.stub();
    cy.mount(
      <TransactionCreateStepTwo
        receiver={receiver}
        sender={sender}
        createTransaction={createTransaction}
        showSnackbar={showSnackbar}
      />
    );

    cy.contains("Bob Jones").should("be.visible");
  });

  it("renders amount and description fields", () => {
    const createTransaction = cy.stub();
    const showSnackbar = cy.stub();
    cy.mount(
      <TransactionCreateStepTwo
        receiver={receiver}
        sender={sender}
        createTransaction={createTransaction}
        showSnackbar={showSnackbar}
      />
    );

    cy.get("[data-test=transaction-create-amount-input]").should("be.visible");
    cy.get("[data-test=transaction-create-description-input]").should("be.visible");
  });

  it("renders request and pay buttons", () => {
    const createTransaction = cy.stub();
    const showSnackbar = cy.stub();
    cy.mount(
      <TransactionCreateStepTwo
        receiver={receiver}
        sender={sender}
        createTransaction={createTransaction}
        showSnackbar={showSnackbar}
      />
    );

    cy.get("[data-test=transaction-create-submit-request]").should("be.visible").and("contain", "Request");
    cy.get("[data-test=transaction-create-submit-payment]").should("be.visible").and("contain", "Pay");
  });

  it("buttons are disabled when form is empty", () => {
    const createTransaction = cy.stub();
    const showSnackbar = cy.stub();
    cy.mount(
      <TransactionCreateStepTwo
        receiver={receiver}
        sender={sender}
        createTransaction={createTransaction}
        showSnackbar={showSnackbar}
      />
    );

    cy.get("[data-test=transaction-create-submit-request]").should("be.disabled");
    cy.get("[data-test=transaction-create-submit-payment]").should("be.disabled");
  });
});
