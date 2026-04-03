import { omit } from "lodash/fp";
import { createMachine, assign, sendTo, fromPromise } from "xstate";
import { dataMachine } from "./dataMachine";
import { httpClient } from "../utils/asyncUtils";
import { User, TransactionCreatePayload } from "../models";
import { authService } from "./authMachine";
import { backendPort } from "../utils/portUtils";

const transactionDataMachine = dataMachine("transactionData").provide({
  actors: {
    createData: fromPromise(async ({ input }: { input: any }) => {
      const payload = omit("type", input.event);
      const resp = await httpClient.post(`http://localhost:${backendPort}/transactions`, payload);
      authService.send({ type: "REFRESH" });
      return resp.data;
    }),
  },
});

export type CreateTransactionMachineEvents =
  | { type: "SET_USERS" }
  | { type: "CREATE" }
  | { type: "RESET" };

export interface CreateTransactionMachineContext {
  sender: User;
  receiver: User;
  transactionDetails: TransactionCreatePayload;
}

export const createTransactionMachine = createMachine(
  {
    id: "createTransaction",
    initial: "stepOne",
    types: {} as {
      context: CreateTransactionMachineContext;
      events: CreateTransactionMachineEvents;
    },
    states: {
      stepOne: {
        entry: "clearContext",
        on: {
          SET_USERS: "stepTwo",
        },
      },
      stepTwo: {
        entry: "setSenderAndReceiver",
        invoke: {
          id: "transactionDataMachine",
          src: transactionDataMachine,
        },
        on: {
          CREATE: {
            target: "stepThree",
            actions: sendTo("transactionDataMachine", ({ event }) => event),
          },
        },
      },
      stepThree: {
        entry: "setTransactionDetails",
        on: {
          RESET: "stepOne",
        },
      },
    },
  },
  {
    actions: {
      setSenderAndReceiver: assign(({ event }) => ({
        sender: (event as any).sender,
        receiver: (event as any).receiver,
      })),
      setTransactionDetails: assign(({ event }) => ({
        transactionDetails: event as any,
      })),
      clearContext: assign(() => ({})),
    },
  }
);
