
import React, { useState } from 'react';

interface TourStep {
  title: string;
  description: string;
  target?: string;
}

const STEPS: TourStep[] = [
  {
    title: "GERVIS_OMNISCIENT_X",
    description: "Welcome Sir. I am your advanced digital partner. Let's initialize your tactical interface."
  },
  {
    title: "VOICE_MODALITY",
    description: "The central core pulse handles voice commands. Tap to engage my neural link or simply speak when active."
  },
  {
    title: "TACTICAL_MONITOR",
    description: "My OmniMonitor displays real-time visual feeds, workspace broadcasts, and system logs."
  },
  {
    title: "NEURAL_AVATAR",
    description: "Customize my visual identity in the Appearance module. Every modification is synced to my core protocols."
  },
  {
    title: "SYSTEM_HANDBOOK",
    description: "Refer to the Handbook for a full directory of tactical voice commands and protocols."
  }
];

interface OnboardingTourProps {
  isActive: boolean;
  onComplete: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ isActive, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isActive) return null;

  const step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[#010409]/90 backdrop-blur-xl animate-in fade-in duration-500"></div>
      
      {/* SCANNING LINES EFFECT */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 animate-[scan_2s_linear_infinite]"></div>
      </div>

      <div className="relative w-full max-w-lg hud-glass p-10 rounded-[3rem] border-cyan-400/30 text-center flex flex-col gap-6 shadow-[0_0_100px_rgba(34,211,238,0.1)]">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full border-2 border-cyan-500/40 flex items-center justify-center p-2">
            <div className="w-full h-full rounded-full bg-cyan-500/10 animate-pulse flex items-center justify-center">
              <span className="text-xl orbitron font-black text-cyan-400">{currentStep + 1}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl orbitron font-black text-white tracking-[0.3em] uppercase">{step.title}</h2>
          <div className="w-24 h-1 bg-cyan-500 mx-auto rounded-full shadow-[0_0_10px_cyan]"></div>
        </div>

        <p className="text-sm font-mono text-cyan-200/80 leading-relaxed min-h-[4rem]">
          {step.description}
        </p>

        <div className="flex flex-col gap-3 mt-4">
          <button 
            onClick={() => {
              if (currentStep < STEPS.length - 1) setCurrentStep(c => c + 1);
              else onComplete();
            }}
            className="w-full py-4 bg-cyan-500 text-black orbitron font-black text-xs rounded-2xl hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]"
          >
            {currentStep === STEPS.length - 1 ? 'INITIALIZE_INTERFACE' : 'CONTINUE_CALIBRATION'}
          </button>
          
          <button 
            onClick={onComplete}
            className="text-[10px] orbitron font-bold text-slate-500 hover:text-cyan-900 transition-colors"
          >
            SKIP_INIT_SEQUENCE
          </button>
        </div>

        {/* PROGRESS DOTS */}
        <div className="flex justify-center gap-2 mt-4">
          {STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 transition-all duration-500 rounded-full ${i === currentStep ? 'w-8 bg-cyan-400' : 'w-2 bg-slate-800'}`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};
