import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ProtectedRouteProps } from '../models/interface';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
