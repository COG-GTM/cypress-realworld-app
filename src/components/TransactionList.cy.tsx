import { MemoryRouter } from "react-router-dom";
import TransactionList from "./TransactionList";

describe("TransactionList", () => {
  it("renders the header", () => {
    const loadNextPage = cy.stub();
    cy.mount(
      <MemoryRouter>
        <TransactionList
          header="Public Transactions"
          transactions={[]}
          isLoading={false}
          loadNextPage={loadNextPage}
          pagination={{ page: 1, limit: 10, count: 0, totalPages: 0, hasNextPages: false }}
          filterComponent={<div />}
        />
      </MemoryRouter>
    );

    cy.contains("Public Transactions").should("be.visible");
  });

  it("renders empty state when no transactions", () => {
    const loadNextPage = cy.stub();
    cy.mount(
      <MemoryRouter>
        <TransactionList
          header="Transactions"
          transactions={[]}
          isLoading={false}
          loadNextPage={loadNextPage}
          pagination={{ page: 1, limit: 10, count: 0, totalPages: 0, hasNextPages: false }}
          filterComponent={<div />}
        />
      </MemoryRouter>
    );

    cy.contains("No Transactions").should("be.visible");
  });

  it("renders create transaction button in empty state when showCreateButton is true", () => {
    const loadNextPage = cy.stub();
    cy.mount(
      <MemoryRouter>
        <TransactionList
          header="Transactions"
          transactions={[]}
          isLoading={false}
          showCreateButton={true}
          loadNextPage={loadNextPage}
          pagination={{ page: 1, limit: 10, count: 0, totalPages: 0, hasNextPages: false }}
          filterComponent={<div />}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=transaction-list-empty-create-transaction-button]")
      .should("be.visible")
      .and("contain", "Create A Transaction");
  });

  it("renders filter component", () => {
    const loadNextPage = cy.stub();
    cy.mount(
      <MemoryRouter>
        <TransactionList
          header="Transactions"
          transactions={[]}
          isLoading={false}
          loadNextPage={loadNextPage}
          pagination={{ page: 1, limit: 10, count: 0, totalPages: 0, hasNextPages: false }}
          filterComponent={<div data-test="custom-filter">Filter</div>}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=custom-filter]").should("be.visible").and("contain", "Filter");
  });
});
