import { MemoryRouter } from "react-router-dom";
import BankAccountForm from "./BankAccountForm";

describe("BankAccountForm", () => {
  it("validates inputs and submits payload", () => {
    const createBankAccount = cy.stub().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId="user123" createBankAccount={createBankAccount} onboarding={true} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-form]").should("exist");

    cy.get("[data-test=bankaccount-bankName-input]").type("Test Bank");
    cy.get("[data-test=bankaccount-routingNumber-input]").type("123456789");
    cy.get("[data-test=bankaccount-accountNumber-input]").type("123456789");

    cy.get("[data-test=bankaccount-submit]").should("not.be.disabled").click();

    cy.get("@createBankAccount").should("have.been.calledOnce");
    cy.get("@createBankAccount").should("have.been.calledWithMatch", {
      userId: "user123",
      bankName: "Test Bank",
      routingNumber: "123456789",
      accountNumber: "123456789",
    });
  });
});
