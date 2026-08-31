import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Permission, ROLE_PERMISSIONS } from '../types';
import { AppStorage } from '../lib/storage';

interface AuthContextType {
  currentUser: User;
  users: User[];
  login: (email: string, role?: UserRole) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  can: (permission: Permission) => boolean;
  isRole: (role: UserRole | UserRole[]) => boolean;
  updateCurrentUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => AppStorage.getUsers());
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUserId = localStorage.getItem('tes_current_user_id');
    const all = AppStorage.getUsers();
    const found = all.find(u => u.id === savedUserId);
    return found || all[0];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tes_current_user_id', currentUser.id);
    }
  }, [currentUser]);

  const login = (email: string, role?: UserRole): boolean => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      return true;
    }
    if (role) {
      const foundByRole = users.find(u => u.role === role);
      if (foundByRole) {
        setCurrentUser(foundByRole);
        return true;
      }
    }
    // Fallback: create temporary or select admin
    setCurrentUser(users[0]);
    return true;
  };

  const logout = () => {
    // Reset to demo admin or clear
    setCurrentUser(users[0]);
  };

  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const can = (permission: Permission): boolean => {
    if (!currentUser) return false;
    const permissions = ROLE_PERMISSIONS[currentUser.role] || [];
    return permissions.includes(permission);
  };

  const isRole = (role: UserRole | UserRole[]): boolean => {
    if (!currentUser) return false;
    if (Array.isArray(role)) {
      return role.includes(currentUser.role);
    }
    return currentUser.role === role;
  };

  const updateCurrentUser = (userData: Partial<User>) => {
    const updated = { ...currentUser, ...userData };
    setCurrentUser(updated);
    const updatedUsers = users.map(u => u.id === updated.id ? updated : u);
    setUsers(updatedUsers);
    AppStorage.setUsers(updatedUsers);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        switchUser,
        can,
        isRole,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
