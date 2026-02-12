import BankAccountItem from "./BankAccountItem";
import { BankAccount } from "../models";

describe("BankAccountItem", () => {
  const bankAccount: BankAccount = {
    id: "ba-1",
    uuid: "uuid-1",
    userId: "user-1",
    bankName: "Chase Bank",
    accountNumber: "123456789",
    routingNumber: "987654321",
    isDeleted: false,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  it("renders bank account name", () => {
    const deleteBankAccount = cy.stub();
    cy.mount(<BankAccountItem bankAccount={bankAccount} deleteBankAccount={deleteBankAccount} />);

    cy.contains("Chase Bank").should("be.visible");
  });

  it("renders delete button for active accounts", () => {
    const deleteBankAccount = cy.stub();
    cy.mount(<BankAccountItem bankAccount={bankAccount} deleteBankAccount={deleteBankAccount} />);

    cy.get("[data-test=bankaccount-delete]").should("be.visible").and("contain", "Delete");
  });

  it("calls deleteBankAccount on delete click", () => {
    const deleteBankAccount = cy.stub();
    cy.mount(<BankAccountItem bankAccount={bankAccount} deleteBankAccount={deleteBankAccount} />);

    cy.get("[data-test=bankaccount-delete]").click();
    cy.wrap(deleteBankAccount).should("have.been.calledWith", { id: "ba-1" });
  });

  it("hides delete button for deleted accounts", () => {
    const deletedAccount: BankAccount = { ...bankAccount, isDeleted: true };
    const deleteBankAccount = cy.stub();
    cy.mount(
      <BankAccountItem bankAccount={deletedAccount} deleteBankAccount={deleteBankAccount} />
    );

    cy.get("[data-test=bankaccount-delete]").should("not.exist");
    cy.contains("(Deleted)").should("be.visible");
  });
});
