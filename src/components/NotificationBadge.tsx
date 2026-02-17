import React from "react";
import { Badge, IconButton } from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

export interface NotificationBadgeProps {
  notificationCount: number;
  classes?: { badge?: string };
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ notificationCount, classes }) => {
  return (
    <IconButton
      color="inherit"
      component={RouterLink}
      to="/notifications"
      data-test="nav-top-notifications-link"
      size="large"
    >
      {notificationCount > 0 ? (
        <Badge
          badgeContent={notificationCount}
          data-test="nav-top-notifications-count"
          classes={classes}
        >
          <NotificationsIcon />
        </Badge>
      ) : (
        <NotificationsIcon />
      )}
    </IconButton>
  );
};

export default NotificationBadge;
