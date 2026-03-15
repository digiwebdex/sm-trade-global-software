import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { api } from '@/utils/api';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('sm_current_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const found = await api.login(username, password) as User;
      if (found) {
        setUser(found);
        localStorage.setItem('sm_current_user', JSON.stringify(found));
        return true;
      }
      return false;
    } catch {
      // Fallback to localStorage for Lovable preview
      const { storage, KEYS, initializeData } = await import('@/utils/storage');
      initializeData();
      const users = storage.getAll<User>(KEYS.USERS);
      const found = users.find(u => u.username === username && u.password === password);
      if (found) {
        setUser(found);
        localStorage.setItem('sm_current_user', JSON.stringify(found));
        return true;
      }
      return false;
    }
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

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
