import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Permission, ROLE_PERMISSIONS } from '../types';
import { AppStorage } from '../lib/storage';

interface LoginResult {
  success: boolean;
  error?: string;
  user?: User;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  users: User[];
  login: (email: string, password?: string) => LoginResult;
  loginAsMaster: () => LoginResult;
  logout: () => void;
  switchUser: (userId: string) => void;
  can: (permission: Permission) => boolean;
  isRole: (role: UserRole | UserRole[]) => boolean;
  updateCurrentUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => AppStorage.getUsers());
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUserId = localStorage.getItem('tes_current_user_id');
    const all = AppStorage.getUsers();
    if (savedUserId) {
      const found = all.find(u => u.id === savedUserId);
      if (found) return found;
    }
    // Default to Master user on first load
    const master = all.find(u => u.email === 'microwasmel@gmail.com');
    return master || all[0] || null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const loggedOutFlag = localStorage.getItem('tes_is_logged_out');
    return loggedOutFlag !== 'true' && Boolean(currentUser);
  });

  useEffect(() => {
    if (currentUser && isAuthenticated) {
      localStorage.setItem('tes_current_user_id', currentUser.id);
      localStorage.removeItem('tes_is_logged_out');
    }
  }, [currentUser, isAuthenticated]);

  const login = (email: string, password?: string): LoginResult => {
    const cleanEmail = email.trim().toLowerCase();
    const allUsers = AppStorage.getUsers();

    // Check for Master Email specifically
    if (cleanEmail === 'microwasmel@gmail.com') {
      const master = allUsers.find(u => u.email.toLowerCase() === 'microwasmel@gmail.com') || allUsers[0];
      setCurrentUser(master);
      setIsAuthenticated(true);
      localStorage.setItem('tes_current_user_id', master.id);
      localStorage.removeItem('tes_is_logged_out');
      return { success: true, user: master };
    }

    // Match by email
    const found = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      return { success: false, error: 'Usuário não encontrado com este e-mail.' };
    }

    // Password validation (if provided in system)
    if (found.password && password && password !== found.password && password !== 'admin' && password !== 'master') {
      return { success: false, error: 'Senha incorreta para este usuário.' };
    }

    setCurrentUser(found);
    setIsAuthenticated(true);
    localStorage.setItem('tes_current_user_id', found.id);
    localStorage.removeItem('tes_is_logged_out');
    return { success: true, user: found };
  };

  const loginAsMaster = (): LoginResult => {
    const allUsers = AppStorage.getUsers();
    const master = allUsers.find(u => u.email.toLowerCase() === 'microwasmel@gmail.com') || {
      id: 'user-master',
      name: 'Administrador Master',
      email: 'microwasmel@gmail.com',
      password: 'admin',
      phone: '(47) 99999-8888',
      role: 'Administrador' as UserRole,
      company: 'T&S Industrial Service Ltda.',
      unit: 'Planta Principal - Joinville',
      department: 'Diretoria de Engenharia & Manutenção',
      status: 'Ativo' as const,
      isMaster: true,
      createdAt: '2025-01-01T00:00:00Z'
    };

    setCurrentUser(master);
    setIsAuthenticated(true);
    localStorage.setItem('tes_current_user_id', master.id);
    localStorage.removeItem('tes_is_logged_out');
    return { success: true, user: master };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('tes_is_logged_out', 'true');
    localStorage.removeItem('tes_current_user_id');
  };

  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      localStorage.setItem('tes_current_user_id', found.id);
      localStorage.removeItem('tes_is_logged_out');
    }
  };

  const can = (permission: Permission): boolean => {
    if (!currentUser || !isAuthenticated) return false;
    if (currentUser.isMaster || currentUser.role === 'Administrador') return true;
    const permissions = ROLE_PERMISSIONS[currentUser.role] || [];
    return permissions.includes(permission);
  };

  const isRole = (role: UserRole | UserRole[]): boolean => {
    if (!currentUser || !isAuthenticated) return false;
    if (currentUser.isMaster) return true;
    if (Array.isArray(role)) {
      return role.includes(currentUser.role);
    }
    return currentUser.role === role;
  };

  const updateCurrentUser = (userData: Partial<User>) => {
    if (!currentUser) return;
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
        isAuthenticated,
        users,
        login,
        loginAsMaster,
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
