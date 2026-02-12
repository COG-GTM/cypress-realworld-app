import TransactionCreateStepTwo from "./TransactionCreateStepTwo";
import { User, DefaultPrivacyLevel } from "../models";

const sender: User = {
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

const receiver: User = {
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

describe("TransactionCreateStepTwo", () => {
  it("renders receiver name and form fields", () => {
    cy.mount(
      <TransactionCreateStepTwo
        receiver={receiver}
        sender={sender}
        createTransaction={cy.stub()}
        showSnackbar={cy.stub()}
      />
    );

    cy.contains("Jane Doe").should("be.visible");
    cy.get("[data-test='transaction-create-amount-input']").should("exist");
    cy.get("[data-test='transaction-create-description-input']").should("exist");
    cy.get("[data-test='transaction-create-submit-request']").should("be.disabled");
    cy.get("[data-test='transaction-create-submit-payment']").should("be.disabled");
  });

  it("enables buttons when amount and description are filled", () => {
    cy.mount(
      <TransactionCreateStepTwo
        receiver={receiver}
        sender={sender}
        createTransaction={cy.stub()}
        showSnackbar={cy.stub()}
      />
    );

    cy.get("#amount").type("50");
    cy.get("[data-test='transaction-create-description-input']").find("input").type("Test note");

    cy.get("[data-test='transaction-create-submit-request']").should("not.be.disabled");
    cy.get("[data-test='transaction-create-submit-payment']").should("not.be.disabled");
  });

  it("shows validation error for missing amount", () => {
    cy.mount(
      <TransactionCreateStepTwo
        receiver={receiver}
        sender={sender}
        createTransaction={cy.stub()}
        showSnackbar={cy.stub()}
      />
    );

    cy.get("[data-test='transaction-create-description-input']").find("input").type("Test note");
    cy.get("[data-test='transaction-create-submit-request']").should("be.disabled");
  });

  it("shows validation error for missing description", () => {
    cy.mount(
      <TransactionCreateStepTwo
        receiver={receiver}
        sender={sender}
        createTransaction={cy.stub()}
        showSnackbar={cy.stub()}
      />
    );

    cy.get("#amount").type("50");
    cy.get("[data-test='transaction-create-description-input']").find("input").focus().blur();
    cy.get("[data-test='transaction-create-submit-request']").should("be.disabled");
  });
});
