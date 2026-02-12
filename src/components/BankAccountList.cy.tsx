import BankAccountList from "./BankAccountList";
import { BankAccount } from "../models";

describe("BankAccountList", () => {
  const bankAccounts: BankAccount[] = [
    {
      id: "ba-1",
      uuid: "uuid-1",
      userId: "user-1",
      bankName: "Chase Bank",
      accountNumber: "123456789",
      routingNumber: "987654321",
      isDeleted: false,
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
    {
      id: "ba-2",
      uuid: "uuid-2",
      userId: "user-1",
      bankName: "Wells Fargo",
      accountNumber: "111222333",
      routingNumber: "444555666",
      isDeleted: false,
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
  ];

  it("renders list of bank accounts", () => {
    const deleteBankAccount = cy.stub();
    cy.mount(
      <BankAccountList bankAccounts={bankAccounts} deleteBankAccount={deleteBankAccount} />
    );

    cy.get("[data-test=bankaccount-list]").should("be.visible");
    cy.get("[data-test*=bankaccount-list-item]").should("have.length", 2);
    cy.contains("Chase Bank").should("be.visible");
    cy.contains("Wells Fargo").should("be.visible");
  });

  it("renders empty state when no bank accounts", () => {
    const deleteBankAccount = cy.stub();
    cy.mount(
      <BankAccountList bankAccounts={[]} deleteBankAccount={deleteBankAccount} />
    );

    cy.get("[data-test=bankaccount-list]").should("not.exist");
    cy.contains("No Bank Accounts").should("be.visible");
  });
});
