import React from "react";
import { styled } from "@mui/material/styles";
import { Badge, IconButton, IconButtonProps } from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";

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

export interface NotificationBadgeProps extends Omit<IconButtonProps, "color"> {
  count?: number;
  "data-test"?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  "data-test": dataTest,
  ...iconButtonProps
}) => {
  const showBadge = count !== undefined && count > 0;

  return (
    <StyledIconButton color="inherit" data-test={dataTest} size="large" {...iconButtonProps}>
      <Badge
        badgeContent={showBadge ? count : undefined}
        invisible={!showBadge}
        data-test="notification-badge-count"
        classes={{ badge: classes.customBadge }}
      >
        <NotificationsIcon />
      </Badge>
    </StyledIconButton>
  );
};

export default NotificationBadge;
