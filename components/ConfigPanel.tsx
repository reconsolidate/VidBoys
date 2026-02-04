
import React from 'react';
import { VidBuddyConfig } from '../types';

interface ConfigPanelProps {
  config: VidBuddyConfig;
  onChange: (config: VidBuddyConfig) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange }) => {
  const handleChange = (field: keyof VidBuddyConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Resolution</label>
          <select 
            value={config.resolution}
            onChange={(e) => handleChange('resolution', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
          >
            <option value="720p">720p</option>
            <option value="1080p">1080p (Native)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Aspect Ratio</label>
          <select 
            value={config.aspectRatio}
            onChange={(e) => handleChange('aspectRatio', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
          >
            <option value="16:9">16:9 Cinematic</option>
            <option value="9:16">9:16 Portrait</option>
          </select>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Motion Bucket</label>
          <span className="text-xs font-mono text-sky-400">{config.motionBucket}</span>
        </div>
        <input 
          type="range" min="1" max="10" 
          value={config.motionBucket}
          onChange={(e) => handleChange('motionBucket', parseInt(e.target.value))}
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
        />
        <div className="flex justify-between text-[10px] text-slate-600 mt-1 uppercase font-mono">
          <span>Static</span>
          <span>Octane</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Creativity vs Adherence</label>
          <span className="text-xs font-mono text-purple-400">{config.creativity.toFixed(1)}</span>
        </div>
        <input 
          type="range" min="0" max="1" step="0.1"
          value={config.creativity}
          onChange={(e) => handleChange('creativity', parseFloat(e.target.value))}
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
        <div className="flex justify-between text-[10px] text-slate-600 mt-1 uppercase font-mono">
          <span>Strict</span>
          <span>Abstract</span>
        </div>
      </div>
    </div>
  );
};
