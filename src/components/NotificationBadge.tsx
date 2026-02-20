import React from "react";
import { Badge, IconButton } from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

export interface NotificationBadgeProps {
  notificationCount: number;
  classes?: {
    customBadge?: string;
  };
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ notificationCount, classes }) => {
  if (notificationCount === 0) {
    return null;
  }

  return (
    <IconButton
      color="inherit"
      component={RouterLink}
      to="/notifications"
      data-test="nav-top-notifications-link"
      size="large"
    >
      <Badge
        badgeContent={notificationCount}
        data-test="nav-top-notifications-count"
        classes={classes ? { badge: classes.customBadge } : undefined}
      >
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
};

export default NotificationBadge;
