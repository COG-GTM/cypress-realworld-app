import React, { useEffect, useRef } from "react";
import { styled } from "@mui/material/styles";
import { useActor, useMachine } from "@xstate/react";
import {
  BaseActionObject,
  Interpreter,
  ResolveTypegenMeta,
  ServiceMap,
  TypegenDisabled,
} from "xstate";
import { Paper, Typography } from "@mui/material";

import { ScheduledPaymentResponseItem } from "../models";
import { scheduledPaymentsMachine } from "../machines/scheduledPaymentsMachine";
import { SnackbarContext, SnackbarEvents, SnackbarSchema } from "../machines/snackbarMachine";
import ScheduledPaymentList from "../components/ScheduledPaymentList";

const PREFIX = "ScheduledPaymentsContainer";

const classes = {
  paper: `${PREFIX}-paper`,
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  [`&.${classes.paper}`]: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
}));

export interface Props {
  snackbarService: Interpreter<
    SnackbarContext,
    SnackbarSchema,
    SnackbarEvents,
    any,
    ResolveTypegenMeta<TypegenDisabled, SnackbarEvents, BaseActionObject, ServiceMap>
  >;
}

const ScheduledPaymentsContainer: React.FC<Props> = ({ snackbarService }) => {
  const [, sendSnackbar] = useActor(snackbarService);
  const [scheduledPaymentsState, sendScheduledPayments] = useMachine(scheduledPaymentsMachine);
  const cancelInFlight = useRef(false);
  const loadedOnce = useRef(false);

  useEffect(() => {
    sendScheduledPayments("FETCH");
  }, [sendScheduledPayments]);

  if (scheduledPaymentsState.matches("success")) {
    loadedOnce.current = true;
  }

  const settled = scheduledPaymentsState.matches("success")
    ? "success"
    : scheduledPaymentsState.matches("failure")
      ? "failure"
      : undefined;

  useEffect(() => {
    if (!cancelInFlight.current || !settled) return;
    cancelInFlight.current = false;
    if (settled === "success") {
      sendSnackbar({ type: "SHOW", severity: "success", message: "Scheduled payment canceled" });
    } else {
      sendSnackbar({
        type: "SHOW",
        severity: "error",
        message: "Couldn't cancel the scheduled payment",
      });
      sendScheduledPayments("FETCH");
    }
  }, [settled, sendSnackbar, sendScheduledPayments]);

  const cancelScheduledPayment = ({ id }: ScheduledPaymentResponseItem) => {
    cancelInFlight.current = true;
    sendScheduledPayments({ type: "UPDATE", id } as any);
  };

  return (
    <StyledPaper className={classes.paper}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Scheduled Payments
      </Typography>
      {/* Keep the list mounted while a cancel refetches, so rows don't flicker */}
      {(loadedOnce.current || scheduledPaymentsState.matches("failure")) && (
        <ScheduledPaymentList
          scheduledPayments={scheduledPaymentsState.context.results!}
          cancelScheduledPayment={cancelScheduledPayment}
        />
      )}
    </StyledPaper>
  );
};

export default ScheduledPaymentsContainer;
