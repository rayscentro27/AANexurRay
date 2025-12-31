
import React, { useState } from 'react';
import { Hexagon, Lock, Mail, ArrowRight, User, ShieldCheck, Building2, Phone, UserPlus, Sparkles, Info, X, AlertCircle } from 'lucide-react';
import { User as UserType } from '../types';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import PhoneNotification from './PhoneNotification';

interface LoginProps {
  onLogin: (user: UserType) => void;
  onBack?: () => void;
}

const Login: React.FC<LoginProps> = ({ onBack }) => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Sign Up Fields
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notify, setNotify] = useState({ show: false, message: '', title: '', type: 'info' as 'info' | 'success' | 'error' });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isSignUp) {
        await signUp({
            email,
            name: fullName,
            company: companyName,
            phone: phone,
            password: password
        });
        setNotify({ show: true, title: 'Welcome', message: 'Account created and secured.', type: 'success' });
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed';
      setError(msg);
      setNotify({ show: true, title: 'Auth Failed', message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'client') => {
    setLoading(true);
    setError(null);
    const targetEmail = role === 'admin' ? 'admin@nexus.funding' : 'alice@techcorp.com';
    
    try {
        // Try sign in first
        await signIn(targetEmail, 'password');
    } catch (e: any) {
        // If sign in fails (likely user doesn't exist yet), try sign up
        try {
            await signUp({
                email: targetEmail,
                name: role === 'admin' ? 'System Admin' : 'Alice Freeman',
                company: role === 'admin' ? 'Nexus OS' : 'TechCorp Solutions',
                phone: '555-0100',
                password: 'password'
            });
        } catch (innerErr: any) {
            setError(innerErr.message);
            setNotify({ show: true, title: 'Demo Error', message: innerErr.message, type: 'error' });
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500 rounded-full blur-[120px] opacity-10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900 rounded-full blur-[120px] opacity-20"></div>
      </div>

      <div className="bg-white/5 backdrop-blur-3xl w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden z-10 flex flex-col animate-fade-in border border-white/10 relative">
        {!isSupabaseConfigured && (
          <div className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-[0.2em] py-2 text-center flex items-center justify-center gap-2">
            <Sparkles size={12} /> Emerald Tier Active (Demo Mode)
          </div>
        )}

        <div className="p-8 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl mb-4 shadow-lg shadow-emerald-500/20 transform rotate-3">
            <Hexagon className="text-slate-950 fill-slate-950/10" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Nexus Funding</h1>
          <p className="text-emerald-500/70 mt-2 text-sm font-bold uppercase tracking-widest">
            {isSignUp ? 'New Capital Account' : 'Secure Operating System'}
          </p>
        </div>

        <div className="px-8 pb-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-fade-in">
              <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-red-200 font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {!isSignUp && (
            <div className="mb-6">
              <button 
                onClick={() => setShowSetupGuide(!showSetupGuide)}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:bg-emerald-500/20 transition-all mb-4"
              >
                {showSetupGuide ? <X size={14}/> : <Info size={14} />} 
                {showSetupGuide ? 'Close Setup Guide' : 'Deployment Instructions'}
              </button>

              {showSetupGuide && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 animate-fade-in text-xs space-y-3">
                   <p className="text-slate-300 font-medium">System Onboarding Protocol:</p>
                   <ol className="list-decimal list-inside space-y-2 text-slate-400">
                      <li>The <strong>first user</strong> to Register is granted <span className="text-white font-bold">Admin</span> role automatically.</li>
                      <li>Use the "Apply Now" link below to create your account.</li>
                      <li>Once logged in, you will enter the <strong>Nexus Launchpad</strong> to link Gemini.</li>
                   </ol>
                </div>
              )}
            </div>
          )}

          {!isSignUp && !showSetupGuide && (
            <div className="mb-8 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px bg-white/10 flex-1"></div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Fast Track Access</span>
                <div className="h-px bg-white/10 flex-1"></div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => handleDemoLogin('admin')} className="group flex items-center gap-4 p-4 bg-white/5 text-emerald-400 border border-white/10 rounded-2xl transition-all hover:bg-white/10 hover:border-emerald-500/50">
                  <ShieldCheck size={24} className="group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <span className="font-black text-[10px] uppercase tracking-widest block">Initialize Admin</span>
                    <span className="text-[9px] text-slate-500 uppercase">System Owner Access</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-4 animate-fade-in">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" size={18} />
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" required={isSignUp} className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" size={18} />
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company" required={isSignUp} className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white text-sm" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" size={18} />
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" required={isSignUp} className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white text-sm" />
                  </div>
                </div>
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" size={18} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white text-sm" />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" size={18} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white text-sm" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/10 disabled:opacity-70 mt-4 uppercase tracking-widest text-xs">
              {loading ? 'Processing...' : isSignUp ? <>Create Account <UserPlus size={18} /></> : <>Enter Portal <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-xs text-slate-400 hover:text-emerald-400 font-bold uppercase tracking-widest transition-colors">
              {isSignUp ? 'Back to Sign In' : "New client? Apply Now"}
            </button>
          </div>
        </div>
      </div>
      <PhoneNotification show={notify.show} title={notify.title} message={notify.message} type={notify.type} onClose={() => setNotify({...notify, show: false})} />
    </div>
  );
};

export default Login;
