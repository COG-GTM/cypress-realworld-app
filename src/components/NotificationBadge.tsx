import React from "react";
import { Badge } from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";

interface NotificationBadgeProps {
  count: number;
  badgeClassName?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, badgeClassName }) => {
  return (
    <Badge
      badgeContent={count > 0 ? count : undefined}
      data-test="nav-top-notifications-count"
      classes={badgeClassName ? { badge: badgeClassName } : undefined}
    >
      <NotificationsIcon />
    </Badge>
  );
};

export default NotificationBadge;
