import BankAccountItem from "./BankAccountItem";
import { BankAccount } from "../models";

const bankAccount: BankAccount = {
  id: "RskoB7r4Bic",
  uuid: "5a5d8e11-f5f6-4d79-a4e4-4ca2a4a5d24b",
  userId: "t45AiwidW",
  bankName: "O'Hara - Labadie Bank",
  accountNumber: "6123387981",
  routingNumber: "851823229",
  isDeleted: false,
  createdAt: new Date("2019-10-02T18:30:00.000Z"),
  modifiedAt: new Date("2020-05-21T11:02:22.857Z"),
};

describe("BankAccountItem", () => {
  it("renders the bank name and deletes the account", () => {
    const deleteBankAccount = cy.spy().as("deleteBankAccount");
    cy.mount(<BankAccountItem bankAccount={bankAccount} deleteBankAccount={deleteBankAccount} />);

    cy.get(`[data-test=bankaccount-list-item-${bankAccount.id}]`)
      .should("contain", "O'Hara - Labadie Bank")
      .and("not.contain", "(Deleted)");
    cy.get("[data-test=bankaccount-delete]").click();

    cy.get("@deleteBankAccount").should("have.been.calledOnceWith", { id: bankAccount.id });
  });

  it("marks a deleted account and hides the delete button", () => {
    cy.mount(
      <BankAccountItem
        bankAccount={{ ...bankAccount, isDeleted: true }}
        deleteBankAccount={cy.spy()}
      />
    );

    cy.get(`[data-test=bankaccount-list-item-${bankAccount.id}]`).should(
      "contain",
      "O'Hara - Labadie Bank (Deleted)"
    );
    cy.get("[data-test=bankaccount-delete]").should("not.exist");
  });
});
