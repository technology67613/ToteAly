import React, { useState, useEffect } from 'react';
import { ShoppingBag, Mail, UserPlus, ArrowRight, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Activity {
  id: string;
  type: 'order' | 'inquiry' | 'subscriber';
  title: string;
  description: string;
  time: string;
}

export const AdminActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch('/api/admin/activity');
        if (res.ok) setActivities(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingBag size={14} className="text-emerald-500" />;
      case 'inquiry': return <Mail size={14} className="text-[var(--admin-primary)]" />;
      case 'subscriber': return <UserPlus size={14} className="text-blue-500" />;
      default: return null;
    }
  };

  const getLink = (act: Activity) => {
    switch (act.type) {
      case 'order': return `/admin/orders/${act.id}`;
      case 'inquiry': return `/admin?tab=inquiries`;
      case 'subscriber': return `/admin?tab=marketing`;
      default: return '#';
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  if (loading) return <div className="space-y-4 animate-pulse">
    {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-[var(--admin-light)] rounded-2xl" />)}
  </div>;

  return (
    <div className="space-y-6">
      {activities.map((act, idx) => (
        <motion.div 
          key={act.id + idx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Link 
            href={getLink(act)}
            className="flex items-center justify-between group"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
               <div className="w-10 h-10 rounded-xl bg-[var(--admin-light)] flex items-center justify-center shrink-0 group-hover:bg-[var(--admin-primary)] group-hover:text-white transition-all">
                  {getIcon(act.type)}
               </div>
               <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[var(--admin-text-primary)] group-hover:text-[var(--admin-primary)] transition-colors truncate">{act.title}</p>
                  <p className="text-[10px] text-[var(--admin-text-muted)] mt-0.5 truncate">{act.description}</p>
               </div>
            </div>
            <div className="text-right">
               <p className="text-[9px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest flex items-center gap-1">
                  <Clock size={10} /> {getTimeAgo(act.time)}
               </p>
            </div>
          </Link>
        </motion.div>
      ))}
      {activities.length === 0 && (
        <div className="py-10 text-center text-[var(--admin-text-muted)] italic text-xs">
          Waiting for iconic actions...
        </div>
      )}
      <button className="w-full py-4 mt-4 border border-[var(--admin-border)] rounded-2xl text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] hover:bg-[var(--admin-light)] transition-all flex items-center justify-center gap-2">
        View All Activity <ArrowRight size={14} />
      </button>
    </div>
  );
};
