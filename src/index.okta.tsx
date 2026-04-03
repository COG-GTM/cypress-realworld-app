import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useNavigate } from "react-router";
import {
  createTheme,
  ThemeProvider,
  Theme,
  StyledEngineProvider,
  adaptV4Theme,
} from "@mui/material";

// @ts-ignore
import { OktaAuth, toRelativeUrl } from "@okta/okta-auth-js";
import { Security } from "@okta/okta-react";
import AppOkta from "./containers/AppOkta";

const theme = createTheme(
  adaptV4Theme({
    palette: {
      secondary: {
        main: "#fff",
      },
    },
  })
);

const root = createRoot(document.getElementById("root")!);

if (process.env.VITE_OKTA) {
  const oktaAuth = new OktaAuth({
    issuer: `https://${process.env.VITE_OKTA_DOMAIN}/oauth2/default`,
    clientId: process.env.VITE_OKTA_CLIENTID,
    redirectUri: window.location.origin + "/implicit/callback",
  });

  const AppWithRouter = () => {
    const navigate = useNavigate();
    const restoreOriginalUri = (_oktaAuth: any, originalUri: string) =>
      navigate(toRelativeUrl(originalUri || "/", window.location.origin));

    return (
      <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
        <AppOkta />
      </Security>
    );
  };

  /* istanbul ignore next */
  root.render(
    <BrowserRouter>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <AppWithRouter />
        </ThemeProvider>
      </StyledEngineProvider>
    </BrowserRouter>
  );
} else {
  console.error("Okta is not configured.");
}
