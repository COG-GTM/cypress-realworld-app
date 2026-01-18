import BankAccountList from "./BankAccountList";
import { BankAccount } from "../models";

describe("BankAccountList", () => {
  const mockBankAccounts: BankAccount[] = [
    {
      id: "bank-account-1",
      uuid: "uuid-1",
      userId: "user-1",
      bankName: "First National Bank",
      accountNumber: "123456789",
      routingNumber: "987654321",
      isDeleted: false,
      createdAt: new Date("2023-01-01"),
      modifiedAt: new Date("2023-01-01"),
    },
    {
      id: "bank-account-2",
      uuid: "uuid-2",
      userId: "user-1",
      bankName: "Second Bank",
      accountNumber: "987654321",
      routingNumber: "123456789",
      isDeleted: false,
      createdAt: new Date("2023-01-02"),
      modifiedAt: new Date("2023-01-02"),
    },
  ];

  const deletedBankAccount: BankAccount = {
    id: "bank-account-3",
    uuid: "uuid-3",
    userId: "user-1",
    bankName: "Deleted Bank",
    accountNumber: "111111111",
    routingNumber: "222222222",
    isDeleted: true,
    createdAt: new Date("2023-01-03"),
    modifiedAt: new Date("2023-01-03"),
  };

  describe("List Rendering", () => {
    it("renders a list of bank accounts", () => {
      const deleteBankAccount = cy.stub();
      cy.mount(
        <BankAccountList bankAccounts={mockBankAccounts} deleteBankAccount={deleteBankAccount} />
      );

      cy.get("[data-test=bankaccount-list]").should("be.visible");
      cy.get("[data-test^=bankaccount-list-item]").should("have.length", 2);
    });

    it("displays bank account names correctly", () => {
      const deleteBankAccount = cy.stub();
      cy.mount(
        <BankAccountList bankAccounts={mockBankAccounts} deleteBankAccount={deleteBankAccount} />
      );

      cy.get("[data-test=bankaccount-list-item-bank-account-1]").should(
        "contain",
        "First National Bank"
      );
      cy.get("[data-test=bankaccount-list-item-bank-account-2]").should("contain", "Second Bank");
    });

    it("renders delete buttons for each bank account", () => {
      const deleteBankAccount = cy.stub();
      cy.mount(
        <BankAccountList bankAccounts={mockBankAccounts} deleteBankAccount={deleteBankAccount} />
      );

      cy.get("[data-test=bankaccount-delete]").should("have.length", 2);
    });
  });

  describe("Empty State", () => {
    it("renders empty state when no bank accounts exist", () => {
      const deleteBankAccount = cy.stub();
      cy.mount(<BankAccountList bankAccounts={[]} deleteBankAccount={deleteBankAccount} />);

      cy.get("[data-test=bankaccount-list]").should("not.exist");
      cy.get("[data-test=empty-list-header]")
        .should("be.visible")
        .and("contain", "No Bank Accounts");
    });

    it("renders empty state when bankAccounts is undefined", () => {
      const deleteBankAccount = cy.stub();
      cy.mount(
        <BankAccountList
          bankAccounts={undefined as unknown as BankAccount[]}
          deleteBankAccount={deleteBankAccount}
        />
      );

      cy.get("[data-test=bankaccount-list]").should("not.exist");
      cy.get("[data-test=empty-list-header]").should("be.visible");
    });
  });

  describe("Delete Functionality", () => {
    it("calls deleteBankAccount when delete button is clicked", () => {
      const deleteBankAccount = cy.stub().as("deleteBankAccount");
      cy.mount(
        <BankAccountList bankAccounts={mockBankAccounts} deleteBankAccount={deleteBankAccount} />
      );

      cy.get("[data-test=bankaccount-list-item-bank-account-1]")
        .find("[data-test=bankaccount-delete]")
        .click();

      cy.get("@deleteBankAccount").should("have.been.calledOnce");
      cy.get("@deleteBankAccount").should("have.been.calledWith", { id: "bank-account-1" });
    });

    it("calls deleteBankAccount with correct id for second bank account", () => {
      const deleteBankAccount = cy.stub().as("deleteBankAccount");
      cy.mount(
        <BankAccountList bankAccounts={mockBankAccounts} deleteBankAccount={deleteBankAccount} />
      );

      cy.get("[data-test=bankaccount-list-item-bank-account-2]")
        .find("[data-test=bankaccount-delete]")
        .click();

      cy.get("@deleteBankAccount").should("have.been.calledOnce");
      cy.get("@deleteBankAccount").should("have.been.calledWith", { id: "bank-account-2" });
    });
  });

  describe("Deleted Bank Accounts", () => {
    it("displays deleted bank account with (Deleted) indicator", () => {
      const deleteBankAccount = cy.stub();
      cy.mount(
        <BankAccountList
          bankAccounts={[deletedBankAccount]}
          deleteBankAccount={deleteBankAccount}
        />
      );

      cy.get("[data-test=bankaccount-list-item-bank-account-3]")
        .should("contain", "Deleted Bank")
        .and("contain", "(Deleted)");
    });

    it("does not show delete button for deleted bank accounts", () => {
      const deleteBankAccount = cy.stub();
      cy.mount(
        <BankAccountList
          bankAccounts={[deletedBankAccount]}
          deleteBankAccount={deleteBankAccount}
        />
      );

      cy.get("[data-test=bankaccount-list-item-bank-account-3]")
        .find("[data-test=bankaccount-delete]")
        .should("not.exist");
    });

    it("renders mixed list of active and deleted bank accounts", () => {
      const deleteBankAccount = cy.stub();
      const mixedAccounts = [...mockBankAccounts, deletedBankAccount];
      cy.mount(
        <BankAccountList bankAccounts={mixedAccounts} deleteBankAccount={deleteBankAccount} />
      );

      cy.get("[data-test^=bankaccount-list-item]").should("have.length", 3);
      cy.get("[data-test=bankaccount-delete]").should("have.length", 2);
      cy.get("[data-test=bankaccount-list-item-bank-account-3]").should("contain", "(Deleted)");
    });
  });
});
