
import React, { useState } from 'react';
import { Contact } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
    Zap, TrendingUp, ShieldCheck, DollarSign, BrainCircuit, 
    ArrowUpRight, ArrowDownRight, Layers, Sparkles, Target,
    Activity, Crown, Star, Mic
} from 'lucide-react';

interface NexusPulseProps {
  contact: Contact;
  onOpenVoice: () => void;
}

const NexusPulse: React.FC<NexusPulseProps> = ({ contact, onOpenVoice }) => {
  const activeDeal = contact.fundedDeals?.find(d => d.status === 'Active');
  const revenue = contact.revenue || 0;
  const liquidity = activeDeal?.originalAmount || 0;
  const mobilityIndex = Math.round((revenue / 15000) * 40 + (contact.aiScore || 50) * 0.6);
  
  const chartData = [
    { name: 'Month 1', bankability: 35, mobility: 20 },
    { name: 'Month 2', bankability: 45, mobility: 35 },
    { name: 'Month 3', bankability: 42, mobility: 50 },
    { name: 'Month 4', bankability: 58, mobility: 65 },
    { name: 'Current', bankability: contact.aiScore || 65, mobility: mobilityIndex },
  ];

  const pieData = [
    { name: 'Debt Service', value: activeDeal ? 15 : 0, color: '#f43f5e' },
    { name: 'Investment Pool', value: 35, color: '#10b981' },
    { name: 'Operating Reserve', value: 50, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* HUD Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Mobility Score Card */}
        <div className="lg:col-span-8 bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group border border-white/5">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><BrainCircuit size={280} /></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                   <div className="flex items-center gap-3">
                      <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20 transform -rotate-3 transition-transform group-hover:rotate-0">
                         <Activity size={24} className="text-slate-950" />
                      </div>
                      <div>
                         <h2 className="text-2xl font-black uppercase tracking-tighter">Neural Mobility Pulse</h2>
                         <p className="text-emerald-500 text-[9px] font-black uppercase tracking-[0.3em] mt-1">Global Underwriting Aggregate</p>
                      </div>
                   </div>
                   <button 
                      onClick={onOpenVoice}
                      className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 group/voice"
                   >
                      <Mic size={16} className="text-emerald-400 group-hover:animate-pulse" /> Launch Voice Briefing
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mobility Index</p>
                      <h3 className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500">{mobilityIndex}%</h3>
                      <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase">
                         <ArrowUpRight size={14}/> +12% Efficiency
                      </div>
                   </div>
                   <div className="md:col-span-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Autonomous Growth Projection</p>
                      <div className="h-40 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                               <defs>
                                  <linearGradient id="colorMob" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                  </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                               <XAxis dataKey="name" hide />
                               <YAxis hide />
                               <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                               <Area type="monotone" dataKey="mobility" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMob)" />
                            </AreaChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                </div>
            </div>
        </div>

        {/* Level & XP Sidebar */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between group hover:border-blue-500 transition-all">
              <div className="flex justify-between items-start">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Level</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1 uppercase tracking-tighter">Gold Executive</h3>
                 </div>
                 <div className="p-4 bg-amber-50 text-amber-500 rounded-2xl shadow-xl shadow-amber-500/10 group-hover:scale-110 transition-transform">
                    <Crown size={28} />
                 </div>
              </div>
              <div className="mt-10">
                 <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase mb-2">
                    <span>Tier 4 Readiness</span>
                    <span>{contact.aiScore || 65}%</span>
                 </div>
                 <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.4)]" style={{ width: `${contact.aiScore || 65}%` }}></div>
                 </div>
              </div>
           </div>

           <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform"><Star size={120} /></div>
              <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">System XP</p>
              <h4 className="text-5xl font-black tracking-tighter">{(contact.xp || 0).toLocaleString()}</h4>
              <p className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.2em] mt-4">240 XP to Tier 2 Platinum</p>
           </div>
        </div>
      </div>

      {/* Analytics Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
               <Layers size={18} className="text-blue-500" /> Capital Allocation
            </h3>
            <div className="flex-1 h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={pieData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Pie>
                     <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-4">
               {pieData.map(item => (
                  <div key={item.name} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                     <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} /> {item.name}</span>
                     <span className="text-slate-900">{item.value}%</span>
                  </div>
               ))}
            </div>
         </div>

         <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={18} className="text-indigo-500" /> AI Growth Simulator
               </h3>
               <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-widest">Prediction Model: Alpha</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 flex-1 items-center">
               <div className="space-y-8">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                     <div className="flex justify-between mb-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Liquidation Deployment</span>
                        <span className="text-xs font-black text-slate-900">45%</span>
                     </div>
                     <input type="range" className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                     <div className="flex justify-between mb-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Target Re-Invest ROI</span>
                        <span className="text-xs font-black text-slate-900">24%</span>
                     </div>
                     <input type="range" className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  </div>
               </div>

               <div className="bg-indigo-950 p-8 rounded-[2rem] text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute bottom-0 left-0 p-4 opacity-5"><Target size={140} /></div>
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                     <Zap size={14} fill="currentColor" /> Simulated Outcome
                  </p>
                  <div className="space-y-6 relative z-10">
                     <div>
                        <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.2em] mb-1">Tier 2 Approval Magnitude</p>
                        <h4 className="text-4xl font-black text-white tracking-tighter">$142,500</h4>
                     </div>
                     <div>
                        <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.2em] mb-1">Projected Equity Gap</p>
                        <h4 className="text-2xl font-black text-emerald-400 tracking-tighter">+$32,400</h4>
                     </div>
                  </div>
                  <button className="w-full mt-10 py-3 bg-white text-indigo-950 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-50 transition-all shadow-xl">
                      Adopt Growth Protocol
                  </button>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default NexusPulse;
