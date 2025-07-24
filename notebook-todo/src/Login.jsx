// --- Imports: React, routing, Firebase, and styling ---
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
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
    font-family: 'Fredoka', Arial, sans-serif;
  }
`;
const AuthContainer = styled.div`
  background: ${({ theme }) => theme.card};
  border-radius: 24px;
  box-shadow: 0 4px 24px ${({ theme }) => theme.cardShadow}, 0 0 0 8px ${({ theme }) => theme.accent}22;
  max-width: 400px;
  margin: 80px auto;
  padding: 40px 32px 32px 32px;
  position: relative;
  font-family: 'Fredoka', Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;

  /* Better spacing on small screens */
  @media (max-width: 480px) {
    margin: 40px 16px;
    padding: 32px 20px 24px 20px;
  }
`;
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
`;
const StyledButton = styled.button`
  background: #a3c47c;
  border: none;
  border-radius: 12px;
  padding: 12px 0;
  font-size: 1.1em;
  font-family: inherit;
  font-weight: 600;
  color: #222;
  box-shadow: 1px 2px 0 #e6e8d3;
  margin-top: 8px;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  &:hover {
    background: #b7d89c;
    transform: translateY(-2px);
  }
  &:active {
    transform: scale(0.95);
  }
`;
const ErrorMsg = styled.p`
  color: #e57373;
  font-size: 1em;
  margin: 0;
`;
const SwitchText = styled.p`
  font-size: 1em;
  color: #7b8c5c;
  margin-top: 18px;
`;

// Add a wrapper to center the login form
const CenteredWrapper = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.bg};
`;

// --- Login component: handles user login and error display ---
function Login() {
  // State for form fields and error message
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { theme } = useTheme();
  const vars = themeVars[theme];

  // Handles login with Firebase Auth
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/todos');
    } catch (err) {
      setError(err.message);
    }
  };

  // Renders the login form and error messages
  return (
    <>
      <GlobalStyle theme={vars} />
      <CenteredWrapper theme={vars}>
        <AuthContainer theme={vars}>
          <DoodleIcon role="img" aria-label="doodle">🌱</DoodleIcon>
          <Heading>Login</Heading>
          <StyledForm onSubmit={handleLogin}>
            <StyledInput type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required theme={vars} />
            <StyledInput type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required theme={vars} />
            <StyledButton type="submit">Login</StyledButton>
            {error && <ErrorMsg>{error}</ErrorMsg>}
          </StyledForm>
          <SwitchText>Don't have an account? <Link to="/signup">Sign up</Link></SwitchText>
        </AuthContainer>
      </CenteredWrapper>
    </>
  );
}
// --- Export login page ---
export default Login; 