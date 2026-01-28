
import React, { useState } from 'react';
import { GitHubRepo, CodeAnalysis } from '../types';
import { GoogleGenAI } from "@google/genai";

interface GitHubNodeProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: (repoUrl: string) => void;
}

export const GitHubNode: React.FC<GitHubNodeProps> = ({ isOpen, onClose, onSync }) => {
  const [repoUrl, setRepoUrl] = useState('https://github.com/moltbot/moltbot.git');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeRepo, setActiveRepo] = useState<GitHubRepo | null>(null);
  const [analysis, setAnalysis] = useState<CodeAnalysis[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<string[]>(["READY_FOR_HANDSHAKE_SIR"]);

  if (!isOpen) return null;

  const log = (msg: string) => setTerminalLogs(prev => [...prev, msg].slice(-10));

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysis([]);
    log("INIT_REMOTE_CRAWL...");
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      log("ESTABLISHING_HTTPS_TUNNEL...");
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analyze the GitHub repository: ${repoUrl}. Provide technical breakdown, security findings, and scaling path.`,
        config: { thinkingConfig: { thinkingBudget: 32768 } }
      });

      log("SYNTHESIZING_METADATA...");

      setActiveRepo({
        owner: 'moltbot', name: 'moltbot', description: 'Advanced automated bot framework.',
        stars: 1240, forks: 432, languages: ['TypeScript', 'Node.js', 'React'], lastSync: Date.now()
      });

      setAnalysis([{
          filePath: 'src/core/engine.ts', language: 'TypeScript',
          issues: ['Complexity bottleneck in neural loop'], optimizations: ['Implement worker threads'],
          content: 'class MoltBotEngine {\n  constructor() {\n    this.initializeNeuralLink();\n  }\n}'
      }]);
      
      log("ANALYSIS_COMPLETE");
      onSync(repoUrl);
    } catch (e) {
      log("ERROR: UPLINK_TIMEOUT");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 pointer-events-none">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[40px] pointer-events-auto" onClick={onClose}></div>
      <div className="relative w-full max-w-6xl h-[85vh] bg-[#0d1117] border border-[#30363d] rounded-[3rem] overflow-hidden flex flex-col pointer-events-auto animate-in zoom-in duration-500">
        <div className="h-16 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
             </div>
             <span className="text-[10px] orbitron font-black text-white tracking-[0.2em]">GITHUB_INTEL</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
        </div>
        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 border-r border-[#30363d] p-6 bg-[#010409] flex flex-col gap-6">
             <input type="text" value={repoUrl} onChange={e => setRepoUrl(e.target.value)} className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-xs font-mono text-gray-200" />
             <button onClick={handleStartAnalysis} disabled={isAnalyzing} className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-black orbitron font-black text-[10px] rounded-xl">{isAnalyzing ? 'SYNTHESIZING...' : 'INIT_AUDIT'}</button>
             <div className="flex-1 font-mono text-[9px] text-emerald-500/80 space-y-1">
                {terminalLogs.map((l, i) => <div key={i}>> {l}</div>)}
             </div>
          </div>
          <div className="flex-1 bg-[#0d1117] p-8 overflow-y-auto">
             {activeRepo && analysis.map((file, i) => (
               <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 mb-6">
                  <div className="text-xs font-mono text-cyan-400 mb-4">{file.filePath}</div>
                  <div className="space-y-4">
                     <div className="text-[10px] text-rose-500 font-bold uppercase">ISSUES: {file.issues.join(', ')}</div>
                     <div className="text-[10px] text-emerald-500 font-bold uppercase">OPTS: {file.optimizations.join(', ')}</div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};
