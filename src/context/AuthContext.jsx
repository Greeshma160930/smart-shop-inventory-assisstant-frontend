import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('smartshop_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('smartshop_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('smartshop_token', token);
    } else {
      localStorage.removeItem('smartshop_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('smartshop_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('smartshop_user');
    }
    setLoading(false);
  }, [user]);

  const login = async (email, password) => {
    const response = await axiosClient.post('/auth/login', { email, password });
    const data = response.data;
    setToken(data.token);
    setUser({
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      shopName: data.shopName,
    });
    return data;
  };

  const register = async (name, email, password, shopName) => {
    const response = await axiosClient.post('/auth/register', {
      name,
      email,
      password,
      shopName,
    });
    return response.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('smartshop_token');
    localStorage.removeItem('smartshop_user');
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
