import React from 'react';
import { useTheme } from './ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} aria-label="Toggle theme" className="theme-toggle">
      {theme === 'dark' ? 'Light' : 'Dark'} Theme
    </button>
  );
};

export default ThemeToggle;
