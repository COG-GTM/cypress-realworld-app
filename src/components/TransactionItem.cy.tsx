import { MemoryRouter } from "react-router-dom";
import TransactionItem from "./TransactionItem";
import { TransactionResponseItem, TransactionRequestStatus, TransactionStatus } from "../models";

const transaction: TransactionResponseItem = {
  id: "tx1",
  uuid: "uuid-1",
  source: "",
  amount: 5000,
  description: "Test payment",
  privacyLevel: "public",
  receiverId: "user2",
  senderId: "user1",
  balanceAtCompletion: 10000,
  status: TransactionStatus.complete,
  requestStatus: "",
  createdAt: new Date("2023-01-15"),
  modifiedAt: new Date("2023-01-15"),
  likes: [
    {
      id: "l1",
      uuid: "lu1",
      userId: "user3",
      transactionId: "tx1",
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
  ],
  comments: [
    {
      id: "c1",
      uuid: "cu1",
      content: "Nice",
      userId: "user3",
      transactionId: "tx1",
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
  ],
  receiverName: "Jane Doe",
  receiverAvatar: "https://example.com/avatar2.png",
  senderName: "John Doe",
  senderAvatar: "https://example.com/avatar1.png",
};

describe("TransactionItem", () => {
  it("renders transaction details", () => {
    cy.mount(
      <MemoryRouter>
        <TransactionItem transaction={transaction} />
      </MemoryRouter>
    );

    cy.get(`[data-test=transaction-item-${transaction.id}]`).should("exist");
    cy.get("[data-test=transaction-like-count]").should("contain", "1");
    cy.get("[data-test=transaction-comment-count]").should("contain", "1");
    cy.contains("Test payment").should("exist");
  });

  it("renders a request transaction", () => {
    const requestTx: TransactionResponseItem = {
      ...transaction,
      id: "tx2",
      requestStatus: TransactionRequestStatus.pending,
    };

    cy.mount(
      <MemoryRouter>
        <TransactionItem transaction={requestTx} />
      </MemoryRouter>
    );

    cy.get(`[data-test=transaction-item-${requestTx.id}]`).should("exist");
  });
});
