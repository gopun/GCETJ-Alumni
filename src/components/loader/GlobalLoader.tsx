import React from 'react';
import { CircularProgress, Backdrop } from '@mui/material';
import { useLoader } from '../../context/LoaderContext';

const GlobalLoader: React.FC = () => {
  const { loading } = useLoader();

  return (
    <Backdrop
      open={loading}
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default GlobalLoader;
