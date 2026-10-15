import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  X,
  CheckCircle2,
  AlertTriangle,
  Building,
  Users,
  Flag,
  Check,
  TrendingUp,
  Search
} from 'lucide-react';
import { PropertyListing, ReportItem, UserProfile } from '../types';
import { api } from '../services/api';

interface AdminDashboardModalProps {
  onClose: () => void;
  properties: PropertyListing[];
  users: UserProfile[];
  onOpenProperty: (prop: PropertyListing) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  onClose,
  properties,
  users,
  onOpenProperty,
}) => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [activeTab, setActiveTab] = useState<'reports' | 'listings' | 'users'>('reports');
  const [searchQuery, setSearchQuery] = useState('');

  const loadReports = async () => {
    const data = await api.fetchReports();
    setReports(data);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    await api.updateReportStatus(id, status);
    loadReports();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-900 text-white sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <div>
              <h2 className="font-extrabold text-base">Romeo Moderation & Admin Console</h2>
              <p className="text-[11px] text-stone-400">Trust, Verification, and Safety Operations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-stone-100/70 border-b border-stone-200 text-xs">
          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <span className="text-stone-400 font-bold uppercase block text-[10px]">Open Reports</span>
            <span className="text-xl font-extrabold text-rose-600">
              {reports.filter((r) => r.status === 'investigating' || r.status === 'pending').length}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <span className="text-stone-400 font-bold uppercase block text-[10px]">Verified Listings</span>
            <span className="text-xl font-extrabold text-stone-900">
              {properties.filter((p) => p.lister.isVerified).length} / {properties.length}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <span className="text-stone-400 font-bold uppercase block text-[10px]">Registered Users</span>
            <span className="text-xl font-extrabold text-stone-900">{users.length}</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <span className="text-stone-400 font-bold uppercase block text-[10px]">Security Status</span>
            <span className="text-emerald-700 font-extrabold text-sm flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-4 h-4" /> 100% Monitored
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="p-3 bg-white border-b border-stone-200 flex gap-2">
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-1.5 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'reports' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Moderation Reports ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`py-1.5 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'listings' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Manage Listings ({properties.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-1.5 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            User Profiles ({users.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto p-6 flex-1 text-xs">
          {activeTab === 'reports' && (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div key={rep.id} className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-stone-900">{rep.reason}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-stone-100 text-stone-600">
                        {rep.targetType}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      rep.status === 'investigating' ? 'bg-amber-100 text-amber-800' :
                      rep.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                    }`}>
                      Status: {rep.status}
                    </span>
                  </div>

                  <p className="text-stone-700 text-xs font-medium">
                    Target: <strong className="text-stone-900">{rep.targetTitle}</strong> (ID: {rep.targetId})
                  </p>
                  <p className="text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    "{rep.details}"
                  </p>
                  <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1">
                    <span>Reported by {rep.reporterName} on {rep.createdAt}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(rep.id, 'investigating')}
                        className="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg font-bold"
                      >
                        Investigate
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(rep.id, 'resolved')}
                        className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-bold"
                      >
                        Mark Resolved
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(rep.id, 'dismissed')}
                        className="px-2.5 py-1 bg-stone-100 text-stone-600 hover:bg-stone-200 rounded-lg font-bold"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'listings' && (
            <div className="space-y-3">
              {properties.map((p) => (
                <div key={p.id} className="p-3 bg-white rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={p.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-stone-900 text-xs truncate">{p.title}</h4>
                      <p className="text-[11px] text-stone-500">{p.locality}, {p.city} • ₹{p.monthlyRent.toLocaleString()}/mo</p>
                      <span className="text-[10px] text-emerald-700 font-semibold">{p.lister.verificationBadge}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenProperty(p)}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs shrink-0"
                  >
                    Inspect
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="p-3 bg-white rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={u.avatar} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-stone-900 text-xs truncate">{u.name} ({u.age})</h4>
                      <p className="text-[11px] text-stone-500">{u.occupationTitle} • {u.city}</p>
                      <span className="text-[10px] text-violet-700 font-semibold">{u.verificationBadge}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                    Active & Age 18+ Confirmed
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
