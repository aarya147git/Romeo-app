import React, { useState } from 'react';
import {
  Home,
  Users,
  PlusCircle,
  Bookmark,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  UserCheck,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';
import { ActiveTab, UserProfile } from '../types';
import { PWAInstallPrompt } from './PWAInstallPrompt';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
  savedCount: number;
  unreadCount: number;
  onOpenAI: () => void;
  onOpenOnboarding: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  allUsers,
  onSwitchUser,
  savedCount,
  unreadCount,
  onOpenAI,
  onOpenOnboarding,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('explore_rooms')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-violet-200 group-hover:scale-105 transition-transform">
                <Home className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-2xl tracking-tight text-stone-900 group-hover:text-violet-700 transition-colors">
                    Romeo
                  </span>
                  <span className="text-[10px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded bg-violet-100 text-violet-700">
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 font-medium hidden sm:block">
                  Find Your Space. Meet Your Match.
                </p>
              </div>
            </button>

            {/* Main Mode Navigation (Desktop) */}
            <nav className="hidden md:flex items-center bg-stone-100/90 p-1 rounded-xl border border-stone-200/80">
              <button
                onClick={() => setActiveTab('explore_rooms')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'explore_rooms'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Home className="w-4 h-4 text-violet-600" />
                Find a Room
              </button>
              <button
                onClick={() => setActiveTab('explore_roommates')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'explore_roommates'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Users className="w-4 h-4 text-rose-500" />
                Find a Roommate
              </button>
              <button
                onClick={() => setActiveTab('list_property')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'list_property'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                List Property
              </button>
            </nav>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* PWA Install Button */}
            <PWAInstallPrompt variant="button" />

            {/* AI Assistant Button */}
            <button
              onClick={onOpenAI}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-50 to-rose-50 border border-violet-200 text-violet-800 text-xs font-semibold hover:border-violet-300 hover:shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
              <span>Romeo AI Copilot</span>
            </button>

            {/* Saved Items */}
            <button
              onClick={() => setActiveTab('saved')}
              title="Saved Rooms & Shortlisted Roommates"
              className={`relative p-2.5 rounded-xl border transition-all ${
                activeTab === 'saved'
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Messages */}
            <button
              onClick={() => setActiveTab('messages')}
              title="Messages & Connection Requests"
              className={`relative p-2.5 rounded-xl border transition-all ${
                activeTab === 'messages'
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Safety Centre */}
            <button
              onClick={() => setActiveTab('safety')}
              title="Safety Centre & Scam Warning"
              className={`hidden sm:flex p-2.5 rounded-xl border transition-all ${
                activeTab === 'safety'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </button>

            {/* User Dropdown / Switcher */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-all focus:outline-none"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-violet-200"
                />
                <div className="hidden xl:block text-left text-xs">
                  <div className="font-semibold text-stone-900 flex items-center gap-1">
                    <span>{currentUser.name.split(' ')[0]}</span>
                    {currentUser.isVerified && (
                      <CheckCircle2 className="w-3 h-3 text-violet-600 fill-violet-100" />
                    )}
                  </div>
                  <div className="text-[10px] text-stone-500 capitalize">{currentUser.city}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 text-stone-800 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                        Signed in as
                      </p>
                      <p className="font-bold text-stone-900 text-sm mt-0.5">{currentUser.name}</p>
                      <p className="text-xs text-stone-500">{currentUser.occupationTitle} • {currentUser.institution}</p>
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{currentUser.verificationBadge || 'Identity Verified'}</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenOnboarding();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-2.5"
                      >
                        <SlidersHorizontal className="w-4 h-4 text-stone-500" />
                        <span>Edit Roommate & Living Preferences</span>
                      </button>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setActiveTab('admin');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-2.5"
                      >
                        <ShieldCheck className="w-4 h-4 text-stone-500" />
                        <span>Admin & Moderation Console</span>
                      </button>
                    </div>

                    <div className="border-t border-stone-100 pt-2 px-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1 mb-1">
                        Switch Persona (Instant Testing)
                      </p>
                      <div className="space-y-1">
                        {allUsers.map(u => (
                          <button
                            key={u.id}
                            onClick={() => {
                              onSwitchUser(u);
                              setUserDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                              currentUser.id === u.id
                                ? 'bg-violet-50 text-violet-900 font-semibold'
                                : 'hover:bg-stone-50 text-stone-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-md object-cover" />
                              <div>
                                <p className="leading-tight">{u.name}</p>
                                <p className="text-[10px] text-stone-400">{u.city} • {u.role}</p>
                              </div>
                            </div>
                            {currentUser.id === u.id && (
                              <span className="text-[10px] bg-violet-600 text-white px-1.5 py-0.5 rounded font-bold">
                                Active
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-stone-200 space-y-2 animate-in slide-in-from-top duration-150">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setActiveTab('explore_rooms');
                  setMobileMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-semibold border ${
                  activeTab === 'explore_rooms'
                    ? 'bg-violet-50 text-violet-900 border-violet-200'
                    : 'bg-stone-50 text-stone-700 border-stone-200'
                }`}
              >
                <Home className="w-4 h-4 mb-1 text-violet-600" />
                Find a Room
              </button>
              <button
                onClick={() => {
                  setActiveTab('explore_roommates');
                  setMobileMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-semibold border ${
                  activeTab === 'explore_roommates'
                    ? 'bg-rose-50 text-rose-900 border-rose-200'
                    : 'bg-stone-50 text-stone-700 border-stone-200'
                }`}
              >
                <Users className="w-4 h-4 mb-1 text-rose-500" />
                Find Roommate
              </button>
              <button
                onClick={() => {
                  setActiveTab('list_property');
                  setMobileMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-semibold border ${
                  activeTab === 'list_property'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : 'bg-stone-50 text-stone-700 border-stone-200'
                }`}
              >
                <PlusCircle className="w-4 h-4 mb-1 text-emerald-600" />
                List Property
              </button>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  onOpenAI();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-violet-600 text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Romeo AI Copilot
              </button>
              <button
                onClick={() => {
                  setActiveTab('safety');
                  setMobileMenuOpen(false);
                }}
                className="py-2 px-3 rounded-xl bg-stone-100 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Safety
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
