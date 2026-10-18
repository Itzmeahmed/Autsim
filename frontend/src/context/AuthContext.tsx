import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (session: UserSession) => void;
  logout: () => void;
  switchDemoRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('autiaignosis_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(false);

  const login = (session: UserSession) => {
    setUser(session);
    localStorage.setItem('autiaignosis_token', session.access_token);
    localStorage.setItem('autiaignosis_session', JSON.stringify(session));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('autiaignosis_token');
    localStorage.removeItem('autiaignosis_session');
  };

  const switchDemoRole = async (role: UserRole) => {
    try {
      setLoading(true);
      const session = await api.auth.demoLogin(role);
      login(session);
    } catch (err) {
      console.error('Demo switch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
