import TransactionListFilters from "./TransactionListFilters";

describe("TransactionListFilters", () => {
  beforeEach(() => {
    cy.viewport(1000, 660);
  });

  it("renders the default date and amount filters", () => {
    cy.mount(
      <TransactionListFilters
        sendFilterEvent={cy.spy()}
        dateRangeFilters={{}}
        amountRangeFilters={{}}
      />
    );

    cy.get("[data-test=transaction-list-filter-date-range-button]").should("contain", "ALL");
    cy.get("[data-test=transaction-list-filter-amount-range-button]").should(
      "contain",
      "Amount: $0 - $1,000"
    );
  });

  it("sends DATE_RESET when the date range is cleared", () => {
    const sendFilterEvent = cy.spy().as("sendFilterEvent");
    cy.mount(
      <TransactionListFilters
        sendFilterEvent={sendFilterEvent}
        dateRangeFilters={{
          dateRangeStart: new Date("Jan 01 2020").toISOString(),
          dateRangeEnd: new Date("Jan 05 2020").toISOString(),
        }}
        amountRangeFilters={{}}
      />
    );

    cy.get("[data-test=transaction-list-filter-date-clear-button]").click();

    cy.get("@sendFilterEvent").should("have.been.calledOnceWith", "DATE_RESET");
  });

  it("sends DATE_FILTER when a date range is picked", () => {
    const sendFilterEvent = cy.spy().as("sendFilterEvent");
    cy.mount(
      <TransactionListFilters
        sendFilterEvent={sendFilterEvent}
        dateRangeFilters={{}}
        amountRangeFilters={{}}
      />
    );

    const today = new Date();
    cy.pickDateRange(
      new Date(today.getFullYear(), today.getMonth(), 1),
      new Date(today.getFullYear(), today.getMonth(), 5)
    );

    cy.get("@sendFilterEvent").should("have.been.calledWithMatch", "DATE_FILTER", {
      dateRangeStart: Cypress.sinon.match.string,
      dateRangeEnd: Cypress.sinon.match.string,
    });
  });

  it("sends a debounced AMOUNT_FILTER when the slider changes", () => {
    const sendFilterEvent = cy.spy().as("sendFilterEvent");
    cy.mount(
      <TransactionListFilters
        sendFilterEvent={sendFilterEvent}
        dateRangeFilters={{}}
        amountRangeFilters={{}}
      />
    );

    cy.setTransactionAmountRange(20, 1000);

    cy.get("@sendFilterEvent").should("have.been.calledOnceWith", "AMOUNT_FILTER", {
      amountMin: 2000,
      amountMax: 100000,
    });
  });

  it("sends AMOUNT_RESET when the amount range is cleared", () => {
    const sendFilterEvent = cy.spy().as("sendFilterEvent");
    cy.mount(
      <TransactionListFilters
        sendFilterEvent={sendFilterEvent}
        dateRangeFilters={{}}
        amountRangeFilters={{ amountMin: 2000, amountMax: 50000 }}
      />
    );

    cy.get("[data-test=transaction-list-filter-amount-range-button]").click();
    cy.get("[data-test=transaction-list-filter-amount-clear-button]").click();

    cy.get("@sendFilterEvent").should("have.been.calledOnceWith", "AMOUNT_RESET");
  });
});
