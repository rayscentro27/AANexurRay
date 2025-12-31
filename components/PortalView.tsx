
import React, { useState, useEffect } from 'react';
import { 
    CheckCircle, Clock, FileText, MessageSquare, PlayCircle, ExternalLink, CheckSquare, 
    Square, Target, Calendar, Wallet as WalletIcon, Edit2, Save, X, Receipt, CreditCard, 
    HelpCircle, Upload, Loader, FileSearch, Lock, ChevronRight, Info, LayoutDashboard, 
    GraduationCap, BookOpen, Play, Gauge, TrendingUp, Users, Bell, Building2, Award, 
    Gavel, Percent, Video, Download, MessageCircle, LogOut, Smartphone, Sparkles, 
    DollarSign, VideoOff, Layers, ArrowRight, ShieldCheck, Activity, BrainCircuit, RefreshCw, AlertTriangle, Star,
    TrendingUpDown, Mic, UserCheck, Circle, ListChecks, Trophy
} from 'lucide-react';
import { Contact, ClientTask, Invoice, ClientDocument, AgencyBranding, Course, FundingGoal, CreditAnalysis, FundingOffer } from '../types';
import DocumentVault from './DocumentVault';
import BusinessProfile from './BusinessProfile';
import OfferManager from './OfferManager';
import BankConnect from './BankConnect';
import MessageCenter from './MessageCenter';
import TierProgressWidget from './TierProgressWidget';
import LoyaltyLevelWidget from './LoyaltyLevelWidget';
import ClientCardSuggestions from './ClientCardSuggestions';
import LegalCompliance from './LegalCompliance';
import GrantManager from './GrantManager';
import ClientInvoices from './ClientInvoices';
import SubscriptionManager from './SubscriptionManager';
import Tier2Strategy from './Tier2Strategy';
import InvestmentLab from './InvestmentLab';
import ReferralHub from './ReferralHub';
import NexusPulse from './NexusPulse';
import VoiceConcierge from './VoiceConcierge';
import IdentityVerification from './IdentityVerification';
import { GoogleGenAI } from '@google/genai';
import * as geminiService from '../services/geminiService';

interface PortalViewProps {
  contact: Contact;
  onUpdateContact: (contact: Contact) => void;
  branding: AgencyBranding;
  onLogout: () => void;
  isAdminPreview?: boolean;
  availableCourses?: Course[];
}

const PortalView: React.FC<PortalViewProps> = ({ contact, onUpdateContact, branding, onLogout, isAdminPreview, availableCourses = [] }) => {
  const [activeTab, setActiveTab] = useState<'pulse' | 'profile' | 'roadmap' | 'vault' | 'offers' | 'messages' | 'cards' | 'legal' | 'grants' | 'settlement' | 'subscription' | 'tier2' | 'invest' | 'partner' | 'kyc'>('pulse');
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  
  const isFunded = contact.fundedDeals && contact.fundedDeals.length > 0;
  const pendingInvoices = contact.invoices?.filter(i => i.status !== 'Paid').length || 0;

  const tabs = [
    { id: 'pulse', label: 'Briefing', icon: <LayoutDashboard size={18}/> },
    { id: 'subscription', label: 'Plan', icon: <Layers size={18}/> },
    { id: 'kyc', label: 'Identity', icon: <UserCheck size={18}/> },
    { id: 'profile', label: 'Narrative', icon: <ShieldCheck size={18}/> },
    { id: 'roadmap', label: 'Tiers', icon: <TrendingUp size={18}/> },
    { id: 'vault', label: 'Vault', icon: <FileText size={18}/> },
    { id: 'grants', label: 'Grants', icon: <Star size={18}/> },
    { id: 'offers', label: 'Capital', icon: <DollarSign size={18}/> },
    { id: 'invest', label: 'Wealth', icon: <Sparkles size={18}/>, visible: isFunded },
    { id: 'tier2', label: 'Growth', icon: <TrendingUp size={18}/>, visible: isFunded },
    { id: 'partner', label: 'Node', icon: <Users size={18}/> },
    { id: 'settlement', label: 'Settlement', icon: <Receipt size={18}/>, badge: pendingInvoices },
    { id: 'legal', label: 'Legal', icon: <Gavel size={18}/> },
    { id: 'messages', label: 'Advisor', icon: <MessageCircle size={18}/> },
  ].filter(t => t.visible !== false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-10 font-sans text-slate-900">
       
       {/* Global HUD */}
       <div className="bg-slate-950 text-white px-6 md:px-8 py-8 md:rounded-b-[3rem] shadow-2xl relative overflow-hidden flex-shrink-0 pt-12 md:pt-10">
          <div className="absolute top-[-50%] right-[-10%] w-full h-[200%] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full"></div>
          
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
            <div className="flex items-center gap-4 w-full md:w-auto">
               <div className="bg-emerald-500 p-2.5 md:p-3 rounded-2xl shadow-lg transform rotate-3">
                  <Building2 size={20} className="text-slate-950 md:w-6 md:h-6" />
               </div>
               <div className="flex-1">
                  <span className="text-xl md:text-2xl font-black tracking-tighter uppercase leading-none block">
                     {branding?.name.split(' ')[0] || 'Nexus'}<span className="text-emerald-500">{branding?.name.split(' ')[1] || 'OS'}</span>
                  </span>
                  <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">V2.5 Protocol • SECURE</p>
               </div>
               <button onClick={() => setIsVoiceOpen(true)} className="md:hidden p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 active:scale-90 transition-all">
                  <Mic size={20}/>
               </button>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
                <button onClick={() => setIsVoiceOpen(true)} className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500/20 transition-all active:scale-95">
                    <Mic size={14}/> Advisor Live
                </button>
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-emerald-500 shadow-xl">{contact.name[0]}</div>
            </div>
          </div>
       </div>

       {/* Mobile-Centric Sub-Nav Ribbon */}
       <div className="max-w-7xl mx-auto w-full px-4 -mt-6 z-30">
          <div className="bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] p-1.5 shadow-2xl flex overflow-x-auto no-scrollbar gap-1.5 snap-x">
             {tabs.map(tab => (
               <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id as any)} 
                  className={`py-3.5 px-6 rounded-[1.2rem] md:rounded-[1.5rem] text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap snap-center relative ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}
               >
                 {tab.icon} {tab.label}
                 {tab.badge ? <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center border-2 border-white shadow-lg">{tab.badge}</span> : null}
               </button>
             ))}
          </div>
       </div>

       {/* Main Viewport */}
       <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 pt-8 md:pt-12 pb-20">
          <div className="h-full">
            {activeTab === 'pulse' && <NexusPulse contact={contact} onOpenVoice={() => setIsVoiceOpen(true)} />}
            {activeTab === 'kyc' && <IdentityVerification contact={contact} onUpdateContact={onUpdateContact} />}
            {activeTab === 'grants' && <GrantManager contacts={[contact]} onUpdateContact={onUpdateContact} />}
            {activeTab === 'vault' && <DocumentVault contact={contact} onUpdateContact={onUpdateContact} readOnly={true} />}
            {activeTab === 'profile' && <BusinessProfile contact={contact} onUpdateContact={onUpdateContact} />}
            {activeTab === 'offers' && <OfferManager contact={contact} onUpdateContact={onUpdateContact} />}
            {activeTab === 'settlement' && <ClientInvoices contact={contact} onUpdateContact={onUpdateContact} />}
            {activeTab === 'subscription' && <SubscriptionManager contact={contact} onUpdateContact={onUpdateContact} branding={branding} />}
            {activeTab === 'legal' && <LegalCompliance contact={contact} onUpdateContact={onUpdateContact} />}
            {activeTab === 'messages' && <div className="h-[75vh]"><MessageCenter contact={contact} onUpdateContact={onUpdateContact} currentUserRole="client" /></div>}
            {activeTab === 'tier2' && <Tier2Strategy contact={contact} onUpdateContact={onUpdateContact} />}
            {activeTab === 'invest' && <InvestmentLab contact={contact} onUpdateContact={onUpdateContact} />}
            {activeTab === 'partner' && <ReferralHub contact={contact} />}
            
            {activeTab === 'roadmap' && (
                <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-16 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><GraduationCap size={200} /></div>
                        <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter uppercase leading-none">The <span className="text-emerald-500">Tier 4</span> Roadmap</h2>
                        <p className="text-slate-400 text-sm md:text-xl font-medium leading-relaxed">Systematic business credit engineering.</p>
                    </div>
                    {/* Simplified tasks for mobile focus */}
                    <div className="grid grid-cols-1 gap-4 px-2">
                        {contact.clientTasks.map(t => (
                            <div key={t.id} className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 shadow-sm active:scale-98 transition-all">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.status === 'completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-300'}`}>
                                    {t.status === 'completed' ? <CheckCircle size={20}/> : <Circle size={20}/>}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-black text-xs uppercase tracking-tight truncate text-slate-800">{t.title}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{t.type} • {t.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
       </div>
       
       <VoiceConcierge isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} context={{ name: contact.name, company: contact.company, bankability: contact.aiScore || 65 }} />
    </div>
  );
};

export default PortalView;
