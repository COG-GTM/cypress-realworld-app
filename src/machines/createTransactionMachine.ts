import { omit } from "lodash/fp";
import { Machine, assign } from "xstate";
import { dataMachine } from "./dataMachine";
import { httpClient } from "../utils/asyncUtils";
import { User, TransactionCreatePayload, ScheduledPaymentPayload } from "../models";
import { authService } from "./authMachine";
import { backendPort } from "../utils/portUtils";

export interface CreateTransactionMachineSchema {
  states: {
    stepOne: {};
    stepTwo: {};
    stepThree: {};
  };
}

const transactionDataMachine = dataMachine("transactionData").withConfig({
  services: {
    createData: async (ctx, event: any) => {
      if (event.transactionType === "schedule") {
        // No balance refresh: nothing is debited until the schedule runs
        const resp = await httpClient.post(
          `http://localhost:${backendPort}/scheduledPayments`,
          omit(["type", "transactionType"], event)
        );
        return resp.data;
      }
      const payload = omit("type", event);
      const resp = await httpClient.post(`http://localhost:${backendPort}/transactions`, payload);
      authService.send("REFRESH");
      return resp.data;
    },
  },
});

export type CreateTransactionMachineEvents =
  | { type: "SET_USERS" }
  | { type: "CREATE" }
  | { type: "RESET" };

export type ScheduledTransactionCreatePayload = ScheduledPaymentPayload & {
  transactionType: "schedule";
};

export const isScheduledTransactionCreatePayload = (
  details?: TransactionCreatePayload | ScheduledTransactionCreatePayload
): details is ScheduledTransactionCreatePayload => details?.transactionType === "schedule";

export interface CreateTransactionMachineContext {
  sender: User;
  receiver: User;
  transactionDetails: TransactionCreatePayload | ScheduledTransactionCreatePayload;
}

export const createTransactionMachine = Machine<
  CreateTransactionMachineContext,
  CreateTransactionMachineSchema,
  CreateTransactionMachineEvents
>(
  {
    id: "createTransaction",
    initial: "stepOne",
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
          autoForward: true,
        },
        on: {
          CREATE: "stepThree",
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
      setSenderAndReceiver: assign((ctx, event: any) => ({
        sender: event.sender,
        receiver: event.receiver,
      })),
      setTransactionDetails: assign((ctx, event: any) => ({
        transactionDetails: event,
      })),
      clearContext: assign((ctx, event: any) => ({})),
    },
  }
);
