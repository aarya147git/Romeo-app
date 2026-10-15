import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Heart,
  CheckCircle2,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  MessageSquarePlus,
  ShieldCheck,
  Flag,
  Check,
  AlertCircle,
  Clock,
  Home,
  Sliders,
  DollarSign
} from 'lucide-react';
import { UserProfile } from '../types';
import { calculateCompatibility } from '../utils/matching';
import { api } from '../services/api';

interface RoommateDetailModalProps {
  user: UserProfile;
  currentUser: UserProfile;
  onClose: () => void;
  onSendConnection: (user: UserProfile) => void;
  onToggleShortlist: (id: string) => void;
  isShortlisted: boolean;
  onReportUser: (user: UserProfile) => void;
}

export const RoommateDetailModal: React.FC<RoommateDetailModalProps> = ({
  user,
  currentUser,
  onClose,
  onSendConnection,
  onToggleShortlist,
  isShortlisted,
  onReportUser,
}) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const compatibility = calculateCompatibility(currentUser, user);
  const score = compatibility.overallScore;

  const handleFetchAiInsight = async () => {
    setLoadingAi(true);
    try {
      const insight = await api.getMatchInsight(currentUser, user);
      setAiInsight(insight);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white/95 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-stone-900 text-sm">Roommate Compatibility Profile</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-800 font-bold">
              {score}% Match
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleShortlist(user.id)}
              className={`p-2 rounded-xl border transition-all ${
                isShortlisted
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
              title={isShortlisted ? 'Remove from shortlist' : 'Shortlist roommate'}
            >
              <Heart className={`w-4 h-4 ${isShortlisted ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Profile Header Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-stone-50 p-5 rounded-2xl border border-stone-200">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-md"
              />
              {user.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-violet-600 text-white p-1 rounded-full shadow-sm">
                  <CheckCircle2 className="w-4 h-4 fill-violet-600 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                  {user.name}
                </h1>
                <span className="text-sm font-semibold text-stone-500">
                  {user.age} yrs • {user.gender}
                </span>
                {user.isVerified && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    {user.verificationBadge || 'ID Verified'}
                  </span>
                )}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-stone-600">
                <span className="flex items-center gap-1 font-semibold text-stone-800">
                  {user.role === 'student' ? <GraduationCap className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
                  {user.occupationTitle}
                </span>
                <span>at</span>
                <span className="font-semibold text-stone-800">{user.institution}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-stone-500">
                  <MapPin className="w-3 h-3 text-stone-400" />
                  {user.city} ({user.preferredLocalities.join(', ')})
                </span>
              </div>

              <p className="mt-2.5 text-xs text-stone-600 leading-relaxed">
                "{user.bio}"
              </p>
            </div>
          </div>

          {/* Compatibility Radar / Category Breakdown */}
          <div className="p-5 bg-gradient-to-br from-violet-50/70 to-rose-50/40 rounded-2xl border border-violet-200/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <h3 className="font-extrabold text-stone-900 text-sm">
                  Compatibility Breakdown with {currentUser.name.split(' ')[0]}
                </h3>
              </div>
              <span className="text-xs font-extrabold text-violet-800 bg-white px-2.5 py-1 rounded-xl shadow-2xs border border-violet-200">
                Overall: {score}%
              </span>
            </div>

            {/* Category Progress Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
              <div>
                <div className="flex justify-between font-semibold text-stone-700 mb-1">
                  <span>Budget Alignment</span>
                  <span>{compatibility.categoryScores.budget}%</span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-violet-600 h-full rounded-full" style={{ width: `${compatibility.categoryScores.budget}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-stone-700 mb-1">
                  <span>Location Preference</span>
                  <span>{compatibility.categoryScores.location}%</span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${compatibility.categoryScores.location}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-stone-700 mb-1">
                  <span>Sleep & Daily Schedule</span>
                  <span>{compatibility.categoryScores.schedule}%</span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${compatibility.categoryScores.schedule}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-stone-700 mb-1">
                  <span>Smoking & Drinking Habits</span>
                  <span>{compatibility.categoryScores.habits}%</span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${compatibility.categoryScores.habits}%` }} />
                </div>
              </div>
            </div>

            {/* Shared preferences vs differences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-violet-200/60 text-xs">
              <div className="bg-white/80 p-3 rounded-xl border border-violet-100">
                <span className="font-bold text-emerald-800 flex items-center gap-1 mb-2">
                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Shared Compatibility Points:
                </span>
                <ul className="space-y-1 text-stone-700">
                  {compatibility.sharedTraits.map((t, idx) => (
                    <li key={idx}>• {t}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/80 p-3 rounded-xl border border-amber-100">
                <span className="font-bold text-amber-800 flex items-center gap-1 mb-2">
                  <AlertCircle className="w-3.5 h-3.5" /> Potential Compromises to Discuss:
                </span>
                {compatibility.differences.length > 0 ? (
                  <ul className="space-y-1 text-stone-700">
                    {compatibility.differences.map((d, idx) => (
                      <li key={idx}>• {d}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-stone-500 italic">No significant lifestyle friction points detected.</p>
                )}
              </div>
            </div>
          </div>

          {/* AI Matchmaker Deep Dive */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Gemini AI Compatibility Specialist
              </span>
              {!aiInsight && (
                <button
                  onClick={handleFetchAiInsight}
                  disabled={loadingAi}
                  className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-rose-500 hover:from-violet-700 hover:to-rose-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{loadingAi ? 'Analyzing Synergies...' : 'Generate Match Analysis'}</span>
                </button>
              )}
            </div>

            {aiInsight && (
              <div className="p-4 bg-stone-900 text-stone-100 rounded-2xl text-xs space-y-2 border border-stone-800 animate-in fade-in">
                <div className="flex items-center justify-between text-violet-400 font-bold">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Co-Living Compatibility Analysis</span>
                  </div>
                  <button onClick={() => setAiInsight(null)} className="text-stone-400 hover:text-white">✕</button>
                </div>
                <div className="whitespace-pre-line text-stone-200 leading-relaxed font-sans">
                  {aiInsight}
                </div>
              </div>
            )}
          </div>

          {/* Complete Lifestyle Matrix */}
          <div>
            <h3 className="font-bold text-stone-900 text-sm mb-3">Living Habits & Lifestyle Matrix</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                <span className="text-stone-400 font-semibold block">Sleep Schedule</span>
                <span className="font-bold text-stone-800 capitalize">{user.lifestyle.sleepSchedule.replace('_', ' ')}</span>
                <span className="text-[10px] text-stone-500 block mt-0.5">{user.lifestyle.sleepTiming}</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                <span className="text-stone-400 font-semibold block">Cleanliness</span>
                <span className="font-bold text-stone-800 capitalize">{user.lifestyle.cleanliness} Standard</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                <span className="text-stone-400 font-semibold block">Diet / Kitchen</span>
                <span className="font-bold text-stone-800 capitalize">{user.lifestyle.foodDiet.replace('_', ' ')}</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                <span className="text-stone-400 font-semibold block">Smoking</span>
                <span className="font-bold text-stone-800 capitalize">{user.lifestyle.smoking.replace('_', ' ')}</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                <span className="text-stone-400 font-semibold block">Drinking</span>
                <span className="font-bold text-stone-800 capitalize">{user.lifestyle.drinking.replace('_', ' ')}</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                <span className="text-stone-400 font-semibold block">Social / Vibe</span>
                <span className="font-bold text-stone-800 capitalize">{user.lifestyle.socialVibe.replace('_', ' ')}</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                <span className="text-stone-400 font-semibold block">Guest Policy</span>
                <span className="font-bold text-stone-800 capitalize">{user.lifestyle.guestPolicy.replace('_', ' ')}</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                <span className="text-stone-400 font-semibold block">Work / Study Setup</span>
                <span className="font-bold text-stone-800 capitalize">{user.lifestyle.wfhStatus.replace('_', ' ')}</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                <span className="text-stone-400 font-semibold block">Pets</span>
                <span className="font-bold text-stone-800 capitalize">{user.lifestyle.pets.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Privacy & Safety Note */}
          <div className="p-3.5 bg-stone-100 rounded-xl border border-stone-200 flex items-center justify-between text-xs text-stone-600">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Contact visibility: {user.contactVisibility === 'after_connection' ? 'Phone number shared only after mutual match' : 'In-app messaging only'}</span>
            </span>
            <button
              onClick={() => onReportUser(user)}
              className="text-stone-400 hover:text-rose-600 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report User</span>
            </button>
          </div>
        </div>

        {/* Modal Sticky Footer / CTA */}
        <div className="p-4 sm:p-5 bg-white border-t border-stone-200 flex items-center justify-between gap-4 sticky bottom-0 z-20">
          <div>
            <div className="text-xs text-stone-400 font-bold uppercase">Monthly Rent Budget</div>
            <div className="text-xl sm:text-2xl font-extrabold text-stone-900">
              ₹{user.budgetMin.toLocaleString()} - ₹{user.budgetMax.toLocaleString()}
            </div>
          </div>

          <button
            onClick={() => onSendConnection(user)}
            className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-sm shadow-md shadow-violet-200 transition-all flex items-center gap-2"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Send Connection Request</span>
          </button>
        </div>
      </div>
    </div>
  );
};
