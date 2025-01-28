import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import apiClient from './utils/api';
import { useUser } from './context/UserContext';

const App: React.FC = () => {
  const { user, setUser } = useUser();

  useEffect(() => {
    if (!user) {
      apiClient
        .get('/user')
        .then((response) => {
          setUser(response.data?.user);
        })
        .catch((err) => {
          console.error('Failed to fetch user data:', err);
        });
    }
  }, [user, setUser]);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
