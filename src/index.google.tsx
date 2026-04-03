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

import AppGoogle from "./containers/AppGoogle";

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
    <BrowserRouter>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <AppGoogle />
        </ThemeProvider>
      </StyledEngineProvider>
    </BrowserRouter>
  );
} else {
  console.error("Google is not configured.");
}
