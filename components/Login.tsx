
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const ParticleCore: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: { x: number, y: number, z: number, px: number, py: number, color: string }[] = [];
    const count = 800;
    const radius = 150;

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      particles.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        px: 0, py: 0,
        color: i % 2 === 0 ? '#06b6d4' : '#8b5cf6'
      });
    }

    let angle = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      angle += 0.005;

      particles.forEach(p => {
        // Rotate
        const x1 = p.x * Math.cos(angle) - p.z * Math.sin(angle);
        const z1 = p.x * Math.sin(angle) + p.z * Math.cos(angle);
        const y1 = p.y * Math.cos(angle * 0.5) - z1 * Math.sin(angle * 0.5);
        const z2 = p.y * Math.sin(angle * 0.5) + z1 * Math.cos(angle * 0.5);

        const perspective = 400 / (400 - z2);
        const sx = cx + x1 * perspective;
        const sy = cy + y1 * perspective;

        const size = Math.max(0.5, perspective * 1.5);
        const opacity = (z2 + radius) / (radius * 2);

        ctx.fillStyle = p.color;
        ctx.globalAlpha = opacity * 0.8;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(render);
    };

    render();
  }, []);

  return <canvas ref={canvasRef} width={500} height={500} className="w-full h-full opacity-60" />;
};

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [statusText, setStatusText] = useState('NEURAL_HANDSHAKE_AWAITING');
  const [hasInteracted, setHasInteracted] = useState(false);

  const speakWelcome = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance("Welcome to your AI Dost. Please authenticate to establish a neural link.");
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStartInitialization = () => {
    setHasInteracted(true);
    speakWelcome();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsAuthenticating(true);
    setStatusText('INITIATING_BIOMETRIC_SCAN...');
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 12;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setStatusText('IDENTITY_VERIFIED. MOUNTING_ISOLATED_DB...');
        
        setTimeout(() => {
          onLogin({
            username: username.toLowerCase(),
            id: `usr_${Date.now()}`,
            lastLogin: Date.now()
          });
        }, 1200);
      }
      setScanProgress(progress);
      if (progress > 40 && progress < 80) setStatusText('DECRYPTING_USER_VAULT...');
      if (progress >= 80) setStatusText('ESTABLISHING_L7_TUNNEL...');
    }, 120);
  };

  if (!hasInteracted) {
    return (
      <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black overflow-hidden cursor-pointer" onClick={handleStartInitialization}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#06b6d411,transparent_70%)]"></div>
        <div className="text-center space-y-10 animate-pulse">
           <div className="w-40 h-40 mx-auto rounded-full border-2 border-cyan-500/20 flex items-center justify-center p-4">
              <div className="w-full h-full rounded-full border border-cyan-500/40 animate-ping"></div>
           </div>
           <div>
              <h1 className="text-4xl orbitron font-black text-cyan-500 tracking-[1em] uppercase">AI DOST</h1>
              <p className="text-[10px] orbitron text-slate-500 mt-4 tracking-[0.5em]">CLICK_TO_INITIALIZE_CORE</p>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#010409] overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#06b6d444,transparent_80%)]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="scan-line"></div>
      </div>

      <div className="relative w-full max-w-7xl h-[85vh] flex flex-col lg:flex-row items-center gap-10 p-10 animate-in fade-in zoom-in duration-1000">
        
        {/* LEFT: 3D CORE PREVIEW */}
        <div className="hidden lg:flex flex-1 relative items-center justify-center h-full">
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[500px] h-[500px] relative">
                 <ParticleCore />
                 <div className="absolute inset-0 border-2 border-dashed border-cyan-500/10 rounded-full animate-[spin_30s_linear_infinite]"></div>
                 <div className="absolute inset-10 border border-cyan-500/5 rounded-full animate-[spin_20s_linear_infinite_reverse]"></div>
              </div>
           </div>
           
           <div className="absolute bottom-10 left-0 space-y-4">
              <div className="flex items-center gap-4 bg-black/40 px-6 py-3 rounded-2xl border border-cyan-500/20 backdrop-blur-xl">
                 <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></div>
                 <span className="text-[11px] orbitron font-black text-white tracking-widest uppercase">AI_DOST_PRIME_CORE</span>
              </div>
              <p className="text-[13px] font-mono text-cyan-700/60 leading-relaxed italic max-w-sm">
                "Your strategic companion is ready. Each user session is encapsulated in a Tier-4 isolated neural database."
              </p>
           </div>
        </div>

        {/* RIGHT: SECURE LOGIN NODE */}
        <div className="w-full max-w-lg flex flex-col gap-10">
          <div className="text-center lg:text-left space-y-2">
            <h1 className="text-6xl orbitron font-black text-white tracking-tight italic uppercase drop-shadow-[0_0_30px_rgba(6,182,212,0.4)]">LOGIN</h1>
            <p className="text-[11px] orbitron text-cyan-800 font-bold uppercase tracking-[0.5em]">Secure_Interface_v5.5</p>
          </div>

          <div className="hud-glass p-12 rounded-[4rem] border-cyan-500/20 shadow-[0_0_120px_rgba(0,0,0,0.8)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-40"></div>
            
            {isAuthenticating ? (
              <div className="py-14 flex flex-col items-center gap-12">
                 <div className="relative w-56 h-56 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-cyan-500/10 rounded-full"></div>
                    <div 
                      className="absolute inset-0 border-t-4 border-cyan-500 rounded-full transition-all duration-300"
                      style={{ transform: `rotate(${scanProgress * 3.6}deg)` }}
                    ></div>
                    <div className="flex flex-col items-center">
                       <span className="text-4xl orbitron font-black text-white">{Math.floor(scanProgress)}%</span>
                       <span className="text-[8px] orbitron text-cyan-600 font-bold tracking-widest mt-2 uppercase">Syncing...</span>
                    </div>
                 </div>
                 <div className="text-center space-y-4">
                   <div className="text-[11px] orbitron text-cyan-400 font-black tracking-[0.3em] uppercase animate-pulse">{statusText}</div>
                   <div className="flex gap-2 justify-center">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="w-1 h-8 bg-cyan-500/20 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400 animate-bounce" style={{ animationDelay: `${i*0.1}s` }}></div>
                        </div>
                      ))}
                   </div>
                 </div>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="flex flex-col gap-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-4">
                       <label className="text-[10px] orbitron text-cyan-800 font-black uppercase tracking-widest">User_Handle</label>
                       <span className="text-[7px] orbitron text-slate-700 font-black uppercase">Field_Required</span>
                    </div>
                    <input 
                      type="text" 
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                      placeholder="ENTER_ID"
                      className="w-full bg-black/60 border-2 border-white/5 rounded-[1.5rem] px-8 py-5 text-white font-mono text-sm outline-none focus:border-cyan-500/40 focus:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all placeholder:text-cyan-950/40"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-4">
                       <label className="text-[10px] orbitron text-cyan-800 font-black uppercase tracking-widest">Neural_Key</label>
                       <span className="text-[7px] orbitron text-slate-700 font-black uppercase">Encrypted_Input</span>
                    </div>
                    <input 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-black/60 border-2 border-white/5 rounded-[1.5rem] px-8 py-5 text-white font-mono text-sm outline-none focus:border-cyan-500/40 focus:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all placeholder:text-cyan-950/40"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-6 bg-cyan-600 hover:bg-cyan-500 text-white orbitron font-black text-xs rounded-3xl shadow-[0_25px_50px_rgba(6,182,212,0.25)] transition-all hover:scale-[1.03] active:scale-95 uppercase tracking-[0.4em] flex items-center justify-center gap-4 group"
                >
                  Mount_Identity
                  <svg viewBox="0 0 24 24" className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>

                <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                   <div className="flex justify-between items-center text-[8px] orbitron font-bold text-cyan-900 uppercase tracking-widest">
                      <span>Database_Partition: SECURE_V5</span>
                      <span>Latency: 14ms</span>
                   </div>
                   <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-900 w-3/4"></div>
                   </div>
                </div>
              </form>
            )}
          </div>

          <div className="text-center opacity-30 px-10">
            <p className="text-[10px] orbitron text-cyan-950 font-black tracking-[0.5em] uppercase leading-relaxed">
              Global Distributed Neural Network Architecture // P2P Encryption Active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
