import BankAccountList from "./BankAccountList";
import { BankAccount } from "../models";

describe("BankAccountList", () => {
  it("renders list of bank accounts", () => {
    const deleteBankAccount = cy.spy().as("deleteBankAccount");

    const bankAccounts: BankAccount[] = [
      {
        id: "ba1",
        uuid: "bau1",
        userId: "u1",
        bankName: "Chase",
        accountNumber: "1234",
        routingNumber: "5678",
        isDeleted: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
      } as any,
      {
        id: "ba2",
        uuid: "bau2",
        userId: "u1",
        bankName: "Wells",
        accountNumber: "9999",
        routingNumber: "0000",
        isDeleted: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
      } as any,
    ];

    cy.mount(
      <BankAccountList bankAccounts={bankAccounts} deleteBankAccount={deleteBankAccount} />
    );

    cy.get("[data-test=bankaccount-list]").should("exist");
    cy.get("[data-test=bankaccount-list-item-ba1]").should("exist");
    cy.get("[data-test=bankaccount-list-item-ba2]").should("exist");
  });

  it("renders empty state", () => {
    const deleteBankAccount = cy.spy().as("deleteBankAccount");

    cy.mount(<BankAccountList bankAccounts={[]} deleteBankAccount={deleteBankAccount} />);

    cy.contains("No Bank Accounts").should("exist");
    cy.get("[data-test=bankaccount-list]").should("not.exist");
  });
});
