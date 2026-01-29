import React from 'react';
import { N8NWorkflow } from '../types';

interface N8NNodeProps {
  isOpen: boolean;
  onClose: () => void;
  workflows: N8NWorkflow[];
  onTrigger: (workflowId: string) => void;
}

export const N8NNode: React.FC<N8NNodeProps> = ({ isOpen, onClose, workflows, onTrigger }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-10 pointer-events-none">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-3xl pointer-events-auto" onClick={onClose}></div>
      
      <div className="relative w-full max-w-5xl h-[80vh] bg-slate-50 dark:bg-[#0d1117] border border-orange-500/30 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(249,115,22,0.1)] pointer-events-auto flex flex-col animate-in zoom-in duration-500">
        
        {/* HEADER */}
        <div className="h-20 bg-white dark:bg-black flex items-center justify-between px-10 border-b border-orange-500/20 shadow-sm relative z-20">
          <div className="flex items-center gap-6">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)]">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="flex flex-col">
               <span className="text-[14px] orbitron font-black text-slate-800 dark:text-orange-500 tracking-[0.2em] uppercase">N8N_AI_ORCHESTRATOR</span>
               <span className="text-[8px] orbitron text-slate-400 dark:text-orange-900 font-black uppercase">Deep_Intelligence_Workflows</span>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 p-10 overflow-y-auto premium-scroll grid grid-cols-1 md:grid-cols-2 gap-8 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
          {workflows.length === 0 ? (
            <div className="col-span-full h-full flex flex-col items-center justify-center opacity-40 italic py-20">
              <div className="w-20 h-20 border-4 border-dashed border-orange-500/20 rounded-full mb-6 flex items-center justify-center">
                 <svg viewBox="0 0 24 24" className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <span className="text-sm orbitron font-black text-slate-500 uppercase tracking-widest">Awaiting_Workflow_Sync</span>
            </div>
          ) : (
            workflows.map(wf => (
              <div key={wf.id} className="hud-glass p-8 rounded-[2.5rem] border-2 border-orange-500/10 hover:border-orange-500/40 transition-all duration-500 group relative overflow-hidden bg-white/50 dark:bg-black/30">
                 <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-1">
                       <h3 className="text-lg orbitron font-black text-slate-900 dark:text-white uppercase italic tracking-tighter group-hover:text-orange-400 transition-colors">{wf.name}</h3>
                       <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${wf.status === 'EXECUTING' ? 'bg-orange-500 animate-ping' : wf.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                          <span className="text-[8px] orbitron font-bold text-slate-500 uppercase">{wf.status}</span>
                       </div>
                    </div>
                    <button 
                      onClick={() => onTrigger(wf.id)}
                      className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all"
                    >
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                 </div>

                 <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                       {wf.triggers.map((t, idx) => (
                         <span key={idx} className="px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[7px] orbitron font-black text-orange-600 uppercase">{t}</span>
                       ))}
                    </div>
                    <div className="pt-4 border-t border-slate-200 dark:border-white/5 flex justify-between items-center">
                       <span className="text-[8px] orbitron text-slate-400 uppercase">Last_Deployment</span>
                       <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400">{wf.lastRun ? new Date(wf.lastRun).toLocaleString() : 'NEVER'}</span>
                    </div>
                 </div>
              </div>
            ))
          )}
        </div>

        {/* BOTTOM TACTICAL DATA */}
        <div className="h-12 bg-slate-100 dark:bg-black/60 px-10 flex items-center justify-between border-t border-orange-500/10">
           <div className="flex gap-6">
              <span className="text-[8px] orbitron text-slate-400 font-black uppercase">Webhooks: <span className="text-emerald-500">ENCRYPTED</span></span>
              <span className="text-[8px] orbitron text-slate-400 font-black uppercase">Node_Count: <span className="text-orange-500">14_ACTIVE</span></span>
           </div>
           <span className="text-[8px] orbitron text-orange-900 font-black uppercase tracking-[0.5em] italic">AUTONOMOUS_ORCHESTRATION_LAYER_ACTIVE</span>
        </div>
      </div>
    </div>
  );
};