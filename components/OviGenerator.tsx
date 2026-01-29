
import React, { useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { GeneratedAsset, VideoStyle, VideoLength } from '../types';

interface OviGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetGenerated: (asset: GeneratedAsset) => void;
}

const STYLES: VideoStyle[] = ['CINEMATIC', 'REALISTIC', 'ANIMATED', 'CYBERPUNK'];
const LENGTHS: VideoLength[] = ['5s', '10s', '15s'];

export const OviGenerator: React.FC<OviGeneratorProps> = ({ isOpen, onClose, onAssetGenerated }) => {
  const [mode, setMode] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [style, setStyle] = useState<VideoStyle>('CINEMATIC');
  const [length, setLength] = useState<VideoLength>('10s');
  const [customNarration, setCustomNarration] = useState('');
  const [includeMusic, setIncludeMusic] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setStatusMsg("Initializing Synthesis Node...");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

      if (mode === 'IMAGE') {
        setStatusMsg("Rendering Neural Pixels...");
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: `${style} style: ${prompt}` }] },
          config: { imageConfig: { aspectRatio } }
        });

        const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (part?.inlineData) {
          const url = `data:image/png;base64,${part.inlineData.data}`;
          setPreviewUrl(url);
          onAssetGenerated({ id: Date.now().toString(), type: 'image', url, prompt, config: { aspectRatio, style } });
          setStatusMsg("Synthesis Successful.");
        }
      } else {
        setStatusMsg("Initializing VEO V4 Engine...");
        let operation = await ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: `${style} style sequence: ${prompt}`,
          config: { numberOfVideos: 1, resolution: '720p', aspectRatio: aspectRatio as any }
        });

        while (!operation.done) {
          await new Promise(resolve => setTimeout(resolve, 8000));
          operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const videoBlob = await videoResponse.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        setPreviewUrl(videoUrl);

        onAssetGenerated({ id: Date.now().toString(), type: 'video', url: videoUrl, prompt, config: { aspectRatio, style, length } });
        setStatusMsg("Video Uplink Complete.");
      }
    } catch (error) {
      console.error(error);
      setStatusMsg("SYNTH_ERROR: PROTOCOL_ABORTED");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 pointer-events-none">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl pointer-events-auto" onClick={onClose}></div>
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto premium-scroll hud-glass p-8 md:p-12 rounded-[3.5rem] border-purple-500/30 shadow-2xl pointer-events-auto flex flex-col gap-8 animate-in zoom-in duration-300">
        
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h2 className="text-2xl orbitron font-black text-white tracking-widest uppercase italic text-glow">OVI_SYNTH_TERMINAL</h2>
            <span className="text-[8px] orbitron text-purple-600 font-bold uppercase tracking-[0.4em]">MOLTBOT_V4 ENGINE // MULTI-STYLE SYNC</span>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
           {/* Controls */}
           <div className="flex-1 space-y-6">
              <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10">
                {(['IMAGE', 'VIDEO'] as const).map(m => (
                  <button key={m} onClick={() => { setMode(m); setPreviewUrl(null); }} className={`flex-1 py-3 rounded-xl orbitron font-black text-[10px] transition-all ${mode === m ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-purple-400'}`}>GENERATE_{m}</button>
                ))}
              </div>

              <div className="space-y-4">
                <label className="text-[9px] orbitron text-purple-500 font-black uppercase tracking-widest block">Neural_Prompt_Vector</label>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe your vision..." className="w-full h-28 bg-black/60 border border-purple-500/20 rounded-[2rem] p-6 text-sm font-mono text-purple-100 outline-none focus:border-purple-500/50 transition-all placeholder:text-purple-900/40 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-3">
                    <label className="text-[8px] orbitron text-slate-500 font-black uppercase">Visual_Style</label>
                    <select value={style} onChange={(e) => setStyle(e.target.value as VideoStyle)} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-[10px] orbitron text-white outline-none">
                       {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[8px] orbitron text-slate-500 font-black uppercase">Aspect_Ratio</label>
                    <div className="flex gap-2">
                       {(['1:1', '16:9', '9:16'] as const).map(ar => (
                         <button key={ar} onClick={() => setAspectRatio(ar)} className={`flex-1 py-2 rounded-lg border orbitron font-black text-[8px] transition-all ${aspectRatio === ar ? 'bg-purple-500 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}>{ar}</button>
                       ))}
                    </div>
                 </div>
              </div>

              {mode === 'VIDEO' && (
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-3">
                      <label className="text-[8px] orbitron text-slate-500 font-black uppercase">Video_Length</label>
                      <div className="flex gap-2">
                         {LENGTHS.map(l => (
                           <button key={l} onClick={() => setLength(l)} className={`flex-1 py-2 rounded-lg border orbitron font-black text-[8px] transition-all ${length === l ? 'bg-purple-500 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}>{l}</button>
                         ))}
                      </div>
                   </div>
                   <div className="flex items-center justify-between pt-6">
                      <span className="text-[10px] orbitron font-black text-slate-500 uppercase tracking-widest">Include_OST</span>
                      <button onClick={() => setIncludeMusic(!includeMusic)} className={`w-12 h-6 rounded-full relative transition-all ${includeMusic ? 'bg-purple-600' : 'bg-white/5'}`}>
                         <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${includeMusic ? 'right-1' : 'left-1'}`}></div>
                      </button>
                   </div>
                </div>
              )}

              <button onClick={handleGenerate} disabled={isGenerating} className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white orbitron font-black text-xs rounded-2xl shadow-[0_10px_40px_rgba(168,85,247,0.3)] hover:scale-[1.02] transition-all uppercase tracking-[0.2em] relative overflow-hidden group">
                {isGenerating ? statusMsg : `Execute_AI_Generate_${mode}`}
                {!isGenerating && <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>}
              </button>
           </div>

           {/* Preview / Status */}
           <div className="w-full lg:w-80 flex flex-col gap-6">
              <div className="flex-1 bg-black/60 border border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center p-6 relative overflow-hidden group">
                 {previewUrl ? (
                    mode === 'IMAGE' ? (
                      <img src={previewUrl} className="w-full h-auto rounded-xl animate-in zoom-in duration-500" />
                    ) : (
                      <video src={previewUrl} controls autoPlay loop className="w-full h-auto rounded-xl animate-in zoom-in duration-500" />
                    )
                 ) : (
                    <div className="text-center space-y-4 opacity-20 group-hover:opacity-40 transition-opacity">
                       <svg viewBox="0 0 24 24" className="w-16 h-16 mx-auto text-purple-500" fill="none" stroke="currentColor" strokeWidth="1"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                       <span className="text-[10px] orbitron font-black uppercase tracking-widest block">Neural_Preview_Empty</span>
                    </div>
                 )}
                 <div className="absolute top-4 left-4 flex gap-1">
                    {[...Array(3)].map((_, i) => <div key={i} className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: `${i*0.2}s` }}></div>)}
                 </div>
              </div>

              <div className="hud-glass p-6 rounded-3xl border-white/5 space-y-4">
                 <div className="flex justify-between items-center text-[8px] orbitron font-bold text-slate-500 uppercase tracking-widest">
                    <span>COGNITIVE_RESERVE</span>
                    <span className="text-purple-500">92%</span>
                 </div>
                 <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 w-[92%]"></div>
                 </div>
                 <p className="text-[7px] font-mono text-purple-900/60 uppercase text-center italic">Distributed processing active across Moltbot-X clusters</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
