export interface User {
  id: string;
  name: string;
  email: string;
  certificateImage: string;
  userImage: string;
  mobileNumber: string;
  regNumber: string;
}

export interface SignupForm {
  name: string;
  email: string;
  mobileNumber: string;
  regNumber: string;
  password: string;
  confirmPassword: string;
}

export interface SignupTouchedFields {
  name: boolean;
  email: boolean;
  mobileNumber: boolean;
  regNumber: boolean;
  password: boolean;
  confirmPassword: boolean;
}

export interface ProfileForm {
  name: string;
  email: string;
  mobileNumber: string;
  regNumber: string;
  certificateImage: string;
  userImage: string;
}

export interface ProfileTouchedFields {
  name: boolean;
  email: boolean;
  mobileNumber: boolean;
  regNumber: boolean;
  password?: boolean;
  confirmPassword?: boolean;
}

export interface LoginForm {
  regNumber: string;
  password: string;
}

export interface LoginTouchedFields {
  regNumber: boolean;
  password: boolean;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  timeout?: number;
}
