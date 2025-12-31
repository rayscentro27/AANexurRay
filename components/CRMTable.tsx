
import React, { useState } from 'react';
import { Contact, ClientTask, EnrichedData, FundedDeal, ApplicationSubmission } from '../types';
import { 
  MoreHorizontal, Search, Sparkles, X, LayoutList, Kanban, 
  Target, Video, RefreshCw, Check, ArrowRight, Globe, 
  UserPlus, ShieldAlert, BarChart3, TrendingUp, Zap, Users, Phone, Mail, Building2, Award,
  CheckCircle, Activity, Gift, BrainCircuit, Layers, Briefcase, FileText, ExternalLink, ChevronRight
} from 'lucide-react';
import * as geminiService from '../services/geminiService';
import ActivityTimeline from './ActivityTimeline';
import MessageCenter from './MessageCenter';
import DocumentVault from './DocumentVault';
import SalesBattleCard from './SalesBattleCard';

interface CRMTableProps {
  contacts: Contact[];
  onUpdateContact: (contact: Contact) => void;
  onAddContact: (contact: Partial<Contact>) => void;
}

const CRMTable: React.FC<CRMTableProps> = ({ contacts = [], onUpdateContact, onAddContact }) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'relations' | 'roadmap' | 'messages' | 'documents'>('overview');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showBattleCard, setShowBattleCard] = useState(false);
  
  // Ghost Underwriter State
  const [isGhostActive, setIsGhostActive] = useState<string | null>(null);

  const displayContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const triggerGhostUnderwriter = async (contact: Contact) => {
    setIsGhostActive(contact.id);
    try {
        // Silent background logic: Recalculate AI Score based on any manual field changes
        const currentScore = contact.aiScore || 50;
        const newScore = Math.min(100, Math.max(0, (contact.revenue || 0) / 1000 + (contact.creditAnalysis?.score || 600) / 10));
        
        onUpdateContact({
            ...contact,
            aiScore: Math.round(newScore),
            activities: [
                ...(contact.activities || []),
                {
                    id: `ghost_${Date.now()}`,
                    type: 'system',
                    description: `Ghost Underwriter: Recalculated risk index based on field drift. Score updated from ${currentScore} to ${Math.round(newScore)}.`,
                    date: new Date().toLocaleString(),
                    user: 'Sentinel'
                }
            ]
        });
    } finally {
        setTimeout(() => setIsGhostActive(null), 1500);
    }
  };

  const handleFieldBlur = (contact: Contact) => {
      triggerGhostUnderwriter(contact);
  };

  const generateBattleCard = async (contact: Contact) => {
    setIsScanning(true);
    const card = await geminiService.generateSalesBattleCard(contact);
    if (card) {
        const updated = { ...contact, battleCard: card };
        onUpdateContact(updated);
        setSelectedContact(updated);
        setShowBattleCard(true);
    }
    setIsScanning(false);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in relative">
       {/* Global Header */}
       <div className="p-4 md:p-6 border-b border-slate-200 bg-white flex flex-col md:flex-row justify-between items-center rounded-t-2xl md:rounded-t-[2.5rem] shadow-sm gap-4">
          <div className="flex w-full md:w-auto gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button onClick={() => setViewMode('list')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}><LayoutList size={14}/> List</button>
            <button onClick={() => setViewMode('board')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${viewMode === 'board' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}><Kanban size={14}/> Board</button>
          </div>
          <div className="relative w-full md:w-96 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" size={16} />
             <input type="text" placeholder="Search pipeline..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <button onClick={() => onAddContact({ name: 'New Lead', company: 'Draft Entity', status: 'Lead', value: 0 })} className="w-full md:w-auto bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"><UserPlus size={16}/> Create Lead</button>
       </div>

       {/* List / Board Viewport */}
       <div className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50/40">
          {displayContacts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Users size={64} className="opacity-10 mb-4" />
                <p className="text-sm font-black uppercase tracking-[0.2em]">No Matches Found</p>
            </div>
          ) : viewMode === 'list' ? (
             <div className="bg-white border border-slate-200 rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-xl">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0 min-w-[700px]">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-4 md:p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Entity & Contact</th>
                                <th className="p-4 md:p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Neural Intel</th>
                                <th className="p-4 md:p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Phase</th>
                                <th className="p-4 md:p-6 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Magnitude</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {displayContacts.map(c => (
                                <tr key={c.id} onClick={() => setSelectedContact(c)} className="hover:bg-slate-50/80 cursor-pointer transition-all group">
                                    <td className="p-4 md:p-6">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <div className="font-black text-slate-900 uppercase tracking-tight text-sm group-hover:text-blue-600 transition-colors">{c.company}</div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">{c.name}</div>
                                            </div>
                                            {isGhostActive === c.id && <BrainCircuit size={14} className="text-indigo-600 animate-pulse" />}
                                        </div>
                                    </td>
                                    <td className="p-4 md:p-6 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {c.aiPriority === 'Hot' && <span className="bg-red-50 text-red-600 px-2 py-1 rounded-lg text-[9px] font-black uppercase border border-red-100 animate-pulse">Hot</span>}
                                            {c.aiScore && <div className={`text-[10px] font-black px-2 py-1 rounded-lg border ${c.aiScore > 75 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>Score: {c.aiScore}</div>}
                                        </div>
                                    </td>
                                    <td className="p-4 md:p-6 text-center">
                                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${c.status === 'Closed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{c.status}</span>
                                    </td>
                                    <td className="p-4 md:p-6 text-right font-black text-slate-900 text-sm tracking-tight">${c.value?.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
          ) : (
            <div className="flex gap-4 md:gap-8 h-full overflow-x-auto no-scrollbar pb-6 snap-x">
                {['Lead', 'Active', 'Negotiation', 'Closed'].map(status => (
                    <div key={status} className="w-[280px] md:w-80 flex-shrink-0 space-y-4 snap-center">
                        <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 px-2 flex justify-between items-center">
                            {status}
                            <span className="bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full text-[9px]">{displayContacts.filter(c => c.status === status).length}</span>
                        </h4>
                        <div className="bg-slate-100/50 p-2 rounded-2xl border border-dashed border-slate-300 min-h-[400px] space-y-3">
                            {displayContacts.filter(c => c.status === status).map(c => (
                                <div key={c.id} onClick={() => setSelectedContact(c)} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-500 transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h5 className="font-black text-slate-900 uppercase tracking-tight text-xs truncate group-hover:text-blue-600">{c.company}</h5>
                                        {c.aiPriority === 'Hot' && <Zap size={10} className="text-red-500 fill-current" />}
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">${c.value?.toLocaleString()} Magnitude</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
          )}
       </div>

       {/* Neural Detail Panel (Full-Screen Mobile) */}
       {selectedContact && (
          <div className="fixed inset-0 z-[100] flex justify-end">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => {setSelectedContact(null); setShowBattleCard(false);}} />
             <div className="relative w-full md:max-w-4xl bg-white h-full shadow-2xl flex flex-col animate-slide-in-right overflow-hidden md:m-4 md:rounded-[3rem]">
                
                {showBattleCard && selectedContact.battleCard ? (
                    <SalesBattleCard card={selectedContact.battleCard} onLaunchMeeting={() => { setSelectedContact(null); setShowBattleCard(false); }} />
                ) : (
                  <>
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-950 text-white shrink-0 pt-12 md:pt-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 md:w-20 md:h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-xl md:text-4xl font-black transform rotate-2">{selectedContact.name.charAt(0)}</div>
                            <div>
                                <h2 className="text-xl md:text-4xl font-black uppercase tracking-tighter truncate max-w-[200px] md:max-w-none">{selectedContact.company}</h2>
                                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{selectedContact.name} • {selectedContact.email}</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedContact(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X size={24}/></button>
                    </div>

                    {/* Navigation Ribbon */}
                    <div className="flex bg-white border-b border-slate-100 px-4 overflow-x-auto no-scrollbar shrink-0 snap-x">
                        {['overview', 'relations', 'roadmap', 'messages', 'documents'].map(t => (
                            <button key={t} onClick={() => setActiveTab(t as any)} className={`px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] border-b-4 transition-all whitespace-nowrap snap-center ${activeTab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                                {t}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50/30 custom-scrollbar">
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group border border-white/5">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><BarChart3 size={120} /></div>
                                        <div className="relative z-10">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-6">Pipeline Profile</p>
                                            <div className="space-y-6">
                                                <div>
                                                    <p className="text-[9px] text-slate-500 uppercase mb-1">Deal Magnitude</p>
                                                    <input 
                                                        type="number" 
                                                        value={selectedContact.value} 
                                                        onBlur={() => handleFieldBlur(selectedContact)}
                                                        onChange={e => setSelectedContact({...selectedContact, value: Number(e.target.value)})}
                                                        className="bg-transparent border-b border-white/10 text-3xl font-black text-blue-400 outline-none w-full focus:border-blue-400 transition-colors" 
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-500 uppercase mb-1">Revenue ($/mo)</p>
                                                    <input 
                                                        type="number" 
                                                        value={selectedContact.revenue} 
                                                        onBlur={() => handleFieldBlur(selectedContact)}
                                                        onChange={e => setSelectedContact({...selectedContact, revenue: Number(e.target.value)})}
                                                        className="bg-transparent border-b border-white/10 text-2xl font-black text-emerald-400 outline-none w-full focus:border-emerald-400 transition-colors" 
                                                    />
                                                </div>
                                            </div>
                                            <button onClick={() => generateBattleCard(selectedContact)} disabled={isScanning} className="w-full mt-10 bg-blue-600 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center justify-center gap-2 hover:bg-blue-500 transform active:scale-95 transition-all">
                                                {isScanning ? <RefreshCw className="animate-spin" size={16}/> : <Sparkles size={16}/>} Synthesize Battle-Card
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm">
                                        <div className="flex justify-between items-center mb-6">
                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Zap size={14}/> Operational Status</h5>
                                        </div>
                                        <select value={selectedContact.status} onChange={e => onUpdateContact({...selectedContact, status: e.target.value as any})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                                            <option>Lead</option><option>Active</option><option>Negotiation</option><option>Closed</option>
                                        </select>
                                    </div>

                                    {selectedContact.aiReason && (
                                        <div className="bg-red-50 p-6 rounded-3xl border border-red-100 shadow-inner">
                                            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2 mb-3"><ShieldAlert size={14}/> Risk Escalation</p>
                                            <p className="text-xs text-red-800 font-medium leading-relaxed italic">"{selectedContact.aiReason}"</p>
                                        </div>
                                    )}
                                </div>
                                <div className="lg:col-span-8">
                                    <ActivityTimeline contact={selectedContact} onAddActivity={(id, act) => onUpdateContact({...selectedContact, activities: [...(selectedContact.activities || []), act]})} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'relations' && (
                            <div className="space-y-10 animate-fade-in">
                                {/* Entity Assets (Funded Deals) */}
                                <section>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2 px-2">
                                        <Briefcase size={16} className="text-emerald-500" /> Capital Assets (Active)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {selectedContact.fundedDeals?.length ? selectedContact.fundedDeals.map(deal => (
                                            <div key={deal.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between group hover:border-emerald-400 transition-all">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight">{deal.lenderName}</h4>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-widest">Funded {deal.fundedDate}</p>
                                                    </div>
                                                    <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-500 shadow-inner"><CheckCircle size={22} /></div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                                                    <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Limit</p><p className="text-lg font-black text-slate-900">${deal.originalAmount.toLocaleString()}</p></div>
                                                    <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Current Bal</p><p className="text-lg font-black text-blue-600">${deal.currentBalance.toLocaleString()}</p></div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="md:col-span-2 p-16 border-2 border-dashed border-slate-200 rounded-[3rem] text-center text-slate-400 flex flex-col items-center">
                                                <Briefcase size={40} className="mb-4 opacity-10" />
                                                <p className="text-xs font-black uppercase tracking-widest">No Active Asset Ledger</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Transmission Queue (Submissions) */}
                                <section>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2 px-2">
                                        <Layers size={16} className="text-blue-500" /> Transmission Pipeline
                                    </h3>
                                    <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                                        {selectedContact.submissions?.length ? (
                                            <div className="overflow-x-auto no-scrollbar">
                                                <table className="w-full text-left min-w-[500px]">
                                                    <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        <tr><th className="px-8 py-5">Lender Entity</th><th className="px-8 py-5">Transmit Date</th><th className="px-8 py-5 text-right">Result</th></tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50">
                                                        {selectedContact.submissions.map(sub => (
                                                            <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                                                                <td className="px-8 py-6 flex items-center gap-4">
                                                                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs uppercase shadow-lg transform -rotate-3">{sub.lenderName[0]}</div>
                                                                    <span className="font-black text-slate-800 text-sm uppercase tracking-tight">{sub.lenderName}</span>
                                                                </td>
                                                                <td className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">{sub.dateSent}</td>
                                                                <td className="px-8 py-6 text-right">
                                                                    <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${sub.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{sub.status}</span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="p-20 text-center flex flex-col items-center">
                                                <FileText size={40} className="mb-4 opacity-10" />
                                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Zero Transmissions Logged</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Entity Narrative (Notes) */}
                                <section>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2 px-2">
                                        <Zap size={16} className="text-amber-500" /> Neural Context Dossier
                                    </h3>
                                    <div className="bg-slate-950 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5 group">
                                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><BrainCircuit size={180} /></div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-center mb-8">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Master Archive</p>
                                                <button className="text-[9px] font-black uppercase text-blue-400 hover:text-blue-300 transition-colors">Edit Subject Notes</button>
                                            </div>
                                            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 h-48 overflow-y-auto no-scrollbar font-medium text-slate-300 text-base italic leading-relaxed shadow-inner">
                                                {selectedContact.notes || 'Zero narrative context on file for this entity.'}
                                            </div>
                                            <div className="mt-8 flex gap-4">
                                               <button className="flex-1 bg-white/5 hover:bg-white/10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center justify-center gap-2">
                                                  <Sparkles size={14}/> Summarize History
                                               </button>
                                               <button className="flex-1 bg-white/5 hover:bg-white/10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center justify-center gap-2">
                                                  <ExternalLink size={14}/> Export Dossier
                                               </button>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'documents' && <DocumentVault contact={selectedContact} onUpdateContact={onUpdateContact} />}
                        {activeTab === 'messages' && <MessageCenter contact={selectedContact} onUpdateContact={onUpdateContact} currentUserRole="admin" />}
                        {activeTab === 'roadmap' && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="bg-indigo-950 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><Activity size={220}/></div>
                                    <h3 className="text-3xl font-black uppercase tracking-tighter mb-6 leading-none">Strategic Forecast</h3>
                                    <p className="text-indigo-100 text-xl font-medium italic opacity-80 leading-relaxed">"Entity closing velocity at 84%. Follow the EIN verification protocol today to secure Tier 1 capital by Friday."</p>
                                </div>
                                <div className="text-center text-slate-400 py-32 flex flex-col items-center">
                                    <RefreshCw className="animate-spin mb-4" size={32}/>
                                    <p className="text-xs font-black uppercase tracking-widest">Constructing Visual Strategy Matrix...</p>
                                </div>
                            </div>
                        )}
                    </div>
                  </>
                )}
             </div>
          </div>
       )}
    </div>
  );
};

export default CRMTable;
