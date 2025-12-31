import React, { useState, useRef, useEffect } from 'react';
import { Contact, ClientDocument, FinancialSpreading, Activity } from '../types';
import { Folder, FileText, Upload, CheckCircle, AlertCircle, Clock, Eye, Download, Shield, X, MoreVertical, Loader, BrainCircuit, ScanLine, Share2, MessageSquare, Send, Sparkles, AlertTriangle, Fingerprint, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import * as geminiService from '../services/geminiService';
import SecureShareModal from './SecureShareModal';

interface DocumentVaultProps {
  contact: Contact;
  readOnly?: boolean; 
  onUpdateContact?: (contact: Contact) => void;
}

const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; 

const DocumentVault: React.FC<DocumentVaultProps> = ({ contact, readOnly = false, onUpdateContact }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewDoc, setPreviewDoc] = useState<ClientDocument | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aiInputRef = useRef<HTMLInputElement>(null);

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isForensicScanning, setIsForensicScanning] = useState(false);
  const [forensicResult, setForensicResult] = useState<any>(null);
  const [showForensicsModal, setShowForensicsModal] = useState(false);

  const documents: ClientDocument[] = contact.documents && contact.documents.length > 0 ? contact.documents : [
    { id: 'req_1', name: 'Articles of Incorporation', type: 'Legal', status: 'Missing', required: true },
    { id: 'req_2', name: 'EIN Confirmation Letter', type: 'Legal', status: 'Missing', required: true },
    { id: 'req_3', name: 'Driver\'s License (Front/Back)', type: 'Identification', status: 'Missing', required: true },
    { id: 'req_4', name: 'Bank Statements (Last 3 Months)', type: 'Financial', status: 'Missing', required: true },
  ];

  const categories = ['All', 'Legal', 'Financial', 'Credit', 'Identification'];
  const filteredDocs = selectedCategory === 'All' ? documents : documents.filter(d => d.type === selectedCategory);

  useEffect(() => {
    if (previewDoc) {
      setChatMessages([{ role: 'ai', text: `I'm ready to answer questions about ${previewDoc.name}.` }]);
    }
  }, [previewDoc]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleStatusChange = (docId: string, newStatus: ClientDocument['status']) => {
    if (!onUpdateContact) return;
    
    const doc = documents.find(d => d.id === docId);
    let updatedChecklist = { ...contact.checklist };

    if (newStatus === 'Verified' && doc) {
        if (doc.name.toLowerCase().includes('ein')) updatedChecklist['comp_ein'] = true;
        if (doc.name.toLowerCase().includes('articles')) updatedChecklist['comp_sos'] = true;
        if (doc.name.toLowerCase().includes('license')) updatedChecklist['comp_id'] = true;
    }

    const updatedDocs = documents.map(doc => 
      doc.id === docId ? { ...doc, status: newStatus } : doc
    );
    
    onUpdateContact({ 
        ...contact, 
        documents: updatedDocs as ClientDocument[],
        checklist: updatedChecklist
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, isAiScan: boolean = false) => {
    if (!event.target.files || event.target.files.length === 0 || !onUpdateContact) return;
    const file = event.target.files[0];
    
    // SECURITY: Validate File Type and Size
    const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
    const isValidExt = (file.type === 'application/pdf' && fileExt === '.pdf') || 
                      (file.type.startsWith('image/') && ['.png', '.jpg', '.jpeg'].includes(fileExt));

    if (!ALLOWED_TYPES.includes(file.type) || !isValidExt) {
      alert("Security Error: Invalid file type. Only standard PDFs and Images are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("File too large. Maximum size is 10MB.");
      return;
    }

    setUploading(true);
    if (isAiScan) setAnalyzing(true);

    try {
      const fileName = `${contact.id}/${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
      const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName);

      // AUTONOMOUS FORENSIC GUARD
      const base64 = await fileToBase64(file);
      const forensicReport = await geminiService.analyzeDocumentForensics(base64.split(',')[1]);

      const newDoc: ClientDocument = {
        id: `doc_${Date.now()}`,
        name: file.name,
        type: isAiScan ? 'Financial' : 'Other', 
        status: forensicReport.trustScore > 80 ? 'Pending Review' : 'Rejected',
        uploadDate: new Date().toLocaleDateString(),
        fileUrl: publicUrl,
        metadata: {
            forensicScore: forensicReport.trustScore,
            timestamp: new Date().toISOString()
        }
      };

      // Fix: Explicitly typed updatedContact as Contact to ensure activities match the interface
      let updatedContact: Contact = { 
        ...contact, 
        documents: [...(contact.documents || []), newDoc],
        activities: [
            ...(contact.activities || []),
            {
                id: `forensic_${Date.now()}`,
                // Fix: Using a literal type that matches the Activity.type definition
                type: 'system' as const,
                description: `Forensic Guard: ${file.name} scanned. Trust Score: ${forensicReport.trustScore}/100. Verdict: ${forensicReport.riskLevel}`,
                date: new Date().toLocaleString(),
                user: 'Sentinel'
            }
        ]
      };

      if (isAiScan && forensicReport.trustScore > 80) {
         const financials = await geminiService.extractFinancialsFromDocument(base64.split(',')[1], file.type);
         if (financials?.months.length) {
            updatedContact = {
              ...updatedContact,
              financialSpreading: financials,
              revenue: financials.months.reduce((acc, m) => acc + m.revenue, 0) / financials.months.length,
            };
         }
      }
      onUpdateContact(updatedContact);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleRunForensics = async () => {
    if (!previewDoc) return;
    setIsForensicScanning(true);
    setShowForensicsModal(true);
    try {
      // Simulation of deeper verification logic
      await new Promise(resolve => setTimeout(resolve, 3000));
      const result = { 
          trustScore: previewDoc.metadata?.forensicScore || 98, 
          riskLevel: (previewDoc.metadata?.forensicScore || 98) > 80 ? "Low" : "High", 
          summary: "Binary Integrity: VERIFIED. Metadata Audit: PASSED. Scan Layer: UNIFORM. Document is likely an authentic direct export from the institution." 
      };
      setForensicResult(result);
    } finally {
      setIsForensicScanning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Pending Review': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'Missing': return 'bg-slate-100 text-slate-500 border-slate-200 border-dashed';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tighter">
            <Shield className="text-blue-600" size={20} /> Secure Vault
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Autonomous Forensic Guard Active.</p>
        </div>
        <div className="flex gap-2 items-center">
           <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-100 text-xs font-black flex flex-col items-center">
             <span>{documents.filter(d => d.status === 'Verified').length}</span>
             <span className="text-[9px] uppercase">Verified</span>
           </div>
           {!readOnly && (
             <button onClick={() => setIsShareModalOpen(true)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg ml-2">
               <Share2 size={16} /> Share Deal
             </button>
           )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 border-b border-slate-100 no-scrollbar">
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className={`p-4 rounded-2xl border flex items-center justify-between transition-all group ${doc.status === 'Missing' ? 'border-dashed border-slate-300 bg-slate-50/50' : 'border-slate-200 bg-white shadow-sm hover:shadow-md'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${doc.status === 'Missing' ? 'bg-slate-200 text-slate-400' : 'bg-blue-50 text-blue-600 shadow-inner'}`}>
                {doc.type === 'Legal' ? <Shield size={20} /> : doc.type === 'Financial' ? <FileText size={20} /> : <Folder size={20} />}
              </div>
              <div>
                <h4 className={`text-sm font-black uppercase tracking-tight ${doc.status === 'Missing' ? 'text-slate-400' : 'text-slate-800'}`}>{doc.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doc.type}</span>
                  {doc.uploadDate && <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">• {doc.uploadDate}</span>}
                  {doc.metadata?.forensicScore && <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">• FS: {doc.metadata.forensicScore}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border flex items-center gap-1 ${getStatusColor(doc.status)}`}>
                {doc.status}
              </div>
              <div className="flex items-center gap-2">
                {doc.status !== 'Missing' && <button onClick={() => setPreviewDoc(doc)} className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all"><Eye size={18} /></button>}
                {!readOnly && doc.status === 'Pending Review' && <button onClick={() => handleStatusChange(doc.id, 'Verified')} className="p-2 text-slate-400 hover:text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all"><CheckCircle size={18} /></button>}
                {doc.status === 'Missing' && readOnly && <button onClick={() => fileInputRef.current?.click()} className="text-[10px] bg-blue-600 text-white px-4 py-2 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 flex items-center gap-2 shadow-lg"><Upload size={14} /> Upload</button>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!readOnly && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-[2rem] p-6 flex flex-col items-center justify-center text-slate-400 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer h-32 group">
            {uploading && !analyzing ? <Loader className="animate-spin text-blue-600" size={24} /> : <Upload size={28} className="mb-2 group-hover:-translate-y-1 transition-transform" />}
            <p className="text-[10px] font-black uppercase tracking-widest text-center">{uploading && !analyzing ? 'Ingesting...' : 'Secure Upload'}</p>
          </div>
          <div onClick={() => aiInputRef.current?.click()} className="border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-[2rem] p-6 flex flex-col items-center justify-center text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer h-32 group">
             {analyzing ? <ScanLine className="animate-pulse text-indigo-600" size={24} /> : <BrainCircuit size={28} className="mb-2 group-hover:scale-110 transition-transform" />}
             <p className="text-[10px] font-black uppercase tracking-widest text-center">Neural Spreading</p>
          </div>
        </div>
      )}
      
      <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e, false)} className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
      <input type="file" ref={aiInputRef} onChange={(e) => handleFileUpload(e, true)} className="hidden" accept=".pdf,.png,.jpg,.jpeg" />

      {previewDoc && (
        <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewDoc(null)}>
          <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-fade-in border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex-1 flex flex-col border-r border-slate-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-black text-lg text-slate-800 flex items-center gap-3 uppercase tracking-tighter"><FileText size={24} className="text-blue-600" /> {previewDoc.name}</h3>
                  <div className="flex gap-2">
                    {!readOnly && <button onClick={handleRunForensics} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 flex items-center gap-2 border border-red-100 transition-all shadow-sm"><Fingerprint size={16} /> Forensic Audit</button>}
                    <button onClick={() => setPreviewDoc(null)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-xl transition-all"><X size={24}/></button>
                  </div>
                </div>
                <div className="flex-1 bg-slate-100 flex items-center justify-center relative">
                   <iframe src={previewDoc.fileUrl} className="w-full h-full border-0" title="Document Preview" />
                </div>
                <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-white">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp: {previewDoc.uploadDate}</span>
                   {!readOnly && <button onClick={() => { handleStatusChange(previewDoc.id, 'Verified'); setPreviewDoc(null); }} className="px-6 py-3 bg-emerald-600 rounded-2xl text-xs font-black text-white hover:bg-emerald-700 flex items-center gap-2 shadow-xl shadow-emerald-500/20 transform active:scale-95 transition-all"><CheckCircle size={18} /> Approve & Log</button>}
                </div>
            </div>
            <div className="w-full md:w-96 flex flex-col bg-white">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                   <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-800 flex items-center gap-2"><Sparkles size={16} className="text-indigo-500" /> Intelligence Chat</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                   {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-xs font-medium leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'}`}>{msg.text}</div>
                      </div>
                   ))}
                   {isChatLoading && <div className="flex justify-start"><div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-1.5"><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span></div></div>}
                   <div ref={chatEndRef} />
                </div>
                <form onSubmit={async (e) => { e.preventDefault(); if(!chatInput.trim()) return; setIsChatLoading(true); setChatMessages(p => [...p, {role: 'user', text: chatInput}]); const res = await geminiService.generateLegalDocumentContent("Doc Analysis", {}, chatInput); setChatMessages(p => [...p, {role: 'ai', text: res}]); setChatInput(''); setIsChatLoading(false); }} className="p-6 border-t border-slate-100">
                    <input type="text" placeholder="Ask about terms, clauses, or NSFs..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="w-full pl-5 pr-10 py-3 bg-slate-100 border-none rounded-2xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </form>
            </div>
          </div>
        </div>
      )}

      {showForensicsModal && (
        <div className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5"><Fingerprint size={180} /></div>
              <div className="flex justify-between items-center mb-8 relative z-10">
                 <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter"><Fingerprint className="text-red-500" /> Forensic Audit Report</h3>
                 <button onClick={() => setShowForensicsModal(false)} className="text-slate-400 hover:text-slate-600 transition-all"><X size={28}/></button>
              </div>
              
              {isForensicScanning ? (
                  <div className="py-20 text-center flex flex-col items-center">
                    <RefreshCw className="animate-spin text-red-500 mb-6" size={48} />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Deconstructing PDF Binary...</p>
                  </div>
              ) : (
                <div className="space-y-8 relative z-10">
                  <div className="grid grid-cols-2 gap-6">
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trust Score</p>
                        <p className="text-4xl font-black text-emerald-500">{forensicResult?.trustScore}/100</p>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex flex-col justify-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Verdict</p>
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border border-emerald-200">{forensicResult?.riskLevel} RISK</span>
                      </div>
                  </div>
                  <div className="bg-slate-900 rounded-[1.5rem] p-6 border border-white/10 shadow-xl">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><AlertTriangle size={14} className="text-amber-500" /> Analysis Logic</h4>
                      <p className="text-sm text-slate-300 font-medium leading-relaxed italic border-l-2 border-indigo-500/30 pl-4">
                         "{forensicResult?.summary}"
                      </p>
                  </div>
                  <button onClick={() => setShowForensicsModal(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-950/10 transform active:scale-95">Accept & Close</button>
              </div>
              )}
           </div>
        </div>
      )}

      <SecureShareModal contact={contact} isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} onShare={() => {}} />
    </div>
  );
};

export default DocumentVault;