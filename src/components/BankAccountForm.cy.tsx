import { MemoryRouter } from "react-router-dom";
import BankAccountForm from "./BankAccountForm";

describe("BankAccountForm", () => {
  const userId = "test-user-id";

  it("renders the bank account form with all fields", () => {
    const createBankAccountSpy = cy.spy().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccountSpy} />
      </MemoryRouter>
    );

    cy.get("[data-test='bankaccount-form']").should("be.visible");
    cy.get("[data-test='bankaccount-bankName-input']").should("be.visible");
    cy.get("[data-test='bankaccount-routingNumber-input']").should("be.visible");
    cy.get("[data-test='bankaccount-accountNumber-input']").should("be.visible");
    cy.get("[data-test='bankaccount-submit']").should("be.visible");
  });

  it("displays bank name minimum length error when typing short value", () => {
    const createBankAccountSpy = cy.spy().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccountSpy} />
      </MemoryRouter>
    );

    // Type a short value - error shows because value changed from initial
    cy.get("#bankaccount-bankName-input").type("Bank");
    cy.get("#bankaccount-bankName-input-helper-text")
      .should("be.visible")
      .and("contain", "Must contain at least 5 characters");
  });

  it("displays routing number length error when typing invalid value", () => {
    const createBankAccountSpy = cy.spy().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccountSpy} />
      </MemoryRouter>
    );

    cy.get("#bankaccount-routingNumber-input").type("12345");
    cy.get("#bankaccount-routingNumber-input-helper-text")
      .should("be.visible")
      .and("contain", "Must contain a valid routing number");
  });

  it("displays account number minimum length error when typing short value", () => {
    const createBankAccountSpy = cy.spy().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccountSpy} />
      </MemoryRouter>
    );

    cy.get("#bankaccount-accountNumber-input").type("12345");
    cy.get("#bankaccount-accountNumber-input-helper-text")
      .should("be.visible")
      .and("contain", "Must contain at least 9 digits");
  });

  it("displays account number maximum length error when typing long value", () => {
    const createBankAccountSpy = cy.spy().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccountSpy} />
      </MemoryRouter>
    );

    cy.get("#bankaccount-accountNumber-input").type("1234567890123");
    cy.get("#bankaccount-accountNumber-input-helper-text")
      .should("be.visible")
      .and("contain", "Must contain no more than 12 digits");
  });

  it("submit button is enabled when all fields are valid", () => {
    const createBankAccountSpy = cy.spy().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccountSpy} />
      </MemoryRouter>
    );

    cy.get("#bankaccount-bankName-input").type("Test Bank");
    cy.get("#bankaccount-routingNumber-input").type("123456789");
    cy.get("#bankaccount-accountNumber-input").type("123456789");

    cy.get("[data-test='bankaccount-submit']").should("not.be.disabled");
  });

  it("calls createBankAccount with form data on submit", () => {
    const createBankAccountSpy = cy.spy().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccountSpy} />
      </MemoryRouter>
    );

    cy.get("#bankaccount-bankName-input").type("Test Bank");
    cy.get("#bankaccount-routingNumber-input").type("123456789");
    cy.get("#bankaccount-accountNumber-input").type("987654321");
    cy.get("[data-test='bankaccount-submit']").click();

    cy.get("@createBankAccount").should("have.been.calledOnce");
    cy.get("@createBankAccount").should("have.been.calledWith", {
      userId: userId,
      bankName: "Test Bank",
      routingNumber: "123456789",
      accountNumber: "987654321",
    });
  });

  it("renders in onboarding mode", () => {
    const createBankAccountSpy = cy.spy().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm
          userId={userId}
          createBankAccount={createBankAccountSpy}
          onboarding={true}
        />
      </MemoryRouter>
    );

    cy.get("[data-test='bankaccount-form']").should("be.visible");
  });
});
