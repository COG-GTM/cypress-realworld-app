import BankAccountItem from "./BankAccountItem";
import { BankAccount } from "../models";

describe("BankAccountItem", () => {
  const activeBankAccount: BankAccount = {
    id: "bank-account-1",
    uuid: "uuid-1",
    userId: "user-1",
    bankName: "First National Bank",
    accountNumber: "123456789",
    routingNumber: "987654321",
    isDeleted: false,
    createdAt: new Date("2023-01-01"),
    modifiedAt: new Date("2023-01-01"),
  };

  const deletedBankAccount: BankAccount = {
    id: "bank-account-2",
    uuid: "uuid-2",
    userId: "user-1",
    bankName: "Deleted Bank",
    accountNumber: "987654321",
    routingNumber: "123456789",
    isDeleted: true,
    createdAt: new Date("2023-01-02"),
    modifiedAt: new Date("2023-01-02"),
  };

  describe("Active Bank Account Rendering", () => {
    it("renders bank account name", () => {
      const deleteBankAccount = cy.stub();
      cy.mount(
        <BankAccountItem bankAccount={activeBankAccount} deleteBankAccount={deleteBankAccount} />
      );

      cy.get("[data-test=bankaccount-list-item-bank-account-1]").should(
        "contain",
        "First National Bank"
      );
    });

    it("renders delete button for active bank account", () => {
      const deleteBankAccount = cy.stub();
      cy.mount(
        <BankAccountItem bankAccount={activeBankAccount} deleteBankAccount={deleteBankAccount} />
      );

      cy.get("[data-test=bankaccount-delete]").should("be.visible").and("contain", "Delete");
    });

    it("does not show (Deleted) indicator for active bank account", () => {
      const deleteBankAccount = cy.stub();
      cy.mount(
        <BankAccountItem bankAccount={activeBankAccount} deleteBankAccount={deleteBankAccount} />
      );

      cy.get("[data-test=bankaccount-list-item-bank-account-1]").should("not.contain", "(Deleted)");
    });
  });

  describe("Deleted Bank Account Rendering", () => {
    it("renders bank account name with (Deleted) indicator", () => {
      const deleteBankAccount = cy.stub();
      cy.mount(
        <BankAccountItem bankAccount={deletedBankAccount} deleteBankAccount={deleteBankAccount} />
      );

      cy.get("[data-test=bankaccount-list-item-bank-account-2]")
        .should("contain", "Deleted Bank")
        .and("contain", "(Deleted)");
    });

    it("does not render delete button for deleted bank account", () => {
      const deleteBankAccount = cy.stub();
      cy.mount(
        <BankAccountItem bankAccount={deletedBankAccount} deleteBankAccount={deleteBankAccount} />
      );

      cy.get("[data-test=bankaccount-delete]").should("not.exist");
    });
  });

  describe("Delete Functionality", () => {
    it("calls deleteBankAccount with correct id when delete button is clicked", () => {
      const deleteBankAccount = cy.stub().as("deleteBankAccount");
      cy.mount(
        <BankAccountItem bankAccount={activeBankAccount} deleteBankAccount={deleteBankAccount} />
      );

      cy.get("[data-test=bankaccount-delete]").click();

      cy.get("@deleteBankAccount").should("have.been.calledOnce");
      cy.get("@deleteBankAccount").should("have.been.calledWith", { id: "bank-account-1" });
    });

    it("delete button has correct styling", () => {
      const deleteBankAccount = cy.stub();
      cy.mount(
        <BankAccountItem bankAccount={activeBankAccount} deleteBankAccount={deleteBankAccount} />
      );

      cy.get("[data-test=bankaccount-delete]")
        .should("have.class", "MuiButton-containedSecondary")
        .and("have.class", "MuiButton-sizeLarge");
    });
  });

  describe("Edge Cases", () => {
    it("renders bank account with special characters in name", () => {
      const specialNameAccount: BankAccount = {
        ...activeBankAccount,
        id: "bank-account-special",
        bankName: "Bank & Trust Co. (Main)",
      };
      const deleteBankAccount = cy.stub();
      cy.mount(
        <BankAccountItem bankAccount={specialNameAccount} deleteBankAccount={deleteBankAccount} />
      );

      cy.get("[data-test=bankaccount-list-item-bank-account-special]").should(
        "contain",
        "Bank & Trust Co. (Main)"
      );
    });

    it("renders bank account with long name", () => {
      const longNameAccount: BankAccount = {
        ...activeBankAccount,
        id: "bank-account-long",
        bankName: "The Very Long Bank Name That Goes On And On",
      };
      const deleteBankAccount = cy.stub();
      cy.mount(
        <BankAccountItem bankAccount={longNameAccount} deleteBankAccount={deleteBankAccount} />
      );

      cy.get("[data-test=bankaccount-list-item-bank-account-long]").should(
        "contain",
        "The Very Long Bank Name That Goes On And On"
      );
    });
  });
});
