import BankAccountList from "./BankAccountList";
import { BankAccount } from "../models";

const bankAccounts: BankAccount[] = [
  {
    id: "ba1",
    uuid: "ba-uuid-1",
    userId: "user1",
    bankName: "Test Bank",
    accountNumber: "123456789",
    routingNumber: "987654321",
    isDeleted: false,
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
  {
    id: "ba2",
    uuid: "ba-uuid-2",
    userId: "user1",
    bankName: "Another Bank",
    accountNumber: "987654321",
    routingNumber: "123456789",
    isDeleted: false,
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
];

describe("BankAccountList", () => {
  let deleteBankAccountStub: ReturnType<typeof cy.stub>;

  beforeEach(() => {
    deleteBankAccountStub = cy.stub();
  });

  it("renders list of bank accounts", () => {
    cy.mount(
      <BankAccountList bankAccounts={bankAccounts} deleteBankAccount={deleteBankAccountStub} />
    );
    cy.get("[data-test=bankaccount-list]").should("exist");
    cy.get("[data-test=bankaccount-list]").find("li").should("have.length", 2);
  });

  it("empty bank accounts renders empty state", () => {
    cy.mount(
      <BankAccountList bankAccounts={[]} deleteBankAccount={deleteBankAccountStub} />
    );
    cy.get("[data-test=bankaccount-list]").should("not.exist");
    cy.get("[data-test=empty-list-header]").should("contain", "No Bank Accounts");
  });
});
