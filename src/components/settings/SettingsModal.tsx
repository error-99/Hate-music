import React, { useState } from 'react';
import { Settings, Eye, EyeOff, RefreshCw, Key, CheckCircle2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rapidApiKey: string;
  setRapidApiKey: (key: string) => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  groqApiKey: string;
  setGroqApiKey: (key: string) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  rapidApiKey,
  setRapidApiKey,
  geminiApiKey,
  setGeminiApiKey,
  groqApiKey,
  setGroqApiKey,
  showToast,
}) => {
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [testingRapidApi, setTestingRapidApi] = useState(false);
  const [testingGemini, setTestingGemini] = useState(false);
  const [testingGroq, setTestingGroq] = useState(false);

  if (!isOpen) return null;

  const handleTestRapidApi = async () => {
    setTestingRapidApi(true);
    try {
      const res = await fetch('/api/test_rapidapi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rapidapi_key: rapidApiKey }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('RapidAPI connection verified!', 'success');
      } else {
        showToast(data.error || 'RapidAPI test failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error testing RapidAPI', 'error');
    } finally {
      setTestingRapidApi(false);
    }
  };

  const handleTestGemini = async () => {
    setTestingGemini(true);
    try {
      const res = await fetch('/api/test_gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: geminiApiKey }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Gemini API connection verified!', 'success');
      } else {
        showToast(data.error || 'Gemini test failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error testing Gemini', 'error');
    } finally {
      setTestingGemini(false);
    }
  };

  const handleTestGroq = async () => {
    setTestingGroq(true);
    try {
      const res = await fetch('/api/test_groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groq_api_key: groqApiKey }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Groq AI connected! Model: ${data.model || 'gpt-oss-120b'}`, 'success');
      } else {
        showToast(data.error || 'Groq test failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error testing Groq', 'error');
    } finally {
      setTestingGroq(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-5 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Settings & API Tester</h3>
              <p className="text-[11px] text-slate-400">Configure keys & test connections live</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Active API Keys
            </span>
            <button
              onClick={() => setShowApiKeys(!showApiKeys)}
              className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer font-medium"
            >
              {showApiKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showApiKeys ? 'Hide Keys' : 'Show Keys'}
            </button>
          </div>

          {/* RapidAPI Key */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="block text-xs font-semibold text-slate-700">RapidAPI Key (Audio Downloader)</label>
            <div className="flex gap-2">
              <input
                type={showApiKeys ? 'text' : 'password'}
                value={rapidApiKey}
                onChange={(e) => {
                  setRapidApiKey(e.target.value);
                  localStorage.setItem('rapidapi_key', e.target.value);
                }}
                placeholder="Enter RapidAPI Key"
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                onClick={handleTestRapidApi}
                disabled={testingRapidApi}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shrink-0 flex items-center gap-1 cursor-pointer disabled:opacity-60"
              >
                {testingRapidApi ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Test API'}
              </button>
            </div>
          </div>

          {/* Groq AI Key */}
          <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
            <label className="block text-xs font-semibold text-amber-950">
              Groq AI Key (Fast YouTube SEO • gpt-oss-120b)
            </label>
            <div className="flex gap-2">
              <input
                type={showApiKeys ? 'text' : 'password'}
                value={groqApiKey}
                onChange={(e) => {
                  setGroqApiKey(e.target.value);
                  localStorage.setItem('groq_api_key', e.target.value);
                }}
                placeholder="Enter Groq API Key (gsk_...)"
                className="flex-1 bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <button
                onClick={handleTestGroq}
                disabled={testingGroq}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors shrink-0 flex items-center gap-1 cursor-pointer disabled:opacity-60"
              >
                {testingGroq ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Test Groq'}
              </button>
            </div>
          </div>

          {/* Gemini AI Key */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Gemini AI Key (Alternative SEO Engine)</label>
            <div className="flex gap-2">
              <input
                type={showApiKeys ? 'text' : 'password'}
                value={geminiApiKey}
                onChange={(e) => {
                  setGeminiApiKey(e.target.value);
                  localStorage.setItem('gemini_api_key', e.target.value);
                }}
                placeholder="Enter Gemini API Key (optional)"
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                onClick={handleTestGemini}
                disabled={testingGemini}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shrink-0 flex items-center gap-1 cursor-pointer disabled:opacity-60"
              >
                {testingGemini ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Test Gemini'}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
