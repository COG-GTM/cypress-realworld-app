import React from "react";
import { Badge } from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";

export interface NotificationBadgeProps {
  notificationCount: number;
  classes?: {
    badge?: string;
  };
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ notificationCount, classes }) => {
  if (notificationCount === 0) {
    return null;
  }

  return (
    <Badge
      badgeContent={notificationCount}
      data-test="nav-top-notifications-count"
      classes={classes}
    >
      <NotificationsIcon />
    </Badge>
  );
};

export default NotificationBadge;
