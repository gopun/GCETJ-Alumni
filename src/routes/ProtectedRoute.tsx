import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ProtectedRouteProps } from '../models/interface';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  timeout = 500,
}) => {
  const { user } = useUser();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  if (isChecking) {
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
