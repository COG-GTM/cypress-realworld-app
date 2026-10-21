import { MemoryRouter } from "react-router-dom";
import BankAccountForm from "./BankAccountForm";

describe("BankAccountForm", () => {
  const userId = "t45AiwidW";

  const fillForm = () => {
    cy.get("[data-test=bankaccount-bankName-input] input").type("The Best Bank");
    cy.get("[data-test=bankaccount-routingNumber-input] input").type("987654321");
    cy.get("[data-test=bankaccount-accountNumber-input] input").type("123456789");
  };

  it("submits the bank account with the user id", () => {
    const createBankAccount = cy.spy().as("createBankAccount");
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
      </MemoryRouter>
    );

    fillForm();
    cy.get("[data-test=bankaccount-submit]").should("be.enabled").click();

    cy.get("@createBankAccount").should("have.been.calledOnceWith", {
      userId,
      bankName: "The Best Bank",
      routingNumber: "987654321",
      accountNumber: "123456789",
    });
  });

  it("submits during onboarding without navigating away", () => {
    const createBankAccount = cy.spy().as("createBankAccount");
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccount} onboarding />
      </MemoryRouter>
    );

    fillForm();
    cy.get("[data-test=bankaccount-submit]").click();

    cy.get("@createBankAccount").should("have.been.calledOnce");
    cy.get("[data-test=bankaccount-form]").should("exist");
  });

  it("displays validation errors and disables submit", () => {
    const createBankAccount = cy.spy().as("createBankAccount");
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-bankName-input] input").type("Bank").blur();
    cy.get("#bankaccount-bankName-input-helper-text").should(
      "contain",
      "Must contain at least 5 characters"
    );

    cy.get("[data-test=bankaccount-routingNumber-input] input").type("12345").blur();
    cy.get("#bankaccount-routingNumber-input-helper-text").should(
      "contain",
      "Must contain a valid routing number"
    );

    cy.get("[data-test=bankaccount-accountNumber-input] input").type("12345").blur();
    cy.get("#bankaccount-accountNumber-input-helper-text").should(
      "contain",
      "Must contain at least 9 digits"
    );

    cy.get("[data-test=bankaccount-accountNumber-input] input")
      .clear()
      .type("1234567890123")
      .blur();
    cy.get("#bankaccount-accountNumber-input-helper-text").should(
      "contain",
      "Must contain no more than 12 digits"
    );

    cy.get("[data-test=bankaccount-submit]").should("be.disabled");
    cy.get("@createBankAccount").should("not.have.been.called");
  });

  it("displays required errors when fields are cleared", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={cy.spy()} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-bankName-input] input").focus().blur();
    cy.get("#bankaccount-bankName-input-helper-text").should("contain", "Enter a bank name");
    cy.get("[data-test=bankaccount-routingNumber-input] input").focus().blur();
    cy.get("#bankaccount-routingNumber-input-helper-text").should(
      "contain",
      "Enter a valid bank routing number"
    );
    cy.get("[data-test=bankaccount-accountNumber-input] input").focus().blur();
    cy.get("#bankaccount-accountNumber-input-helper-text").should(
      "contain",
      "Enter a valid bank account number"
    );
  });
});
