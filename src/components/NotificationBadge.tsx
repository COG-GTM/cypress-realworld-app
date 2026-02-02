import React from "react";
import { styled } from "@mui/material/styles";
import { Badge, IconButton } from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

const PREFIX = "NotificationBadge";

const classes = {
  customBadge: `${PREFIX}-customBadge`,
};

const StyledIconButton = styled(IconButton)(() => ({
  [`& .${classes.customBadge}`]: {
    backgroundColor: "red",
    color: "white",
  },
}));

export interface NotificationBadgeProps {
  count: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count }) => {
  return (
    <StyledIconButton
      color="inherit"
      component={RouterLink}
      to="/notifications"
      data-test="nav-top-notifications-link"
      size="large"
    >
      <Badge
        badgeContent={count > 0 ? count : undefined}
        data-test="nav-top-notifications-count"
        classes={{ badge: classes.customBadge }}
      >
        <NotificationsIcon />
      </Badge>
    </StyledIconButton>
  );
};

export default NotificationBadge;
