import { MemoryRouter } from "react-router-dom";
import BankAccountForm from "./BankAccountForm";

describe("BankAccountForm", () => {
  const userId = "t45AiwidW";
  let createBankAccountStub: ReturnType<typeof cy.stub>;

  beforeEach(() => {
    createBankAccountStub = cy.stub();
  });

  it("submit button disabled when form has validation errors", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
      </MemoryRouter>
    );
    cy.get("[data-test=bankaccount-bankName-input] input").type("B").clear().blur();
    cy.get("[data-test=bankaccount-submit]").should("be.disabled");
  });

  it("validates bankName must have at least 5 characters", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
      </MemoryRouter>
    );
    cy.get("[data-test=bankaccount-bankName-input] input").type("Bank").blur();
    cy.contains("Must contain at least 5 characters").should("be.visible");
  });

  it("validates routingNumber must be exactly 9 characters", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
      </MemoryRouter>
    );
    cy.get("[data-test=bankaccount-routingNumber-input] input").type("12345").blur();
    cy.contains("Must contain a valid routing number").should("be.visible");
  });

  it("validates accountNumber must be 9-12 digits", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
      </MemoryRouter>
    );
    cy.get("[data-test=bankaccount-accountNumber-input] input").type("1234").blur();
    cy.contains("Must contain at least 9 digits").should("be.visible");
  });

  it("valid submission calls createBankAccount with correct payload", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
      </MemoryRouter>
    );
    cy.get("[data-test=bankaccount-bankName-input] input").type("Test Bank");
    cy.get("[data-test=bankaccount-routingNumber-input] input").type("123456789");
    cy.get("[data-test=bankaccount-accountNumber-input] input").type("123456789012");
    cy.get("[data-test=bankaccount-submit]").should("not.be.disabled").click();
    cy.wrap(createBankAccountStub).should("be.calledOnce");
    cy.wrap(createBankAccountStub).should(
      "be.calledWithMatch",
      Cypress.sinon.match({
        userId,
        bankName: "Test Bank",
        routingNumber: "123456789",
        accountNumber: "123456789012",
      })
    );
  });

  it("shows inline error messages for each invalid field", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
      </MemoryRouter>
    );
    cy.get("[data-test=bankaccount-bankName-input] input").focus().blur();
    cy.get("[data-test=bankaccount-routingNumber-input] input").focus().blur();
    cy.get("[data-test=bankaccount-accountNumber-input] input").focus().blur();
    cy.contains("Enter a bank name").should("be.visible");
    cy.contains("Enter a valid bank routing number").should("be.visible");
    cy.contains("Enter a valid bank account number").should("be.visible");
  });
});
