import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Avatar,
  Snackbar,
  Alert,
} from '@mui/material';
import { useUser } from '../../context/UserContext';
import { ProfileForm, ProfileTouchedFields } from '../../models/interface';
import { sendFormData } from '../../utils/api';

const DEPT_CODE: Record<string, string> = {
  '103': 'CIVIL',
  '104': 'CSE',
  '105': 'EEE',
  '106': 'ECE',
  '114': 'MECH',
};
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const Profile: React.FC = () => {
  const { user, setUser } = useUser();
  const [formData, setFormData] = useState<ProfileForm>({
    name: '',
    email: '',
    mobileNumber: '',
    certificateImage: '',
    userImage: '',
    regNumber: '',
  });
  const [errors, setErrors] = useState<Partial<ProfileForm>>({});
  const [touched, setTouched] = useState<ProfileTouchedFields>({
    name: false,
    email: false,
    mobileNumber: false,
    regNumber: false,
  });
  const [isModified, setIsModified] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(
    null,
  );
  const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState<
    string | null
  >(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        certificateImage: user.certificateImage || '',
        userImage: user.userImage || '',
        regNumber: user.regNumber || '',
      });
      if (user.userImage) {
        setProfileImagePreviewUrl(user.userImage);
      }
      if (user.certificateImage) {
        setFilePreviewUrl(user.certificateImage);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const userForm: Partial<ProfileForm> = {};
      Object.keys(formData).forEach((key) => {
        userForm[key as keyof ProfileForm] =
          user[key as keyof ProfileForm] || '';
      });

      const isChanged = Object.keys(formData).some(
        (key) =>
          formData[key as keyof ProfileForm] !==
          userForm[key as keyof ProfileForm],
      );

      // Check if files are changed
      const fileChanged =
        selectedProfileImage !== null || selectedFile !== null;

      setIsModified(isChanged || fileChanged);
    }
  }, [formData, selectedProfileImage, selectedFile, user]); // Added `user` as dependency

  const isFileSizeValid = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setError(true);
      setErrorMessage('File size exceeds 5MB limit.');
    }
    return true;
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!isFileSizeValid(file)) return false;
      else {
        setSelectedProfileImage(file);

        const reader = new FileReader();
        reader.onload = () => {
          setProfileImagePreviewUrl(reader.result as string);
          setFormData({ ...formData, userImage: reader.result as string });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!isFileSizeValid(file)) return false;
      else {
        setSelectedFile(file);
        let certificateImage = null;
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => {
            certificateImage = reader.result as string;
            setFilePreviewUrl(certificateImage);
            setFormData({ ...formData, certificateImage: certificateImage });
          };
          reader.readAsDataURL(file);
        } else if (file.type === 'application/pdf') {
          certificateImage = URL.createObjectURL(file);
          setFilePreviewUrl(certificateImage);
        } else {
          certificateImage = null;
          setFilePreviewUrl('');
        }
        setFormData({ ...formData, certificateImage: certificateImage || '' });
      }
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (touched[name as keyof ProfileTouchedFields]) {
      validateField(name as keyof ProfileForm, value);
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const { name } = event.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    validateField(
      name as keyof ProfileForm,
      formData[name as keyof ProfileForm] || '',
    );
  };

  const validateField = (name: keyof ProfileForm, value: string) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value) error = 'Name is required.';
        break;
      case 'mobileNumber':
        if (!value) error = 'Mobile number is required.';
        else if (!/^\d{10}$/.test(value))
          error = 'Enter a valid 10-digit mobile number.';
        break;
      case 'email':
        if (!value) error = 'Email is required.';
        else if (!/\S+@\S+\.\S+/.test(value))
          error = 'Enter a valid email address.';
        break;
      default:
        break;
    }
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const updatedUser = { ...user, ...formData };
      try {
        const saveResp = await sendFormData(
          '/user/update-profile',
          updatedUser,
          [
            { file: selectedProfileImage, name: 'profile' },
            { file: selectedFile, name: 'degree' },
          ] as { file: File; name: string }[],
          'put',
        );
        setUser(saveResp.data);
      } catch (error) {
        console.log('\n save error...', error);
      }
    }
  };

  const splitRegNumber = (
    regNumber: string | undefined,
    type: 'batch' | 'dept',
  ): string => {
    if (!regNumber || regNumber.length < 12) return '';
    const year = Number(regNumber.slice(4, 6));
    const code = regNumber.slice(6, 9);
    switch (type) {
      case 'batch':
        return `20${year} - 20${year + 4}`;
      case 'dept':
        return DEPT_CODE[code] || 'Unknown';
      default:
        return '';
    }
  };

  const handleClose = (_: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return; // Prevent closing on clickaway
    }
    setError(false);
  };

  const allFieldsFilled = Object.values(formData).every((val) => val !== '');
  const isFormValid =
    Object.values(errors).every((error) => !error) &&
    Object.values(formData).every((value) => value);

  return (
    <Container maxWidth="sm">
      <Box sx={{ padding: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Profile Page
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Avatar
                alt="Profile Image"
                src={profileImagePreviewUrl || undefined}
                sx={{ width: 120, height: 120 }}
              />
            </Box>
            <Button
              variant="contained"
              component="label"
              color="secondary"
              sx={{
                textTransform: 'none',
                padding: '6px 12px', // Adjust padding for smaller button
                fontSize: '0.875rem', // Smaller font size
                minWidth: 'unset', // Remove default minimum width
                borderRadius: '8px', // Slightly rounded corners for a sleek look
              }}
            >
              Change Profile Image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleProfileImageChange}
              />
            </Button>

            <TextField
              label="Registration Number"
              fullWidth
              variant="outlined"
              name="regNumber"
              value={formData.regNumber}
              disabled
            />
            <TextField
              label="Name"
              fullWidth
              variant="outlined"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.name && !!errors.name}
              helperText={touched.name && errors.name}
            />
            <TextField
              label="Email"
              fullWidth
              variant="outlined"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && !!errors.email}
              helperText={touched.email && errors.email}
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
            <TextField
              label="Batch"
              fullWidth
              variant="outlined"
              value={splitRegNumber(formData.regNumber, 'batch')}
              disabled
            />
            <TextField
              label="Department"
              fullWidth
              variant="outlined"
              value={splitRegNumber(formData.regNumber, 'dept')}
              disabled
            />

            <Typography variant="h6" gutterBottom>
              Upload Certificate (Image or PDF)
            </Typography>
            <Button
              variant="contained"
              component="label"
              color="secondary"
              sx={{
                textTransform: 'none',
                padding: '6px 12px', // Adjust padding for smaller button
                fontSize: '0.875rem', // Smaller font size
                minWidth: 'unset', // Remove default minimum width
                borderRadius: '8px', // Slightly rounded corners for a sleek look
              }}
            >
              Upload File
              <input
                type="file"
                accept="image/*,application/pdf"
                hidden
                onChange={handleFileChange}
              />
            </Button>

            {filePreviewUrl && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Preview:
                </Typography>
                {filePreviewUrl.startsWith('data:image') ? (
                  <img
                    src={filePreviewUrl}
                    alt="File Preview"
                    style={{ width: '100%', maxHeight: 300 }}
                  />
                ) : (
                  <iframe
                    src={filePreviewUrl}
                    width="100%"
                    height="600px"
                    title="PDF Viewer"
                    style={{
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                      marginTop: '20px',
                    }}
                  ></iframe>
                )}
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              fullWidth
              type="submit"
              disabled={!isModified || !allFieldsFilled || !isFormValid}
            >
              Save Changes
            </Button>
          </Box>
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

export default Profile;
