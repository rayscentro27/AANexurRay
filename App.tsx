
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CRMTable from './components/CRMTable';
import PortalView from './components/PortalView';
import AdminResources from './components/AdminResources';
import SignUp from './components/SignUp';
import Settings from './components/Settings';
import AICommandCenter from './components/AICommandCenter';
import DocumentQueue from './components/DocumentQueue';
import MarketingCampaigns from './components/MarketingCampaigns';
import YouTubeVideoAnalyzer from './components/YouTubeVideoAnalyzer';
import Login from './components/Login';
import ClientLandingPage from './components/ClientLandingPage';
import UnifiedInbox from './components/UnifiedInbox';
import PowerDialer from './components/PowerDialer';
import SalesTrainer from './components/SalesTrainer';
import VoiceReceptionist from './components/VoiceReceptionist';
import LeadDiscoveryMap from './components/LeadDiscoveryMap';
import FormBuilder from './components/FormBuilder';
import MarketIntelligence from './components/MarketIntelligence';
import LenderMarketplace from './components/LenderMarketplace';
import DocumentGenerator from './components/DocumentGenerator';
import RenewalTracker from './components/RenewalTracker';
import SmartCalendar from './components/SmartCalendar';
import WorkflowAutomation from './components/WorkflowAutomation';
import SyndicationManager from './components/SyndicationManager';
import ApplicationSubmitter from './components/ApplicationSubmitter';
import CommandPalette from './components/CommandPalette';
import MobileNav from './components/MobileNav';
import ReputationManager from './components/ReputationManager';
import PGFundingFlow from './components/PGFundingFlow';
import ExpenseTracker from './components/ExpenseTracker';
import CommissionManager from './components/CommissionManager';
import RiskMonitor from './components/RiskMonitor';
import SalesLeaderboard from './components/SalesLeaderboard';
import GrantManager from './components/GrantManager';
import CourseBuilder from './components/CourseBuilder';
import LoanServicing from './components/LoanServicing';
import CreditMemoBuilder from './components/CreditMemoBuilder';
import AdminCMS from './components/AdminCMS';
import SystemSitemap from './components/SystemSitemap';
import AdminSetupWizard from './components/AdminSetupWizard';
import NotificationCenter from './components/NotificationCenter';
import PhoneNotification from './components/PhoneNotification';
import LiveAutomationMonitor from './components/LiveAutomationMonitor';
import InvoicingHub from './components/InvoicingHub';
import StaffTraining from './components/StaffTraining';
import { ViewMode, Contact, AgencyBranding, Course, Notification } from './types';
import { Search, Bell, Zap, Command, Info, X } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { data } from './adapters';
import { BACKEND_CONFIG } from './adapters/config';
import { processAutomations } from './services/automationEngine';
import { runBackgroundProtocols } from './services/neuralEscalator';

export const App = () => {
  const { user, loading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.CLIENT_LANDING);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [branding, setBranding] = useState<AgencyBranding>({ 
    name: 'Nexus Funding', 
    primaryColor: '#10b981' 
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [automationToast, setAutomationToast] = useState<{show: boolean, msg: string, type: 'success' | 'error' | 'info'}>({show: false, msg: '', type: 'info'});

  const [isSystemReady, setIsSystemReady] = useState(false);

  useEffect(() => {
    const initData = async () => {
      const [c, b] = await Promise.all([data.getContacts(), data.getBranding()]);
      setContacts(c || []);
      if (b) {
        setBranding(b);
        // Protocol: If system name is default AND no contacts exist, system is in Setup Mode
        const isSetupRequired = b.name === 'Nexus Funding' && (!c || c.length === 0);
        setIsSystemReady(!isSetupRequired);
      }
    };
    initData();
  }, []);

  // NEURAL AUTOMATION LOOP
  useEffect(() => {
    const runAutomations = async () => {
        if (!isSystemReady || contacts.length === 0) return;
        
        const idx = Math.floor(Math.random() * contacts.length);
        const contact = contacts[idx];
        
        const res = await processAutomations(contact);
        if (res.triggeredActions.length > 0) {
            setContacts(prev => prev.map(c => c.id === res.updatedContact.id ? res.updatedContact : c));
        }

        const escalations = await runBackgroundProtocols(contacts);
        if (escalations.length > 0) {
            const topEsc = escalations[0];
            setContacts(prev => prev.map(c => c.id === topEsc.updatedContact.id ? topEsc.updatedContact : c));
            
            setAutomationToast({ 
                show: true, 
                msg: topEsc.actionTaken,
                type: topEsc.severity === 'critical' ? 'error' : topEsc.severity === 'alert' ? 'info' : 'success'
            });
            
            setNotifications(prev => [{
                id: `esc_${Date.now()}`,
                title: 'Sentinel Protocol',
                message: topEsc.actionTaken,
                date: 'Just now',
                read: false,
                type: topEsc.severity === 'critical' ? 'alert' : 'info'
            }, ...prev]);
        }
    };

    const interval = setInterval(runAutomations, 20000); 
    return () => clearInterval(interval);
  }, [isSystemReady, contacts.length]);

  useEffect(() => {
    if (loading) return;
    const handleRouting = () => {
      const hash = window.location.hash.replace('#', '').toUpperCase();
      const isValidView = Object.values(ViewMode).includes(hash as ViewMode);

      if (!user) {
        if (isValidView) setCurrentView(hash as ViewMode);
        return;
      }

      if (user.role === 'client') {
        if (hash !== 'PORTAL') window.location.hash = 'portal';
        else setCurrentView(ViewMode.PORTAL);
      } else {
        if (isValidView) {
          if ([ViewMode.CLIENT_LANDING, ViewMode.LOGIN, ViewMode.SIGNUP].includes(hash as ViewMode)) {
            if ((user.role === 'salesperson' || user.role === 'supervisor')) {
                window.location.hash = 'training';
            } else {
                window.location.hash = 'dashboard';
            }
          } else {
            setCurrentView(hash as ViewMode);
          }
        } else if (!hash) {
          if (user.role === 'salesperson' || user.role === 'supervisor') {
            window.location.hash = 'training';
          } else {
            window.location.hash = 'dashboard';
          }
        }
      }
    };
    window.addEventListener('hashchange', handleRouting);
    handleRouting();
    return () => window.removeEventListener('hashchange', handleRouting);
  }, [user, loading]);

  const updateContact = async (updatedContact: Contact) => {
    const saved = await data.updateContact(updatedContact);
    setContacts(prev => prev.map(c => c.id === saved.id ? saved : c));
  };

  const addContact = async (newContact: Partial<Contact>) => {
    const saved = await data.addContact(newContact);
    setContacts(prev => [saved, ...prev]);
  };

  const updateBranding = async (newBranding: AgencyBranding) => {
    const saved = await data.updateBranding(newBranding);
    setBranding(saved);
  };

  const navigate = (view: ViewMode) => {
    window.location.hash = view.toLowerCase();
  };

  const showNavigation = user && user.role !== 'client' && ![ViewMode.CLIENT_LANDING, ViewMode.LOGIN, ViewMode.SIGNUP].includes(currentView) && isSystemReady;

  const renderContent = () => {
    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;

    if (!user) {
        if (currentView === ViewMode.SIGNUP) return <SignUp onRegister={addContact} onNavigate={navigate} />;
        if (currentView === ViewMode.LOGIN) return <Login onLogin={() => {}} onBack={() => navigate(ViewMode.CLIENT_LANDING)} />;
        return <ClientLandingPage onNavigate={navigate} />;
    }

    if (user.role === 'client' || currentView === ViewMode.PORTAL) {
      let myContact = contacts.find(c => c.email.toLowerCase() === user.email.toLowerCase());
      if (!myContact && contacts.length > 0) myContact = contacts[0];
      
      const skeletonContact: Contact = {
        id: 'new', name: user.name || 'New Client', email: user.email, phone: '', company: 'New Business', status: 'Lead', lastContact: 'Just now', value: 0, source: 'Self-Registration', notes: 'Waiting for profile setup.', checklist: {}, clientTasks: []
      };
      return <PortalView contact={myContact || skeletonContact} branding={branding} onLogout={signOut} onUpdateContact={updateContact} availableCourses={courses} />;
    }

    // MANDATORY GATING FOR FIRST-TIME ADMIN SETUP
    if (!isSystemReady && user.role === 'admin') {
      if (user.isMasterAdmin) {
        return <AdminSetupWizard onNavigate={navigate} branding={branding} onUpdateBranding={updateBranding} />;
      }
      return (
        <div className="h-screen flex items-center justify-center bg-slate-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm max-w-md text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Setup pending</h2>
            <p className="text-slate-500 text-sm">A master admin must complete initial setup before staff can continue.</p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case ViewMode.DASHBOARD: return <Dashboard contacts={contacts} />;
      case ViewMode.CRM: return <CRMTable contacts={contacts} onUpdateContact={updateContact} onAddContact={addContact} />;
      case ViewMode.SETTINGS: return <Settings branding={branding} onUpdateBranding={updateBranding} />;
      case ViewMode.MARKETING: return <MarketingCampaigns contacts={contacts} branding={branding} onUpdateBranding={updateBranding} />;
      case ViewMode.YOUTUBE_ANALYZER: return <YouTubeVideoAnalyzer />;
      case ViewMode.POWER_DIALER: return <PowerDialer queue={contacts} onUpdateContact={updateContact} onClose={() => navigate(ViewMode.CRM)} />;
      case ViewMode.LENDERS: return <LenderMarketplace />;
      case ViewMode.DOC_GENERATOR: return <DocumentGenerator contacts={contacts} onUpdateContact={updateContact} />;
      case ViewMode.REVIEW_QUEUE: return <DocumentQueue contacts={contacts} onUpdateContact={updateContact} />;
      case ViewMode.GRANTS: return <GrantManager contacts={contacts} onUpdateContact={updateContact} />;
      case ViewMode.SITEMAP: return <SystemSitemap onNavigate={navigate} />;
      case ViewMode.EXPENSES: return <ExpenseTracker />;
      case ViewMode.COMMISSIONS: return <CommissionManager contacts={contacts} />;
      case ViewMode.RISK_MONITOR: return <RiskMonitor />;
      case ViewMode.FUNDING_FLOW: return <PGFundingFlow />;
      case ViewMode.AUTOMATION: return <LiveAutomationMonitor />;
      case ViewMode.INVOICING: return <InvoicingHub contacts={contacts} onUpdateContact={updateContact} />;
      case ViewMode.TRAINING: return <StaffTraining />;
      default: return <Dashboard contacts={contacts} />;
    }
  };

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {BACKEND_CONFIG.mode === 'mvp_mock' && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-[10px] font-bold text-center z-[200] py-1 flex items-center justify-center gap-2">
           <Info size={10} /> MVP MODE ACTIVE: Data resides in local storage.
        </div>
      )}
      {showNavigation && <Sidebar currentView={currentView} onViewChange={navigate} onLogout={signOut} branding={branding} />}
      <main className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${showNavigation ? 'md:ml-64 mt-4' : ''}`}>
        {showNavigation && (
          <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 sticky top-0 shadow-sm">
             <div onClick={() => setIsCommandOpen(true)} className="flex items-center gap-3 bg-slate-100 hover:bg-slate-200 transition-all px-5 py-2.5 rounded-2xl cursor-pointer text-slate-400 text-sm w-full max-w-lg border border-slate-100 group">
                <Search size={18} className="group-hover:text-indigo-500 transition-colors" /><span className="flex-1">Search anything...</span><kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[10px] font-mono font-bold text-slate-400"><Command size={10} /> K</kbd>
             </div>
             <div className="flex items-center gap-6">
               <div className="hidden lg:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100"><Zap size={14} className="fill-emerald-600" /> AI Link Active</div>
               <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
                 <button onClick={() => setIsNotificationsOpen(true)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative">
                    <Bell size={22} />
                    {unreadNotifCount > 0 && <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[8px] font-black text-white flex items-center justify-center">{unreadNotifCount}</span>}
                 </button>
                 <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white border border-white/10 flex items-center justify-center font-black text-sm shadow-xl transform hover:scale-105 transition-all cursor-pointer">{user?.email?.charAt(0).toUpperCase()}</div>
               </div>
             </div>
          </header>
        )}
        <div className={`flex-1 overflow-auto custom-scrollbar relative ${isSystemReady ? 'p-4 md:p-8' : ''} ${showNavigation ? 'pb-24 md:pb-8' : ''}`}>
           {renderContent()}
        </div>
        {showNavigation && <MobileNav currentView={currentView} onViewChange={navigate} onToggleSidebar={() => {}} />}
        {isSystemReady && user && user.role !== 'client' && <AICommandCenter contacts={contacts} onUpdateContact={updateContact} />}
        
        <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} contacts={contacts} onNavigate={navigate} onSelectContact={updateContact} />
        <NotificationCenter isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} notifications={notifications} onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n))} onMarkAllRead={() => setNotifications(prev => prev.map(n => ({...n, read: true})))} />
        <PhoneNotification show={automationToast.show} title="Sentinel Protocol" message={automationToast.msg} type={automationToast.type} onClose={() => setAutomationToast({...automationToast, show: false})} />
      </main>
    </div>
  );
};
