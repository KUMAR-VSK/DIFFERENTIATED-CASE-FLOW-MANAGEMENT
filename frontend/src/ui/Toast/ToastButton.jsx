import React from 'react';
import { useToast } from './ToastContext.jsx';

const ToastButton = () => {
  const { addToast } = useToast();
  return (
    <button onClick={() => addToast('Demo toast message', 'success')} className="btn">
      Show Toast
    </button>
  );
};

export default ToastButton;
