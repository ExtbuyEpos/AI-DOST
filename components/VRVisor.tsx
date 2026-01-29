import React, { useEffect, useState } from 'react';

interface VRVisorProps {
  isActive: boolean;
  color: string;
}

export const VRVisor: React.FC<VRVisorProps> = ({ isActive, color }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[500] pointer-events-none transition-opacity duration-1000 animate-in fade-in">
      {/* Heavy Vignetting & Visor Curve */}
      <div className="vr-mode-overlay"></div>
      
      {/* Dynamic Data Stream Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-particle ${5 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              transform: `translate(${offset.x * (i%3+1)}px, ${offset.y * (i%3+1)}px)`
            }}
          ></div>
        ))}
      </div>

      {/* Visor HUD Elements */}
      <div className="absolute inset-x-12 inset-y-12 border-2 border-white/5 rounded-[4rem] pointer-events-none flex flex-col justify-between p-10">
         <div className="flex justify-between items-start">
            <div className="flex flex-col gap-2">
               <span className="text-[10px] orbitron font-black text-white/20 uppercase tracking-[0.5em]">IMMERSE_MODE_V1.4</span>
               <div className="flex gap-2">
                  <div className="w-10 h-1 bg-white/10 rounded-full"></div>
                  <div className="w-6 h-1 bg-white/5 rounded-full"></div>
               </div>
            </div>
            <div className="text-right">
               <span className="text-[10px] orbitron font-black text-white/20 uppercase tracking-[0.5em]">VR_UPLINK_STABLE</span>
               <div className="flex justify-end gap-1 mt-1">
                  {[...Array(4)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/5"></div>)}
               </div>
            </div>
         </div>

         <div className="flex justify-between items-end">
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border border-white/10 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-[8px] orbitron text-white/10 font-black tracking-widest uppercase">Depth_Mapping_Active</span>
               </div>
            </div>
            <div className="flex flex-col items-end gap-1">
               <span className="text-[6px] orbitron text-white/5 font-black uppercase">NEURAL_SYNC_LEVEL</span>
               <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-white/20 w-3/4"></div>
               </div>
            </div>
         </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-particle {
          from { transform: translateY(0); opacity: 0.2; }
          to { transform: translateY(-1000px); opacity: 0; }
        }
      `}} />
    </div>
  );
};