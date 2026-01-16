'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => void;
  logout: () => void;
  register: (name: string, email: string, pass: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database
const mockUsers: { [email: string]: { passwordHash: string, user: User } } = {
  "user@example.com": {
    passwordHash: "password123", // In a real app, this would be a hash
    user: { id: '1', name: 'Usuario de Prueba', email: 'user@example.com' }
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, pass: string) => {
    const dbUser = mockUsers[email];
    if (dbUser && dbUser.passwordHash === pass) {
      setUser(dbUser.user);
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
  };
  
  const register = (name: string, email: string, pass: string) => {
    if (mockUsers[email]) {
        throw new Error('User already exists');
    }
    const newUser: User = { id: String(Date.now()), name, email };
    mockUsers[email] = { passwordHash: pass, user: newUser };
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
