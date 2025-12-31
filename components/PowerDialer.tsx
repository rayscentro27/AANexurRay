
import React, { useState, useEffect, useRef } from 'react';
import { Contact, Activity, ClientTask } from '../types';
import { 
  Phone, PhoneOff, Mic, StopCircle, User, FileText, ChevronRight, 
  X, Clock, Play, SkipForward, CheckCircle, AlertTriangle, 
  Calendar, MessageSquare, BarChart2, Zap, BrainCircuit, 
  RefreshCw, Volume2, ArrowRight, Sparkles, ClipboardCheck,
  ListChecks, Award
} from 'lucide-react';
import * as geminiService from '../services/geminiService';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';

// --- Audio Encoding/Decoding Utilities ---

function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- AI Tool Definition ---

const calendarTool: FunctionDeclaration = {
  name: 'schedule_meeting',
  parameters: {
    type: Type.OBJECT,
    description: 'Schedules a follow-up Zoom/Google Meet with the borrower for underwriting review.',
    properties: {
      meetingTime: {
        type: Type.STRING,
        description: 'The date and time for the meeting (e.g., "Monday at 2pm").',
      },
      meetingType: {
        type: Type.STRING,
        enum: ['Underwriting Review', 'Closing Call'],
        description: 'The purpose of the follow-up session.',
      },
    },
    required: ['meetingTime', 'meetingType'],
  },
};

interface PowerDialerProps {
  queue: Contact[];
  onUpdateContact: (contact: Contact) => void;
  onClose: () => void;
}

const PowerDialer: React.FC<PowerDialerProps> = ({ queue, onUpdateContact, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'wrapping'>('idle');
  const [mode, setMode] = useState<'manual' | 'neural'>('neural');
  const [duration, setDuration] = useState(0);
  const [script, setScript] = useState('Generating intelligent script...');
  const [tacticalPivot, setTacticalPivot] = useState<string | null>(null);
  const [isAnalyzingStrategy, setIsAnalyzingStrategy] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState<{ role: string; text: string }[]>([]);
  const [debrief, setDebrief] = useState<{ summary: string; actionItems: string[] } | null>(null);
  const [isSynthesizingDebrief, setIsSynthesizingDebrief] = useState(false);
  const [qualifyingStatus, setQualifyingStatus] = useState({
    revenueConfirmed: false,
    timeInBizConfirmed: false,
    useOfFundsConfirmed: false,
    meetingBooked: false,
  });

  const currentContact = queue[currentIndex];
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Audio Refs
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const transcriptBuffer = useRef({ input: '', output: '' });

  // Update Script and Reset State when lead changes
  useEffect(() => {
    if (currentContact) {
      setScript('Synthesizing lead intelligence...');
      setTacticalPivot(null);
      setDebrief(null);
      setQualifyingStatus({
        revenueConfirmed: false,
        timeInBizConfirmed: false,
        useOfFundsConfirmed: false,
        meetingBooked: false,
      });
      geminiService.generateSalesScript(currentContact, 'Qualifying Outreach').then(setScript);
    }
  }, [currentIndex, currentContact]);

  // Duration Timer
  useEffect(() => {
    if (callStatus === 'connected') {
      timerRef.current = setInterval(() => setDuration(prev => prev + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      setDuration(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callStatus]);

  // Live Transcript / Strategy Monitoring
  useEffect(() => {
    const triggerAnalysis = async () => {
      if (liveTranscript.length > 0 && liveTranscript.length % 2 === 0 && !isAnalyzingStrategy) {
        setIsAnalyzingStrategy(true);
        try {
          const lastFour = liveTranscript.slice(-4).map(t => t.text).join(' ');
          
          // Pattern match for qualifying indicators
          setQualifyingStatus(prev => ({
            ...prev,
            revenueConfirmed: prev.revenueConfirmed || /\$\d+|revenue|month|making/i.test(lastFour),
            timeInBizConfirmed: prev.timeInBizConfirmed || /year|month|established|opened/i.test(lastFour),
            useOfFundsConfirmed: prev.useOfFundsConfirmed || /inventory|payroll|marketing|growth|expansion/i.test(lastFour)
          }));

          const pivot = await geminiService.analyzeCallStrategy(liveTranscript, currentContact);
          setTacticalPivot(pivot);
        } catch (e) {
          console.error("Strategy analysis failed", e);
        } finally {
          setIsAnalyzingStrategy(false);
        }
      }
    };
    triggerAnalysis();
  }, [liveTranscript.length, currentContact]);

  // --- Neural Agent Session ---

  const startNeuralCall = async () => {
    if (!currentContact) return;
    setCallStatus('calling');
    setLiveTranscript([]);
    setDebrief(null);
    
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
      nextStartTimeRef.current = audioContextRef.current.currentTime;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000 } });
      streamRef.current = stream;

      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const instruction = `
      AI IDENTITY: You are "Nexus", a senior funding advisor for ${currentContact.company}.
      GOAL: Qualify the business owner and book a follow-up Underwriting Review.
      
      QUALIFYING CHECKLIST:
      1. Confirm Monthly Gross Revenue (We look for >$15,000/mo).
      2. Confirm Years in Business (We look for >6 months).
      3. Identify what the funds will be used for.
      
      TONE: Professional, empathetic, energetic, and concise.
      
      PROTOCOL:
      - Start with: "Hi ${currentContact.name}, it's Nexus calling from the funding desk. I was reviewing your preliminary profile, do you have two minutes to discuss a liquidity match?"
      - If they meet criteria, use the 'schedule_meeting' tool to book a follow-up.
      - If they are NOT qualified, politely let them know we'll keep them in our growth queue.
      `;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: instruction,
          tools: [{ functionDeclarations: [calendarTool] }],
          inputAudioTranscription: { model: "google-1" },
          outputAudioTranscription: { model: "google-1" }
        },
        callbacks: {
          onopen: () => {
            setCallStatus('connected');
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              setVolumeLevel(Math.sqrt(sum / inputData.length) * 80);

              sessionPromise.then(s => s.sendRealtimeInput({ media: createBlob(inputData) }));
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              const buffer = await decodeAudioData(decode(audioData), audioContextRef.current, 24000, 1);
              const audioSource = audioContextRef.current.createBufferSource();
              audioSource.buffer = buffer;
              audioSource.connect(audioContextRef.current.destination);
              const start = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
              audioSource.start(start);
              nextStartTimeRef.current = start + buffer.duration;
              sourcesRef.current.add(audioSource);
            }

            // Transcriptions
            if (msg.serverContent?.inputTranscription?.text) transcriptBuffer.current.input += msg.serverContent.inputTranscription.text;
            if (msg.serverContent?.outputTranscription?.text) transcriptBuffer.current.output += msg.serverContent.outputTranscription.text;
            
            if (msg.serverContent?.turnComplete) {
              if (transcriptBuffer.current.input) setLiveTranscript(p => [...p, { role: 'Borrower', text: transcriptBuffer.current.input }]);
              if (transcriptBuffer.current.output) setLiveTranscript(p => [...p, { role: 'Nexus Agent', text: transcriptBuffer.current.output }]);
              transcriptBuffer.current = { input: '', output: '' };
            }

            // Function Calling
            if (msg.toolCall) {
              for (const fc of msg.toolCall.functionCalls) {
                if (fc.name === 'schedule_meeting') {
                  const args = fc.args as any;
                  handleAutoBook(args.meetingTime, args.meetingType);
                  sessionPromise.then(s => s.sendToolResponse({ 
                    functionResponses: { 
                      id: fc.id, 
                      name: fc.name, 
                      response: { result: "Success! Meeting booked for " + args.meetingTime } 
                    } 
                  }));
                }
              }
            }
          },
          onclose: () => setCallStatus('wrapping'),
          onerror: () => stopNeuralSession()
        }
      });
      sessionRef.current = sessionPromise;
    } catch (e) {
      console.error(e);
      setCallStatus('idle');
    }
  };

  const handleAutoBook = (time: string, type: string) => {
    setQualifyingStatus(prev => ({ ...prev, meetingBooked: true }));
    const newTask: ClientTask = {
      id: `ai_book_${Date.now()}`,
      title: `${type} (AI Scheduled)`,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      meetingTime: time,
      type: 'meeting'
    };

    onUpdateContact({
      ...currentContact,
      clientTasks: [newTask, ...(currentContact.clientTasks || [])],
      activities: [
        ...(currentContact.activities || []),
        {
          id: `act_auto_${Date.now()}`,
          type: 'meeting',
          description: `Autonomous Agent qualified lead and booked ${type} for ${time}.`,
          date: new Date().toLocaleString(),
          user: 'Nexus AI'
        }
      ],
      status: 'Active'
    });
  };

  const stopNeuralSession = async () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
    }
    if (sessionRef.current) {
      try {
        const session = await sessionRef.current;
        session.close();
      } catch (e) {}
    }
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setCallStatus('wrapping');
    generateCallDebrief();
  };

  const generateCallDebrief = async () => {
    if (liveTranscript.length === 0) return;
    setIsSynthesizingDebrief(true);
    const fullText = liveTranscript.map(t => `${t.role}: ${t.text}`).join('\n');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Review this call transcript with a business owner:
        ${fullText}
        
        Return JSON: {
          summary: string (concise 1-2 sentence summary),
          actionItems: string[] (3 specific actions or insights)
        }`,
        config: { responseMimeType: "application/json" }
      });
      
      const json = JSON.parse(res.text || "{}");
      setDebrief(json);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSynthesizingDebrief(false);
    }
  };

  const handleDisposition = (outcome: string) => {
    const debriefNote = debrief ? `\n\nAI Summary: ${debrief.summary}\nActions: ${debrief.actionItems.join(', ')}` : '';
    onUpdateContact({
      ...currentContact,
      activities: [
        ...(currentContact.activities || []),
        {
          id: `call_${Date.now()}`,
          type: 'call',
          description: `Call with ${currentContact.name}. Result: ${outcome}.${debriefNote}`,
          date: new Date().toLocaleString(),
          user: mode === 'neural' ? 'Nexus AI' : 'Admin'
        }
      ]
    });
    if (currentIndex < queue.length - 1) setCurrentIndex(prev => prev + 1);
    else onClose();
  };

  if (!currentContact) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col animate-fade-in text-slate-100 font-sans">
      
      {/* Header */}
      <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-2xl shadow-2xl transition-colors duration-500 ${mode === 'neural' ? 'bg-indigo-600 shadow-indigo-500/20' : 'bg-blue-600 shadow-blue-500/20'}`}>
            {mode === 'neural' ? <BrainCircuit size={28}/> : <Phone size={28}/>}
          </div>
          <div>
            <h2 className="font-black text-xl uppercase tracking-tighter">{mode === 'neural' ? 'Neural Outreach' : 'Standard Dialer'}</h2>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{currentIndex + 1} / {queue.length} in queue</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="bg-slate-800 p-1 rounded-xl border border-white/5 flex shadow-inner">
            <button 
              onClick={() => setMode('manual')} 
              className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${mode === 'manual' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}
            >
              Manual Mode
            </button>
            <button 
              onClick={() => setMode('neural')} 
              className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${mode === 'neural' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
            >
              <Zap size={10} fill="currentColor"/> AI Agent
            </button>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X size={28}/></button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        
        {/* Left: Lead Intel */}
        <div className="col-span-3 border-r border-white/5 bg-slate-900/40 p-8 overflow-y-auto custom-scrollbar">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-700 rounded-[2.5rem] mx-auto flex items-center justify-center text-3xl font-black mb-4 border border-white/10 shadow-2xl transform hover:rotate-3 transition-transform">
              {currentContact.name.charAt(0)}
            </div>
            <h3 className="text-xl font-black text-white tracking-tight uppercase mb-1">{currentContact.company}</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{currentContact.name}</p>
          </div>

          <div className="space-y-4">
            <div className="p-5 bg-white/5 rounded-[1.5rem] border border-white/5 shadow-inner">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><ClipboardCheck size={12}/> Qualifying Tracker</p>
              <div className="space-y-3">
                <StatusRow label="Monthly Revenue" active={qualifyingStatus.revenueConfirmed} />
                <StatusRow label="Time in Business" active={qualifyingStatus.timeInBizConfirmed} />
                <StatusRow label="Capital Goal" active={qualifyingStatus.useOfFundsConfirmed} />
                <div className="pt-2 mt-2 border-t border-white/5">
                  <StatusRow label="Follow-up Booked" active={qualifyingStatus.meetingBooked} special />
                </div>
              </div>
            </div>

            <div className="p-5 bg-white/5 rounded-[1.5rem] border border-white/5">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Target Profile</p>
              <div className="space-y-3">
                <IntelBit label="Stated Revenue" val={`$${currentContact.revenue?.toLocaleString() || '---'}`} />
                <IntelBit label="Bureau Score" val={currentContact.creditAnalysis?.score?.toString() || 'Pending'} />
                <IntelBit label="Deal Value" val={`$${currentContact.value.toLocaleString()}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Session */}
        <div className="col-span-6 p-10 flex flex-col items-center justify-center relative overflow-hidden bg-slate-950">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-[120px]"></div>
          </div>

          {callStatus === 'idle' ? (
            <div className="text-center animate-fade-in max-w-sm relative z-10">
              <div className={`w-32 h-32 rounded-[3rem] flex items-center justify-center border-4 border-white/5 mb-8 shadow-[0_0_80px_rgba(0,0,0,0.5)] mx-auto transform hover:rotate-3 transition-transform ${mode === 'neural' ? 'bg-indigo-900/50' : 'bg-blue-900/50'}`}>
                {mode === 'neural' ? <BrainCircuit size={56} className="text-indigo-400" /> : <Phone size={56} className="text-blue-400" />}
              </div>
              <h2 className="text-2xl font-black mb-6 tracking-tight uppercase">
                {mode === 'neural' ? 'Establish AI Bridge' : 'Manual Dial'}
              </h2>
              <button 
                onClick={mode === 'neural' ? startNeuralCall : () => setCallStatus('connected')}
                className={`w-full py-5 rounded-[2rem] font-black uppercase text-sm tracking-[0.2em] shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 ${mode === 'neural' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-blue-600 hover:bg-blue-500'}`}
              >
                {mode === 'neural' ? 'Connect AI Agent' : 'Start Dialing'}
                <ArrowRight size={18} />
              </button>
              <p className="mt-6 text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                The agent will qualify the merchant and <br/>book a calendar invite autonomously.
              </p>
            </div>
          ) : callStatus === 'wrapping' ? (
            <div className="w-full max-w-2xl animate-fade-in relative z-10">
              <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-xl shadow-2xl">
                 <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter">Call Analysis</h2>
                        <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Post-Operation Debrief</p>
                    </div>
                    {isSynthesizingDebrief && <RefreshCw size={24} className="animate-spin text-blue-500" />}
                 </div>

                 {debrief ? (
                    <div className="space-y-8">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Sparkles size={14} className="text-blue-400"/> AI Summary</h4>
                            <p className="text-sm text-slate-200 leading-relaxed italic font-medium">"{debrief.summary}"</p>
                        </div>
                        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><ListChecks size={14} className="text-emerald-400"/> Key Action Items</h4>
                            <div className="space-y-3">
                                {debrief.actionItems.map((item, i) => (
                                    <div key={i} className="flex gap-4 text-xs font-medium text-slate-300 items-start">
                                        <div className="w-5 h-5 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black border border-blue-500/20">{i+1}</div>
                                        <p>{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                 ) : (
                    <div className="text-center py-20 opacity-50">
                        <RefreshCw size={48} className="animate-spin mx-auto mb-4 text-slate-600" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Processing Call DNA...</p>
                    </div>
                 )}

                 <div className="mt-12 flex gap-4">
                    {['Qualified', 'Interested', 'Ineligible', 'Wrong Person'].map(opt => (
                        <button 
                            key={opt}
                            onClick={() => handleDisposition(opt)}
                            className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-xl"
                        >
                            {opt}
                        </button>
                    ))}
                 </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center max-w-2xl animate-fade-in relative z-10 h-full">
              <div className="flex-1 flex flex-col items-center justify-center w-full">
                <div className="relative mb-20">
                  <div 
                    className={`w-44 h-44 rounded-full flex items-center justify-center transition-all duration-100 ${mode === 'neural' ? 'bg-gradient-to-tr from-indigo-600 to-emerald-600 shadow-[0_0_80px_rgba(79,70,229,0.5)]' : 'bg-blue-600'}`} 
                    style={{ transform: `scale(${1 + volumeLevel/100})` }}
                  >
                    <Volume2 size={80} className="text-white opacity-90" />
                  </div>
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 px-6 py-2 rounded-full text-[10px] font-black tracking-[0.3em] uppercase border border-white/20 shadow-xl animate-pulse">
                    Agent Live
                  </div>
                </div>
                
                <div className="w-full bg-black/40 rounded-[3rem] p-8 border border-white/5 h-72 overflow-y-auto custom-scrollbar shadow-inner relative">
                  {liveTranscript.map((t, i) => (
                    <div key={i} className={`flex ${t.role.includes('Agent') ? 'justify-start' : 'justify-end'} mb-4 animate-fade-in`}>
                      <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${t.role.includes('Agent') ? 'bg-indigo-600 text-white rounded-tl-none' : 'bg-slate-800 text-slate-300 rounded-tr-none border border-white/5'}`}>
                        <span className="text-[8px] font-black uppercase block opacity-50 mb-1 tracking-widest">{t.role}</span>
                        {t.text}
                      </div>
                    </div>
                  ))}
                  {liveTranscript.length === 0 && <p className="text-center text-slate-700 italic text-sm mt-16 animate-pulse font-mono tracking-widest">Awaiting voice sync...</p>}
                </div>
              </div>

              <button 
                onClick={stopNeuralSession} 
                className="mt-8 bg-red-600/10 border border-red-600/30 hover:bg-red-600 text-red-500 hover:text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] transition-all active:scale-95 shadow-2xl"
              >
                Disconnect Call
              </button>
            </div>
          )}
        </div>

        {/* Right: Strategy & Scripts */}
        <div className="col-span-3 border-l border-white/5 bg-slate-900/40 p-8 flex flex-col overflow-hidden">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-6">Agent Playbook</p>
          <div className="bg-white/5 border border-white/5 rounded-3xl p-6 text-xs text-slate-400 italic leading-relaxed shadow-inner overflow-y-auto mb-8 max-h-48">
            {script}
          </div>
          
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Neural Strategy Insight</p>
              {isAnalyzingStrategy && <RefreshCw size={12} className="animate-spin text-blue-400" />}
            </div>
            
            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar">
              {tacticalPivot && (
                <div className="bg-indigo-600/20 border border-indigo-500/40 rounded-2xl p-5 animate-fade-in shadow-xl shadow-indigo-500/5">
                  <div className="flex items-center gap-2 mb-3 text-indigo-400 font-black text-[9px] uppercase tracking-widest">
                    <Sparkles size={14} /> Critical Insight
                  </div>
                  <p className="text-xs text-indigo-100 font-bold leading-relaxed italic">"{tacticalPivot}"</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-2 mt-auto">
                {['Qualified', 'Interested - Followup', 'Ineligible', 'Wrong Person'].map(opt => (
                  <button 
                    key={opt} 
                    onClick={() => handleDisposition(opt)} 
                    className="p-4 bg-white/5 border border-white/5 rounded-2xl text-[9px] font-black text-slate-300 hover:bg-emerald-600 hover:text-white transition-all text-left uppercase tracking-widest flex items-center justify-between group active:scale-95"
                  >
                    {opt} <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-all"/>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusRow = ({ label, active, special }: { label: string; active: boolean; special?: boolean }) => (
  <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${active ? 'bg-emerald-500/10' : ''}`}>
    <span className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${active ? (special ? 'text-indigo-400' : 'text-emerald-400') : 'text-slate-600'}`}>{label}</span>
    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${active ? (special ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-emerald-500 border-emerald-500 text-slate-900') : 'border-white/10 bg-white/5'}`}>
      {active && <CheckCircle size={10} />}
    </div>
  </div>
);

const IntelBit = ({ label, val }: { label: string; val: string }) => (
  <div className="flex flex-col">
    <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">{label}</p>
    <p className={`font-black text-sm tracking-tight ${val.includes('$') ? 'text-emerald-400' : 'text-slate-100'}`}>{val}</p>
  </div>
);

export default PowerDialer;
