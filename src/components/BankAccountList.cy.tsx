import BankAccountList from "./BankAccountList";
import { BankAccount } from "../models";

describe("BankAccountList", () => {
  let deleteBankAccountStub: ReturnType<typeof cy.stub>;

  const mockBankAccounts: BankAccount[] = [
    {
      id: "bank-1",
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
      id: "bank-2",
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
    id: "bank-3",
    uuid: "uuid-3",
    userId: "user-1",
    bankName: "Deleted Bank",
    accountNumber: "111111111",
    routingNumber: "222222222",
    isDeleted: true,
    createdAt: new Date("2023-01-03"),
    modifiedAt: new Date("2023-01-03"),
  };

  beforeEach(() => {
    deleteBankAccountStub = cy.stub().as("deleteBankAccount");
  });

  describe("Rendering", () => {
    it("renders empty state when no bank accounts exist", () => {
      cy.mount(<BankAccountList bankAccounts={[]} deleteBankAccount={deleteBankAccountStub} />);

      cy.get("[data-test=bankaccount-list]").should("not.exist");
      cy.get("[data-test=empty-list-header]").should("contain", "No Bank Accounts");
    });

    it("renders list of bank accounts", () => {
      cy.mount(
        <BankAccountList
          bankAccounts={mockBankAccounts}
          deleteBankAccount={deleteBankAccountStub}
        />
      );

      cy.get("[data-test=bankaccount-list]").should("exist");
      cy.get("[data-test^=bankaccount-list-item]").should("have.length", 2);
    });

    it("renders bank account names correctly", () => {
      cy.mount(
        <BankAccountList
          bankAccounts={mockBankAccounts}
          deleteBankAccount={deleteBankAccountStub}
        />
      );

      cy.get("[data-test=bankaccount-list-item-bank-1]").should("contain", "First National Bank");
      cy.get("[data-test=bankaccount-list-item-bank-2]").should("contain", "Second Bank");
    });

    it("renders delete button for each non-deleted bank account", () => {
      cy.mount(
        <BankAccountList
          bankAccounts={mockBankAccounts}
          deleteBankAccount={deleteBankAccountStub}
        />
      );

      cy.get("[data-test=bankaccount-delete]").should("have.length", 2);
    });

    it("renders deleted bank accounts with (Deleted) suffix", () => {
      cy.mount(
        <BankAccountList
          bankAccounts={[...mockBankAccounts, deletedBankAccount]}
          deleteBankAccount={deleteBankAccountStub}
        />
      );

      cy.get("[data-test=bankaccount-list-item-bank-3]").should("contain", "Deleted Bank");
      cy.get("[data-test=bankaccount-list-item-bank-3]").should("contain", "(Deleted)");
    });

    it("does not render delete button for deleted bank accounts", () => {
      cy.mount(
        <BankAccountList
          bankAccounts={[deletedBankAccount]}
          deleteBankAccount={deleteBankAccountStub}
        />
      );

      cy.get("[data-test=bankaccount-list-item-bank-3]")
        .find("[data-test=bankaccount-delete]")
        .should("not.exist");
    });
  });

  describe("User Interactions", () => {
    it("calls deleteBankAccount when delete button is clicked", () => {
      cy.mount(
        <BankAccountList
          bankAccounts={mockBankAccounts}
          deleteBankAccount={deleteBankAccountStub}
        />
      );

      cy.get("[data-test=bankaccount-list-item-bank-1]")
        .find("[data-test=bankaccount-delete]")
        .click();

      cy.get("@deleteBankAccount").should("have.been.calledOnce");
      cy.get("@deleteBankAccount").should("have.been.calledWith", { id: "bank-1" });
    });

    it("calls deleteBankAccount with correct id for different bank accounts", () => {
      cy.mount(
        <BankAccountList
          bankAccounts={mockBankAccounts}
          deleteBankAccount={deleteBankAccountStub}
        />
      );

      cy.get("[data-test=bankaccount-list-item-bank-2]")
        .find("[data-test=bankaccount-delete]")
        .click();

      cy.get("@deleteBankAccount").should("have.been.calledWith", { id: "bank-2" });
    });
  });

  describe("Edge Cases", () => {
    it("handles undefined bankAccounts gracefully", () => {
      cy.mount(
        <BankAccountList
          bankAccounts={undefined as unknown as BankAccount[]}
          deleteBankAccount={deleteBankAccountStub}
        />
      );

      cy.get("[data-test=empty-list-header]").should("contain", "No Bank Accounts");
    });

    it("renders single bank account correctly", () => {
      cy.mount(
        <BankAccountList
          bankAccounts={[mockBankAccounts[0]]}
          deleteBankAccount={deleteBankAccountStub}
        />
      );

      cy.get("[data-test=bankaccount-list]").should("exist");
      cy.get("[data-test^=bankaccount-list-item]").should("have.length", 1);
      cy.get("[data-test=bankaccount-list-item-bank-1]").should("contain", "First National Bank");
    });

    it("renders mix of deleted and non-deleted accounts", () => {
      const mixedAccounts = [mockBankAccounts[0], deletedBankAccount, mockBankAccounts[1]];

      cy.mount(
        <BankAccountList bankAccounts={mixedAccounts} deleteBankAccount={deleteBankAccountStub} />
      );

      cy.get("[data-test^=bankaccount-list-item]").should("have.length", 3);
      cy.get("[data-test=bankaccount-delete]").should("have.length", 2);
    });
  });
});
