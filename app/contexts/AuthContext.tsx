'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import authService from '../services/authService';

export interface User {
  userId: string;
  username: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, email: string) => Promise<void>;
  logout: () => void;
  loginWithGoogle: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load token and verify on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        try {
          const userData = await authService.verifyToken(storedToken);
          setToken(storedToken);
          setUser(userData);
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login(username, password);
      
      if (response.isOk && response.payload) {
        const { access_token, refresh_token, user: userData } = response.payload;
        
        // Store both tokens
        localStorage.setItem('token', access_token);
        if (refresh_token) {
          localStorage.setItem('refreshToken', refresh_token);
        }
        
        setToken(access_token);
        setUser(userData);
        
        // Redirect to app
        router.push('/app');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const signup = async (username: string, password: string, email: string) => {
    try {
      const response = await authService.signup(username, password, email);
      
      if (response.isOk && response.payload) {
        const { access_token, refresh_token, user: userData } = response.payload;
        
        // Store both tokens
        localStorage.setItem('token', access_token);
        if (refresh_token) {
          localStorage.setItem('refreshToken', refresh_token);
        }
        
        setToken(access_token);
        setUser(userData);
        
        // Redirect to app
        router.push('/app');
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Signup failed');
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear both tokens and local state
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setUser(null);
      router.push('/login');
    }
  };

  const loginWithGoogle = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/google`;
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    loginWithGoogle,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
