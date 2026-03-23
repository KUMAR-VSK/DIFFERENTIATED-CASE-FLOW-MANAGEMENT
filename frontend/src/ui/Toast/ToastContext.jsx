import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext({ addToast: () => {} });

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'info') => {
    const t = { id: Date.now(), message, type };
    setToasts((prev) => [...prev, t]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3000);
  };
  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container" aria-live="polite" style={{ position: 'fixed', bottom: 16, right: 16 }}>
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} style={{ marginTop: 8, padding: '0.75rem 1rem', borderRadius: 6, background: '#111', color: '#fff' }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
