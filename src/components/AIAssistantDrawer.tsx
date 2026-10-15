import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Search,
  DollarSign,
  ShieldCheck,
  Send,
  Building,
  Users,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { PropertyListing, UserProfile } from '../types';

interface AIAssistantDrawerProps {
  onClose: () => void;
  properties: PropertyListing[];
  users: UserProfile[];
  onSelectProperty: (property: PropertyListing) => void;
  onSelectUser: (user: UserProfile) => void;
  initialQuery?: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  onClose,
  properties,
  users,
  onSelectProperty,
  onSelectUser,
  initialQuery,
}) => {
  const [activeTab, setActiveTab] = useState<'nl_search' | 'budget_calc' | 'safety'>('nl_search');

  // NL Search
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    matchedPropertyIds: string[];
    matchedUserIds: string[];
    summary: string;
  } | null>(null);

  // Budget Planner
  const [rentInput, setRentInput] = useState<number>(15000);
  const [maintInput, setMaintInput] = useState<number>(1200);
  const [cityInput, setCityInput] = useState('Bangalore');
  const [budgetOutput, setBudgetOutput] = useState<any | null>(null);
  const [loadingBudget, setLoadingBudget] = useState(false);

  // Safety Advice
  const [safetyListingQuery, setSafetyListingQuery] = useState('');
  const [safetyOutput, setSafetyOutput] = useState<string | null>(null);
  const [loadingSafety, setLoadingSafety] = useState(false);

  const handleRunSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoadingSearch(true);
    try {
      const res = await api.naturalLanguageSearch(searchQuery.trim());
      setSearchResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleRunBudgetCalc = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingBudget(true);
    try {
      const res = await api.getBudgetPlan({
        monthlyRent: rentInput,
        maintenance: maintInput,
        city: cityInput,
      });
      setBudgetOutput(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBudget(false);
    }
  };

  const handleRunSafetyAdvice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!safetyListingQuery.trim()) return;
    setLoadingSafety(true);
    try {
      const res = await api.getSafetyAdvice({
        propertyTitle: safetyListingQuery,
        rent: 18000,
        city: cityInput,
      });
      setSafetyOutput(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSafety(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-stone-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-violet-600 to-rose-500 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm">Romeo AI Copilot</h3>
              <p className="text-[11px] text-stone-500">Powered by Gemini 3.8 Flash</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode selector */}
        <div className="p-3 border-b border-stone-200 flex gap-1.5 bg-white text-xs">
          <button
            onClick={() => setActiveTab('nl_search')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'nl_search' ? 'bg-violet-600 text-white shadow-2xs' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Natural Search
          </button>
          <button
            onClick={() => setActiveTab('budget_calc')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'budget_calc' ? 'bg-violet-600 text-white shadow-2xs' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Budget Planner
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'safety' ? 'bg-violet-600 text-white shadow-2xs' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Safety Check
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {activeTab === 'nl_search' && (
            <div className="space-y-4">
              <p className="text-stone-500 text-xs">
                Ask anything in plain conversational English. Romeo will synthesize available properties and candidate roommates that match.
              </p>

              <form onSubmit={handleRunSearch} className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. Find a furnished room near Koramangala under ₹16,000 with a non-smoking roommate"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-3 pr-9 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <button
                    type="submit"
                    disabled={loadingSearch || !searchQuery.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {loadingSearch && (
                <div className="text-center py-8 text-stone-400">
                  <Sparkles className="w-6 h-6 mx-auto mb-2 text-violet-500 animate-spin" />
                  <p>Searching verified spaces and compatible profiles...</p>
                </div>
              )}

              {searchResult && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="p-3.5 bg-violet-50 rounded-2xl border border-violet-200 text-violet-950 font-medium leading-relaxed">
                    ✨ {searchResult.summary}
                  </div>

                  {/* Matched Properties */}
                  {searchResult.matchedPropertyIds && searchResult.matchedPropertyIds.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-bold text-stone-700 uppercase tracking-wider text-[10px] block">
                        Matched Accommodations:
                      </span>
                      {properties
                        .filter((p) => searchResult.matchedPropertyIds.includes(p.id))
                        .map((prop) => (
                          <div
                            key={prop.id}
                            onClick={() => onSelectProperty(prop)}
                            className="p-3 bg-white rounded-xl border border-stone-200 hover:border-violet-400 shadow-2xs flex items-center gap-3 cursor-pointer transition-colors"
                          >
                            <img src={prop.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-stone-900 truncate">{prop.title}</h4>
                              <p className="text-[11px] text-stone-500">{prop.locality} • ₹{prop.monthlyRent.toLocaleString()}/mo</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-stone-400" />
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Matched Users */}
                  {searchResult.matchedUserIds && searchResult.matchedUserIds.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="font-bold text-stone-700 uppercase tracking-wider text-[10px] block">
                        Matched Roommates:
                      </span>
                      {users
                        .filter((u) => searchResult.matchedUserIds.includes(u.id))
                        .map((cand) => (
                          <div
                            key={cand.id}
                            onClick={() => onSelectUser(cand)}
                            className="p-3 bg-white rounded-xl border border-stone-200 hover:border-rose-400 shadow-2xs flex items-center gap-3 cursor-pointer transition-colors"
                          >
                            <img src={cand.avatar} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-stone-900 truncate">{cand.name} ({cand.age})</h4>
                              <p className="text-[11px] text-stone-500">{cand.occupationTitle} • {cand.city}</p>
                            </div>
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                              Compatible
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'budget_calc' && (
            <div className="space-y-4">
              <p className="text-stone-500 text-xs">
                Estimate full monthly living expense (rent, utilities, groceries, commute) + total upfront move-in capital required.
              </p>

              <form onSubmit={handleRunBudgetCalc} className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Rent (₹)</label>
                    <input
                      type="number"
                      value={rentInput}
                      onChange={(e) => setRentInput(Number(e.target.value))}
                      className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Maintenance (₹)</label>
                    <input
                      type="number"
                      value={maintInput}
                      onChange={(e) => setMaintInput(Number(e.target.value))}
                      className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingBudget}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                >
                  {loadingBudget ? 'Calculating...' : 'Calculate Total Living Cost'}
                </button>
              </form>

              {budgetOutput && (
                <div className="p-4 bg-emerald-950 text-emerald-50 rounded-2xl space-y-3 border border-emerald-900">
                  <div className="flex justify-between items-center text-emerald-300 font-bold">
                    <span>Est. Monthly Outflow:</span>
                    <span className="text-base text-white">₹{budgetOutput.monthlyTotal?.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-300 font-bold border-b border-emerald-800 pb-2">
                    <span>Upfront Capital to Move-in:</span>
                    <span className="text-base text-white">₹{budgetOutput.upfrontCost?.toLocaleString()}</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-emerald-200">
                    <p>• Utilities (Electricity & Wi-Fi): ~₹{budgetOutput.breakdown?.estimatedElectricityAndWifi}</p>
                    <p>• Groceries / Food: ~₹{budgetOutput.breakdown?.estimatedFoodAndGroceries}</p>
                    <p>• Commute: ~₹{budgetOutput.breakdown?.estimatedLocalCommute}</p>
                  </div>
                  <p className="text-[11px] italic text-emerald-300 pt-1 border-t border-emerald-800">
                    💡 {budgetOutput.financialTip}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-4">
              <p className="text-stone-500 text-xs">
                Inspect rental terms, analyze suspicious landlord communication, or check property viewing precautions.
              </p>

              <form onSubmit={handleRunSafetyAdvice} className="space-y-2">
                <textarea
                  rows={3}
                  value={safetyListingQuery}
                  onChange={(e) => setSafetyListingQuery(e.target.value)}
                  placeholder="e.g. 'Can I be asked to sign an 11-month agreement with 3-months deposit?'"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs"
                />
                <button
                  type="submit"
                  disabled={loadingSafety || !safetyListingQuery.trim()}
                  className="w-full py-2 bg-stone-900 hover:bg-black text-white font-bold rounded-xl text-xs"
                >
                  {loadingSafety ? 'Analyzing Precautions...' : 'Get Practical Safety Guidelines'}
                </button>
              </form>

              {safetyOutput && (
                <div className="p-4 bg-stone-900 text-stone-100 rounded-2xl whitespace-pre-line leading-relaxed font-sans text-xs">
                  {safetyOutput}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
