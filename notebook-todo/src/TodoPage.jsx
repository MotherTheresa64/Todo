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
// Keyframes for card entrance, button pop, shimmer, FAB pulse, and confetti
const cardEntrance = keyframes`
  from { opacity: 0; transform: translateY(32px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;
const buttonPop = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
`;
const shimmer = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
`;
const fabPulse = keyframes`
  0%, 100% { box-shadow: 0 4px 16px #b7d89c55; }
  50% { box-shadow: 0 8px 32px #b7d89c99; }
`;
const confettiBurst = keyframes`
  0% { opacity: 1; transform: scale(0.5) translateY(0); }
  80% { opacity: 1; transform: scale(1.2) translateY(-40px); }
  100% { opacity: 0; transform: scale(1.2) translateY(-60px); }
`;

// --- STYLED COMPONENTS ---
// Layout containers and UI elements, styled for the "Green Productivity" theme
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 24px 0 60px 0;
  box-sizing: border-box;
  width: 100vw;
  overflow-x: hidden;
`;
// Row for date and progress cards at the top
const CardRow = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  width: 100%;
  max-width: 600px;
  box-sizing: border-box;
  @media (max-width: 700px) {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    max-width: 98vw;
  }
`;
// Card container for todos and summary
const TodoCard = styled.div`
  width: 100%;
  max-width: 600px;
  align-items: stretch;
  min-width: 0;
  margin-bottom: 32px;
  box-sizing: border-box;
  overflow-x: hidden;
  padding: 36px 24px 44px 24px;
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.cardShadow};
  background: ${({ theme }) => theme.card};
  border: ${({ theme }) => theme.cardBorder};

  /* Subtle lift on hover for desktop pointers */
  transition: transform 0.25s, box-shadow 0.25s;
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-4px);
      box-shadow: ${({ theme }) => theme.cardShadow}, 0 6px 20px rgba(0, 0, 0, 0.1);
    }
  }

  @media (max-width: 700px) {
    padding: 18px 8px 32px 8px;
    max-width: 98vw;
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
  padding: 16px 12px;
  border: none;
  border-radius: 12px;
  font-size: 1.1em;
  font-family: inherit;
  background: #232e1b;
  color: #f6f7f2;
  box-shadow: 0 1px 2px #1a1f1433;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  @media (max-width: 700px) {
    width: 100%;
    font-size: 1.18em;
    padding: 18px 12px;
  }
`;
const DateInput = styled.input`
  flex: 1 1 80px;
  padding: 16px 12px;
  border: none;
  border-radius: 12px;
  font-size: 1em;
  font-family: inherit;
  background: #232e1b;
  color: #f6f7f2;
  box-shadow: 0 1px 2px #1a1f1433;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  @media (max-width: 700px) {
    width: 100%;
    font-size: 1.13em;
    padding: 18px 12px;
  }
`;
const PrioritySelect = styled.select`
  flex: 1 1 80px;
  padding: 16px 12px;
  border: none;
  border-radius: 12px;
  font-size: 1em;
  font-family: inherit;
  background: #232e1b;
  color: #f6f7f2;
  box-shadow: 0 1px 2px #1a1f1433;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  @media (max-width: 700px) {
    width: 100%;
    font-size: 1.13em;
    padding: 18px 12px;
  }
`;
const AddButton = styled.button`
  background: #b7d89c;
  border: none;
  border-radius: 14px;
  padding: 0 22px;
  font-size: 1.7em;
  font-family: inherit;
  font-weight: 700;
  color: #232e1b;
  box-shadow: 0 2px 8px #b7d89c55, 1px 2px 0 #3d4d2e;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 54px;
  min-height: 54px;
  height: 54px;
  box-sizing: border-box;
  @media (max-width: 700px) {
    min-width: 100%;
    min-height: 48px;
    height: 48px;
    font-size: 1.3em;
  }
  &:hover { background: #a3c47c; color: #fff; box-shadow: 0 4px 16px #a3c47c55; }
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
  display: none;
  @media (max-width: 700px) {
    display: flex;
    position: fixed;
    bottom: 32px;
    right: 24px;
    z-index: 300;
    background: #b7d89c;
    color: #232e1b;
    border: none;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    font-size: 2.2em;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px #1a1f1440;
    cursor: pointer;
    transition: background 0.2s;
    &:hover { background: #a3c47c; color: #fff; }
  }
`;
const ModalOverlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(35, 46, 27, 0.85);
  z-index: 400;
`;
const ModalCard = styled.div`
  background: #2e3b25;
  border-radius: 24px;
  box-shadow: 0 4px 24px #1a1f14aa;
  padding: 32px 18px 24px 18px;
  width: 95vw;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
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
  animation: ${fabPulse} 2.2s infinite;
  background: ${({ theme }) => theme.fab};
  box-shadow: ${({ theme }) => theme.fabShadow};
  color: #232e1b;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 1.6em;
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  line-height: 1;
  font-weight: 700;
  text-align: center;
  &:hover { background: ${({ theme }) => theme.accent2}; color: #fff; }
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

// Animated card for entrance animation on cards (date, progress, main todo)
const AnimatedCard = styled.div`
  animation: ${cardEntrance} 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity, transform;
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
          <AnimatedCard as={Card} style={{ background: vars.card, boxShadow: vars.cardShadow, border: vars.cardBorder }} theme={vars}>
            <DateText style={{ color: vars.text2 }}>{day}</DateText>
            <DateCircle style={{ background: vars.accent2, color: vars.text }}>{date}</DateCircle>
            <MonthText style={{ color: vars.text3 }}>{month}</MonthText>
          </AnimatedCard>
          <AnimatedCard as={ProgressCard} style={{ background: vars.card, boxShadow: vars.cardShadow, border: vars.cardBorder }} theme={vars}>
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
        <AnimatedCard as={TodoCard} style={{ background: vars.card, boxShadow: vars.cardShadow, border: vars.cardBorder }} theme={vars}>
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