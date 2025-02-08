import React from "react";
import { createTheme, responsiveFontSizes, ThemeProvider } from "@mui/material";
import MiddlewareContext from "./middleware/context";
import Pages from "./components/Pages";
import { getCSSVar } from "./tools";

let theme = createTheme({
  palette: {
    primary: {
      main: getCSSVar("primary"),
      light: "#7B1FA2",
      dark: "#4A148C",
      contrastText: getCSSVar("contrastText"),
    },
    secondary: {
      main: getCSSVar("secondary"),
      light: "#C2185B",
      dark: "#880E4F",
      contrastText: getCSSVar("contrastText"),
    },
  },
});

theme = responsiveFontSizes(theme);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <MiddlewareContext>
        <Pages />
      </MiddlewareContext>
    </ThemeProvider>
  );
}

export default App;
