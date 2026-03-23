import React from 'react';
import ThemeProvider from './ui/ThemeContext.jsx';
import AppRouter from './AppRouter.jsx';
import './styles/global.css';

const App = () => {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
};

export default App;
