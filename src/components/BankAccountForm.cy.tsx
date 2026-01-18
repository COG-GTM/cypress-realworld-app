import { MemoryRouter } from "react-router-dom";
import BankAccountForm from "./BankAccountForm";

describe("BankAccountForm", () => {
  const userId = "test-user-id";

  describe("Form Rendering", () => {
    it("renders all form fields correctly", () => {
      const createBankAccount = cy.stub();
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-form]").should("be.visible");
      cy.get("[data-test=bankaccount-bankName-input]").should("be.visible");
      cy.get("[data-test=bankaccount-routingNumber-input]").should("be.visible");
      cy.get("[data-test=bankaccount-accountNumber-input]").should("be.visible");
      cy.get("[data-test=bankaccount-submit]").should("be.visible");
    });

    it("renders submit button as disabled initially", () => {
      const createBankAccount = cy.stub();
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-submit]").should("be.disabled");
    });

    it("renders input placeholders correctly", () => {
      const createBankAccount = cy.stub();
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-bankName-input] input").should(
        "have.attr",
        "placeholder",
        "Bank Name"
      );
      cy.get("[data-test=bankaccount-routingNumber-input] input").should(
        "have.attr",
        "placeholder",
        "Routing Number"
      );
      cy.get("[data-test=bankaccount-accountNumber-input] input").should(
        "have.attr",
        "placeholder",
        "Account Number"
      );
    });
  });

  describe("Bank Name Validation", () => {
    it("displays required error when bank name is cleared", () => {
      const createBankAccount = cy.stub();
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-bankName-input] input").type("Test");
      cy.get("[data-test=bankaccount-bankName-input] input").clear();
      cy.get("[data-test=bankaccount-bankName-input] input").blur();

      cy.get("#bankaccount-bankName-input-helper-text")
        .should("be.visible")
        .and("contain", "Enter a bank name");
    });

    it("displays minimum length error when bank name is too short", () => {
      const createBankAccount = cy.stub();
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-bankName-input] input").type("Test");
      cy.get("[data-test=bankaccount-bankName-input] input").blur();

      cy.get("#bankaccount-bankName-input-helper-text")
        .should("be.visible")
        .and("contain", "Must contain at least 5 characters");
    });

    it("clears error when valid bank name is entered", () => {
      const createBankAccount = cy.stub();
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-bankName-input] input").type("Test");
      cy.get("[data-test=bankaccount-bankName-input] input").blur();
      cy.get("#bankaccount-bankName-input-helper-text").should("be.visible");

      cy.get("[data-test=bankaccount-bankName-input] input").clear();
      cy.get("[data-test=bankaccount-bankName-input] input").type("Valid Bank Name");
      cy.get("[data-test=bankaccount-bankName-input] input").blur();

      cy.get("#bankaccount-bankName-input-helper-text").should("not.exist");
    });
  });

  describe("Routing Number Validation", () => {
    it("displays required error when routing number field is touched and left empty", () => {
      const createBankAccount = cy.stub();
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-routingNumber-input] input").focus();
      cy.get("[data-test=bankaccount-routingNumber-input] input").blur();

      cy.get("#bankaccount-routingNumber-input-helper-text")
        .should("be.visible")
        .and("contain", "Enter a valid bank routing number");
    });

    it("displays length error when routing number is not 9 digits", () => {
      const createBankAccount = cy.stub();
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-routingNumber-input] input").type("12345678");
      cy.get("[data-test=bankaccount-routingNumber-input] input").blur();

      cy.get("#bankaccount-routingNumber-input-helper-text")
        .should("be.visible")
        .and("contain", "Must contain a valid routing number");
    });

    it("clears error when valid 9-digit routing number is entered", () => {
      const createBankAccount = cy.stub();
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-routingNumber-input] input").type("12345678");
      cy.get("[data-test=bankaccount-routingNumber-input] input").blur();
      cy.get("#bankaccount-routingNumber-input-helper-text").should("be.visible");

      cy.get("[data-test=bankaccount-routingNumber-input] input").clear();
      cy.get("[data-test=bankaccount-routingNumber-input] input").type("123456789");
      cy.get("[data-test=bankaccount-routingNumber-input] input").blur();

      cy.get("#bankaccount-routingNumber-input-helper-text").should("not.exist");
    });

    it("displays error when routing number has more than 9 digits", () => {
      const createBankAccount = cy.stub();
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-routingNumber-input] input").type("1234567890");
      cy.get("[data-test=bankaccount-routingNumber-input] input").blur();

      cy.get("#bankaccount-routingNumber-input-helper-text")
        .should("be.visible")
        .and("contain", "Must contain a valid routing number");
    });
  });

  describe("Account Number Validation", () => {
    it("displays required error when account number field is touched and left empty", () => {
      const createBankAccount = cy.stub();
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-accountNumber-input] input").focus();
      cy.get("[data-test=bankaccount-accountNumber-input] input").blur();

      cy.get("#bankaccount-accountNumber-input-helper-text")
        .should("be.visible")
        .and("contain", "Enter a valid bank account number");
    });

    it("displays minimum length error when account number is less than 9 digits", () => {
      const createBankAccount = cy.stub();
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-accountNumber-input] input").type("12345678");
      cy.get("[data-test=bankaccount-accountNumber-input] input").blur();

      cy.get("#bankaccount-accountNumber-input-helper-text")
        .should("be.visible")
        .and("contain", "Must contain at least 9 digits");
    });

    it("clears error when valid account number with 9 digits is entered", () => {
      const createBankAccount = cy.stub();
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-accountNumber-input] input").type("12345678");
      cy.get("[data-test=bankaccount-accountNumber-input] input").blur();
      cy.get("#bankaccount-accountNumber-input-helper-text").should("be.visible");

      cy.get("[data-test=bankaccount-accountNumber-input] input").clear();
      cy.get("[data-test=bankaccount-accountNumber-input] input").type("123456789");
      cy.get("[data-test=bankaccount-accountNumber-input] input").blur();

      cy.get("#bankaccount-accountNumber-input-helper-text").should("not.exist");
    });

    it("accepts account number with 12 digits (maximum)", () => {
      const createBankAccount = cy.stub();
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-accountNumber-input] input").type("123456789012");
      cy.get("[data-test=bankaccount-accountNumber-input] input").blur();

      cy.get("#bankaccount-accountNumber-input-helper-text").should("not.exist");
    });

    it("displays maximum length error when account number exceeds 12 digits", () => {
      const createBankAccount = cy.stub();
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-accountNumber-input] input").type("1234567890123");
      cy.get("[data-test=bankaccount-accountNumber-input] input").blur();

      cy.get("#bankaccount-accountNumber-input-helper-text")
        .should("be.visible")
        .and("contain", "Must contain no more than 12 digits");
    });
  });

  describe("Form Submission", () => {
    it("enables submit button when all fields are valid", () => {
      const createBankAccount = cy.stub();
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-submit]").should("be.disabled");

      cy.get("[data-test=bankaccount-bankName-input] input").type("The Best Bank");
      cy.get("[data-test=bankaccount-routingNumber-input] input").type("123456789");
      cy.get("[data-test=bankaccount-accountNumber-input] input").type("987654321");

      cy.get("[data-test=bankaccount-submit]").should("not.be.disabled");
    });

    it("calls createBankAccount with correct payload on form submission", () => {
      const createBankAccount = cy.stub().as("createBankAccount");
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-bankName-input] input").type("The Best Bank");
      cy.get("[data-test=bankaccount-routingNumber-input] input").type("123456789");
      cy.get("[data-test=bankaccount-accountNumber-input] input").type("987654321");
      cy.get("[data-test=bankaccount-submit]").click();

      cy.get("@createBankAccount").should("have.been.calledOnce");
      cy.get("@createBankAccount").should("have.been.calledWith", {
        userId: userId,
        bankName: "The Best Bank",
        routingNumber: "123456789",
        accountNumber: "987654321",
      });
    });

    it("keeps submit button disabled when form has validation errors", () => {
      const createBankAccount = cy.stub();
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-bankName-input] input").type("Test");
      cy.get("[data-test=bankaccount-routingNumber-input] input").type("12345678");
      cy.get("[data-test=bankaccount-accountNumber-input] input").type("12345678");

      cy.get("[data-test=bankaccount-submit]").should("be.disabled");
    });
  });

  describe("Edge Cases", () => {
    it("handles form with onboarding prop", () => {
      const createBankAccount = cy.stub().as("createBankAccount");
      cy.mount(
        <MemoryRouter>
          <BankAccountForm
            userId={userId}
            createBankAccount={createBankAccount}
            onboarding={true}
          />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-bankName-input] input").type("The Best Bank");
      cy.get("[data-test=bankaccount-routingNumber-input] input").type("123456789");
      cy.get("[data-test=bankaccount-accountNumber-input] input").type("987654321");
      cy.get("[data-test=bankaccount-submit]").click();

      cy.get("@createBankAccount").should("have.been.calledOnce");
    });

    it("displays multiple validation errors simultaneously", () => {
      const createBankAccount = cy.stub();
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-bankName-input] input").type("Test");
      cy.get("[data-test=bankaccount-bankName-input] input").blur();
      cy.get("[data-test=bankaccount-routingNumber-input] input").type("12345");
      cy.get("[data-test=bankaccount-routingNumber-input] input").blur();
      cy.get("[data-test=bankaccount-accountNumber-input] input").type("12345");
      cy.get("[data-test=bankaccount-accountNumber-input] input").blur();

      cy.get("#bankaccount-bankName-input-helper-text")
        .should("be.visible")
        .and("contain", "Must contain at least 5 characters");
      cy.get("#bankaccount-routingNumber-input-helper-text")
        .should("be.visible")
        .and("contain", "Must contain a valid routing number");
      cy.get("#bankaccount-accountNumber-input-helper-text")
        .should("be.visible")
        .and("contain", "Must contain at least 9 digits");

      cy.get("[data-test=bankaccount-submit]").should("be.disabled");
    });
  });
});
