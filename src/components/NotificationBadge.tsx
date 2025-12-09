import React from "react";
import { Badge } from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";

export interface NotificationBadgeProps {
  count?: number;
  badgeClassName?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, badgeClassName }) => {
  return (
    <Badge
      badgeContent={count}
      data-test="nav-top-notifications-count"
      classes={badgeClassName ? { badge: badgeClassName } : undefined}
    >
      <NotificationsIcon />
    </Badge>
  );
};

export default NotificationBadge;
