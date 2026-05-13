import BankAccountListItem from "./BankAccountItem";
import { BankAccount } from "../models";

describe("BankAccountItem", () => {
  let deleteBankAccountStub: ReturnType<typeof cy.stub>;

  beforeEach(() => {
    deleteBankAccountStub = cy.stub();
  });

  it("renders bank account name and delete button", () => {
    const bankAccount: BankAccount = {
      id: "ba1",
      uuid: "ba-uuid-1",
      userId: "user1",
      bankName: "Test Bank",
      accountNumber: "123456789",
      routingNumber: "987654321",
      isDeleted: false,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    cy.mount(
      <BankAccountListItem bankAccount={bankAccount} deleteBankAccount={deleteBankAccountStub} />
    );
    cy.get(`[data-test=bankaccount-list-item-${bankAccount.id}]`).should(
      "contain",
      "Test Bank"
    );
    cy.get("[data-test=bankaccount-delete]").should("be.visible");
  });

  it("delete button calls deleteBankAccount with correct id", () => {
    const bankAccount: BankAccount = {
      id: "ba1",
      uuid: "ba-uuid-1",
      userId: "user1",
      bankName: "Test Bank",
      accountNumber: "123456789",
      routingNumber: "987654321",
      isDeleted: false,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    cy.mount(
      <BankAccountListItem bankAccount={bankAccount} deleteBankAccount={deleteBankAccountStub} />
    );
    cy.get("[data-test=bankaccount-delete]").click();
    cy.wrap(deleteBankAccountStub).should(
      "be.calledWithMatch",
      Cypress.sinon.match({ id: bankAccount.id })
    );
  });

  it("deleted bank account shows (Deleted) and hides delete button", () => {
    const deletedAccount: BankAccount = {
      id: "ba2",
      uuid: "ba-uuid-2",
      userId: "user1",
      bankName: "Old Bank",
      accountNumber: "123456789",
      routingNumber: "987654321",
      isDeleted: true,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    cy.mount(
      <BankAccountListItem
        bankAccount={deletedAccount}
        deleteBankAccount={deleteBankAccountStub}
      />
    );
    cy.get(`[data-test=bankaccount-list-item-${deletedAccount.id}]`).should(
      "contain",
      "(Deleted)"
    );
    cy.get("[data-test=bankaccount-delete]").should("not.exist");
  });
});
