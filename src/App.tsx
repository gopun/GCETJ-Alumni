import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import apiClient from './utils/api';
import { useUser } from './context/UserContext';
import GlobalLoader from './components/loader/GlobalLoader';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const App: React.FC = () => {
  const { user, setUser, setIsUserLoading } = useUser();

  useEffect(() => {
    if (!user) {
      setIsUserLoading(true);
      apiClient
        .get('/user')
        .then((response) => {
          setUser(response.data?.data?.user);
        })
        .catch((err) => {
          console.error('Failed to fetch user data:', err);
        })
        .finally(() => {
          setIsUserLoading(false);
        });
    }
  }, [user, setUser]);

  return (
    <Router>
      <GlobalLoader />
      <AppRoutes />
    </Router>
  );
};

export default App;
