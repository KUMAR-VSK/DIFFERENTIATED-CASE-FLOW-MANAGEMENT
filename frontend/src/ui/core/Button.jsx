import React from 'react';
import './styles.css';

const Button = ({ variant = 'primary', onClick, disabled, children, ariaLabel, className = '' }) => {
  const classNames = `ui-btn ${variant} ${className}`;
  return (
    <button
      aria-label={ariaLabel || typeof children === 'string' ? children : 'button'}
      className={classNames}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
