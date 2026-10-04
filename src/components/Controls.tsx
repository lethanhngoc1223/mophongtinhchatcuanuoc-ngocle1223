import React from 'react';
import { SimMode, TargetContainer, CameraView } from '../types';
import { Play, RotateCcw, Pause, Sliders, Camera, GlassWater, MoveDown } from 'lucide-react';

interface ControlsProps {
  mode: SimMode;
  isPouring: boolean;
  onTogglePouring: () => void;
  onReset: () => void;
  targetContainer: TargetContainer;
  onSelectContainer: (container: TargetContainer) => void;
  tiltAngle: number;
  onChangeTiltAngle: (angle: number) => void;
  cameraView: CameraView;
  onChangeCameraView: (view: CameraView) => void;
  waterLevels: { tumbler: number; bowl: number; bottle: number };
}

export const Controls: React.FC<ControlsProps> = ({
  mode,
  isPouring,
  onTogglePouring,
  onReset,
  targetContainer,
  onSelectContainer,
  tiltAngle,
  onChangeTiltAngle,
  cameraView,
  onChangeCameraView,
  waterLevels,
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-4xl bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl p-3.5 sm:p-4 text-slate-100 animate-fade-in">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Side: Specific Controls for Mode 1 or Mode 2 */}
        <div className="w-full md:w-auto flex-1 flex flex-col sm:flex-row items-center gap-3">
          {mode === 'shape' ? (
            /* Mode 1: Target Container Selector */
            <div className="w-full sm:w-auto flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <GlassWater className="w-3.5 h-3.5 text-blue-400" />
                <span>Chọn vật chứa để rót nước:</span>
              </span>

              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => onSelectContainer('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    targetContainer === 'all'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  Rót tất cả
                </button>

                <button
                  onClick={() => onSelectContainer('tumbler')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    targetContainer === 'tumbler'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span>🥤 Cốc</span>
                  {waterLevels.tumbler > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-300"></span>
                  )}
                </button>

                <button
                  onClick={() => onSelectContainer('bowl')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    targetContainer === 'bowl'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span>🥣 Bát</span>
                  {waterLevels.bowl > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-300"></span>
                  )}
                </button>

                <button
                  onClick={() => onSelectContainer('bottle')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    targetContainer === 'bottle'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span>🍾 Chai</span>
                  {waterLevels.bottle > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-300"></span>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Mode 2: Incline Slider & Presets */
            <div className="w-full sm:w-auto flex-1 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1">
                  <MoveDown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Độ nghiêng tấm gỗ:</span>
                </span>
                <span className="text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">
                  {tiltAngle}° ({tiltAngle === 0 ? 'Nằm ngang' : tiltAngle < 20 ? 'Dốc nhẹ' : tiltAngle < 35 ? 'Dốc vừa' : 'Dốc cao'})
                </span>
              </div>

              <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
                <input
                  type="range"
                  min="0"
                  max="45"
                  value={tiltAngle}
                  onChange={(e) => onChangeTiltAngle(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />

                <div className="flex items-center gap-1 shrink-0">
                  {[0, 15, 30, 45].map((angle) => (
                    <button
                      key={angle}
                      onClick={() => onChangeTiltAngle(angle)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                        tiltAngle === angle
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {angle}°
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center: Main Pour & Reset Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-center">
          <button
            onClick={onTogglePouring}
            className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
              isPouring
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 ring-2 ring-rose-400/50'
                : 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-blue-600/30 ring-2 ring-sky-400/50'
            }`}
          >
            {isPouring ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Dừng rót nước</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Bắt đầu đổ nước</span>
              </>
            )}
          </button>

          <button
            onClick={onReset}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-slate-700 transition-all active:scale-95"
            title="Làm lại từ đầu"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Làm lại</span>
          </button>
        </div>

        {/* Right Side: Camera View Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <span className="p-1 text-slate-400" title="Đổi góc nhìn Camera">
            <Camera className="w-4 h-4" />
          </span>

          <button
            onClick={() => onChangeCameraView('perspective')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              cameraView === 'perspective'
                ? 'bg-slate-800 text-sky-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Góc nhìn mặc định"
          >
            Mặc định
          </button>

          <button
            onClick={() => onChangeCameraView('front')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              cameraView === 'front'
                ? 'bg-slate-800 text-sky-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Góc nhìn chính diện"
          >
            Chính diện
          </button>

          <button
            onClick={() => onChangeCameraView('top')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              cameraView === 'top'
                ? 'bg-slate-800 text-sky-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Góc nhìn từ trên xuống"
          >
            Từ trên
          </button>
        </div>
      </div>
    </div>
  );
};
