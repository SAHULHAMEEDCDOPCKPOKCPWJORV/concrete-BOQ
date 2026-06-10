import React, { useState, createContext, useContext, useEffect } from 'react';

// ─── Auth ─────────────────────────────────────────────────────────────────────
const VALID_EMAIL    = 'sahulhameed03111@gmail.com';
const VALID_PASSWORD = 'sahul26';

interface AuthCtx {
  isAuthenticated: boolean;
  userEmail: string;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}
const AuthContext = createContext<AuthCtx>({
  isAuthenticated: false,
  userEmail: '',
  login: () => false,
  logout: () => {},
});
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    localStorage.getItem('ceb_auth') === 'true'
  );
  const [userEmail, setUserEmail] = useState(() =>
    localStorage.getItem('ceb_user') || ''
  );

  const login = (email: string, password: string): boolean => {
    if (email.trim() === VALID_EMAIL && password.trim() === VALID_PASSWORD) {
      setIsAuthenticated(true);
      setUserEmail(email.trim());
      localStorage.setItem('ceb_auth', 'true');
      localStorage.setItem('ceb_user', email.trim());
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserEmail('');
    localStorage.removeItem('ceb_auth');
    localStorage.removeItem('ceb_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Theme ────────────────────────────────────────────────────────────────────
interface ThemeCtx { darkMode: boolean; toggleDark: () => void; }
const ThemeContext = createContext<ThemeCtx>({ darkMode: true, toggleDark: () => {} });
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => {
    const s = localStorage.getItem('ceb_dark');
    return s !== null ? s === 'true' : true;
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
    localStorage.setItem('ceb_dark', String(darkMode));
  }, [darkMode]);

  const toggleDark = () => setDarkMode(p => !p);
  return (
    <ThemeContext.Provider value={{ darkMode, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}
