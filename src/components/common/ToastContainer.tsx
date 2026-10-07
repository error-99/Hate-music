import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { ToastItem } from '../../types';

interface ToastContainerProps {
  toasts: ToastItem[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-3.5 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md animate-in slide-in-from-right duration-200 pointer-events-auto ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-700/50'
              : toast.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-700/50'
              : 'bg-slate-900/90 text-slate-200 border-slate-700/50'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
          <span className="flex-1 leading-snug">{toast.message}</span>
        </div>
      ))}
    </div>
  );
};
