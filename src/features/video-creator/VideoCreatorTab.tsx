import React, { useState } from 'react';
import {
  FileAudio,
  Upload,
  Music,
  Trash2,
  RefreshCw,
  Sliders,
  Download,
  CheckCircle2,
  Video,
  ImageIcon,
  Film,
  VolumeX,
  Sparkles,
  Terminal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { VideoMetadata, CleanStats, VideoResultStats } from '../../types';
import { triggerDownload } from '../../utils/download';

interface VideoCreatorTabProps {
  t1Meta: VideoMetadata | null;
  t1AudioName: string | null;
  t1AudioUrl: string | null;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  t2CleanedName: string | null;
  setT2CleanedName: React.Dispatch<React.SetStateAction<string | null>>;
  t2CleanedUrl: string | null;
  setT2CleanedUrl: React.Dispatch<React.SetStateAction<string | null>>;
  t2CustomImageName: string | null;
  setT2CustomImageName: React.Dispatch<React.SetStateAction<string | null>>;
  t2CustomImageUrl: string | null;
  setT2CustomImageUrl: React.Dispatch<React.SetStateAction<string | null>>;
  t2ThumbSourceTitle: string | null;
  setT2ThumbSourceTitle: React.Dispatch<React.SetStateAction<string | null>>;
  t2ThumbLink: string;
  setT2ThumbLink: React.Dispatch<React.SetStateAction<string>>;
  t2VisualType: 'image' | 'video';
  setT2VisualType: React.Dispatch<React.SetStateAction<'image' | 'video'>>;
}

export const VideoCreatorTab: React.FC<VideoCreatorTabProps> = ({
  t1Meta,
  t1AudioName,
  t1AudioUrl,
  showToast,
  t2CleanedName,
  setT2CleanedName,
  t2CleanedUrl,
  setT2CleanedUrl,
  t2CustomImageName,
  setT2CustomImageName,
  t2CustomImageUrl,
  setT2CustomImageUrl,
  t2ThumbSourceTitle,
  setT2ThumbSourceTitle,
  t2ThumbLink,
  setT2ThumbLink,
  t2VisualType,
  setT2VisualType,
}) => {
  // Audio state
  const [t2File, setT2File] = useState<File | null>(null);
  const [t2Cleaning, setT2Cleaning] = useState(false);
  const [t2CleanProgress, setT2CleanProgress] = useState(0);
  const [t2CleanStatus, setT2CleanStatus] = useState('');
  const [t2CleanStats, setT2CleanStats] = useState<CleanStats | null>(null);

  // Background video state
  const [t2CustomVideoName, setT2CustomVideoName] = useState<string | null>(null);
  const [t2CustomVideoUrl, setT2CustomVideoUrl] = useState<string | null>(null);
  const [t2FetchingThumb, setT2FetchingThumb] = useState(false);

  // Video building state
  const [t2BuildingVideo, setT2BuildingVideo] = useState(false);
  const [t2VideoProgress, setT2VideoProgress] = useState(0);
  const [t2VideoStatus, setT2VideoStatus] = useState('');
  const [t2VideoUrl, setT2VideoUrl] = useState<string | null>(null);
  const [t2VideoName, setT2VideoName] = useState<string | null>(null);
  const [t2VideoStats, setT2VideoStats] = useState<VideoResultStats | null>(null);
  const [t2Logs, setT2Logs] = useState<string[]>([]);
  const [t2ShowLogs, setT2ShowLogs] = useState(false);

  // Fetch thumbnail from YouTube link or image URL
  const handleT2FetchThumbnail = async (overrideUrl?: string) => {
    const urlToFetch = (overrideUrl || t2ThumbLink).trim();
    if (!urlToFetch) {
      showToast('Please enter a YouTube link or image URL', 'error');
      return;
    }

    setT2FetchingThumb(true);
    try {
      showToast('Fetching thumbnail image...', 'info');
      const res = await fetch('/api/fetch_thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToFetch }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch thumbnail');

      setT2CustomImageName(data.image_name);
      setT2CustomImageUrl(data.thumbnail_url);
      setT2ThumbSourceTitle(data.title || null);
      setT2VisualType('image');
      showToast('Thumbnail fetched & ready for video!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Could not fetch thumbnail', 'error');
    } finally {
      setT2FetchingThumb(false);
    }
  };

  // Upload visual media (image or video)
  const handleUploadVisualMedia = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      showToast(`Uploading ${file.type.startsWith('video') ? 'background video' : 'custom thumbnail image'}...`, 'info');

      const res = await fetch('/api/upload_media', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to upload media');

      if (data.media_type === 'video') {
        setT2CustomVideoName(data.file_name);
        setT2CustomVideoUrl(data.url);
        setT2VisualType('video');
        showToast('Video uploaded! Its audio will be automatically muted when rendering.', 'success');
      } else {
        setT2CustomImageName(data.file_name);
        setT2CustomImageUrl(data.url);
        setT2ThumbSourceTitle(file.name);
        setT2VisualType('image');
        showToast('Thumbnail image uploaded & ready!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Media upload failed', 'error');
    }
  };

  // Clean Audio handler (Remove silence only)
  const handleT2CleanAudio = async () => {
    if (!t2File) {
      showToast('Please select or upload an audio file first', 'error');
      return;
    }

    setT2Cleaning(true);
    setT2CleanProgress(15);
    setT2CleanStatus('Analyzing audio wave and duration...');
    setT2Logs(['[Audio Cleaner] Starting FFmpeg processing (silence removal only)...']);

    const progTimer = setInterval(() => {
      setT2CleanProgress((prev) => {
        if (prev >= 90) return prev;
        if (prev < 40) return prev + 15;
        if (prev < 70) return prev + 10;
        return prev + 5;
      });
    }, 600);

    try {
      const formData = new FormData();
      formData.append('file', t2File);
      formData.append('silence_threshold', '-35dB');
      formData.append('min_silence_duration', '0.6');

      setT2CleanStatus('Detecting silence and splicing audio intervals (silence only)...');
      const res = await fetch('/api/clean', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      clearInterval(progTimer);

      setT2Logs(data.logs || []);
      if (!data.success) throw new Error(data.error || 'Failed to remove silence');

      setT2CleanProgress(100);
      setT2CleanStatus('Complete! 100% Silence removed. Natural volume & original sound preserved.');
      setT2CleanedName(data.cleaned_name);
      setT2CleanedUrl(data.cleaned_url);
      setT2CleanStats({
        before: data.duration_before || 0,
        after: data.duration_after || 0,
        removed: Math.max(0, (data.duration_before || 0) - (data.duration_after || 0)),
      });
      showToast('Silence removed! Natural volume & original sound preserved.', 'success');
    } catch (err: any) {
      clearInterval(progTimer);
      showToast(err.message || 'Silence removal failed', 'error');
    } finally {
      setT2Cleaning(false);
    }
  };

  // Build Video handler
  const handleT2BuildVideo = async () => {
    const audioToUse = t2CleanedName || t2File?.name || (t1AudioName ? t1AudioName : undefined);
    if (!audioToUse) {
      showToast('Please clean your audio or upload an audio file first', 'error');
      return;
    }

    if (t2VisualType === 'video' && !t2CustomVideoName) {
      showToast('Please upload a background video first', 'error');
      return;
    }

    if (t2VisualType === 'image' && !t2CustomImageName && !t2ThumbLink.trim() && !t1Meta) {
      showToast('Please provide a thumbnail image (paste a link or upload an image file)', 'error');
      return;
    }

    setT2BuildingVideo(true);
    setT2VideoProgress(5);
    setT2VideoStatus('Preparing media assets and audio stream...');
    setT2Logs(['[Video Creator] Launching video rendering job...']);

    try {
      const payload: any = {
        audio_name: audioToUse,
      };

      if (t2VisualType === 'video' && t2CustomVideoName) {
        payload.custom_video_name = t2CustomVideoName;
      } else if (t2CustomImageName) {
        payload.custom_image_name = t2CustomImageName;
      } else if (t2ThumbLink.trim()) {
        payload.youtube_url = t2ThumbLink.trim();
      } else if (t1Meta) {
        payload.youtube_url = t1Meta.video_id;
      }

      const jobRes = await fetch('/api/build_video_job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const jobData = await jobRes.json();
      if (!jobData.success) throw new Error(jobData.error || 'Failed to initiate video rendering job');

      const jobId = jobData.job_id;

      await new Promise<void>((resolve, reject) => {
        const interval = setInterval(async () => {
          try {
            const check = await fetch(`/api/job/${jobId}`);
            if (!check.ok) return;
            const state = await check.json();

            if (state.success) {
              setT2VideoProgress(state.progress || 10);
              setT2VideoStatus(state.status || 'Rendering 1080p MP4 video...');
              if (state.logs && state.logs.length) setT2Logs(state.logs);

              if (state.done) {
                clearInterval(interval);
                if (state.error) {
                  reject(new Error(state.error));
                } else if (state.result) {
                  setT2VideoUrl(state.result.video_url);
                  setT2VideoName(state.result.video_name);
                  setT2VideoStats({ size_mb: state.result.size_mb, duration: state.result.duration });
                  setT2VideoProgress(100);
                  setT2VideoStatus('Render complete! 100%');
                  resolve();
                }
              }
            }
          } catch (err) {
            clearInterval(interval);
            reject(err);
          }
        }, 900);
      });

      showToast('1080p MP4 video created successfully with thumbnail!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Video creation failed', 'error');
    } finally {
      setT2BuildingVideo(false);
    }
  };

  const handleUseTab1 = () => {
    if (t1AudioName && t1AudioUrl) {
      setT2CleanedName(t1AudioName);
      setT2CleanedUrl(t1AudioUrl);
      if (t1Meta) {
        setT2CustomImageName(`${t1Meta.video_id}.jpg`);
        setT2CustomImageUrl(t1Meta.thumbnail_url);
        setT2ThumbSourceTitle(t1Meta.title);
        setT2ThumbLink(`https://www.youtube.com/watch?v=${t1Meta.video_id}`);
      }
      setT2VisualType('image');
      showToast('Tab 1 Audio & Thumbnail loaded!', 'success');
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Quick link banner if Tab 1 has downloaded media */}
      {t1Meta && (!t2CustomImageUrl || !t2CleanedName) && (
        <div className="p-4 rounded-3xl bg-purple-50/80 border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <img
              src={t1Meta.thumbnail_url}
              alt={t1Meta.title}
              className="w-16 h-10 object-cover rounded-xl border border-purple-200 shrink-0"
            />
            <div>
              <p className="text-xs font-bold text-purple-950">Quick Link from Tab 1</p>
              <p className="text-[11px] text-purple-700 truncate max-w-sm">{t1Meta.title}</p>
            </div>
          </div>
          <button
            onClick={handleUseTab1}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Use Tab 1 Audio & Thumbnail
          </button>
        </div>
      )}

      {/* Step 1: Upload Audio & Remove Silence */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <FileAudio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Audio Silence Removal (Silence Only)</h2>
              <p className="text-xs text-slate-500">
                Remove dead air pauses only — 100% natural volume & original audio quality strictly preserved
              </p>
            </div>
          </div>

          {t2CleanedName && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Silence Cut
            </span>
          )}
        </div>

        {/* Upload Dropzone */}
        {!t2File && !t2CleanedName ? (
          <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-xs mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-slate-800">
              Choose or Drag & Drop Audio File
            </span>
            <p className="text-xs text-slate-400 mt-1">Supports MP3, WAV, M4A, AAC</p>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setT2File(e.target.files[0]);
                  setT2CleanedName(null);
                  setT2CleanedUrl(null);
                  setT2CleanStats(null);
                }
              }}
              className="hidden"
            />
          </label>
        ) : t2File ? (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 truncate">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Music className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-slate-900 truncate">{t2File.name}</p>
                <p className="text-xs text-slate-500">{(t2File.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>

            <button
              onClick={() => {
                setT2File(null);
                setT2CleanedName(null);
                setT2CleanedUrl(null);
                setT2CleanStats(null);
                showToast('Audio removed.', 'info');
              }}
              className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        ) : null}

        {/* Silence Removal Progress Bar */}
        {t2Cleaning && (
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-blue-900">{t2CleanStatus}</span>
              <span className="font-mono font-bold text-blue-700 text-sm">{t2CleanProgress}%</span>
            </div>
            <div className="w-full h-3 bg-blue-200/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${t2CleanProgress}%` }}
              />
            </div>
          </div>
        )}

        {t2File && (
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleT2CleanAudio}
              disabled={t2Cleaning}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {t2Cleaning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Removing Silence ({t2CleanProgress}%)...
                </>
              ) : (
                <>
                  <Sliders className="w-4 h-4" />
                  Remove Silence Only
                </>
              )}
            </button>
          </div>
        )}

        {t2CleanedUrl && (
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Silence Cut (Original Sound & Natural Volume Preserved)
              </span>
              {t2CleanStats && (
                <span className="text-[11px] font-mono text-emerald-700">
                  Cut: -{t2CleanStats.removed.toFixed(2)}s | Final: {t2CleanStats.after.toFixed(2)}s
                </span>
              )}
            </div>
            <audio src={t2CleanedUrl} controls className="h-8 w-full" />
            <div className="pt-1">
              <a
                href={t2CleanedUrl}
                download={t2CleanedName || 'cleaned.mp3'}
                className="inline-flex px-4 py-2 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 text-xs font-semibold items-center gap-2 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                Download Cleaned MP3
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Visual Selection (1080p Thumbnail / Image Artwork OR Background Video) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Choose Video Visuals (1080p Thumbnail or Video)</h2>
              <p className="text-xs text-slate-500">
                Give a thumbnail image (paste link or upload file) or upload a background video
              </p>
            </div>
          </div>
        </div>

        {/* Visual Source Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setT2VisualType('image')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              t2VisualType === 'image'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Thumbnail / Image Artwork</span>
          </button>
          <button
            type="button"
            onClick={() => setT2VisualType('video')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              t2VisualType === 'video'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Background Video (Auto-Mute)</span>
          </button>
        </div>

        {/* MODE 1: THUMBNAIL / IMAGE ARTWORK */}
        {t2VisualType === 'image' && (
          <div className="space-y-4">
            {/* If thumbnail is ALREADY loaded/selected, show active preview card */}
            {t2CustomImageUrl ? (
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Active Video Thumbnail (1080p MP4 Visual)
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    ✓ Thumbnail Added
                  </span>
                </div>

                <div className="aspect-video max-w-md mx-auto rounded-xl overflow-hidden bg-black border border-purple-300 shadow-md relative">
                  <img
                    src={t2CustomImageUrl}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                    <p className="text-xs font-semibold text-white truncate max-w-full">
                      {t2ThumbSourceTitle || t2CustomImageName || 'Thumbnail Ready'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-purple-900 font-medium truncate max-w-xs">
                    {t2ThumbSourceTitle || t2CustomImageName}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setT2CustomImageName(null);
                      setT2CustomImageUrl(null);
                      setT2ThumbSourceTitle(null);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-purple-200 bg-white hover:bg-rose-50 text-rose-600 text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                  >
                    Change / Remove Thumbnail
                  </button>
                </div>
              </div>
            ) : (
              /* When NO thumbnail is loaded, show both Link Input & Direct File Upload */
              <div className="space-y-4">
                {/* Option A: Paste YouTube Link or Image Link */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Option 1: Paste YouTube Link or Thumbnail Image URL
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={t2ThumbLink}
                      onChange={(e) => setT2ThumbLink(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleT2FetchThumbnail()}
                      placeholder="e.g. https://youtu.be/dQw4w9WgXcQ or image URL"
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleT2FetchThumbnail()}
                      disabled={t2FetchingThumb || !t2ThumbLink.trim()}
                      className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs disabled:opacity-50 transition-all"
                    >
                      {t2FetchingThumb ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Fetching...
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          Fetch & Add Thumbnail
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Fetches the high-resolution artwork and automatically sets it as the 1080p video visual.
                  </p>
                </div>

                {/* Option B: Upload Thumbnail Image File */}
                <label className="border-2 border-dashed border-purple-200 hover:border-purple-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white hover:bg-purple-50/20">
                  <ImageIcon className="w-8 h-8 text-purple-500 mb-2" />
                  <span className="text-xs font-bold text-slate-800">
                    Option 2: Upload Thumbnail Image File Directly
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Supports JPG, PNG, WEBP, GIF (drag & drop or click)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleUploadVisualMedia(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: CUSTOM VIDEO (AUTO-MUTE) */}
        {t2VisualType === 'video' && (
          <div className="space-y-3 p-4 rounded-2xl bg-purple-50/50 border border-purple-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-900">
              <VolumeX className="w-4 h-4 text-purple-600" />
              <span>Auto-Mute Active: Video's original sound will be muted and replaced with your clean audio track</span>
            </div>

            {!t2CustomVideoUrl ? (
              <label className="border-2 border-dashed border-purple-200 hover:border-purple-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white hover:bg-purple-50/20">
                <Film className="w-8 h-8 text-purple-500 mb-2" />
                <span className="text-xs font-bold text-slate-800">Upload Background Video</span>
                <p className="text-[11px] text-slate-400 mt-0.5">MP4, WEBM, MOV (loops automatically)</p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleUploadVisualMedia(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="space-y-2">
                <div className="aspect-video max-w-sm mx-auto rounded-xl overflow-hidden bg-black border border-purple-200">
                  <video src={t2CustomVideoUrl} controls muted className="w-full h-full object-contain" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-800 font-medium truncate max-w-xs">{t2CustomVideoName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setT2CustomVideoName(null);
                      setT2CustomVideoUrl(null);
                    }}
                    className="text-rose-600 hover:underline cursor-pointer"
                  >
                    Change Video
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Video Render Live % Progress Bar */}
        {t2BuildingVideo && (
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-purple-900">{t2VideoStatus}</span>
              <span className="font-mono font-bold text-purple-700 text-sm">{t2VideoProgress}%</span>
            </div>
            <div className="w-full h-3 bg-purple-200/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                style={{ width: `${t2VideoProgress}%` }}
              />
            </div>
          </div>
        )}

        <button
          onClick={handleT2BuildVideo}
          disabled={t2BuildingVideo || (!t2CleanedName && !t2File && !t1AudioName)}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {t2BuildingVideo ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Rendering 1080p Video ({t2VideoProgress}%)...
            </>
          ) : (
            <>
              <Video className="w-4 h-4" />
              Create 1080p Video Now
            </>
          )}
        </button>

        {/* Video Output Card */}
        {t2VideoUrl && (
          <div className="pt-4 border-t border-slate-100 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                1080p Video Ready!
              </span>
              {t2VideoStats && (
                <span className="text-[11px] font-mono text-purple-700">
                  {t2VideoStats.size_mb} MB • Duration: {t2VideoStats.duration}s
                </span>
              )}
            </div>

            <div className="aspect-video max-w-xl mx-auto rounded-2xl overflow-hidden bg-black shadow-md border border-slate-200">
              <video src={t2VideoUrl} controls className="w-full h-full object-contain" />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => triggerDownload(t2VideoUrl, t2VideoName || 'video.mp4', showToast)}
                className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download 1080p MP4 Video
              </button>

              <button
                onClick={() => setT2ShowLogs(!t2ShowLogs)}
                className="px-3.5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                Logs
                {t2ShowLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {t2ShowLogs && (
              <div className="p-3 rounded-2xl bg-slate-900 text-purple-400 text-xs font-mono max-h-40 overflow-y-auto space-y-1">
                {t2Logs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
