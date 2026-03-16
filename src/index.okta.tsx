import React from "react";
import { createRoot } from "react-dom/client";
import { unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
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
import { history } from "./utils/historyUtils";
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

  const restoreOriginalUri = (_oktaAuth: any, originalUri: string) =>
    history.replace(toRelativeUrl(originalUri || "/", window.location.origin));

  /* istanbul ignore next */
  root.render(
    <HistoryRouter history={history}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
            <AppOkta />
          </Security>
        </ThemeProvider>
      </StyledEngineProvider>
    </HistoryRouter>
  );
} else {
  console.error("Okta is not configured.");
}
