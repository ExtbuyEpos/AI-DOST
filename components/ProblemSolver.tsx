import React from 'react';

interface ProblemSolverProps {
  isOpen: boolean;
  onClose: () => void;
  problems: any[];
}

export const ProblemSolver: React.FC<ProblemSolverProps> = ({ isOpen, onClose, problems }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 md:p-10 pointer-events-none">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-3xl pointer-events-auto" onClick={onClose}></div>
      
      <div className="relative w-full max-w-5xl h-[80vh] bg-[#050a0a] border border-emerald-500/30 rounded-[3.5rem] overflow-hidden shadow-[0_0_150px_rgba(16,185,129,0.15)] pointer-events-auto flex flex-col animate-in zoom-in duration-500">
        
        {/* Header */}
        <div className="h-20 bg-black/60 border-b border-emerald-500/20 flex items-center justify-between px-10">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            </div>
            <div className="flex flex-col">
               <span className="text-[16px] orbitron font-black text-emerald-400 tracking-[0.3em] uppercase">Strategic_Mission_Hub</span>
               <span className="text-[8px] orbitron text-emerald-900 font-black uppercase">Real-Time_Problem_Execution_v1.0</span>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full hover:bg-emerald-500/10 flex items-center justify-center text-emerald-800 hover:text-emerald-400 transition-all">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 p-12 overflow-y-auto premium-scroll grid grid-cols-1 gap-8">
           {problems.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center opacity-30 py-20 grayscale">
                <div className="w-32 h-32 border-2 border-emerald-900 rounded-full flex items-center justify-center animate-pulse">
                   <svg viewBox="0 0 24 24" className="w-16 h-16 text-emerald-800" fill="none" stroke="currentColor" strokeWidth="1"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <span className="text-xl orbitron font-black text-emerald-900 tracking-[1em] mt-10 uppercase">All_Systems_Nominal</span>
             </div>
           ) : (
             problems.map(prob => (
               <div key={prob.id} className="hud-glass p-10 rounded-[3rem] border-emerald-500/20 bg-emerald-500/5 animate-in slide-in-from-bottom-4 duration-700 flex flex-col md:flex-row gap-10 group">
                  <div className="flex-1 space-y-6">
                     <div className="flex justify-between items-center">
                        <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] orbitron font-black text-emerald-400 tracking-widest">TASK_ID: {prob.id}</span>
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                           <span className="text-[10px] orbitron font-black text-emerald-600 uppercase tracking-widest">{prob.status}</span>
                        </div>
                     </div>
                     <h3 className="text-2xl orbitron font-black text-white italic tracking-tighter uppercase group-hover:text-emerald-400 transition-colors">"{prob.text}"</h3>
                     <div className="space-y-4 pt-4 border-t border-emerald-500/10">
                        <span className="text-[10px] orbitron font-black text-emerald-800 uppercase tracking-widest">Execution_Chain</span>
                        <div className="flex flex-col gap-3">
                           {[1, 2, 3].map(i => (
                             <div key={i} className="flex items-center gap-4 text-xs font-mono text-emerald-100/40">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-900"></div>
                                <span>Sub-agent Alpha-0{i}: Mapping neural paths... [OK]</span>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                  <div className="w-full md:w-64 flex flex-col justify-between p-6 bg-black/40 rounded-[2rem] border border-emerald-500/10">
                     <div className="text-center space-y-2">
                        <span className="text-[8px] orbitron text-emerald-800 font-black uppercase">Solving_Coefficient</span>
                        <div className="text-4xl font-mono text-emerald-400 font-black">98.4%</div>
                     </div>
                     <button className="w-full py-4 bg-emerald-600 text-white orbitron font-black text-[10px] rounded-2xl shadow-xl hover:bg-emerald-500 transition-all uppercase tracking-widest">Request_Full_Audit</button>
                  </div>
               </div>
             ))
           )}
        </div>

        {/* Status Bar */}
        <div className="h-10 bg-emerald-950/20 border-t border-emerald-500/10 flex items-center justify-between px-10">
           <span className="text-[8px] orbitron font-bold text-emerald-900 uppercase tracking-widest">DOST_ORCHESTRATOR_L7_ACTIVE</span>
           <div className="flex gap-4">
              <span className="text-[8px] orbitron text-emerald-800 uppercase">Wait_Time: 0.04s</span>
              <span className="text-[8px] orbitron text-emerald-800 uppercase">Priority: OMEGA</span>
           </div>
        </div>
      </div>
    </div>
  );
};