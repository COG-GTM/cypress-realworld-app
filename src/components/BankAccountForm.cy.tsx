import { MemoryRouter } from "react-router-dom";
import BankAccountForm from "./BankAccountForm";

describe("BankAccountForm", () => {
  const userId = "test-user-id";

  it("renders all three input fields and a submit button", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={() => {}} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-bankName-input]").should("be.visible");
    cy.get("[data-test=bankaccount-routingNumber-input]").should("be.visible");
    cy.get("[data-test=bankaccount-accountNumber-input]").should("be.visible");
    cy.get("[data-test=bankaccount-submit]").should("be.visible");
  });

  it("disables submit button when form is empty", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={() => {}} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-bankName-input] input").focus().blur();

    cy.get("[data-test=bankaccount-submit]").should("be.disabled");
  });

  it("shows 'Must contain at least 5 characters' when bank name is too short", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={() => {}} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-bankName-input]").type("Bank");
    cy.get("[data-test=bankaccount-routingNumber-input]").click();

    cy.get("[data-test=bankaccount-form]").should(
      "contain.text",
      "Must contain at least 5 characters"
    );
    cy.get("[data-test=bankaccount-submit]").should("be.disabled");
  });

  it("shows 'Must contain a valid routing number' when routing number is the wrong length", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={() => {}} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-routingNumber-input]").type("12345");
    cy.get("[data-test=bankaccount-bankName-input]").click();

    cy.get("[data-test=bankaccount-form]").should(
      "contain.text",
      "Must contain a valid routing number"
    );
    cy.get("[data-test=bankaccount-submit]").should("be.disabled");
  });

  it("shows 'Must contain at least 9 digits' when account number is too short", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={() => {}} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-accountNumber-input]").type("12345");
    cy.get("[data-test=bankaccount-bankName-input]").click();

    cy.get("[data-test=bankaccount-form]").should("contain.text", "Must contain at least 9 digits");
    cy.get("[data-test=bankaccount-submit]").should("be.disabled");
  });

  it("enables the submit button when all fields are valid", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={() => {}} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-bankName-input]").type("My Bank");
    cy.get("[data-test=bankaccount-routingNumber-input]").type("123456789");
    cy.get("[data-test=bankaccount-accountNumber-input]").type("987654321");

    cy.get("[data-test=bankaccount-submit]").should("not.be.disabled");
  });

  it("calls createBankAccount with the form values when submitted", () => {
    const createBankAccount = cy.stub().as("createBankAccount");

    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccount} onboarding />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-bankName-input]").type("My Bank");
    cy.get("[data-test=bankaccount-routingNumber-input]").type("123456789");
    cy.get("[data-test=bankaccount-accountNumber-input]").type("987654321");
    cy.get("[data-test=bankaccount-submit]").click();

    cy.get("@createBankAccount").should("have.been.calledWithMatch", {
      userId,
      bankName: "My Bank",
      routingNumber: "123456789",
      accountNumber: "987654321",
    });
  });

  it("does not navigate away when onboarding is true", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={() => {}} onboarding />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-bankName-input]").type("My Bank");
    cy.get("[data-test=bankaccount-routingNumber-input]").type("123456789");
    cy.get("[data-test=bankaccount-accountNumber-input]").type("987654321");
    cy.get("[data-test=bankaccount-submit]").click();

    cy.get("[data-test=bankaccount-form]").should("be.visible");
  });

  it("shows 'Must contain no more than 12 digits' when account number exceeds 12 digits", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={() => {}} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-accountNumber-input]").type("1234567890123");
    cy.get("[data-test=bankaccount-bankName-input]").click();

    cy.get("[data-test=bankaccount-form]").should(
      "contain.text",
      "Must contain no more than 12 digits"
    );
    cy.get("[data-test=bankaccount-submit]").should("be.disabled");
  });

  it("shows 'Enter a bank name' on focus + blur of an empty bank name field", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={() => {}} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-bankName-input] input").focus().blur();

    cy.get("[data-test=bankaccount-form]").should("contain.text", "Enter a bank name");
  });

  it("shows 'Enter a valid bank routing number' on focus + blur of an empty routing number field", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={() => {}} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-routingNumber-input] input").focus().blur();

    cy.get("[data-test=bankaccount-form]").should(
      "contain.text",
      "Enter a valid bank routing number"
    );
  });

  it("shows 'Enter a valid bank account number' on focus + blur of an empty account number field", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={() => {}} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-accountNumber-input] input").focus().blur();

    cy.get("[data-test=bankaccount-form]").should(
      "contain.text",
      "Enter a valid bank account number"
    );
  });

  it("accepts a bank name that is exactly 5 characters", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={() => {}} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-bankName-input]").type("Chase");
    cy.get("[data-test=bankaccount-routingNumber-input]").click();

    cy.get("[data-test=bankaccount-form]").should(
      "not.contain.text",
      "Must contain at least 5 characters"
    );
  });

  it("rejects a bank name that is exactly 4 characters", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={() => {}} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-bankName-input]").type("Banc");
    cy.get("[data-test=bankaccount-routingNumber-input]").click();

    cy.get("[data-test=bankaccount-form]").should(
      "contain.text",
      "Must contain at least 5 characters"
    );
    cy.get("[data-test=bankaccount-submit]").should("be.disabled");
  });

  it("accepts an account number that is exactly 12 digits", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={() => {}} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-accountNumber-input]").type("123456789012");
    cy.get("[data-test=bankaccount-bankName-input]").click();

    cy.get("[data-test=bankaccount-form]").should(
      "not.contain.text",
      "Must contain no more than 12 digits"
    );
    cy.get("[data-test=bankaccount-form]").should(
      "not.contain.text",
      "Must contain at least 9 digits"
    );
  });

  it("rejects a routing number that is 8 characters long", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={() => {}} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-routingNumber-input]").type("12345678");
    cy.get("[data-test=bankaccount-bankName-input]").click();

    cy.get("[data-test=bankaccount-form]").should(
      "contain.text",
      "Must contain a valid routing number"
    );
    cy.get("[data-test=bankaccount-submit]").should("be.disabled");
  });

  it("rejects a routing number that is 10 characters long", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={() => {}} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-routingNumber-input]").type("1234567890");
    cy.get("[data-test=bankaccount-bankName-input]").click();

    cy.get("[data-test=bankaccount-form]").should(
      "contain.text",
      "Must contain a valid routing number"
    );
    cy.get("[data-test=bankaccount-submit]").should("be.disabled");
  });

  it("clears the error and re-enables submit when an invalid input is corrected", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={() => {}} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-bankName-input]").type("Bank");
    cy.get("[data-test=bankaccount-routingNumber-input]").type("123456789");
    cy.get("[data-test=bankaccount-accountNumber-input]").type("987654321");

    cy.get("[data-test=bankaccount-form]").should(
      "contain.text",
      "Must contain at least 5 characters"
    );
    cy.get("[data-test=bankaccount-submit]").should("be.disabled");

    cy.get("[data-test=bankaccount-bankName-input]").type(" of America");

    cy.get("[data-test=bankaccount-form]").should(
      "not.contain.text",
      "Must contain at least 5 characters"
    );
    cy.get("[data-test=bankaccount-submit]").should("not.be.disabled");
  });

  it("shows multiple validation errors simultaneously", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={() => {}} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-bankName-input]").type("Bank");
    cy.get("[data-test=bankaccount-routingNumber-input]").type("12345");
    cy.get("[data-test=bankaccount-accountNumber-input]").type("123");
    cy.get("[data-test=bankaccount-form]").click();

    cy.get("[data-test=bankaccount-form]")
      .should("contain.text", "Must contain at least 5 characters")
      .and("contain.text", "Must contain a valid routing number")
      .and("contain.text", "Must contain at least 9 digits");
  });

  it("shows no errors for untouched empty fields on initial render", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={() => {}} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-form]").should("not.contain.text", "Enter a bank name");
    cy.get("[data-test=bankaccount-form]").should(
      "not.contain.text",
      "Enter a valid bank routing number"
    );
    cy.get("[data-test=bankaccount-form]").should(
      "not.contain.text",
      "Enter a valid bank account number"
    );
    cy.get("[data-test=bankaccount-form]").should(
      "not.contain.text",
      "Must contain at least 5 characters"
    );
    cy.get("[data-test=bankaccount-form]").should(
      "not.contain.text",
      "Must contain a valid routing number"
    );
    cy.get("[data-test=bankaccount-form]").should(
      "not.contain.text",
      "Must contain at least 9 digits"
    );
  });

  it("disables the submit button after clicking submit (isSubmitting = true)", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={() => {}} onboarding />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-bankName-input]").type("My Bank");
    cy.get("[data-test=bankaccount-routingNumber-input]").type("123456789");
    cy.get("[data-test=bankaccount-accountNumber-input]").type("987654321");

    cy.get("[data-test=bankaccount-submit]").should("not.be.disabled").click();
    cy.get("[data-test=bankaccount-submit]").should("be.disabled");
  });

  it("uses the correct placeholder text for each input", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={() => {}} />
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

  it("labels the submit button 'Save'", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={() => {}} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-submit]").should("contain.text", "Save");
  });
});
