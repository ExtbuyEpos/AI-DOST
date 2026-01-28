
import React, { useState } from 'react';

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ isOpen, onClose }) => {
  const [type, setType] = useState<'BUG' | 'SUGGESTION'>('BUG');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate tactical transmission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setMessage('');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto" onClick={onClose}></div>
      <div className="relative w-full max-w-lg hud-glass p-8 rounded-3xl border-cyan-500/40 pointer-events-auto animate-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-6 border-b border-cyan-500/20 pb-4">
          <h2 className="text-lg orbitron font-black text-white tracking-widest uppercase">
            {isSuccess ? 'DATA_TRANSMITTED' : 'UPLINK_FEEDBACK'}
          </h2>
          <button onClick={onClose} className="text-cyan-500 hover:text-red-500 transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {isSuccess ? (
          <div className="py-10 flex flex-col items-center gap-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center text-green-500">
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
            </div>
            <p className="text-cyan-400 orbitron text-xs font-bold uppercase tracking-widest">Feedback Logged. Thank you, Sir.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-cyan-500/10">
              <button 
                type="button"
                onClick={() => setType('BUG')}
                className={`flex-1 py-2 rounded-lg orbitron text-[10px] font-black transition-all ${type === 'BUG' ? 'bg-red-500/20 text-red-500 border border-red-500/40' : 'text-slate-500 hover:text-cyan-400'}`}
              >
                REPORT_BUG
              </button>
              <button 
                type="button"
                onClick={() => setType('SUGGESTION')}
                className={`flex-1 py-2 rounded-lg orbitron text-[10px] font-black transition-all ${type === 'SUGGESTION' ? 'bg-cyan-500/20 text-cyan-500 border border-cyan-500/40' : 'text-slate-500 hover:text-cyan-400'}`}
              >
                SUGGESTION
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[8px] orbitron text-cyan-700 font-black uppercase">Transmission_Payload</label>
              <textarea 
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Details of the anomaly or tactical suggestion..."
                className="w-full h-32 bg-black/60 border border-cyan-500/20 rounded-xl p-4 text-cyan-100 text-[10px] font-mono outline-none focus:border-cyan-400 transition-all placeholder:text-cyan-900 resize-none"
              />
            </div>

            <button 
              disabled={isSubmitting}
              type="submit"
              className="w-full py-4 bg-cyan-500/10 border border-cyan-400 text-cyan-400 orbitron font-black text-xs rounded-xl hover:bg-cyan-500 hover:text-black transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'PROCESSING_ENCRYPTION...' : 'EXECUTE_UPLINK'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
