import { MemoryRouter } from "react-router-dom";
import BankAccountForm from "./BankAccountForm";

describe("BankAccountForm", () => {
  const userId = "test-user-id";
  let createBankAccountStub: ReturnType<typeof cy.stub>;

  beforeEach(() => {
    createBankAccountStub = cy.stub().as("createBankAccount");
  });

  describe("Form Rendering", () => {
    it("renders the form with all required fields", () => {
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-form]").should("exist");
      cy.get("[data-test=bankaccount-bankName-input]").should("exist");
      cy.get("[data-test=bankaccount-routingNumber-input]").should("exist");
      cy.get("[data-test=bankaccount-accountNumber-input]").should("exist");
      cy.get("[data-test=bankaccount-submit]").should("exist");
    });

    it("renders input fields with correct placeholders", () => {
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
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

    it("submit button is disabled when form has empty required fields", () => {
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-bankName-input] input").focus().blur();
      cy.get("[data-test=bankaccount-submit]").should("be.disabled");
    });
  });

  describe("Bank Name Validation", () => {
    it("shows required error when bank name is cleared", () => {
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-bankName-input] input").type("Test");
      cy.get("[data-test=bankaccount-bankName-input] input").clear();
      cy.get("[data-test=bankaccount-bankName-input] input").blur();

      cy.get("#bankaccount-bankName-input-helper-text")
        .should("be.visible")
        .and("contain", "Enter a bank name");
    });

    it("shows minimum length error when bank name is less than 5 characters", () => {
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-bankName-input] input").type("Test");
      cy.get("[data-test=bankaccount-bankName-input] input").blur();

      cy.get("#bankaccount-bankName-input-helper-text")
        .should("be.visible")
        .and("contain", "Must contain at least 5 characters");
    });

    it("does not show error when bank name has 5 or more characters", () => {
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-bankName-input] input").type("Valid Bank");
      cy.get("[data-test=bankaccount-bankName-input] input").blur();

      cy.get("#bankaccount-bankName-input-helper-text").should("not.exist");
    });
  });

  describe("Routing Number Validation", () => {
    it("shows required error when routing number field is touched and empty", () => {
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-routingNumber-input] input").focus();
      cy.get("[data-test=bankaccount-routingNumber-input] input").blur();

      cy.get("#bankaccount-routingNumber-input-helper-text")
        .should("be.visible")
        .and("contain", "Enter a valid bank routing number");
    });

    it("shows length error when routing number is not 9 digits", () => {
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-routingNumber-input] input").type("12345678");
      cy.get("[data-test=bankaccount-routingNumber-input] input").blur();

      cy.get("#bankaccount-routingNumber-input-helper-text")
        .should("be.visible")
        .and("contain", "Must contain a valid routing number");
    });

    it("does not show error when routing number is exactly 9 digits", () => {
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-routingNumber-input] input").type("123456789");
      cy.get("[data-test=bankaccount-routingNumber-input] input").blur();

      cy.get("#bankaccount-routingNumber-input-helper-text").should("not.exist");
    });

    it("shows error when routing number has more than 9 digits", () => {
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
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
    it("shows required error when account number field is touched and empty", () => {
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-accountNumber-input] input").focus();
      cy.get("[data-test=bankaccount-accountNumber-input] input").blur();

      cy.get("#bankaccount-accountNumber-input-helper-text")
        .should("be.visible")
        .and("contain", "Enter a valid bank account number");
    });

    it("shows minimum length error when account number is less than 9 digits", () => {
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-accountNumber-input] input").type("12345678");
      cy.get("[data-test=bankaccount-accountNumber-input] input").blur();

      cy.get("#bankaccount-accountNumber-input-helper-text")
        .should("be.visible")
        .and("contain", "Must contain at least 9 digits");
    });

    it("does not show error when account number has 9 digits", () => {
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-accountNumber-input] input").type("123456789");
      cy.get("[data-test=bankaccount-accountNumber-input] input").blur();

      cy.get("#bankaccount-accountNumber-input-helper-text").should("not.exist");
    });

    it("does not show error when account number has 12 digits (max allowed)", () => {
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-accountNumber-input] input").type("123456789012");
      cy.get("[data-test=bankaccount-accountNumber-input] input").blur();

      cy.get("#bankaccount-accountNumber-input-helper-text").should("not.exist");
    });

    it("shows maximum length error when account number has more than 12 digits", () => {
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
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
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-bankName-input] input").type("The Best Bank");
      cy.get("[data-test=bankaccount-routingNumber-input] input").type("987654321");
      cy.get("[data-test=bankaccount-accountNumber-input] input").type("123456789");

      cy.get("[data-test=bankaccount-submit]").should("not.be.disabled");
    });

    it("calls createBankAccount with correct payload on form submission", () => {
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
        </MemoryRouter>
      );

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

    it("keeps submit button disabled when form has validation errors", () => {
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-bankName-input] input").type("Bad");
      cy.get("[data-test=bankaccount-routingNumber-input] input").type("12345");
      cy.get("[data-test=bankaccount-accountNumber-input] input").type("1234");

      cy.get("[data-test=bankaccount-submit]").should("be.disabled");
    });
  });

  describe("Edge Cases", () => {
    it("handles special characters in bank name", () => {
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-bankName-input] input").type("Bank & Trust Co.");
      cy.get("[data-test=bankaccount-bankName-input] input").blur();

      cy.get("#bankaccount-bankName-input-helper-text").should("not.exist");
    });

    it("handles bank name with exactly 5 characters (boundary)", () => {
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-bankName-input] input").type("ABCDE");
      cy.get("[data-test=bankaccount-bankName-input] input").blur();

      cy.get("#bankaccount-bankName-input-helper-text").should("not.exist");
    });

    it("handles account number with exactly 9 digits (minimum boundary)", () => {
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-accountNumber-input] input").type("123456789");
      cy.get("[data-test=bankaccount-accountNumber-input] input").blur();

      cy.get("#bankaccount-accountNumber-input-helper-text").should("not.exist");
    });

    it("handles multiple validation errors simultaneously", () => {
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-bankName-input] input").type("Bad");
      cy.get("[data-test=bankaccount-bankName-input] input").blur();
      cy.get("[data-test=bankaccount-routingNumber-input] input").type("123");
      cy.get("[data-test=bankaccount-routingNumber-input] input").blur();
      cy.get("[data-test=bankaccount-accountNumber-input] input").type("123");
      cy.get("[data-test=bankaccount-accountNumber-input] input").blur();

      cy.get("#bankaccount-bankName-input-helper-text").should("be.visible");
      cy.get("#bankaccount-routingNumber-input-helper-text").should("be.visible");
      cy.get("#bankaccount-accountNumber-input-helper-text").should("be.visible");
      cy.get("[data-test=bankaccount-submit]").should("be.disabled");
    });

    it("clears validation errors when valid input is provided", () => {
      cy.mount(
        <MemoryRouter>
          <BankAccountForm userId={userId} createBankAccount={createBankAccountStub} />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-bankName-input] input").type("Bad");
      cy.get("[data-test=bankaccount-bankName-input] input").blur();
      cy.get("#bankaccount-bankName-input-helper-text").should("be.visible");

      cy.get("[data-test=bankaccount-bankName-input] input").clear();
      cy.get("[data-test=bankaccount-bankName-input] input").type("Valid Bank Name");
      cy.get("[data-test=bankaccount-bankName-input] input").blur();

      cy.get("#bankaccount-bankName-input-helper-text").should("not.exist");
    });
  });

  describe("Onboarding Mode", () => {
    it("renders correctly in onboarding mode", () => {
      cy.mount(
        <MemoryRouter>
          <BankAccountForm
            userId={userId}
            createBankAccount={createBankAccountStub}
            onboarding={true}
          />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-form]").should("exist");
      cy.get("[data-test=bankaccount-bankName-input]").should("exist");
      cy.get("[data-test=bankaccount-routingNumber-input]").should("exist");
      cy.get("[data-test=bankaccount-accountNumber-input]").should("exist");
    });

    it("calls createBankAccount on submission in onboarding mode", () => {
      cy.mount(
        <MemoryRouter>
          <BankAccountForm
            userId={userId}
            createBankAccount={createBankAccountStub}
            onboarding={true}
          />
        </MemoryRouter>
      );

      cy.get("[data-test=bankaccount-bankName-input] input").type("The Best Bank");
      cy.get("[data-test=bankaccount-routingNumber-input] input").type("987654321");
      cy.get("[data-test=bankaccount-accountNumber-input] input").type("123456789");
      cy.get("[data-test=bankaccount-submit]").click();

      cy.get("@createBankAccount").should("have.been.calledOnce");
    });
  });
});
