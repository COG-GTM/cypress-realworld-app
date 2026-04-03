import { createMachine, assign } from "xstate";

type DateFilterEvent = {
  type: "DATE_FILTER";
  dateRangeStart: string;
  dateRangeEnd: string;
};
type AmountFilterEvent = {
  type: "AMOUNT_FILTER";
  amountMin: string;
  amountMax: string;
};
type DateResetEvent = { type: "DATE_RESET" };
type AmountResetEvent = { type: "AMOUNT_RESET" };
type FilterEvents =
  | { type: "NONE" }
  | DateFilterEvent
  | AmountFilterEvent
  | DateResetEvent
  | AmountResetEvent;

export interface FilterContext {}

export const transactionFiltersMachine = createMachine(
  {
    id: "filters",
    type: "parallel",
    types: {} as { context: FilterContext; events: FilterEvents },
    context: {},
    states: {
      dateRange: {
        initial: "none",
        states: {
          none: {
            entry: "resetDateRange",
            on: {
              DATE_FILTER: "filter",
            },
          },
          filter: {
            entry: "setDateRange",
            on: {
              DATE_RESET: "none",
            },
          },
        },
      },
      amountRange: {
        initial: "none",
        states: {
          none: {
            entry: "resetAmountRange",
            on: {
              AMOUNT_FILTER: "filter",
            },
          },
          filter: {
            entry: "setAmountRange",
            on: {
              AMOUNT_RESET: "none",
              AMOUNT_FILTER: "filter",
            },
          },
        },
      },
    },
  },
  {
    actions: {
      setDateRange: assign(({ event }) => ({
        dateRangeStart: (event as any).dateRangeStart,
        dateRangeEnd: (event as any).dateRangeEnd,
      })),
      resetDateRange: assign(() => ({
        dateRangeStart: undefined,
        dateRangeEnd: undefined,
      })),
      setAmountRange: assign(({ event }) => ({
        amountMin: (event as any).amountMin,
        amountMax: (event as any).amountMax,
      })),
      resetAmountRange: assign(() => ({
        amountMin: undefined,
        amountMax: undefined,
      })),
    },
  }
);
