import React, { useEffect } from "react";
import { styled } from "@mui/material/styles";
import type { AnyActorRef } from "xstate";
import { useSelector } from "@xstate/react";
import { Paper, Typography } from "@mui/material";
import { NotificationUpdatePayload } from "../models";
import NotificationList from "../components/NotificationList";

const PREFIX = "NotificationsContainer";

const classes = {
  paper: `${PREFIX}-paper`,
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  [`&.${classes.paper}`]: {
    minHeight: "90vh",
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
}));

export interface Props {
  authService: AnyActorRef;
  notificationsService: AnyActorRef;
}

const NotificationsContainer: React.FC<Props> = ({ authService, notificationsService }) => {
  const authState = useSelector(authService, (s: any) => s);
  const notificationsState = useSelector(notificationsService, (s: any) => s);

  useEffect(() => {
    notificationsService.send({ type: "FETCH" });
  }, [authState, notificationsService]);

  const updateNotification = (payload: NotificationUpdatePayload) =>
    notificationsService.send({ type: "UPDATE", ...payload });

  return (
    <StyledPaper className={classes.paper}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Notifications
      </Typography>
      <NotificationList
        notifications={notificationsState?.context?.results!}
        updateNotification={updateNotification}
      />
    </StyledPaper>
  );
};

export default NotificationsContainer;
