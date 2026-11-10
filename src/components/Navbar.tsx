import React from 'react';
import { QrCode, FileText, Monitor, BookOpen } from 'lucide-react';

interface NavbarProps {
  currentTab: 'survey' | 'dashboard' | 'guide';
  onSelectTab: (tab: 'survey' | 'dashboard' | 'guide') => void;
  onOpenQR: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenQR
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
            LE
          </div>
          <button
            onClick={() => onSelectTab('dashboard')}
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 hover:text-indigo-600 transition-colors whitespace-nowrap text-left cursor-pointer"
          >
            LiveEval · ประเมินการอบรมสด
          </button>
        </div>

        {/* Zone 2: 3 concise single-line nav links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('survey')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'survey'
                ? 'bg-slate-100 text-indigo-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>แบบประเมิน (มือถือ)</span>
          </button>

          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-slate-100 text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>แดชบอร์ดสด (จอใหญ่)</span>
          </button>

          <button
            onClick={() => onSelectTab('guide')}
            className={`hidden md:flex px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 items-center gap-1.5 cursor-pointer ${
              currentTab === 'guide'
                ? 'bg-slate-100 text-amber-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>โค้ด 2 ไฟล์ & Firebase</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenQR}
            className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 whitespace-nowrap active:scale-95"
            title="แสดง QR Code สำหรับสแกนตอบ"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">สแกน QR Code</span>
            <span className="sm:hidden">QR</span>
          </button>
        </div>
      </div>
    </header>
  );
};
