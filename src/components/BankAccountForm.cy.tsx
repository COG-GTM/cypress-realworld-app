import { MemoryRouter } from "react-router-dom";
import BankAccountForm from "./BankAccountForm";

describe("BankAccountForm", () => {
  it("renders form fields", () => {
    const createBankAccount = cy.stub();
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId="user-1" createBankAccount={createBankAccount} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-bankName-input]").should("be.visible");
    cy.get("[data-test=bankaccount-routingNumber-input]").should("be.visible");
    cy.get("[data-test=bankaccount-accountNumber-input]").should("be.visible");
    cy.get("[data-test=bankaccount-submit]").should("be.visible");
  });

  it("validates bank name minimum length", () => {
    const createBankAccount = cy.stub();
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId="user-1" createBankAccount={createBankAccount} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-bankName-input]").type("AB");
    cy.get("[data-test=bankaccount-routingNumber-input]").click();
    cy.contains("Must contain at least 5 characters").should("be.visible");
  });

  it("validates routing number length", () => {
    const createBankAccount = cy.stub();
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId="user-1" createBankAccount={createBankAccount} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-routingNumber-input]").type("123");
    cy.get("[data-test=bankaccount-bankName-input]").click();
    cy.contains("Must contain a valid routing number").should("be.visible");
  });

  it("enables submit with valid input", () => {
    const createBankAccount = cy.stub();
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId="user-1" createBankAccount={createBankAccount} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-bankName-input]").type("Chase Bank");
    cy.get("[data-test=bankaccount-routingNumber-input]").type("123456789");
    cy.get("[data-test=bankaccount-accountNumber-input]").type("987654321");
    cy.get("[data-test=bankaccount-submit]").should("not.be.disabled");
  });
});
