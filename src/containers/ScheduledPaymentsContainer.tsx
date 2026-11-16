import React, { useEffect, useRef, useState } from "react";
import { styled } from "@mui/material/styles";
import { useActor, useMachine } from "@xstate/react";
import {
  BaseActionObject,
  Interpreter,
  ResolveTypegenMeta,
  ServiceMap,
  TypegenDisabled,
} from "xstate";
import { Alert, Button, Paper, Typography } from "@mui/material";

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
  const cancelPatched = useRef(false);
  const loadedOnce = useRef(false);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    sendScheduledPayments("FETCH");
  }, [sendScheduledPayments]);

  if (scheduledPaymentsState.matches("success")) {
    loadedOnce.current = true;
  }

  // dataMachine only moves from updating to loading once the PATCH succeeded
  const refetching = scheduledPaymentsState.matches("loading");
  useEffect(() => {
    if (refetching && cancelInFlight.current) {
      cancelPatched.current = true;
    }
  }, [refetching]);

  const settled = scheduledPaymentsState.matches("success")
    ? "success"
    : scheduledPaymentsState.matches("failure")
      ? "failure"
      : undefined;

  useEffect(() => {
    if (!settled) return;
    const wasCancel = cancelInFlight.current;
    const patched = cancelPatched.current;
    cancelInFlight.current = false;
    cancelPatched.current = false;

    if (wasCancel && !patched) {
      sendSnackbar({
        type: "SHOW",
        severity: "error",
        message: "Couldn't cancel the scheduled payment",
      });
      sendScheduledPayments("FETCH");
      return;
    }
    if (wasCancel) {
      sendSnackbar({ type: "SHOW", severity: "success", message: "Scheduled payment canceled" });
    }
    setLoadFailed(settled === "failure");
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
      {loadFailed && (
        <Alert
          severity="error"
          data-test="scheduled-payments-load-error"
          action={
            <Button
              color="inherit"
              size="small"
              data-test="scheduled-payments-retry"
              onClick={() => sendScheduledPayments("FETCH")}
            >
              Retry
            </Button>
          }
        >
          Couldn't load your scheduled payments.
        </Alert>
      )}
      {/* Keep the list mounted while a cancel refetches, so rows don't flicker */}
      {loadedOnce.current && (
        <ScheduledPaymentList
          scheduledPayments={scheduledPaymentsState.context.results!}
          cancelScheduledPayment={cancelScheduledPayment}
        />
      )}
    </StyledPaper>
  );
};

export default ScheduledPaymentsContainer;
