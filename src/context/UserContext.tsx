
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type Employee, employees } from '@/lib/employees';

interface UserContextType {
  user: Employee | null;
  login: (user: Employee) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Employee | null>(null);

  useEffect(() => {
    const userEmail = localStorage.getItem('currentUserEmail');
    if (userEmail) {
      const currentUser = employees.find(e => e.email === userEmail);
      setUser(currentUser || null);
    }
  }, []);

  const login = (user: Employee) => {
    localStorage.setItem('currentUserEmail', user.email);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('currentUserEmail');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
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
