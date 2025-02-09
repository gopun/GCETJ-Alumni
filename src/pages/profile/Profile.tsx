import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { useUser } from '../../context/UserContext';
import {
  ProfileForm,
  ProfileTouchedFields,
  User,
} from '../../models/interface';
import apiClient from '../../utils/api';
import { uploadFile } from '../../utils/file-upload';
import { useLoader } from '../../context/LoaderContext';
import SnackAlert from '../../components/alert/Alert';
import { useNavigate } from 'react-router-dom';

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [formData, setFormData] = useState<ProfileForm>({
    name: '',
    email: '',
    mobileNumber: '',
    certificateImage: '',
    userImage: '',
    regNumber: '',
    batch: '',
    department: '',
  });
  const [errors, setErrors] = useState<Partial<ProfileForm>>({});
  const [touched, setTouched] = useState<ProfileTouchedFields>({
    name: false,
    email: false,
    mobileNumber: false,
    regNumber: false,
    batch: false,
    department: false,
  });
  const [isModified, setIsModified] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<
    'success' | 'info' | 'warning' | 'error'
  >('error');
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(
    null,
  );
  const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState<
    string | null
  >(null);

  const [selectedCertificate, setSelectedCertificate] = useState<File | null>(
    null,
  );
  const [certificatePreviewUrl, setCertificatePreviewUrl] =
    useState<string>('');
  const { loading, setLoading } = useLoader();

  const optionalFields = ['certificateImage', 'userImage'];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        certificateImage: user.certificateImage || '',
        userImage: user.userImage || '',
        regNumber: user.regNumber || '',
        batch: user.batch || '',
        department: user.department || '',
      });
      if (user.userImage) {
        setProfileImagePreviewUrl(user.userImage);
      }
      if (user.certificateImage) {
        setCertificatePreviewUrl(user.certificateImage);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const userForm: Partial<ProfileForm> = {};
      Object.keys(formData)
        .filter((key) => !optionalFields.includes(key))
        .forEach((key) => {
          userForm[key as keyof ProfileForm] =
            user[key as keyof ProfileForm] || '';
        });

      const isChanged = Object.keys(formData)
        .filter((key) => !optionalFields.includes(key))
        .some(
          (key) =>
            formData[key as keyof ProfileForm] !==
            userForm[key as keyof ProfileForm],
        );

      // const fileChanged =
      //   selectedProfileImage !== null || selectedCertificate !== null;

      setIsModified(isChanged || selectedCertificate !== null);
    }
  }, [formData, selectedProfileImage, selectedCertificate, user]); // Added `user` as dependency

  const isFileSizeValid = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setIsAlertOpen(true);
      setAlertMessage('File size exceeds 2MB limit.');
      setAlertSeverity('error');
      return false;
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

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!isFileSizeValid(file)) return false;
      else {
        setSelectedCertificate(file);
        let certificateImage = null;
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => {
            certificateImage = reader.result as string;
            setCertificatePreviewUrl(certificateImage);
            setFormData({ ...formData, certificateImage });
          };
          reader.readAsDataURL(file);
        } else {
          if (file.type === 'application/pdf') {
            certificateImage = URL.createObjectURL(file);
            setCertificatePreviewUrl(certificateImage);
          } else {
            certificateImage = null;
            setCertificatePreviewUrl('');
          }
          setFormData({
            ...formData,
            certificateImage: certificateImage || '',
          });
        }
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
        setLoading(true);
        if (selectedProfileImage) {
          const profileImgResp = await uploadFile(
            selectedProfileImage,
            'profile',
            updatedUser.regNumber,
          );
          if (!profileImgResp.error) updatedUser.userImage = profileImgResp;
        }
        if (selectedCertificate) {
          const certificateResp = await uploadFile(
            selectedCertificate,
            'degree',
            updatedUser.regNumber,
          );
          if (!certificateResp.error)
            updatedUser.certificateImage = certificateResp;
        }
        const saveResp = await apiClient.put(
          '/user/update-profile',
          updatedUser,
        );
        const userObj: User = {
          id: saveResp.data.data._id,
          userImage: saveResp.data.data.userImage,
          regNumber: saveResp.data.data.regNumber,
          name: saveResp.data.data.name,
          mobileNumber: saveResp.data.data.mobileNumber,
          email: saveResp.data.data.email,
          department: saveResp.data.data.department,
          certificateImage: saveResp.data.data.certificateImage,
          batch: saveResp.data.data.batch,
        };
        setUser(userObj);
        setLoading(false);
        setIsAlertOpen(true);
        setAlertSeverity('success');
        setAlertMessage('Profile updated successfully.');
        setTimeout(() => {
          navigate('/');
        }, 500);
      } catch (error) {
        console.log('\n save error...', error);
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setIsAlertOpen(false);
  };

  const allFieldsFilled = () =>
    Object.entries(formData)
      .filter(([key]) => !optionalFields.includes(key))
      .every(([, val]) => val !== '');
  const isFormValid = () =>
    Object.values(errors).every((error) => !error) && allFieldsFilled();

  const isButtonDisabled = () =>
    !isModified || !allFieldsFilled() || !isFormValid() || loading;

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
            <Typography variant="subtitle2" gutterBottom>
              <div>(Profile image must be less than size 2MB)</div>
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
              required
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
            <TextField
              label="Batch"
              fullWidth
              variant="outlined"
              value={user?.batch}
              disabled
            />
            <TextField
              label="Department"
              fullWidth
              variant="outlined"
              value={user?.department}
              disabled
            />
            <Typography variant="subtitle2" gutterBottom>
              <div>Upload Certificate (Image or PDF)*</div>
            </Typography>
            <Typography variant="caption" gutterBottom>
              <div>
                Upload any certificate which contains registration number
              </div>
              <div>(Certificate must be less than size 2MB) </div>
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
                onChange={handleCertificateChange}
              />
            </Button>
            {certificatePreviewUrl && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Preview:
                </Typography>
                <iframe
                  src={certificatePreviewUrl}
                  width="100%"
                  height="auto"
                  title="Preview"
                  style={{
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                    marginTop: '20px',
                    maxHeight: '600px',
                    display: 'block',
                  }}
                ></iframe>
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              fullWidth
              type="submit"
              disabled={isButtonDisabled()}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Save Changes'
              )}
            </Button>
          </Box>
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

export default Profile;
