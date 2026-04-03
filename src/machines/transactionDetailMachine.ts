import { omit, flow, first, isEmpty } from "lodash/fp";
import { fromPromise } from "xstate";
import { dataMachine } from "./dataMachine";
import { httpClient } from "../utils/asyncUtils";
import { backendPort } from "../utils/portUtils";

export const transactionDetailMachine = dataMachine("transactionData").provide({
  actors: {
    fetchData: fromPromise(async ({ input }: { input: any }) => {
      const payload = omit("type", input.event);
      const contextTransactionId =
        !isEmpty(input.context.results) && first(input.context.results)["id"];
      const transactionId = contextTransactionId || payload.transactionId;
      const resp = await httpClient.get(
        `http://localhost:${backendPort}/transactions/${transactionId}`
      );
      // @ts-ignore
      return { results: [resp.data.transaction] };
    }),
    createData: fromPromise(async ({ input }: { input: any }) => {
      let route = input.event.entity === "LIKE" ? "likes" : "comments";
      const payload = flow(omit("type"), omit("entity"))(input.event);
      const resp = await httpClient.post(
        `http://localhost:${backendPort}/${route}/${payload.transactionId}`,
        payload
      );
      return resp.data;
    }),
    updateData: fromPromise(async ({ input }: { input: any }) => {
      const payload = omit("type", input.event);
      const contextTransactionId =
        !isEmpty(input.context.results) && first(input.context.results)["id"];
      const transactionId = contextTransactionId || payload.id;
      const resp = await httpClient.patch(
        `http://localhost:${backendPort}/transactions/${transactionId}`,
        payload
      );
      return resp.data;
    }),
  },
});
