import TransactionAmount from "./TransactionAmount";
import {
  TransactionResponseItem,
  TransactionRequestStatus,
  TransactionStatus,
  DefaultPrivacyLevel,
} from "../models";

const baseTransaction: TransactionResponseItem = {
  id: "tx1",
  uuid: "tx-uuid-1",
  source: "",
  amount: 5000,
  description: "Test",
  privacyLevel: DefaultPrivacyLevel.public,
  receiverId: "user2",
  senderId: "user1",
  balanceAtCompletion: 10000,
  status: TransactionStatus.complete,
  requestStatus: "",
  createdAt: new Date(),
  modifiedAt: new Date(),
  receiverName: "Kevin",
  senderName: "Amir",
  receiverAvatar: "",
  senderAvatar: "",
  likes: [],
  comments: [],
};

describe("TransactionAmount", () => {
  it("renders formatted negative amount for payment (non-request)", () => {
    cy.mount(<TransactionAmount transaction={baseTransaction} />);
    cy.get(`[data-test=transaction-amount-${baseTransaction.id}]`).should("contain", "-$50.00");
  });

  it("renders formatted positive amount for request transaction", () => {
    const requestTransaction: TransactionResponseItem = {
      ...baseTransaction,
      requestStatus: TransactionRequestStatus.pending,
    };

    cy.mount(<TransactionAmount transaction={requestTransaction} />);
    cy.get(`[data-test=transaction-amount-${requestTransaction.id}]`).should(
      "contain",
      "+$50.00"
    );
  });

  it("applies negative (red) styling for payment", () => {
    cy.mount(<TransactionAmount transaction={baseTransaction} />);
    cy.get(`[data-test=transaction-amount-${baseTransaction.id}]`).should(
      "have.class",
      "TransactionAmount-amountNegative"
    );
  });

  it("applies positive (green) styling for request", () => {
    const requestTransaction: TransactionResponseItem = {
      ...baseTransaction,
      requestStatus: TransactionRequestStatus.pending,
    };

    cy.mount(<TransactionAmount transaction={requestTransaction} />);
    cy.get(`[data-test=transaction-amount-${requestTransaction.id}]`).should(
      "have.class",
      "TransactionAmount-amountPositive"
    );
  });
});
