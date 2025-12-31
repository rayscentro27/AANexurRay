
import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Activity, ShieldAlert, CheckCircle, Terminal, RefreshCw, Layers, BrainCircuit, Search } from 'lucide-react';

interface AutomationLog {
  id: string;
  timestamp: string;
  protocol: string;
  target: string;
  result: string;
  severity: 'info' | 'alert' | 'critical';
}

const LiveAutomationMonitor: React.FC = () => {
  const [logs, setLogs] = useState<AutomationLog[]>([
    { id: '1', timestamp: new Date().toLocaleTimeString(), protocol: 'Neural Scorer', target: 'TechCorp LLC', result: 'Risk Index Optimized (42 -> 15)', severity: 'info' },
    { id: '2', timestamp: new Date().toLocaleTimeString(), protocol: 'UCC Scanner', target: 'Portfolio-Wide', result: 'No Stacking Detected', severity: 'info' }
  ]);

  const [isScanning, setIsScanning] = useState(false);

  // Simulated live updates
  useEffect(() => {
    const interval = setInterval(() => {
      const protocols = ['Stale Escalator', 'Vetting Engine', 'Document Forensic', 'Renewal Predictor'];
      const targets = ['Apex Logistics', 'Green Energy Inc', 'A-Z Retail', 'Smith Engineering'];
      const results = ['Milestone Triggered', 'Escalated Priority', 'Forensic Pass', 'Matching Complete'];
      
      const newLog: AutomationLog = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        protocol: protocols[Math.floor(Math.random() * protocols.length)],
        target: targets[Math.floor(Math.random() * targets.length)],
        result: results[Math.floor(Math.random() * results.length)],
        severity: Math.random() > 0.8 ? 'alert' : 'info'
      };

      setLogs(prev => [newLog, ...prev].slice(0, 15));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center bg-slate-950 p-6 rounded-[2rem] border border-white/10 shadow-2xl">
         <div className="flex items-center gap-4">
            <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20 animate-pulse">
                <BrainCircuit size={28} className="text-slate-950" />
            </div>
            <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Nexus Sentinel Hub</h2>
                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em]">Neural Protocols: ONLINE</p>
            </div>
         </div>
         <div className="flex gap-4">
            <div className="text-right hidden md:block">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Latency</p>
                <p className="text-white font-mono text-lg">14ms</p>
            </div>
            <button 
                onClick={() => { setIsScanning(true); setTimeout(() => setIsScanning(false), 2000); }}
                className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
            >
                {isScanning ? <RefreshCw className="animate-spin" size={14}/> : <RefreshCw size={14}/>}
                Cycle Protocols
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[2rem] shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-5 border-b border-white/5 flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                <Terminal size={14} /> Neural Execution Stream
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono custom-scrollbar bg-black/20">
                {logs.map(log => (
                    <div key={log.id} className={`flex items-start gap-4 p-3 rounded-lg border transition-all ${
                        log.severity === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                        log.severity === 'alert' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                        'bg-white/5 border-white/5 text-slate-300'
                    }`}>
                        <span className="text-[10px] opacity-40 shrink-0">{log.timestamp}</span>
                        <div className="flex-1 text-xs">
                            <span className="font-black uppercase text-blue-400 mr-2">[{log.protocol}]</span>
                            <span className="font-bold text-white mr-2">{log.target}</span>
                            <span className="opacity-80">:: {log.result}</span>
                        </div>
                        {log.severity !== 'info' && <Zap size={12} className="animate-pulse fill-current" />}
                    </div>
                ))}
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
                <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <Activity size={16} className="text-blue-600"/> Efficiency Metrics
                </h3>
                <div className="space-y-6">
                    <MetricRow label="Auto-Prioritization" value="84%" sub="Leads auto-categorized" />
                    <MetricRow label="Forensic Pass Rate" value="96.2%" sub="Identity verified" />
                    <MetricRow label="Milestone Accuracy" value="99%" sub="Prediction confidence" />
                </div>
            </div>

            <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Layers size={100} /></div>
                <h3 className="font-black text-xs uppercase tracking-widest opacity-60 mb-2">Protocol Coverage</h3>
                <div className="text-4xl font-black tracking-tighter mb-4">42 Active</div>
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span>Compliance Hub</span>
                        <span>12 Rules</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white w-2/3"></div>
                    </div>
                </div>
                <button className="mt-8 w-full py-4 bg-white text-indigo-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-50 transition-all shadow-xl">
                    Configure New Protocol
                </button>
            </div>
         </div>
      </div>
    </div>
  );
};

const MetricRow = ({ label, value, sub }: any) => (
    <div>
        <div className="flex justify-between items-end mb-1">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
            <span className="text-lg font-black text-slate-900">{value}</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: value }}></div>
        </div>
        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1.5">{sub}</p>
    </div>
);

export default LiveAutomationMonitor;
