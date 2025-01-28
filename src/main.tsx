import React from 'react';
// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './index.css';
import App from './App.tsx';
import theme from './theme.ts';
import { UserProvider } from './context/UserContext.tsx';
import { LoaderProvider } from './context/LoaderContext.tsx';

const root = createRoot(document.getElementById('root')!);
root.render(
  // <StrictMode>
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <LoaderProvider>
      <UserProvider>
        <App />
      </UserProvider>
    </LoaderProvider>
  </ThemeProvider>,
  // </StrictMode>,
);
