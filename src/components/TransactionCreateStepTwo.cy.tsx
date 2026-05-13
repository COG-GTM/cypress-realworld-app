import TransactionCreateStepTwo from "./TransactionCreateStepTwo";
import { User, DefaultPrivacyLevel } from "../models";

const sender: User = {
  id: "t45AiwidW",
  uuid: "6383f84e-b511-44c5-a835-3ece1d781fa8",
  firstName: "Edgar",
  lastName: "Johns",
  username: "Katharina_Bernier",
  password: "$2a$10$5PXHGtcsckWtAprT5/JmluhR13f16BL8SIGhvAKNP.Dhxkt69FfzW",
  email: "Norene39@yahoo.com",
  phoneNumber: "625-316-9882",
  avatar: "https://cypress-realworld-app-svgs.s3.amazonaws.com/t45AiwidW.svg",
  defaultPrivacyLevel: DefaultPrivacyLevel.public,
  balance: 168137,
  createdAt: new Date("2019-08-27T23:47:05.637Z"),
  modifiedAt: new Date("2020-05-21T11:02:22.857Z"),
};

const receiver: User = {
  id: "qywYp6hS0U",
  uuid: "b5e3e29d-1f97-4ed7-a7ae-e1b7e1e4f536",
  firstName: "Devon",
  lastName: "Becker",
  username: "Tavares_Barrows",
  password: "$2a$10$5PXHGtcsckWtAprT5/JmluhR13f16BL8SIGhvAKNP.Dhxkt69FfzW",
  email: "Aniya_Bernier@gmail.com",
  phoneNumber: "556-210-9052",
  avatar: "https://cypress-realworld-app-svgs.s3.amazonaws.com/qywYp6hS0U.svg",
  defaultPrivacyLevel: DefaultPrivacyLevel.public,
  balance: 120000,
  createdAt: new Date("2019-08-27T23:47:05.637Z"),
  modifiedAt: new Date("2020-05-21T11:02:22.857Z"),
};

describe("TransactionCreateStepTwo", () => {
  let createTransactionStub: ReturnType<typeof cy.stub>;
  let showSnackbarStub: ReturnType<typeof cy.stub>;

  beforeEach(() => {
    createTransactionStub = cy.stub();
    showSnackbarStub = cy.stub();
  });

  it("renders receiver name and avatar", () => {
    cy.mount(
      <TransactionCreateStepTwo
        receiver={receiver}
        sender={sender}
        createTransaction={createTransactionStub}
        showSnackbar={showSnackbarStub}
      />
    );
    cy.contains(`${receiver.firstName} ${receiver.lastName}`).should("be.visible");
    cy.get(`img[src="${receiver.avatar}"]`).should("exist");
  });

  it("submit buttons are disabled when form is empty", () => {
    cy.mount(
      <TransactionCreateStepTwo
        receiver={receiver}
        sender={sender}
        createTransaction={createTransactionStub}
        showSnackbar={showSnackbarStub}
      />
    );
    cy.get("[data-test=transaction-create-submit-request]").should("be.disabled");
    cy.get("[data-test=transaction-create-submit-payment]").should("be.disabled");
  });

  it("entering valid amount and description enables both buttons", () => {
    cy.mount(
      <TransactionCreateStepTwo
        receiver={receiver}
        sender={sender}
        createTransaction={createTransactionStub}
        showSnackbar={showSnackbarStub}
      />
    );
    cy.get("[data-test=transaction-create-amount-input] input").type("50");
    cy.get("[data-test=transaction-create-description-input] input").type("Test payment");
    cy.get("[data-test=transaction-create-submit-request]").should("not.be.disabled");
    cy.get("[data-test=transaction-create-submit-payment]").should("not.be.disabled");
  });

  it("clicking Pay calls createTransaction with transactionType payment", () => {
    cy.mount(
      <TransactionCreateStepTwo
        receiver={receiver}
        sender={sender}
        createTransaction={createTransactionStub}
        showSnackbar={showSnackbarStub}
      />
    );
    cy.get("[data-test=transaction-create-amount-input] input").type("50");
    cy.get("[data-test=transaction-create-description-input] input").type("Test payment");
    cy.get("[data-test=transaction-create-submit-payment]").click();
    cy.wrap(createTransactionStub).should("be.calledOnce");
    cy.wrap(createTransactionStub).should(
      "be.calledWithMatch",
      Cypress.sinon.match({ transactionType: "payment" })
    );
  });

  it("clicking Request calls createTransaction with transactionType request", () => {
    cy.mount(
      <TransactionCreateStepTwo
        receiver={receiver}
        sender={sender}
        createTransaction={createTransactionStub}
        showSnackbar={showSnackbarStub}
      />
    );
    cy.get("[data-test=transaction-create-amount-input] input").type("25");
    cy.get("[data-test=transaction-create-description-input] input").type("Test request");
    cy.get("[data-test=transaction-create-submit-request]").click();
    cy.wrap(createTransactionStub).should("be.calledOnce");
    cy.wrap(createTransactionStub).should(
      "be.calledWithMatch",
      Cypress.sinon.match({ transactionType: "request" })
    );
  });

  it("shows validation error for missing amount", () => {
    cy.mount(
      <TransactionCreateStepTwo
        receiver={receiver}
        sender={sender}
        createTransaction={createTransactionStub}
        showSnackbar={showSnackbarStub}
      />
    );
    cy.get("[data-test=transaction-create-amount-input] input").focus().blur();
    cy.contains("Please enter a valid amount").should("be.visible");
  });

  it("shows validation error for missing description", () => {
    cy.mount(
      <TransactionCreateStepTwo
        receiver={receiver}
        sender={sender}
        createTransaction={createTransactionStub}
        showSnackbar={showSnackbarStub}
      />
    );
    cy.get("[data-test=transaction-create-description-input] input").focus().blur();
    cy.contains("Please enter a note").should("be.visible");
  });
});
