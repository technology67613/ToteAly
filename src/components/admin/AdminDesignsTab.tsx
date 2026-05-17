import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Clock, Eye, Download, Search, Loader2, 
  Trash2, Archive, Check, EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const AdminDesignsTab = () => {
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/designs');
      if (res.ok) setDesigns(await res.json());
    } catch (e) {
      console.error(e);
      toast.error("Failed to load design queue");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdating(id);
    const toastId = toast.loading(`Updating status to ${status}...`);
    try {
      const res = await fetch('/api/admin/designs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        toast.success(`Design status set to ${status}!`, { id: toastId });
        fetchDesigns();
      } else {
        const err = await res.json();
        toast.error(err.error || "Update failed", { id: toastId });
      }
    } catch (e) {
      console.error(e);
      toast.error("Server update failed", { id: toastId });
    } finally {
      setUpdating(null);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id) 
        : [...prev, id]
    );
  };

  const handlePurgeSelected = async () => {
    if (selectedIds.length === 0) return;
    const toastId = toast.loading(`Purging ${selectedIds.length} custom masterpieces...`);
    try {
      const res = await fetch('/api/admin/designs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        toast.success(`Purged ${selectedIds.length} masterpieces successfully!`, { id: toastId });
        setSelectedIds([]);
        fetchDesigns();
      } else {
        const err = await res.json();
        toast.error(err.error || "Purge failed", { id: toastId });
      }
    } catch (e) {
      console.error(e);
      toast.error("Unexpected error during purge", { id: toastId });
    }
  };

  const handleArchiveSelected = async () => {
    if (selectedIds.length === 0) return;
    const toastId = toast.loading(`Archiving ${selectedIds.length} masterpieces...`);
    try {
      const res = await fetch('/api/admin/designs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, status: 'archived' })
      });
      if (res.ok) {
        toast.success(`Archived ${selectedIds.length} masterpieces successfully!`, { id: toastId });
        setSelectedIds([]);
        fetchDesigns();
      } else {
        const err = await res.json();
        toast.error(err.error || "Archive failed", { id: toastId });
      }
    } catch (e) {
      console.error(e);
      toast.error("Unexpected error during archive", { id: toastId });
    }
  };

  const handleDownloadAssets = (design: any) => {
    if (!design.canvas_json) {
      toast.error("No raw assets found for this design");
      return;
    }
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(design.canvas_json, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `masterpiece_${design.id}_design.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success("Design assets downloaded successfully!");
    } catch {
      toast.error("Failed to export canvas assets");
    }
  };

  // Filters
  const filteredDesigns = designs.filter(design => {
    const matchesSearch = 
      (design.bag_type?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (design.profiles?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (design.profiles?.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || design.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-20 text-center flex flex-col items-center justify-center gap-4 animate-pulse">
        <Loader2 className="animate-spin text-[var(--admin-primary)]" size={32} />
        <span className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">
          Loading design queue...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32 relative">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-serif font-bold">Custom Designs</h2>
          <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">Review, approve, and batch action user-generated masterpieces</p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search designs..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-2.5 bg-white border border-[var(--admin-border)] rounded-2xl text-xs focus:outline-none focus:border-[var(--admin-primary)] w-60 transition-all font-medium"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-[var(--admin-border)] rounded-2xl text-xs focus:outline-none focus:border-[var(--admin-primary)] transition-all font-medium cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDesigns.map((design) => {
          const isSelected = selectedIds.includes(design.id);
          return (
            <motion.div 
              key={design.id}
              onClick={() => toggleSelection(design.id)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-white rounded-[32px] border overflow-hidden shadow-sm group hover:shadow-xl transition-all cursor-pointer relative ${
                isSelected ? 'border-[#E60042] ring-2 ring-[#E60042]/10' : 'border-[var(--admin-border)]'
              }`}
            >
              <div className="aspect-square bg-[var(--admin-light)] relative overflow-hidden flex items-center justify-center p-8">
                {/* Circular checkbox selector matching custom designs badge */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelection(design.id);
                  }}
                  className={`absolute top-5 left-5 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-[#E60042] text-white shadow-lg shadow-[#E60042]/20 scale-100' 
                      : 'bg-white/90 border border-gray-200 hover:scale-105 hover:bg-white text-transparent'
                  }`}
                >
                  <Check size={14} strokeWidth={3} className={isSelected ? 'opacity-100' : 'opacity-0'} />
                </button>

                <img 
                  src={design.thumbnail_url || "/products/plain.png"} 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                  alt="Design preview"
                />

                <div className="absolute top-5 right-5">
                   <span className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm ${
                     design.status === 'approved' ? 'bg-emerald-500 text-white' :
                     design.status === 'rejected' ? 'bg-rose-500 text-white' :
                     design.status === 'archived' ? 'bg-gray-500 text-white' :
                     'bg-amber-500 text-white'
                   }`}>
                     {design.status === 'pending_review' ? 'pending' : design.status}
                   </span>
                </div>
              </div>
              
              <div className="p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">{design.bag_type || "Daily Canvas Tote"}</p>
                    <h4 className="font-bold text-[var(--admin-text-primary)] mt-1.5">{design.profiles?.name || 'Guest Designer'}</h4>
                    {design.profiles?.email && (
                      <p className="text-[10px] text-[var(--admin-text-muted)] mt-0.5">{design.profiles.email}</p>
                    )}
                  </div>
                  <p className="font-serif font-bold text-lg text-[var(--admin-primary)]">₹{design.price || 499}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  {design.status === 'pending_review' && (
                    <>
                      <button 
                        onClick={() => handleUpdateStatus(design.id, 'approved')}
                        disabled={!!updating}
                        className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-sm hover:shadow active:scale-95"
                      >
                        {updating === design.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                        Approve
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(design.id, 'rejected')}
                        disabled={!!updating}
                        className="flex-1 py-3 bg-rose-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-600 transition-all shadow-sm hover:shadow active:scale-95"
                      >
                        <XCircle size={12} />
                        Reject
                      </button>
                    </>
                  )}
                  {design.status !== 'pending_review' && (
                     <button 
                      onClick={() => handleUpdateStatus(design.id, 'pending_review')}
                      className="w-full py-3 bg-[var(--admin-light)] text-[var(--admin-text-muted)] rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-100 transition-all"
                     >
                       <Clock size={12} /> Reset Status
                     </button>
                  )}
                </div>
                
                <button 
                  onClick={() => handleDownloadAssets(design)}
                  className="w-full py-3 border border-[var(--admin-border)] rounded-xl text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] flex items-center justify-center gap-2 hover:bg-[var(--admin-light)] transition-all active:scale-95"
                >
                  <Download size={12} /> Download Assets
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredDesigns.length === 0 && (
        <div className="py-32 text-center bg-white border border-[var(--admin-border)] rounded-[32px]">
          <div className="w-20 h-20 bg-[var(--admin-light)] rounded-full flex items-center justify-center mx-auto mb-6">
            <EyeOff size={32} className="text-[var(--admin-text-muted)]" />
          </div>
          <p className="text-[var(--admin-text-muted)] font-bold text-sm uppercase tracking-widest">No matching masterpieces found</p>
        </div>
      )}

      {/* Floating Batch Action Bar matching user mock 1:1 */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed bottom-8 left-1/2 z-50 bg-[#0B132B] border border-white/10 text-white rounded-full shadow-[0_15px_50px_rgba(0,0,0,0.4)] px-6 py-4 flex items-center gap-6 select-none shrink-0"
          >
            {/* Left section: count badge and labels */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white text-[#0B132B] flex items-center justify-center font-black text-xs shrink-0 shadow-inner">
                {selectedIds.length}
              </div>
              <div className="flex flex-col shrink-0">
                <span className="text-[8px] uppercase tracking-widest text-white/40 font-bold block leading-none">
                  BATCH ACTION
                </span>
                <span className="text-[11px] font-black text-white tracking-wide block mt-1.5 leading-none">
                  Masterpieces Selected
                </span>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="w-[1px] h-6 bg-white/10 self-center shrink-0" />

            {/* Middle section: Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handlePurgeSelected}
                className="bg-[#E60042] text-white px-5 py-2.5 rounded-full font-bold text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#F21A58] active:scale-95 transition-all shadow-lg shadow-[#E60042]/20"
              >
                <Trash2 size={12} strokeWidth={2.5} />
                <span>PURGE</span>
              </button>

              <button
                onClick={handleArchiveSelected}
                className="bg-[#1C2541] border border-white/5 text-white px-5 py-2.5 rounded-full font-bold text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#2C3551] active:scale-95 transition-all"
              >
                <Archive size={12} strokeWidth={2.5} />
                <span>ARCHIVE</span>
              </button>
            </div>

            {/* Vertical Divider */}
            <div className="w-[1px] h-6 bg-white/10 self-center shrink-0" />

            {/* Right section: Deselect trigger */}
            <button
              onClick={() => setSelectedIds([])}
              className="text-[9px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors cursor-pointer self-center shrink-0 hover:underline"
            >
              DESELECT
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
