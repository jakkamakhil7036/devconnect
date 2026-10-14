import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Dark/Light Mode state (Forced to dark!)
  const [theme, setTheme] = useState('dark');

  // Apply authorization token header helper
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };


  // Check login state on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setAuthToken(parsed.token);
          
          // Verify token and fetch latest profile details
          const response = await axios.get(`${API_URL}/profile/${parsed._id}`);
          
          // Merge stats into user object
          const updatedUser = { 
            ...parsed, 
            ...response.data.user,
            stats: response.data.stats 
          };
          
          setUser(updatedUser);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error) {
          console.error("Token validation failed, logging out:", error.message);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Sync theme changes with body class
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      if (body) body.classList.add('dark');
      root.style.backgroundColor = '#09090B';
    } else {
      root.classList.remove('dark');
      if (body) body.classList.remove('dark');
      root.style.backgroundColor = '#FAFAFA';
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Fetch Notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await axios.get(`${API_URL}/notifications`);
      setNotifications(res.data);
      
      const countRes = await axios.get(`${API_URL}/notifications/unread-count`);
      setUnreadCount(countRes.data.count);
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
    }
  };

  // Poll notifications every 30 seconds
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  const markNotificationRead = async (id) => {
    try {
      await axios.put(`${API_URL}/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await axios.put(`${API_URL}/notifications/read-all`);
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  // Login handler
  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const userData = response.data;
      
      // Fetch statistics for full state
      const profileRes = await axios.get(`${API_URL}/profile/${userData._id}`, {
        headers: { Authorization: `Bearer ${userData.token}` }
      });

      const fullUser = { 
        ...userData, 
        ...profileRes.data.user,
        stats: profileRes.data.stats 
      };

      setAuthToken(fullUser.token);
      setUser(fullUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(fullUser));
      setIsLoading(false);
      return fullUser;
    } catch (error) {
      setIsLoading(false);
      const msg = error.response?.data?.message || 'Login failed. Please try again.';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  // Register handler
  const register = async (userData) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      const registeredData = response.data;

      // Set empty stats since newly registered
      const fullUser = {
        ...registeredData,
        stats: {
          projectsJoined: 0,
          projectsCompleted: 0,
          contributionScore: 0,
          teamMembers: 0,
          resumeGenerated: false
        }
      };

      setAuthToken(fullUser.token);
      setUser(fullUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(fullUser));
      setIsLoading(false);
      return fullUser;
    } catch (error) {
      setIsLoading(false);
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  // Logout handler
  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  // Manual Profile State update helper
  const syncProfile = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API_URL}/profile/${user._id}`);
      const updatedUser = { 
        ...user, 
        ...res.data.user,
        stats: res.data.stats 
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Failed to sync profile:", error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        authError,
        notifications,
        unreadCount,
        theme,
        API_URL,
        login,
        register,
        logout,
        syncProfile,
        toggleTheme,
        markNotificationRead,
        markAllNotificationsRead,
        fetchNotifications
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
