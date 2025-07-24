// --- Imports: React, routing, Firebase, and styling ---
// Handles the signup form and registration logic
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import styled, { createGlobalStyle } from 'styled-components';
import { useTheme } from './App';

// Theme variables (copy from TodoPage)
const themeVars = {
  dark: {
    bg: '#23281d',
    card: '#262b21',
    cardShadow: '0 2px 8px 0 rgba(30,35,25,0.08)',
    cardBorder: '1px solid rgba(200,220,180,0.09)',
    accent: '#b7d89c',
    accent2: '#7b8c5c',
    text: '#e6f2d9',
    text2: '#b7d89c',
    text3: '#a3c47c',
    input: '#232a1e',
    filter: '#2d3327',
    filterActive: '#b7d89c',
    filterText: '#e6f2d9',
    error: '#e57373',
    fab: '#b7d89c',
    fabShadow: '0 4px 16px #b7d89c33',
  },
  light: {
    bg: '#f3f2ea',
    card: '#f7f6f0',
    cardShadow: '0 2px 8px 0 rgba(50,60,40,0.08)',
    cardBorder: '1px solid rgba(50,60,40,0.09)',
    accent: '#7b8c5c',
    accent2: '#a3c47c',
    text: '#232e1b',
    text2: '#7b8c5c',
    text3: '#a3c47c',
    input: '#ecebe3',
    filter: '#e0e0d2',
    filterActive: '#7b8c5c',
    filterText: '#232e1b',
    error: '#e57373',
    fab: '#b7d89c',
    fabShadow: '0 4px 16px #b7d89c33',
  }
};

const GlobalStyle = createGlobalStyle`
  body {
    background: ${({ theme }) => theme.bg};
    font-family: 'Inter', 'Fredoka', Arial, sans-serif;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
`;

const AuthContainer = styled.div`
  background: ${({ theme }) => theme.card};
  border-radius: clamp(20px, 5vw, 28px);
  box-shadow: 
    0 20px 64px rgba(0, 0, 0, 0.3),
    0 8px 32px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  max-width: min(420px, calc(100vw - 32px));
  width: 100%;
  margin: 0;
  padding: clamp(32px, 8vw, 48px) clamp(24px, 6vw, 40px) clamp(28px, 7vw, 40px);
  position: relative;
  font-family: 'Inter', 'Fredoka', Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  /* Glass morphism effect */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  /* Smooth entrance animation */
  animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(40px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @media (max-width: 480px) {
    max-width: calc(100vw - 16px);
    border-radius: 20px;
  }
`;
const Heading = styled.h2`
  margin: 0 0 clamp(16px, 4vw, 24px) 0;
  font-size: clamp(1.8em, 5vw, 2.4em);
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  letter-spacing: -0.02em;
  text-align: center;
`;

const DoodleIcon = styled.span`
  font-size: clamp(2em, 6vw, 2.6em);
  margin-bottom: clamp(8px, 2vw, 12px);
  user-select: none;
  animation: float 3s ease-in-out infinite;
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  }
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: clamp(16px, 4vw, 20px);
  width: 100%;
`;

const StyledInput = styled.input`
  padding: clamp(14px, 4vw, 18px) clamp(12px, 3vw, 16px);
  border: none;
  border-radius: clamp(10px, 3vw, 14px);
  font-size: clamp(1em, 3vw, 1.15em);
  font-family: 'Inter', inherit;
  font-weight: 400;
  background: ${({ theme }) => theme.input};
  color: ${({ theme }) => theme.text};
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:focus {
    outline: none;
    box-shadow: 
      0 4px 16px rgba(183, 216, 156, 0.3),
      0 2px 8px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.text3};
    opacity: 0.7;
  }
`;

const StyledButton = styled.button`
  background: ${({ theme }) => theme.accent};
  border: none;
  border-radius: clamp(10px, 3vw, 14px);
  padding: clamp(14px, 4vw, 18px) 0;
  font-size: clamp(1.05em, 3vw, 1.2em);
  font-family: 'Inter', inherit;
  font-weight: 600;
  color: #232e1b;
  box-shadow: 
    0 4px 16px rgba(183, 216, 156, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  margin-top: clamp(6px, 2vw, 12px);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: ${({ theme }) => theme.accent2};
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 
      0 8px 32px rgba(183, 216, 156, 0.5),
      0 4px 16px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    transition: transform 0.1s;
  }
  
  /* Ripple effect */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transition: width 0.3s, height 0.3s;
    transform: translate(-50%, -50%);
  }
  
  &:active::before {
    width: 120%;
    height: 120%;
  }
`;

const ErrorMsg = styled.p`
  color: #e57373;
  font-size: clamp(0.9em, 2.5vw, 1em);
  font-weight: 500;
  margin: 0;
  padding: 8px 12px;
  background: rgba(229, 115, 115, 0.1);
  border-radius: 8px;
  border-left: 3px solid #e57373;
  animation: shake 0.5s ease-in-out;
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }
`;

const SwitchText = styled.p`
  font-size: clamp(0.95em, 2.5vw, 1.05em);
  color: ${({ theme }) => theme.text2};
  margin-top: clamp(16px, 4vw, 24px);
  text-align: center;
  
  a {
    color: ${({ theme }) => theme.accent};
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s ease;
    
    &:hover {
      color: ${({ theme }) => theme.accent2};
      text-decoration: underline;
    }
  }
`;

// Enhanced wrapper with better mobile support
const CenteredWrapper = styled.div`
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport height for mobile */
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.bg};
  padding: 16px;
  box-sizing: border-box;
  
  /* Better scroll behavior on mobile */
  -webkit-overflow-scrolling: touch;
  
  @media (max-width: 480px) {
    padding: 8px;
    align-items: flex-start;
    padding-top: clamp(40px, 10vh, 80px);
  }
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
          <DoodleIcon role="img" aria-label="doodle">🌿</DoodleIcon>
          <Heading>Sign Up</Heading>
          <StyledForm onSubmit={handleSignup}>
            <StyledInput type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required theme={vars} />
            <StyledInput type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required theme={vars} />
            <StyledButton type="submit">Sign Up</StyledButton>
            {error && <ErrorMsg>{error}</ErrorMsg>}
          </StyledForm>
          <SwitchText>Already have an account? <Link to="/login">Login</Link></SwitchText>
        </AuthContainer>
      </CenteredWrapper>
    </>
  );
}
// --- Export signup page ---
export default Signup; 