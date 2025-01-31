import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Container } from '@mui/material';
import apiClient from '../../../utils/api';
import { useLoader } from '../../../context/LoaderContext';
import SnackAlert from '../../../components/alert/Alert';

const ForgotPassword: React.FC = () => {
  const [regNumber, setregNumber] = useState('');
  const { loading, setLoading } = useLoader();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<
    'success' | 'info' | 'warning' | 'error'
  >('error');

  const [errors, setErrors] = useState<string>('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setregNumber(event.target.value);
  };

  const handleBlur = () => {
    if (!regNumber) {
      setErrors('Please enter your registration number.');
    } else {
      setErrors('');
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validation before submission
    if (!regNumber) {
      setErrors('Registration number is required.');
      return;
    }

    setLoading(true);
    setIsAlertOpen(false);
    setAlertMessage('');

    apiClient
      .post('/auth/send-reset-password-link', { regNumber })
      .then(() => {
        setAlertMessage('A password reset link has been sent to your email.');
        setIsAlertOpen(true);
        setAlertSeverity('success');
      })
      .catch((err) => {
        setAlertSeverity('error');
        setIsAlertOpen(true);
        if (err.response && err.response.data && err.response.data.message) {
          setAlertMessage(err.response.data.message);
        } else {
          setAlertMessage('An unexpected error occurred. Please try again.');
        }
      })
      .finally(() => setLoading(false));
  };

  const handleClose = () => {
    setIsAlertOpen(false);
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <Box
        sx={{
          padding: 4,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: 'background.paper',
          width: '100%',
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Forgot Password
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email or Registration Number"
            name="regNumber"
            type="text"
            fullWidth
            margin="normal"
            value={regNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors}
            helperText={errors}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      </Box>

      <SnackAlert
        isOpen={isAlertOpen}
        message={alertMessage}
        severity={alertSeverity}
        handleClose={handleClose}
      />
    </Container>
  );
};

export default ForgotPassword;
