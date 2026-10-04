export type SimMode = 'shape' | 'flow';

export type TargetContainer = 'all' | 'tumbler' | 'bowl' | 'bottle';

export type SimState = 'idle' | 'pouring' | 'completed';

export type CameraView = 'perspective' | 'front' | 'top' | 'iso';

export interface TeacherGuideContent {
  tabTitle: string;
  subtitle: string;
  steps: string[];
  keyQuestions: string[];
  conclusion: string;
}

export interface ContainerWaterLevel {
  tumbler: number; // 0 to 1
  bowl: number;    // 0 to 1
  bottle: number;  // 0 to 1
}
