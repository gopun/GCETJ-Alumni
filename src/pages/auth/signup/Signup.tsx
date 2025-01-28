import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link as MuiLink,
  Alert,
  IconButton,
  InputAdornment,
  Container,
  Snackbar,
} from '@mui/material';
import {
  Cancel,
  CheckCircle,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import apiClient from '../../../utils/api';
import { useUser } from '../../../context/UserContext';
import { SignupForm, SignupTouchedFields } from '../../../models/interface';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import moment from 'moment';

const Signup: React.FC = () => {
  const { setUser } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignupForm>({
    name: '',
    email: '',
    mobileNumber: '',
    regNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Partial<SignupForm>>({});
  const [touched, setTouched] = useState<SignupTouchedFields>({
    name: false,
    email: false,
    mobileNumber: false,
    regNumber: false,
    password: false,
    confirmPassword: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const passwordValidations = [
    {
      condition: formData.password.length >= 8,
      message: 'Be at least 8 characters long',
    },
    {
      condition: /[A-Z]/.test(formData.password),
      message: 'Contain at least one uppercase letter',
    },
    {
      condition: /\d/.test(formData.password),
      message: 'Include at least one number',
    },
    {
      condition: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
      message: 'Have at least one special character (!, @, #, etc.)',
    },
  ];

  const isPasswordValid = passwordValidations.every(
    (validation) => validation.condition,
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (touched[name as keyof SignupTouchedFields]) {
      validateField(name as keyof SignupForm, value);
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const { name } = event.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    validateField(name as keyof SignupForm, formData[name as keyof SignupForm]);
  };

  const validateField = (name: keyof SignupForm, value: string) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value) error = 'Name is required.';
        break;
      case 'regNumber':
        if (!value) error = 'Registration number is required.';
        else if (!validateRegNum(value))
          error = 'Please enter valid Registration number.';
        break;
      case 'email':
        if (!value) error = 'Email is required.';
        else if (!/\S+@\S+\.\S+/.test(value)) error = 'Enter a valid email.';
        break;
      case 'mobileNumber':
        if (!value) error = 'Mobile number is required.';
        else if (!/^\d{10}$/.test(value))
          error = 'Enter a valid 10-digit mobile number.';
        break;
      case 'password':
        if (!value) error = 'Password is required.';
        else if (!isPasswordValid)
          error = 'Password does not meet all conditions.';
        break;
      case 'confirmPassword':
        if (!value) error = 'Please confirm your password.';
        else if (value !== formData.password) error = 'Passwords do not match.';
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

    const newErrors: Partial<SignupForm> = {};

    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof SignupForm;
      validateField(fieldName, formData[fieldName]);
      if (!formData[fieldName]) {
        newErrors[fieldName] =
          `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required.`;
      }
    });

    if (Object.values(newErrors).some((error) => error)) {
      setErrors(newErrors);
      return;
    }

    apiClient
      .post('/auth/signup', formData)
      .then((data) => {
        console.log('\n data...', data);
        setUser(data.data?.data);
        navigate('/');
      })
      .catch((err) => {
        console.log('\n err...', err);
        if (err.response && err.response.data) {
          let message = 'Something went wrong. Please try again.';
          if (
            err.response.data.errorResponse &&
            err.response.data.errorResponse.code == 11000
          ) {
            message =
              'Registration number already in use. Please try login or use different number.';
          } else {
            message = err.response.data.message;
          }
          setErrorMessage(message);
          setError(true);
        }
      });
  };

  const handleClose = (_: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setError(false);
  };

  const validateRegNum = (regNum: string) => {
    const clgCode = regNum.slice(0, 4);
    const year = Number(regNum.slice(4, 6));
    const code = regNum.slice(6, 9);
    const serialNumber = regNum.slice(9, 12);
    if (
      clgCode != '8227' ||
      !['103', '104', '105', '106', '114'].includes(code) ||
      Number(serialNumber) > 70
    )
      return false;
    const currMonth = moment().month();
    let currYear = Number(('' + moment().year()).slice(2, 4));
    if (currMonth < 8 && currMonth >= 0) {
      currYear = currYear - 1;
    }
    if (currYear < year || year < 13) return false;
    return true;
  };

  const isFormValid =
    Object.values(errors).every((error) => !error) &&
    Object.values(formData).every((value) => value) &&
    formData.password.length >= 6 &&
    formData.confirmPassword.length >= 6;

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
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          className="heading"
        >
          <div>Registration</div>
          <div>Join your alumni network</div>
        </Typography>

        {Object.values(errors).some((error) => error) && (
          <Alert severity="error">
            {Object.values(errors).map((error, idx) => (
              <div key={idx}>{error}</div>
            ))}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Typography variant="body2" color="textSecondary">
            Registration Number must:
          </Typography>
          <ul>
            <li>Be valid</li>
            <li>Be from your degree certificate / mark sheet</li>
            <li>Not allowed to be edited after registration</li>
            <li>If invalid, then your account won&apos;t be active</li>
          </ul>
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
          <Typography variant="body2" color="textSecondary">
            Name must be valid from your degree certificate
          </Typography>
          <TextField
            label="Name"
            name="name"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name && !!errors.name}
            helperText={touched.name && errors.name}
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email && !!errors.email}
            helperText={touched.email && errors.email}
            required
          />
          <TextField
            label="Mobile Number"
            name="mobileNumber"
            type="tel"
            fullWidth
            margin="normal"
            value={formData.mobileNumber}
            onChange={(event) => {
              const { value } = event.target;
              if (/^\d{0,10}$/.test(value)) {
                setFormData((prev) => ({
                  ...prev,
                  mobileNumber: value,
                }));
              }
            }}
            onBlur={handleBlur}
            error={touched.mobileNumber && !!errors.mobileNumber}
            helperText={touched.mobileNumber && errors.mobileNumber}
            required
          />
          <Typography variant="body2" color="textSecondary">
            Password must:
          </Typography>
          <ul style={{ paddingLeft: '1rem' }}>
            {passwordValidations.map((validation, index) => (
              <li
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: validation.condition ? 'green' : 'red',
                  marginBottom: '0.5rem',
                }}
              >
                {validation.condition ? (
                  <CheckCircle
                    fontSize="small"
                    style={{ marginRight: '0.5rem' }}
                  />
                ) : (
                  <Cancel fontSize="small" style={{ marginRight: '0.5rem' }} />
                )}
                {validation.message}
              </li>
            ))}
          </ul>
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
          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.confirmPassword && !!errors.confirmPassword}
            helperText={touched.confirmPassword && errors.confirmPassword}
            required
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
            disabled={!isFormValid}
            sx={{ mt: 2 }}
          >
            Sign Up
          </Button>
        </form>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Already have an account?{' '}
          <MuiLink href="/auth/login" underline="hover">
            Log in
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

export default Signup;
