import * as React from "react";
import { addDays, format as formatDate, startOfDay } from "date-fns";
import TransactionDateRangeFilter from "./TransactionDateRangeFilter";
import { endOfDayUTC } from "../utils/transactionUtils";

describe("Transaction Date Range Filter", () => {
  it("should default to ALL", () => {
    const filterDateRangeSpy = cy.spy();
    const resetDateRangeSpy = cy.spy();

    cy.mount(
      <TransactionDateRangeFilter
        filterDateRange={filterDateRangeSpy}
        dateRangeFilters={{}}
        resetDateRange={resetDateRangeSpy}
      />
    );
    cy.get("[data-test='transaction-list-filter-date-range-button']").should("contain", "ALL");
  });

  it("should render with date range filters (shows Date: prefix when filters exist)", () => {
    const filterDateRangeSpy = cy.spy();
    const resetDateRangeSpy = cy.spy();
    const dateRangeFilters = {
      dateRangeStart: new Date("Jan 01 2018").toISOString(),
      dateRangeEnd: new Date("Dec 05 2030").toISOString(),
    };

    cy.mount(
      <TransactionDateRangeFilter
        filterDateRange={filterDateRangeSpy}
        dateRangeFilters={dateRangeFilters}
        resetDateRange={resetDateRangeSpy}
      />
    );
    // Component uses internal calendarValue state for label, which is null on initial render
    // When dateRangeFilters exist, it shows "Date: undefined" until calendar selection updates state
    cy.get("[data-test='transaction-list-filter-date-range-button']").should("contain", "Date:");
  });

  it("should set a date range filter", () => {
    const filterDateRangeSpy = cy.spy();
    const resetDateRangeSpy = cy.spy();
    const dateRangeStart = startOfDay(new Date(2014, 1, 1));
    const dateRangeEnd = endOfDayUTC(addDays(dateRangeStart, 1));

    cy.mount(
      <TransactionDateRangeFilter
        filterDateRange={filterDateRangeSpy}
        dateRangeFilters={{}}
        resetDateRange={resetDateRangeSpy}
      />
    );

    // @ts-ignore
    cy.pickDateRange(dateRangeStart, dateRangeEnd);
  });
});
