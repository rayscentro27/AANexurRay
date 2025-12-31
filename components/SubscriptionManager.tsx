import React, { useState } from 'react';
import { Contact, Subscription, AgencyBranding } from '../types';
import { 
  CheckCircle, Star, Zap, Crown, CreditCard, AlertCircle, 
  RefreshCw, Layers, ShieldCheck, DollarSign, Smartphone, Sparkles, X, Gift
} from 'lucide-react';
import { BACKEND_CONFIG } from '../adapters/config';

interface SubscriptionManagerProps {
  contact: Contact;
  onUpdateContact: (contact: Contact) => void;
  branding: AgencyBranding;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ contact, onUpdateContact, branding }) => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const prices = branding.tierPrices || { Bronze: 97, Silver: 197, Gold: 497 };

  const PLANS = [
    {
      id: 'Bronze',
      name: 'Bronze Membership',
      price: prices.Bronze,
      icon: <Zap className="text-amber-600" />,
      color: 'border-amber-200 bg-amber-50/30',
      features: ['Auto-Notifications', '1-Click Credit Scan', 'Basic AI Advisor', 'Doc Vault Access']
    },
    {
      id: 'Silver',
      name: 'Silver Executive',
      price: prices.Silver,
      icon: <Star className="text-slate-400" />,
      color: 'border-slate-200 bg-slate-50/50',
      features: ['Unified Inbox Access', 'Neural Forensic Audit', 'Priority Underwriting', 'All Bronze Features']
    },
    {
      id: 'Gold',
      name: 'Gold Elite',
      price: prices.Gold,
      icon: <Crown className="text-yellow-500" />,
      color: 'border-yellow-400 bg-yellow-50/40',
      features: ['Nexus Sentinel Automation', '0% Success Fee (PG)', 'Dedicated Advisor', 'Daily Portfolio Scan']
    }
  ];

  const currentPlan = contact.subscription || {
    plan: 'Free',
    status: 'Active',
    renewalDate: 'N/A',
    price: 0,
    features: ['Basic Checklist', 'Public Grant Search']
  };

  const handleUpgrade = (plan: any) => {
    // If Admin waived fees for this client, skip Stripe check
    if (contact.feesWaived || plan.price === 0) {
        processUpgrade(plan);
        return;
    }

    const stripeKey = BACKEND_CONFIG.stripe.publicKey;
    if (!stripeKey || stripeKey === 'YOUR_STRIPE_PUBLIC_KEY') {
        alert("Payment Infrastructure Misconfigured. Link Stripe in Settings.");
        return;
    }

    setIsProcessing(plan.id);
    
    // Stripe Sim
    setTimeout(() => {
        processUpgrade(plan);
    }, 2000);
  };

  const processUpgrade = (plan: any) => {
    const newSub: Subscription = {
        plan: plan.id,
        status: 'Active',
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        price: contact.feesWaived ? 0 : plan.price,
        features: plan.features
    };
    
    const newActivity = {
        id: `sub_${Date.now()}`,
        type: 'system' as const,
        description: `Upgraded to ${plan.id} Membership Tier.`,
        date: new Date().toLocaleString(),
        user: 'Borrower'
    };

    onUpdateContact({
        ...contact,
        subscription: newSub,
        activities: [...(contact.activities || []), newActivity],
        notifications: [...(contact.notifications || []), {
            id: `sub_notif_${Date.now()}`,
            title: `Tier Elevated: ${plan.id}`,
            message: 'Welcome to your new capital infrastructure level.',
            date: 'Just now',
            read: false,
            type: 'success'
        }]
    });
    setIsProcessing(null);
    alert(`Success. Plan activated: ${plan.id}`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* HUD Header */}
      <div className="bg-slate-950 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><Crown size={280} /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="max-w-xl">
             <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-10 border border-emerald-500/20">
                Membership Core
             </div>
             <h2 className="text-5xl font-black mb-6 tracking-tighter uppercase leading-none">
                {currentPlan.plan} <span className="text-emerald-500">Infrastructure</span>
             </h2>
             <p className="text-slate-400 text-lg leading-relaxed font-medium">
                Current Level: <span className="text-white font-bold">{currentPlan.plan}</span>. 
                {currentPlan.plan === 'Free' ? " Upgrade to unlock autonomous underwriting and neural forensic auditing." : ` Protocol active until ${currentPlan.renewalDate}.`}
             </p>
          </div>
          {currentPlan.plan !== 'Free' && (
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 text-center shadow-inner min-w-[240px]">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Monthly Commitment</p>
                 <p className="text-4xl font-black text-white">
                    {contact.feesWaived ? '$0' : `$${currentPlan.price}`}
                    <span className="text-sm opacity-40">/mo</span>
                 </p>
                 {contact.feesWaived && <p className="text-[9px] text-emerald-400 font-bold uppercase mt-2">VIP Waiver Applied</p>}
                 <button className="mt-6 w-full py-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Manage Billing</button>
              </div>
          )}
        </div>
      </div>

      {/* Plan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map(plan => {
            const isCurrent = currentPlan.plan === plan.id;
            const isUpgradable = !isCurrent && (
                (currentPlan.plan === 'Free') ||
                (currentPlan.plan === 'Bronze' && (plan.id === 'Silver' || plan.id === 'Gold')) ||
                (currentPlan.plan === 'Silver' && plan.id === 'Gold')
            );

            return (
                <div key={plan.id} className={`p-10 rounded-[3rem] border-2 flex flex-col justify-between transition-all group ${plan.color} ${isCurrent ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-slate-100 hover:border-blue-400'}`}>
                    <div>
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-5 bg-white rounded-2xl shadow-xl group-hover:scale-110 transition-transform">
                                {plan.icon}
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black text-slate-900 tracking-tighter">
                                    {contact.feesWaived ? '$0' : `$${plan.price}`}
                                </p>
                                <p className="text-[9px] font-black text-slate-400 uppercase">Monthly Yield</p>
                                {contact.feesWaived && <p className="text-[8px] text-emerald-600 font-black uppercase">Waived</p>}
                            </div>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6">{plan.name}</h3>
                        <ul className="space-y-4 mb-10">
                            {plan.features.map((f, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                                    <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <button 
                        onClick={() => handleUpgrade(plan)}
                        disabled={isProcessing !== null || isCurrent || !isUpgradable}
                        className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 ${
                            isCurrent ? 'bg-emerald-50 text-white cursor-default' : 
                            isUpgradable ? 'bg-slate-950 text-white hover:bg-blue-600' : 
                            'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        {isProcessing === plan.id ? <RefreshCw className="animate-spin" size={16}/> : isCurrent ? <CheckCircle size={16}/> : (contact.feesWaived ? <Gift size={16}/> : <Smartphone size={16}/>)}
                        {isCurrent ? 'Current Protocol' : isProcessing === plan.id ? 'Connecting Stripe...' : contact.feesWaived ? 'Activate Waived Tier' : 'Activate Tier'}
                    </button>
                </div>
            );
        })}
      </div>

      <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Layers size={140} /></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
               <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Enterprise Infrastructure</h3>
               <p className="text-blue-100 font-medium leading-relaxed max-w-xl italic">
                  "Need a custom protocol with White-Glove underwriting for deals over $1M? Message your dedicated strategist to deploy a custom capital stack."
               </p>
            </div>
            <button className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl transform hover:-translate-y-1 transition-all">
                Contact Enterprise
            </button>
         </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;