import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/home/Home';
import NotFound from '../components/not-found/NotFound';
import FullLayout from '../components/layouts/Full/FullLayout';
import BlankLayout from '../components/layouts/Blank/BlankLayout';
import Login from '../pages/auth/login/Login';
import Signup from '../pages/auth/signup/Signup';
import Profile from '../pages/profile/Profile';
import { useUser } from '../context/UserContext';
import ProtectedRoute from './ProtectedRoute';
import ForgotPassword from '../pages/auth/forgot-password/ForgoyPassword';
import ResetPassword from '../pages/auth/reset-password/ResetPassword';
import UsersList from '../pages/admin/users/list/List';
import UserProfile from '../pages/admin/users/edit/Edit';

const ProfileRedirect = ({ children }: { children: JSX.Element }) => {
  const { user } = useUser();
  if (!user || (user && user.certificateImage)) return children;
  return <Navigate to="/profile" />;
};

const IsUserLoggedIn = ({ children }: { children: JSX.Element }) => {
  const { user } = useUser();
  if (user) {
    if (!user.certificateImage) {
      return <Navigate to="/profile" />;
    }
    return <Navigate to="/" />;
  }
  return children;
};

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="users">
        <Route index element={<UsersList />} />
        <Route path="edit/:userId" element={<UserProfile />} />
        <Route path="view/:userId" element={<UserProfile />} />
      </Route>
    </Routes>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<FullLayout />}>
        <Route
          index
          element={
            <ProfileRedirect>
              <Home />
            </ProfileRedirect>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/*"
          element={
            <ProtectedRoute>
              <AdminRoutes />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Auth routes */}
      <Route
        path="/auth"
        element={
          <IsUserLoggedIn>
            <BlankLayout />
          </IsUserLoggedIn>
        }
      >
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
