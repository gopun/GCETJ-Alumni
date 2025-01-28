// Navigation.tsx
import React, { useState } from 'react';
import './Nav.css'; // Import the CSS for styling
import { Link, NavLink } from 'react-router-dom';
import { Button, Menu, MenuItem } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useUser } from '../../context/UserContext';
import apiClient from '../../utils/api';

const Navigation: React.FC = () => {
  const { user, setUser } = useUser();
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
      .then((data) => {
        console.log('\n data...', data);
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
      {user ? (
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
            <MenuItem onClick={handleMenuClose}>
              <Link
                to="/profile"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                Profile
              </Link>
            </MenuItem>
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
