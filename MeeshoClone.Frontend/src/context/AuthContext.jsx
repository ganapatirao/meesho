import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (user) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const register = (user) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const upgradeToPremier = async () => {
    try {
      const response = await authAPI.upgradeToPremier({ userId: user.id });
      if (response.data.success) {
        const updatedUser = { ...user, isPremier: true, premierExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true };
      }
      return { success: false, error: response.data.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    upgradeToPremier,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Admin',
    isPremier: user?.isPremier || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
