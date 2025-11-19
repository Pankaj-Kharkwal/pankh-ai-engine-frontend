import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, signup as apiSignup, logout as apiLogout, checkAuthStatus as apiCheckAuthStatus } from '../services/authService';

interface User {
  id: string;
  email: string;
  full_name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userData = await apiCheckAuthStatus();
        setUser(userData);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    const responseData = await apiLogin(email, password);
    setUser(responseData.user); // Assuming responseData contains a 'user' field
  };

  const signup = async (fullName: string, email: string, password:string) => {
    const userData = await apiSignup(fullName, email, password);
    setUser(userData);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        login,
        signup,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
