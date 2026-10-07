import React from 'react';
import { Download, Video, Sparkles } from 'lucide-react';
import { TabType } from '../../types';

interface MobileNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 flex items-center justify-around shadow-lg">
      <button
        onClick={() => setActiveTab('tab1')}
        className={`flex-1 py-1 flex flex-col items-center gap-0.5 rounded-xl transition-all cursor-pointer ${
          activeTab === 'tab1'
            ? 'text-emerald-600 font-bold'
            : 'text-slate-400 hover:text-slate-600 font-medium'
        }`}
      >
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            activeTab === 'tab1' ? 'bg-emerald-50 text-emerald-600' : ''
          }`}
        >
          <Download className="w-4 h-4" />
        </div>
        <span className="text-[9px]">1. Audio</span>
      </button>

      <button
        onClick={() => setActiveTab('tab2')}
        className={`flex-1 py-1 flex flex-col items-center gap-0.5 rounded-xl transition-all cursor-pointer ${
          activeTab === 'tab2'
            ? 'text-blue-600 font-bold'
            : 'text-slate-400 hover:text-slate-600 font-medium'
        }`}
      >
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            activeTab === 'tab2' ? 'bg-blue-50 text-blue-600' : ''
          }`}
        >
          <Video className="w-4 h-4" />
        </div>
        <span className="text-[9px]">2. Video</span>
      </button>

      <button
        onClick={() => setActiveTab('tab3')}
        className={`flex-1 py-1 flex flex-col items-center gap-0.5 rounded-xl transition-all cursor-pointer ${
          activeTab === 'tab3'
            ? 'text-amber-600 font-bold'
            : 'text-slate-400 hover:text-slate-600 font-medium'
        }`}
      >
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            activeTab === 'tab3' ? 'bg-amber-50 text-amber-600' : ''
          }`}
        >
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="text-[9px]">3. AI SEO</span>
      </button>
    </nav>
  );
};
