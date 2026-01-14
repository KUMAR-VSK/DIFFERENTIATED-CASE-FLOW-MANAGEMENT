import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Theme Context
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const value = {
    darkMode,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Auth Context
const AuthContext = createContext();

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
  const [credentials, setCredentials] = useState(() => {
    const stored = localStorage.getItem('credentials');
    return stored ? JSON.parse(stored) : null;
  });

  // Configure axios defaults
  useEffect(() => {
    if (credentials) {
      axios.defaults.headers.common['Authorization'] = `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [credentials]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (credentials) {
        try {
          const response = await axios.get('http://localhost:8080/api/auth/me');
          setUser(response.data);
        } catch (error) {
          // Credentials invalid, clear them
          localStorage.removeItem('credentials');
          setCredentials(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [credentials]);

  const login = async (username, password) => {
    try {
      // Create basic auth header
      const authHeader = btoa(`${username}:${password}`);
      axios.defaults.headers.common['Authorization'] = `Basic ${authHeader}`;

      const response = await axios.get('http://localhost:8080/api/auth/me');
      setUser(response.data);

      // Store credentials for persistence
      const creds = { username, password };
      setCredentials(creds);
      localStorage.setItem('credentials', JSON.stringify(creds));

      return { success: true };
    } catch (error) {
      delete axios.defaults.headers.common['Authorization'];
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/register', userData);
      return { success: true, user: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setCredentials(null);
    localStorage.removeItem('credentials');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    credentials,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
