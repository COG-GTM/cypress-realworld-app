import { MemoryRouter } from "react-router-dom";
import TransactionList from "./TransactionList";
import { TransactionResponseItem, TransactionStatus } from "../models";

const makeTx = (id: string): TransactionResponseItem => ({
  id,
  uuid: `uuid-${id}`,
  source: "",
  amount: 5000,
  description: `Payment ${id}`,
  privacyLevel: "public",
  receiverId: "user2",
  senderId: "user1",
  balanceAtCompletion: 10000,
  status: TransactionStatus.complete,
  requestStatus: "",
  createdAt: new Date("2023-01-15"),
  modifiedAt: new Date("2023-01-15"),
  likes: [],
  comments: [],
  receiverName: "Jane Doe",
  receiverAvatar: "",
  senderName: "John Doe",
  senderAvatar: "",
});

describe("TransactionList", () => {
  it("renders empty state with create button", () => {
    cy.mount(
      <MemoryRouter>
        <TransactionList
          header="Personal"
          transactions={[]}
          isLoading={false}
          showCreateButton={true}
          loadNextPage={cy.stub()}
          pagination={{ page: 1, limit: 10, hasNextPages: false, totalPages: 0 }}
          filterComponent={<div />}
        />
      </MemoryRouter>
    );

    cy.contains("Personal").should("exist");
    cy.get("[data-test=transaction-list-empty-create-transaction-button]").should("exist");
  });

  it("renders empty state without create button", () => {
    cy.mount(
      <MemoryRouter>
        <TransactionList
          header="Public"
          transactions={[]}
          isLoading={false}
          showCreateButton={false}
          loadNextPage={cy.stub()}
          pagination={{ page: 1, limit: 10, hasNextPages: false, totalPages: 0 }}
          filterComponent={<div />}
        />
      </MemoryRouter>
    );

    cy.contains("Public").should("exist");
    cy.get("[data-test=transaction-list-empty-create-transaction-button]").should("not.exist");
  });

  it("renders transactions when provided", () => {
    const transactions = [makeTx("t1"), makeTx("t2")];

    cy.mount(
      <MemoryRouter>
        <TransactionList
          header="Contacts"
          transactions={transactions}
          isLoading={false}
          loadNextPage={cy.stub()}
          pagination={{ page: 1, limit: 10, hasNextPages: false, totalPages: 1 }}
          filterComponent={<div />}
        />
      </MemoryRouter>
    );

    cy.contains("Contacts").should("exist");
    cy.get("[data-test=transaction-list]").should("exist");
  });
});
