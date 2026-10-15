import React from 'react';
import { Home, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { ActiveTab } from '../types';

interface FooterProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenSafety: () => void;
  onOpenAdmin: () => void;
  onOpenAI: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenSafety,
  onOpenAdmin,
  onOpenAI,
}) => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 pb-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-stone-800">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-rose-500 flex items-center justify-center text-white shadow-md">
                <Home className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Romeo
              </span>
            </div>
            <p className="text-xs text-stone-400 font-medium">
              Find Your Space. Meet Your Match.
            </p>
            <p className="text-xs text-stone-400 leading-relaxed">
              Modern AI-powered accommodation and compatible roommate finder. Designed for students and young working professionals in India's top tech and educational hubs.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>18+ Community • Zero Hidden Fees</span>
            </div>
          </div>

          {/* Accommodation Exploration */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Accommodations
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('explore_rooms')} className="hover:text-white transition-colors">
                  PGs & Coliving in Bangalore
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore_rooms')} className="hover:text-white transition-colors">
                  Flats & Rooms in Powai Mumbai
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore_rooms')} className="hover:text-white transition-colors">
                  Student Accommodations South Campus Delhi
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore_rooms')} className="hover:text-white transition-colors">
                  Shared Flats in Viman Nagar Pune
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('list_property')} className="text-violet-400 hover:text-violet-300 font-bold transition-colors">
                  + List Your Room / Flat
                </button>
              </li>
            </ul>
          </div>

          {/* Roommate Discovery */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Roommate Matching
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('explore_roommates')} className="hover:text-white transition-colors">
                  Lifestyle Compatibility Engine
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore_roommates')} className="hover:text-white transition-colors">
                  Working Professional Flatmates
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore_roommates')} className="hover:text-white transition-colors">
                  University Student Roommates
                </button>
              </li>
              <li>
                <button onClick={onOpenAI} className="hover:text-white transition-colors flex items-center gap-1 text-violet-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gemini AI Match Assistant</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Trust & Security
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={onOpenSafety} className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Rental Safety Centre</span>
                </button>
              </li>
              <li>
                <button onClick={onOpenSafety} className="hover:text-white transition-colors">
                  Scam Prevention & Red Flags
                </button>
              </li>
              <li>
                <button onClick={onOpenSafety} className="hover:text-white transition-colors">
                  11-Month Lease Checklist
                </button>
              </li>
              <li>
                <button onClick={onOpenAdmin} className="hover:text-white transition-colors text-stone-400 hover:text-stone-200">
                  Moderator Console
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & fair housing */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 Romeo Accommodation Technologies Inc. All rights reserved.</p>
          <p className="text-[11px] text-stone-400 max-w-xl text-center sm:text-right">
            Romeo does not use gender, education, or occupation to judge human worth. All compatibility scores are algorithmic guides based on mutual lifestyle choices.
          </p>
        </div>
      </div>
    </footer>
  );
};
