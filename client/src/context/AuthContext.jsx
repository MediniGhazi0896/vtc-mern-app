// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// helper: make sure profileImage is absolute
const resolveImageUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;   // already absolute
  if (url.startsWith('/')) return `${API_BASE}${url}`;
  return `${API_BASE}/${url}`;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load from localStorage on app start
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('user') || 'null');
      if (stored) {
        stored.profileImage = resolveImageUrl(stored.profileImage);
        setUser(stored);
      }
    } catch (err) {
      console.error('❌ Failed to parse stored user', err);
    }
  }, []);

  // login: save both user + token
  const login = (userData, token) => {
    const normalized = {
      ...userData,
      profileImage: resolveImageUrl(userData?.profileImage),
      isAvailable: userData?.isAvailable ?? false,
    };
    setUser(normalized);
    localStorage.setItem('user', JSON.stringify(normalized));
    if (token) localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
