
import React from 'react';

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
  onOpenFeedback: () => void;
}

export const HelpPanel: React.FC<HelpPanelProps> = ({ isOpen, onClose, onStartTour, onOpenFeedback }) => {
  if (!isOpen) return null;

  const sections = [
    {
      title: "VOICE_COMMENDS [PR]",
      items: [
        { cmd: "Initiate neural training", desc: "Launch an AI model refinement session." },
        { cmd: "Capture master screen", desc: "Enable real-time workspace visual uplink." },
        { cmd: "Generate cinematic video", desc: "Trigger Veo 3.1 neural video synthesis." },
        { cmd: "Switch optics", desc: "Toggle between user and environment camera feeds." },
        { cmd: "Deploy autonomous agent", desc: "Spawn a sub-routine for complex debugging or research." },
        { cmd: "Run system diagnosis", desc: "Activate Doctor Mode to auto-repair system links." }
      ]
    },
    {
      title: "NEURAL_AVATAR_MODS",
      items: [
        { cmd: "Neural Gen", desc: "Use AI to synthesize unique accessories or theme colors." },
        { cmd: "Full AI Synth", desc: "Generate a complete 2.5D visual identity for Gervis." },
        { cmd: "Aura Chroma", desc: "Change the system-wide visual wavelength (theme color)." }
      ]
    },
    {
      title: "TACTICAL_CORE",
      items: [
        { cmd: "OmniMonitor", desc: "Live multi-feed visual monitoring with mag-zoom support." },
        { cmd: "Media Vault", desc: "Secure storage for all AI-synthesized visual assets." },
        { cmd: "Doctor Mode", desc: "Self-healing protocols for network and neural stability." }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 md:p-10 pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl pointer-events-auto" onClick={onClose}></div>
      
      <div className="relative w-full max-w-3xl bg-black/90 border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(34,211,238,0.2)] pointer-events-auto flex flex-col p-6 md:p-10 gap-6 animate-in zoom-in duration-500 max-h-[85vh]">
        
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-cyan-500/20 pb-6">
          <div className="flex flex-col">
            <h2 className="text-xl md:text-2xl orbitron font-black text-white tracking-[0.2em] uppercase italic">
              TACTICAL_HANDBOOK_V4
            </h2>
            <span className="text-[8px] orbitron font-bold text-cyan-600 uppercase tracking-widest">Gervis_X Operational Protocol</span>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full border border-cyan-500/40 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all">
             <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* ACTION TOOLS */}
        <div className="grid grid-cols-2 gap-4">
           <button 
            onClick={onStartTour}
            className="flex items-center justify-center gap-3 py-4 hud-glass rounded-xl border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all group"
           >
             <div className="w-8 h-8 rounded-full border border-cyan-500 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-all">
               <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
             </div>
             <span className="text-[10px] orbitron font-black text-cyan-400">INITIALIZE_TOUR</span>
           </button>
           <button 
            onClick={onOpenFeedback}
            className="flex items-center justify-center gap-3 py-4 hud-glass rounded-xl border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all group"
           >
             <div className="w-8 h-8 rounded-full border border-orange-500 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-black transition-all">
               <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
             </div>
             <span className="text-[10px] orbitron font-black text-orange-500">REPORT_ANOMALY</span>
           </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-8 pr-2">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-4 h-1 bg-cyan-500"></div>
                 <h3 className="text-xs orbitron font-black text-cyan-400 tracking-[0.3em] uppercase">{section.title}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.items.map((item, i) => (
                  <div key={i} className="hud-glass p-3 rounded-xl border-cyan-500/10 hover:border-cyan-500/30 transition-all group">
                    <div className="text-[10px] orbitron font-black text-white group-hover:text-cyan-400 transition-colors">"{item.cmd.toUpperCase()}"</div>
                    <div className="text-[8px] font-mono text-cyan-700 mt-1 uppercase tracking-tight">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="pt-6 border-t border-cyan-500/20 text-center">
           <div className="text-[7px] orbitron text-cyan-900 font-bold tracking-[0.5em] uppercase opacity-60">
             Note: Gervis X responds to natural language intent. Literal commands are not required.
           </div>
        </div>
      </div>
    </div>
  );
};
