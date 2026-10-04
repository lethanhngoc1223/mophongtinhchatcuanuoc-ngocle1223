import React, { useState } from 'react';
import { SimMode } from '../types';
import { Sparkles, Maximize2, Minimize2, BookOpen, Layers, Eye, EyeOff, Award } from 'lucide-react';

interface HeaderProps {
  mode: SimMode;
  onSelectMode: (mode: SimMode) => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  onOpenSummary: () => void;
  onToggleTeacherGuide: () => void;
  showTeacherGuide: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onSelectMode,
  showLabels,
  onToggleLabels,
  onOpenSummary,
  onToggleTeacherGuide,
  showTeacherGuide,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-slate-100 z-20">
      {/* App Branding & Grade Badge */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 p-2 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-blue-200 via-sky-200 to-teal-200 bg-clip-text text-transparent">
              Tính chất của Nước
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Khoa học Lớp 4
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Mô phỏng 3D hỗ trợ bài giảng trực quan trên màn hình
          </p>
        </div>
      </div>

      {/* Mode Selection Tabs (2 Main Tabs) */}
      <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 shadow-inner">
        <button
          onClick={() => onSelectMode('shape')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            mode === 'shape'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Tính chất 1: Hình dạng</span>
        </button>

        <button
          onClick={() => onSelectMode('flow')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            mode === 'flow'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Tính chất 2: Dòng chảy</span>
        </button>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {/* Toggle Teacher Guide */}
        <button
          onClick={onToggleTeacherGuide}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
            showTeacherGuide
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
          title="Ẩn/Hiện lời dẫn cho giáo viên"
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span className="hidden md:inline">Lời dẫn GV</span>
        </button>

        {/* Toggle 3D Labels */}
        <button
          onClick={onToggleLabels}
          className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
            showLabels
              ? 'bg-slate-800 text-sky-300 border-sky-500/40'
              : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
          title="Ẩn/Hiện nhãn chú thích 3D"
        >
          {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          <span className="hidden lg:inline">{showLabels ? 'Hiện nhãn' : 'Ẩn nhãn'}</span>
        </button>

        {/* Conclusion / Summary Modal */}
        <button
          onClick={onOpenSummary}
          className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Kết luận bài học</span>
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          title="Bật/Tắt toàn màn hình"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
