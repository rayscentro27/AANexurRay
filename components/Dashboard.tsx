
import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, DollarSign, Activity, Sparkles, RefreshCw, 
  History, Zap, CheckCircle, Lightbulb, Target, 
  ShieldAlert, MessageSquare, AlertTriangle,
  BarChart3, ShieldCheck, Globe, Key, Database, CreditCard,
  BrainCircuit, Gavel, Clock, ArrowRight, MousePointer2,
  Users, Building2, MapPin, Phone, Mail, Eye
} from 'lucide-react';
import { Contact, AgencyBranding } from '../types';
import { GoogleGenAI } from '@google/genai';
import { data } from '../adapters';
import GlobalFundPulse from './GlobalFundPulse';

interface DashboardProps {
  contacts?: Contact[];
}

const Dashboard: React.FC<DashboardProps> = ({ contacts = [] }) => {
  const [briefing, setBriefing] = useState<string>('');
  const [isLoadingBriefing, setIsLoadingLoadingBriefing] = useState(true);
  const [strikeList, setStrikeList] = useState<{ id: string; action: string; reason: string; priority: 'Hot' | 'Warm' }[]>([]);
  const [branding, setBranding] = useState<AgencyBranding | null>(null);
  const [activeTab, setActiveTab] = useState<'brief' | 'watchtower'>('brief');

  useEffect(() => {
    const fetchBranding = async () => {
        const b = await data.getBranding();
        setBranding(b);
    };
    fetchBranding();

    const runNeuralBriefing = async () => {
      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey === 'YOUR_API_KEY') {
        setBriefing("Nexus AI Core is disconnected. Link your API key in Settings to activate autonomous monitoring.");
        setIsLoadingLoadingBriefing(false);
        return;
      }

      if (contacts.length === 0) {
        setBriefing("Nexus Initialized. Awaiting leads for intelligence reporting.");
        setIsLoadingLoadingBriefing(false);
        return;
      }

      setIsLoadingLoadingBriefing(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Review this pipeline and identify the TOP 3 most urgent sales actions. Return as JSON array: [{id, action, reason, priority}]. Leads: ${JSON.stringify(contacts.map(c => ({ id: c.id, company: c.company, status: c.status, val: c.value, score: c.aiScore })))}`,
          config: { responseMimeType: "application/json" }
        });
        
        try {
          const list = JSON.parse(response.text || "[]");
          setStrikeList(list.slice(0, 5));
          setBriefing("Pipeline velocity is nominal. Focus on high-intent targets identified in your Strike List.");
        } catch {
          setBriefing(response.text || "Neural Handshake established.");
        }
      } catch (e) {
        setBriefing("AI Handshake Interrupted.");
      } finally {
        setIsLoadingLoadingBriefing(false);
      }
    };
    runNeuralBriefing();
  }, [contacts]);

  const totalValue = contacts.reduce((sum, c) => sum + (c.value || 0), 0);
  const fundedCount = contacts.filter(c => c.status === 'Closed').length;

  return (
    <div className="space-y-8 animate-fade-in pb-10 max-w-7xl mx-auto">
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex bg-white/50 backdrop-blur-xl border border-slate-200 p-1 rounded-2xl shadow-sm">
            <button 
                onClick={() => setActiveTab('brief')}
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'brief' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <Target size={14} className="inline mr-2" /> Briefing Room
            </button>
            <button 
                onClick={() => setActiveTab('watchtower')}
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'watchtower' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <Eye size={14} className="inline mr-2" /> Global Watchtower
            </button>
        </div>
      </div>

      {activeTab === 'brief' ? (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden group h-full">
                    <div className="absolute top-0 right-0 p-10 opacity-5 transition-all rotate-12 -translate-y-10 translate-x-10"><Zap size={300} /></div>
                    <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-lg shadow-emerald-500/20 transform -rotate-3"><Sparkles size={24} className="text-slate-950" /></div>
                            <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter leading-none text-slate-900">Executive Brief</h2>
                            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.3em] mt-1">Neural Core Protocol</p>
                            </div>
                        </div>
                        {branding && (
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{branding.name} Active</span>
                            </div>
                        )}
                    </div>
                    
                    {isLoadingBriefing ? (
                        <div className="space-y-4 animate-pulse max-w-lg">
                            <div className="h-4 bg-slate-100 rounded w-full"></div>
                            <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                        </div>
                    ) : (
                        <p className="text-2xl font-medium leading-relaxed text-slate-800 italic pr-20">
                            "{briefing}"
                        </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                        <StatMini label="Pipeline Value" value={`$${(totalValue/1000).toFixed(0)}k`} icon={<Activity size={16}/>} />
                        <StatMini label="Closing Rate" value={`${fundedCount > 0 ? ((fundedCount/contacts.length)*100).toFixed(0) : 0}%`} icon={<Target size={16}/>} />
                        <StatMini label="System Health" value="OPTIMAL" icon={<ShieldCheck size={16}/>} isStatus />
                    </div>
                    </div>
                </div>

                <div className="lg:col-span-4 bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col h-full border border-white/5">
                    <div className="absolute top-0 right-0 p-8 opacity-5"><Target size={140} /></div>
                    <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2 relative z-10"><RefreshCw size={16} /> Daily Strike List</h3>
                    
                    <div className="space-y-4 relative z-10 flex-1 overflow-y-auto no-scrollbar pr-1">
                        {isLoadingBriefing ? (
                        [1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse"></div>)
                        ) : strikeList.length > 0 ? (
                            strikeList.map((item, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group active:scale-[0.98]">
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${item.priority === 'Hot' ? 'bg-red-50 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-blue-50 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]'}`}>
                                        {item.priority}
                                    </span>
                                    <ArrowRight size={12} className="text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                                </div>
                                <h4 className="text-xs font-black uppercase tracking-tight text-white line-clamp-1">{item.action}</h4>
                                <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-1">{item.reason}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 opacity-30">
                                <CheckCircle size={32} className="mx-auto mb-2" />
                                <p className="text-[10px] font-black uppercase">List Clear</p>
                            </div>
                        )}
                    </div>
                    
                    <button 
                    onClick={() => window.location.hash = 'power_dialer'}
                    className="w-full mt-8 bg-emerald-500 text-slate-950 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/10 transform active:scale-95"
                    >
                    Launch Power Dialer <Zap size={14} fill="currentColor" />
                    </button>
                </div>
            </div>
            {/* Activities feed etc below... */}
        </>
      ) : (
          <GlobalFundPulse contacts={contacts} />
      )}
    </div>
  );
};

const StatMini = ({ label, value, icon, isStatus }: any) => (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-sm transition-all">
        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">
            {icon} {label}
        </div>
        <p className={`text-lg font-black tracking-tight ${isStatus ? 'text-emerald-500' : 'text-slate-900'}`}>{value}</p>
    </div>
);

export default Dashboard;
