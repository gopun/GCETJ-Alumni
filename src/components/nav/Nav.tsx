// Navigation.tsx
import React, { useState } from 'react';
import './Nav.css'; // Import the CSS for styling
import { Link, NavLink } from 'react-router-dom';
import { Button, CircularProgress, Menu, MenuItem } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useUser } from '../../context/UserContext';
import apiClient from '../../utils/api';

const Navigation: React.FC = () => {
  const { user, setUser, isUserLoading } = useUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    apiClient
      .post('auth/logout')
      .then(() => {
        setUser(null);
      })
      .catch((err) => {
        console.log('\n logout error...', err);
      });
  };

  return (
    <nav className="nav-bar">
      <ul>
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Home
          </NavLink>
        </li>
      </ul>
      {isUserLoading ? (
        <CircularProgress size={24} color="inherit" />
      ) : user ? (
        <>
          <Button
            color="inherit"
            endIcon={<ArrowDropDownIcon />}
            onClick={handleMenuOpen}
          >
            {user.name}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <Link
              to="/profile"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
            </Link>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </>
      ) : (
        <Link to="/auth/login">
          <Button variant="contained" color="primary">
            Login
          </Button>
        </Link>
      )}
    </nav>
  );
};

export default Navigation;
