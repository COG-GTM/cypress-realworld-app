import { describe, expect, it } from "vitest";
import { transactionFiltersMachine } from "../../machines/transactionFiltersMachine";

describe("transactionFiltersMachine", () => {
  it("should have correct initial state", () => {
    const initialState = transactionFiltersMachine.initialState;
    expect(initialState.value).toEqual({
      dateRange: "none",
      amountRange: "none",
    });
  });

  describe("dateRange", () => {
    it("should transition from none to filter on DATE_FILTER", () => {
      const nextState = transactionFiltersMachine.transition(
        transactionFiltersMachine.initialState,
        {
          type: "DATE_FILTER",
          dateRangeStart: "2023-01-01",
          dateRangeEnd: "2023-12-31",
        }
      );
      expect(nextState.value).toEqual({
        dateRange: "filter",
        amountRange: "none",
      });
    });

    it("should transition from filter to none on DATE_RESET", () => {
      const filterState = transactionFiltersMachine.transition(
        transactionFiltersMachine.initialState,
        {
          type: "DATE_FILTER",
          dateRangeStart: "2023-01-01",
          dateRangeEnd: "2023-12-31",
        }
      );
      const nextState = transactionFiltersMachine.transition(filterState, "DATE_RESET");
      expect(nextState.value).toEqual({
        dateRange: "none",
        amountRange: "none",
      });
    });

    it("should not respond to DATE_RESET when already in none", () => {
      const nextState = transactionFiltersMachine.transition(
        transactionFiltersMachine.initialState,
        "DATE_RESET"
      );
      expect(nextState.value).toEqual({
        dateRange: "none",
        amountRange: "none",
      });
    });
  });

  describe("amountRange", () => {
    it("should transition from none to filter on AMOUNT_FILTER", () => {
      const nextState = transactionFiltersMachine.transition(
        transactionFiltersMachine.initialState,
        {
          type: "AMOUNT_FILTER",
          amountMin: "0",
          amountMax: "1000",
        }
      );
      expect(nextState.value).toEqual({
        dateRange: "none",
        amountRange: "filter",
      });
    });

    it("should transition from filter to none on AMOUNT_RESET", () => {
      const filterState = transactionFiltersMachine.transition(
        transactionFiltersMachine.initialState,
        {
          type: "AMOUNT_FILTER",
          amountMin: "0",
          amountMax: "1000",
        }
      );
      const nextState = transactionFiltersMachine.transition(filterState, "AMOUNT_RESET");
      expect(nextState.value).toEqual({
        dateRange: "none",
        amountRange: "none",
      });
    });

    it("should allow AMOUNT_FILTER while in filter state", () => {
      const filterState = transactionFiltersMachine.transition(
        transactionFiltersMachine.initialState,
        {
          type: "AMOUNT_FILTER",
          amountMin: "0",
          amountMax: "1000",
        }
      );
      const nextState = transactionFiltersMachine.transition(filterState, {
        type: "AMOUNT_FILTER",
        amountMin: "100",
        amountMax: "500",
      });
      expect(nextState.value).toEqual({
        dateRange: "none",
        amountRange: "filter",
      });
    });
  });

  describe("parallel state combinations", () => {
    it("should allow both date and amount filters simultaneously", () => {
      let state = transactionFiltersMachine.initialState;

      state = transactionFiltersMachine.transition(state, {
        type: "DATE_FILTER",
        dateRangeStart: "2023-01-01",
        dateRangeEnd: "2023-12-31",
      });

      state = transactionFiltersMachine.transition(state, {
        type: "AMOUNT_FILTER",
        amountMin: "0",
        amountMax: "1000",
      });

      expect(state.value).toEqual({
        dateRange: "filter",
        amountRange: "filter",
      });
    });

    it("should reset date filter while keeping amount filter", () => {
      let state = transactionFiltersMachine.initialState;

      state = transactionFiltersMachine.transition(state, {
        type: "DATE_FILTER",
        dateRangeStart: "2023-01-01",
        dateRangeEnd: "2023-12-31",
      });

      state = transactionFiltersMachine.transition(state, {
        type: "AMOUNT_FILTER",
        amountMin: "0",
        amountMax: "1000",
      });

      state = transactionFiltersMachine.transition(state, "DATE_RESET");

      expect(state.value).toEqual({
        dateRange: "none",
        amountRange: "filter",
      });
    });
  });
});
