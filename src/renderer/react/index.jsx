import './i18n';
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import ThemeToggle from './components/ThemeToggle.jsx';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light-theme');

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme(prev => (prev === 'light-theme' ? 'dark-theme' : 'light-theme'));
  };

  return (
    <>
      <ThemeToggle onToggle={handleThemeToggle} />
    </>
  );
}

const root = document.getElementById('react-div');
if (root) {
  createRoot(root).render(<App />);
}