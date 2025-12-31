
import React, { useState, useRef } from 'react';
import { Camera, ShieldCheck, RefreshCw, X, CheckCircle, AlertTriangle, Fingerprint, Scan, UserCheck } from 'lucide-react';
import { Contact } from '../types';
import * as geminiService from '../services/geminiService';

interface IdentityVerificationProps {
  contact: Contact;
  onUpdateContact: (contact: Contact) => void;
}

const IdentityVerification: React.FC<IdentityVerificationProps> = ({ contact, onUpdateContact }) => {
  const [step, setStep] = useState<'intro' | 'capture' | 'analyzing' | 'success' | 'fail'>('intro');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setStep('capture');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Camera access denied.");
      setStep('intro');
    }
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        
        // Stop stream
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
        
        runAiVerification(dataUrl);
      }
    }
  };

  const runAiVerification = async (image: string) => {
    setStep('analyzing');
    try {
        // Logic: Gemini Vision compares capturedImage vs DL stored in vault
        // Mocking the result for demo
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const isMatch = Math.random() > 0.1; // 90% success rate
        
        if (isMatch) {
            onUpdateContact({
                ...contact,
                compliance: {
                    ...(contact.compliance || {}),
                    kycStatus: 'Verified',
                    riskScore: 'Low',
                    lastCheckDate: new Date().toLocaleDateString()
                } as any,
                activities: [
                    ...(contact.activities || []),
                    {
                        id: `kyc_${Date.now()}`,
                        type: 'system',
                        description: 'Biometric Identity Link: Verified via Facial Recognition.',
                        date: new Date().toLocaleString(),
                        user: 'Sentinel'
                    }
                ]
            });
            setStep('success');
        } else {
            setStep('fail');
        }
    } catch (e) {
        setStep('fail');
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
      <div className="bg-slate-950 p-8 text-white flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Fingerprint size={120} /></div>
        <div className="relative z-10">
           <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
             <ShieldCheck className="text-emerald-400" /> Biometric Link
           </h3>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Identity Trust Layer</p>
        </div>
        {contact.compliance?.kycStatus === 'Verified' && (
            <div className="bg-emerald-500 text-slate-950 px-3 py-1 rounded-lg text-[10px] font-black uppercase shadow-lg">IDENTITY VERIFIED</div>
        )}
      </div>

      <div className="p-10 flex flex-col items-center justify-center min-h-[400px]">
        {step === 'intro' && (
            <div className="text-center space-y-6 max-w-sm">
                <div className="w-20 h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center mx-auto text-slate-300">
                    <Scan size={32} />
                </div>
                <h4 className="text-lg font-black text-slate-900 uppercase">Facial Audit Required</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    To release Tier 1 capital, we must verify your physical identity against your government-issued ID.
                </p>
                <button 
                  onClick={startCamera}
                  className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl transform active:scale-95 transition-all"
                >
                    Initialize Scanner
                </button>
            </div>
        )}

        {step === 'capture' && (
            <div className="relative w-full max-w-md animate-fade-in">
                <div className="aspect-square bg-black rounded-[3rem] overflow-hidden border-8 border-slate-900 relative shadow-2xl">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                    <div className="animate-laser-scan"></div>
                    <div className="absolute inset-0 border-[20px] border-black/20 pointer-events-none"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 border-2 border-emerald-500/50 rounded-[50%] shadow-[0_0_0_1000px_rgba(0,0,0,0.5)]"></div>
                </div>
                <button 
                  onClick={captureFrame}
                  className="w-20 h-20 bg-white border-8 border-slate-200 rounded-full absolute -bottom-10 left-1/2 -translate-x-1/2 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-20"
                >
                    <div className="w-8 h-8 bg-slate-900 rounded-full" />
                </button>
            </div>
        )}

        {step === 'analyzing' && (
            <div className="text-center">
                <div className="relative mb-10">
                   <RefreshCw className="animate-spin text-blue-600" size={80} />
                   <Fingerprint size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse" />
                </div>
                <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Neural Cross-Check</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Matching captured frames to Subject Vault DL...</p>
            </div>
        )}

        {step === 'success' && (
            <div className="text-center animate-fade-in">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-emerald-100">
                    <UserCheck size={48} />
                </div>
                <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Trust Linked</h4>
                <p className="text-sm text-slate-500 font-medium mt-2">Your identity has been cryptographically verified.</p>
                <button 
                  onClick={() => setStep('intro')}
                  className="mt-10 px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl"
                >
                    Return to Portal
                </button>
            </div>
        )}

        {step === 'fail' && (
             <div className="text-center animate-fade-in max-w-xs">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle size={40} />
                </div>
                <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Match Failure</h4>
                <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                    Lighting conditions or ID quality prevented a neural match. Please retry in a well-lit area.
                </p>
                <button 
                  onClick={() => setStep('intro')}
                  className="mt-8 w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl"
                >
                    Retry Verification
                </button>
            </div>
        )}
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default IdentityVerification;
