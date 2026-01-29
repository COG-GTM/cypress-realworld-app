import { MemoryRouter } from "react-router-dom";
import TransactionItem from "./TransactionItem";
import {
  TransactionResponseItem,
  TransactionStatus,
  TransactionRequestStatus,
  DefaultPrivacyLevel,
} from "../models";

describe("TransactionItem", () => {
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

  it("renders a payment transaction item", () => {
    const paymentTransaction: TransactionResponseItem = {
      ...baseTransaction,
      description: "Payment: John paid Jane",
      requestStatus: "",
    };

    cy.mount(
      <MemoryRouter>
        <TransactionItem transaction={paymentTransaction} />
      </MemoryRouter>
    );

    cy.get(`[data-test='transaction-item-${paymentTransaction.id}']`).should("be.visible");
    cy.get("[data-test*='transaction-sender']").should("contain", paymentTransaction.senderName);
    cy.get("[data-test*='transaction-receiver']").should(
      "contain",
      paymentTransaction.receiverName
    );
    cy.contains(paymentTransaction.description).should("be.visible");
  });

  it("renders a request transaction item with pending status", () => {
    const requestTransaction: TransactionResponseItem = {
      ...baseTransaction,
      description: "Request: Jane requested from John",
      status: TransactionStatus.pending,
      requestStatus: TransactionRequestStatus.pending,
    };

    cy.mount(
      <MemoryRouter>
        <TransactionItem transaction={requestTransaction} />
      </MemoryRouter>
    );

    cy.get(`[data-test='transaction-item-${requestTransaction.id}']`).should("be.visible");
    cy.contains(requestTransaction.description).should("be.visible");
  });

  it("renders a request transaction item with accepted status", () => {
    const acceptedTransaction: TransactionResponseItem = {
      ...baseTransaction,
      description: "Request: Jane charged John",
      status: TransactionStatus.complete,
      requestStatus: TransactionRequestStatus.accepted,
    };

    cy.mount(
      <MemoryRouter>
        <TransactionItem transaction={acceptedTransaction} />
      </MemoryRouter>
    );

    cy.get(`[data-test='transaction-item-${acceptedTransaction.id}']`).should("be.visible");
    cy.contains(acceptedTransaction.description).should("be.visible");
  });

  it("renders a request transaction item with rejected status", () => {
    const rejectedTransaction: TransactionResponseItem = {
      ...baseTransaction,
      description: "Request: Jane requested from John (rejected)",
      status: TransactionStatus.complete,
      requestStatus: TransactionRequestStatus.rejected,
    };

    cy.mount(
      <MemoryRouter>
        <TransactionItem transaction={rejectedTransaction} />
      </MemoryRouter>
    );

    cy.get(`[data-test='transaction-item-${rejectedTransaction.id}']`).should("be.visible");
    cy.contains(rejectedTransaction.description).should("be.visible");
  });

  it("displays like count", () => {
    const transactionWithLikes: TransactionResponseItem = {
      ...baseTransaction,
      likes: [
        {
          id: "like-1",
          uuid: "like-uuid-1",
          transactionId: baseTransaction.id,
          userId: "user-1",
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
        {
          id: "like-2",
          uuid: "like-uuid-2",
          transactionId: baseTransaction.id,
          userId: "user-2",
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
      ],
    };

    cy.mount(
      <MemoryRouter>
        <TransactionItem transaction={transactionWithLikes} />
      </MemoryRouter>
    );

    cy.get("[data-test='transaction-like-count']").should("have.text", "2");
  });

  it("displays comment count", () => {
    const transactionWithComments: TransactionResponseItem = {
      ...baseTransaction,
      comments: [
        {
          id: "comment-1",
          uuid: "comment-uuid-1",
          transactionId: baseTransaction.id,
          userId: "user-1",
          content: "Nice!",
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
        {
          id: "comment-2",
          uuid: "comment-uuid-2",
          transactionId: baseTransaction.id,
          userId: "user-2",
          content: "Thanks!",
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
        {
          id: "comment-3",
          uuid: "comment-uuid-3",
          transactionId: baseTransaction.id,
          userId: "user-3",
          content: "Great!",
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
      ],
    };

    cy.mount(
      <MemoryRouter>
        <TransactionItem transaction={transactionWithComments} />
      </MemoryRouter>
    );

    cy.get("[data-test='transaction-comment-count']").should("have.text", "3");
  });

  it("displays zero likes and comments for new transaction", () => {
    cy.mount(
      <MemoryRouter>
        <TransactionItem transaction={baseTransaction} />
      </MemoryRouter>
    );

    cy.get("[data-test='transaction-like-count']").should("have.text", "0");
    cy.get("[data-test='transaction-comment-count']").should("have.text", "0");
  });

  it("displays sender and receiver avatars", () => {
    cy.mount(
      <MemoryRouter>
        <TransactionItem transaction={baseTransaction} />
      </MemoryRouter>
    );

    cy.get(".MuiAvatar-root").should("have.length.at.least", 1);
  });

  it("is clickable and navigates to transaction detail", () => {
    cy.mount(
      <MemoryRouter>
        <TransactionItem transaction={baseTransaction} />
      </MemoryRouter>
    );

    cy.get(`[data-test='transaction-item-${baseTransaction.id}']`).should("be.visible").click();
  });

  describe("Transaction Amount Display", () => {
    it("displays negative amount for payment transactions", () => {
      const paymentTransaction: TransactionResponseItem = {
        ...baseTransaction,
        requestStatus: "",
      };

      cy.mount(
        <MemoryRouter>
          <TransactionItem transaction={paymentTransaction} />
        </MemoryRouter>
      );

      cy.get(`[data-test='transaction-amount-${paymentTransaction.id}']`)
        .should("be.visible")
        .and("contain", "-");
    });

    it("displays positive amount for request transactions", () => {
      const requestTransaction: TransactionResponseItem = {
        ...baseTransaction,
        requestStatus: TransactionRequestStatus.accepted,
      };

      cy.mount(
        <MemoryRouter>
          <TransactionItem transaction={requestTransaction} />
        </MemoryRouter>
      );

      cy.get(`[data-test='transaction-amount-${requestTransaction.id}']`)
        .should("be.visible")
        .and("contain", "+");
    });
  });
});
