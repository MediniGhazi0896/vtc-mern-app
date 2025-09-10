import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0B2C48", // Navy blue (brand main)
    },
    secondary: {
      main: "#1E90FF", // Accent sky blue
    },
    background: {
      default: "#F8F7F3", // Light beige background
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0B2C48",
      secondary: "#4F5D75",
    },
  },
  typography: {
    fontFamily: "Poppins, Roboto, sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 12, // modern rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "10px 22px",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#0B2C48",
        },
      },
    },
  },
});

export default theme;
