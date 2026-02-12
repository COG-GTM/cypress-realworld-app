import React from "react";
import { MemoryRouter } from "react-router-dom";
import TransactionList from "./TransactionList";
import {
  TransactionResponseItem,
  TransactionStatus,
  TransactionPagination,
  DefaultPrivacyLevel,
} from "../models";

const transactions: TransactionResponseItem[] = [
  {
    id: "txn1",
    uuid: "uuid-1",
    source: "",
    amount: 5000,
    description: "Payment one",
    privacyLevel: DefaultPrivacyLevel.public,
    receiverId: "user2",
    senderId: "user1",
    balanceAtCompletion: 10000,
    status: TransactionStatus.complete,
    createdAt: new Date("2024-01-01"),
    modifiedAt: new Date("2024-01-01"),
    likes: [],
    comments: [],
    receiverName: "Jane Doe",
    receiverAvatar: "https://example.com/avatar2.png",
    senderName: "John Smith",
    senderAvatar: "https://example.com/avatar1.png",
  },
  {
    id: "txn2",
    uuid: "uuid-2",
    source: "",
    amount: 3000,
    description: "Payment two",
    privacyLevel: DefaultPrivacyLevel.public,
    receiverId: "user1",
    senderId: "user2",
    balanceAtCompletion: 7000,
    status: TransactionStatus.complete,
    createdAt: new Date("2024-01-02"),
    modifiedAt: new Date("2024-01-02"),
    likes: [],
    comments: [],
    receiverName: "John Smith",
    receiverAvatar: "https://example.com/avatar1.png",
    senderName: "Jane Doe",
    senderAvatar: "https://example.com/avatar2.png",
  },
];

const pagination: TransactionPagination = {
  page: 1,
  limit: 10,
  hasNextPages: false,
  totalPages: 1,
};

describe("TransactionList", () => {
  it("renders a list of transactions", () => {
    const loadNextPage = cy.stub();

    cy.mount(
      <MemoryRouter>
        <TransactionList
          header="Test Transactions"
          transactions={transactions}
          isLoading={false}
          loadNextPage={loadNextPage}
          pagination={pagination}
          filterComponent={<div data-test="filter" />}
        />
      </MemoryRouter>
    );

    cy.contains("Test Transactions").should("be.visible");
    cy.get("[data-test='transaction-list']").should("exist");
  });

  it("renders empty state when no transactions", () => {
    const loadNextPage = cy.stub();

    cy.mount(
      <MemoryRouter>
        <TransactionList
          header="Test Transactions"
          transactions={[]}
          isLoading={false}
          showCreateButton={true}
          loadNextPage={loadNextPage}
          pagination={pagination}
          filterComponent={<div data-test="filter" />}
        />
      </MemoryRouter>
    );

    cy.get("[data-test='empty-list-header']").should("contain", "No Transactions");
    cy.get("[data-test='transaction-list-empty-create-transaction-button']").should("exist");
  });

  it("renders empty state without create button", () => {
    const loadNextPage = cy.stub();

    cy.mount(
      <MemoryRouter>
        <TransactionList
          header="Test Transactions"
          transactions={[]}
          isLoading={false}
          showCreateButton={false}
          loadNextPage={loadNextPage}
          pagination={pagination}
          filterComponent={<div data-test="filter" />}
        />
      </MemoryRouter>
    );

    cy.get("[data-test='empty-list-header']").should("contain", "No Transactions");
    cy.get("[data-test='transaction-list-empty-create-transaction-button']").should("not.exist");
  });
});
