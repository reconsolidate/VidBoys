
import React from 'react';
import { VidBuddyState } from '../types';
import { ICONS } from '../constants';

interface StatusBlockProps {
  state: VidBuddyState;
  isGenerating: boolean;
}

export const StatusBlock: React.FC<StatusBlockProps> = ({ state, isGenerating }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="glass p-4 rounded-xl border border-slate-800 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${state.physicsEngine === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
          <ICONS.Cpu />
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Physics Engine</p>
          <p className={`font-mono text-sm ${state.physicsEngine === 'Active' ? 'text-emerald-400' : 'text-slate-400'}`}>
            [{state.physicsEngine}]
          </p>
        </div>
      </div>

      <div className="glass p-4 rounded-xl border border-slate-800 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${state.audioSync === 'Locked' ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-800 text-slate-500'}`}>
          <ICONS.Activity />
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Audio Sync</p>
          <p className={`font-mono text-sm ${state.audioSync === 'Locked' ? 'text-sky-400' : 'text-slate-400'}`}>
            [{state.audioSync}]
          </p>
        </div>
      </div>

      <div className="glass p-4 rounded-xl border border-slate-800 flex items-center gap-3">
        <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
          <ICONS.Layers />
        </div>
        <div className="overflow-hidden">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Director Memory</p>
          <p className="font-mono text-sm text-purple-400 truncate">
            {isGenerating ? 'Recalling...' : state.directorMemory}
          </p>
        </div>
      </div>
    </div>
  );
};
