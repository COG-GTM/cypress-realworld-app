import { createMachine } from "xstate";

export const drawerMachine = createMachine(
  {
    id: "drawer",
    type: "parallel",
    states: {
      desktop: {
        initial: "open",
        states: {
          closed: {
            on: {
              TOGGLE_DESKTOP: "open",
              OPEN_DESKTOP: { target: "open", guard: "shouldOpenDesktop" },
            },
          },
          open: {
            on: { TOGGLE_DESKTOP: "closed", CLOSE_DESKTOP: "closed" },
          },
          hist: {
            type: "history",
          },
        },
      },
      mobile: {
        initial: "closed",
        states: {
          closed: {
            on: { TOGGLE_MOBILE: "open", OPEN_MOBILE: "open" },
          },
          open: {
            on: { TOGGLE_MOBILE: "closed", CLOSE_MOBILE: "closed" },
          },
        },
      },
    },
  },
  {
    guards: {
      shouldOpenDesktop: ({ context }) => {
        return true;
      },
    },
  }
);
