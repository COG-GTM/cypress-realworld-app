import React from "react";
import { format as formatDate, parseISO } from "date-fns";
import { Avatar, Button, Chip, Grid, ListItem, ListItemAvatar, Typography } from "@mui/material";

import {
  ScheduledPaymentFrequency,
  ScheduledPaymentResponseItem,
  ScheduledPaymentStatus,
} from "../models";
import { formatAmount } from "../utils/transactionUtils";

const frequencyLabels: Record<ScheduledPaymentFrequency, string> = {
  [ScheduledPaymentFrequency.once]: "One time",
  [ScheduledPaymentFrequency.weekly]: "Weekly",
  [ScheduledPaymentFrequency.monthly]: "Monthly",
};

const statusLabels: Record<ScheduledPaymentStatus, string> = {
  [ScheduledPaymentStatus.active]: "Active",
  [ScheduledPaymentStatus.completed]: "Completed",
  [ScheduledPaymentStatus.canceled]: "Canceled",
};

const statusColors: Record<ScheduledPaymentStatus, "primary" | "success" | "default"> = {
  [ScheduledPaymentStatus.active]: "primary",
  [ScheduledPaymentStatus.completed]: "success",
  [ScheduledPaymentStatus.canceled]: "default",
};

export interface ScheduledPaymentListItemProps {
  scheduledPayment: ScheduledPaymentResponseItem;
  onCancel: (scheduledPayment: ScheduledPaymentResponseItem) => void;
}

const ScheduledPaymentListItem: React.FC<ScheduledPaymentListItemProps> = ({
  scheduledPayment,
  onCancel,
}) => {
  const { id, receiverName, receiverAvatar, amount, description, frequency, nextRunAt, status } =
    scheduledPayment;

  return (
    <ListItem data-test={`scheduled-payment-list-item-${id}`} divider>
      <ListItemAvatar>
        <Avatar src={receiverAvatar} alt={receiverName} />
      </ListItemAvatar>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography variant="body1" color="primary" data-test="scheduled-payment-receiver">
            {receiverName}
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            data-test="scheduled-payment-description"
          >
            {description}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <span data-test="scheduled-payment-frequency">
              {frequencyLabels[frequency] ?? "Other"}
            </span>
            {" · "}
            <span data-test="scheduled-payment-next-run">
              {nextRunAt
                ? `Next ${formatDate(parseISO(nextRunAt), "MMM d, yyyy")}`
                : "No upcoming run"}
            </span>
          </Typography>
        </Grid>
        <Grid item>
          <Grid container direction="row" alignItems="center" spacing={2}>
            <Grid item>
              <Typography variant="body1" data-test="scheduled-payment-amount">
                {formatAmount(amount)}
              </Typography>
            </Grid>
            <Grid item>
              <Chip
                size="small"
                label={statusLabels[status] ?? "Other"}
                color={statusColors[status] ?? "default"}
                data-test="scheduled-payment-status"
              />
            </Grid>
            {status === ScheduledPaymentStatus.active && (
              <Grid item>
                <Button
                  variant="outlined"
                  color="error"
                  data-test="scheduled-payment-cancel"
                  onClick={() => onCancel(scheduledPayment)}
                >
                  Cancel
                </Button>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </ListItem>
  );
};

export default ScheduledPaymentListItem;
