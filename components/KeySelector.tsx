
import React from 'react';

interface KeySelectorProps {
  onSelected: () => void;
}

export const KeySelector: React.FC<KeySelectorProps> = ({ onSelected }) => {
  const handleOpenSelect = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Assume success as per instructions
      onSelected();
    } catch (err) {
      console.error("Failed to open key selection:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl">
      <div className="max-w-md w-full p-8 rounded-2xl border border-sky-500/30 bg-slate-900 shadow-2xl text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-sky-500/10 rounded-full flex items-center justify-center border border-sky-500/20">
          <svg className="w-10 h-10 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Initialize VidBuddy Core</h2>
          <p className="text-slate-400 text-sm">
            High-fidelity video generation requires a paid API key. Please select a project with billing enabled to proceed.
          </p>
        </div>

        <button
          onClick={handleOpenSelect}
          className="w-full py-3 px-6 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-lg transition-all transform active:scale-95 shadow-lg shadow-sky-500/20"
        >
          Select API Key
        </button>

        <p className="text-xs text-slate-500">
          For more information, visit the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">Gemini API billing documentation</a>.
        </p>
      </div>
    </div>
  );
};
