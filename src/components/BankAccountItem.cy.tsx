import BankAccountItem from "./BankAccountItem";
import { BankAccount } from "../models";

describe("BankAccountItem", () => {
  let deleteBankAccountStub: ReturnType<typeof cy.stub>;

  const activeBankAccount: BankAccount = {
    id: "bank-1",
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
    id: "bank-2",
    uuid: "uuid-2",
    userId: "user-1",
    bankName: "Deleted Bank",
    accountNumber: "987654321",
    routingNumber: "123456789",
    isDeleted: true,
    createdAt: new Date("2023-01-02"),
    modifiedAt: new Date("2023-01-02"),
  };

  beforeEach(() => {
    deleteBankAccountStub = cy.stub().as("deleteBankAccount");
  });

  describe("Rendering Active Bank Account", () => {
    it("renders bank account name", () => {
      cy.mount(
        <BankAccountItem
          bankAccount={activeBankAccount}
          deleteBankAccount={deleteBankAccountStub}
        />
      );

      cy.get("[data-test=bankaccount-list-item-bank-1]").should("contain", "First National Bank");
    });

    it("renders delete button for active bank account", () => {
      cy.mount(
        <BankAccountItem
          bankAccount={activeBankAccount}
          deleteBankAccount={deleteBankAccountStub}
        />
      );

      cy.get("[data-test=bankaccount-delete]").should("exist").and("be.visible");
    });

    it("does not show (Deleted) suffix for active bank account", () => {
      cy.mount(
        <BankAccountItem
          bankAccount={activeBankAccount}
          deleteBankAccount={deleteBankAccountStub}
        />
      );

      cy.get("[data-test=bankaccount-list-item-bank-1]").should("not.contain", "(Deleted)");
    });

    it("renders with correct data-test attribute based on bank account id", () => {
      cy.mount(
        <BankAccountItem
          bankAccount={activeBankAccount}
          deleteBankAccount={deleteBankAccountStub}
        />
      );

      cy.get("[data-test=bankaccount-list-item-bank-1]").should("exist");
    });
  });

  describe("Rendering Deleted Bank Account", () => {
    it("renders deleted bank account name with (Deleted) suffix", () => {
      cy.mount(
        <BankAccountItem
          bankAccount={deletedBankAccount}
          deleteBankAccount={deleteBankAccountStub}
        />
      );

      cy.get("[data-test=bankaccount-list-item-bank-2]").should("contain", "Deleted Bank");
      cy.get("[data-test=bankaccount-list-item-bank-2]").should("contain", "(Deleted)");
    });

    it("does not render delete button for deleted bank account", () => {
      cy.mount(
        <BankAccountItem
          bankAccount={deletedBankAccount}
          deleteBankAccount={deleteBankAccountStub}
        />
      );

      cy.get("[data-test=bankaccount-delete]").should("not.exist");
    });
  });

  describe("User Interactions", () => {
    it("calls deleteBankAccount with correct id when delete button is clicked", () => {
      cy.mount(
        <BankAccountItem
          bankAccount={activeBankAccount}
          deleteBankAccount={deleteBankAccountStub}
        />
      );

      cy.get("[data-test=bankaccount-delete]").click();

      cy.get("@deleteBankAccount").should("have.been.calledOnce");
      cy.get("@deleteBankAccount").should("have.been.calledWith", { id: "bank-1" });
    });

    it("delete button is clickable and responds to user interaction", () => {
      cy.mount(
        <BankAccountItem
          bankAccount={activeBankAccount}
          deleteBankAccount={deleteBankAccountStub}
        />
      );

      cy.get("[data-test=bankaccount-delete]").should("be.visible").and("not.be.disabled").click();

      cy.get("@deleteBankAccount").should("have.been.called");
    });
  });

  describe("Edge Cases", () => {
    it("handles bank account with special characters in name", () => {
      const specialCharAccount: BankAccount = {
        ...activeBankAccount,
        id: "bank-special",
        bankName: "Bank & Trust Co. #1",
      };

      cy.mount(
        <BankAccountItem
          bankAccount={specialCharAccount}
          deleteBankAccount={deleteBankAccountStub}
        />
      );

      cy.get("[data-test=bankaccount-list-item-bank-special]").should(
        "contain",
        "Bank & Trust Co. #1"
      );
    });

    it("handles bank account with long name", () => {
      const longNameAccount: BankAccount = {
        ...activeBankAccount,
        id: "bank-long",
        bankName: "The Very Long Bank Name That Goes On And On",
      };

      cy.mount(
        <BankAccountItem bankAccount={longNameAccount} deleteBankAccount={deleteBankAccountStub} />
      );

      cy.get("[data-test=bankaccount-list-item-bank-long]").should(
        "contain",
        "The Very Long Bank Name That Goes On And On"
      );
    });

    it("handles bank account with minimum length name", () => {
      const shortNameAccount: BankAccount = {
        ...activeBankAccount,
        id: "bank-short",
        bankName: "ABCDE",
      };

      cy.mount(
        <BankAccountItem bankAccount={shortNameAccount} deleteBankAccount={deleteBankAccountStub} />
      );

      cy.get("[data-test=bankaccount-list-item-bank-short]").should("contain", "ABCDE");
    });
  });

  describe("Delete Button Styling", () => {
    it("delete button has correct variant and color", () => {
      cy.mount(
        <BankAccountItem
          bankAccount={activeBankAccount}
          deleteBankAccount={deleteBankAccountStub}
        />
      );

      cy.get("[data-test=bankaccount-delete]").should("have.class", "MuiButton-containedSecondary");
    });

    it("delete button displays correct text", () => {
      cy.mount(
        <BankAccountItem
          bankAccount={activeBankAccount}
          deleteBankAccount={deleteBankAccountStub}
        />
      );

      cy.get("[data-test=bankaccount-delete]").should("contain", "Delete");
    });
  });
});
