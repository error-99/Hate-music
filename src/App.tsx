import React, { useState } from 'react';
import { TabType, ToastItem, VideoMetadata } from './types';
import { Header } from './components/common/Header';
import { MobileNav } from './components/common/MobileNav';
import { LoginModal } from './components/common/LoginModal';
import { ToastContainer } from './components/common/ToastContainer';
import { SettingsModal } from './components/settings/SettingsModal';
import { AudioDownloaderTab } from './features/downloader/AudioDownloaderTab';
import { VideoCreatorTab } from './features/video-creator/VideoCreatorTab';
import { AiSeoTab } from './features/seo/AiSeoTab';

export default function App() {
  // App Lock Passcode Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('studio_auth') === 'true';
  });
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // 3 Core Independent Tabs
  const [activeTab, setActiveTab] = useState<TabType>('tab1');

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [rapidApiKey, setRapidApiKey] = useState(
    () => localStorage.getItem('rapidapi_key') || '41ac3cccb3msh09cce7da9f3d0b3p17f5d8jsne0438b971bdd'
  );
  const [geminiApiKey, setGeminiApiKey] = useState(
    () => localStorage.getItem('gemini_api_key') || ''
  );
  const [groqApiKey, setGroqApiKey] = useState(
    () => localStorage.getItem('groq_api_key') || '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'
  );

  // Floating Toast Notifications
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Shared Track State (Handoff between Tab 1 Download and Tab 2 Video Creator)
  const [t1Meta, setT1Meta] = useState<VideoMetadata | null>(null);
  const [t1AudioName, setT1AudioName] = useState<string | null>(null);
  const [t1AudioUrl, setT1AudioUrl] = useState<string | null>(null);

  // Tab 2 Visual & Audio State
  const [t2CleanedName, setT2CleanedName] = useState<string | null>(null);
  const [t2CleanedUrl, setT2CleanedUrl] = useState<string | null>(null);
  const [t2CustomImageName, setT2CustomImageName] = useState<string | null>(null);
  const [t2CustomImageUrl, setT2CustomImageUrl] = useState<string | null>(null);
  const [t2ThumbSourceTitle, setT2ThumbSourceTitle] = useState<string | null>(null);
  const [t2ThumbLink, setT2ThumbLink] = useState('');
  const [t2VisualType, setT2VisualType] = useState<'image' | 'video'>('image');

  // Passcode login verification
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginInput.trim() === 'vocals123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('studio_auth', 'true');
      setLoginError('');
      showToast('Welcome to Vocals Studio Suite!', 'success');
    } else {
      setLoginError('Incorrect passcode. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('studio_auth');
    setLoginInput('');
  };

  // Quick Action: Send downloaded track from Tab 1 directly into Tab 2
  const handleSendToVideoCreator = () => {
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
      setActiveTab('tab2');
      showToast('Audio & Thumbnail loaded into Video Creator!', 'success');
    }
  };

  // Render Login Lock screen if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginModal
        loginInput={loginInput}
        setLoginInput={setLoginInput}
        loginError={loginError}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-24 md:pb-12 antialiased selection:bg-emerald-500 selection:text-white">
      {/* GLOBAL TOAST NOTIFICATIONS */}
      <ToastContainer toasts={toasts} />

      {/* TOP HEADER */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setShowSettings(true)}
        onLogout={handleLogout}
      />

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* TAB 1: Download Audio Best Quality */}
        {activeTab === 'tab1' && (
          <AudioDownloaderTab
            rapidApiKey={rapidApiKey}
            showToast={showToast}
            onSendToVideoCreator={handleSendToVideoCreator}
            t1Meta={t1Meta}
            setT1Meta={setT1Meta}
            t1AudioName={t1AudioName}
            setT1AudioName={setT1AudioName}
            t1AudioUrl={t1AudioUrl}
            setT1AudioUrl={setT1AudioUrl}
          />
        )}

        {/* TAB 2: Clean Audio & Create 1080p Video */}
        {activeTab === 'tab2' && (
          <VideoCreatorTab
            t1Meta={t1Meta}
            t1AudioName={t1AudioName}
            t1AudioUrl={t1AudioUrl}
            showToast={showToast}
            t2CleanedName={t2CleanedName}
            setT2CleanedName={setT2CleanedName}
            t2CleanedUrl={t2CleanedUrl}
            setT2CleanedUrl={setT2CleanedUrl}
            t2CustomImageName={t2CustomImageName}
            setT2CustomImageName={setT2CustomImageName}
            t2CustomImageUrl={t2CustomImageUrl}
            setT2CustomImageUrl={setT2CustomImageUrl}
            t2ThumbSourceTitle={t2ThumbSourceTitle}
            setT2ThumbSourceTitle={setT2ThumbSourceTitle}
            t2ThumbLink={t2ThumbLink}
            setT2ThumbLink={setT2ThumbLink}
            t2VisualType={t2VisualType}
            setT2VisualType={setT2VisualType}
          />
        )}

        {/* TAB 3: Groq AI SEO Title & Description */}
        {activeTab === 'tab3' && (
          <AiSeoTab
            groqApiKey={groqApiKey}
            showToast={showToast}
            defaultUrl={t1Meta?.video_id ? `https://www.youtube.com/watch?v=${t1Meta.video_id}` : ''}
          />
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* SETTINGS & API TESTER MODAL */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        rapidApiKey={rapidApiKey}
        setRapidApiKey={setRapidApiKey}
        geminiApiKey={geminiApiKey}
        setGeminiApiKey={setGeminiApiKey}
        groqApiKey={groqApiKey}
        setGroqApiKey={setGroqApiKey}
        showToast={showToast}
      />
    </div>
  );
}
