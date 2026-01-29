
import React, { useState, useEffect } from 'react';
import { MasterProject } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface MasterBuilderNodeProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectUpdate?: (project: MasterProject) => void;
}

export const MasterBuilderNode: React.FC<MasterBuilderNodeProps> = ({ isOpen, onClose, onProjectUpdate }) => {
  const [target, setTarget] = useState<'WEB' | 'IOS' | 'ANDROID' | 'WINDOWS'>('WEB');
  const [requirement, setRequirement] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [activeProject, setActiveProject] = useState<MasterProject | null>(null);
  const [statusText, setStatusText] = useState('AWAITING_INSTRUCTION');

  const handleBuild = async () => {
    if (!requirement.trim()) return;
    setIsBuilding(true);
    setStatusText("CRAWLING_DEEP_INTERNET_FOR_ASSETS...");
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      // Step 1: Logic Mapping & Roadmap Generation
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a Master Software Architect. Build a full ${target} project for: "${requirement}". 
        Analyze the best tech stack using Deep Internet trends. 
        Provide a comprehensive roadmap and security measures for production.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              projectName: { type: Type.STRING },
              roadmap: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phase: { type: Type.STRING },
                    details: { type: Type.STRING },
                    completed: { type: Type.BOOLEAN }
                  }
                }
              },
              intel: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    source: { type: Type.STRING },
                    data: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      const newProject: MasterProject = {
        id: `prj_${Date.now()}`,
        name: data.projectName || "Unnamed_System",
        target,
        status: 'SYNTHESIZING',
        progress: 10,
        roadmap: data.roadmap || [],
        intel: data.intel || []
      };
      
      setActiveProject(newProject);
      if (onProjectUpdate) onProjectUpdate(newProject);

      // Simulate the build phases
      const phases = ['MAPPING', 'EXTRACTING', 'COMPLETE'];
      for (let i = 0; i < phases.length; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const status = phases[i] as any;
        const progress = 30 + (i * 25);
        setActiveProject(p => p ? { ...p, status, progress } : null);
        setStatusText(`EXECUTING_${status}_PHASE...`);
      }
      
      setStatusText("FULL_PROJECT_SYNTHESIS_COMPLETE");
    } catch (e) {
      setStatusText("SYNTHESIS_FAILED: PROTOCOL_ABORTED");
    } finally {
      setIsBuilding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center p-2 md:p-8 pointer-events-none">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-[60px] pointer-events-auto" onClick={onClose}></div>
      
      <div className="relative w-full max-w-7xl h-[90vh] bg-[#020408] border border-cyan-500/30 rounded-[4rem] overflow-hidden shadow-[0_0_120px_rgba(6,182,212,0.15)] pointer-events-auto flex flex-col animate-in zoom-in duration-500">
        
        {/* HEADER */}
        <div className="h-24 bg-cyan-950/10 border-b border-cyan-500/20 flex items-center justify-between px-12 relative z-10">
          <div className="flex items-center gap-8">
            <div className="w-14 h-14 bg-cyan-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] relative overflow-hidden">
               <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
               <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div className="flex flex-col">
               <span className="text-[16px] orbitron font-black text-white tracking-[0.4em] uppercase italic">MASTER_DEV_CORE</span>
               <span className="text-[8px] orbitron text-cyan-700 font-bold uppercase tracking-widest">Autonomous_Full_Stack_Synthesis_v9.0</span>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-all">
             <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* CONTROL SIDEBAR */}
          <div className="w-full md:w-96 border-r border-cyan-500/10 bg-black/40 p-10 flex flex-col gap-10">
             <div className="space-y-6">
                <span className="text-[10px] orbitron text-cyan-800 font-black uppercase tracking-widest block italic">Target_Platform</span>
                <div className="grid grid-cols-2 gap-4">
                   {(['WEB', 'IOS', 'ANDROID', 'WINDOWS'] as const).map(t => (
                     <button 
                        key={t}
                        onClick={() => setTarget(t)}
                        className={`py-4 rounded-2xl orbitron text-[10px] font-black transition-all border-2 ${target === t ? 'bg-cyan-600 text-white border-cyan-400 shadow-lg scale-105' : 'bg-white/5 border-white/5 text-slate-500 hover:border-cyan-500/30'}`}
                     >
                       {t}
                     </button>
                   ))}
                </div>
             </div>

             <div className="space-y-6 flex-1 flex flex-col">
                <span className="text-[10px] orbitron text-cyan-800 font-black uppercase tracking-widest block italic">System_Requirements</span>
                <textarea 
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  placeholder="e.g. Build a high-performance e-commerce platform with real-time analytics and global payments..."
                  className="flex-1 bg-black border-2 border-white/5 rounded-[2.5rem] p-8 text-sm font-mono text-cyan-100 outline-none focus:border-cyan-500/40 transition-all placeholder:text-cyan-950 resize-none leading-relaxed"
                />
             </div>

             <button 
                onClick={handleBuild}
                disabled={isBuilding || !requirement.trim()}
                className="w-full py-6 bg-cyan-600 hover:bg-cyan-500 text-white orbitron font-black text-xs rounded-3xl shadow-[0_20px_50px_rgba(6,182,212,0.3)] transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-[0.3em] disabled:opacity-30 relative overflow-hidden group"
             >
                <span className="relative z-10">{isBuilding ? 'SYNTHESIZING...' : 'EXECUTE_FULL_BUILD'}</span>
                {!isBuilding && <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>}
             </button>
          </div>

          {/* MONITORING AREA */}
          <div className="flex-1 p-12 overflow-y-auto premium-scroll flex flex-col gap-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5 relative">
             <div className="absolute top-0 right-12 py-4">
                <div className="flex items-center gap-3 px-6 py-2 bg-cyan-500/5 border border-cyan-500/20 rounded-full">
                   <div className={`w-2 h-2 rounded-full ${isBuilding ? 'bg-orange-500 animate-ping' : 'bg-emerald-500'}`}></div>
                   <span className="text-[10px] orbitron font-black text-cyan-600 uppercase tracking-widest">{statusText}</span>
                </div>
             </div>

             {!activeProject ? (
               <div className="h-full flex flex-col items-center justify-center opacity-10 select-none grayscale scale-95 pointer-events-none">
                  <div className="w-64 h-64 border-4 border-dashed border-cyan-500/20 rounded-full flex items-center justify-center animate-[spin_40s_linear_infinite]">
                     <svg viewBox="0 0 24 24" className="w-32 h-32 text-cyan-500" fill="none" stroke="currentColor" strokeWidth="0.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                  </div>
                  <span className="orbitron font-black text-4xl tracking-[1em] mt-12 uppercase">Awaiting_Input</span>
               </div>
             ) : (
               <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <div className="flex flex-col gap-3">
                     <span className="text-[12px] orbitron font-black text-cyan-800 uppercase tracking-[0.4em]">Project_Identity: {activeProject.id}</span>
                     <h2 className="text-5xl orbitron font-black text-white italic tracking-tighter uppercase border-l-8 border-cyan-600 pl-10">{activeProject.name}</h2>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                     <div className="xl:col-span-2 space-y-10">
                        <div className="hud-glass p-10 rounded-[4rem] border-cyan-500/20 bg-cyan-950/5 flex flex-col gap-8">
                           <div className="flex justify-between items-center">
                              <span className="text-[14px] orbitron font-black text-cyan-400 tracking-widest uppercase italic">Logic_Roadmap</span>
                              <span className="text-3xl font-mono text-white font-black">{activeProject.progress}%</span>
                           </div>
                           <div className="w-full h-3 bg-cyan-950 rounded-full overflow-hidden border border-white/5">
                              <div className="h-full bg-gradient-to-r from-cyan-600 to-indigo-500 transition-all duration-1000 shadow-[0_0_30px_#06b6d4]" style={{ width: `${activeProject.progress}%` }}></div>
                           </div>
                           <div className="space-y-6 mt-4">
                              {activeProject.roadmap.map((step, idx) => (
                                <div key={idx} className={`p-6 rounded-[2rem] border-2 transition-all flex items-start gap-6 ${step.completed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-black/40 border-white/5 opacity-60'}`}>
                                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${step.completed ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-slate-800 text-slate-700'}`}>
                                      {step.completed ? <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg> : <span className="orbitron font-black text-xs">{idx+1}</span>}
                                   </div>
                                   <div className="flex flex-col gap-1">
                                      <span className="text-[14px] orbitron font-black text-white uppercase tracking-tighter">{step.phase}</span>
                                      <p className="text-xs font-mono text-slate-500 leading-relaxed italic">"{step.details}"</p>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-col gap-8">
                        <div className="hud-glass p-8 rounded-[3rem] border-indigo-500/20 bg-indigo-950/5 space-y-6">
                           <span className="text-[10px] orbitron font-black text-indigo-400 tracking-widest uppercase italic">Deep_Internet_Intel</span>
                           <div className="space-y-4">
                              {activeProject.intel.map((i, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-black/40 border border-indigo-500/10 group hover:border-indigo-400 transition-all">
                                   <span className="text-[8px] orbitron text-indigo-700 font-black uppercase mb-1 block">Source: {i.source}</span>
                                   <p className="text-[10px] font-mono text-indigo-100/60 italic leading-relaxed line-clamp-3">"{i.data}"</p>
                                </div>
                              ))}
                           </div>
                        </div>

                        <div className="hud-glass p-8 rounded-[3rem] border-rose-500/20 bg-rose-950/5 space-y-4">
                           <div className="flex items-center gap-3">
                              <svg viewBox="0 0 24 24" className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                              <span className="text-[10px] orbitron font-black text-rose-500 tracking-widest uppercase">Dark_Web_Hardening</span>
                           </div>
                           <p className="text-[11px] font-mono text-rose-200/50 leading-relaxed italic pl-2 border-l-2 border-rose-500/20">
                             Applying multi-layer node encryption discovered in decentralized networks to prevent unauthorized OS intercept.
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
