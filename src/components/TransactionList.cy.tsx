import { MemoryRouter } from "react-router-dom";
import TransactionList from "./TransactionList";
import {
  TransactionResponseItem,
  TransactionStatus,
  TransactionPagination,
  DefaultPrivacyLevel,
} from "../models";

const createTransaction = (id: string, senderName: string, receiverName: string): TransactionResponseItem => ({
  id,
  uuid: `uuid-${id}`,
  source: "",
  amount: 5000,
  description: `Payment ${id}`,
  privacyLevel: DefaultPrivacyLevel.public,
  receiverId: "user2",
  senderId: "user1",
  balanceAtCompletion: 10000,
  status: TransactionStatus.complete,
  createdAt: new Date("2024-01-01"),
  modifiedAt: new Date("2024-01-01"),
  likes: [],
  comments: [],
  receiverName,
  receiverAvatar: "https://example.com/avatar2.png",
  senderName,
  senderAvatar: "https://example.com/avatar1.png",
});

const pagination: TransactionPagination = {
  page: 1,
  limit: 10,
  hasNextPages: false,
  totalPages: 1,
};

describe("TransactionList", () => {
  it("renders a list of transactions", () => {
    const transactions = [
      createTransaction("txn1", "Alice", "Bob"),
      createTransaction("txn2", "Charlie", "Dave"),
    ];
    const loadNextPage = cy.stub();

    cy.mount(
      <MemoryRouter>
        <TransactionList
          header="Test Transactions"
          transactions={transactions}
          isLoading={false}
          loadNextPage={loadNextPage}
          pagination={pagination}
          filterComponent={<div />}
        />
      </MemoryRouter>
    );

    cy.contains("Test Transactions").should("be.visible");
    cy.get("[data-test='transaction-list']").should("exist");
  });

  it("renders empty state when there are no transactions", () => {
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
          filterComponent={<div />}
        />
      </MemoryRouter>
    );

    cy.get("[data-test='empty-list-header']").should("contain", "No Transactions");
    cy.get("[data-test='transaction-list-empty-create-transaction-button']").should("be.visible");
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
          filterComponent={<div />}
        />
      </MemoryRouter>
    );

    cy.get("[data-test='empty-list-header']").should("contain", "No Transactions");
    cy.get("[data-test='transaction-list-empty-create-transaction-button']").should("not.exist");
  });
});
