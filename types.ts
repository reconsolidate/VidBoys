
export type GenerationMode = 'T2V' | 'I2V' | 'MORPH';

export interface VidBuddyConfig {
  resolution: '720p' | '1080p';
  aspectRatio: '16:9' | '9:16';
  fps: 24 | 30 | 60;
  motionBucket: number; // 1-10
  creativity: number; // 0-1
}

export interface VidBuddyState {
  physicsEngine: 'Active' | 'Standby';
  audioSync: 'Locked' | 'Unsynced';
  directorMemory: string;
}

export interface GenerationStatus {
  step: 'idle' | 'analyzing' | 'generating' | 'finalizing' | 'complete' | 'error';
  message: string;
  progress?: number;
}

export interface VidBuddyOutput {
  status: VidBuddyState;
  visualOutput: string;
  audioOutput: string;
  videoUrl?: string;
}

declare global {
  // Define AIStudio inside declare global to avoid module-scope shadowing issues with environment-provided types.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Removed readonly to resolve modifier mismatch error with the environment's global declaration of aistudio.
    aistudio: AIStudio;
  }
}
