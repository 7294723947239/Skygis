'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  user_metadata?: { username?: string };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => void;
  loginAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>({ 
    id: 'guest-001', 
    email: 'guest@skygis.local',
    user_metadata: { username: '访客' }
  });
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, _password: string): Promise<{ error?: string }> => {
    setLoading(true);
    setUser({ id: 'user-001', email, user_metadata: { username: email.split('@')[0] } });
    setLoading(false);
    return { error: undefined };
  };

  const signUp = async (email: string, _password: string): Promise<{ error?: string }> => {
    setLoading(true);
    setUser({ id: 'user-new', email, user_metadata: { username: email.split('@')[0] } });
    setLoading(false);
    return { error: undefined };
  };

  const signOut = () => {
    setUser(null);
  };

  const loginAsGuest = () => {
    setUser({ 
      id: 'guest-001', 
      email: 'guest@skygis.local',
      user_metadata: { username: '访客' }
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, loginAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
