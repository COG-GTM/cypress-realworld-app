import React from "react";
import { styled } from "@mui/material/styles";
import { Badge } from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";

const PREFIX = "NotificationBadge";

const classes = {
  customBadge: `${PREFIX}-customBadge`,
};

const StyledBadge = styled(Badge)(() => ({
  [`& .${classes.customBadge}`]: {
    backgroundColor: "red",
    color: "white",
  },
}));

export interface NotificationBadgeProps {
  notificationCount: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ notificationCount }) => {
  if (notificationCount === 0) {
    return (
      <span data-test="nav-top-notifications-count">
        <NotificationsIcon />
      </span>
    );
  }

  return (
    <StyledBadge
      badgeContent={notificationCount}
      data-test="nav-top-notifications-count"
      classes={{ badge: classes.customBadge }}
    >
      <NotificationsIcon />
    </StyledBadge>
  );
};

export default NotificationBadge;
