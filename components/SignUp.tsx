
import React, { useState } from 'react';
import { Hexagon, ArrowRight, CheckCircle, Shield, TrendingUp, AlertCircle, Loader, Sparkles } from 'lucide-react';
import { Contact, ViewMode } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { sanitizeString, isValidEmail, isValidPhone } from '../utils/security';

interface SignUpProps {
  onRegister: (contact: Contact) => void;
  onNavigate: (view: ViewMode) => void;
}

const SignUp: React.FC<SignUpProps> = ({ onRegister, onNavigate }) => {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    password: '',
    targetAmount: '50000',
    fundingType: 'Business Line of Credit'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // SECURITY: Input Validation
    if (!isValidEmail(formData.email)) {
        setError("Please enter a valid work email address.");
        setLoading(false);
        return;
    }
    if (!isValidPhone(formData.phone)) {
        setError("Please enter a valid 10-digit phone number.");
        setLoading(false);
        return;
    }
    if (formData.password.length < 8) {
        setError("Password must be at least 8 characters for security.");
        setLoading(false);
        return;
    }

    // SECURITY: Input Sanitization
    const sanitizedName = sanitizeString(formData.name);
    const sanitizedCompany = sanitizeString(formData.company);

    try {
      await signUp({
        email: formData.email,
        name: sanitizedName,
        company: sanitizedCompany,
        phone: formData.phone,
        password: formData.password
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl text-center animate-fade-in">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Initialized</h2>
          <p className="text-slate-600 mb-6">
            Your secure portal is being provisioned. Redirecting to your workspace...
          </p>
          <div className="flex justify-center">
             <Loader className="animate-spin text-blue-600" size={24} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      <div className="md:w-1/2 bg-slate-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <Hexagon size={400} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <Hexagon className="text-blue-500 fill-blue-500" size={32} />
            <span className="text-2xl font-bold tracking-wide">Nexus OS</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Establish Your Funding Infrastructure.
          </h1>
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            Register your entity to access the 4-Tier Strategic Roadmap and automated lender compliance vetting.
          </p>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Shield className="text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">First User Protocol</h3>
                <p className="text-slate-400 text-sm">The first registered account is granted master Admin privileges.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-green-400" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Secure Deployment</h3>
                <p className="text-slate-400 text-sm">Automated handshakes with Gemini AI and your database.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-500 mt-12">
          © 2024 Nexus Intelligence OS.
        </div>
      </div>

      <div className="md:w-1/2 p-8 md:p-16 overflow-y-auto bg-slate-50 flex flex-col items-center justify-center">
        <div className="max-w-md w-full">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Create your account</h2>
          <p className="text-slate-500 mb-8">Begin the system initialization process.</p>

          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input 
                  required
                  type="tel" 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="(555) 000-0000"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="TechCorp Inc."
                value={formData.company}
                onChange={e => setFormData({...formData, company: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Work Email</label>
              <input 
                required
                type="email" 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="you@company.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                required
                type="password" 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                minLength={8}
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2 mt-6 disabled:opacity-70"
            >
              {loading ? <Loader className="animate-spin" size={20} /> : <>Initialize Account <ArrowRight size={20} /></>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
                onClick={() => onNavigate(ViewMode.LOGIN)} 
                className="text-sm font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors"
            >
                Already have an account? Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
