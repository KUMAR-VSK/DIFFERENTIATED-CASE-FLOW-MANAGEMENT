import React from 'react';

const Input = React.forwardRef(({ placeholder, value, onChange, type = 'text', ariaLabel }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      aria-label={ariaLabel || placeholder}
      className="ui-input"
    />
  );
});

export default Input;
