import BankAccountListItem from "./BankAccountItem";
import { BankAccount } from "../models";

const activeBankAccount: BankAccount = {
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
  id: "bank-2",
  uuid: "uuid-2",
  userId: "user-1",
  bankName: "Wells Fargo",
  accountNumber: "0987654321",
  routingNumber: "121000248",
  isDeleted: true,
  createdAt: new Date("2024-01-02"),
  modifiedAt: new Date("2024-01-02"),
};

describe("BankAccountListItem", () => {
  it("renders bank account details", () => {
    const deleteBankAccount = cy.stub();
    cy.mount(
      <BankAccountListItem bankAccount={activeBankAccount} deleteBankAccount={deleteBankAccount} />
    );
    cy.get(`[data-test=bankaccount-list-item-${activeBankAccount.id}]`)
      .should("exist")
      .and("contain", "Chase Bank");
  });

  it("shows delete button for active account", () => {
    const deleteBankAccount = cy.stub();
    cy.mount(
      <BankAccountListItem bankAccount={activeBankAccount} deleteBankAccount={deleteBankAccount} />
    );
    cy.get("[data-test=bankaccount-delete]").should("exist").and("contain", "Delete");
  });

  it("calls deleteBankAccount on delete button click", () => {
    const deleteBankAccount = cy.stub();
    cy.mount(
      <BankAccountListItem bankAccount={activeBankAccount} deleteBankAccount={deleteBankAccount} />
    );
    cy.get("[data-test=bankaccount-delete]")
      .click()
      .then(() => {
        expect(deleteBankAccount).to.have.been.calledWith({ id: activeBankAccount.id });
      });
  });

  it("hides delete button for deleted account", () => {
    const deleteBankAccount = cy.stub();
    cy.mount(
      <BankAccountListItem bankAccount={deletedBankAccount} deleteBankAccount={deleteBankAccount} />
    );
    cy.get("[data-test=bankaccount-delete]").should("not.exist");
    cy.get(`[data-test=bankaccount-list-item-${deletedBankAccount.id}]`).should(
      "contain",
      "(Deleted)"
    );
  });
});
