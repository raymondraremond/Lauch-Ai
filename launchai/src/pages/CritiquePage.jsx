import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CritiqueSubmit from '../components/CritiqueSubmit';
import { supabase } from '../lib/supabase';
import { FileText, Clock, ChevronRight, MessageSquare, Trash2, Calendar } from 'lucide-react';

export default function CritiquePage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('critiques')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      console.warn('Failed to fetch critique history:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  return (
    <div className="relative min-h-screen overflow-hidden bg-void">
      <Navbar minimal />
      <Sidebar />
      
      {/* Background Atmosphere */}
      <div className="mesh-glow" />
      <div className="grain-overlay" />
      
      <main className="relative z-10 ml-[220px] pt-[76px] pb-24 px-6 md:px-8">
        <div className="max-w-[900px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Submit Form */}
          <div className="lg:col-span-8">
             <CritiqueSubmit onComplete={fetchHistory} />
          </div>

          {/* Right Column: History Sidebar */}
          <div className="lg:col-span-4 space-y-6">
             <div className="flex items-center justify-between mb-2">
                <h3 className="section-label !mb-0 flex items-center gap-2">
                   <Clock size={14} className="text-secondary" /> History
                </h3>
             </div>

             <div className="space-y-3">
                {loading ? (
                   [1, 2, 3].map(i => (
                      <div key={i} className="card p-4 border-base bg-base/30 animate-pulse">
                         <div className="h-2 w-24 bg-white/10 rounded-full mb-3" />
                         <div className="h-3 w-40 bg-white/5 rounded-full" />
                      </div>
                   ))
                ) : history.length === 0 ? (
                   <div className="card p-8 border-dashed border-base bg-transparent text-center">
                      <p className="text-[12px] text-text-muted italic">No audits yet</p>
                   </div>
                ) : (
                   history.map(item => (
                      <div key={item.id} className="card p-4 border-base bg-base/30 hover:border-accent/40 transition-all cursor-pointer group relative overflow-hidden">
                         <div className="flex items-start justify-between mb-2">
                            <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">{formatTime(item.created_at)}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-tighter ${item.tier === 'pro' ? 'bg-accent/20 text-accent' : 'bg-success/20 text-success'}`}>
                               {item.tier}
                            </span>
                         </div>
                         <h4 className="font-display font-semibold text-primary text-sm truncate pr-4 group-hover:text-accent transition-colors">{item.project_title}</h4>
                         <p className="text-[11px] text-secondary line-clamp-2 mt-1 opacity-70 leading-relaxed">
                            {item.critique_text.slice(0, 80)}...
                         </p>
                         <ChevronRight size={14} className="absolute bottom-4 right-4 text-secondary opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                      </div>
                   ))
                )}
             </div>

             <div className="p-4 rounded-xl bg-accent/[0.03] border border-accent/10">
                <div className="flex items-center gap-2 text-accent mb-1">
                   <FileText size={14} />
                   <span className="text-[11px] font-bold uppercase tracking-wider">Audit Credits</span>
                </div>
                <p className="text-[11px] text-secondary opacity-70 leading-relaxed">
                   Pro audits provide deeper strategic depth and competitive analysis. Top up from <a href="/settings" className="text-secondary hover:text-accent underline font-medium">Settings</a>.
                </p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
