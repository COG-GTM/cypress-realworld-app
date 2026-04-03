import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import {
  createTheme,
  ThemeProvider,
  Theme,
  StyledEngineProvider,
  adaptV4Theme,
} from "@mui/material";
import { Auth0Provider } from "@auth0/auth0-react";
import AppAuth0 from "./containers/AppAuth0";

const theme = createTheme(
  adaptV4Theme({
    palette: {
      secondary: {
        main: "#fff",
      },
    },
  })
);

/* istanbul ignore next */
const onRedirectCallback = (appState: any) => {
  window.location.replace((appState && appState.returnTo) || window.location.pathname);
};

const root = createRoot(document.getElementById("root")!);

/* istanbul ignore if */
if (process.env.VITE_AUTH0) {
  root.render(
    <Auth0Provider
      domain={process.env.VITE_AUTH0_DOMAIN!}
      clientId={process.env.VITE_AUTH0_CLIENTID!}
      redirectUri={window.location.origin}
      audience={process.env.VITE_AUTH0_AUDIENCE}
      scope={process.env.VITE_AUTH0_SCOPE}
      onRedirectCallback={onRedirectCallback}
      cacheLocation="localstorage"
    >
      <BrowserRouter>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <AppAuth0 />
          </ThemeProvider>
        </StyledEngineProvider>
      </BrowserRouter>
    </Auth0Provider>
  );
} else {
  console.error("Auth0 is not configured.");
}
