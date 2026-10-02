import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { type = 'info', message, title } = toast;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-rose-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-teal-400" />,
  };

  const borders = {
    success: 'border-emerald-500/40 bg-slate-900/95 text-emerald-100',
    error: 'border-rose-500/40 bg-slate-900/95 text-rose-100',
    warning: 'border-amber-500/40 bg-slate-900/95 text-amber-100',
    info: 'border-teal-500/40 bg-slate-900/95 text-teal-100',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-slide-up">
      <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md ${borders[type] || borders.info}`}>
        <div className="flex-shrink-0 mt-0.5">{icons[type] || icons.info}</div>
        <div className="flex-1 text-xs">
          {title && <h5 className="font-semibold text-white mb-0.5 text-sm">{title}</h5>}
          <p className="text-slate-300 leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
