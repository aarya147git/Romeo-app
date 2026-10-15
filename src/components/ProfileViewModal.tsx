import React from 'react';
import {
  User,
  CheckCircle2,
  SlidersHorizontal,
  Bookmark,
  ShieldCheck,
  PlusCircle,
  Sparkles,
  Download,
  Smartphone,
  X,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Settings,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { UserProfile, ActiveTab } from '../types';
import { PWAInstallPrompt } from './PWAInstallPrompt';

interface ProfileViewModalProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
  onEditPreferences: () => void;
  onOpenSaved: () => void;
  onOpenSafety: () => void;
  onOpenAdmin: () => void;
  onOpenListProperty: () => void;
  onOpenAI: () => void;
  onClose: () => void;
  savedCount: number;
}

export const ProfileViewModal: React.FC<ProfileViewModalProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  onEditPreferences,
  onOpenSaved,
  onOpenSafety,
  onOpenAdmin,
  onOpenListProperty,
  onOpenAI,
  onClose,
  savedCount,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-violet-600" />
            <h2 className="font-extrabold text-stone-900 text-lg">My Profile & Account</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1 text-xs sm:text-sm">
          {/* User Card */}
          <div className="p-5 bg-gradient-to-br from-violet-50 to-rose-50/50 rounded-2xl border border-violet-100 flex items-center gap-4">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-md"
              />
              {currentUser.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-violet-600 text-white p-0.5 rounded-full shadow-xs">
                  <CheckCircle2 className="w-4 h-4 fill-violet-600 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-extrabold text-stone-900 text-base">{currentUser.name}</h3>
                <span className="text-xs text-stone-500">({currentUser.age} yrs)</span>
              </div>
              <p className="text-xs text-stone-600 font-medium flex items-center gap-1 mt-0.5">
                {currentUser.role === 'student' ? <GraduationCap className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
                <span className="truncate">{currentUser.occupationTitle} • {currentUser.institution}</span>
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md font-semibold w-fit">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{currentUser.verificationBadge || 'Identity Verified'}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] font-bold text-stone-400 uppercase block">Monthly Budget</span>
              <span className="text-sm font-extrabold text-stone-900">
                ₹{currentUser.budgetMin.toLocaleString()} - ₹{currentUser.budgetMax.toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] font-bold text-stone-400 uppercase block">Target Area</span>
              <span className="text-sm font-extrabold text-stone-900 truncate block">
                {currentUser.preferredLocalities?.[0] || currentUser.city}
              </span>
            </div>
          </div>

          {/* In-App PWA Install Banner */}
          <PWAInstallPrompt variant="banner" />

          {/* Navigation & Setting List */}
          <div className="space-y-1.5">
            <button
              onClick={() => {
                onClose();
                onEditPreferences();
              }}
              className="w-full p-3.5 bg-stone-50 hover:bg-violet-50 hover:text-violet-900 rounded-2xl border border-stone-200 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-stone-900 text-xs">Edit Living & Roommate Habits</div>
                  <div className="text-[11px] text-stone-500">Sleep schedule, diet, cleanliness, budget</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenSaved();
              }}
              className="w-full p-3.5 bg-stone-50 hover:bg-stone-100 rounded-2xl border border-stone-200 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-stone-900 text-xs">Saved Rooms & Shortlisted Matches</div>
                  <div className="text-[11px] text-stone-500">{savedCount} bookmarked items</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenListProperty();
              }}
              className="w-full p-3.5 bg-stone-50 hover:bg-stone-100 rounded-2xl border border-stone-200 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-stone-900 text-xs">List My Space / Find Roommate for Flat</div>
                  <div className="text-[11px] text-stone-500">Publish verified room with zero brokerage</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenSafety();
              }}
              className="w-full p-3.5 bg-stone-50 hover:bg-stone-100 rounded-2xl border border-stone-200 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-stone-900 text-xs">Rental Safety Centre & Scam Advisor</div>
                  <div className="text-[11px] text-stone-500">Scam warning signs, agreements, reporting</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="w-full p-3.5 bg-stone-50 hover:bg-stone-100 rounded-2xl border border-stone-200 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-stone-200 text-stone-700 flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-stone-900 text-xs">Admin & Moderation Dashboard</div>
                  <div className="text-[11px] text-stone-500">Review reported listings and verify properties</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          </div>

          {/* Test Persona Switcher */}
          <div className="pt-2 border-t border-stone-200">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
              Switch Test Account (Instant Simulation)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allUsers.slice(0, 4).map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    onSwitchUser(u);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-colors ${
                    currentUser.id === u.id
                      ? 'bg-violet-50 border-violet-300 text-violet-900'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <img src={u.avatar} alt="" className="w-8 h-8 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs truncate">{u.name}</p>
                    <p className="text-[10px] text-stone-400 truncate">{u.city} • {u.role}</p>
                  </div>
                  {currentUser.id === u.id && (
                    <span className="text-[9px] bg-violet-600 text-white px-1.5 py-0.5 rounded font-bold">
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
