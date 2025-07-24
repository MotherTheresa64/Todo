// --- Imports: React, Firebase, and styling tools ---
// React for UI, hooks for state/effects, styled-components for CSS-in-JS, Firebase for backend
import React, { useEffect, useState, useRef } from 'react';
import styled, { createGlobalStyle, keyframes, css } from 'styled-components';
import { db } from './firebase';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useAuth, useTheme } from './App';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

// --- THEME AND ANIMATION SETUP ---
// Color palettes for light and dark mode, used throughout the app for a consistent look
const themeVars = {
  dark: {
    bg: '#23281d', // main background
    card: '#262b21', // card background, just a bit lighter than bg
    cardShadow: '0 2px 8px 0 rgba(30,35,25,0.08)', // subtle shadow
    cardBorder: '1px solid rgba(200,220,180,0.09)', // soft border
    accent: '#b7d89c', // main accent (used for buttons, progress, etc)
    accent2: '#7b8c5c', // secondary accent
    text: '#e6f2d9', // main text color
    text2: '#b7d89c', // secondary text
    text3: '#a3c47c', // tertiary text
    input: '#232a1e', // input background
    filter: '#2d3327', // filter button background
    filterActive: '#b7d89c', // active filter button
    filterText: '#e6f2d9', // filter button text
    error: '#e57373', // error color
    fab: '#b7d89c', // floating action button
    fabShadow: '0 4px 16px #b7d89c33', // fab shadow
  },
  light: {
    bg: '#f3f2ea', // main background
    card: '#f7f6f0', // card background
    cardShadow: '0 2px 8px 0 rgba(50,60,40,0.08)', // subtle shadow
    cardBorder: '1px solid rgba(50,60,40,0.09)', // soft border
    accent: '#7b8c5c', // main accent
    accent2: '#a3c47c', // secondary accent
    text: '#232e1b', // main text color
    text2: '#7b8c5c', // secondary text
    text3: '#a3c47c', // tertiary text
    input: '#ecebe3', // input background
    filter: '#e0e0d2', // filter button background
    filterActive: '#7b8c5c', // active filter button
    filterText: '#232e1b', // filter button text
    error: '#e57373', // error color
    fab: '#b7d89c', // floating action button
    fabShadow: '0 4px 16px #b7d89c33', // fab shadow
  }
};

// --- GLOBAL STYLES ---
// Sets up the base font, background, and text color for the whole app
const GlobalStyle = createGlobalStyle`
  body {
    background: ${({ theme }) => theme.bg};
    font-family: 'Fredoka', Arial, sans-serif;
    margin: 0;
    padding: 0;
    color: ${({ theme }) => theme.text};
  }
`;

// --- ANIMATION KEYFRAMES ---
// Enhanced keyframes for modern, smooth animations
const cardEntrance = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(24px) scale(0.96); 
    filter: blur(4px);
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
    filter: blur(0px);
  }
`;

const slideInFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideOutToRight = keyframes`
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
`;

const buttonPop = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const fabPulse = keyframes`
  0%, 100% { 
    box-shadow: 0 8px 32px rgba(183, 216, 156, 0.4);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 12px 48px rgba(183, 216, 156, 0.6);
    transform: scale(1.02);
  }
`;

const confettiBurst = keyframes`
  0% { 
    opacity: 1; 
    transform: scale(0.5) translateY(0) rotate(0deg); 
  }
  50% {
    opacity: 1;
    transform: scale(1.2) translateY(-30px) rotate(180deg);
  }
  100% { 
    opacity: 0; 
    transform: scale(1.4) translateY(-60px) rotate(360deg); 
  }
`;

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(183, 216, 156, 0.3); }
  50% { box-shadow: 0 0 20px rgba(183, 216, 156, 0.6), 0 0 30px rgba(183, 216, 156, 0.4); }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// --- STYLED COMPONENTS ---
// Modern layout containers with enhanced mobile support
const PageContainer = styled.div`
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport height for mobile */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: clamp(16px, 4vw, 32px) clamp(12px, 3vw, 24px) clamp(80px, 20vw, 120px);
  box-sizing: border-box;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  position: relative;
  
  /* Smooth scroll behavior */
  scroll-behavior: smooth;
  
  /* Better touch scrolling on iOS */
  -webkit-overflow-scrolling: touch;
  
  @media (max-width: 768px) {
    padding: 16px 12px 100px;
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px 8px 100px;
    gap: 12px;
  }
`;
// Enhanced card row with modern responsive design
const CardRow = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: clamp(16px, 4vw, 24px);
  margin-bottom: clamp(20px, 5vw, 32px);
  width: 100%;
  max-width: min(600px, calc(100vw - 24px));
  box-sizing: border-box;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 16px;
    max-width: calc(100vw - 16px);
  }
  
  @media (max-width: 480px) {
    gap: 12px;
    max-width: calc(100vw - 12px);
  }
`;
// Enhanced card container with modern glass-morphism effect
const TodoCard = styled.div`
  width: 100%;
  max-width: min(600px, calc(100vw - 24px));
  min-width: 0;
  margin-bottom: clamp(24px, 6vw, 40px);
  box-sizing: border-box;
  overflow: hidden;
  padding: clamp(24px, 6vw, 36px) clamp(16px, 4vw, 24px) clamp(32px, 8vw, 44px);
  border-radius: clamp(16px, 4vw, 20px);
  box-shadow: ${({ theme }) => theme.cardShadow};
  background: ${({ theme }) => theme.card};
  border: ${({ theme }) => theme.cardBorder};
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Subtle glass effect */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  
  /* Hover effects for desktop */
  @media (hover: hover) {
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 
                  0 4px 16px rgba(183, 216, 156, 0.1);
    }
  }
  
  /* Enhanced mobile styles */
  @media (max-width: 640px) {
    max-width: calc(100vw - 16px);
    padding: 20px 16px 28px;
    border-radius: 16px;
  }
  
  @media (max-width: 480px) {
    max-width: calc(100vw - 12px);
    padding: 16px 12px 24px;
    border-radius: 14px;
  }
`;
const DateCircle = styled.div`
  background: #3d4d2e;
  color: #f6f7f2;
  border-radius: 50%;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.7em;
  font-weight: 700;
  margin-bottom: 6px;
`;
const DateText = styled.div`
  color: #b7d89c;
  font-size: 1em;
  font-weight: 600;
  margin-bottom: 2px;
`;
const MonthText = styled.div`
  color: #a3c47c;
  font-size: 0.95em;
  font-weight: 400;
`;
const ProgressCard = styled(TodoCard)`
  flex: 2;
  min-width: 140px;
`;
const ProgressLabel = styled.div`
  font-size: 1em;
  font-weight: 600;
  color: #b7d89c;
  margin-bottom: 8px;
`;
const ProgressBarContainer = styled.div`
  background: #3d4d2e;
  border-radius: 12px;
  height: 16px;
  width: 100%;
  margin-bottom: 6px;
`;
const ProgressBar = styled.div`
  background: #b7d89c;
  height: 100%;
  border-radius: 12px;
  width: ${props => props.$percent}%;
  transition: width 0.3s;
`;
const ProgressText = styled.div`
  font-size: 0.95em;
  color: #a3c47c;
  margin-top: 2px;
`;
const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: rgba(180,200,150,0.10);
  margin: 12px 0 16px 0;
`;
const TodoInputRow = styled.form`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  align-items: center;
  @media (max-width: 700px) {
    flex-direction: column;
    gap: 10px;
    width: 100%;
    margin-bottom: 16px;
  }
`;
const TodoInput = styled.input`
  flex: 2 1 120px;
  padding: clamp(14px, 4vw, 18px) clamp(12px, 3vw, 16px);
  border: none;
  border-radius: clamp(10px, 3vw, 14px);
  font-size: clamp(1.05em, 3vw, 1.2em);
  font-family: 'Inter', inherit;
  font-weight: 400;
  background: ${({ theme }) => theme.input};
  color: ${({ theme }) => theme.text};
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Enhanced focus state */
  &:focus {
    outline: none;
    box-shadow: 
      0 4px 16px rgba(183, 216, 156, 0.3),
      0 2px 8px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }
  
  /* Placeholder styling */
  &::placeholder {
    color: ${({ theme }) => theme.text3};
    opacity: 0.7;
  }
  
  @media (max-width: 640px) {
    width: 100%;
    font-size: 1.1em;
    padding: 16px 14px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.05em;
    padding: 14px 12px;
  }
`;
const DateInput = styled.input`
  flex: 1 1 80px;
  padding: clamp(14px, 4vw, 18px) clamp(12px, 3vw, 16px);
  border: none;
  border-radius: clamp(10px, 3vw, 14px);
  font-size: clamp(0.95em, 2.5vw, 1.1em);
  font-family: 'Inter', inherit;
  font-weight: 400;
  background: ${({ theme }) => theme.input};
  color: ${({ theme }) => theme.text};
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:focus {
    outline: none;
    box-shadow: 
      0 4px 16px rgba(183, 216, 156, 0.3),
      0 2px 8px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }
  
  @media (max-width: 640px) {
    width: 100%;
    font-size: 1.05em;
    padding: 16px 14px;
  }
  
  @media (max-width: 480px) {
    font-size: 1em;
    padding: 14px 12px;
  }
`;

const PrioritySelect = styled.select`
  flex: 1 1 80px;
  padding: clamp(14px, 4vw, 18px) clamp(12px, 3vw, 16px);
  border: none;
  border-radius: clamp(10px, 3vw, 14px);
  font-size: clamp(0.95em, 2.5vw, 1.1em);
  font-family: 'Inter', inherit;
  font-weight: 400;
  background: ${({ theme }) => theme.input};
  color: ${({ theme }) => theme.text};
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  
  &:focus {
    outline: none;
    box-shadow: 
      0 4px 16px rgba(183, 216, 156, 0.3),
      0 2px 8px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }
  
  @media (max-width: 640px) {
    width: 100%;
    font-size: 1.05em;
    padding: 16px 14px;
  }
  
  @media (max-width: 480px) {
    font-size: 1em;
    padding: 14px 12px;
  }
`;
const AddButton = styled.button`
  background: ${({ theme }) => theme.accent};
  border: none;
  border-radius: clamp(12px, 3vw, 16px);
  padding: 0 clamp(18px, 5vw, 24px);
  font-size: clamp(1.4em, 4vw, 1.8em);
  font-family: 'Inter', inherit;
  font-weight: 700;
  color: #232e1b;
  box-shadow: 
    0 4px 16px rgba(183, 216, 156, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: clamp(48px, 12vw, 56px);
  min-height: clamp(48px, 12vw, 56px);
  height: clamp(48px, 12vw, 56px);
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  
  /* Hover and active states */
  &:hover {
    background: ${({ theme }) => theme.accent2};
    color: #fff;
    transform: translateY(-2px) scale(1.02);
    box-shadow: 
      0 8px 32px rgba(183, 216, 156, 0.5),
      0 4px 16px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    transform: translateY(0) scale(0.98);
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
  
  @media (max-width: 640px) {
    min-width: 100%;
    min-height: 48px;
    height: 48px;
    font-size: 1.3em;
    border-radius: 14px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2em;
    min-height: 44px;
    height: 44px;
    border-radius: 12px;
  }
`;
// Redesigned FilterBar for dropdown filters
const FilterBar = styled.div`
  margin: 0 0 22px 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  background: ${({ theme }) => theme.filter};
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.cardBorder};
  padding: 18px 16px 18px 16px;
`;
const FilterDropdownLabel = styled.label`
  font-size: 1.08em;
  color: ${({ theme }) => theme.text2};
  font-weight: 700;
  margin-bottom: 6px;
  display: block;
`;
const FilterDropdown = styled.select`
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.cardBorder};
  background: ${({ theme }) => theme.input};
  color: ${({ theme }) => theme.text};
  font-size: 1.08em;
  font-family: inherit;
  margin-bottom: 0;
  margin-top: 2px;
  outline: none;
  transition: border 0.2s;
  &:focus {
    border: 1.5px solid ${({ theme }) => theme.accent};
  }
`;
// Label for filter groups
const SearchInput = styled.input`
  width: 100%;
  padding: 16px 12px;
  margin: 0 0 28px 0;
  border: none;
  border-radius: 8px;
  font-size: 1.13em;
  font-family: inherit;
  background: ${({ theme }) => theme.input};
  color: ${({ theme }) => theme.text};
  box-shadow: 0 1px 2px #1a1f1433;
  box-sizing: border-box;
  @media (max-width: 700px) {
    font-size: 1.18em;
    width: 100%;
    padding: 18px 12px;
    margin-bottom: 24px;
  }
`;
const TodoList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 8px;
  max-height: 44vh;
  overflow-y: auto;
  @media (max-width: 700px) {
    max-height: 36vh;
  }
`;
const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;
const fadeSlideOut = keyframes`
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-16px); }
`;
const AnimatedTodoItem = styled.li`
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #3d4d2e;
  font-size: 1.15em;
  background: transparent;
  color: #f6f7f2;
  font-family: inherit;
  position: relative;
  animation: ${fadeSlideIn} 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  &.todo-exit {
    animation: ${fadeSlideOut} 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  @media (max-width: 700px) {
    font-size: 1.18em;
    padding: 16px 0;
  }
`;
const DoodleIcon = styled.span`
  font-size: 1.3em;
  margin-right: 10px;
  user-select: none;
`;
const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #e57373;
  font-size: 1.2em;
  margin-left: auto;
  cursor: pointer;
  font-family: inherit;
  &:hover { color: #b71c1c; }
`;
const FinishDayButton = styled.button`
  background: #b7d89c;
  border: none;
  border-radius: 12px;
  padding: 16px 48px;
  font-size: 1.3em;
  font-family: inherit;
  font-weight: 700;
  color: #232e1b;
  box-shadow: 1px 2px 0 #3d4d2e;
  margin: 36px auto 0 auto;
  display: block;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #a3c47c; color: #fff; }
`;
const ClearCompletedButton = styled.button`
  background: ${({ accent }) => accent || '#b7d89c'};
  color: ${({ bg }) => bg || '#232e1b'};
  border: none;
  border-radius: 10px;
  padding: 10px 24px;
  font-size: 1em;
  font-family: inherit;
  font-weight: 600;
  margin: 18px auto 0 auto;
  display: block;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 2px 8px #1a1f1440;
  &:hover { background: #a3c47c; color: #fff; }
`;
const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Due Today', value: 'today' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Overdue', value: 'overdue' },
];
const PRIORITY_FILTERS = [
  { label: 'All Priorities', value: 'all' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];
const PRIORITY_COLORS = {
  high: '#e57373',
  medium: '#b7d89c',
  low: '#a3c47c',
};
function isToday(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  const d = new Date(dateStr);
  return d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
}
function isUpcoming(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  const d = new Date(dateStr);
  return d > today;
}
function isOverdue(dateStr, completed) {
  if (!dateStr || completed) return false;
  const today = new Date();
  const d = new Date(dateStr);
  return d < today && !isToday(dateStr);
}
function getDayMonthYear() {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return {
    day: days[now.getDay()],
    date: now.getDate(),
    month: months[now.getMonth()],
  };
}
const FabButton = styled.button`
  position: fixed;
  bottom: clamp(20px, 5vw, 32px);
  right: clamp(16px, 4vw, 24px);
  z-index: 300;
  background: ${({ theme }) => theme.fab};
  color: #232e1b;
  border: none;
  border-radius: 50%;
  width: clamp(56px, 15vw, 64px);
  height: clamp(56px, 15vw, 64px);
  font-size: clamp(1.8em, 5vw, 2.4em);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Enhanced shadow and glow effect */
  box-shadow: 
    0 8px 32px rgba(183, 216, 156, 0.4),
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  
  /* Backdrop blur for glass effect */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  
  /* Floating animation */
  animation: ${floatAnimation} 3s ease-in-out infinite;
  
  /* Active and hover states */
  &:hover {
    background: ${({ theme }) => theme.accent2};
    color: #fff;
    transform: scale(1.1);
    box-shadow: 
      0 12px 48px rgba(183, 216, 156, 0.6),
      0 6px 24px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  
  &:active {
    transform: scale(0.95);
    transition: transform 0.1s;
  }
  
  /* Focus state for accessibility */
  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.accent};
    outline-offset: 3px;
  }
  
  /* Pulse animation for attention */
  &::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(183, 216, 156, 0.3) 0%, transparent 70%);
    animation: ${glowPulse} 2s ease-in-out infinite;
    pointer-events: none;
  }
  
  /* Hide on very small screens to prevent interference */
  @media (max-width: 320px) {
    width: 48px;
    height: 48px;
    font-size: 1.6em;
    bottom: 16px;
    right: 12px;
  }
`;
const ModalOverlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(35, 46, 27, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 400;
  padding: 16px;
  box-sizing: border-box;
  
  /* Smooth fade-in animation */
  animation: ${fadeInUp} 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 480px) {
    padding: 8px;
    align-items: flex-end;
  }
`;

const ModalCard = styled.div`
  background: ${({ theme }) => theme.card || '#2e3b25'};
  border-radius: clamp(16px, 4vw, 24px);
  box-shadow: 
    0 20px 64px rgba(0, 0, 0, 0.3),
    0 8px 32px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  padding: clamp(24px, 6vw, 32px) clamp(16px, 4vw, 24px);
  width: 100%;
  max-width: min(420px, calc(100vw - 32px));
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;
  
  /* Glass morphism effect */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  /* Scale-in animation */
  animation: ${scaleIn} 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 480px) {
    max-width: calc(100vw - 16px);
    border-radius: 16px 16px 0 0;
    margin-top: auto;
  }
`;
const ModalClose = styled.button`
  background: none;
  border: none;
  color: #e57373;
  font-size: 2em;
  position: absolute;
  top: 18px;
  right: 24px;
  cursor: pointer;
`;
const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 0 24px 0;
  color: #b7d89c;
  font-size: 1.2em;
  opacity: 0.85;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  text-align: center;
  overflow-x: hidden;
`;
const EmptyEmoji = styled.div`
  font-size: 3em;
  margin-bottom: 10px;
  max-width: 100%;
  text-align: center;
`;
const AnimatedProgressBar = styled.div`
  background: #b7d89c;
  height: 100%;
  border-radius: 12px;
  width: ${props => props.$percent}%;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
`;
const DetailsModalOverlay = styled(ModalOverlay)`
  z-index: 500;
`;
const DetailsModalCard = styled(ModalCard)`
  max-width: 420px;
  position: relative;
`;
const DetailsField = styled.div`
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;
const DetailsLabel = styled.label`
  font-size: 1em;
  color: ${({ color }) => color || '#b7d89c'};
  margin-bottom: 6px;
`;
const DetailsInput = styled.input`
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-family: inherit;
  background: ${({ bg }) => bg || '#232e1b'};
  color: ${({ color }) => color || '#f6f7f2'};
  margin-bottom: 2px;
`;
const DetailsTextarea = styled.textarea`
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-family: inherit;
  background: ${({ bg }) => bg || '#232e1b'};
  color: ${({ color }) => color || '#f6f7f2'};
  min-height: 60px;
  resize: vertical;
`;
const DetailsSelect = styled.select`
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-family: inherit;
  background: ${({ bg }) => bg || '#232e1b'};
  color: ${({ color }) => color || '#f6f7f2'};
`;
const DetailsActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 18px;
  justify-content: flex-end;
`;
const DetailsButton = styled.button`
  background: ${({ accent }) => accent || '#b7d89c'};
  color: ${({ bg }) => bg || '#232e1b'};
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 1em;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #a3c47c; color: #fff; }
`;
const DetailsDelete = styled(DetailsButton)`
  background: #e57373;
  color: #fff;
  &:hover { background: #b71c1c; }
`;
const ShimmerProgressBar = styled.div`
  background: linear-gradient(90deg, #b7d89c 25%, #a3c47c 50%, #b7d89c 75%);
  background-size: 200% 100%;
  height: 100%;
  border-radius: 12px;
  width: ${props => props.$percent}%;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${shimmer} 2.5s linear infinite;
`;
const AnimatedFabButton = styled(FabButton)`
  /* Additional pulse animation for extra attention */
  &::after {
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(183, 216, 156, 0.2) 0%, transparent 60%);
    animation: ${fabPulse} 3s ease-in-out infinite;
    pointer-events: none;
    z-index: -1;
  }
  
  span {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    line-height: 1;
    font-weight: 700;
    font-size: 1em;
  }
`;
const Confetti = styled.div`
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  font-size: 2.2em;
  pointer-events: none;
  animation: ${confettiBurst} 1s ease-out;
`;
const DaySummaryModalOverlay = styled(ModalOverlay)`
  z-index: 600;
`;
const DaySummaryModalCard = styled(ModalCard)`
  max-width: 420px;
  position: relative;
  text-align: center;
  padding-top: 48px;
`;
const DaySummaryTitle = styled.h2`
  font-size: 2em;
  color: #b7d89c;
  margin-bottom: 12px;
`;
const DaySummaryStats = styled.div`
  font-size: 1.2em;
  color: #a3c47c;
  margin-bottom: 18px;
`;
const DaySummaryMessage = styled.div`
  font-size: 1.1em;
  color: #7b8c5c;
  margin-bottom: 24px;
`;
const DaySummaryConfetti = styled(Confetti)`
  left: 50%;
  top: 10px;
  font-size: 3em;
  animation: ${confettiBurst} 1.5s ease-out;
`;

// Simple Card styled component for use with AnimatedCard
const Card = styled.div`
  width: 100%;
  max-width: 280px;
  min-width: 120px;
  align-items: center;
  margin-bottom: 0;
  box-sizing: border-box;
  overflow-x: hidden;
  padding: 28px 18px 28px 18px;
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.cardShadow};
  background: ${({ theme }) => theme.card};
  border: ${({ theme }) => theme.cardBorder};
  display: flex;
  flex-direction: column;
  justify-content: center;
  @media (max-width: 700px) {
    max-width: 98vw;
    padding: 18px 8px 18px 8px;
  }
`;

// Animated card component with staggered entrance
const AnimatedCard = styled.div`
  animation: ${cardEntrance} 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
  animation-delay: ${props => props.delay || '0ms'};
  will-change: transform, opacity;
  
  &:nth-child(1) { animation-delay: 0ms; }
  &:nth-child(2) { animation-delay: 100ms; }
  &:nth-child(3) { animation-delay: 200ms; }
  
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// --- MAIN TODO PAGE COMPONENT ---
// This is the main component for the todo list page. Handles all the logic and UI for tasks.
function TodoPage() {
  // Get user and theme context (for authentication and theming)
  const { user } = useAuth();
  const { theme } = useTheme();
  const vars = themeVars[theme];

  // State for todos, input fields, modals, and animations
  const [todos, setTodos] = useState([]); // All todos for the user
  const [input, setInput] = useState(''); // New todo text
  const [dueDate, setDueDate] = useState(''); // New todo due date
  const [priority, setPriority] = useState('medium'); // New todo priority
  const [filter, setFilter] = useState('all'); // Task status filter
  const [priorityFilter, setPriorityFilter] = useState('all'); // Priority filter
  const [search, setSearch] = useState(''); // Search text
  const [showFabModal, setShowFabModal] = useState(false); // FAB modal for mobile
  const [detailsTodo, setDetailsTodo] = useState(null); // Task being edited in modal
  const [detailsFields, setDetailsFields] = useState({ text: '', dueDate: '', priority: 'medium', notes: '' });
  const [confettiTask, setConfettiTask] = useState(null); // Confetti for completed task
  const [showDaySummary, setShowDaySummary] = useState(false); // Show daily summary modal
  const [dayConfetti, setDayConfetti] = useState(false); // Confetti for finish day

  // Fetch todos for the current user from Firestore (real-time updates)
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'todos'), where('uid', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setTodos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [user]);

  // Add a new todo to Firestore (handles both desktop and mobile add)
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    await addDoc(collection(db, 'todos'), {
      text: input,
      completed: false,
      uid: user.uid,
      created: Date.now(),
      dueDate: dueDate || null,
      priority,
    });
    setInput('');
    setDueDate('');
    setPriority('medium');
  };

  // Toggle completion for a todo, and show confetti if marking as complete
  const handleToggle = async (id, completed) => {
    await updateDoc(doc(db, 'todos', id), { completed: !completed });
    if (!completed) {
      setConfettiTask(id);
      setTimeout(() => setConfettiTask(null), 1000);
    }
  };

  // Delete a todo from Firestore
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'todos', id));
  };

  // Clear all completed todos
  const handleClearCompleted = async () => {
    const completed = todos.filter(t => t.completed);
    for (const todo of completed) {
      await deleteDoc(doc(db, 'todos', todo.id));
    }
  };

  // --- SWIPE HANDLERS FOR MOBILE ---
  // Allow swipe left/right to delete/complete a task (for mobile UX)
  const touchStartX = useRef(null);
  const handleTouchStart = (e, id) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e, id, completed) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX < -60) {
      handleDelete(id);
    } else if (deltaX > 60) {
      handleToggle(id, completed);
    }
    touchStartX.current = null;
  };

  // --- TASK DETAILS MODAL ---
  // Open and close modal for editing a task, and handle save/delete
  const openDetails = (todo) => {
    setDetailsTodo(todo);
    setDetailsFields({
      text: todo.text,
      dueDate: todo.dueDate || '',
      priority: todo.priority || 'medium',
      notes: todo.notes || '',
    });
  };
  const closeDetails = () => setDetailsTodo(null);
  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setDetailsFields(f => ({ ...f, [name]: value }));
  };
  const handleDetailsSave = async () => {
    if (!detailsTodo) return;
    await updateDoc(doc(db, 'todos', detailsTodo.id), {
      text: detailsFields.text,
      dueDate: detailsFields.dueDate,
      priority: detailsFields.priority,
      notes: detailsFields.notes,
    });
    closeDetails();
  };
  const handleDetailsDelete = async () => {
    if (!detailsTodo) return;
    await deleteDoc(doc(db, 'todos', detailsTodo.id));
    closeDetails();
  };

  // --- FINISH DAY LOGIC ---
  // Mark all tasks as done, show summary modal, and confetti
  const handleFinishDay = async () => {
    for (const todo of todos) {
      if (!todo.completed) {
        await updateDoc(doc(db, 'todos', todo.id), { completed: true });
      }
    }
    setShowDaySummary(true);
    setDayConfetti(true);
    setTimeout(() => setDayConfetti(false), 1500);
  };
  const closeDaySummary = () => setShowDaySummary(false);

  // --- ACCESSIBILITY: CLOSE MODALS ON ESCAPE ---
  // Allow closing modals with the Escape key for better accessibility
  useEffect(() => {
    if (!detailsTodo) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeDetails();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [detailsTodo]);

  // --- FILTER, SEARCH, AND PROGRESS LOGIC ---
  // Filter todos by status, priority, and search text; calculate progress
  const filteredTodos = todos.filter(todo => {
    if (search && !todo.text.toLowerCase().includes(search.toLowerCase())) return false;
    if (priorityFilter !== 'all' && todo.priority !== priorityFilter) return false;
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    if (filter === 'today') return isToday(todo.dueDate);
    if (filter === 'upcoming') return isUpcoming(todo.dueDate);
    if (filter === 'overdue') return isOverdue(todo.dueDate, todo.completed);
    return true;
  });
  const completedCount = todos.filter(t => t.completed).length;
  const percent = todos.length ? Math.round((completedCount / todos.length) * 100) : 0;
  const { day, date, month } = getDayMonthYear();

  // --- RENDER ---
  // Main UI layout: date/progress cards, todo list, modals, etc.
  return (
    <>
      {/* Global styles for theme */}
      <GlobalStyle theme={vars} />
      <PageContainer style={{ background: vars.bg }}>
        <CardRow>
          {/* Date and progress cards */}
          <AnimatedCard as={Card} style={{ background: vars.card, boxShadow: vars.cardShadow, border: vars.cardBorder }} theme={vars} delay="0ms">
            <DateText style={{ color: vars.text2 }}>{day}</DateText>
            <DateCircle style={{ background: vars.accent2, color: vars.text }}>{date}</DateCircle>
            <MonthText style={{ color: vars.text3 }}>{month}</MonthText>
          </AnimatedCard>
          <AnimatedCard as={ProgressCard} style={{ background: vars.card, boxShadow: vars.cardShadow, border: vars.cardBorder }} theme={vars} delay="100ms">
            <ProgressLabel style={{ color: vars.text2 }}>Progression</ProgressLabel>
            <ProgressBarContainer style={{ background: vars.filter }}>
              <ShimmerProgressBar $percent={percent} />
            </ProgressBarContainer>
            <ProgressText style={{ color: vars.text3 }}>{completedCount} of {todos.length} tasks completed</ProgressText>
          </AnimatedCard>
        </CardRow>
        <AnimatedFabButton
          onClick={() => setShowFabModal(true)}
          aria-label="Add Task"
          title="Add Task"
          tabIndex={0}
          theme={vars}
        >
          <span>+</span>
        </AnimatedFabButton>
        {showFabModal && (
          <ModalOverlay onClick={() => setShowFabModal(false)} role="dialog" aria-modal="true">
            <ModalCard onClick={e => e.stopPropagation()}>
              <ModalClose onClick={() => setShowFabModal(false)} title="Close" aria-label="Close">×</ModalClose>
              <TodoInputRow onSubmit={e => { handleAdd(e); setShowFabModal(false); }} style={{ display: 'flex' }} aria-label="Add new task (modal)" role="form">
                <TodoInput
                  type="text"
                  placeholder="Write your task here..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  aria-label="Task description"
                  required
                />
                <DateInput
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  title="Due date"
                  aria-label="Due date"
                />
                <PrioritySelect
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  title="Priority"
                  aria-label="Priority"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </PrioritySelect>
                <AddButton type="submit" title="Add task" aria-label="Add task">+</AddButton>
              </TodoInputRow>
            </ModalCard>
          </ModalOverlay>
        )}
        {/* Main todo card with input, filters, list, and finish day */}
        <AnimatedCard as={TodoCard} style={{ background: vars.card, boxShadow: vars.cardShadow, border: vars.cardBorder }} theme={vars} delay="200ms">
          {/* Input row for adding todos */}
          <TodoInputRow
            onSubmit={handleAdd}
            style={{ display: window.innerWidth > 700 ? 'flex' : 'none' }}
            aria-label="Add new task"
            role="form"
          >
            <TodoInput
              type="text"
              placeholder="Write your task here..."
              value={input}
              onChange={e => setInput(e.target.value)}
              aria-label="Task description"
              required
            />
            <DateInput
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              title="Due date"
              aria-label="Due date"
            />
            <PrioritySelect
              value={priority}
              onChange={e => setPriority(e.target.value)}
              title="Priority"
              aria-label="Priority"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </PrioritySelect>
            <AddButton type="submit" title="Add task" aria-label="Add task">+</AddButton>
          </TodoInputRow>
          <FilterBar theme={vars} role="group" aria-label="Task filters">
            <div style={{ marginBottom: 10 }}>
              <FilterDropdownLabel theme={vars} htmlFor="status-filter">Status</FilterDropdownLabel>
              <FilterDropdown
                id="status-filter"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                theme={vars}
                aria-label="Status filter"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </FilterDropdown>
            </div>
            <div style={{ marginBottom: 10 }}>
              <FilterDropdownLabel theme={vars} htmlFor="date-filter">Date</FilterDropdownLabel>
              <FilterDropdown
                id="date-filter"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                theme={vars}
                aria-label="Date filter"
              >
                <option value="today">Due Today</option>
                <option value="upcoming">Upcoming</option>
                <option value="overdue">Overdue</option>
              </FilterDropdown>
            </div>
            <div>
              <FilterDropdownLabel theme={vars} htmlFor="priority-filter">Priority</FilterDropdownLabel>
              <FilterDropdown
                id="priority-filter"
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                theme={vars}
                aria-label="Priority filter"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </FilterDropdown>
            </div>
          </FilterBar>
          <Divider />
          <SearchInput
            type="text"
            placeholder="Search todos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: vars.input, color: vars.text }}
            aria-label="Search todos"
          />
          <Divider />
          {filteredTodos.length === 0 ? (
            <EmptyState style={{ color: vars.text2 }}>
              <EmptyEmoji role="img" aria-label="plant">🌱</EmptyEmoji>
              No tasks yet! Enjoy your day.
            </EmptyState>
          ) : (
            <>
              <TransitionGroup component={TodoList}>
                {filteredTodos.map(todo => (
                  <CSSTransition key={todo.id} timeout={350} classNames="todo">
                    <AnimatedTodoItem
                      style={{ color: vars.text }}
                      onTouchStart={e => handleTouchStart(e, todo.id)}
                      onTouchEnd={e => handleTouchEnd(e, todo.id, todo.completed)}
                      onClick={() => openDetails(todo)}
                      tabIndex={0}
                      role="button"
                      aria-label={`View details for task: ${todo.text}`}
                    >
                      <DoodleIcon role="img" aria-label="leaf">🌿</DoodleIcon>
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggle(todo.id, todo.completed)}
                        style={{ marginRight: 12 }}
                        onClick={e => e.stopPropagation()}
                        aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                        tabIndex={0}
                      />
                      <span style={{ flex: 1 }}>
                        {todo.text}
                        {todo.dueDate && (
                          <span style={{ fontSize: '0.9em', color: vars.text3, marginLeft: 8 }}>
                            📅 {todo.dueDate}
                          </span>
                        )}
                        {todo.priority && (
                          <span style={{
                            fontSize: '0.9em',
                            color: PRIORITY_COLORS[todo.priority],
                            marginLeft: 8,
                            fontWeight: 'bold',
                          }}>
                            {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                          </span>
                        )}
                      </span>
                      <DeleteButton onClick={e => { e.stopPropagation(); handleDelete(todo.id); }} title="Delete" aria-label="Delete task" tabIndex={0}>×</DeleteButton>
                      {confettiTask === todo.id && <Confetti>🎉✨</Confetti>}
                    </AnimatedTodoItem>
                  </CSSTransition>
                ))}
              </TransitionGroup>
              <ClearCompletedButton accent={vars.accent} bg={vars.bg} onClick={handleClearCompleted} aria-label="Clear completed tasks">
                Clear Completed
              </ClearCompletedButton>
            </>
          )}
          <FinishDayButton style={{ background: vars.accent, color: vars.bg }} aria-label="Finish day" onClick={handleFinishDay}>
            FINISH DAY
          </FinishDayButton>
        </AnimatedCard>
        {/* Day summary modal with confetti and stats */}
        {showDaySummary && (
          <DaySummaryModalOverlay onClick={closeDaySummary} role="dialog" aria-modal="true">
            <DaySummaryModalCard onClick={e => e.stopPropagation()} style={{ background: vars.card, color: vars.text }}>
              <ModalClose onClick={closeDaySummary} title="Close" aria-label="Close">×</ModalClose>
              {dayConfetti && <DaySummaryConfetti>🎉✨</DaySummaryConfetti>}
              <DaySummaryTitle>Day Complete!</DaySummaryTitle>
              <DaySummaryStats>
                {completedCount} of {todos.length} tasks completed
              </DaySummaryStats>
              <DaySummaryMessage>
                {completedCount === todos.length
                  ? 'Amazing! You finished everything. 🌟'
                  : completedCount > 0
                  ? 'Great job! You made real progress today.'
                  : 'Tomorrow is a new day. You got this!'}
              </DaySummaryMessage>
              <DetailsButton accent={vars.accent} bg={vars.bg} onClick={closeDaySummary} aria-label="Close summary">Close</DetailsButton>
            </DaySummaryModalCard>
          </DaySummaryModalOverlay>
        )}
        {/* Task details modal for editing a todo */}
        {detailsTodo && (
          <DetailsModalOverlay onClick={closeDetails} role="dialog" aria-modal="true">
            <DetailsModalCard onClick={e => e.stopPropagation()} style={{ background: vars.card, color: vars.text }}>
              <ModalClose onClick={closeDetails} title="Close" aria-label="Close">×</ModalClose>
              <DetailsField>
                <DetailsLabel color={vars.text2}>Task</DetailsLabel>
                <DetailsInput
                  name="text"
                  value={detailsFields.text}
                  onChange={handleDetailsChange}
                  bg={vars.input}
                  color={vars.text}
                  aria-label="Task description"
                  required
                />
              </DetailsField>
              <DetailsField>
                <DetailsLabel color={vars.text2}>Due Date</DetailsLabel>
                <DetailsInput
                  name="dueDate"
                  type="date"
                  value={detailsFields.dueDate}
                  onChange={handleDetailsChange}
                  bg={vars.input}
                  color={vars.text}
                  aria-label="Due date"
                />
              </DetailsField>
              <DetailsField>
                <DetailsLabel color={vars.text2}>Priority</DetailsLabel>
                <DetailsSelect
                  name="priority"
                  value={detailsFields.priority}
                  onChange={handleDetailsChange}
                  bg={vars.input}
                  color={vars.text}
                  aria-label="Priority"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </DetailsSelect>
              </DetailsField>
              <DetailsField>
                <DetailsLabel color={vars.text2}>Notes</DetailsLabel>
                <DetailsTextarea
                  name="notes"
                  value={detailsFields.notes}
                  onChange={handleDetailsChange}
                  bg={vars.input}
                  color={vars.text}
                  aria-label="Notes"
                />
              </DetailsField>
              <DetailsActions>
                <DetailsButton accent={vars.accent} bg={vars.bg} onClick={handleDetailsSave} aria-label="Save task details">Save</DetailsButton>
                <DetailsButton accent={vars.filter} bg={vars.bg} onClick={closeDetails} aria-label="Cancel editing">Cancel</DetailsButton>
                <DetailsDelete onClick={handleDetailsDelete} aria-label="Delete task">Delete</DetailsDelete>
              </DetailsActions>
            </DetailsModalCard>
          </DetailsModalOverlay>
        )}
      </PageContainer>
    </>
  );
}
// --- Export main page ---
export default TodoPage; 