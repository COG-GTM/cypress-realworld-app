import TransactionCreateStepTwo from "./TransactionCreateStepTwo";
import { User } from "../models";

const sender: User = {
  id: "sender1",
  uuid: "uuid-s1",
  firstName: "John",
  lastName: "Doe",
  username: "johndoe",
  password: "hashed",
  email: "john@example.com",
  phoneNumber: "555-0001",
  avatar: "https://example.com/avatar1.png",
  defaultPrivacyLevel: "public",
  balance: 100000,
  createdAt: new Date(),
  modifiedAt: new Date(),
};

const receiver: User = {
  id: "receiver1",
  uuid: "uuid-r1",
  firstName: "Jane",
  lastName: "Smith",
  username: "janesmith",
  password: "hashed",
  email: "jane@example.com",
  phoneNumber: "555-0002",
  avatar: "https://example.com/avatar2.png",
  defaultPrivacyLevel: "public",
  balance: 50000,
  createdAt: new Date(),
  modifiedAt: new Date(),
};

describe("TransactionCreateStepTwo", () => {
  it("renders receiver info and form fields", () => {
    cy.mount(
      <TransactionCreateStepTwo
        receiver={receiver}
        sender={sender}
        createTransaction={cy.stub()}
        showSnackbar={cy.stub()}
      />
    );

    cy.contains("Jane Smith").should("exist");
    cy.get("[data-test=transaction-create-amount-input]").should("exist");
    cy.get("[data-test=transaction-create-description-input]").should("exist");
    cy.get("[data-test=transaction-create-submit-request]").should("exist");
    cy.get("[data-test=transaction-create-submit-payment]").should("exist");
  });

  it("submits a payment with amount and note", () => {
    const createTransaction = cy.stub().as("createTransaction");
    const showSnackbar = cy.stub().as("showSnackbar");

    cy.mount(
      <TransactionCreateStepTwo
        receiver={receiver}
        sender={sender}
        createTransaction={createTransaction}
        showSnackbar={showSnackbar}
      />
    );

    cy.get("#amount").type("50");
    cy.get("[data-test=transaction-create-description-input] input").type("Lunch");
    cy.get("[data-test=transaction-create-submit-payment]").click();

    cy.get("@createTransaction").should("have.been.calledOnce");
    cy.get("@showSnackbar").should("have.been.calledOnce");
  });

  it("submits a request with amount and note", () => {
    const createTransaction = cy.stub().as("createTransaction");
    const showSnackbar = cy.stub().as("showSnackbar");

    cy.mount(
      <TransactionCreateStepTwo
        receiver={receiver}
        sender={sender}
        createTransaction={createTransaction}
        showSnackbar={showSnackbar}
      />
    );

    cy.get("#amount").type("25");
    cy.get("[data-test=transaction-create-description-input] input").type("Dinner");
    cy.get("[data-test=transaction-create-submit-request]").click();

    cy.get("@createTransaction").should("have.been.calledOnce");
  });
});
