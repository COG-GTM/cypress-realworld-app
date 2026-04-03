import { createMachine } from "xstate";

export type UserOnboardingMachineEvents = { type: "PREV" } | { type: "NEXT" };

export interface UserOnboardingMachineContext {}

export const userOnboardingMachine = createMachine({
  id: "userOnboarding",
  initial: "stepOne",
  types: {} as {
    context: UserOnboardingMachineContext;
    events: UserOnboardingMachineEvents;
  },
  states: {
    idle: {
      on: {
        NEXT: "stepOne",
      },
    },
    stepOne: {
      on: {
        NEXT: "stepTwo",
      },
    },
    stepTwo: {
      on: {
        PREV: "stepOne",
        NEXT: "stepThree",
      },
    },
    stepThree: {
      on: {
        PREV: "stepTwo",
        NEXT: "done",
      },
    },
    done: {
      type: "final",
    },
  },
});
