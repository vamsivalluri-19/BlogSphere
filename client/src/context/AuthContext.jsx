import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (error) {
        console.error('Invalid token or session expired');
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Login User
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data);
    return data;
  };

  // Register User
  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    setUser(data);
    return data;
  };

  // Logout User
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    const { data } = await api.put('/users/profile', profileData);
    // Merge updated fields into user state
    setUser((prev) => ({ ...prev, ...data }));
    return data;
  };

  // Toggle Bookmark in user state locally to update UI instantly
  const toggleBookmark = (postId) => {
    if (!user) return;
    setUser((prev) => {
      const bookmarks = [...prev.bookmarks];
      const index = bookmarks.indexOf(postId);
      if (index > -1) {
        bookmarks.splice(index, 1);
      } else {
        bookmarks.push(postId);
      }
      return { ...prev, bookmarks };
    });
  };

  // Toggle Following in user state locally to update UI instantly
  const toggleFollowing = (authorId) => {
    if (!user) return;
    setUser((prev) => {
      const following = [...prev.following];
      const index = following.indexOf(authorId);
      if (index > -1) {
        following.splice(index, 1);
      } else {
        following.push(authorId);
      }
      return { ...prev, following };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        toggleBookmark,
        toggleFollowing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
