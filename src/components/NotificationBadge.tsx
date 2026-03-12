import React from "react";
import { Badge, IconButton } from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

export interface NotificationBadgeProps {
  notifications?: any[];
  classes?: { badge?: string };
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ notifications, classes: badgeClasses }) => {
  const count = notifications ? notifications.length : 0;

  return (
    <IconButton
      color="inherit"
      component={RouterLink}
      to="/notifications"
      data-test="nav-top-notifications-link"
      size="large"
    >
      <Badge
        badgeContent={count > 0 ? count : undefined}
        data-test="nav-top-notifications-count"
        classes={badgeClasses ? { badge: badgeClasses.badge } : undefined}
      >
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
};

export default NotificationBadge;
