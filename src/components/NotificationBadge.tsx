import React from "react";
import { styled } from "@mui/material/styles";
import { IconButton, Badge } from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

const PREFIX = "NotificationBadge";

const classes = {
  customBadge: `${PREFIX}-customBadge`,
};

const StyledIconButton = styled(IconButton)(() => ({
  [`& .${classes.customBadge}`]: {
    backgroundColor: "red",
    color: "white",
  },
}));

interface NotificationBadgeProps {
  count: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count }) => {
  return (
    <StyledIconButton
      color="inherit"
      component={RouterLink}
      to="/notifications"
      data-test="nav-top-notifications-link"
      size="large"
    >
      <Badge
        badgeContent={count > 0 ? count : undefined}
        data-test="nav-top-notifications-count"
        classes={{ badge: classes.customBadge }}
        invisible={count === 0}
      >
        <NotificationsIcon />
      </Badge>
    </StyledIconButton>
  );
};

export default NotificationBadge;
