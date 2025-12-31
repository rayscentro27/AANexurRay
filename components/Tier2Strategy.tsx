
import React, { useState, useEffect } from 'react';
import { Contact, Tier2Data, FundedDeal } from '../types';
import { 
    Zap, Sparkles, TrendingUp, ShieldCheck, DollarSign, 
    ArrowRight, RefreshCw, Calculator, Lock, Info, 
    CheckCircle, ListChecks, Smartphone, Clock, CreditCard,
    PlayCircle, Shield, AlertTriangle
} from 'lucide-react';
import * as geminiService from '../services/geminiService';
import { sanitizeAIHtml } from '../utils/security';

interface Tier2StrategyProps {
  contact: Contact;
  onUpdateContact: (contact: Contact) => void;
}

const Tier2Strategy: React.FC<Tier2StrategyProps> = ({ contact, onUpdateContact }) => {
  const [coaching, setCoaching] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [reserveInput, setReserveInput] = useState<string>('');
  
  const activeDeal = contact.fundedDeals?.find(d => d.status === 'Active');
  const tier2 = contact.tier2Data || {
      reserveBalance: 0,
      monthsReserveGoal: 6,
      paymentsMadeCount: activeDeal?.paymentsMade || 0,
      isEligibleForTier2: false
  };

  // 0% Card Specific Logic
  const limit = activeDeal?.originalAmount || 0;
  const estMinPayment = Math.max(50, limit * 0.015); // Approx 1.5% min payment
  const reserveGoalAmount = estMinPayment * tier2.monthsReserveGoal;
  
  const progressPercent = Math.min(100, (tier2.reserveBalance / reserveGoalAmount) * 100);
  const timeProgressPercent = Math.min(100, (tier2.paymentsMadeCount / 6) * 100);
  
  const safeToSpend = Math.max(0, limit - tier2.reserveBalance);

  useEffect(() => {
    const fetchCoaching = async () => {
      setIsLoading(true);
      const res = await geminiService.generateTier2Strategy(contact);
      setCoaching(res);
      setIsLoading(false);
    };
    fetchCoaching();
  }, [contact.id]);

  const handleUpdateReserve = () => {
      const val = parseFloat(reserveInput);
      if (isNaN(val)) return;

      const updatedTier2: Tier2Data = {
          ...tier2,
          reserveBalance: val,
          isEligibleForTier2: val >= reserveGoalAmount && tier2.paymentsMadeCount >= 6
      };

      onUpdateContact({
          ...contact,
          tier2Data: updatedTier2
      });
      setReserveInput('');
  };

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      
      {/* HUD Header */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><TrendingUp size={280} /></div>
        <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-10 border border-emerald-500/20">
                Tier 1 Execution Protocol
            </div>
            <h1 className="text-6xl font-black mb-8 tracking-tighter uppercase leading-[0.9]">
                Plastic to <span className="text-emerald-500">Power.</span>
            </h1>
            <p className="text-slate-400 text-xl leading-relaxed mb-0 font-medium">
                90% of business owners use their 0% cards as simple credit. The top 1% use them as a "Bank Catalyst" to force approvals for Tier 2 Institutional Loans.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         
         {/* AI Strategy & Masterclass */}
         <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="font-black text-xs uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                        <Sparkles size={16} className="text-indigo-500" /> Strategic Protocol
                    </h3>
                    {isLoading && <RefreshCw className="animate-spin text-blue-600" size={16}/>}
                </div>
                
                {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-slate-100 rounded w-full"></div>
                        <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                        <div className="h-20 bg-slate-100 rounded w-full mt-10"></div>
                    </div>
                ) : (
                    <div className="prose prose-lg prose-slate max-w-none prose-p:leading-relaxed prose-p:font-medium prose-strong:text-slate-950">
                        <div dangerouslySetInnerHTML={{ __html: sanitizeAIHtml(coaching.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')) }} />
                    </div>
                )}
            </div>

            {/* Liquidation Toolkit */}
            <div className="bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 p-8 opacity-5"><Smartphone size={140} /></div>
                <h3 className="font-black text-xs uppercase tracking-[0.3em] text-blue-400 mb-8 flex items-center gap-2">
                    <PlayCircle size={16} /> Liquidation Masterclass
                </h3>
                <div className="space-y-6 relative z-10">
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">How to move your 0% limits into your bank account safely:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group">
                            <h4 className="font-black text-xs uppercase text-blue-400 mb-2">The Vendor Bridge</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed group-hover:text-slate-300">Use Melio or Plastiq to pay your business rent or suppliers. They charge the card, you get the write-off and the service.</p>
                        </div>
                        <div className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group">
                            <h4 className="font-black text-xs uppercase text-emerald-400 mb-2">Inventory Stocking</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed group-hover:text-slate-300">Direct purchases of inventory liquefy the credit into physical assets you can sell for cash flow.</p>
                        </div>
                    </div>
                </div>
            </div>
         </div>

         {/* Runway & Reserve Sidebar */}
         <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-emerald-500 shadow-xl">
                        <Calculator size={32} />
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Min Payment</p>
                        <p className="text-2xl font-black text-slate-900">${estMinPayment.toLocaleString()}</p>
                    </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Runway Reserve</h3>
                
                <div className="space-y-6">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">6-Mo Reserve Goal</p>
                            <p className="text-3xl font-black text-blue-600">${reserveGoalAmount.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">XP Progress</p>
                            <p className="text-lg font-black text-slate-900">{Math.round(progressPercent)}%</p>
                        </div>
                    </div>

                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.3)]" style={{ width: `${progressPercent}%` }}></div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Sync Reserve Ledger ($)</label>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                value={reserveInput}
                                onChange={e => setReserveInput(e.target.value)}
                                placeholder="Amount in Reserve AC..."
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button 
                                onClick={handleUpdateReserve}
                                className="bg-slate-950 text-white p-3 rounded-xl hover:bg-blue-600 transition-all active:scale-90"
                            >
                                <RefreshCw size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-10 p-6 bg-slate-950 rounded-[2rem] text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={60}/></div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Safe-to-Spend Cap</p>
                    <h4 className="text-3xl font-black text-emerald-400">${safeToSpend.toLocaleString()}</h4>
                    <p className="text-[8px] text-slate-500 mt-2 leading-relaxed italic uppercase font-bold">Limit minus reserve. Do not exceed for Tier 2 readiness.</p>
                </div>
            </div>

            <div className="bg-emerald-50 rounded-[2rem] border border-emerald-100 p-8">
                <h4 className="text-xs font-black text-emerald-800 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <ShieldCheck size={16} /> Statement Seasoning
                </h4>
                <p className="text-xs text-emerald-700 leading-relaxed font-medium">
                    Lenders for <span className="font-bold">Tier 2 ($100k+)</span> don't look at credit scores as much as "Average Daily Balance". By keeping your 6-month reserve in your account, you are artificially increasing your "Bankability" score every day.
                </p>
            </div>
         </div>

      </div>
    </div>
  );
};

export default Tier2Strategy;
