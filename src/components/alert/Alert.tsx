import React from 'react';
import { Alert, Snackbar } from '@mui/material';

interface SnackAlertProps {
  isOpen: boolean;
  handleClose: (...args: unknown[]) => unknown;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
}

const SnackAlert: React.FC<SnackAlertProps> = ({
  isOpen,
  message,
  severity,
  handleClose,
}) => {
  const handleCloseFunction = (
    _: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return; // Prevent closing on clickaway
    }
    handleClose(_, reason);
  };

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={4000}
      onClose={handleCloseFunction}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={handleCloseFunction}
        severity={severity}
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SnackAlert;
