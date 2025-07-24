// =====================
// App.jsx
// Main app layout, routing, and context providers
// Modernized with lively, mobile-friendly, and well-documented UI
// =====================

import React, { useEffect, useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import TodoPage from './TodoPage';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import styled, { keyframes } from 'styled-components';

// --- Contexts for Auth and Theme ---
// Provides user authentication state and theme (dark/light) to the whole app
const AuthContext = createContext();
const ThemeContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}
export function useTheme() {
  return useContext(ThemeContext);
}

// --- AuthProvider: manages user login state and loading ---
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// --- ThemeProvider: manages dark/light mode and toggling ---
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// --- PrivateRoute: only lets logged-in users access certain pages ---
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

// --- Animations for profile area ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-12px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

// --- Styled components for profile and theme UI ---
const ProfileContainer = styled.div`
  position: absolute;
  top: 24px;
  right: 32px;
  z-index: 100;
  display: flex;
  gap: 12px;
  animation: ${fadeIn} 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  @media (max-width: 700px) {
    top: 12px;
    right: 12px;
  }
`;
const AvatarButton = styled.button`
  background: rgba(61, 77, 46, 0.95);
  color: #b7d89c;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  font-size: 1.5em;
  font-family: 'Fredoka', Arial, sans-serif;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px #1a1f1440;
  transition: background 0.2s, color 0.2s, transform 0.18s;
  will-change: background, color, transform;
  &:hover, &:focus {
    background: #b7d89c;
    color: #232e1b;
    transform: scale(1.08) rotate(-3deg);
  }
`;
const Dropdown = styled.div`
  position: absolute;
  top: 54px;
  right: 0;
  background: rgba(35, 46, 27, 0.98);
  color: #f6f7f2;
  border-radius: 16px;
  box-shadow: 0 4px 24px #1a1f14aa;
  min-width: 200px;
  padding: 16px 0 8px 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  z-index: 200;
  animation: ${fadeIn} 0.3s;
`;
const DropdownItem = styled.div`
  padding: 10px 24px;
  font-size: 1.05em;
  font-family: inherit;
  color: #f6f7f2;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  &:hover {
    background: #3d4d2e;
    color: #b7d89c;
  }
`;
const DropdownDivider = styled.div`
  height: 1px;
  background: #3d4d2e;
  margin: 4px 0;
`;
const ThemeToggleButton = styled.button`
  background: linear-gradient(135deg, #b7d89c 60%, #a3c47c 100%);
  color: #232e1b;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  font-size: 1.3em;
  font-family: 'Fredoka', Arial, sans-serif;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px #1a1f1440;
  transition: background 0.2s, color 0.2s, transform 0.18s;
  will-change: background, color, transform;
  &:hover, &:focus {
    background: linear-gradient(135deg, #a3c47c 60%, #b7d89c 100%);
    color: #fff;
    transform: scale(1.08) rotate(3deg);
  }
`;

// --- ProfileAvatar: shows user initial and dropdown for settings/logout ---
function ProfileAvatar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  if (!user) return null;
  const email = user.email || '';
  const initial = email.charAt(0).toUpperCase();
  return (
    <AvatarButton onClick={() => setOpen(v => !v)} title="Profile" aria-label="Profile menu">
      {initial}
      {open && (
        <Dropdown>
          <DropdownItem style={{ fontWeight: 700, color: '#b7d89c', cursor: 'default' }}>{email}</DropdownItem>
          <DropdownDivider />
          <DropdownItem>Settings (coming soon)</DropdownItem>
          <DropdownDivider />
          <DropdownItem onClick={logout} style={{ color: '#e57373', fontWeight: 600 }}>Logout</DropdownItem>
        </Dropdown>
      )}
    </AvatarButton>
  );
}

// --- ThemeToggle: button to switch between dark and light mode ---
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <ThemeToggleButton onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
      {theme === 'dark' ? '🌞' : '🌙'}
    </ThemeToggleButton>
  );
}

// --- App: main app layout and router ---
// Handles routing, theme, and profile controls
function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="notebook-app" style={{ position: 'relative', minHeight: '100vh' }}>
            {/* Profile and theme controls, always visible at top right */}
            <ProfileContainer>
              <ThemeToggle />
              <ProfileAvatar />
            </ProfileContainer>
            {/* Main app routes */}
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/todos" element={<PrivateRoute><TodoPage /></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

// --- Export main app ---
export default App; 