import { MemoryRouter } from "react-router-dom";
import BankAccountForm from "./BankAccountForm";

describe("BankAccountForm", () => {
  const userId = "test-user-id";

  it("renders all input fields and a disabled submit button", () => {
    const createBankAccount = cy.stub().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-bankName-input]").should("be.visible");
    cy.get("[data-test=bankaccount-routingNumber-input]").should("be.visible");
    cy.get("[data-test=bankaccount-accountNumber-input]").should("be.visible");

    // Formik does not run validation on mount, so touch each empty field to
    // trigger validation and disable the submit button.
    cy.get("[data-test=bankaccount-bankName-input]").find("input").focus().blur();
    cy.get("[data-test=bankaccount-routingNumber-input]").find("input").focus().blur();
    cy.get("[data-test=bankaccount-accountNumber-input]").find("input").focus().blur();
    cy.get("[data-test=bankaccount-submit]").should("be.disabled");
  });

  it("enables submit button when all fields are valid", () => {
    const createBankAccount = cy.stub().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-bankName-input]").type("Test Bank");
    cy.get("[data-test=bankaccount-routingNumber-input]").type("123456789");
    cy.get("[data-test=bankaccount-accountNumber-input]").type("987654321");

    cy.get("[data-test=bankaccount-submit]").should("not.be.disabled");
  });

  it("shows bankName validation errors", () => {
    const createBankAccount = cy.stub().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-bankName-input]").type("Ab");
    cy.get("[data-test=bankaccount-bankName-input]").find("input").blur();
    cy.get("#bankaccount-bankName-input-helper-text")
      .should("be.visible")
      .and("contain", "Must contain at least 5 characters");

    cy.get("[data-test=bankaccount-bankName-input]").find("input").clear();
    cy.get("[data-test=bankaccount-bankName-input]").find("input").blur();
    cy.get("#bankaccount-bankName-input-helper-text")
      .should("be.visible")
      .and("contain", "Enter a bank name");
  });

  it("shows routingNumber validation errors", () => {
    const createBankAccount = cy.stub().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-routingNumber-input]").type("12345678");
    cy.get("[data-test=bankaccount-routingNumber-input]").find("input").blur();
    cy.get("#bankaccount-routingNumber-input-helper-text")
      .should("be.visible")
      .and("contain", "Must contain a valid routing number");

    cy.get("[data-test=bankaccount-routingNumber-input]").find("input").clear();
    cy.get("[data-test=bankaccount-routingNumber-input]").find("input").blur();
    cy.get("#bankaccount-routingNumber-input-helper-text")
      .should("be.visible")
      .and("contain", "Enter a valid bank routing number");
  });

  it("shows accountNumber validation errors", () => {
    const createBankAccount = cy.stub().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-accountNumber-input]").type("12345678");
    cy.get("[data-test=bankaccount-accountNumber-input]").find("input").blur();
    cy.get("#bankaccount-accountNumber-input-helper-text")
      .should("be.visible")
      .and("contain", "Must contain at least 9 digits");

    cy.get("[data-test=bankaccount-accountNumber-input]").find("input").clear();
    cy.get("[data-test=bankaccount-accountNumber-input]").type("1234567890123");
    cy.get("[data-test=bankaccount-accountNumber-input]").find("input").blur();
    cy.get("#bankaccount-accountNumber-input-helper-text")
      .should("be.visible")
      .and("contain", "Must contain no more than 12 digits");

    cy.get("[data-test=bankaccount-accountNumber-input]").find("input").clear();
    cy.get("[data-test=bankaccount-accountNumber-input]").find("input").blur();
    cy.get("#bankaccount-accountNumber-input-helper-text")
      .should("be.visible")
      .and("contain", "Enter a valid bank account number");
  });

  it("calls createBankAccount with form values on submit", () => {
    const createBankAccount = cy.stub().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-bankName-input]").type("Test Bank");
    cy.get("[data-test=bankaccount-routingNumber-input]").type("123456789");
    cy.get("[data-test=bankaccount-accountNumber-input]").type("987654321");

    cy.get("[data-test=bankaccount-submit]").click();

    cy.get("@createBankAccount").should("have.been.calledOnce");
    cy.get("@createBankAccount").should("have.been.calledWith", {
      userId: "test-user-id",
      bankName: "Test Bank",
      routingNumber: "123456789",
      accountNumber: "987654321",
    });
  });

  it("does not navigate away when onboarding is true", () => {
    const createBankAccount = cy.stub().as("createBankAccount");

    cy.mount(
      <MemoryRouter initialEntries={["/bankaccounts/new"]}>
        <BankAccountForm userId={userId} createBankAccount={createBankAccount} onboarding={true} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-bankName-input]").type("Test Bank");
    cy.get("[data-test=bankaccount-routingNumber-input]").type("123456789");
    cy.get("[data-test=bankaccount-accountNumber-input]").type("987654321");

    cy.get("[data-test=bankaccount-submit]").click();

    cy.get("@createBankAccount").should("have.been.calledOnce");
    cy.get("[data-test=bankaccount-form]").should("exist");
  });
});
