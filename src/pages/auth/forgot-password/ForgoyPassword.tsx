import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Container,
  Snackbar,
} from '@mui/material';
import apiClient from '../../../utils/api';
// import { useNavigate } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  //   const navigate = useNavigate();
  const [regNumber, setregNumber] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
    setError(false);
    setSuccessMessage('');
    setErrorMessage('');

    apiClient
      .post('/auth/send-reset-password-link', { regNumber })
      .then((response) => {
        console.log('\n response...', response);

        setLoading(false);
        setSuccessMessage('A password reset link has been sent to your email.');
      })
      .catch((err) => {
        setLoading(false);
        if (err.response && err.response.data && err.response.data.message) {
          setErrorMessage(err.response.data.message);
          setError(true);
        } else {
          setErrorMessage('An unexpected error occurred. Please try again.');
          setError(true);
        }
      });
  };

  const handleClose = () => {
    setError(false);
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

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {successMessage && <Alert severity="success">{successMessage}</Alert>}

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

      <Snackbar
        open={error}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ForgotPassword;
