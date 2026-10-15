import React, { useState, useMemo } from 'react';
import {
  Users,
  Sparkles,
  Heart,
  UserCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Filter,
  ArrowUpDown,
  Briefcase,
  GraduationCap,
  MessageSquarePlus,
  Info,
  Check,
  AlertCircle
} from 'lucide-react';
import { UserProfile } from '../types';
import { calculateCompatibility } from '../utils/matching';

interface RoommateSearchProps {
  users: UserProfile[];
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  onSendConnection: (user: UserProfile) => void;
  onToggleShortlist: (id: string) => void;
  shortlistedIds: string[];
  initialCity?: string;
}

export const RoommateSearch: React.FC<RoommateSearchProps> = ({
  users,
  currentUser,
  onSelectUser,
  onSendConnection,
  onToggleShortlist,
  shortlistedIds,
  initialCity,
}) => {
  const [cityFilter, setCityFilter] = useState<string>(initialCity || 'all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [smokingFilter, setSmokingFilter] = useState<string>('all');
  const [sleepFilter, setSleepFilter] = useState<string>('all');
  const [cleanlinessFilter, setCleanlinessFilter] = useState<string>('all');
  const [foodFilter, setFoodFilter] = useState<string>('all');
  const [maxBudget, setMaxBudget] = useState<number>(30000);
  const [sortBy, setSortBy] = useState<'compatibility' | 'budget_asc' | 'budget_desc'>('compatibility');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Calculate compatibility for each candidate with respect to currentUser
  const candidatesWithScore = useMemo(() => {
    return users
      .filter((u) => u.id !== currentUser.id)
      .map((u) => {
        const compatibility = calculateCompatibility(currentUser, u);
        return {
          user: u,
          compatibility,
        };
      });
  }, [users, currentUser]);

  // Apply filters
  const filteredCandidates = useMemo(() => {
    return candidatesWithScore.filter(({ user: u }) => {
      if (cityFilter !== 'all' && u.city.toLowerCase() !== cityFilter.toLowerCase()) return false;
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (genderFilter !== 'all' && u.gender !== genderFilter) return false;
      if (smokingFilter !== 'all' && u.lifestyle.smoking !== smokingFilter) return false;
      if (sleepFilter !== 'all' && u.lifestyle.sleepSchedule !== sleepFilter) return false;
      if (cleanlinessFilter !== 'all' && u.lifestyle.cleanliness !== cleanlinessFilter) return false;
      if (foodFilter !== 'all' && u.lifestyle.foodDiet !== foodFilter) return false;
      if (u.budgetMin > maxBudget) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'compatibility') return b.compatibility.overallScore - a.compatibility.overallScore;
      if (sortBy === 'budget_asc') return a.user.budgetMin - b.user.budgetMin;
      if (sortBy === 'budget_desc') return b.user.budgetMax - a.user.budgetMax;
      return 0;
    });
  }, [candidatesWithScore, cityFilter, roleFilter, genderFilter, smokingFilter, sleepFilter, cleanlinessFilter, foodFilter, maxBudget, sortBy]);

  const resetFilters = () => {
    setCityFilter('all');
    setRoleFilter('all');
    setGenderFilter('all');
    setSmokingFilter('all');
    setSleepFilter('all');
    setCleanlinessFilter('all');
    setFoodFilter('all');
    setMaxBudget(30000);
    setSortBy('compatibility');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Smart Roommate Matching</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Find Compatible Roommates & Flatmates
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            Compatibility scored 0–100% against your habits, budget, sleep schedule, and cleanliness standards.
          </p>
        </div>

        {/* Sort & Quick info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 mr-2" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="ml-1.5 bg-transparent border-none text-stone-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="compatibility">Highest Compatibility %</option>
              <option value="budget_asc">Budget: Low to High</option>
              <option value="budget_desc">Budget: High to Low</option>
            </select>
          </div>

          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Trust & Transparency Note */}
      <div className="mb-4 p-3.5 bg-violet-50/70 border border-violet-200/70 rounded-2xl flex items-start gap-3 text-xs text-violet-900">
        <Info className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Algorithmic Compatibility Breakdown:</span> Scores are calculated directly from your living habits (sleep times, cleanliness, food, smoking/drinking, social style) and budget overlap. Scores do not guarantee harmony, but highlight shared habits and points for healthy conversation.
        </div>
      </div>

      {/* Mobile Active Filter Bar */}
      <div className="md:hidden flex items-center justify-between gap-2 mb-4 p-2.5 bg-white rounded-2xl border border-stone-200 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg shrink-0">
            {cityFilter === 'all' ? 'All Cities' : cityFilter}
          </span>
          <span className="text-stone-600 bg-stone-100 px-2 py-1 rounded-lg shrink-0">
            ≤ ₹{maxBudget / 1000}k
          </span>
          {cleanlinessFilter !== 'all' && (
            <span className="text-violet-700 bg-violet-50 px-2 py-1 rounded-lg shrink-0 font-semibold capitalize">
              {cleanlinessFilter}
            </span>
          )}
        </div>
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="text-xs font-bold text-violet-700 shrink-0 underline"
        >
          Change
        </button>
      </div>

      {/* Filters Bar (Desktop) */}
      <div className="hidden md:block bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-sm mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Target City */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Target City
            </label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="all">All Cities</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi NCR</option>
              <option value="Pune">Pune</option>
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Student / Professional
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="all">Any Occupation</option>
              <option value="student">Student</option>
              <option value="professional">Working Professional</option>
              <option value="freelancer">Freelancer</option>
            </select>
          </div>

          {/* Sleep Routine */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Sleep Schedule
            </label>
            <select
              value={sleepFilter}
              onChange={(e) => setSleepFilter(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="all">Any Sleep Schedule</option>
              <option value="early_bird">Early Bird (Morning)</option>
              <option value="night_owl">Night Owl (Late)</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>

          {/* Cleanliness */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Cleanliness Level
            </label>
            <select
              value={cleanlinessFilter}
              onChange={(e) => setCleanlinessFilter(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="all">Any Cleanliness</option>
              <option value="spotless">Spotless & Tidy</option>
              <option value="moderate">Moderate & Balanced</option>
              <option value="relaxed">Relaxed</option>
            </select>
          </div>

          {/* Smoking */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Smoking Habit
            </label>
            <select
              value={smokingFilter}
              onChange={(e) => setSmokingFilter(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="all">Any Habit</option>
              <option value="non_smoker">Non-Smoker Only</option>
              <option value="flexible">Flexible / Balcony Only</option>
            </select>
          </div>
        </div>

        {/* Secondary Row: Budget & Reset */}
        <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-stone-600 shrink-0">
              Max Monthly Budget: <strong className="text-stone-900 font-bold">₹{maxBudget.toLocaleString()}</strong>
            </span>
            <input
              type="range"
              min="8000"
              max="35000"
              step="1000"
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="w-48 sm:w-64 accent-rose-500 cursor-pointer"
            />
          </div>

          {(cityFilter !== 'all' || roleFilter !== 'all' || sleepFilter !== 'all' || cleanlinessFilter !== 'all' || smokingFilter !== 'all' || maxBudget < 30000) && (
            <button
              onClick={resetFilters}
              className="text-rose-600 hover:text-rose-800 text-xs font-bold underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Roommates Grid */}
      {filteredCandidates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">No roommate matches with these filters</h3>
          <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
            Try loosening the sleep schedule or cleanliness filters to discover more people in your city.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-5 py-2.5 bg-rose-500 text-white text-xs font-bold rounded-xl hover:bg-rose-600 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map(({ user: candidate, compatibility }) => {
            const isShortlisted = shortlistedIds.includes(candidate.id);
            const score = compatibility.overallScore;
            const scoreColor =
              score >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
              score >= 60 ? 'text-violet-700 bg-violet-50 border-violet-200' :
              'text-amber-700 bg-amber-50 border-amber-200';

            return (
              <div
                key={candidate.id}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-violet-200 transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5">
                  {/* Card Header: Avatar + Match Badge + Shortlist */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={candidate.avatar}
                          alt={candidate.name}
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-stone-100 shadow-sm"
                        />
                        {candidate.isVerified && (
                          <div className="absolute -bottom-1 -right-1 bg-violet-600 text-white p-0.5 rounded-full shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 fill-violet-600 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3
                          onClick={() => onSelectUser(candidate)}
                          className="font-bold text-stone-900 text-base hover:text-violet-700 cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <span>{candidate.name}</span>
                          <span className="text-xs text-stone-400 font-normal">({candidate.age})</span>
                        </h3>
                        <p className="text-xs text-stone-500 font-medium flex items-center gap-1">
                          {candidate.role === 'student' ? (
                            <GraduationCap className="w-3.5 h-3.5 text-stone-400" />
                          ) : (
                            <Briefcase className="w-3.5 h-3.5 text-stone-400" />
                          )}
                          <span className="truncate max-w-[170px]">{candidate.occupationTitle}</span>
                        </p>
                        <p className="text-[11px] text-stone-400 truncate max-w-[170px]">
                          {candidate.institution}
                        </p>
                      </div>
                    </div>

                    {/* Shortlist Heart */}
                    <button
                      onClick={() => onToggleShortlist(candidate.id)}
                      className={`p-2 rounded-xl transition-colors ${
                        isShortlisted
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-400'
                      }`}
                      title={isShortlisted ? 'Remove from shortlist' : 'Shortlist roommate'}
                    >
                      <Heart className={`w-4 h-4 ${isShortlisted ? 'fill-rose-500' : ''}`} />
                    </button>
                  </div>

                  {/* Compatibility Badge & Has Place Indicator */}
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold border ${scoreColor}`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{score}% Match</span>
                    </div>

                    {candidate.hasPlaceToShare ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Has Flat (Room Available)
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                        Looking for Space
                      </span>
                    )}
                  </div>

                  {/* Bio snippet */}
                  <p className="mt-3 text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {candidate.bio}
                  </p>

                  {/* Shared Habits Highlight */}
                  <div className="mt-3.5 p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-xs">
                    <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                      <span>Why you match</span>
                    </div>
                    <div className="space-y-1">
                      {compatibility.sharedTraits.slice(0, 2).map((trait, idx) => (
                        <p key={idx} className="text-stone-700 text-[11px] font-medium truncate">
                          • {trait}
                        </p>
                      ))}
                      {compatibility.differences.length > 0 && (
                        <p className="text-amber-700 text-[10px] font-medium truncate">
                          • Discuss: {compatibility.differences[0]}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Lifestyle chips */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                      {candidate.lifestyle.sleepSchedule === 'early_bird' ? '🌅 Early Bird' : candidate.lifestyle.sleepSchedule === 'night_owl' ? '🌙 Night Owl' : '⏰ Flexible Sleep'}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                      {candidate.lifestyle.smoking === 'non_smoker' ? '🚭 Non-Smoker' : '💨 Smoker'}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 capitalize">
                      🥗 {candidate.lifestyle.foodDiet.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 capitalize">
                      ✨ {candidate.lifestyle.cleanliness}
                    </span>
                  </div>

                  {/* Locations & Move-in */}
                  <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <div className="flex items-center gap-1 truncate max-w-[150px]">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{candidate.preferredLocalities.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-[11px]">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      <span>Move: {candidate.preferredMoveInDate}</span>
                    </div>
                  </div>
                </div>

                {/* Footer / Actions */}
                <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase font-semibold">Budget</div>
                    <div className="text-sm font-extrabold text-stone-900">
                      ₹{candidate.budgetMin.toLocaleString()} - ₹{candidate.budgetMax.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectUser(candidate)}
                      className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold transition-colors"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => onSendConnection(candidate)}
                      className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5" />
                      <span>Connect</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mobile Touch Filter Bottom Sheet */}
      {mobileFilterOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150">
          <div className="bg-white rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border-t border-stone-200 animate-in slide-in-from-bottom duration-200">
            {/* Sheet Handle & Header */}
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-500" />
                <h3 className="font-extrabold text-stone-900 text-sm">Filter Roommate Profiles</h3>
              </div>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1.5 rounded-lg bg-stone-200 text-stone-600"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Filters */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Target City</label>
                <div className="grid grid-cols-2 gap-2">
                  {['all', 'Bangalore', 'Mumbai', 'Delhi', 'Pune'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCityFilter(c)}
                      className={`py-2 px-3 rounded-xl font-bold border transition-colors ${
                        cityFilter === c
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'bg-stone-50 border-stone-200 text-stone-700'
                      }`}
                    >
                      {c === 'all' ? 'All Cities' : c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Role / Occupation</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'student', label: 'Student' },
                    { id: 'professional', label: 'Professional' },
                    { id: 'freelancer', label: 'Freelancer' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRoleFilter(r.id)}
                      className={`py-2 px-3 rounded-xl font-bold border transition-colors ${
                        roleFilter === r.id
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'bg-stone-50 border-stone-200 text-stone-700'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-stone-700 uppercase mb-1">
                  <span>Max Monthly Budget</span>
                  <span className="text-rose-600 font-extrabold text-sm">₹{maxBudget.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="8000"
                  max="35000"
                  step="1000"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(Number(e.target.value))}
                  className="w-full accent-rose-500 h-2 bg-stone-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Sleep Schedule</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'all', label: 'Any' },
                    { id: 'early_bird', label: 'Early Bird' },
                    { id: 'night_owl', label: 'Night Owl' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSleepFilter(s.id)}
                      className={`py-2 px-2 rounded-xl font-bold text-center border text-[11px] transition-colors ${
                        sleepFilter === s.id
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'bg-stone-50 border-stone-200 text-stone-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Cleanliness Standard</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'all', label: 'Any' },
                    { id: 'spotless', label: 'Spotless' },
                    { id: 'moderate', label: 'Moderate' },
                  ].map((cl) => (
                    <button
                      key={cl.id}
                      type="button"
                      onClick={() => setCleanlinessFilter(cl.id)}
                      className={`py-2 px-2 rounded-xl font-bold text-center border text-[11px] transition-colors ${
                        cleanlinessFilter === cl.id
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'bg-stone-50 border-stone-200 text-stone-700'
                      }`}
                    >
                      {cl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions with safe-area padding */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 pb-safe flex gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className="py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 text-white font-extrabold text-xs shadow-md"
              >
                Show {filteredCandidates.length} Matches
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
