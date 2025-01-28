import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          display: 'block',
          placeItems: 'unset',
          margin: 0,
          padding: 0,
          minWidth: 0,
          minHeight: 0,
        },
      },
    },
  },
  palette: {
    primary: {
      main: '#1976d2', // Default primary color
    },
    secondary: {
      main: '#d32f2f', // Default secondary color
    },
  },
});

export default theme;
