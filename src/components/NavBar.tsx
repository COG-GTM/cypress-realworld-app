import React from "react";
import { styled } from "@mui/material/styles";
import clsx from "clsx";
import {
  BaseActionObject,
  Interpreter,
  ResolveTypegenMeta,
  ServiceMap,
  TypegenDisabled,
} from "xstate";
import { useActor } from "@xstate/react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Button,
  useTheme,
  useMediaQuery,
  Link,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AttachMoney as AttachMoneyIcon,
} from "@mui/icons-material";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { DataContext, DataEvents, DataSchema } from "../machines/dataMachine";
import TransactionNavTabs from "./TransactionNavTabs";

const drawerWidth = 240;

const PREFIX = "NavBar";

const classes = {
  toolbar: `${PREFIX}-toolbar`,
  appBar: `${PREFIX}-appBar`,
  appBarShift: `${PREFIX}-appBarShift`,
  menuButtonHidden: `${PREFIX}-menuButtonHidden`,
  title: `${PREFIX}-title`,
  logo: `${PREFIX}-logo`,
  newTransactionButton: `${PREFIX}-newTransactionButton`,
  customBadge: `${PREFIX}-customBadge`,
};

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  [`& .${classes.toolbar}`]: {
    paddingRight: 24,
    paddingLeft: 16,
    minHeight: 80,
    display: "flex",
    alignItems: "center",
  },

  [`&.${classes.appBar}`]: {
    backgroundColor: "#ffffff",
    color: "#222222",
    boxShadow: "none",
    borderBottom: "1px solid #EBEBEB",
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },

  [`&.${classes.appBarShift}`]: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },

  [`& .${classes.menuButtonHidden}`]: {
    display: "none",
  },

  [`& .${classes.title}`]: {
    flexGrow: 1,
    textAlign: "center",
  },

  [`& .${classes.logo}`]: {
    color: "#FF385C",
    verticalAlign: "bottom",
  },

  [`& .${classes.newTransactionButton}`]: {
    fontSize: 14,
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 700,
    backgroundColor: "#FF385C",
    color: "#ffffff",
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 24,
    paddingRight: 24,
    borderRadius: 24,
    textTransform: "none",
    letterSpacing: 0,
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "#E31C5F",
      boxShadow: "0 2px 8px rgba(255, 56, 92, 0.3)",
    },
  },

  [`& .${classes.customBadge}`]: {
    backgroundColor: "#FF385C",
    color: "white",
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 700,
  },
}));

interface NavBarProps {
  drawerOpen: boolean;
  toggleDrawer: Function;
  notificationsService: Interpreter<
    DataContext,
    DataSchema,
    DataEvents,
    any,
    ResolveTypegenMeta<TypegenDisabled, DataEvents, BaseActionObject, ServiceMap>
  >;
}

const NavBar: React.FC<NavBarProps> = ({ drawerOpen, toggleDrawer, notificationsService }) => {
  const match = useLocation();

  const theme = useTheme();
  const [notificationsState] = useActor(notificationsService);

  const allNotifications = notificationsState?.context?.results;
  const xsBreakpoint = useMediaQuery(theme.breakpoints.only("xs"));

  return (
    <StyledAppBar
      position="absolute"
      className={clsx(classes.appBar, drawerOpen && classes.appBarShift)}
    >
      <Toolbar className={classes.toolbar}>
        <IconButton
          data-test="sidenav-toggle"
          edge="start"
          aria-label="open drawer"
          onClick={() => toggleDrawer()}
          size="large"
          sx={{
            color: "#222222",
            marginRight: 1,
            borderRadius: "50%",
            "&:hover": { backgroundColor: "#F7F7F7" },
          }}
        >
          <MenuIcon data-test="drawer-icon" />
        </IconButton>
        <Typography
          component="h1"
          variant="h6"
          noWrap
          className={classes.title}
          data-test="app-name-logo"
          sx={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800 }}
        >
          <Link
            to="/"
            style={{ color: "#FF385C", textDecoration: "none" }}
            component={RouterLink}
            underline="hover"
          >
            {xsBreakpoint ? (
              <span
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                RWA
              </span>
            ) : (
              <span
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  fontFamily: "'Nunito', sans-serif",
                  letterSpacing: "-0.5px",
                }}
              >
                Real World App
              </span>
            )}
          </Link>
        </Typography>
        <Button
          className={classes.newTransactionButton}
          variant="contained"
          component={RouterLink}
          to="/transaction/new"
          data-test="nav-top-new-transaction"
          disableElevation
        >
          <AttachMoneyIcon sx={{ fontSize: 18, marginRight: 0.5 }} /> New
        </Button>
        <IconButton
          component={RouterLink}
          to="/notifications"
          data-test="nav-top-notifications-link"
          size="large"
          sx={{
            color: "#222222",
            marginLeft: 1,
            "&:hover": { backgroundColor: "#F7F7F7" },
          }}
        >
          <Badge
            badgeContent={allNotifications ? allNotifications.length : undefined}
            data-test="nav-top-notifications-count"
            classes={{ badge: classes.customBadge }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Toolbar>
      {(match.pathname === "/" || RegExp("/(?:public|contacts|personal)").test(match.pathname)) && (
        <TransactionNavTabs />
      )}
    </StyledAppBar>
  );
};

export default NavBar;
