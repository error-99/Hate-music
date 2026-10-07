import React from 'react';
import { Lock, Sparkles, Key } from 'lucide-react';

interface LoginModalProps {
  loginInput: string;
  setLoginInput: (val: string) => void;
  loginError: string;
  onLogin: (e: React.FormEvent) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  loginInput,
  setLoginInput,
  loginError,
  onLogin,
}) => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl space-y-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Vocals Studio Suite</h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your access passcode to access the YouTube audio & video workstation.
          </p>
        </div>

        <form onSubmit={onLogin} className="space-y-4">
          <div className="relative">
            <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="password"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder="Enter passcode (default: vocals123)"
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
              autoFocus
            />
          </div>

          {loginError && (
            <p className="text-xs font-semibold text-rose-600 animate-in fade-in">
              {loginError}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Unlock Studio
          </button>
        </form>

        <p className="text-[11px] text-slate-400">
          Tip: Passcode is stored in browser memory for security.
        </p>
      </div>
    </div>
  );
};
