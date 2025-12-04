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
  count: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count }) => {
  return (
    <StyledBadge
      badgeContent={count > 0 ? count : undefined}
      invisible={count === 0}
      data-test="nav-top-notifications-count"
      classes={{ badge: classes.customBadge }}
    >
      <NotificationsIcon />
    </StyledBadge>
  );
};

export default NotificationBadge;
