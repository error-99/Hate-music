import React, { useState, useRef } from 'react';
import {
  Download,
  Music,
  RefreshCw,
  Play,
  Pause,
  Terminal,
  ChevronDown,
  ChevronUp,
  Video,
} from 'lucide-react';
import { VideoMetadata } from '../../types';

interface AudioDownloaderTabProps {
  rapidApiKey: string;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onSendToVideoCreator: () => void;
  t1Meta: VideoMetadata | null;
  setT1Meta: React.Dispatch<React.SetStateAction<VideoMetadata | null>>;
  t1AudioName: string | null;
  setT1AudioName: React.Dispatch<React.SetStateAction<string | null>>;
  t1AudioUrl: string | null;
  setT1AudioUrl: React.Dispatch<React.SetStateAction<string | null>>;
}

export const AudioDownloaderTab: React.FC<AudioDownloaderTabProps> = ({
  rapidApiKey,
  showToast,
  onSendToVideoCreator,
  t1Meta,
  setT1Meta,
  t1AudioName,
  setT1AudioName,
  t1AudioUrl,
  setT1AudioUrl,
}) => {
  const [t1Url, setT1Url] = useState('');
  const [t1Loading, setT1Loading] = useState(false);
  const [t1Progress, setT1Progress] = useState(0);
  const [t1StatusText, setT1StatusText] = useState('');
  const [t1Logs, setT1Logs] = useState<string[]>([]);
  const [t1ShowLogs, setT1ShowLogs] = useState(false);
  const [t1Playing, setT1Playing] = useState(false);

  const t1AudioRef = useRef<HTMLAudioElement | null>(null);

  const handleT1Download = async (customUrl?: string) => {
    const targetUrl = (customUrl || t1Url).trim();
    if (!targetUrl) {
      showToast('Please paste a YouTube link or Video ID', 'error');
      return;
    }

    setT1Loading(true);
    setT1Progress(5);
    setT1StatusText('Extracting video metadata & cover artwork...');
    setT1Logs([`[Init] Starting request for: ${targetUrl}`]);

    try {
      // 1. Fetch metadata
      const metaRes = await fetch('/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });
      const metaData = await metaRes.json();
      if (!metaData.success) throw new Error(metaData.error || 'Failed to fetch video metadata');

      setT1Meta(metaData);
      setT1Progress(15);
      setT1StatusText('Initiating audio stream extraction via RapidAPI...');
      setT1Logs((prev) => [...prev, `[Metadata] Found: "${metaData.title}" by ${metaData.channel}`]);

      // 2. Submit download job
      const dlRes = await fetch('/api/download_job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          video_id: metaData.video_id,
          rapidapi_key: rapidApiKey,
        }),
      });
      const dlData = await dlRes.json();
      if (!dlData.success) throw new Error(dlData.error || 'Failed to initiate download job');

      const jobId = dlData.job_id;
      setT1Logs((prev) => [...prev, `[RapidAPI] Job submitted: ${jobId}`]);

      // 3. Poll progress
      await new Promise<void>((resolve, reject) => {
        const interval = setInterval(async () => {
          try {
            const check = await fetch(`/api/job/${jobId}`);
            if (!check.ok) return;
            const state = await check.json();

            if (state.success) {
              setT1Progress(state.progress || 15);
              setT1StatusText(state.status || 'Downloading stream...');
              if (state.logs && state.logs.length) setT1Logs(state.logs);

              if (state.done) {
                clearInterval(interval);
                if (state.error) {
                  reject(new Error(state.error));
                } else if (state.result) {
                  setT1AudioUrl(state.result.audio_url);
                  setT1AudioName(state.result.audio_name);
                  setT1Progress(100);
                  setT1StatusText('Download complete! 100%');
                  resolve();
                }
              }
            }
          } catch (err) {
            clearInterval(interval);
            reject(err);
          }
        }, 800);
      });

      showToast('Audio downloaded in best quality MP3!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Download failed', 'error');
    } finally {
      setT1Loading(false);
    }
  };

  const toggleT1Play = () => {
    if (!t1AudioRef.current) return;
    if (t1Playing) {
      t1AudioRef.current.pause();
      setT1Playing(false);
    } else {
      t1AudioRef.current.play();
      setT1Playing(true);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Audio Downloader</h2>
            <p className="text-xs text-slate-500">
              Paste any YouTube link to download the audio track in best quality
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="relative">
            <input
              type="text"
              value={t1Url}
              onChange={(e) => setT1Url(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleT1Download()}
              placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or Video ID"
              className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono text-xs"
            />
            {t1Url && (
              <button
                onClick={() => setT1Url('')}
                className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Preset sample buttons */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
            <span>Quick samples:</span>
            <button
              onClick={() => {
                setT1Url('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
                handleT1Download('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
              }}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Rick Astley
            </button>
            <button
              onClick={() => {
                setT1Url('https://www.youtube.com/watch?v=YQHsXMglC9A');
                handleT1Download('https://www.youtube.com/watch?v=YQHsXMglC9A');
              }}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Adele - Hello
            </button>
            <button
              onClick={() => {
                setT1Url('fJ9rUzIMcZQ');
                handleT1Download('fJ9rUzIMcZQ');
              }}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Queen - Bohemian
            </button>
          </div>

          {/* Loading Progress Bar & Percentage */}
          {t1Loading && (
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-900">{t1StatusText}</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">{t1Progress}%</span>
              </div>
              <div className="w-full h-3 bg-emerald-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                  style={{ width: `${t1Progress}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={() => handleT1Download()}
            disabled={t1Loading}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {t1Loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Downloading ({t1Progress}%)...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download Audio Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Audio Download Result Card */}
      {t1Meta && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <img
              src={t1Meta.thumbnail_url}
              alt={t1Meta.title}
              className="w-full sm:w-44 aspect-video rounded-2xl object-cover border border-slate-200 shadow-xs"
            />
            <div className="flex-1 space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
                Audio Source Ready
              </span>
              <h3 className="text-base font-bold text-slate-900 leading-snug">{t1Meta.title}</h3>
              <p className="text-xs text-slate-500">Channel: {t1Meta.channel}</p>
              <p className="text-[11px] font-mono text-slate-400">ID: {t1Meta.video_id}</p>
            </div>
          </div>

          {t1AudioUrl && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={toggleT1Play}
                    className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 transition-all shrink-0 cursor-pointer"
                  >
                    {t1Playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-800 truncate">{t1AudioName}</p>
                    <span className="text-[11px] text-slate-400">Best Quality MP3 Stream</span>
                  </div>
                </div>

                <audio
                  ref={t1AudioRef}
                  src={t1AudioUrl}
                  onEnded={() => setT1Playing(false)}
                  controls
                  className="h-8 w-full sm:w-72"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={t1AudioUrl}
                  download={t1AudioName || 'audio.mp3'}
                  className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download MP3 to Device
                </a>

                <button
                  onClick={onSendToVideoCreator}
                  className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  Create Video with this Track & Thumbnail →
                </button>

                <button
                  onClick={() => setT1ShowLogs(!t1ShowLogs)}
                  className="px-3.5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Logs
                  {t1ShowLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {t1ShowLogs && (
                <div className="p-3 rounded-2xl bg-slate-900 text-emerald-400 text-xs font-mono max-h-40 overflow-y-auto space-y-1">
                  {t1Logs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
