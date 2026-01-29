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

  it("displays bank name minimum length error", () => {
    const createBankAccountSpy = cy.spy().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccountSpy} />
      </MemoryRouter>
    );

    cy.get("[data-test='bankaccount-bankName-input']").type("Bank");
    cy.get("[data-test='bankaccount-bankName-input']").blur();
    cy.get("#bankaccount-bankName-input-helper-text")
      .should("be.visible")
      .and("contain", "Must contain at least 5 characters");
  });

  it("displays bank name required error when field is cleared", () => {
    const createBankAccountSpy = cy.spy().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccountSpy} />
      </MemoryRouter>
    );

    cy.get("[data-test='bankaccount-bankName-input']").type("Test Bank");
    cy.get("[data-test='bankaccount-bankName-input']").clear().blur();
    cy.get("#bankaccount-bankName-input-helper-text")
      .should("be.visible")
      .and("contain", "Enter a bank name");
  });

  it("displays routing number length error", () => {
    const createBankAccountSpy = cy.spy().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccountSpy} />
      </MemoryRouter>
    );

    cy.get("[data-test='bankaccount-routingNumber-input']").type("12345");
    cy.get("[data-test='bankaccount-routingNumber-input']").blur();
    cy.get("#bankaccount-routingNumber-input-helper-text")
      .should("be.visible")
      .and("contain", "Must contain a valid routing number");
  });

  it("displays routing number required error when field is cleared", () => {
    const createBankAccountSpy = cy.spy().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccountSpy} />
      </MemoryRouter>
    );

    cy.get("[data-test='bankaccount-routingNumber-input']").type("123456789");
    cy.get("[data-test='bankaccount-routingNumber-input']").clear().blur();
    cy.get("#bankaccount-routingNumber-input-helper-text")
      .should("be.visible")
      .and("contain", "Enter a valid bank routing number");
  });

  it("displays account number minimum length error", () => {
    const createBankAccountSpy = cy.spy().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccountSpy} />
      </MemoryRouter>
    );

    cy.get("[data-test='bankaccount-accountNumber-input']").type("12345");
    cy.get("[data-test='bankaccount-accountNumber-input']").blur();
    cy.get("#bankaccount-accountNumber-input-helper-text")
      .should("be.visible")
      .and("contain", "Must contain at least 9 digits");
  });

  it("displays account number maximum length error", () => {
    const createBankAccountSpy = cy.spy().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccountSpy} />
      </MemoryRouter>
    );

    cy.get("[data-test='bankaccount-accountNumber-input']").type("1234567890123");
    cy.get("[data-test='bankaccount-accountNumber-input']").blur();
    cy.get("#bankaccount-accountNumber-input-helper-text")
      .should("be.visible")
      .and("contain", "Must contain no more than 12 digits");
  });

  it("displays account number required error when field is cleared", () => {
    const createBankAccountSpy = cy.spy().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccountSpy} />
      </MemoryRouter>
    );

    cy.get("[data-test='bankaccount-accountNumber-input']").type("123456789");
    cy.get("[data-test='bankaccount-accountNumber-input']").clear().blur();
    cy.get("#bankaccount-accountNumber-input-helper-text")
      .should("be.visible")
      .and("contain", "Enter a valid bank account number");
  });

  it("submit button is disabled when form has validation errors", () => {
    const createBankAccountSpy = cy.spy().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccountSpy} />
      </MemoryRouter>
    );

    cy.get("[data-test='bankaccount-submit']").should("be.disabled");

    cy.get("[data-test='bankaccount-bankName-input']").type("Test Bank");
    cy.get("[data-test='bankaccount-submit']").should("be.disabled");

    cy.get("[data-test='bankaccount-routingNumber-input']").type("123456789");
    cy.get("[data-test='bankaccount-submit']").should("be.disabled");
  });

  it("submit button is enabled when all fields are valid", () => {
    const createBankAccountSpy = cy.spy().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccountSpy} />
      </MemoryRouter>
    );

    cy.get("[data-test='bankaccount-bankName-input']").type("Test Bank");
    cy.get("[data-test='bankaccount-routingNumber-input']").type("123456789");
    cy.get("[data-test='bankaccount-accountNumber-input']").type("123456789");

    cy.get("[data-test='bankaccount-submit']").should("not.be.disabled");
  });

  it("calls createBankAccount with form data on submit", () => {
    const createBankAccountSpy = cy.spy().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccountSpy} />
      </MemoryRouter>
    );

    cy.get("[data-test='bankaccount-bankName-input']").type("Test Bank");
    cy.get("[data-test='bankaccount-routingNumber-input']").type("123456789");
    cy.get("[data-test='bankaccount-accountNumber-input']").type("987654321");
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
