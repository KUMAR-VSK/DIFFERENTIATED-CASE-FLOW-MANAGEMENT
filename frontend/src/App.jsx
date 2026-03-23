import React from 'react';
import ThemeProvider from './ui/ThemeContext.jsx';
import ToastProvider from './ui/Toast/ToastContext.jsx';
import AppRouter from './AppRouter.jsx';
import './styles/global.css';

const App = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
