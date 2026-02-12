import BankAccountItem from "./BankAccountItem";
import { BankAccount } from "../models";

describe("BankAccountItem", () => {
  it("renders bank account and calls delete", () => {
    const deleteBankAccount = cy.spy().as("deleteBankAccount");

    const bankAccount: BankAccount = {
      id: "ba1",
      uuid: "bau1",
      userId: "u1",
      bankName: "Chase",
      accountNumber: "1234",
      routingNumber: "5678",
      isDeleted: false,
      createdAt: new Date(),
      modifiedAt: new Date(),
    } as any;

    cy.mount(<BankAccountItem bankAccount={bankAccount} deleteBankAccount={deleteBankAccount} />);

    cy.get("[data-test=bankaccount-list-item-ba1]").should("exist");
    cy.contains("Chase").should("exist");

    cy.get("[data-test=bankaccount-delete]").click();
    cy.get("@deleteBankAccount").should("have.been.calledWith", { id: "ba1" });
  });

  it("hides delete for deleted bank account", () => {
    const deleteBankAccount = cy.spy().as("deleteBankAccount");

    const bankAccount: BankAccount = {
      id: "ba2",
      uuid: "bau2",
      userId: "u1",
      bankName: "Bank",
      accountNumber: "1234",
      routingNumber: "5678",
      isDeleted: true,
      createdAt: new Date(),
      modifiedAt: new Date(),
    } as any;

    cy.mount(<BankAccountItem bankAccount={bankAccount} deleteBankAccount={deleteBankAccount} />);

    cy.contains("(Deleted)").should("exist");
    cy.get("[data-test=bankaccount-delete]").should("not.exist");
  });
});
