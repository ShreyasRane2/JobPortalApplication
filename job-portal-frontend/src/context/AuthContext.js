import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

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
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Setup axios interceptor to handle token expiration globally
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Check if error is due to expired JWT
        if (error.response?.status === 500 || error.response?.status === 401) {
          const errorMessage = error.response?.data?.message || error.message || '';
          if (errorMessage.includes('JWT expired') || errorMessage.includes('expired')) {
            console.log('Global interceptor: JWT expired, logging out...');
            logout();
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          // Fetch user profile to get role and other details
          console.log('AuthContext: Fetching user profile...');
          const response = await axios.get('http://localhost:5454/api/users/me');
          console.log('AuthContext: User profile fetched:', response.data);
          setUser(response.data);
        } catch (error) {
          console.error('AuthContext: Failed to fetch user profile:', error);
          // If token is invalid or expired, clear it
          if (error.response?.status === 401 || error.response?.status === 500) {
            console.log('AuthContext: Token expired or invalid, logging out...');
            logout();
          }
        }
      }
      setLoading(false);
    };
    
    fetchUserProfile();
  }, [token]);

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Logging in...');
      const response = await axios.post('http://localhost:5454/api/auth/login', {
        email,
        password
      });
      
      const { jwt } = response.data;
      console.log('AuthContext: Login successful, token received');
      setToken(jwt);
      localStorage.setItem('token', jwt);
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
      
      // Fetch user profile to get role
      try {
        console.log('AuthContext: Fetching user profile after login...');
        const userResponse = await axios.get('http://localhost:5454/api/users/me', {
          headers: { 'Authorization': `Bearer ${jwt}` }
        });
        console.log('AuthContext: User profile after login:', userResponse.data);
        setUser(userResponse.data);
      } catch (error) {
        console.error('AuthContext: Failed to fetch user profile after login:', error);
      }
      
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      await axios.post('http://localhost:5454/api/auth/register', userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Registration failed' 
      };
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
