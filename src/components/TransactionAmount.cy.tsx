import TransactionAmount from "./TransactionAmount";
import {
  TransactionResponseItem,
  TransactionStatus,
  TransactionRequestStatus,
  DefaultPrivacyLevel,
} from "../models";

describe("TransactionAmount", () => {
  const baseTransaction: TransactionResponseItem = {
    id: "test-transaction-id",
    uuid: "test-uuid",
    source: "test-source",
    amount: 5000,
    description: "Test transaction",
    privacyLevel: DefaultPrivacyLevel.public,
    receiverId: "receiver-id",
    senderId: "sender-id",
    balanceAtCompletion: 10000,
    status: TransactionStatus.complete,
    requestStatus: "",
    requestResolvedAt: "",
    createdAt: new Date(),
    modifiedAt: new Date(),
    likes: [],
    comments: [],
    receiverName: "Jane Smith",
    receiverAvatar: "https://example.com/receiver.png",
    senderName: "John Doe",
    senderAvatar: "https://example.com/sender.png",
  };

  describe("Payment Transactions (negative amounts)", () => {
    it("displays negative amount with red color for payment", () => {
      const paymentTransaction: TransactionResponseItem = {
        ...baseTransaction,
        amount: 5000,
        requestStatus: "",
      };

      cy.mount(<TransactionAmount transaction={paymentTransaction} />);

      cy.get(`[data-test='transaction-amount-${paymentTransaction.id}']`)
        .should("contain", "-")
        .and("contain", "$50.00")
        .and("have.css", "color", "rgb(255, 0, 0)");
    });

    it("displays formatted amount for large payment", () => {
      const largePaymentTransaction: TransactionResponseItem = {
        ...baseTransaction,
        amount: 100000,
        requestStatus: "",
      };

      cy.mount(<TransactionAmount transaction={largePaymentTransaction} />);

      cy.get(`[data-test='transaction-amount-${largePaymentTransaction.id}']`)
        .should("contain", "-")
        .and("contain", "$1,000.00");
    });

    it("displays formatted amount for small payment", () => {
      const smallPaymentTransaction: TransactionResponseItem = {
        ...baseTransaction,
        amount: 100,
        requestStatus: "",
      };

      cy.mount(<TransactionAmount transaction={smallPaymentTransaction} />);

      cy.get(`[data-test='transaction-amount-${smallPaymentTransaction.id}']`)
        .should("contain", "-")
        .and("contain", "$1.00");
    });
  });

  describe("Request Transactions (positive amounts)", () => {
    it("displays positive amount with green color for accepted request", () => {
      const requestTransaction: TransactionResponseItem = {
        ...baseTransaction,
        amount: 7500,
        requestStatus: TransactionRequestStatus.accepted,
      };

      cy.mount(<TransactionAmount transaction={requestTransaction} />);

      cy.get(`[data-test='transaction-amount-${requestTransaction.id}']`)
        .should("contain", "+")
        .and("contain", "$75.00")
        .and("have.css", "color", "rgb(76, 175, 80)");
    });

    it("displays positive amount for pending request", () => {
      const pendingRequestTransaction: TransactionResponseItem = {
        ...baseTransaction,
        amount: 2500,
        status: TransactionStatus.pending,
        requestStatus: TransactionRequestStatus.pending,
      };

      cy.mount(<TransactionAmount transaction={pendingRequestTransaction} />);

      cy.get(`[data-test='transaction-amount-${pendingRequestTransaction.id}']`)
        .should("contain", "+")
        .and("contain", "$25.00");
    });

    it("displays positive amount for rejected request", () => {
      const rejectedRequestTransaction: TransactionResponseItem = {
        ...baseTransaction,
        amount: 3000,
        requestStatus: TransactionRequestStatus.rejected,
      };

      cy.mount(<TransactionAmount transaction={rejectedRequestTransaction} />);

      cy.get(`[data-test='transaction-amount-${rejectedRequestTransaction.id}']`)
        .should("contain", "+")
        .and("contain", "$30.00");
    });
  });

  describe("Amount Formatting", () => {
    it("formats cents correctly", () => {
      const transactionWithCents: TransactionResponseItem = {
        ...baseTransaction,
        amount: 1234,
        requestStatus: "",
      };

      cy.mount(<TransactionAmount transaction={transactionWithCents} />);

      cy.get(`[data-test='transaction-amount-${transactionWithCents.id}']`).should(
        "contain",
        "$12.34"
      );
    });

    it("formats thousands with comma separator", () => {
      const largeTransaction: TransactionResponseItem = {
        ...baseTransaction,
        amount: 1234567,
        requestStatus: "",
      };

      cy.mount(<TransactionAmount transaction={largeTransaction} />);

      cy.get(`[data-test='transaction-amount-${largeTransaction.id}']`).should(
        "contain",
        "$12,345.67"
      );
    });

    it("handles zero amount", () => {
      const zeroTransaction: TransactionResponseItem = {
        ...baseTransaction,
        amount: 0,
        requestStatus: "",
      };

      cy.mount(<TransactionAmount transaction={zeroTransaction} />);

      cy.get(`[data-test='transaction-amount-${zeroTransaction.id}']`).should("contain", "$0.00");
    });
  });
});
