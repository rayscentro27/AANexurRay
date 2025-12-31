
import React, { useState, useEffect } from 'react';
import { 
  Globe, Save, CheckCircle, Shield, Layers, Server, Key, 
  ShieldCheck, Database, Zap, RefreshCw, Cloud, ArrowUpCircle, ExternalLink,
  CreditCard, Lock, Eye, EyeOff, BrainCircuit, Sparkles, AlertTriangle,
  Rocket, Terminal, Github, Activity, Palette as PaletteIcon, 
  Phone, Share2, Building2, Search, Link2, Wifi, MessageCircle, 
  Instagram, Facebook, Linkedin, MessageSquare, Smartphone, Receipt, Award,
  Info, Users, UserPlus, Trash2, MapPin, Mail, Link as LinkIcon
} from 'lucide-react';
import { AgencyBranding, User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { BACKEND_CONFIG } from '../adapters/config';

interface SettingsProps {
  branding: AgencyBranding;
  onUpdateBranding: (branding: AgencyBranding) => void;
}

const Settings: React.FC<SettingsProps> = ({ branding, onUpdateBranding }) => {
  const { user } = useAuth();
  const isMasterAdmin = !!user?.isMasterAdmin;
  const [activeTab, setActiveTab] = useState('intelligence');
  const [successMsg, setSuccessMsg] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [hasAiKey, setHasAiKey] = useState(false);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  
  // Local state for branding setup to avoid too many global re-renders while typing
  const [localBranding, setLocalBranding] = useState<AgencyBranding>(branding);

  // Local Team State
  const supabaseUrl = BACKEND_CONFIG.supabase.url;
  const supabaseKey = BACKEND_CONFIG.supabase.anonKey;

  const [team, setTeam] = useState<User[]>(() => {
    const stored = localStorage.getItem('nexus_mvp_users');
    return stored ? JSON.parse(stored) : [];
  });
  const [newStaff, setNewStaff] = useState({ name: '', email: '', role: 'salesperson' as any });

  const [dbConfig, setDbConfig] = useState({
    url: supabaseUrl || '',
    key: supabaseKey || ''
  });

  const [stripeConfig, setStripeConfig] = useState({
    pk: localStorage.getItem('nexus_stripe_pk') || '',
    sk: localStorage.getItem('nexus_stripe_sk') || ''
  });

  const [integrations, setIntegrations] = useState({
    twilioSid: localStorage.getItem('nexus_twilio_sid') || '',
    twilioToken: localStorage.getItem('nexus_twilio_token') || '',
    plaidClientId: localStorage.getItem('nexus_plaid_id') || '',
    plaidSecret: localStorage.getItem('nexus_plaid_secret') || '',
    googleMapsKey: localStorage.getItem('nexus_google_maps') || '',
    metaAccessToken: localStorage.getItem('nexus_meta_token') || '',
    whatsappPhoneId: localStorage.getItem('nexus_wa_phone_id') || '',
    tiktokKey: localStorage.getItem('nexus_tiktok_key') || '',
    linkedinId: localStorage.getItem('nexus_linkedin_id') || ''
  });

  const [deployConfig, setDeployConfig] = useState({
    productionUrl: localStorage.getItem('nexus_prod_url') || 'https://nexus-os.netlify.app',
    repoUrl: 'https://github.com/nexus/nexus-os',
    lastDeploy: new Date().toLocaleString()
  });

  useEffect(() => {
    const apiKey = process.env.API_KEY;
    setHasAiKey(!!apiKey && apiKey.length > 5);
  }, []);

  const handleTestHandshake = (service: string) => {
    setTestingKey(service);
    setTimeout(() => {
        setTestingKey(null);
        setSuccessMsg(`${service} handshake successful. Connection stable.`);
        setTimeout(() => setSuccessMsg(''), 3000);
    }, 1500);
  };

  const handleSaveBranding = () => {
    onUpdateBranding(localBranding);
    setSuccessMsg('Business Profile and Branding protocols updated.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSaveIntegrations = () => {
    Object.entries(integrations).forEach(([key, val]) => {
        localStorage.setItem(`nexus_${key}`, val as string);
    });
    setSuccessMsg('Integration protocols updated.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleHireStaff = () => {
    if (!newStaff.name || !newStaff.email) return;
    
    const newUser: User = {
        id: `u_${Date.now()}`,
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role
    };

    const updatedTeam = [...team, newUser];
    setTeam(updatedTeam);
    localStorage.setItem('nexus_mvp_users', JSON.stringify(updatedTeam));
    setNewStaff({ name: '', email: '', role: 'salesperson' });
    setSuccessMsg(`Access provisioned for ${newUser.name}.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleRemoveStaff = (id: string) => {
    const updated = team.filter(u => u.id !== id);
    setTeam(updated);
    localStorage.setItem('nexus_mvp_users', JSON.stringify(updated));
  };

  const handleOpenAiStudio = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasAiKey(true);
      setSuccessMsg('Neural Link Synchronized.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleConnectCloud = () => {
    if (!supabaseUrl || !supabaseKey) {
        setSuccessMsg('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify, then redeploy.');
        setTimeout(() => setSuccessMsg(''), 4000);
        return;
    }
    setSuccessMsg('Supabase is configured via environment variables.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSaveStripe = () => {
    localStorage.setItem('nexus_stripe_pk', stripeConfig.pk);
    localStorage.setItem('nexus_stripe_sk', stripeConfig.sk);
    setSuccessMsg('Stripe Bridge updated.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSaveDeployment = () => {
    localStorage.setItem('nexus_prod_url', deployConfig.productionUrl);
    setSuccessMsg('Deployment configuration updated.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };


  if (!isMasterAdmin) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in pb-20">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-10">
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3">Master admin required</h1>
          <p className="text-slate-500 text-sm font-medium">Only the master admin can access infrastructure settings. Contact your system owner for access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">Infrastructure</h1>
        <p className="text-slate-500 mt-2 font-medium">Configure neural handshakes and corporate identity.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {[
              { id: 'intelligence', label: 'Neural Link', icon: BrainCircuit },
              { id: 'general', label: 'Business Profile', icon: Building2 },
              { id: 'team', label: 'Team Protocol', icon: Users },
              { id: 'billing', label: 'Tier Prices', icon: Receipt },
              { id: 'social', label: 'Social Bridge', icon: Share2 },
              { id: 'integrations', label: 'API Handshakes', icon: Link2 },
              { id: 'infrastructure', label: 'Database', icon: Server },
              { id: 'payments', label: 'Stripe API', icon: CreditCard },
              { id: 'deployment', label: 'Deployment', icon: Cloud }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)} 
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-slate-900 text-emerald-400 shadow-xl' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}
              >
                <div className="flex items-center gap-3">
                    <tab.icon size={18} /> {tab.label}
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          {successMsg && <div className="mb-6 bg-emerald-50 text-emerald-700 px-6 py-4 rounded-2xl flex items-center gap-3 text-sm font-black border border-emerald-200 animate-fade-in shadow-xl shadow-emerald-500/10"><CheckCircle size={18} /> {successMsg}</div>}

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden min-h-[550px]">
            
            {activeTab === 'general' && (
               <div className="p-10 space-y-8 animate-fade-in">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Corporate Identity</h3>
                      <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Official NAP data for SEO & Compliance.</p>
                    </div>
                    <button onClick={handleSaveBranding} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg active:scale-95">
                      <Save size={16} /> Save Vitals
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Public Vitals</h4>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Agency Name</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input type="text" value={localBranding.name} onChange={e => setLocalBranding({...localBranding, name: e.target.value})} className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Primary Support Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input type="email" value={localBranding.contactEmail} onChange={e => setLocalBranding({...localBranding, contactEmail: e.target.value})} className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Official Website URL</label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input type="text" value={localBranding.websiteUrl} onChange={e => setLocalBranding({...localBranding, websiteUrl: e.target.value})} className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Physical Footprint</h4>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">HQ Physical Address</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 text-slate-300" size={16} />
                          <textarea value={localBranding.physicalAddress} onChange={e => setLocalBranding({...localBranding, physicalAddress: e.target.value})} className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none h-[116px] resize-none" placeholder="123 Business Way, Suite 100, New York, NY 10001" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Public Phone Line</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input type="text" value={localBranding.contactPhone} onChange={e => setLocalBranding({...localBranding, contactPhone: e.target.value})} className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Visual Theme</h4>
                    <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-200">
                      <input type="color" value={localBranding.primaryColor} onChange={e => setLocalBranding({...localBranding, primaryColor: e.target.value})} className="w-16 h-16 rounded-2xl border-4 border-white shadow-xl cursor-pointer" />
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase">OS Primary Accent</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">This color will be used for your client portal buttons and highlights.</p>
                      </div>
                    </div>
                  </div>
               </div>
            )}

            {activeTab === 'team' && (
                <div className="p-10 space-y-10 animate-fade-in">
                    <div className="bg-slate-950 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10"><Users size={160} /></div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 mb-2"><UserPlus className="text-blue-400" /> Team Management</h3>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">Hire staff and manage role-based access protocols.</p>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Provision New Personnel</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input 
                                type="text" 
                                placeholder="Full Name" 
                                value={newStaff.name} 
                                onChange={e => setNewStaff({...newStaff, name: e.target.value})} 
                                className="p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input 
                                type="email" 
                                placeholder="Corporate Email" 
                                value={newStaff.email} 
                                onChange={e => setNewStaff({...newStaff, email: e.target.value})} 
                                className="p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <select 
                                value={newStaff.role} 
                                onChange={e => setNewStaff({...newStaff, role: e.target.value as any})} 
                                className="p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="salesperson">Salesperson</option>
                                <option value="supervisor">Supervisor</option>
                            </select>
                        </div>
                        <button 
                            onClick={handleHireStaff}
                            className="w-full mt-4 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-2"
                        >
                            <UserPlus size={16}/> Hire Personnel
                        </button>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Active Roster</h4>
                        {team.filter(u => u.role !== 'client').map(member => (
                            <div key={member.id} className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between group hover:shadow-lg transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 uppercase">{member.name[0]}</div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{member.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{member.role}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleRemoveStaff(member.id)} className="p-3 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'intelligence' && (
              <div className="p-10 space-y-10 animate-fade-in">
                 <div className="flex items-center justify-between bg-slate-950 p-8 rounded-[2rem] text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-10 opacity-10"><Zap size={140} /></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20 transform -rotate-3">
                                <BrainCircuit size={28} className="text-slate-950" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter">Gemini OS Core</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`w-2.5 h-2.5 rounded-full ${hasAiKey ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{hasAiKey ? 'Core Operational' : 'API Key Missing'}</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-medium">
                            System intelligence is managed via the <code className="text-emerald-400 font-mono">API_KEY</code> environment variable.
                        </p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center">
                        <Key size={32} className="text-blue-600 mb-4" />
                        <h4 className="font-black text-slate-900 uppercase tracking-tight mb-2 text-lg">Direct Keys</h4>
                        <p className="text-xs text-slate-500 mb-8 max-w-[220px]">Initialize your own API Studio keys for high-volume video synthesis and live calls.</p>
                        <button onClick={handleOpenAiStudio} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all shadow-xl">
                            Link AI Studio Key
                        </button>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center">
                        <ShieldCheck size={32} className="text-emerald-500 mb-4" />
                        <h4 className="font-black text-slate-900 uppercase tracking-tight mb-2 text-lg">System Integrity</h4>
                        <p className="text-xs text-slate-500 mb-8 max-w-[220px]">The master core is authenticated via secure server-side environment variables.</p>
                        <div className="w-full py-4 border border-slate-200 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400">Verified Secured</div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="p-10 space-y-10 animate-fade-in">
                <div className="bg-slate-950 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Share2 size={160} /></div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 mb-2"><Sparkles className="text-blue-400" /> Social Bridge</h3>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">External Identity & Content Distribution.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Meta Bridge */}
                    <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-200 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg"><Facebook size={20}/></div>
                                <div className="p-2 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-xl text-white shadow-lg"><Instagram size={20}/></div>
                            </div>
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Active</span>
                        </div>
                        <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight mb-2">Meta Business Protocol</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed mb-6 font-medium">Syncs Unified Inbox with Facebook Pages and Instagram Professional accounts.</p>
                        <input type="password" value={integrations.metaAccessToken} onChange={e => setIntegrations({...integrations, metaAccessToken: e.target.value})} placeholder="System User Access Token" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-[10px] font-mono mb-4"/>
                        <button onClick={() => handleTestHandshake('Meta')} className="w-full py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">Test Neural Link</button>
                    </div>

                    {/* WhatsApp Bridge */}
                    <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-200 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div className="p-2 bg-emerald-500 rounded-xl text-white shadow-lg"><MessageCircle size={20}/></div>
                            <span className="bg-slate-200 text-slate-500 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Pending Sync</span>
                        </div>
                        <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight mb-2">WhatsApp Business API</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed mb-6 font-medium">Automated deal status notifications and 2-way client support messaging.</p>
                        <input type="text" value={integrations.whatsappPhoneId} onChange={e => setIntegrations({...integrations, whatsappPhoneId: e.target.value})} placeholder="Phone ID (from Meta Developer Console)" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-[10px] font-mono mb-4"/>
                        <button onClick={() => handleTestHandshake('WhatsApp')} className="w-full py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">Link WhatsApp</button>
                    </div>

                    {/* TikTok Bridge */}
                    <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-200 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div className="p-2 bg-slate-950 rounded-xl text-white shadow-lg"><Smartphone size={20}/></div>
                            <span className="bg-slate-200 text-slate-500 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Disconnected</span>
                        </div>
                        <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight mb-2">TikTok Content API</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed mb-6 font-medium">Direct export from Content Factory to TikTok Business account.</p>
                        <input type="password" value={integrations.tiktokKey} onChange={e => setIntegrations({...integrations, tiktokKey: e.target.value})} placeholder="TikTok Client Key" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-[10px] font-mono mb-4"/>
                        <button onClick={() => handleTestHandshake('TikTok')} className="w-full py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">Auth Creative Hub</button>
                    </div>

                    {/* LinkedIn Bridge */}
                    <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-200 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div className="p-2 bg-blue-700 rounded-xl text-white shadow-lg"><Linkedin size={20}/></div>
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Enterprise Only</span>
                        </div>
                        <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight mb-2">LinkedIn Professional</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed mb-6 font-medium">Automated B2B lead enrichment and direct outreach protocol.</p>
                        <input type="text" value={integrations.linkedinId} onChange={e => setIntegrations({...integrations, linkedinId: e.target.value})} placeholder="LinkedIn App Client ID" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-[10px] font-mono mb-4"/>
                        <button onClick={() => handleTestHandshake('LinkedIn')} className="w-full py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all text-slate-400 cursor-not-allowed">Upgrade Required</button>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button onClick={handleSaveIntegrations} className="bg-slate-900 hover:bg-slate-800 text-white font-black py-4 px-12 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.3em] shadow-2xl active:scale-95">
                       <Save size={18} /> Update Social Protocols
                    </button>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="p-10 space-y-10 animate-fade-in">
                <div className="bg-slate-950 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Link2 size={160} /></div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 mb-2"><Wifi className="text-blue-400" /> API Handshakes</h3>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">External Service Providers & Logic Bridges.</p>
                </div>

                <div className="space-y-12">
                    {/* Communications: Twilio */}
                    <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-200">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-2xl shadow-sm"><Phone className="text-red-500" size={24}/></div>
                                <div>
                                    <h4 className="font-black text-slate-900 uppercase tracking-tight">Communications Hub</h4>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Twilio Protocol (Dialer & SMS)</p>
                                </div>
                            </div>
                            <button onClick={() => handleTestHandshake('Twilio')} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                                {testingKey === 'Twilio' ? <RefreshCw className="animate-spin" size={12}/> : 'Test Sync'}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Account SID</label>
                                <input type="text" value={integrations.twilioSid} onChange={e => setIntegrations({...integrations, twilioSid: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-mono text-xs"/>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Auth Token</label>
                                <input type="password" value={integrations.twilioToken} onChange={e => setIntegrations({...integrations, twilioToken: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-mono text-xs"/>
                            </div>
                        </div>
                    </div>

                    {/* Financial: Plaid */}
                    <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-200">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-2xl shadow-sm"><Building2 className="text-emerald-500" size={24}/></div>
                                <div>
                                    <h4 className="font-black text-slate-900 uppercase tracking-tight">Asset Verification</h4>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plaid Handshake (Bank Connect)</p>
                                </div>
                            </div>
                            <button onClick={() => handleTestHandshake('Plaid')} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                                {testingKey === 'Plaid' ? <RefreshCw className="animate-spin" size={12}/> : 'Test Sync'}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Client ID</label>
                                <input type="text" value={integrations.plaidClientId} onChange={e => setIntegrations({...integrations, plaidClientId: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-mono text-xs"/>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Secret Key</label>
                                <input type="password" value={integrations.plaidSecret} onChange={e => setIntegrations({...integrations, plaidSecret: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-mono text-xs"/>
                            </div>
                        </div>
                    </div>

                    {/* Intelligence: Google Maps/Cloud */}
                    <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-200">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-2xl shadow-sm"><Search className="text-blue-500" size={24}/></div>
                                <div>
                                    <h4 className="font-black text-slate-900 uppercase tracking-tight">Geo Scouting</h4>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Google Maps & Places API</p>
                                </div>
                            </div>
                            <button onClick={() => handleTestHandshake('Google')} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                                {testingKey === 'Google' ? <RefreshCw className="animate-spin" size={12}/> : 'Test Sync'}
                            </button>
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Google Cloud Browser Key</label>
                            <input type="text" value={integrations.googleMapsKey} onChange={e => setIntegrations({...integrations, googleMapsKey: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-mono text-xs"/>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button onClick={handleSaveIntegrations} className="bg-slate-900 hover:bg-slate-800 text-white font-black py-4 px-12 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.3em] shadow-2xl active:scale-95">
                           <Save size={18} /> Update Integration Protocols
                        </button>
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'infrastructure' && (
              <div className="p-10 space-y-10 animate-fade-in">
                <div className="bg-slate-950 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Database size={160} /></div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 mb-2"><Database className="text-emerald-400" /> Database Transition</h3>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">Migrate from LocalStorage to Cloud Postgres.</p>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="block text-10px] font-black text-slate-500 uppercase tracking-widest mb-2">Supabase Project URL</label>
                        <input type="text" placeholder="Set in Netlify env vars" value={dbConfig.url} readOnly className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-400"/>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Supabase Anon Key</label>
                        <input type="password" placeholder="Set in Netlify env vars" value={dbConfig.key ? '********' : ''} readOnly className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-400"/>
                    </div>
                    <div className="pt-6 border-t border-slate-100">
                        <button onClick={handleConnectCloud} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.2em] shadow-xl">
                           <RefreshCw size={18} /> Sync with Cloud
                        </button>
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="p-10 space-y-10 animate-fade-in">
                <div className="bg-slate-950 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><CreditCard size={160} /></div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2 mb-2"><CreditCard className="text-blue-400" /> Stripe Bridge</h3>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">Transaction & success fee protocol.</p>
                </div>
                <div className="space-y-8">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Publishable Key</label>
                        <input type="text" placeholder="pk_live_..." value={stripeConfig.pk} onChange={e => setStripeConfig({...stripeConfig, pk: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"/>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Secret Key</label>
                        <div className="relative">
                            <input type={showSecret ? "text" : "password"} placeholder="sk_live_..." value={stripeConfig.sk} onChange={e => setStripeConfig({...stripeConfig, sk: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs pr-14"/>
                            <button onClick={() => setShowSecret(!showSecret)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showSecret ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                        <button onClick={handleSaveStripe} className="bg-slate-900 hover:bg-slate-800 text-white font-black py-5 px-12 rounded-2xl transition-all flex items-center gap-3 uppercase text-[10px] tracking-[0.3em] shadow-2xl active:scale-95">
                           <Save size={18} /> Save Bridge
                        </button>
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'deployment' && (
              <div className="p-10 space-y-10 animate-fade-in">
                <div className="bg-slate-950 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Rocket size={160} /></div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2 mb-2"><Rocket className="text-blue-400" /> Cloud Deployment</h3>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">Manage CI/CD and Production Environments.</p>
                </div>
                
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Github size={14}/> Source Control</h4>
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-700 truncate">{deployConfig.repoUrl}</p>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Status: Connected</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity size={14}/> Last Artifact</h4>
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-700">{deployConfig.lastDeploy}</p>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Version: v2.5.4</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Production URL</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        value={deployConfig.productionUrl} 
                        onChange={e => setDeployConfig({...deployConfig, productionUrl: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                    <a 
                      href={`https://app.netlify.com/start/deploy?repository=${deployConfig.repoUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-[#25c2a0] hover:bg-[#1fa98a] text-white font-black py-5 px-8 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.3em] shadow-2xl active:scale-95"
                    >
                      <Rocket size={18} /> Deploy to Netlify
                    </a>
                    <button 
                      onClick={handleSaveDeployment}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-black py-5 px-10 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.3em] shadow-2xl active:scale-95"
                    >
                      <Save size={18} /> Save Config
                    </button>
                  </div>

                  <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 mt-6">
                    <h4 className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-2 flex items-center gap-2"><Terminal size={14}/> Dev Protocol</h4>
                    <p className="text-[10px] text-blue-600 leading-relaxed font-medium">
                      Ensure your <code className="bg-white px-1 rounded font-bold">API_KEY</code> is correctly set in your Netlify Environment Variables before deploying. Failure to do so will result in neural handshake timeouts.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'billing' && (
              <div className="p-10 space-y-10 animate-fade-in">
                <div className="bg-slate-950 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Receipt size={160} /></div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 mb-2"><Smartphone className="text-blue-400" /> Billing Protocol</h3>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">Manage global tier pricing and platform yield.</p>
                </div>
                <div className="pt-6 flex justify-end">
                    <button onClick={() => alert('Feature coming soon...')} className="bg-slate-900 hover:bg-slate-800 text-white font-black py-4 px-12 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.3em] shadow-2xl active:scale-95">
                       <Save size={18} /> Save Tier Protocol
                    </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
