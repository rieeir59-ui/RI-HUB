
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type Employee, employees } from '@/lib/employees';

interface UserContextType {
  user: Employee | null;
  isUserLoading: boolean;
  login: (user: Employee) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Employee | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    try {
      const userEmail = localStorage.getItem('currentUserEmail');
      if (userEmail) {
        const currentUser = employees.find(e => e.email === userEmail);
        setUser(currentUser || null);
      }
    } catch (e) {
      console.error("Failed to access localStorage or parse user data.", e)
    } finally {
        setIsUserLoading(false);
    }
  }, []);

  const login = (user: Employee) => {
    try {
      localStorage.setItem('currentUserEmail', user.email);
    } catch (e) {
      console.error("Failed to save user to localStorage", e);
    }
    setUser(user);
  };

  const logout = () => {
    try {
      localStorage.removeItem('currentUserEmail');
    } catch(e) {
      console.error("Failed to remove user from localStorage", e);
    }
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, isUserLoading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useCurrentUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useCurrentUser must be used within a UserProvider');
  }
  return context;
};
