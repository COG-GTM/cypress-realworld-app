import { isEmpty, omit } from "lodash/fp";
import { fromPromise } from "xstate";
import { dataMachine } from "./dataMachine";
import { httpClient } from "../utils/asyncUtils";
import { backendPort } from "../utils/portUtils";

export const notificationsMachine = dataMachine("notifications").provide({
  actors: {
    fetchData: fromPromise(async ({ input }: { input: any }) => {
      const payload = omit("type", input.event);
      const resp = await httpClient.get(`http://localhost:${backendPort}/notifications`, {
        params: !isEmpty(payload) && input.event.type === "FETCH" ? payload : undefined,
      });
      return resp.data;
    }),
    updateData: fromPromise(async ({ input }: { input: any }) => {
      const payload = omit("type", input.event);
      const resp = await httpClient.patch(
        `http://localhost:${backendPort}/notifications/${payload.id}`,
        payload
      );
      return resp.data;
    }),
  },
});
