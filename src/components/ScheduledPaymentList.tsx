import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { sortBy } from "lodash/fp";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
} from "@mui/material";

import { ScheduledPaymentResponseItem, ScheduledPaymentStatus } from "../models";
import { formatAmount } from "../utils/transactionUtils";
import ScheduledPaymentListItem from "./ScheduledPaymentListItem";
import EmptyList from "./EmptyList";

export interface ScheduledPaymentListProps {
  scheduledPayments: ScheduledPaymentResponseItem[];
  cancelScheduledPayment: (scheduledPayment: ScheduledPaymentResponseItem) => void;
}

// Active first; the API already orders by next run within each group
const activeFirst = sortBy<ScheduledPaymentResponseItem>(
  (scheduledPayment) => scheduledPayment.status !== ScheduledPaymentStatus.active
);

const ScheduledPaymentList: React.FC<ScheduledPaymentListProps> = ({
  scheduledPayments,
  cancelScheduledPayment,
}) => {
  const [pendingCancel, setPendingCancel] = useState<ScheduledPaymentResponseItem>();

  if (!scheduledPayments?.length) {
    return (
      <EmptyList entity="Scheduled Payments">
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/transaction/new"
          data-test="scheduled-payments-empty-create"
        >
          Schedule a payment
        </Button>
      </EmptyList>
    );
  }

  const closeDialog = () => setPendingCancel(undefined);

  return (
    <>
      <List data-test="scheduled-payment-list">
        {activeFirst(scheduledPayments).map((scheduledPayment) => (
          <ScheduledPaymentListItem
            key={scheduledPayment.id}
            scheduledPayment={scheduledPayment}
            onCancel={setPendingCancel}
          />
        ))}
      </List>
      <Dialog
        open={!!pendingCancel}
        onClose={closeDialog}
        data-test="scheduled-payment-cancel-dialog"
      >
        <DialogTitle>Cancel scheduled payment?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingCancel &&
              `${formatAmount(pendingCancel.amount)} to ${pendingCancel.receiverName} won't be sent again.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} data-test="scheduled-payment-cancel-dismiss">
            Keep it
          </Button>
          <Button
            color="error"
            variant="contained"
            data-test="scheduled-payment-cancel-confirm"
            onClick={() => {
              cancelScheduledPayment(pendingCancel!);
              closeDialog();
            }}
          >
            Cancel payment
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ScheduledPaymentList;
