import React from 'react';

interface ProjectionDisplayProps {
  isVisible: boolean;
  color: string;
}

export const ProjectionDisplay: React.FC<ProjectionDisplayProps> = ({ isVisible, color }) => {
  if (!isVisible) return null;

  const cards = [
    { title: 'NEURAL_LINK', val: '99.4%', sub: 'SYNC_STABLE', pos: 'top-24 left-10 md:top-1/4 md:left-32' },
    { title: 'RESEARCH_STREAM', val: 'ACTIVE', sub: 'CRAWL_READY', pos: 'top-24 right-10 md:top-1/3 md:right-40' },
    { title: 'DOST_PROTOCOL', val: 'LOCKED', sub: 'v4.2_PRIME', pos: 'bottom-48 left-10 md:bottom-1/4 md:left-40' },
    { title: 'DATA_EQUITY', val: 'ENCRYPTED', sub: 'AES_256_V5', pos: 'bottom-48 right-10 md:bottom-1/3 md:right-32' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {cards.map((card, i) => (
        <div 
          key={i}
          className={`absolute ${card.pos} hologram-card p-6 min-w-[180px] md:min-w-[240px] animate-in fade-in zoom-in slide-in-from-bottom-10 duration-1000 flex flex-col gap-1 border-l-4 group`}
          style={{ animationDelay: `${i * 0.2}s`, borderLeftColor: color }}
        >
          <div className="flex justify-between items-center mb-1">
             <span className="text-[10px] orbitron font-black text-slate-500 uppercase tracking-[0.4em] group-hover:text-cyan-400 transition-colors">{card.title}</span>
             <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }}></div>
          </div>
          <div className="text-2xl md:text-3xl orbitron font-black tracking-tighter text-glow" style={{ color }}>{card.val}</div>
          <div className="mt-4 flex gap-2 h-1.5">
            {[...Array(8)].map((_, j) => (
              <div key={j} className="flex-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full animate-pulse" 
                  style={{ backgroundColor: color, width: `${10 + Math.random() * 90}%`, animationDelay: `${j * 0.15}s` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between items-center">
             <span className="text-[8px] orbitron text-slate-600 font-bold uppercase tracking-widest italic">{card.sub}</span>
             <span className="text-[7px] font-mono text-slate-700 opacity-60">UPLINK_0{i+1}</span>
          </div>
        </div>
      ))}

      {/* DIEGETIC DATA STREAMS */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-[1.5px] h-[1.5px] rounded-full opacity-40 shadow-[0_0_5px_currentColor]"
            style={{
              backgroundColor: color,
              color: color,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-up ${10 + Math.random() * 12}s linear infinite`,
              animationDelay: `${Math.random() * 8}s`
            }}
          ></div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-up {
          0% { transform: translateY(115vh) scale(1); opacity: 0; }
          15% { opacity: 0.5; }
          85% { opacity: 0.3; }
          100% { transform: translateY(-15vh) scale(0.3); opacity: 0; }
        }
      `}} />
    </div>
  );
};