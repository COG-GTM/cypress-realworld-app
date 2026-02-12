import BankAccountListItem from "./BankAccountItem";
import { BankAccount } from "../models";

describe("BankAccountListItem", () => {
  const bankAccount: BankAccount = {
    id: "bank-1",
    uuid: "uuid-1",
    userId: "user-1",
    bankName: "Chase Bank",
    accountNumber: "1234567890",
    routingNumber: "021000021",
    isDeleted: false,
    createdAt: new Date("2024-01-01"),
    modifiedAt: new Date("2024-01-01"),
  };

  const deletedBankAccount: BankAccount = {
    ...bankAccount,
    id: "bank-2",
    bankName: "Wells Fargo",
    isDeleted: true,
  };

  it("renders bank account details", () => {
    const deleteBankAccount = cy.stub();
    cy.mount(
      <BankAccountListItem bankAccount={bankAccount} deleteBankAccount={deleteBankAccount} />
    );
    cy.contains("Chase Bank").should("exist");
    cy.get("[data-test=bankaccount-delete]").should("exist");
  });

  it("shows delete button for active account", () => {
    const deleteBankAccount = cy.stub().as("deleteBankAccount");
    cy.mount(
      <BankAccountListItem bankAccount={bankAccount} deleteBankAccount={deleteBankAccount} />
    );
    cy.get("[data-test=bankaccount-delete]").should("exist").click();
    cy.get("@deleteBankAccount").should("have.been.calledWith", { id: "bank-1" });
  });

  it("hides delete button for deleted account", () => {
    const deleteBankAccount = cy.stub();
    cy.mount(
      <BankAccountListItem bankAccount={deletedBankAccount} deleteBankAccount={deleteBankAccount} />
    );
    cy.contains("Wells Fargo").should("exist");
    cy.contains("(Deleted)").should("exist");
    cy.get("[data-test=bankaccount-delete]").should("not.exist");
  });
});
