import { createMachine, assign } from "xstate";
import { concat } from "lodash/fp";

type SuccessEvent = { type: "SUCCESS"; results: any[]; pageData: object };
type FailureEvent = { type: "FAILURE"; message: string };
export type DataEvents =
  | { type: "FETCH" }
  | { type: "UPDATE" }
  | { type: "CREATE" }
  | { type: "DELETE" }
  | SuccessEvent
  | FailureEvent;

export interface DataContext {
  pageData?: object;
  results?: any[];
  message?: string;
}

export const dataMachine = (machineId: string) =>
  createMachine(
    {
      id: machineId,
      initial: "idle",
      types: {} as { context: DataContext; events: DataEvents },
      context: {
        pageData: {},
        results: [],
        message: undefined,
      },
      states: {
        idle: {
          on: {
            FETCH: "loading",
            CREATE: "creating",
            UPDATE: "updating",
            DELETE: "deleting",
          },
        },
        loading: {
          invoke: {
            src: "fetchData",
            input: ({ context, event }) => ({ context, event }),
            onDone: { target: "success" },
            onError: { target: "failure", actions: "setMessage" },
          },
        },
        updating: {
          invoke: {
            src: "updateData",
            input: ({ context, event }) => ({ context, event }),
            onDone: { target: "loading" },
            onError: { target: "failure", actions: "setMessage" },
          },
        },
        creating: {
          invoke: {
            src: "createData",
            input: ({ context, event }) => ({ context, event }),
            onDone: { target: "loading" },
            onError: { target: "failure", actions: "setMessage" },
          },
        },
        deleting: {
          invoke: {
            src: "deleteData",
            input: ({ context, event }) => ({ context, event }),
            onDone: { target: "loading" },
            onError: { target: "failure", actions: "setMessage" },
          },
        },
        success: {
          entry: ["setResults", "setPageData"],
          on: {
            FETCH: "loading",
            CREATE: "creating",
            UPDATE: "updating",
            DELETE: "deleting",
          },
          initial: "unknown",
          states: {
            unknown: {
              always: [{ target: "withData", guard: "hasData" }, { target: "withoutData" }],
            },
            withData: {},
            withoutData: {},
          },
        },
        failure: {
          entry: ["setMessage"],
          on: {
            FETCH: "loading",
          },
        },
      },
    },
    {
      actions: {
        setResults: assign(({ context, event }) => ({
          results:
            (event as any).output &&
            (event as any).output.pageData &&
            (event as any).output.pageData.page > 1
              ? concat(context.results, (event as any).output.results)
              : (event as any).output.results,
        })),
        setPageData: assign(({ event }) => ({
          pageData: (event as any).output.pageData,
        })),

        setMessage: /* istanbul ignore next */ assign(({ event }) => ({
          message: (event as any).error?.message || (event as any).message,
        })),
      },
      guards: {
        hasData: ({ context }) => !!context.results && context.results.length > 0,
      },
    }
  );
