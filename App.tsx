
import React, { useState, useEffect, useRef } from 'react';
import { KeySelector } from './components/KeySelector';
import { StatusBlock } from './components/StatusBlock';
import { ConfigPanel } from './components/ConfigPanel';
import { ICONS, INITIAL_STATE, DEFAULT_CONFIG } from './constants';
import { 
  GenerationMode, 
  VidBuddyConfig, 
  VidBuddyState, 
  GenerationStatus,
  VidBuddyOutput 
} from './types';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [mode, setMode] = useState<GenerationMode>('T2V');
  const [prompt, setPrompt] = useState('');
  const [imageA, setImageA] = useState<string | null>(null);
  const [config, setConfig] = useState<VidBuddyConfig>(DEFAULT_CONFIG);
  const [vState, setVState] = useState<VidBuddyState>(INITIAL_STATE);
  const [status, setStatus] = useState<GenerationStatus>({ step: 'idle', message: 'Engine Standby' });
  const [output, setOutput] = useState<VidBuddyOutput | null>(null);
  const [history, setHistory] = useState<VidBuddyOutput[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const visualizerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      const exists = await window.aistudio.hasSelectedApiKey();
      setHasKey(exists);
    };
    checkKey();

    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!visualizerRef.current) return;
    if (!document.fullscreenElement) {
      visualizerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageA(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && mode === 'T2V') return;
    
    setStatus({ step: 'analyzing', message: 'Director Agent evaluating physics...' });
    setOutput(null);

    try {
      // Step 1: Director Agent Reasoning
      const agentResponse = await geminiService.processDirectorAgent(prompt || 'Animate the provided frame', config);
      setVState(agentResponse.status);
      setOutput({ ...agentResponse, videoUrl: undefined });

      // Step 2: Veo Video Generation
      setStatus({ step: 'generating', message: 'Initializing World Model...' });
      
      let videoUrl: string;
      if (mode === 'I2V' && imageA) {
        const base64 = imageA.split(',')[1];
        videoUrl = await geminiService.generateVideoI2V(
          base64, 
          agentResponse.visualOutput, 
          config, 
          (msg) => setStatus(s => ({ ...s, message: msg }))
        );
      } else {
        videoUrl = await geminiService.generateVideo(
          agentResponse.visualOutput, 
          config, 
          (msg) => setStatus(s => ({ ...s, message: msg }))
        );
      }

      const finalOutput = { ...agentResponse, videoUrl };
      setOutput(finalOutput);
      setHistory(prev => [finalOutput, ...prev].slice(0, 5));
      setStatus({ step: 'complete', message: 'Simulation Finalized' });
    } catch (err: any) {
      console.error(err);
      // Check for specifically handled error messages as per API documentation guidelines
      const isNotFoundError = err.message?.includes('Requested entity was not found.') || err.message?.includes('404');
      setStatus({ 
        step: 'error', 
        message: isNotFoundError ? 'Requested entity was not found. Please re-select API Key.' : 'Generation failed. Check console.' 
      });
      if (isNotFoundError) {
        setHasKey(false);
      }
    }
  };

  if (hasKey === false) {
    return <KeySelector onSelected={() => setHasKey(true)} />;
  }

  if (hasKey === null) {
    return <div className="h-screen flex items-center justify-center text-sky-400 mono">BOOTING VIDBUDDY CORE...</div>;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500 rounded-lg shadow-lg shadow-sky-500/20">
            <ICONS.Play />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              VIDBUDDY <span className="text-[10px] px-1.5 py-0.5 rounded border border-sky-500/30 text-sky-400 font-mono">v1.0</span>
            </h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">Generative World Model</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.aistudio.openSelectKey().then(() => setHasKey(true))}
            className="text-[10px] text-slate-500 hover:text-sky-400 transition-colors mono uppercase"
          >
            Relink Core
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Console */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-6 rounded-2xl border border-slate-800 neon-border">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <ICONS.Settings /> Director Console
            </h3>
            
            {/* Mode Selector */}
            <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 mb-6">
              {(['T2V', 'I2V'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === m ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  {m === 'T2V' ? 'Text' : 'Image'}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="space-y-4">
              {mode === 'I2V' && (
                <div className="relative group">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden
                      ${imageA ? 'border-sky-500/50' : 'border-slate-800 hover:border-sky-500/30'}`}
                  >
                    {imageA ? (
                      <img src={imageA} className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <>
                        <ICONS.Camera />
                        <span className="text-xs text-slate-500 mt-2">Upload Keyframe A</span>
                      </>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Prompt Intent</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={mode === 'T2V' ? "A futuristic city in the clouds..." : "Animate this scene with gentle camera zoom..."}
                  className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-sm text-white focus:border-sky-500 outline-none resize-none"
                />
              </div>

              <ConfigPanel config={config} onChange={setConfig} />

              <button
                disabled={status.step !== 'idle' && status.step !== 'complete' && status.step !== 'error'}
                onClick={handleGenerate}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95
                  ${status.step === 'generating' ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20'}`}
              >
                {status.step === 'idle' || status.step === 'complete' || status.step === 'error' ? (
                  <><ICONS.Play /> Initiate Simulation</>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* History Panel */}
          {history.length > 0 && (
            <div className="glass p-6 rounded-2xl border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-4">Sequence History</h3>
              <div className="space-y-3">
                {history.map((item, i) => (
                  <div key={i} className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 text-[11px] mono flex items-center justify-between">
                    <span className="text-slate-400 truncate max-w-[150px]">{item.visualOutput}</span>
                    <button 
                      onClick={() => setOutput(item)}
                      className="text-sky-400 hover:text-sky-300"
                    >
                      Recall
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Output & Status */}
        <div className="lg:col-span-8 space-y-6">
          <StatusBlock state={vState} isGenerating={status.step === 'generating'} />

          {/* Main Visualizer */}
          <div 
            ref={visualizerRef}
            className={`glass rounded-3xl border border-slate-800 overflow-hidden relative shadow-2xl transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-[100] rounded-none' : 'aspect-video'}`}
          >
            {output?.videoUrl ? (
              <video 
                src={output.videoUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full h-full object-cover"
              />
            ) : status.step === 'generating' || status.step === 'analyzing' ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950">
                <div className="relative w-32 h-32 mb-8">
                  <div className="absolute inset-0 border-4 border-sky-500/20 rounded-full animate-ping" />
                  <div className="absolute inset-4 border-4 border-sky-500/40 rounded-full animate-pulse" />
                  <div className="absolute inset-8 border-4 border-sky-500 rounded-full shadow-[0_0_20px_rgba(56,189,248,0.5)]" />
                </div>
                <p className="text-sky-400 mono animate-pulse font-bold">{status.message}</p>
                <div className="mt-8 flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={`w-1 h-8 bg-sky-500 rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-950">
                <div className="p-6 border-2 border-dashed border-slate-800 rounded-full mb-4">
                  <ICONS.Play />
                </div>
                <p className="text-sm mono">Awaiting System Initialization...</p>
                <p className="text-[10px] text-slate-700 mt-2 uppercase tracking-widest">Physics Buffer: Clear</p>
              </div>
            )}

            {/* Overlay Info */}
            <div className="absolute top-4 left-4 p-2 px-3 bg-black/40 backdrop-blur rounded-lg border border-white/10 text-[10px] mono text-white/70 pointer-events-none">
              {config.resolution} • {config.fps}FPS • {vState.audioSync === 'Locked' ? 'SYNCED' : 'MONO'}
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur rounded-lg border border-white/10 text-white/70 hover:text-white hover:bg-black/60 transition-all z-10"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <ICONS.Minimize /> : <ICONS.Fullscreen />}
            </button>
          </div>

          {/* Breakdown / Metadata */}
          {output && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass p-6 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" /> Visual Simulation Parameters
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  "{output.visualOutput}"
                </p>
              </div>
              <div className="glass p-6 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-sky-500" /> Audio Synthesizer Logic
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  "{output.audioOutput}"
                </p>
              </div>
            </div>
          )}

          {status.step === 'error' && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mono">
              CRITICAL ERROR: {status.message}
            </div>
          )}
        </div>
      </main>

      <footer className="mt-12 py-8 border-t border-slate-900 text-center text-[10px] text-slate-600 mono uppercase tracking-widest">
        SYSTEM POWERED BY GEMINI VEO CORE • WORLD MODEL PHYSICS v4.5 STABLE
      </footer>
    </div>
  );
};

export default App;
