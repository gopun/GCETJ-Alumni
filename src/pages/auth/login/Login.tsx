import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link as MuiLink,
  Alert,
  Container,
  InputAdornment,
  IconButton,
  Snackbar,
} from '@mui/material';
import apiClient from '../../../utils/api';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { LoginForm, LoginTouchedFields } from '../../../models/interface';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState<LoginForm>({
    regNumber: '',
    password: '',
  });
  const [errors, setErrors] = useState<{
    regNumber?: string;
    password?: string;
  }>({});
  const [touched, setTouched] = useState<LoginTouchedFields>({
    regNumber: false,
    password: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (touched[name as keyof LoginTouchedFields]) {
      validateField(name as keyof LoginForm, value);
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const { name } = event.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    validateField(name as keyof LoginForm, formData[name as keyof LoginForm]);
  };

  const validateField = (name: keyof LoginForm, value: string) => {
    let error = '';

    switch (name) {
      case 'regNumber':
        if (!value) error = 'Registration number is required.';
        break;
      case 'password':
        if (!value) error = 'Password is required.';
        else if (value.length < 6)
          error = 'Password must be at least 6 characters.';
        break;
      default:
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({}); // Clear all errors before submission

    const newErrors: { regNumber?: string; password?: string } = {};

    if (!formData.regNumber) {
      newErrors.regNumber = 'Registration is required.';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    }

    if (newErrors.regNumber || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    apiClient
      .post('/auth/login', formData)
      .then((data) => {
        const userData = data.data?.data?.user;
        setUser(userData);
        if (userData.certificate) {
          navigate('/');
        } else {
          navigate('/profile');
        }
      })
      .catch((err) => {
        console.log('\n err...', err);
        if (err.response && err.response.data && err.response.data.message) {
          setErrorMessage(err.response.data.message);
          setError(true);
        }
      });
  };

  const handleClose = (_: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return; // Prevent closing on clickaway
    }
    setError(false);
  };

  const isFormValid =
    Object.values(errors).every((error) => !error) &&
    Object.values(formData).every((value) => value) &&
    formData.password.length >= 6;

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
          Login
        </Typography>
        {Object.values(errors).some((error) => error) && (
          <Alert severity="error">
            {Object.values(errors).map((error, idx) => (
              <div key={idx}>{error}</div>
            ))}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Registration Number"
            name="regNumber"
            type="tel"
            fullWidth
            margin="normal"
            value={formData.regNumber}
            onBlur={handleBlur}
            error={touched.regNumber && !!errors.regNumber}
            helperText={touched.regNumber && errors.regNumber}
            required
            onChange={(event) => {
              const { value } = event.target;
              if (/^\d{0,12}$/.test(value)) {
                setFormData((prev) => ({
                  ...prev,
                  regNumber: value,
                }));
              }
            }}
          />
          <TextField
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password && !!errors.password}
            helperText={touched.password && errors.password}
            required
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={!isFormValid}
          >
            Login
          </Button>
        </form>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Don’t have an account?{' '}
          <MuiLink href="/auth/signup" underline="hover">
            Sign up
          </MuiLink>
        </Typography>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          <MuiLink href="/auth/forgot-password" underline="hover">
            Forgot password?
          </MuiLink>
        </Typography>
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

export default Login;
