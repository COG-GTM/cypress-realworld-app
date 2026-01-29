import TransactionCreateStepTwo from "./TransactionCreateStepTwo";
import { User, DefaultPrivacyLevel } from "../models";

describe("TransactionCreateStepTwo", () => {
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

  it("renders the transaction form with receiver info", () => {
    const createTransactionSpy = cy.spy().as("createTransaction");
    const showSnackbarSpy = cy.spy().as("showSnackbar");

    cy.mount(
      <TransactionCreateStepTwo
        sender={sender}
        receiver={receiver}
        createTransaction={createTransactionSpy}
        showSnackbar={showSnackbarSpy}
      />
    );

    cy.contains(`${receiver.firstName} ${receiver.lastName}`).should("be.visible");
    cy.get("[data-test='transaction-create-form']").should("be.visible");
    cy.get("[data-test='transaction-create-amount-input']").should("be.visible");
    cy.get("[data-test='transaction-create-description-input']").should("be.visible");
    cy.get("[data-test='transaction-create-submit-request']").should("be.visible");
    cy.get("[data-test='transaction-create-submit-payment']").should("be.visible");
  });

  it("request and pay buttons are disabled when form is invalid", () => {
    const createTransactionSpy = cy.spy().as("createTransaction");
    const showSnackbarSpy = cy.spy().as("showSnackbar");

    cy.mount(
      <TransactionCreateStepTwo
        sender={sender}
        receiver={receiver}
        createTransaction={createTransactionSpy}
        showSnackbar={showSnackbarSpy}
      />
    );

    cy.get("[data-test='transaction-create-submit-request']").should("be.disabled");
    cy.get("[data-test='transaction-create-submit-payment']").should("be.disabled");
  });

  it("enables buttons when form is valid", () => {
    const createTransactionSpy = cy.spy().as("createTransaction");
    const showSnackbarSpy = cy.spy().as("showSnackbar");

    cy.mount(
      <TransactionCreateStepTwo
        sender={sender}
        receiver={receiver}
        createTransaction={createTransactionSpy}
        showSnackbar={showSnackbarSpy}
      />
    );

    cy.get("[data-test='transaction-create-amount-input']").type("50");
    cy.get("[data-test='transaction-create-description-input']").type("Test payment");

    cy.get("[data-test='transaction-create-submit-request']").should("not.be.disabled");
    cy.get("[data-test='transaction-create-submit-payment']").should("not.be.disabled");
  });

  it("submits a payment transaction", () => {
    const createTransactionSpy = cy.spy().as("createTransaction");
    const showSnackbarSpy = cy.spy().as("showSnackbar");

    cy.mount(
      <TransactionCreateStepTwo
        sender={sender}
        receiver={receiver}
        createTransaction={createTransactionSpy}
        showSnackbar={showSnackbarSpy}
      />
    );

    cy.get("[data-test='transaction-create-amount-input']").type("100");
    cy.get("[data-test='transaction-create-description-input']").type("Payment for lunch");
    cy.get("[data-test='transaction-create-submit-payment']").click();

    cy.get("@createTransaction").should("have.been.calledOnce");
    cy.get("@showSnackbar").should("have.been.calledWith", {
      severity: "success",
      message: "Transaction Submitted!",
    });
  });

  it("submits a request transaction", () => {
    const createTransactionSpy = cy.spy().as("createTransaction");
    const showSnackbarSpy = cy.spy().as("showSnackbar");

    cy.mount(
      <TransactionCreateStepTwo
        sender={sender}
        receiver={receiver}
        createTransaction={createTransactionSpy}
        showSnackbar={showSnackbarSpy}
      />
    );

    cy.get("[data-test='transaction-create-amount-input']").type("75");
    cy.get("[data-test='transaction-create-description-input']").type("Request for dinner");
    cy.get("[data-test='transaction-create-submit-request']").click();

    cy.get("@createTransaction").should("have.been.calledOnce");
    cy.get("@showSnackbar").should("have.been.calledWith", {
      severity: "success",
      message: "Transaction Submitted!",
    });
  });

  it("displays receiver avatar", () => {
    const createTransactionSpy = cy.spy().as("createTransaction");
    const showSnackbarSpy = cy.spy().as("showSnackbar");

    cy.mount(
      <TransactionCreateStepTwo
        sender={sender}
        receiver={receiver}
        createTransaction={createTransactionSpy}
        showSnackbar={showSnackbarSpy}
      />
    );

    cy.get(".MuiAvatar-root").should("be.visible");
  });
});
