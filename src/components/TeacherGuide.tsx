import React, { useState } from 'react';
import { SimMode } from '../types';
import { BookOpen, ChevronDown, ChevronUp, Copy, Volume2, Check, HelpCircle, Lightbulb } from 'lucide-react';

interface TeacherGuideProps {
  mode: SimMode;
  show: boolean;
  onClose: () => void;
}

export const TeacherGuide: React.FC<TeacherGuideProps> = ({ mode, show, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);

  if (!show) return null;

  const guideContent = {
    shape: {
      title: 'Chế độ 1: Hình dạng của nước',
      objective: 'Học sinh nhận biết nước là chất lỏng không có hình dạng nhất định mà mang hình dạng của vật chứa.',
      prompts: [
        'Các em hãy chú ý quan sát hình dáng của khối nước khi thầy/cô rót lần lượt vào cốc, bát và chai nhé.',
        'Các em thấy hình dáng của nước trong 3 vật chứa này giống hay khác với hình dáng của chính vật chứa đó?',
        'Từ đó, các em rút ra kết luận gì về hình dạng của nước?',
      ],
      keyObservation: 'Khối nước từ từ dâng lên và ôm sát biên dạng bên trong của từng vật chứa (hình trụ, hình bán cầu, hình chai).',
    },
    flow: {
      title: 'Chế độ 2: Hướng chảy của nước',
      objective: 'Học sinh nhận biết nước luôn chảy từ cao xuống thấp và chảy lan ra khắp mọi phía khi chạm mặt khay.',
      prompts: [
        'Bây giờ, khi thầy/cô nâng cao một đầu tấm gỗ và rót nước, hướng chảy của dòng nước diễn ra như thế nào?',
        'Khi chạm xuống đáy khay nhựa, dòng nước tiếp tục di chuyển ra sao?',
        'Khi chúng ta thay đổi độ nghiêng tấm gỗ dốc hơn, tốc độ và đường đi của dòng nước có gì thay đổi?',
      ],
      keyObservation: 'Dòng nước chảy trượt từ đỉnh dốc tấm gỗ xuống vùng thấp hơn, chạm vào đáy khay và loang đều ra xung quanh.',
    },
  };

  const currentGuide = mode === 'shape' ? guideContent.shape : guideContent.flow;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSpeak = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking === index) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.9; // clear educational rate
    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);

    setIsSpeaking(index);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="absolute top-16 right-4 z-30 w-80 sm:w-96 bg-slate-900/95 border border-amber-500/30 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden transition-all animate-fade-in text-slate-100">
      {/* Panel Header */}
      <div className="bg-gradient-to-r from-amber-950/80 to-slate-900 px-4 py-3 border-b border-amber-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Lời dẫn cho Giáo viên
            </h3>
            <p className="text-[11px] text-amber-200/70 font-medium">{currentGuide.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold px-2"
            title="Đóng panel"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Body Content */}
      {!isCollapsed && (
        <div className="p-4 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Objective Badge */}
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <span className="font-semibold text-amber-300">Mục tiêu quan sát: </span>
              {currentGuide.objective}
            </p>
          </div>

          {/* Prompt Questions */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>Câu hỏi gợi mở trên lớp:</span>
            </h4>

            {currentGuide.prompts.map((prompt, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex items-start justify-between gap-2 group"
              >
                <p className="text-slate-200 leading-snug font-medium text-[12px]">
                  <span className="text-amber-400 font-bold mr-1">{idx + 1}.</span>
                  "{prompt}"
                </p>

                <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={() => handleSpeak(prompt, idx)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      isSpeaking === idx
                        ? 'bg-sky-500/30 text-sky-300 border-sky-400'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
                    }`}
                    title="Đọc câu hỏi bằng giọng đọc"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleCopy(prompt, idx)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 transition-all"
                    title="Sao chép câu hỏi"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Key Observation Note */}
          <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/20 text-blue-200/90 text-[11px] leading-relaxed">
            <span className="font-bold text-sky-300">💡 Điểm cần nhấn mạnh: </span>
            {currentGuide.keyObservation}
          </div>
        </div>
      )}
    </div>
  );
};
