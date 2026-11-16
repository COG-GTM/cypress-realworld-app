import { omit } from "lodash/fp";
import { dataMachine } from "./dataMachine";
import { httpClient } from "../utils/asyncUtils";
import { backendPort } from "../utils/portUtils";
import { ScheduledPaymentStatus } from "../models";

export const scheduledPaymentsMachine = dataMachine("scheduledPayments").withConfig({
  services: {
    fetchData: async () => {
      const resp = await httpClient.get(`http://localhost:${backendPort}/scheduledPayments`);
      return resp.data;
    },
    // Cancel is the only update the API allows
    updateData: async (ctx, event: any) => {
      const payload = omit("type", event);
      const resp = await httpClient.patch(
        `http://localhost:${backendPort}/scheduledPayments/${payload.id}`,
        { status: ScheduledPaymentStatus.canceled }
      );
      return resp.data;
    },
  },
});
