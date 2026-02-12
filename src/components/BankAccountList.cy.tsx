import BankAccountList from "./BankAccountList";
import { BankAccount } from "../models";

describe("BankAccountList", () => {
  const bankAccounts: BankAccount[] = [
    {
      id: "bank-1",
      uuid: "uuid-1",
      userId: "user-1",
      bankName: "Chase Bank",
      accountNumber: "1234567890",
      routingNumber: "021000021",
      isDeleted: false,
      createdAt: new Date("2024-01-01"),
      modifiedAt: new Date("2024-01-01"),
    },
    {
      id: "bank-2",
      uuid: "uuid-2",
      userId: "user-1",
      bankName: "Wells Fargo",
      accountNumber: "0987654321",
      routingNumber: "121000248",
      isDeleted: false,
      createdAt: new Date("2024-01-02"),
      modifiedAt: new Date("2024-01-02"),
    },
  ];

  it("renders list of bank accounts", () => {
    const deleteBankAccount = cy.stub();
    cy.mount(<BankAccountList bankAccounts={bankAccounts} deleteBankAccount={deleteBankAccount} />);
    cy.get("[data-test=bankaccount-list]").should("exist");
    cy.get("[data-test^=bankaccount-list-item-]").should("have.length", 2);
    cy.contains("Chase Bank").should("exist");
    cy.contains("Wells Fargo").should("exist");
  });

  it("handles empty state", () => {
    const deleteBankAccount = cy.stub();
    cy.mount(<BankAccountList bankAccounts={[]} deleteBankAccount={deleteBankAccount} />);
    cy.get("[data-test=bankaccount-list]").should("not.exist");
    cy.get("[data-test=empty-list-header]").should("contain", "No Bank Accounts");
  });

  it("handles delete action", () => {
    const deleteBankAccount = cy.stub().as("deleteBankAccount");
    cy.mount(
      <BankAccountList bankAccounts={[bankAccounts[0]]} deleteBankAccount={deleteBankAccount} />
    );
    cy.get("[data-test=bankaccount-delete]").click();
    cy.get("@deleteBankAccount").should("have.been.calledWith", { id: "bank-1" });
  });
});
