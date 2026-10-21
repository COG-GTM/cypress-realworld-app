import TransactionAmount from "./TransactionAmount";
import { TransactionResponseItem } from "../models";

const baseTransaction = {
  id: "183VHWyuQMS",
  amount: 5075,
} as TransactionResponseItem;

describe("TransactionAmount", () => {
  it("renders a payment as a negative red amount", () => {
    cy.mount(<TransactionAmount transaction={baseTransaction} />);

    cy.get("[data-test=transaction-amount-183VHWyuQMS]")
      .should("have.text", "-$50.75")
      .and("have.class", "TransactionAmount-amountNegative")
      .and("have.css", "color", "rgb(255, 0, 0)");
  });

  it("renders a request as a positive green amount", () => {
    const request = { ...baseTransaction, requestStatus: "pending" } as TransactionResponseItem;
    cy.mount(<TransactionAmount transaction={request} />);

    cy.get("[data-test=transaction-amount-183VHWyuQMS]")
      .should("have.text", "+$50.75")
      .and("have.class", "TransactionAmount-amountPositive")
      .and("have.css", "color", "rgb(76, 175, 80)");
  });

  it("renders only the sign when the amount is missing", () => {
    const transaction = {
      ...baseTransaction,
      amount: undefined,
    } as unknown as TransactionResponseItem;
    cy.mount(<TransactionAmount transaction={transaction} />);

    cy.get("[data-test=transaction-amount-183VHWyuQMS]").should("have.text", "-");
  });
});
