import { MemoryRouter } from "react-router-dom";
import BankAccountForm from "./BankAccountForm";

describe("BankAccountForm", () => {
  const userId = "test-user-id";
  let createBankAccount: ReturnType<typeof cy.stub>;

  beforeEach(() => {
    createBankAccount = cy.stub().as("createBankAccount");
  });

  const mountComponent = (onboarding = false) => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm
          userId={userId}
          createBankAccount={createBankAccount}
          onboarding={onboarding}
        />
      </MemoryRouter>
    );
  };

  describe("Form Rendering", () => {
    it("renders all form fields", () => {
      mountComponent();

      cy.get("[data-test=bankaccount-form]").should("exist");
      cy.get("[data-test=bankaccount-bankName-input]").should("exist");
      cy.get("[data-test=bankaccount-routingNumber-input]").should("exist");
      cy.get("[data-test=bankaccount-accountNumber-input]").should("exist");
      cy.get("[data-test=bankaccount-submit]").should("exist");
    });

    it("has correct placeholder text for each field", () => {
      mountComponent();

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

    it("submit button is initially disabled", () => {
      mountComponent();

      cy.get("[data-test=bankaccount-submit]").should("be.disabled");
    });
  });

  describe("Bank Name Validation", () => {
    it("shows required error when bank name is cleared after typing", () => {
      mountComponent();

      cy.get("[data-test=bankaccount-bankName-input] input").type("Test");
      cy.get("[data-test=bankaccount-bankName-input] input").clear();
      cy.get("[data-test=bankaccount-bankName-input] input").blur();

      cy.get("#bankaccount-bankName-input-helper-text")
        .should("be.visible")
        .and("contain", "Enter a bank name");
    });

    it("shows minimum length error when bank name is less than 5 characters", () => {
      mountComponent();

      cy.get("[data-test=bankaccount-bankName-input] input").type("Test");
      cy.get("[data-test=bankaccount-bankName-input] input").blur();

      cy.get("#bankaccount-bankName-input-helper-text")
        .should("be.visible")
        .and("contain", "Must contain at least 5 characters");
    });

    it("does not show error when bank name has 5 or more characters", () => {
      mountComponent();

      cy.get("[data-test=bankaccount-bankName-input] input").type("Valid Bank");
      cy.get("[data-test=bankaccount-bankName-input] input").blur();

      cy.get("#bankaccount-bankName-input-helper-text").should("not.exist");
    });
  });

  describe("Routing Number Validation", () => {
    it("shows required error when routing number field is touched and left empty", () => {
      mountComponent();

      cy.get("[data-test=bankaccount-routingNumber-input] input").focus();
      cy.get("[data-test=bankaccount-routingNumber-input] input").blur();

      cy.get("#bankaccount-routingNumber-input-helper-text")
        .should("be.visible")
        .and("contain", "Enter a valid bank routing number");
    });

    it("shows length error when routing number is not exactly 9 digits", () => {
      mountComponent();

      cy.get("[data-test=bankaccount-routingNumber-input] input").type("12345678");
      cy.get("[data-test=bankaccount-routingNumber-input] input").blur();

      cy.get("#bankaccount-routingNumber-input-helper-text")
        .should("be.visible")
        .and("contain", "Must contain a valid routing number");
    });

    it("shows length error when routing number is more than 9 digits", () => {
      mountComponent();

      cy.get("[data-test=bankaccount-routingNumber-input] input").type("1234567890");
      cy.get("[data-test=bankaccount-routingNumber-input] input").blur();

      cy.get("#bankaccount-routingNumber-input-helper-text")
        .should("be.visible")
        .and("contain", "Must contain a valid routing number");
    });

    it("does not show error when routing number is exactly 9 digits", () => {
      mountComponent();

      cy.get("[data-test=bankaccount-routingNumber-input] input").type("123456789");
      cy.get("[data-test=bankaccount-routingNumber-input] input").blur();

      cy.get("#bankaccount-routingNumber-input-helper-text").should("not.exist");
    });
  });

  describe("Account Number Validation", () => {
    it("shows required error when account number field is touched and left empty", () => {
      mountComponent();

      cy.get("[data-test=bankaccount-accountNumber-input] input").focus();
      cy.get("[data-test=bankaccount-accountNumber-input] input").blur();

      cy.get("#bankaccount-accountNumber-input-helper-text")
        .should("be.visible")
        .and("contain", "Enter a valid bank account number");
    });

    it("shows minimum length error when account number is less than 9 digits", () => {
      mountComponent();

      cy.get("[data-test=bankaccount-accountNumber-input] input").type("12345678");
      cy.get("[data-test=bankaccount-accountNumber-input] input").blur();

      cy.get("#bankaccount-accountNumber-input-helper-text")
        .should("be.visible")
        .and("contain", "Must contain at least 9 digits");
    });

    it("does not show error when account number has 9 digits", () => {
      mountComponent();

      cy.get("[data-test=bankaccount-accountNumber-input] input").type("123456789");
      cy.get("[data-test=bankaccount-accountNumber-input] input").blur();

      cy.get("#bankaccount-accountNumber-input-helper-text").should("not.exist");
    });

    it("does not show error when account number has 12 digits (max allowed)", () => {
      mountComponent();

      cy.get("[data-test=bankaccount-accountNumber-input] input").type("123456789012");
      cy.get("[data-test=bankaccount-accountNumber-input] input").blur();

      cy.get("#bankaccount-accountNumber-input-helper-text").should("not.exist");
    });

    it("shows maximum length error when account number is more than 12 digits", () => {
      mountComponent();

      cy.get("[data-test=bankaccount-accountNumber-input] input").type("1234567890123");
      cy.get("[data-test=bankaccount-accountNumber-input] input").blur();

      cy.get("#bankaccount-accountNumber-input-helper-text")
        .should("be.visible")
        .and("contain", "Must contain no more than 12 digits");
    });
  });

  describe("Form Submission", () => {
    it("enables submit button when all fields are valid", () => {
      mountComponent();

      cy.get("[data-test=bankaccount-bankName-input] input").type("Valid Bank Name");
      cy.get("[data-test=bankaccount-routingNumber-input] input").type("123456789");
      cy.get("[data-test=bankaccount-accountNumber-input] input").type("987654321");

      cy.get("[data-test=bankaccount-submit]").should("not.be.disabled");
    });

    it("calls createBankAccount with correct payload on form submission", () => {
      mountComponent();

      cy.get("[data-test=bankaccount-bankName-input] input").type("The Best Bank");
      cy.get("[data-test=bankaccount-routingNumber-input] input").type("987654321");
      cy.get("[data-test=bankaccount-accountNumber-input] input").type("123456789");
      cy.get("[data-test=bankaccount-submit]").click();

      cy.get("@createBankAccount").should("have.been.calledOnce");
      cy.get("@createBankAccount").should("have.been.calledWith", {
        userId: userId,
        bankName: "The Best Bank",
        routingNumber: "987654321",
        accountNumber: "123456789",
      });
    });

    it("submit button remains disabled when form has validation errors", () => {
      mountComponent();

      cy.get("[data-test=bankaccount-bankName-input] input").type("Bad");
      cy.get("[data-test=bankaccount-routingNumber-input] input").type("12345678");
      cy.get("[data-test=bankaccount-accountNumber-input] input").type("1234567890123");

      cy.get("[data-test=bankaccount-submit]").should("be.disabled");
    });
  });

  describe("Edge Cases", () => {
    it("shows error again when valid field is cleared", () => {
      mountComponent();

      cy.get("[data-test=bankaccount-bankName-input] input").type("Valid Bank");
      cy.get("[data-test=bankaccount-bankName-input] input").blur();
      cy.get("#bankaccount-bankName-input-helper-text").should("not.exist");

      cy.get("[data-test=bankaccount-bankName-input] input").clear();
      cy.get("[data-test=bankaccount-bankName-input] input").blur();
      cy.get("#bankaccount-bankName-input-helper-text")
        .should("be.visible")
        .and("contain", "Enter a bank name");
    });

    it("keeps submit disabled with partial form completion", () => {
      mountComponent();

      cy.get("[data-test=bankaccount-bankName-input] input").type("Valid Bank Name");
      cy.get("[data-test=bankaccount-routingNumber-input] input").type("123456789");

      cy.get("[data-test=bankaccount-submit]").should("be.disabled");
    });

    it("disables submit button after clicking submit", () => {
      mountComponent();

      cy.get("[data-test=bankaccount-bankName-input] input").type("Valid Bank Name");
      cy.get("[data-test=bankaccount-routingNumber-input] input").type("123456789");
      cy.get("[data-test=bankaccount-accountNumber-input] input").type("987654321");
      cy.get("[data-test=bankaccount-submit]").click();

      cy.get("[data-test=bankaccount-submit]").should("be.disabled");
    });
  });

  describe("Onboarding Mode", () => {
    it("renders correctly in onboarding mode", () => {
      mountComponent(true);

      cy.get("[data-test=bankaccount-form]").should("exist");
      cy.get("[data-test=bankaccount-bankName-input]").should("exist");
      cy.get("[data-test=bankaccount-routingNumber-input]").should("exist");
      cy.get("[data-test=bankaccount-accountNumber-input]").should("exist");
      cy.get("[data-test=bankaccount-submit]").should("exist");
    });

    it("calls createBankAccount in onboarding mode", () => {
      mountComponent(true);

      cy.get("[data-test=bankaccount-bankName-input] input").type("Onboarding Bank");
      cy.get("[data-test=bankaccount-routingNumber-input] input").type("123456789");
      cy.get("[data-test=bankaccount-accountNumber-input] input").type("987654321");
      cy.get("[data-test=bankaccount-submit]").click();

      cy.get("@createBankAccount").should("have.been.calledOnce");
      cy.get("@createBankAccount").should("have.been.calledWith", {
        userId: userId,
        bankName: "Onboarding Bank",
        routingNumber: "123456789",
        accountNumber: "987654321",
      });
    });
  });
});
