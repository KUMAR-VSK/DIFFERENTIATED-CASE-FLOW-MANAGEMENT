import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <nav className="ui-nav" aria-label="Main navigation" style={{ display: 'flex', gap: '1rem' }}>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/cases">Cases</Link>
      <Link to="/hearings">Hearings</Link>
    </nav>
  );
};

export default NavBar;
