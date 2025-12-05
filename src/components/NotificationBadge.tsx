import React from "react";
import { IconButton, Badge } from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

export interface NotificationBadgeProps {
  count?: number;
  badgeClassName?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, badgeClassName }) => {
  const badgeContent = count && count > 0 ? count : undefined;

  return (
    <IconButton
      color="inherit"
      component={RouterLink}
      to="/notifications"
      data-test="nav-top-notifications-link"
      size="large"
    >
      <Badge
        badgeContent={badgeContent}
        data-test="nav-top-notifications-count"
        classes={badgeClassName ? { badge: badgeClassName } : undefined}
      >
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
};

export default NotificationBadge;
