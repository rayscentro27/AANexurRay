
import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Globe, Settings, LogOut, Hexagon, 
  Inbox, Calendar, GitBranch, Mic, Phone, Map, LayoutTemplate, 
  PieChart, Tv, FileText, Layout, List, FileCheck, Briefcase, 
  Menu, X, Megaphone, ChevronRight, Share2, Map as MapIcon, 
  Target, BarChart3, Star, CreditCard, ShieldCheck, GraduationCap, MapPinned, Zap,
  Activity, Gavel, Bell, ShieldAlert, BookOpen, Fingerprint, Youtube,
  Facebook, Instagram, Linkedin
} from 'lucide-react';
import { ViewMode, AgencyBranding } from './types';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  pendingDocCount?: number; 
  onLogout: () => void;
  branding?: AgencyBranding;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, pendingDocCount = 0, onLogout, branding }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleNav = (view: ViewMode) => {
    window.location.hash = view.toLowerCase();
    setIsMobileOpen(false);
  };

  const disconnectedSocials = branding?.socialConnections?.filter(s => !s.connected).length || 0;
  const connectedSocials = branding?.socialConnections?.filter(s => s.connected) || [];

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return <Facebook size={18} />;
      case 'instagram': return <Instagram size={18} />;
      case 'linkedin': return <Linkedin size={18} />;
      default: return null;
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsMobileOpen(!isMobileOpen)} 
        className="md:hidden fixed top-4 left-4 z-[60] p-2.5 bg-slate-950 text-white rounded-xl shadow-lg border border-white/10 hover:bg-slate-900 transition-all active:scale-95"
      >
        {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <div className={`fixed top-0 left-0 h-screen w-64 bg-slate-950 text-white flex flex-col shadow-2xl z-50 transition-transform duration-300 ease-in-out border-r border-white/10 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Branding Header */}
        <div className="p-6 flex items-center gap-3 border-b border-white/5 bg-slate-950 relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full"></div>
          <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-900/40 transform -rotate-3 transition-transform group-hover:rotate-0">
            <Hexagon className="text-slate-950 fill-slate-950/10" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tighter uppercase leading-none">
              {branding?.name || 'Nexus'}<span className="text-emerald-500">OS</span>
            </span>
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">v2.5 Intelligence Core</span>
          </div>
        </div>

        {/* Navigation Scroll Area */}
        <nav className="flex-1 py-6 px-4 space-y-8 overflow-y-auto no-scrollbar scroll-smooth">
          
          <SidebarSection label="Global Ops">
            <SidebarItem id={ViewMode.DASHBOARD} label="Executive Desk" icon={LayoutDashboard} currentView={currentView} onViewChange={handleNav} />
            <SidebarItem id={ViewMode.INBOX} label="Unified Inbox" icon={Inbox} currentView={currentView} onViewChange={handleNav} badge={3} />
            <SidebarItem id={ViewMode.CALENDAR} label="Smart Calendar" icon={Calendar} currentView={currentView} onViewChange={handleNav} />
            <SidebarItem id={ViewMode.AUTOMATION} label="Neural Sentinel" icon={Zap} currentView={currentView} onViewChange={handleNav} />
          </SidebarSection>

          <SidebarSection label="Acquisition">
            <SidebarItem id={ViewMode.CRM} label="CRM Pipeline" icon={Users} currentView={currentView} onViewChange={handleNav} />
            <SidebarItem id={ViewMode.POWER_DIALER} label="Power Dialer" icon={Phone} currentView={currentView} onViewChange={handleNav} />
            <SidebarItem id={ViewMode.SALES_TRAINER} label="AI Sales Coach" icon={Mic} currentView={currentView} onViewChange={handleNav} />
            <SidebarItem id={ViewMode.GRANTS} label="Grant Finder" icon={Star} currentView={currentView} onViewChange={handleNav} />
            <SidebarItem id={ViewMode.YOUTUBE_ANALYZER} label="Video Intel" icon={Youtube} currentView={currentView} onViewChange={handleNav} />
            <SidebarItem id={ViewMode.MARKETING} label="Content Factory" icon={Megaphone} currentView={currentView} onViewChange={handleNav} />
            <SidebarItem id={ViewMode.LEAD_MAP} label="Geo Scout" icon={MapPinned} currentView={currentView} onViewChange={handleNav} />
          </SidebarSection>

          <SidebarSection label="Capital Lab">
            <SidebarItem id={ViewMode.LENDERS} label="Lender Market" icon={Briefcase} currentView={currentView} onViewChange={handleNav} />
            <SidebarItem id={ViewMode.DOC_GENERATOR} label="Doc Generator" icon={FileText} currentView={currentView} onViewChange={handleNav} />
            <SidebarItem id={ViewMode.RISK_MONITOR} label="Risk Sentinel" icon={ShieldAlert} currentView={currentView} onViewChange={handleNav} />
            <SidebarItem id={ViewMode.REVIEW_QUEUE} label="Review Queue" icon={Fingerprint} currentView={currentView} onViewChange={handleNav} badge={pendingDocCount || undefined} badgeColor="bg-amber-500" />
          </SidebarSection>

          <SidebarSection label="System">
            <SidebarItem id={ViewMode.SITEMAP} label="Core Sitemap" icon={List} currentView={currentView} onViewChange={handleNav} />
            <SidebarItem id={ViewMode.SETTINGS} label="OS Settings" icon={Settings} currentView={currentView} onViewChange={handleNav} badge={disconnectedSocials > 0 ? disconnectedSocials : undefined} badgeColor="bg-red-500" />
          </SidebarSection>
        </nav>
        
        {/* Footer Vitals & Logout */}
        <div className="p-4 border-t border-white/5 bg-slate-950/80 backdrop-blur-md">
          {/* Social Connections */}
          {connectedSocials.length > 0 && (
            <div className="flex items-center gap-4 px-2 mb-6 animate-fade-in">
              {connectedSocials.map((social) => (
                <a 
                  key={social.platform} 
                  href={`https://${social.platform.toLowerCase()}.com/${social.handle}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-emerald-400 transition-colors"
                  aria-label={social.platform}
                >
                  {getSocialIcon(social.platform)}
                </a>
              ))}
            </div>
          )}

          <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
             <div className="flex justify-between items-center mb-1">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Neural Load</span>
                <span className="text-[8px] font-black text-emerald-400 uppercase">Stable</span>
             </div>
             <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-1/3 shadow-[0_0_10px_#10b981]"></div>
             </div>
          </div>

          <button 
            onClick={onLogout} 
            className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 transition-all w-full rounded-xl hover:bg-red-400/5 font-black text-[10px] uppercase tracking-widest group border border-transparent hover:border-red-400/20"
          >
            <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Terminate Session</span>
          </button>
        </div>
      </div>
      
      {isMobileOpen && <div className="fixed inset-0 z-40 bg-slate-950/60 md:hidden backdrop-blur-sm transition-all" onClick={() => setIsMobileOpen(false)}></div>}
    </>
  );
};

const SidebarSection: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <section className="space-y-1">
    <div className="px-3 mb-3 flex items-center justify-between">
      <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.25em]">{label}</span>
      <div className="h-px bg-white/5 flex-1 ml-4"></div>
    </div>
    {children}
  </section>
);

interface SidebarItemProps {
  id: ViewMode;
  label: string;
  icon: React.ElementType;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  badge?: number;
  badgeColor?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ id, label, icon: Icon, currentView, onViewChange, badge, badgeColor = 'bg-blue-600' }) => {
  const isActive = currentView === id;

  return (
    <button 
      onClick={() => onViewChange(id)}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 group relative ${
        isActive 
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[inset_0_0_15px_rgba(16,185,129,0.05)]' 
          : 'text-slate-500 hover:bg-white/5 hover:text-slate-200 border border-transparent'
      }`}
    >
      {/* Active Anchor */}
      {isActive && <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></div>}

      <div className="flex items-center gap-3 overflow-hidden">
        <div className={`flex-shrink-0 transition-all duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
          <Icon 
            size={18}
            strokeWidth={isActive ? 2.5 : 2}
            className={isActive ? 'text-emerald-400 drop-shadow-[0_0_3px_rgba(16,185,129,0.5)]' : 'text-slate-600 group-hover:text-slate-300 transition-colors'} 
          />
        </div>
        <span className={`font-black text-[10px] uppercase tracking-wider truncate transition-all duration-300 ${isActive ? 'translate-x-1' : 'translate-x-0'}`}>
          {label}
        </span>
      </div>

      {badge !== undefined ? (
        <div className={`px-1.5 py-0.5 rounded-md text-[9px] font-black min-w-[1.25rem] text-center shadow-lg ${isActive ? 'bg-emerald-50 text-slate-950' : `${badgeColor} text-white`}`}>
          {badge}
        </div>
      ) : (
        <ChevronRight size={10} className={`opacity-0 -translate-x-2 transition-all group-hover:opacity-40 group-hover:translate-x-0 ${isActive ? 'text-emerald-400' : 'text-slate-600'}`} />
      )}
    </button>
  );
};

export default Sidebar;
