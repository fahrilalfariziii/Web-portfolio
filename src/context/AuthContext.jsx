/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, logout as apiLogout, getStoredUser, isAuthenticated } from '../lib/apiClient';

const AuthContext = createContext({ user: null, loading: true, signIn: async () => {}, signOut: async () => {} });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check token existence; server verifies actual validity on /api calls
    const u = getStoredUser();
    if (u && u.exp && u.exp * 1000 > Date.now()) {
      setUser({ email: u.email, id: u.id });
    } else if (isAuthenticated()) {
      // Token present but expired or undecodable - treat as user
      const fallback = getStoredUser();
      if (fallback) setUser({ email: fallback.email });
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    const data = await apiLogin(email, password);
    setUser(data.user || { email });
    return data.user;
  };

  const signOut = async () => {
    await apiLogout();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
