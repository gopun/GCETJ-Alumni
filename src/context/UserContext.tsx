import React, { createContext, useState, useContext } from 'react';
import { User } from '../models/interface';

interface UserContextProps {
  user: User | null;
  isUserLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsUserLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState<boolean>(true);

  return (
    <UserContext.Provider
      value={{ user, isUserLoading, setUser, setIsUserLoading }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
