import React from "react";
import { styled } from "@mui/material/styles";
import { head } from "lodash/fp";
import { Interpreter } from "xstate";
import { useActor } from "@xstate/react";
import clsx from "clsx";
import {
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Avatar,
  Typography,
  Box,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import {
  Home as HomeIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Notifications as NotificationsIcon,
  AccountBalance as AccountBalanceIcon,
} from "@mui/icons-material";

import { formatAmount } from "../utils/transactionUtils";
import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";

const PREFIX = "NavDrawer";

const classes = {
  toolbar: `${PREFIX}-toolbar`,
  toolbarIcon: `${PREFIX}-toolbarIcon`,
  drawerPaper: `${PREFIX}-drawerPaper`,
  drawerPaperClose: `${PREFIX}-drawerPaperClose`,
  userProfile: `${PREFIX}-userProfile`,
  userProfileHidden: `${PREFIX}-userProfileHidden`,
  avatar: `${PREFIX}-avatar`,
  accountBalance: `${PREFIX}-accountBalance`,
  amount: `${PREFIX}-amount`,
  accountBalanceHidden: `${PREFIX}-accountBalanceHidden`,
  cypressLogo: `${PREFIX}-cypressLogo`,
};

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  [`& .${classes.toolbar}`]: {
    paddingRight: 24,
  },

  [`& .${classes.toolbarIcon}`]: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },

  [`& .${classes.drawerPaper}`]: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    backgroundColor: "#ffffff",
    borderRight: "1px solid #EBEBEB",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },

  [`& .${classes.drawerPaperClose}`]: {
    marginTop: 50,
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },

  [`& .${classes.userProfile}`]: {
    padding: theme.spacing(2.5),
  },

  [`& .${classes.userProfileHidden}`]: {
    display: "none",
  },

  [`& .${classes.avatar}`]: {
    marginRight: theme.spacing(2),
    width: 48,
    height: 48,
    border: "2px solid #FF385C",
  },

  [`& .${classes.accountBalance}`]: {
    marginLeft: theme.spacing(2),
  },

  [`& .${classes.amount}`]: {
    fontWeight: 800,
    fontFamily: "'Nunito', sans-serif",
    color: "#222222",
  },

  [`& .${classes.accountBalanceHidden}`]: {
    display: "none",
  },

  [`& .${classes.cypressLogo}`]: {
    width: "40%",
  },

  "& .MuiListItem-root": {
    borderRadius: 12,
    margin: "2px 8px",
    width: "auto",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#F7F7F7",
    },
  },

  "& .MuiListItemIcon-root": {
    color: "#717171",
    minWidth: 40,
  },

  "& .MuiListItemText-primary": {
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 600,
    fontSize: 14,
    color: "#222222",
  },
}));

const drawerWidth = 240;

export const mainListItems = (
  toggleDrawer: ((event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void) | undefined,
  showTemporaryDrawer: Boolean
) => (
  <div>
    <ListItem
      button
      // @ts-ignore
      onClick={() => showTemporaryDrawer && toggleDrawer()}
      component={RouterLink}
      to="/"
      data-test="sidenav-home"
    >
      <ListItemIcon>
        <HomeIcon />
      </ListItemIcon>
      <ListItemText primary="Home" />
    </ListItem>
    <ListItem
      button
      // @ts-ignore
      onClick={() => showTemporaryDrawer && toggleDrawer()}
      component={RouterLink}
      to="/user/settings"
      data-test="sidenav-user-settings"
    >
      <ListItemIcon>
        <PersonIcon />
      </ListItemIcon>
      <ListItemText primary="My Account" />
    </ListItem>
    <ListItem
      button
      // @ts-ignore
      onClick={() => showTemporaryDrawer && toggleDrawer()}
      component={RouterLink}
      to="/bankaccounts"
      data-test="sidenav-bankaccounts"
    >
      <ListItemIcon>
        <AccountBalanceIcon />
      </ListItemIcon>
      <ListItemText primary="Bank Accounts" />
    </ListItem>
    <ListItem
      button
      // @ts-ignore
      onClick={() => showTemporaryDrawer && toggleDrawer()}
      component={RouterLink}
      to="/notifications"
      data-test="sidenav-notifications"
    >
      <ListItemIcon>
        <NotificationsIcon />
      </ListItemIcon>
      <ListItemText primary="Notifications" />
    </ListItem>
  </div>
);

export const secondaryListItems = (signOutPending: Function) => (
  <div>
    <ListItem button onClick={() => signOutPending()} data-test="sidenav-signout">
      <ListItemIcon>
        <LogoutIcon />
      </ListItemIcon>
      <ListItemText primary="Logout" />
    </ListItem>
  </div>
);

interface Props {
  closeMobileDrawer: () => void;
  toggleDrawer: () => void;
  drawerOpen: boolean;
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
}

const NavDrawer: React.FC<Props> = ({
  toggleDrawer,
  closeMobileDrawer,
  drawerOpen,
  authService,
}) => {
  const theme = useTheme();
  const [authState, sendAuth] = useActor(authService);
  const showTemporaryDrawer = useMediaQuery(theme.breakpoints.only("xs"));

  const currentUser = authState?.context?.user;
  const signOut = () => sendAuth("LOGOUT");

  return (
    <StyledDrawer
      data-test="sidenav"
      variant={showTemporaryDrawer ? "temporary" : "persistent"}
      classes={{
        paper: clsx(classes.drawerPaper, !drawerOpen && classes.drawerPaperClose),
      }}
      open={drawerOpen}
      ModalProps={{
        onBackdropClick: () => closeMobileDrawer(),
        closeAfterTransition: showTemporaryDrawer,
      }}
    >
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        className={drawerOpen ? classes.userProfile : classes.userProfileHidden}
      >
        <Grid item>
          {currentUser && (
            <Avatar
              className={classes.avatar}
              alt={`${currentUser.firstName} ${currentUser.lastName}`}
              src={currentUser.avatar}
            />
          )}
        </Grid>
        <Grid item>
          {currentUser && (
            <>
              <Typography
                variant="subtitle1"
                data-test="sidenav-user-full-name"
                sx={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  color: "#222222",
                  fontSize: 15,
                }}
              >
                {currentUser.firstName} {head(currentUser.lastName)}
              </Typography>
              <Typography
                variant="subtitle2"
                gutterBottom
                data-test="sidenav-username"
                sx={{
                  fontFamily: "'Nunito', sans-serif",
                  color: "#717171",
                  fontSize: 13,
                }}
              >
                @{currentUser.username}
              </Typography>
            </>
          )}
        </Grid>
        <Grid item style={{ width: "30%" }}></Grid>
      </Grid>
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        className={drawerOpen ? classes.userProfile : classes.userProfileHidden}
      >
        <Grid item>
          {currentUser && (
            <Box
              sx={{
                background: "linear-gradient(135deg, #FF385C 0%, #E31C5F 100%)",
                borderRadius: 3,
                padding: "12px 20px",
                marginBottom: 1,
              }}
            >
              <Typography
                variant="h6"
                className={classes.amount}
                data-test="sidenav-user-balance"
                sx={{ color: "#ffffff !important", fontSize: 20 }}
              >
                {currentUser.balance ? formatAmount(currentUser.balance) : formatAmount(0)}
              </Typography>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{
                  fontFamily: "'Nunito', sans-serif",
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Account Balance
              </Typography>
            </Box>
          )}
        </Grid>
        <Grid item>
          <Divider sx={{ borderColor: "#EBEBEB" }} />
        </Grid>
        <Grid item>
          <List>{mainListItems(toggleDrawer, showTemporaryDrawer)}</List>
        </Grid>
        <Grid item>
          <Divider sx={{ borderColor: "#EBEBEB" }} />
        </Grid>
        <Grid item>
          <List>{secondaryListItems(signOut)}</List>
        </Grid>
      </Grid>
    </StyledDrawer>
  );
};

export default NavDrawer;
