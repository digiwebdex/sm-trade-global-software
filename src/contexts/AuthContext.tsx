import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { storage, KEYS, initializeData } from '@/utils/storage';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    initializeData();
    const saved = localStorage.getItem('sm_current_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const users = storage.getAll<User>(KEYS.USERS);
    const found = users.find(u => u.username === username && u.password === password);
    if (found) {
      setUser(found);
      localStorage.setItem('sm_current_user', JSON.stringify(found));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sm_current_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
