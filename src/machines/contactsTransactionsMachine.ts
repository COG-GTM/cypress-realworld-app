import { isEmpty, omit } from "lodash/fp";
import { fromPromise } from "xstate";
import { dataMachine } from "./dataMachine";
import { httpClient } from "../utils/asyncUtils";
import { backendPort } from "../utils/portUtils";

export const contactsTransactionsMachine = dataMachine("contactsTransactions").provide({
  actors: {
    fetchData: fromPromise(async ({ input }: { input: any }) => {
      const payload = omit("type", input.event);
      const resp = await httpClient.get(`http://localhost:${backendPort}/transactions/contacts`, {
        params: !isEmpty(payload) ? payload : undefined,
      });
      return resp.data;
    }),
  },
});
