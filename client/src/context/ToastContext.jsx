import React, { createContext, useState, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-xl flex items-center justify-between gap-3 text-sm font-semibold glass border animate-in slide-in-from-right duration-350 ${
              toast.type === 'success'
                ? 'border-emerald-500/30 text-emerald-800 dark:text-emerald-300 bg-emerald-500/10'
                : toast.type === 'error'
                ? 'border-red-500/30 text-red-800 dark:text-red-300 bg-red-500/10'
                : 'border-brand-500/30 text-brand-800 dark:text-brand-300 bg-brand-500/10'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-brand-500 flex-shrink-0" />}
              <span className="leading-tight">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded-lg hover:bg-slate-100/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
