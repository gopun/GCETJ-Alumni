export interface User {
  _id: string;
  name: string;
  email: string;
  certificateImage: string;
  userImage: string;
  mobileNumber: string;
  regNumber: string;
  batch: string;
  department: string;
  createdAt?: string;
  updatedAt?: string;
  isAdmin?: boolean;
  status?: 'Active' | 'Inactive';
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
  batch: string;
  department: string;
}

export interface ProfileTouchedFields {
  name: boolean;
  email: boolean;
  mobileNumber: boolean;
  regNumber: boolean;
  password?: boolean;
  confirmPassword?: boolean;
  batch: boolean;
  department: boolean;
}

export interface LoginForm {
  regNumber: string;
  password: string;
}

export type Department = 'CSE' | 'ECE' | 'EEE' | 'CIVIL' | 'MECH';

export interface CountData {
  batch: string;
  total: number;
  counts: Array<{
    department: Department;
    count: number;
  }>;
}

export interface DepartmentCountData {
  department: Department;
  count: number;
}

export interface LoginTouchedFields {
  regNumber: boolean;
  password: boolean;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  timeout?: number;
}
