import React, { useState } from 'react';
import {
  Home,
  Users,
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  ArrowRight,
  TrendingUp,
  DollarSign,
  HeartHandshake
} from 'lucide-react';
import { ActiveTab } from '../types';

interface LandingHeroProps {
  onSelectMode: (mode: ActiveTab, filters?: { city?: string; maxRent?: number; query?: string }) => void;
  onOpenNLSearch: (query: string) => void;
  totalRooms: number;
  totalRoommates: number;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onSelectMode,
  onOpenNLSearch,
  totalRooms,
  totalRoommates,
}) => {
  const [selectedCity, setSelectedCity] = useState('Bangalore');
  const [activeMode, setActiveMode] = useState<'rooms' | 'roommates'>('rooms');
  const [nlQuery, setNlQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nlQuery.trim()) {
      onOpenNLSearch(nlQuery.trim());
    } else {
      if (activeMode === 'rooms') {
        onSelectMode('explore_rooms', { city: selectedCity });
      } else {
        onSelectMode('explore_roommates', { city: selectedCity });
      }
    }
  };

  const sampleQueries = [
    'Furnished room in Koramangala under ₹18,000',
    'Vegetarian student roommate in South Campus Delhi',
    'Lakeview flatmate in Powai with attached washroom',
    'Quiet non-smoker roommate in Pune near IT park',
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-stone-100 via-violet-50/30 to-white pt-8 pb-14 border-b border-stone-200">
      {/* Decorative background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40">
        <div className="absolute -top-12 left-1/4 w-96 h-96 bg-violet-300 rounded-full blur-3xl" />
        <div className="absolute -top-12 right-1/4 w-96 h-96 bg-rose-200 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust pill */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-violet-200/80 shadow-sm text-xs font-semibold text-stone-700">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Smart Roommate Matching & Verified Accommodations</span>
            <span className="text-stone-300">|</span>
            <span className="text-violet-700 font-bold">18+ Only</span>
          </div>
        </div>

        {/* Main Title & Tagline */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.12]">
            Find Your Space.{' '}
            <span className="bg-gradient-to-r from-violet-600 to-rose-500 bg-clip-text text-transparent">
              Meet Your Match.
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-stone-600 max-w-2xl mx-auto font-normal">
            Specially designed for students and working professionals. Match with roommates by lifestyle compatibility, sleep routines, and values — or explore verified PGs & flats with zero hidden fees.
          </p>
        </div>

        {/* Search Mode Tabs */}
        <div className="mt-8 max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/70 border border-stone-200/90 p-3 sm:p-5">
            {/* Mode selection buttons */}
            <div className="flex flex-wrap sm:flex-nowrap gap-2 p-1.5 bg-stone-100/90 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setActiveMode('rooms')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
                  activeMode === 'rooms'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Home className="w-4 h-4 text-violet-600" />
                Find a Room ({totalRooms} Verified)
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('roommates')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
                  activeMode === 'roommates'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Users className="w-4 h-4 text-rose-500" />
                Find a Roommate ({totalRoommates} Active)
              </button>
              <button
                type="button"
                onClick={() => onSelectMode('list_property')}
                className="hidden sm:flex items-center gap-1.5 py-2.5 px-4 rounded-lg font-semibold text-xs text-stone-600 hover:text-violet-700 hover:bg-stone-50 transition-colors"
              >
                <span>Have a place? List it</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Integrated Search Input Form */}
            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                {/* City Picker */}
                <div className="sm:w-48 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full pl-9 pr-8 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi NCR</option>
                    <option value="Pune">Pune</option>
                  </select>
                </div>

                {/* Natural Language Search / Keyword */}
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Sparkles className="w-4 h-4 text-violet-500" />
                  </div>
                  <input
                    type="text"
                    value={nlQuery}
                    onChange={(e) => setNlQuery(e.target.value)}
                    placeholder={
                      activeMode === 'rooms'
                        ? 'Try: "Furnished room near metro with AC under 18000"'
                        : 'Try: "Non-smoker female student early bird near DU"'
                    }
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Submit Search Button */}
                <button
                  type="submit"
                  className="sm:w-auto px-6 py-3 bg-gradient-to-r from-violet-600 to-rose-500 hover:from-violet-700 hover:to-rose-600 text-white font-bold text-sm rounded-xl shadow-md shadow-violet-200 transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </div>

              {/* AI prompt quick suggestions */}
              <div className="flex items-center gap-2 pt-1 overflow-x-auto text-xs text-stone-500 scrollbar-none">
                <span className="font-semibold text-stone-400 flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3 h-3 text-violet-500" /> AI Suggestions:
                </span>
                {sampleQueries.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setNlQuery(q);
                      onOpenNLSearch(q);
                    }}
                    className="shrink-0 px-2.5 py-1 rounded-full bg-stone-100 hover:bg-violet-50 hover:text-violet-700 transition-colors text-[11px] font-medium border border-stone-200/60"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>

        {/* 4 Pillars of Romeo Trust & Value */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-2.5">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-stone-900 text-sm">Lifestyle Matching</h2>
            <p className="text-xs text-stone-500 mt-1">
              Algorithms matching sleep rhythms, cleanliness, diet, and social vibes.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5">
              <DollarSign className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-stone-900 text-sm">100% Fee Transparency</h2>
            <p className="text-xs text-stone-500 mt-1">
              Clear monthly rent, upfront deposit, and utility breakdowns. No hidden costs.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-2.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-stone-900 text-sm">Privacy & Safety First</h2>
            <p className="text-xs text-stone-500 mt-1">
              Phone numbers masked until mutual consent. Identity & title verification.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-stone-900 text-sm">Gemini AI Assistant</h2>
            <p className="text-xs text-stone-500 mt-1">
              Natural search, roommate compatibility verdicts, and rental safety advisor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
