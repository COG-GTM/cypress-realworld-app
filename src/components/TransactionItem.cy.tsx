import { MemoryRouter } from "react-router-dom";
import TransactionItem from "./TransactionItem";
import { TransactionResponseItem, TransactionStatus, DefaultPrivacyLevel } from "../models";

const transaction: TransactionResponseItem = {
  id: "txn123",
  uuid: "a1b2c3d4",
  source: "",
  amount: 5000,
  description: "Test payment",
  privacyLevel: DefaultPrivacyLevel.public,
  receiverId: "user2",
  senderId: "user1",
  balanceAtCompletion: 10000,
  status: TransactionStatus.complete,
  createdAt: new Date("2024-01-01"),
  modifiedAt: new Date("2024-01-01"),
  likes: [
    {
      id: "like1",
      uuid: "like-uuid-1",
      userId: "user3",
      transactionId: "txn123",
      createdAt: new Date("2024-01-01"),
      modifiedAt: new Date("2024-01-01"),
    },
  ],
  comments: [
    {
      id: "comment1",
      uuid: "comment-uuid-1",
      content: "Nice!",
      userId: "user3",
      transactionId: "txn123",
      createdAt: new Date("2024-01-01"),
      modifiedAt: new Date("2024-01-01"),
    },
  ],
  receiverName: "Jane Doe",
  receiverAvatar: "https://example.com/avatar2.png",
  senderName: "John Smith",
  senderAvatar: "https://example.com/avatar1.png",
};

describe("TransactionItem", () => {
  it("renders transaction details", () => {
    cy.mount(
      <MemoryRouter>
        <TransactionItem transaction={transaction} />
      </MemoryRouter>
    );

    cy.get(`[data-test="transaction-sender-${transaction.id}"]`).should("contain", "John Smith");
    cy.get(`[data-test="transaction-receiver-${transaction.id}"]`).should("contain", "Jane Doe");
    cy.get(`[data-test="transaction-like-count"]`).should("contain", "1");
    cy.get(`[data-test="transaction-comment-count"]`).should("contain", "1");
    cy.get(`[data-test="transaction-amount-${transaction.id}"]`).should("exist");
    cy.contains("Test payment").should("be.visible");
  });

  it("handles click to navigate to transaction detail", () => {
    cy.mount(
      <MemoryRouter>
        <TransactionItem transaction={transaction} />
      </MemoryRouter>
    );

    cy.get(`[data-test="transaction-item-${transaction.id}"]`).click();
  });
});
