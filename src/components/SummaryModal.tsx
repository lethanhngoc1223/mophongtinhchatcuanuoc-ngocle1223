import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, Droplets, ArrowDownRight, Sparkles, RefreshCw } from 'lucide-react';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({ isOpen, onClose, onRestart }) => {
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#60a5fa', '#93c5fd', '#34d399'],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-blue-500/30 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
            <Award className="w-8 h-8 animate-bounce" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 inline-block">
            Ghi nhớ Kiến thức Khoa học Lớp 4
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-200 via-sky-200 to-emerald-200 bg-clip-text text-transparent">
            Kết luận bài học: Tính chất của Nước
          </h2>
        </div>

        {/* Core Scientific Takeaways Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Shape */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-blue-500/30 space-y-2.5 relative overflow-hidden group hover:border-blue-400 transition-all">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                <Droplets className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-blue-300">1. Hình dạng của nước</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Nước là chất lỏng <strong className="text-sky-300">không có hình dạng nhất định</strong>. Khối nước luôn biến đổi hình dạng ôm sát theo đúng vật chứa nó (cốc, bát, chai...).
            </p>
            <div className="p-2 rounded-lg bg-blue-950/40 text-[11px] text-blue-200/80 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Đã kiểm chứng qua thí nghiệm 3D với 3 vật chứa.</span>
            </div>
          </div>

          {/* Card 2: Flow */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-sky-500/30 space-y-2.5 relative overflow-hidden group hover:border-sky-400 transition-all">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                <ArrowDownRight className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-sky-300">2. Dòng chảy của nước</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Nước luôn <strong className="text-sky-300">chảy từ cao xuống thấp</strong> và khi chạm xuống bề mặt phẳng thì <strong className="text-sky-300">chảy lan ra khắp mọi phía</strong>.
            </p>
            <div className="p-2 rounded-lg bg-sky-950/40 text-[11px] text-sky-200/80 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Đã kiểm chứng qua thí nghiệm mặt phẳng nghiêng.</span>
            </div>
          </div>
        </div>

        {/* Additional Lesson Fact Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 to-blue-950/40 border border-slate-800 text-xs sm:text-sm text-slate-300 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <Sparkles className="w-4 h-4" />
            <span>Mở rộng tính chất trong đời sống:</span>
          </div>
          <p className="leading-relaxed text-slate-300/90 text-xs">
            Nước còn là chất lỏng <strong>không màu, không mùi, không vị</strong>, có khả năng <strong>thấm qua một số vật</strong> (khăn, giấy) và <strong>hoà tan một số chất</strong> (muối, đường). Nước giữ vai trò sinh tồn thiết yếu đối với con người, sinh vật và sản xuất!
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={onRestart}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-2 border border-slate-700 transition-all"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
            <span>Thực hiện lại mô phỏng</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/50"
          >
            Hoàn tất bài học
          </button>
        </div>
      </div>
    </div>
  );
};
