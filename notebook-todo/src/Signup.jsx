// =====================
// Signup.jsx
// Signup form with modern glassy card, lively button, and subtle animation
// Well-commented and mobile-friendly
// =====================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useTheme } from './App';

// --- Theme variables for dark/light mode ---
const themeVars = {
  dark: {
    bg: '#23281d',
    card: 'rgba(38, 43, 33, 0.85)',
    cardShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
    cardBorder: '1.5px solid rgba(200,220,180,0.13)',
    accent: '#b7d89c',
    accent2: '#7b8c5c',
    text: '#e6f2d9',
    text2: '#b7d89c',
    text3: '#a3c47c',
    input: '#232a1e',
    error: '#e57373',
  },
  light: {
    bg: '#f3f2ea',
    card: 'rgba(255,255,255,0.85)',
    cardShadow: '0 8px 32px 0 rgba(120, 140, 90, 0.10)',
    cardBorder: '1.5px solid rgba(50,60,40,0.09)',
    accent: '#7b8c5c',
    accent2: '#a3c47c',
    text: '#232e1b',
    text2: '#7b8c5c',
    text3: '#a3c47c',
    input: '#ecebe3',
    error: '#e57373',
  }
};

// --- Global style for background and font ---
const GlobalStyle = createGlobalStyle`
  body {
    background: ${({ theme }) => theme.bg};
    font-family: 'Fredoka', Arial, sans-serif;
  }
`;

// --- Subtle card entrance animation ---
const cardIn = keyframes`
  from { opacity: 0; transform: translateY(32px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

// --- Glassy card container for the signup form ---
const AuthContainer = styled.div`
  background: ${({ theme }) => theme.card};
  border-radius: 24px;
  box-shadow: ${({ theme }) => theme.cardShadow};
  border: ${({ theme }) => theme.cardBorder};
  max-width: 400px;
  margin: 80px auto;
  padding: 40px 32px 32px 32px;
  position: relative;
  font-family: 'Fredoka', Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${cardIn} 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  @media (max-width: 700px) {
    margin: 32px 0;
    padding: 24px 8px 18px 8px;
    border-radius: 12px;
  }
`;

// --- Heading and icon ---
const Heading = styled.h2`
  margin: 0 0 18px 0;
  font-size: 2.2em;
  font-weight: 700;
  color: #3a3a2c;
  letter-spacing: 1px;
`;
const DoodleIcon = styled.span`
  font-size: 2.2em;
  margin-bottom: 10px;
  user-select: none;
`;

// --- Signup form and input styles ---
const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
`;
const StyledInput = styled.input`
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-size: 1.1em;
  font-family: inherit;
  background: ${({ theme }) => theme.input};
  color: ${({ theme }) => theme.text};
  box-shadow: 0 1px 2px #b7bfa733;
  transition: box-shadow 0.18s;
  &:focus {
    outline: 2px solid ${({ theme }) => theme.accent2};
    box-shadow: 0 2px 8px #b7d89c55;
  }
`;

// --- Lively, modern button ---
const StyledButton = styled.button`
  background: linear-gradient(90deg, #b7d89c 60%, #a3c47c 100%);
  border: none;
  border-radius: 12px;
  padding: 12px 0;
  font-size: 1.1em;
  font-family: inherit;
  font-weight: 600;
  color: #232e1b;
  box-shadow: 0 2px 8px #b7d89c33;
  margin-top: 8px;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, transform 0.13s;
  &:hover, &:focus {
    background: linear-gradient(90deg, #a3c47c 60%, #b7d89c 100%);
    color: #fff;
    box-shadow: 0 4px 16px #b7d89c55;
    transform: translateY(-2px) scale(1.04);
  }
  &:active {
    transform: scale(0.97);
  }
`;

// --- Error message and switch text ---
const ErrorMsg = styled.p`
  color: ${({ theme }) => theme.error};
  font-size: 1em;
  margin: 0;
`;
const SwitchText = styled.p`
  font-size: 1em;
  color: ${({ theme }) => theme.text2};
  margin-top: 18px;
`;

// --- Wrapper to center the signup form ---
const CenteredWrapper = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.bg};
`;

// --- Signup component: handles user registration and error display ---
function Signup() {
  // State for form fields and error message
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { theme } = useTheme();
  const vars = themeVars[theme];

  // Handles signup with Firebase Auth
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/todos');
    } catch (err) {
      setError(err.message);
    }
  };

  // Renders the signup form and error messages
  return (
    <>
      <GlobalStyle theme={vars} />
      <CenteredWrapper theme={vars}>
        <AuthContainer theme={vars}>
          {/* Fun icon and heading for a friendly vibe */}
          <DoodleIcon role="img" aria-label="doodle">🌿</DoodleIcon>
          <Heading>Sign Up</Heading>
          <StyledForm onSubmit={handleSignup}>
            <StyledInput type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required theme={vars} />
            <StyledInput type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required theme={vars} />
            <StyledButton type="submit">Sign Up</StyledButton>
            {error && <ErrorMsg theme={vars}>{error}</ErrorMsg>}
          </StyledForm>
          <SwitchText theme={vars}>Already have an account? <Link to="/login">Login</Link></SwitchText>
        </AuthContainer>
      </CenteredWrapper>
    </>
  );
}

// --- Export signup page ---
export default Signup; 