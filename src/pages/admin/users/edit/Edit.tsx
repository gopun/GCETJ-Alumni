import React, { useEffect, useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  Container,
  CircularProgress,
  Avatar,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useLoader } from '../../../../context/LoaderContext';
import apiClient from '../../../../utils/api';
import './Edit.css';
import { ProfileTouchedFields, User } from '../../../../models/interface';
import { MAX_FILE_SIZE, uploadFile } from '../../../../utils/file-upload';
import SnackAlert from '../../../../components/alert/Alert';
import moment from 'moment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const UserProfile = () => {
  const initialUserData: User = {
    _id: '',
    name: '',
    email: '',
    mobileNumber: '',
    certificateImage: '',
    userImage: '',
    regNumber: '',
    batch: '',
    department: '',
    status: 'Active',
    isAdmin: false,
  };

  const DEPT_CODE = {
    103: 'CIVIL',
    104: 'CSE',
    105: 'EEE',
    106: 'ECE',
    114: 'MECH',
  };

  const splitRegNumber = (regNumber: string, type: 'batch' | 'dept') => {
    if (!regNumber || regNumber.length < 12) return '';
    const year = Number(regNumber.slice(4, 6));
    const code = regNumber.slice(6, 9) as '103' | '104' | '105' | '106' | '114';
    switch (type) {
      case 'batch':
        return `20${year} - 20${year + 4}`;
      case 'dept':
        return DEPT_CODE[code];
      default:
        return '';
    }
  };

  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditPage = location.pathname.includes('edit');
  const [errors, setErrors] = useState<Partial<User>>({});
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
  const optionalFields = ['userImage'];
  const [tempUserData, setTempUserData] = useState<User>(initialUserData);
  const [formData, setFormData] = useState<User>(initialUserData);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const userDataResp = await apiClient.get(
        `/admin/users/get-by-id?userId=${userId}`,
      );
      return userDataResp.data?.data?.user;
    } catch (error) {
      console.log('\n get user error..', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser().then((userData) => {
      setTempUserData(userData);
      setFormData(userData);
      if (userData.userImage) {
        setProfileImagePreviewUrl(userData.userImage);
      }
      if (userData.certificateImage) {
        setCertificatePreviewUrl(userData.certificateImage);
      }
    });
  }, []);

  useEffect(() => {
    if (formData) {
      const isChanged = Object.keys(formData)
        .filter((key) => !optionalFields.includes(key))
        .some(
          (key) =>
            formData[key as keyof User] !== tempUserData[key as keyof User],
        );

      setIsModified(
        isChanged ||
          selectedCertificate !== null ||
          selectedProfileImage !== null,
      );
    }
  }, [formData, selectedProfileImage, selectedCertificate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      const updatedUser = { ...formData };

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
          '/admin/users/update-profile',
          updatedUser,
        );
        const userObj: User = {
          _id: saveResp.data.data._id,
          userImage: saveResp.data.data.userImage,
          regNumber: saveResp.data.data.regNumber,
          name: saveResp.data.data.name,
          mobileNumber: saveResp.data.data.mobileNumber,
          email: saveResp.data.data.email,
          department: saveResp.data.data.department,
          certificateImage: saveResp.data.data.certificateImage,
          batch: saveResp.data.data.batch,
        };
        setFormData(userObj);
        setLoading(false);
        setIsAlertOpen(true);
        setAlertSeverity('success');
        setAlertMessage('Profile updated successfully.');
        setTimeout(() => {
          navigate('/admin/users');
        }, 500);
      } catch (error) {
        console.log('\n save error...', error);
        setLoading(false);
      }
    }
  };

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
      validateField(name as keyof User, value);
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const { name } = event.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    validateField(name as keyof User, formData[name as keyof User] || '');
  };

  const validateRegNum = (regNum: string) => {
    const clgCode = regNum.slice(0, 4);
    const year = Number(regNum.slice(4, 6));
    const code = regNum.slice(6, 9);
    const serialNumber = regNum.slice(9, 12);
    if (
      clgCode != '8227' ||
      !['103', '104', '105', '106', '114'].includes(code) ||
      Number(serialNumber) > 999
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

  const updateBatch = () => {
    setFormData((prevUser) => ({
      ...prevUser,
      batch: splitRegNumber(formData.regNumber, 'batch'),
      department: splitRegNumber(formData.regNumber, 'dept'),
    }));
  };

  const validateField = (name: keyof User, value: string | boolean) => {
    let error = '';
    if (typeof value == 'string') {
      switch (name) {
        case 'name':
          if (!value) error = 'Name is required.';
          break;
        case 'regNumber':
          if (!value) error = 'Registration number is required.';
          else if (value.length != 12 || !validateRegNum(value))
            error = 'Please enter valid Registration number.';
          else updateBatch();
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
    }
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const allFieldsFilled = () =>
    Object.entries(formData)
      .filter(([key]) => !optionalFields.includes(key))
      .every(([, val]) => val !== '');
  const isFormValid = () =>
    Object.values(errors).every((error) => !error) && allFieldsFilled();

  const isButtonDisabled = () =>
    !isModified ||
    !allFieldsFilled() ||
    !isFormValid() ||
    loading ||
    !isEditPage;

  const handleClose = () => {
    setIsAlertOpen(false);
  };

  return (
    <Container maxWidth="sm" className="edit-profile">
      <Paper sx={{ padding: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 2,
          }}
        >
          <NavLink to={'/admin/users'}>
            <ArrowBackIcon sx={{ fontSize: 30 }} />
          </NavLink>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ flexGrow: 1, textAlign: 'center' }}
          >
            {isEditPage ? 'Edit User' : 'View User'}
          </Typography>
        </Box>

        <form noValidate autoComplete="off" onSubmit={handleSubmit}>
          {/* View Mode */}
          {formData ? (
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
                disabled={!isEditPage}
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
                fullWidth
                variant="outlined"
                name="regNumber"
                value={formData.regNumber}
                disabled={!isEditPage}
                required
                onBlur={handleBlur}
                error={touched.regNumber && !!errors.regNumber}
                helperText={touched.regNumber && errors.regNumber}
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
                label="Name"
                fullWidth
                variant="outlined"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name && !!errors.name}
                helperText={touched.name && errors.name}
                disabled={!isEditPage}
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
                disabled={!isEditPage}
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
                disabled={!isEditPage}
              />
              <TextField
                label="Batch"
                fullWidth
                variant="outlined"
                value={formData?.batch}
                disabled
              />
              <TextField
                label="Department"
                fullWidth
                variant="outlined"
                value={formData?.department}
                disabled
              />
              <RadioGroup
                row
                value={formData?.status || 'Active'} // Ensure a default value
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as 'Active' | 'Inactive',
                  }))
                }
              >
                <FormControlLabel
                  value="Active"
                  control={<Radio />}
                  label="Active"
                  disabled={!isEditPage}
                />
                <FormControlLabel
                  value="Inactive"
                  control={<Radio />}
                  label="Inactive"
                  disabled={!isEditPage}
                />
              </RadioGroup>
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
                disabled={!isEditPage}
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
                      maxHeight: '1000px',
                      height: '600px',
                      display: 'block',
                    }}
                  ></iframe>
                </Box>
              )}
            </Box>
          ) : (
            <>empty</>
          )}

          {/* Action Buttons */}
          <Box sx={{ marginTop: 2 }}>
            {!isEditPage ? (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <NavLink to={'/admin/users/edit/' + userId}>
                  <Button variant="contained">Edit</Button>
                </NavLink>
                <NavLink to={'/admin/users'}>
                  <Button variant="outlined" color="secondary">
                    Back
                  </Button>
                </NavLink>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isButtonDisabled()}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Save'
                  )}
                </Button>
                <NavLink to={'/admin/users'}>
                  <Button variant="outlined" color="secondary">
                    Cancel
                  </Button>
                </NavLink>
              </Box>
            )}
          </Box>
        </form>
      </Paper>

      <SnackAlert
        isOpen={isAlertOpen}
        message={alertMessage}
        severity={alertSeverity}
        handleClose={handleClose}
      />
    </Container>
  );
};

export default UserProfile;
