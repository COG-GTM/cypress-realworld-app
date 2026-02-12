import { MemoryRouter } from "react-router-dom";
import TransactionItem from "./TransactionItem";
import { TransactionResponseItem } from "../models";

describe("TransactionItem", () => {
  const transaction: TransactionResponseItem = {
    id: "tx-1",
    uuid: "uuid-1",
    source: "",
    amount: 5000,
    description: "Lunch payment",
    privacyLevel: "public" as any,
    receiverId: "user-2",
    senderId: "user-1",
    status: "complete" as any,
    requestStatus: "",
    createdAt: new Date(),
    modifiedAt: new Date(),
    likes: [
      {
        id: "like-1",
        uuid: "l-uuid",
        userId: "user-3",
        transactionId: "tx-1",
        createdAt: new Date(),
        modifiedAt: new Date(),
      },
    ],
    comments: [
      {
        id: "comment-1",
        uuid: "c-uuid",
        content: "Nice!",
        userId: "user-3",
        transactionId: "tx-1",
        createdAt: new Date(),
        modifiedAt: new Date(),
      },
    ],
    receiverName: "Bob Jones",
    receiverAvatar: "https://example.com/bob.svg",
    senderName: "Alice Smith",
    senderAvatar: "https://example.com/alice.svg",
  };

  it("renders transaction description", () => {
    cy.mount(
      <MemoryRouter>
        <TransactionItem transaction={transaction} />
      </MemoryRouter>
    );

    cy.contains("Lunch payment").should("be.visible");
  });

  it("renders like and comment counts", () => {
    cy.mount(
      <MemoryRouter>
        <TransactionItem transaction={transaction} />
      </MemoryRouter>
    );

    cy.get("[data-test=transaction-like-count]").should("contain", "1");
    cy.get("[data-test=transaction-comment-count]").should("contain", "1");
  });

  it("renders with correct data-test attribute", () => {
    cy.mount(
      <MemoryRouter>
        <TransactionItem transaction={transaction} />
      </MemoryRouter>
    );

    cy.get("[data-test=transaction-item-tx-1]").should("be.visible");
  });
});
