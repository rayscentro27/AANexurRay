
import React, { useState, useEffect } from 'react';
import { Contact, MarketingAutomation, SocialPost, AgencyBranding } from '../types';
import { 
  Zap, Mail, Sparkles, Video, Instagram, Linkedin, Smartphone, 
  RefreshCw, Film, Wand2, CheckCircle, Share2, Play, 
  AlertCircle, Layout, Plus, Trash2, Calendar, Smartphone as TikTokIcon, Key, ExternalLink,
  AlertTriangle, Settings, ArrowRight, BrainCircuit, Youtube, Link as LinkIcon, Layers,
  Download, Search, Globe, MapPin, BarChart3, ListChecks, Type, Copy, Phone, Building2, Fingerprint,
  Save, LayoutDashboard, Target, MessageSquare, ShieldCheck, X
} from 'lucide-react';
import * as geminiService from '../services/geminiService';
import EmailCampaignManager from './EmailCampaignManager';

interface MarketingCampaignsProps {
  contacts: Contact[];
  branding: AgencyBranding;
  onUpdateContact?: (contact: Contact) => void;
  onUpdateBranding?: (branding: AgencyBranding) => void;
}

const MarketingCampaigns: React.FC<MarketingCampaignsProps> = ({ contacts, branding, onUpdateContact, onUpdateBranding }) => {
  const [activeTab, setActiveTab] = useState<'studio' | 'seo' | 'local' | 'emails' | 'hooks' | 'footprint'>('studio');
  
  // Creative Mode: 'text' or 'recreate'
  const [creativeMode, setCreativeMode] = useState<'text' | 'recreate'>('text');
  
  // Footprint State - Linked to Global Branding
  const [localFootprint, setLocalFootprint] = useState(branding);
  const [footprintCitations, setFootprintCitations] = useState<any>(null);
  const [isCiting, setIsCiting] = useState(false);
  const [socialBios, setSocialBios] = useState<any>(null);
  const [isBioLoading, setIsBioLoading] = useState(false);

  // Sync when global branding changes
  useEffect(() => {
    setLocalFootprint(branding);
  }, [branding]);

  // Studio State
  const [videoPrompt, setVideoPrompt] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<'TikTok' | 'Instagram' | 'LinkedIn' | 'Facebook' | 'YouTube'>('YouTube');
  const [isGenerating, setIsGenerating] = useState(false);
  const [neuralStatus, setNeuralStatus] = useState('');
  const [generatedPost, setGeneratedPost] = useState<SocialPost | null>(null);
  const [hasKey, setHasKey] = useState(false);
  
  // SEO State
  const [seoIndustry, setSeoIndustry] = useState('');
  const [seoTargetMarket, setSeoTargetMarket] = useState('');
  const [seoResult, setSeoResult] = useState<any>(null);
  const [isSeoLoading, setIsSeoLoading] = useState(false);

  // GBP State
  const [gbpDesc, setGbpDesc] = useState('');
  const [gbpLoc, setGbpLoc] = useState('');
  const [gbpResult, setGbpResult] = useState<any>(null);
  const [isGbpLoading, setIsGbpLoading] = useState(false);

  // Viral Hooks State
  const [hookTopic, setHookTopic] = useState('');
  const [hookResults, setHookResults] = useState<string[]>([]);
  const [isHookLoading, setIsHookLoading] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeyPicker = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const handleRunSEO = async () => {
    if (!seoIndustry || !seoTargetMarket) return;
    setIsSeoLoading(true);
    const res = await geminiService.generateSEOStrategy(seoIndustry, seoTargetMarket);
    setSeoResult(res);
    setIsSeoLoading(false);
  };

  const handleRunGBP = async () => {
    if (!gbpDesc || !gbpLoc) return;
    setIsGbpLoading(true);
    const res = await geminiService.optimizeGBP(gbpDesc, gbpLoc);
    setGbpResult(res);
    setIsGbpLoading(false);
  };

  const handleRunHooks = async () => {
    if (!hookTopic) return;
    setIsHookLoading(true);
    const res = await geminiService.generateViralHooks(hookTopic);
    setHookResults(res);
    setIsHookLoading(false);
  };

  const handleSaveFootprint = () => {
      if (onUpdateBranding) {
          onUpdateBranding(localFootprint);
          alert("Digital Vitals Synchronized with Infrastructure Settings.");
      }
  };

  const handleGenerateCitations = async () => {
    setIsCiting(true);
    const res = await geminiService.generateDirectoryCitations(localFootprint);
    setFootprintCitations(res);
    setIsCiting(false);
  };

  const handleGenerateBios = async () => {
      setIsBioLoading(true);
      const res = await geminiService.generateSocialBios(localFootprint);
      setSocialBios(res);
      setIsBioLoading(false);
  };

  const handleGenerateContent = async () => {
    if (creativeMode === 'text' && !videoPrompt) return;
    if (creativeMode === 'recreate' && !youtubeUrl) return;
    
    if (window.aistudio) {
      const selected = await window.aistudio.hasSelectedApiKey();
      if (!selected) {
        await window.aistudio.openSelectKey();
        setHasKey(true);
      }
    }
    
    setIsGenerating(true);
    setGeneratedPost(null);
    
    const aspectRatio = ['TikTok', 'Instagram'].includes(selectedPlatform) ? '9:16' : '16:9';
    
    const statusCycle = creativeMode === 'recreate' ? [
        "Infiltrating Source Video...",
        "Deconstructing Semantic Narrative...",
        "Abstracting Visual Metaphors...",
        "Synthesizing Cinema (Veo 3.1)...",
        "Finalizing Faceless Render..."
    ] : [
      "Interfacing with Neural Core...",
      "Deconstructing Creative Directive...",
      "Rendering Cinema-Grade Frames (Veo 3.1)...",
      "Optimizing for " + selectedPlatform + " algorithms...",
      "Finalizing Visual Polish..."
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      setNeuralStatus(statusCycle[i % statusCycle.length]);
      i++;
    }, 4500);

    try {
      let finalPrompt = videoPrompt;

      if (creativeMode === 'recreate') {
        finalPrompt = await geminiService.transformVideoToDirective(youtubeUrl);
      }

      const videoUrl = await geminiService.generateSocialVideo(finalPrompt, aspectRatio);
      const caption = await geminiService.generateSocialCaption(selectedPlatform, finalPrompt);

      if (videoUrl) {
        const newPost: SocialPost = {
          id: `post_${Date.now()}`,
          platform: selectedPlatform as any,
          content: caption,
          videoUrl,
          status: 'Ready',
          aspectRatio
        };
        setGeneratedPost(newPost);
      }
    } catch (e: any) {
      if (e.message?.includes("Requested entity was not found")) {
        setHasKey(false);
        alert("Session Expired. Please re-select your AI Studio Key.");
        await window.aistudio?.openSelectKey();
      } else {
        alert("Neural synthesis interrupted.");
      }
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
      setNeuralStatus('');
    }
  };

  const CopyableSnippet = ({ label, value, icon }: any) => (
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between group hover:border-emerald-300 transition-all">
          <div className="flex-1 overflow-hidden pr-4">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400 mb-1">
                  {icon} {label}
              </div>
              <p className="text-xs font-bold text-slate-800 truncate">{value || 'Not Set'}</p>
          </div>
          <button onClick={() => { if(value) { navigator.clipboard.writeText(value); alert('Copied!'); } }} className="p-2.5 text-slate-300 hover:text-emerald-600 transition-colors">
              <Copy size={16}/>
          </button>
      </div>
  );

  return (
    <div className="h-full flex flex-col animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
            <Film className="text-blue-600" size={36} /> Content Factory
          </h1>
          <p className="text-slate-500 font-medium mt-1">Autonomous exposure and corporate identity tools.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner border border-slate-200 overflow-x-auto no-scrollbar">
           {[
             { id: 'studio', label: 'AI Video', icon: <Video size={16}/> },
             { id: 'footprint', label: 'Footprint', icon: <Fingerprint size={16}/> },
             { id: 'seo', label: 'SEO Architect', icon: <Globe size={16}/> },
             { id: 'local', label: 'Local Maps', icon: <MapPin size={16}/> },
             { id: 'hooks', label: 'Hooks', icon: <Sparkles size={16}/> },
             { id: 'emails', label: 'Emails', icon: <Mail size={16}/> }
           ].map(tab => (
             <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)} 
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-white shadow-md text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}
             >
                {tab.icon} {tab.label}
             </button>
           ))}
        </div>
      </div>

      {activeTab === 'footprint' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
           <div className="lg:col-span-4 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm h-fit space-y-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Digital Vitals</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">Central corporate info used to sync citations and bios. Updates here reflect globally.</p>
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Official Legal Name</label>
                    <input type="text" value={localFootprint.name} onChange={e => setLocalFootprint({...localFootprint, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Corporate HQ Address</label>
                    <input type="text" value={localFootprint.physicalAddress} onChange={e => setLocalFootprint({...localFootprint, physicalAddress: e.target.value})} placeholder="123 Business Way, Suite 100..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone</label>
                        <input type="text" value={localFootprint.contactPhone} onChange={e => setLocalFootprint({...localFootprint, contactPhone: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Support Email</label>
                        <input type="text" value={localFootprint.contactEmail} onChange={e => setLocalFootprint({...localFootprint, contactEmail: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" />
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Canonical URL</label>
                    <input type="text" value={localFootprint.websiteUrl} onChange={e => setLocalFootprint({...localFootprint, websiteUrl: e.target.value})} placeholder="https://..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" />
                 </div>
                 <button onClick={handleSaveFootprint} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 transform active:scale-95 transition-all">
                    <Save size={16}/> Synchronize Protocols
                 </button>
              </div>
           </div>

           <div className="lg:col-span-8 space-y-8">
              {/* Directory Citations */}
              <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
                 <div className="flex justify-between items-center mb-8">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Globe size={14} className="text-blue-500"/> Directory Citation Blueprint</h4>
                    <button onClick={handleGenerateCitations} disabled={isCiting} className="text-[9px] font-black uppercase text-blue-600 flex items-center gap-1.5 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all border border-blue-100 shadow-sm">
                        {isCiting ? <RefreshCw className="animate-spin" size={10}/> : <Sparkles size={10}/>} Sync Citation DNA
                    </button>
                 </div>

                 {footprintCitations ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CopyableSnippet label="Yelp / Core Directories" value={footprintCitations.yelp} icon={<MapPin size={10}/>} />
                        <CopyableSnippet label="YellowPages / Local" value={footprintCitations.yellowPages} icon={<Building2 size={10}/>} />
                        <CopyableSnippet label="Industry Specific" value={footprintCitations.industry} icon={<Layers size={10}/>} />
                        <CopyableSnippet label="Optimized SEO Desc" value={footprintCitations.optimizedShortDesc} icon={<Type size={10}/>} />
                    </div>
                 ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-300 opacity-50">
                        <Globe size={48} className="mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-center">Awaiting Vitals Update to Generate Citations</p>
                    </div>
                 )}
              </div>

              {/* Social Bios */}
              <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Share2 size={14} className="text-indigo-500"/> Neural Social Bios</h4>
                    <button onClick={handleGenerateBios} disabled={isBioLoading} className="text-[9px] font-black uppercase text-indigo-600 flex items-center gap-1.5 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all border border-indigo-100 shadow-sm">
                        {isBioLoading ? <RefreshCw className="animate-spin" size={10}/> : <Sparkles size={10}/>} Generate Bios
                    </button>
                 </div>

                 {socialBios ? (
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase mb-3"><Linkedin size={14} className="text-blue-700"/> LinkedIn Tagline</div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-bold text-slate-800 italic">"{socialBios.linkedin}"</p>
                              <button onClick={() => { navigator.clipboard.writeText(socialBios.linkedin); alert('Copied!'); }} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><Copy size={14}/></button>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase mb-3"><Instagram size={14} className="text-purple-600"/> Instagram Bio</div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-bold text-slate-800 italic">"{socialBios.instagram}"</p>
                              <button onClick={() => { navigator.clipboard.writeText(socialBios.instagram); alert('Copied!'); }} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><Copy size={14}/></button>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase mb-3"><Smartphone size={14} className="text-slate-900"/> TikTok Description</div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-bold text-slate-800 italic">"{socialBios.tiktok}"</p>
                              <button onClick={() => { navigator.clipboard.writeText(socialBios.tiktok); alert('Copied!'); }} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><Copy size={14}/></button>
                            </div>
                        </div>
                    </div>
                 ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-300 opacity-50">
                        <Share2 size={48} className="mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-center">Neural Bio Synthesis Awaiting Sync</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'hooks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
           <div className="lg:col-span-4 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm h-fit">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">Viral Hook Library</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">Stop the scroll with neural-optimized hooks for TikTok/Reels.</p>
              <div className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Video Topic</label>
                    <input 
                      type="text" 
                      value={hookTopic} 
                      onChange={e => setHookTopic(e.target.value)} 
                      placeholder="e.g. Funding for Restaurants" 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                 </div>
                 <button onClick={handleRunHooks} disabled={isHookLoading} className="w-full bg-slate-950 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2">
                    {isHookLoading ? <RefreshCw className="animate-spin" size={16}/> : <Zap size={16}/>} Generate Hooks
                 </button>
              </div>
           </div>
           <div className="lg:col-span-8 space-y-4">
              {hookResults.length > 0 ? hookResults.map((hook, i) => (
                  <div key={i} className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm flex items-center justify-between group hover:border-blue-300 transition-all">
                      <p className="text-lg font-bold text-slate-800 italic leading-relaxed">"{hook}"</p>
                      <button onClick={() => { navigator.clipboard.writeText(hook); alert('Copied!'); }} className="p-3 text-slate-300 hover:text-blue-600 transition-colors">
                          <Copy size={20}/>
                      </button>
                  </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20">
                    <Sparkles size={64} className="opacity-10 mb-4" />
                    <p className="font-black uppercase text-xs tracking-widest">Awaiting Command</p>
                </div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'seo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
           <div className="lg:col-span-4 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm h-fit space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">SEO Architect</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">Synthesize a deep-dive search domination strategy for any entity.</p>
              </div>
              <div className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Business Industry</label>
                    <input 
                      type="text" 
                      value={seoIndustry} 
                      onChange={e => setSeoIndustry(e.target.value)} 
                      placeholder="e.g. Commercial HVAC" 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" 
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Specific Target Market</label>
                    <input 
                      type="text" 
                      value={seoTargetMarket} 
                      onChange={e => setSeoTargetMarket(e.target.value)} 
                      placeholder="e.g. Property Managers in Florida" 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" 
                    />
                 </div>
                 <button onClick={handleRunSEO} disabled={isSeoLoading} className="w-full bg-slate-950 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 group">
                    {isSeoLoading ? <RefreshCw className="animate-spin" size={18}/> : <BrainCircuit size={18} className="group-hover:rotate-12 transition-transform"/>} 
                    {isSeoLoading ? 'Synthesizing...' : 'Manifest Blueprint'}
                 </button>
              </div>
           </div>
           <div className="lg:col-span-8">
              {seoResult ? (
                <div className="space-y-8 animate-fade-in">
                    <div className="bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5">
                        <div className="absolute top-0 right-0 p-10 opacity-5"><Sparkles size={160}/></div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3"><Globe size={24} className="text-blue-400" /> Search Domination Blueprint</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Core Keywords (High Intent)</h4>
                                    <div className="space-y-3">
                                        {seoResult.primaryKeywords.map((k: any, i: number) => (
                                            <div key={i} className="flex justify-between items-center p-3 bg-white/5 border border-white/10 rounded-xl">
                                                <div>
                                                    <p className="text-xs font-black text-white">{k.keyword}</p>
                                                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">Diff: {k.difficulty}</p>
                                                </div>
                                                <span className="text-[10px] font-mono font-bold text-emerald-400">{k.volume}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-8">
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Neural Backlink Vectors</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {seoResult.backlinkStrategy?.map((s: string, i: number) => (
                                                <span key={i} className="bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase text-indigo-300">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Long-Tail Hooks</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {seoResult.longTailKeywords.map((k: string, i: number) => (
                                                <span key={i} className="bg-white/5 border border-white/5 px-3 py-1 rounded-lg text-[9px] font-bold text-slate-400 italic">#{k.replace(/\s+/g, '')}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Neural Grounding Sources */}
                            {seoResult.sources && seoResult.sources.length > 0 && (
                                <div className="mt-10 pt-10 border-t border-white/5">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Globe size={14}/> Grounding Data Sources
                                    </h4>
                                    <div className="flex flex-wrap gap-4">
                                        {seoResult.sources.map((s: any, idx: number) => (
                                            <a key={idx} href={s.uri} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5">
                                                <ExternalLink size={10}/> {s.title}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2"><LayoutDashboard size={18} className="text-blue-600"/> Strategic Content Pillars</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {seoResult.contentBlueprints.map((bp: any, i: number) => (
                                <div key={i} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-blue-200 transition-all group">
                                    <h5 className="font-black text-slate-900 text-base uppercase mb-2 leading-tight">{bp.title}</h5>
                                    <p className="text-[9px] font-black text-blue-600 uppercase mb-6 tracking-widest">Protocol: {bp.targetIntent}</p>
                                    <ul className="space-y-3">
                                        {bp.outline.map((o: string, idx: number) => (
                                            <li key={idx} className="text-xs text-slate-500 flex items-start gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" /> {o}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
              ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] h-[580px] flex flex-col items-center justify-center text-slate-300">
                    <Globe size={64} className="opacity-10 mb-4" />
                    <p className="font-black uppercase text-xs tracking-[0.3em] text-center max-w-xs">Awaiting Industry Context to Generate Domination Blueprint</p>
                </div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'local' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
           <div className="lg:col-span-4 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm h-fit">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">GBP Sentinel</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">Optimize your Google Business Profile to dominate local map searches for free.</p>
              <div className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Current Description</label>
                    <textarea 
                      value={gbpDesc} 
                      onChange={e => setGbpDesc(e.target.value)} 
                      placeholder="Enter your current Google Business info..." 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium h-32 resize-none outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Primary Market City</label>
                    <input 
                      type="text" 
                      value={gbpLoc} 
                      onChange={e => setGbpLoc(e.target.value)} 
                      placeholder="e.g. Miami, FL" 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                 </div>
                 <button onClick={handleRunGBP} disabled={isGbpLoading} className="w-full bg-slate-950 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2">
                    {isGbpLoading ? <RefreshCw className="animate-spin" size={16}/> : <MapPin size={16}/>} Optimize Maps Visibility
                 </button>
              </div>
           </div>
           <div className="lg:col-span-8">
                {gbpResult ? (
                    <div className="space-y-8">
                        <div className="bg-emerald-50 rounded-[2.5rem] p-10 border border-emerald-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><CheckCircle size={120} className="text-emerald-500"/></div>
                            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-6">Optimized Meta-Description</h4>
                            <p className="text-lg font-bold text-slate-800 leading-relaxed italic relative z-10">"{gbpResult.optimizedDescription}"</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Semantic Categories</h4>
                                <div className="space-y-2">
                                    {gbpResult.recommendedCategories.map((c: string, i: number) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            <span className="text-xs font-bold text-slate-700 uppercase">{c}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Weekly Post Topics</h4>
                                <div className="space-y-3">
                                    {gbpResult.postIdeas.map((idea: string, i: number) => (
                                        <div key={i} className="flex gap-3 text-xs font-medium text-slate-600">
                                            <span className="text-blue-500 font-black">#0{i+1}</span>
                                            <p>{idea}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] h-[500px] flex flex-col items-center justify-center text-slate-400">
                        <MapPin size={48} className="opacity-10 mb-4" />
                        <p className="font-black uppercase text-xs tracking-widest">Run Optimizer to see Blueprint</p>
                    </div>
                )}
           </div>
        </div>
      )}

      {activeTab === 'emails' && (
        <EmailCampaignManager contacts={contacts} agencyName={branding.name} />
      )}

      {activeTab === 'studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
           <div className="lg:col-span-5 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-10 flex flex-col h-fit">
              <div className="mb-10">
                 <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-100 shadow-sm">
                    <Sparkles size={14} /> Cinema Synthesis: Veo 3.1
                 </div>
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Generate Asset</h2>
                 
                 <div className="mt-8 flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                    <button 
                        onClick={() => setCreativeMode('text')}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${creativeMode === 'text' ? 'bg-white shadow-lg text-blue-600' : 'text-slate-500'}`}
                    >
                        <Film size={14} /> Text-to-Video
                    </button>
                    <button 
                        onClick={() => setCreativeMode('recreate')}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${creativeMode === 'recreate' ? 'bg-white shadow-lg text-indigo-600' : 'text-slate-500'}`}
                    >
                        <RefreshCw size={14} /> Neural Recreate
                    </button>
                 </div>

                 {!hasKey && (
                   <div className="mt-6 p-6 bg-amber-50 border border-amber-200 rounded-[1.5rem] shadow-sm">
                      <p className="text-xs text-amber-800 font-black uppercase tracking-widest flex items-center gap-2 mb-3">
                        <AlertTriangle size={16} /> Link Required
                      </p>
                      <p className="text-[10px] text-amber-700 leading-relaxed mb-6 font-medium">
                        High-quality synthesis requires a Google Cloud project with billing enabled.
                        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline ml-1 inline-flex items-center gap-0.5">Docs <ExternalLink size={8}/></a>
                      </p>
                      <button onClick={handleOpenKeyPicker} className="w-full py-3 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-amber-500 transition-all shadow-lg shadow-amber-600/10">
                        <Key size={14} /> Link Project
                      </button>
                   </div>
                 )}
              </div>

              <div className="space-y-8">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Distribution Channel</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {(['YouTube', 'TikTok', 'Instagram', 'LinkedIn', 'Facebook'] as const).map(p => (
                            <button
                                key={p}
                                onClick={() => setSelectedPlatform(p)}
                                className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex flex-col items-center gap-3 ${selectedPlatform === p ? 'bg-slate-950 text-white border-slate-950 shadow-2xl scale-105' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                            >
                                {p === 'YouTube' && <Youtube size={20} className="text-red-500" />}
                                {p === 'TikTok' && <TikTokIcon size={20}/>}
                                {p === 'Instagram' && <Instagram size={20}/>}
                                {p === 'LinkedIn' && <Linkedin size={20}/>}
                                {p === 'Facebook' && <Share2 size={20}/>}
                                {p}
                            </button>
                        ))}
                    </div>
                 </div>

                 {creativeMode === 'text' ? (
                     <div className="animate-fade-in">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Creative Directive</label>
                        <textarea 
                            value={videoPrompt} 
                            onChange={(e) => setVideoPrompt(e.target.value)} 
                            placeholder="e.g. A futuristic landscape representing financial freedom with abstract gold threads..." 
                            className="w-full bg-slate-100 border-none rounded-[1.5rem] p-5 h-40 resize-none text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none" 
                        />
                     </div>
                 ) : (
                     <div className="animate-fade-in space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Source Video URL</label>
                            <div className="relative">
                                <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={20} />
                                <input 
                                    type="text" 
                                    value={youtubeUrl}
                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                    placeholder="Paste YouTube Link..."
                                    className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                     </div>
                 )}

                 <button 
                    onClick={handleGenerateContent}
                    disabled={isGenerating || (creativeMode === 'text' && !videoPrompt) || (creativeMode === 'recreate' && !youtubeUrl)}
                    className="w-full py-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black uppercase text-xs tracking-[0.3em] rounded-[1.5rem] shadow-2xl hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-4 disabled:opacity-50 transform active:scale-95"
                 >
                    {isGenerating ? <RefreshCw className="animate-spin" size={24}/> : (creativeMode === 'recreate' ? <Layers size={24} /> : <Film size={24} />)}
                    {isGenerating ? 'Synthesizing...' : (creativeMode === 'recreate' ? 'Transform to Social' : 'Manifest AI Video')}
                 </button>
              </div>
           </div>

           <div className="lg:col-span-7 flex flex-col gap-6 h-full">
              <div className="flex-1 bg-slate-950 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[600px]">
                 {isGenerating ? (
                    <div className="text-center animate-fade-in px-12">
                       <div className="relative mb-12 inline-block">
                          <RefreshCw size={120} className="text-blue-500 animate-spin opacity-10" />
                          {creativeMode === 'recreate' ? <Layers size={48} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" /> : <Film size={48} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />}
                       </div>
                       <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-6">Neural Synthesis Active</h3>
                       <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-inner min-w-[300px]">
                          <p className="text-blue-400 font-mono text-[10px] tracking-[0.2em] uppercase">{neuralStatus}</p>
                       </div>
                    </div>
                 ) : generatedPost ? (
                    <div className="w-full h-full flex flex-col animate-fade-in">
                        <div className="flex-1 bg-black flex items-center justify-center p-12">
                            <div className={`${generatedPost.aspectRatio === '9:16' ? 'w-72 aspect-[9/16]' : 'w-full max-w-2xl aspect-video'} bg-slate-900 rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10 relative group`}>
                                <video 
                                    src={generatedPost.videoUrl} 
                                    autoPlay 
                                    loop 
                                    muted 
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                <div className="absolute bottom-10 left-10 right-10">
                                    <p className="text-sm text-white line-clamp-3 font-medium opacity-90 leading-relaxed shadow-sm">{generatedPost.content}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-12 bg-slate-900/50 backdrop-blur-xl border-t border-white/5">
                           <textarea 
                              className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-slate-300 h-28 resize-none outline-none focus:border-blue-500 transition-all font-medium leading-relaxed"
                              value={generatedPost.content}
                              readOnly
                           />
                           <div className="mt-8 flex gap-6">
                              <button onClick={() => alert("Asset Exported!")} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-white/10 transition-all flex items-center justify-center gap-3">
                                 <Download size={18}/> Download
                              </button>
                              <button onClick={() => alert("Asset Published!")} className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-3 shadow-2xl transform active:scale-95">
                                 <Share2 size={18}/> Publish to {generatedPost.platform}
                              </button>
                           </div>
                        </div>
                    </div>
                 ) : (
                    <div className="text-center text-slate-800">
                       <div className="w-32 h-32 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-inner">
                          <Wand2 size={56} className="opacity-20" />
                       </div>
                       <p className="text-xs font-black uppercase tracking-[0.3em] opacity-30">Awaiting Directive</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MarketingCampaigns;
