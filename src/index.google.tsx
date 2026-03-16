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

import AppGoogle from "./containers/AppGoogle";
import { history } from "./utils/historyUtils";

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

if (process.env.VITE_GOOGLE) {
  /* istanbul ignore next */
  root.render(
    <HistoryRouter history={history}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <AppGoogle />
        </ThemeProvider>
      </StyledEngineProvider>
    </HistoryRouter>
  );
} else {
  console.error("Google is not configured.");
}
