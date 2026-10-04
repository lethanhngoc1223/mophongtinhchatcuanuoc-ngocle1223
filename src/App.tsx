import { useState } from 'react';
import { SimMode, TargetContainer, CameraView } from './types';
import { Header } from './components/Header';
import { TeacherGuide } from './components/TeacherGuide';
import { Controls } from './components/Controls';
import { SummaryModal } from './components/SummaryModal';
import { LabScene } from './components/3d/LabScene';

export default function App() {
  // Mode Selection: Tab 1 (Shape) vs Tab 2 (Flow)
  const [mode, setMode] = useState<SimMode>('shape');

  // Simulation State
  const [isPouring, setIsPouring] = useState<boolean>(false);
  const [tiltAngle, setTiltAngle] = useState<number>(20); // Default 20 deg incline
  const [targetContainer, setTargetContainer] = useState<TargetContainer>('all');
  const [cameraView, setCameraView] = useState<CameraView>('perspective');

  // Water fill levels for Tab 1
  const [waterLevels, setWaterLevels] = useState<{ tumbler: number; bowl: number; bottle: number }>({
    tumbler: 0,
    bowl: 0,
    bottle: 0,
  });

  // UI Visibility Toggles
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showTeacherGuide, setShowTeacherGuide] = useState<boolean>(true);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);

  // Handlers
  const handleSelectMode = (newMode: SimMode) => {
    setMode(newMode);
    setIsPouring(false);
  };

  const handleTogglePouring = () => {
    setIsPouring((prev) => !prev);
  };

  const handleReset = () => {
    setIsPouring(false);
    setWaterLevels({ tumbler: 0, bowl: 0, bottle: 0 });
    setTiltAngle(20);
  };

  const handlePourComplete = () => {
    setIsPouring(false);
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none">
      {/* Top Header Bar */}
      <Header
        mode={mode}
        onSelectMode={handleSelectMode}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels((prev) => !prev)}
        onOpenSummary={() => setShowSummaryModal(true)}
        onToggleTeacherGuide={() => setShowTeacherGuide((prev) => !prev)}
        showTeacherGuide={showTeacherGuide}
      />

      {/* Main 3D Simulation Canvas Area */}
      <main className="relative flex-1 w-full h-full overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
        <LabScene
          mode={mode}
          isPouring={isPouring}
          tiltAngle={tiltAngle}
          targetContainer={targetContainer}
          cameraView={cameraView}
          onPourComplete={handlePourComplete}
          waterLevels={waterLevels}
          onUpdateWaterLevels={setWaterLevels}
          showLabels={showLabels}
        />

        {/* Floating Teacher Guidance Drawer */}
        <TeacherGuide
          mode={mode}
          show={showTeacherGuide}
          onClose={() => setShowTeacherGuide(false)}
        />

        {/* Bottom Interactive Control Bar */}
        <Controls
          mode={mode}
          isPouring={isPouring}
          onTogglePouring={handleTogglePouring}
          onReset={handleReset}
          targetContainer={targetContainer}
          onSelectContainer={(container) => {
            setTargetContainer(container);
            setIsPouring(false);
          }}
          tiltAngle={tiltAngle}
          onChangeTiltAngle={setTiltAngle}
          cameraView={cameraView}
          onChangeCameraView={setCameraView}
          waterLevels={waterLevels}
        />
      </main>

      {/* Lesson Summary & Takeaways Modal */}
      <SummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        onRestart={() => {
          setShowSummaryModal(false);
          handleReset();
        }}
      />
    </div>
  );
}
