import { MemoryRouter } from "react-router-dom";
import BankAccountForm from "./BankAccountForm";

describe("BankAccountForm", () => {
  let createBankAccount: ReturnType<typeof cy.stub>;
  const userId = "t45AiwidW";

  beforeEach(() => {
    createBankAccount = cy.stub();
  });

  it("renders form fields", () => {
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

  it("validates required fields", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-bankName-input]").find("input").type("a").clear();
    cy.get("[data-test=bankaccount-routingNumber-input]").find("input").focus();
    cy.get("#bankaccount-bankName-input-helper-text").should("contain", "Enter a bank name");

    cy.get("[data-test=bankaccount-routingNumber-input]").find("input").type("1").clear();
    cy.get("[data-test=bankaccount-accountNumber-input]").find("input").focus();
    cy.get("#bankaccount-routingNumber-input-helper-text").should(
      "contain",
      "Enter a valid bank routing number"
    );

    cy.get("[data-test=bankaccount-accountNumber-input]").find("input").type("1").clear();
    cy.get("[data-test=bankaccount-bankName-input]").find("input").focus();
    cy.get("#bankaccount-accountNumber-input-helper-text").should(
      "contain",
      "Enter a valid bank account number"
    );
  });

  it("validates minimum lengths", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-bankName-input]").find("input").type("abc");
    cy.get("[data-test=bankaccount-routingNumber-input]").find("input").focus();
    cy.get("#bankaccount-bankName-input-helper-text").should(
      "contain",
      "Must contain at least 5 characters"
    );

    cy.get("[data-test=bankaccount-routingNumber-input]").find("input").type("12345");
    cy.get("[data-test=bankaccount-accountNumber-input]").find("input").focus();
    cy.get("#bankaccount-routingNumber-input-helper-text").should(
      "contain",
      "Must contain a valid routing number"
    );

    cy.get("[data-test=bankaccount-accountNumber-input]").find("input").type("1234");
    cy.get("[data-test=bankaccount-bankName-input]").find("input").focus();
    cy.get("#bankaccount-accountNumber-input-helper-text").should(
      "contain",
      "Must contain at least 9 digits"
    );
  });

  it("submits with valid data", () => {
    cy.mount(
      <MemoryRouter>
        <BankAccountForm userId={userId} createBankAccount={createBankAccount} />
      </MemoryRouter>
    );

    cy.get("[data-test=bankaccount-bankName-input]").find("input").type("Test Bank");
    cy.get("[data-test=bankaccount-routingNumber-input]").find("input").type("123456789");
    cy.get("[data-test=bankaccount-accountNumber-input]").find("input").type("123456789");
    cy.get("[data-test=bankaccount-submit]").should("not.be.disabled").click();

    cy.wrap(createBankAccount).should("be.calledOnce");
    cy.wrap(createBankAccount).should("be.calledWithMatch", {
      userId: "t45AiwidW",
      bankName: "Test Bank",
      routingNumber: "123456789",
      accountNumber: "123456789",
    });
  });
});
