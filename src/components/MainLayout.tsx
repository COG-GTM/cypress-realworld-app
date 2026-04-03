import React, { useEffect } from "react";
import { styled } from "@mui/material/styles";
import { useMachine } from "@xstate/react";
import type { AnyActorRef } from "xstate";
import { Container, Grid, useMediaQuery, useTheme } from "@mui/material";

import Footer from "./Footer";
import NavBar from "./NavBar";
import NavDrawer from "./NavDrawer";
import { drawerMachine } from "../machines/drawerMachine";

const PREFIX = "MainLayout";

const classes = {
  toolbar: `${PREFIX}-toolbar`,
  appBarSpacer: `${PREFIX}-appBarSpacer`,
  content: `${PREFIX}-content`,
  container: `${PREFIX}-container`,
};
// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled("div")(({ theme }) => ({
  [`&`]: { display: "flex", flexGrow: 1 },

  [`& .${classes.toolbar}`]: {
    paddingRight: 24, // keep right padding when drawer closed
  },

  [`& .${classes.appBarSpacer}`]: {
    minHeight: theme.spacing(13),
    [theme.breakpoints.up("sm")]: {
      minHeight: theme.spacing(14),
    },
  },

  [`& .${classes.content}`]: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },

  [`& .${classes.container}`]: {
    minHeight: "77vh",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    [theme.breakpoints.up("sm")]: {
      paddingTop: theme.spacing(4),
      padding: theme.spacing(4),
    },
  },
}));

interface Props {
  children: React.ReactNode;
  authService: AnyActorRef;
  notificationsService: AnyActorRef;
}

const MainLayout: React.FC<Props> = ({ children, notificationsService, authService }) => {
  const theme = useTheme();
  const [drawerState, sendDrawer] = useMachine(drawerMachine);

  const aboveSmallBreakpoint = useMediaQuery(theme.breakpoints.up("sm"));
  const xsBreakpoint = useMediaQuery(theme.breakpoints.only("xs"));

  const desktopDrawerOpen = drawerState?.matches({ desktop: "open" });
  const mobileDrawerOpen = drawerState?.matches({ mobile: "open" });
  const toggleDesktopDrawer = () => {
    sendDrawer({ type: "TOGGLE_DESKTOP" });
  };
  const toggleMobileDrawer = () => {
    sendDrawer({ type: "TOGGLE_MOBILE" });
  };

  const openDesktopDrawer = (payload: any) => sendDrawer({ type: "OPEN_DESKTOP", ...payload });
  const closeMobileDrawer = () => sendDrawer({ type: "CLOSE_MOBILE" });

  useEffect(() => {
    if (!desktopDrawerOpen && aboveSmallBreakpoint) {
      openDesktopDrawer({ aboveSmallBreakpoint });
    }
  }, [aboveSmallBreakpoint, desktopDrawerOpen]);

  return (
    <Root>
      <NavBar
        toggleDrawer={xsBreakpoint ? toggleMobileDrawer : toggleDesktopDrawer}
        drawerOpen={xsBreakpoint ? mobileDrawerOpen : desktopDrawerOpen}
        notificationsService={notificationsService}
      />
      <NavDrawer
        toggleDrawer={xsBreakpoint ? toggleMobileDrawer : toggleDesktopDrawer}
        drawerOpen={xsBreakpoint ? mobileDrawerOpen : desktopDrawerOpen}
        closeMobileDrawer={closeMobileDrawer}
        authService={authService}
      />
      <main className={classes.content} data-test="main">
        <div className={classes.appBarSpacer} />
        <Container maxWidth="md" className={classes.container}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {children}
            </Grid>
          </Grid>
        </Container>
        <footer>
          <Footer />
        </footer>
      </main>
    </Root>
  );
};

export default MainLayout;
