import TransactionCreateStepTwo from "./TransactionCreateStepTwo";
import { User, DefaultPrivacyLevel } from "../models";

const sender: User = {
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

const receiver: User = {
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

describe("TransactionCreateStepTwo", () => {
  it("renders receiver name, amount input, and note field", () => {
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

    cy.contains("Jane Doe").should("be.visible");
    cy.get("[data-test='transaction-create-amount-input']").should("exist");
    cy.get("[data-test='transaction-create-description-input']").should("exist");
  });

  it("disables submit buttons when form is invalid", () => {
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

    cy.get("[data-test='transaction-create-submit-request']").should("be.disabled");
    cy.get("[data-test='transaction-create-submit-payment']").should("be.disabled");
  });

  it("enables submit buttons when form is valid", () => {
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

    cy.get("#amount").type("50");
    cy.get("[data-test='transaction-create-description-input']").type("Test note");

    cy.get("[data-test='transaction-create-submit-request']").should("not.be.disabled");
    cy.get("[data-test='transaction-create-submit-payment']").should("not.be.disabled");
  });

  it("shows validation error for missing amount", () => {
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

    cy.get("[data-test='transaction-create-description-input']").type("Test note");
    cy.get("[data-test='transaction-create-submit-request']").should("be.disabled");
  });

  it("shows validation error for missing note", () => {
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

    cy.get("#amount").type("50");
    cy.get("[data-test='transaction-create-submit-request']").should("be.disabled");
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

    cy.get("[data-test='transaction-create-submit-request']").should("contain", "Request");
    cy.get("[data-test='transaction-create-submit-payment']").should("contain", "Pay");
  });
});
