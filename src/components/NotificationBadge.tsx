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
  return (
    <Badge
      badgeContent={notificationCount > 0 ? notificationCount : undefined}
      data-test="nav-top-notifications-count"
      classes={classes}
    >
      <NotificationsIcon />
    </Badge>
  );
};

export default NotificationBadge;
