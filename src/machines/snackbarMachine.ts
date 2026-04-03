import { createMachine, assign } from "xstate";

export type SnackbarEvents = { type: "SHOW" } | { type: "HIDE" };
export enum Severities {
  success = "success",
  info = "info",
  warning = "warning",
  error = "error",
}
export interface SnackbarContext {
  severity?: Severities;
  message?: string;
}

export const snackbarMachine = createMachine(
  {
    id: "snackbar",
    initial: "invisible",
    types: {} as { context: SnackbarContext; events: SnackbarEvents },
    context: {
      severity: undefined,
      message: undefined,
    },
    states: {
      invisible: {
        entry: "resetSnackbar",
        on: { SHOW: "visible" },
      },
      visible: {
        entry: "setSnackbar",
        on: { HIDE: "invisible" },
        after: {
          // after 3 seconds, transition to invisible
          3000: "invisible",
        },
      },
    },
  },
  {
    actions: {
      setSnackbar: assign(({ event }) => ({
        severity: (event as any).severity,
        message: (event as any).message,
      })),
      resetSnackbar: assign(() => ({
        severity: undefined,
        message: undefined,
      })),
    },
  }
);
