import React, { useState } from 'react';
import { Sparkles, RefreshCw, Copy, Check } from 'lucide-react';

interface AiSeoTabProps {
  groqApiKey: string;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  defaultUrl?: string;
}

export const AiSeoTab: React.FC<AiSeoTabProps> = ({ groqApiKey, showToast, defaultUrl = '' }) => {
  const [t4Url, setT4Url] = useState(defaultUrl);
  const [t4CustomTone, setT4CustomTone] = useState('');
  const [t4Loading, setT4Loading] = useState(false);
  const [t4Title, setT4Title] = useState('');
  const [t4Desc, setT4Desc] = useState('');
  const [t4Engine, setT4Engine] = useState('');
  const [t4CopiedTitle, setT4CopiedTitle] = useState(false);
  const [t4CopiedDesc, setT4CopiedDesc] = useState(false);
  const [t4CopiedAll, setT4CopiedAll] = useState(false);

  const handleT4GenerateAi = async () => {
    if (!t4Url.trim()) {
      showToast('Please paste a YouTube link or topic', 'error');
      return;
    }

    setT4Loading(true);
    try {
      const res = await fetch('/api/ai_metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: t4Url.trim(),
          custom_instruction: t4CustomTone.trim(),
          groq_api_key: groqApiKey,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to generate metadata');

      setT4Title(data.title || '');
      setT4Desc(data.description || '');
      setT4Engine(data.engine || 'Groq');
      showToast('AI title & description generated with Groq!', 'success');
    } catch (err: any) {
      showToast(err.message || 'AI Generation error', 'error');
    } finally {
      setT4Loading(false);
    }
  };

  const copyText = (text: string, type: 'title' | 'desc' | 'all') => {
    navigator.clipboard.writeText(text);
    if (type === 'title') {
      setT4CopiedTitle(true);
      setTimeout(() => setT4CopiedTitle(false), 2000);
      showToast('Title copied to clipboard!', 'success');
    } else if (type === 'desc') {
      setT4CopiedDesc(true);
      setTimeout(() => setT4CopiedDesc(false), 2000);
      showToast('Description copied to clipboard!', 'success');
    } else {
      setT4CopiedAll(true);
      setTimeout(() => setT4CopiedAll(false), 2000);
      showToast('Title & Description copied to clipboard!', 'success');
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Groq AI YouTube SEO (gpt-oss-120b)
            </h2>
            <p className="text-xs text-slate-500">
              Ultra-fast AI generator for viral, high-ranking titles and detailed descriptions
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              YouTube Link or Song Topic
            </label>
            <input
              type="text"
              value={t4Url}
              onChange={(e) => setT4Url(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleT4GenerateAi()}
              placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or 'Adele Someone Like You Acapella'"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Optional Custom Instructions / Tone
            </label>
            <input
              type="text"
              value={t4CustomTone}
              onChange={(e) => setT4CustomTone(e.target.value)}
              placeholder="e.g. Focus on emotional singing, add 6 hashtags, include copyright disclaimer"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>

          <button
            onClick={handleT4GenerateAi}
            disabled={t4Loading}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {t4Loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating with Groq AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Title & Description with Groq
              </>
            )}
          </button>
        </div>

        {/* AI Generated Result */}
        {t4Title && (
          <div className="pt-5 border-t border-slate-100 space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Generated Metadata ({t4Engine || 'Groq'})
              </span>
              <button
                onClick={() => copyText(`TITLE:\n${t4Title}\n\nDESCRIPTION:\n${t4Desc}`, 'all')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {t4CopiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Both (Title & Description)
              </button>
            </div>

            {/* Title Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  YouTube Title ({t4Title.length}/100 chars)
                </span>
                <button
                  onClick={() => copyText(t4Title, 'title')}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  {t4CopiedTitle ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Title
                </button>
              </div>
              <input
                type="text"
                value={t4Title}
                onChange={(e) => setT4Title(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Description Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">YouTube Description</span>
                <button
                  onClick={() => copyText(t4Desc, 'desc')}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  {t4CopiedDesc ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Description
                </button>
              </div>
              <textarea
                rows={7}
                value={t4Desc}
                onChange={(e) => setT4Desc(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-y font-sans"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
