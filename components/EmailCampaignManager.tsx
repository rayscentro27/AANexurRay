
import React, { useState } from 'react';
import { DripCampaign, EmailStep, Contact } from '../types';
import { 
  Mail, Plus, Trash2, Edit2, Play, Pause, Sparkles, RefreshCw, 
  Send, BarChart2, Users, Clock, ArrowRight, Save, X, ChevronRight,
  Layout, MessageSquare, AlertCircle
} from 'lucide-react';
import * as geminiService from '../services/geminiService';

interface EmailCampaignManagerProps {
  contacts: Contact[];
  agencyName: string;
}

const MOCK_CAMPAIGNS: DripCampaign[] = [
  {
    id: 'camp_1',
    name: 'New Lead Welcome',
    status: 'Active',
    audience: 'Lead',
    steps: [
      { id: 's1', subject: 'Welcome to Nexus Funding', body: 'Hi there, we are excited to help you grow your business...', delayDays: 0 },
      { id: 's2', subject: 'Quick question about your revenue', body: 'Hi, just checking in to see if you have your bank statements ready...', delayDays: 2 }
    ],
    stats: { sent: 142, opened: 89, clicked: 24 }
  },
  {
    id: 'camp_2',
    name: 'Cold Lead Re-engagement',
    status: 'Paused',
    audience: 'Inactive',
    steps: [
      { id: 's3', subject: 'Still looking for capital?', body: 'Rates just dropped! Let\'s chat about your options.', delayDays: 0 }
    ],
    stats: { sent: 50, opened: 12, clicked: 2 }
  }
];

const EmailCampaignManager: React.FC<EmailCampaignManagerProps> = ({ contacts, agencyName }) => {
  const [campaigns, setCampaigns] = useState<DripCampaign[]>(MOCK_CAMPAIGNS);
  const [isEditing, setIsEditing] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<DripCampaign | null>(null);
  
  // AI Generation State
  const [goal, setGoal] = useState('');
  const [audience, setAudience] = useState('New Leads');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCreateNew = () => {
    setActiveCampaign({
      id: `camp_${Date.now()}`,
      name: 'Untitled Campaign',
      status: 'Draft',
      audience: 'Lead',
      steps: [],
      stats: { sent: 0, opened: 0, clicked: 0 }
    });
    setIsEditing(true);
  };

  const handleGenerateSequence = async () => {
    if (!goal) return;
    setIsGenerating(true);
    try {
      const sequence = await geminiService.generateEmailDripSequence(goal, audience, agencyName);
      if (activeCampaign && sequence) {
        const stepsWithIds = sequence.map((s, i) => ({ ...s, id: `s_${Date.now()}_${i}` }));
        setActiveCampaign({ ...activeCampaign, steps: stepsWithIds });
      }
    } catch (e) {
      console.error(e);
      alert("AI sequence generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (activeCampaign) {
      const exists = campaigns.find(c => c.id === activeCampaign.id);
      if (exists) {
        setCampaigns(campaigns.map(c => c.id === activeCampaign.id ? activeCampaign : c));
      } else {
        setCampaigns([activeCampaign, ...campaigns]);
      }
      setIsEditing(false);
      setActiveCampaign(null);
      setGoal('');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      setCampaigns(campaigns.filter(c => c.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    setCampaigns(campaigns.map(c => {
      if (c.id === id) {
        const newStatus = c.status === 'Active' ? 'Paused' : 'Active';
        return { ...c, status: newStatus as any };
      }
      return c;
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {!isEditing ? (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Email Automations</h2>
              <p className="text-sm text-slate-500 font-medium">Manage your automated email touchpoints and drips.</p>
            </div>
            <button 
              onClick={handleCreateNew}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
            >
              <Plus size={18} /> New Campaign
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map(camp => (
              <div key={camp.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-2xl ${camp.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                    <Mail size={24} />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleStatus(camp.id)}
                      className={`p-2 rounded-xl transition-all ${camp.status === 'Active' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                    >
                      {camp.status === 'Active' ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <button onClick={() => { setActiveCampaign(camp); setIsEditing(true); }} className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(camp.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-1 uppercase tracking-tight truncate">{camp.name}</h3>
                <div className="flex items-center gap-2 mb-6">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${camp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                    {camp.status}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">• {camp.steps.length} Steps</span>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-slate-50 pt-6">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sent</p>
                    <p className="text-lg font-black text-slate-800">{camp.stats.sent}</p>
                  </div>
                  <div className="text-center border-x border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Open</p>
                    <p className="text-lg font-black text-blue-600">{Math.round((camp.stats.opened/camp.stats.sent)*100 || 0)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Click</p>
                    <p className="text-lg font-black text-emerald-600">{Math.round((camp.stats.clicked/camp.stats.opened)*100 || 0)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-slide-in-right">
          <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 transition-all"><X size={24} /></button>
              <input 
                className="text-2xl font-black text-slate-900 bg-transparent border-none focus:ring-0 p-0 uppercase tracking-tight placeholder-slate-300 w-full md:w-96"
                value={activeCampaign?.name}
                onChange={(e) => setActiveCampaign({ ...activeCampaign!, name: e.target.value })}
                placeholder="Campaign Name"
              />
            </div>
            <button onClick={handleSave} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg flex items-center gap-2 transition-all">
              <Save size={18} /> Save Campaign
            </button>
          </div>

          <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Sequence Editor */}
            <div className="lg:col-span-8 space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Layout size={16} /> Campaign Sequence
                </h3>
                <button 
                  onClick={() => {
                    const newStep: EmailStep = { id: `step_${Date.now()}`, subject: 'New Email', body: '', delayDays: 1 };
                    setActiveCampaign({ ...activeCampaign!, steps: [...activeCampaign!.steps, newStep] });
                  }}
                  className="text-blue-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-1 hover:underline"
                >
                  <Plus size={14} /> Add Manual Step
                </button>
              </div>

              <div className="space-y-6 relative">
                {activeCampaign?.steps.length === 0 && (
                  <div className="py-20 text-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center">
                    <Mail size={48} className="opacity-10 mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest">No steps in sequence</p>
                    <p className="text-xs mt-1">Use the AI Drafter to build a high-converting sequence.</p>
                  </div>
                )}

                {activeCampaign?.steps.map((step, idx) => (
                  <React.Fragment key={step.id}>
                    {idx > 0 && (
                      <div className="flex justify-center">
                        <div className="bg-slate-100 px-4 py-2 rounded-full text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 border border-slate-200 shadow-sm">
                          <Clock size={12} /> Wait {step.delayDays} days
                        </div>
                      </div>
                    )}
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all relative group">
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all flex gap-2">
                        <button 
                          onClick={() => {
                            const newSteps = activeCampaign.steps.filter(s => s.id !== step.id);
                            setActiveCampaign({ ...activeCampaign, steps: newSteps });
                          }}
                          className="p-2 text-slate-300 hover:text-red-500 rounded-xl"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject Line</label>
                          <input 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                            value={step.subject}
                            onChange={(e) => {
                              const newSteps = [...activeCampaign.steps];
                              newSteps[idx].subject = e.target.value;
                              setActiveCampaign({ ...activeCampaign, steps: newSteps });
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Body</label>
                          <textarea 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium h-48 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                            value={step.body}
                            onChange={(e) => {
                              const newSteps = [...activeCampaign.steps];
                              newSteps[idx].body = e.target.value;
                              setActiveCampaign({ ...activeCampaign, steps: newSteps });
                            }}
                          />
                        </div>
                        {idx > 0 && (
                          <div className="w-32">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Delay (Days)</label>
                            <input 
                              type="number"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold"
                              value={step.delayDays}
                              onChange={(e) => {
                                const newSteps = [...activeCampaign.steps];
                                newSteps[idx].delayDays = Number(e.target.value);
                                setActiveCampaign({ ...activeCampaign, steps: newSteps });
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* AI Sidebar */}
            <div className="lg:col-span-4">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-white/5 h-fit sticky top-8">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Sparkles size={120} /></div>
                
                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <Sparkles size={18} /> Neural Sequence Drafter
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Campaign Goal</label>
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 h-32 resize-none text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-600"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="e.g. Re-engage cold MCA leads who were funded 6 months ago with a new offer."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Audience</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                    >
                      <option className="bg-slate-900">New Leads</option>
                      <option className="bg-slate-900">Inactive Clients</option>
                      <option className="bg-slate-900">Referral Partners</option>
                      <option className="bg-slate-900">Declined (Recovery)</option>
                    </select>
                  </div>

                  <button 
                    onClick={handleGenerateSequence}
                    disabled={isGenerating || !goal}
                    className="w-full py-5 bg-emerald-500 text-slate-950 font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-2xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50 transform active:scale-95"
                  >
                    {isGenerating ? <RefreshCw className="animate-spin" size={18}/> : <MessageSquare size={18} />}
                    {isGenerating ? 'Synthesizing...' : 'Draft AI Sequence'}
                  </button>

                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mt-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Pro Tip</p>
                    <p className="text-xs text-slate-400 leading-relaxed italic">"Adding a personalized 'icebreaker' in the body can increase click-through rates by up to 34%."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailCampaignManager;
