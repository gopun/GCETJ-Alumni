import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Container,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../../utils/api';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    password: string;
    confirmPassword: string;
  }>({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!token) {
      setErrorMessage('Invalid or expired token.');
      setError(true);
    }
  }, [token]);

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleChangeConfirmPassword = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setConfirmPassword(event.target.value);
  };

  const handleBlur = () => {
    setErrors({
      password: password ? '' : 'Password is required.',
      confirmPassword: confirmPassword ? '' : 'Please confirm your password.',
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setErrors({
        password: '',
        confirmPassword: 'Passwords do not match.',
      });
      return;
    }

    setLoading(true);
    setError(false);
    setSuccessMessage('');
    setErrorMessage('');

    apiClient
      .post(`/auth/reset-password/${token}`, { password })
      .then((response) => {
        console.log('\n response...', response);

        setLoading(false);
        setSuccessMessage('Your password has been successfully reset.');
        setTimeout(() => navigate('/auth/login'), 2000);
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
          Reset Password
        </Typography>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {successMessage && <Alert severity="success">{successMessage}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={handleChangePassword}
            onBlur={handleBlur}
            error={!!errors.password}
            helperText={errors.password}
            required
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={handleChangeConfirmPassword}
            onBlur={handleBlur}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
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
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Reset Password'
            )}
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

export default ResetPassword;
