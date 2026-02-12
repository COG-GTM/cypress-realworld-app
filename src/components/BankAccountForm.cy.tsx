import { MemoryRouter } from "react-router-dom";
import BankAccountForm from "./BankAccountForm";

describe("BankAccountForm", () => {
  const userId = "t45AiwidW";

  it("renders form fields", () => {
    const createBankAccount = cy.stub();
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
      </MemoryRouter>
    );
    cy.get("[data-test=bankaccount-bankName-input]").should("be.visible");
    cy.get("[data-test=bankaccount-routingNumber-input]").should("be.visible");
    cy.get("[data-test=bankaccount-accountNumber-input]").should("be.visible");
    cy.get("[data-test=bankaccount-submit]").should("be.visible");
  });

  it("shows validation errors for empty required fields", () => {
    const createBankAccount = cy.stub();
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
      </MemoryRouter>
    );
    cy.get("[data-test=bankaccount-bankName-input]").find("input").focus().blur();
    cy.get("[data-test=bankaccount-form]").should("contain", "Enter a bank name");

    cy.get("[data-test=bankaccount-routingNumber-input]").find("input").focus().blur();
    cy.get("[data-test=bankaccount-form]").should("contain", "Enter a valid bank routing number");

    cy.get("[data-test=bankaccount-accountNumber-input]").find("input").focus().blur();
    cy.get("[data-test=bankaccount-form]").should("contain", "Enter a valid bank account number");
  });

  it("shows error for short bank name", () => {
    const createBankAccount = cy.stub();
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
      </MemoryRouter>
    );
    cy.get("[data-test=bankaccount-bankName-input]").find("input").type("AB");
    cy.get("[data-test=bankaccount-bankName-input]").find("input").blur();
    cy.get("[data-test=bankaccount-form]").should("contain", "Must contain at least 5 characters");
  });

  it("shows error for invalid routing number length", () => {
    const createBankAccount = cy.stub();
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
      </MemoryRouter>
    );
    cy.get("[data-test=bankaccount-routingNumber-input]").find("input").type("12345");
    cy.get("[data-test=bankaccount-routingNumber-input]").find("input").blur();
    cy.get("[data-test=bankaccount-form]").should("contain", "Must contain a valid routing number");
  });

  it("shows error for invalid account number length", () => {
    const createBankAccount = cy.stub();
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
      </MemoryRouter>
    );
    cy.get("[data-test=bankaccount-accountNumber-input]").find("input").type("1234");
    cy.get("[data-test=bankaccount-accountNumber-input]").find("input").blur();
    cy.get("[data-test=bankaccount-form]").should("contain", "Must contain at least 9 digits");
  });

  it("submits the form with valid data", () => {
    const createBankAccount = cy.stub().as("createBankAccount");
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
      </MemoryRouter>
    );
    cy.get("[data-test=bankaccount-bankName-input]").find("input").type("Test Bank");
    cy.get("[data-test=bankaccount-routingNumber-input]").find("input").type("123456789");
    cy.get("[data-test=bankaccount-accountNumber-input]").find("input").type("987654321");

    cy.get("[data-test=bankaccount-submit]").should("not.be.disabled");
    cy.get("[data-test=bankaccount-submit]").click();

    cy.get("@createBankAccount").should("have.been.calledOnce");
    cy.get("@createBankAccount").should(
      "have.been.calledWithMatch",
      Cypress.sinon.match({
        userId: "t45AiwidW",
        bankName: "Test Bank",
        routingNumber: "123456789",
        accountNumber: "987654321",
      })
    );
  });
});
