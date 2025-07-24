// --- Imports: React, routing, Firebase, and styling ---
// Handles the signup form and registration logic
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import styled, { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    background: #7b8c5c;
    font-family: 'Fredoka', Arial, sans-serif;
  }
`;
const AuthContainer = styled.div`
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 24px #b7bfa7aa, 0 0 0 8px #7b8c5c22;
  max-width: 400px;
  margin: 80px auto;
  padding: 40px 32px 32px 32px;
  position: relative;
  font-family: 'Fredoka', Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
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
  background: #f6f7f2;
  color: #222;
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
  transition: background 0.2s;
  &:hover { background: #b7d89c; }
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

// --- Signup component: handles user registration and error display ---
function Signup() {
  // State for form fields and error message
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      <GlobalStyle />
      <AuthContainer>
        <DoodleIcon role="img" aria-label="doodle">🌿</DoodleIcon>
        <Heading>Sign Up</Heading>
        <StyledForm onSubmit={handleSignup}>
          <StyledInput type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <StyledInput type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <StyledButton type="submit">Sign Up</StyledButton>
          {error && <ErrorMsg>{error}</ErrorMsg>}
        </StyledForm>
        <SwitchText>Already have an account? <Link to="/login">Login</Link></SwitchText>
      </AuthContainer>
    </>
  );
}
// --- Export signup page ---
export default Signup; 