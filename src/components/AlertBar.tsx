import React from "react";
import { Snackbar } from "@mui/material";
import type { AnyActorRef } from "xstate";
import { useActor } from "@xstate/react";
import { Alert } from "@mui/material";

interface Props {
  snackbarService: AnyActorRef;
}

const AlertBar: React.FC<Props> = ({ snackbarService }) => {
  const [snackbarState] = useActor(snackbarService);

  return (
    <Snackbar
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      open={snackbarState?.matches("visible")}
      autoHideDuration={3000}
    >
      <Alert
        data-test={`alert-bar-${snackbarState?.context.severity}`}
        elevation={6}
        variant="filled"
        severity={snackbarState?.context.severity}
      >
        {snackbarState?.context.message}
      </Alert>
    </Snackbar>
  );
};

export default AlertBar;
