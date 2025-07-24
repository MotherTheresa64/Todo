// --- Imports: React, routing, Firebase, and styling ---
// Handles app-wide context, routing, and layout
import React, { useEffect, useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import TodoPage from './TodoPage';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import styled from 'styled-components';

// --- Contexts for Auth and Theme ---
// These provide user authentication state and theme (dark/light) to the whole app
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

// --- Enhanced styled components for profile and theme UI ---
const ProfileContainer = styled.div`
  position: fixed;
  top: clamp(16px, 4vw, 24px);
  right: clamp(16px, 4vw, 32px);
  z-index: 100;
  display: flex;
  gap: clamp(8px, 2vw, 12px);
  
  /* Smooth fade-in animation */
  animation: fadeIn 0.5s ease-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 640px) {
    top: 12px;
    right: 12px;
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    top: 8px;
    right: 8px;
    gap: 6px;
  }
`;
const AvatarButton = styled.button`
  background: #3d4d2e;
  color: #b7d89c;
  border: none;
  border-radius: 50%;
  width: clamp(40px, 10vw, 48px);
  height: clamp(40px, 10vw, 48px);
  font-size: clamp(1.3em, 3vw, 1.6em);
  font-family: 'Inter', 'Fredoka', Arial, sans-serif;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 4px 16px rgba(26, 31, 20, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  /* Glass morphism effect */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  
  &:hover {
    background: #b7d89c;
    color: #232e1b;
    transform: translateY(-2px) scale(1.05);
    box-shadow: 
      0 8px 24px rgba(183, 216, 156, 0.4),
      0 4px 12px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  
  &:active {
    transform: translateY(0) scale(0.95);
    transition: transform 0.1s;
  }
  
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    font-size: 1.2em;
  }
`;
const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #232e1b;
  color: #f6f7f2;
  border-radius: clamp(12px, 3vw, 18px);
  box-shadow: 
    0 20px 64px rgba(26, 31, 20, 0.8),
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  min-width: clamp(180px, 45vw, 220px);
  padding: clamp(12px, 3vw, 16px) 0 clamp(6px, 2vw, 8px) 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  z-index: 200;
  
  /* Glass morphism effect */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  /* Smooth slide-in animation */
  animation: slideInFromTop 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @keyframes slideInFromTop {
    from {
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @media (max-width: 480px) {
    min-width: 160px;
    right: -8px;
  }
`;
const DropdownItem = styled.div`
  padding: clamp(8px, 2vw, 12px) clamp(20px, 5vw, 24px);
  font-size: clamp(0.95em, 2.5vw, 1.05em);
  font-family: 'Inter', inherit;
  font-weight: 500;
  color: #f6f7f2;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  margin: 0 8px;
  
  &:hover {
    background: rgba(61, 77, 46, 0.8);
    transform: translateX(4px);
    color: #b7d89c;
  }
  
  &:active {
    transform: translateX(2px);
    transition: transform 0.1s;
  }
`;
const DropdownDivider = styled.div`
  height: 1px;
  background: #3d4d2e;
  margin: 4px 0;
`;
const ThemeToggleButton = styled.button`
  background: #b7d89c;
  color: #232e1b;
  border: none;
  border-radius: 50%;
  width: clamp(40px, 10vw, 48px);
  height: clamp(40px, 10vw, 48px);
  font-size: clamp(1.2em, 3vw, 1.4em);
  font-family: 'Inter', 'Fredoka', Arial, sans-serif;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 4px 16px rgba(183, 216, 156, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  /* Glass morphism effect */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  
  /* Subtle rotation animation */
  &:hover {
    background: #3d4d2e;
    color: #b7d89c;
    transform: translateY(-2px) scale(1.05) rotate(15deg);
    box-shadow: 
      0 8px 24px rgba(61, 77, 46, 0.4),
      0 4px 12px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  
  &:active {
    transform: translateY(0) scale(0.95) rotate(0deg);
    transition: transform 0.1s;
  }
  
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    font-size: 1.1em;
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
    <AvatarButton onClick={() => setOpen(v => !v)} title="Profile">
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
function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="notebook-app" style={{ position: 'relative', minHeight: '100vh' }}>
            <ProfileContainer>
              <ThemeToggle />
              <ProfileAvatar />
            </ProfileContainer>
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