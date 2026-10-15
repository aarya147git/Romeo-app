import React, { useState } from 'react';
import { Bookmark, Heart, X, Home, Users, MapPin, Sparkles, MessageSquarePlus } from 'lucide-react';
import { PropertyListing, UserProfile } from '../types';

interface SavedModalProps {
  savedProperties: PropertyListing[];
  shortlistedRoommates: UserProfile[];
  onClose: () => void;
  onSelectProperty: (property: PropertyListing) => void;
  onSelectRoommate: (user: UserProfile) => void;
  onRemoveSavedProperty: (id: string) => void;
  onRemoveShortlistedRoommate: (id: string) => void;
  onSendConnection: (user: UserProfile) => void;
}

export const SavedModal: React.FC<SavedModalProps> = ({
  savedProperties,
  shortlistedRoommates,
  onClose,
  onSelectProperty,
  onSelectRoommate,
  onRemoveSavedProperty,
  onRemoveShortlistedRoommate,
  onSendConnection,
}) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'roommates'>('properties');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-violet-600" />
            <h2 className="font-extrabold text-stone-900 text-lg">Saved Spaces & Shortlisted Matches</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex gap-2">
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'properties'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Home className="w-4 h-4 text-violet-600" />
            <span>Saved Rooms ({savedProperties.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('roommates')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'roommates'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Users className="w-4 h-4 text-rose-500" />
            <span>Shortlisted Roommates ({shortlistedRoommates.length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1">
          {activeTab === 'properties' ? (
            savedProperties.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                <Home className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p className="font-bold text-stone-700 text-sm">No saved properties yet</p>
                <p className="text-xs text-stone-500 mt-1">Browse the marketplace and click the heart icon on any listing to save it.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedProperties.map((p) => (
                  <div key={p.id} className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-xs flex gap-3 group">
                    <img src={p.images[0]} alt="" className="w-24 h-24 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4
                            onClick={() => onSelectProperty(p)}
                            className="font-bold text-stone-900 text-xs truncate hover:text-violet-700 cursor-pointer"
                          >
                            {p.title}
                          </h4>
                          <button
                            onClick={() => onRemoveSavedProperty(p.id)}
                            className="text-stone-400 hover:text-rose-600 text-xs p-1"
                            title="Remove"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">{p.locality}, {p.city}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                        <span className="font-extrabold text-stone-900 text-sm">₹{p.monthlyRent.toLocaleString()}/mo</span>
                        <button
                          onClick={() => onSelectProperty(p)}
                          className="px-2.5 py-1 bg-violet-50 text-violet-700 hover:bg-violet-100 rounded-lg text-xs font-bold"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            shortlistedRoommates.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p className="font-bold text-stone-700 text-sm">No shortlisted roommates yet</p>
                <p className="text-xs text-stone-500 mt-1">Explore profiles and shortlist people whose living habits and budget match yours.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {shortlistedRoommates.map((u) => (
                  <div key={u.id} className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={u.avatar} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      <div className="min-w-0">
                        <h4
                          onClick={() => onSelectRoommate(u)}
                          className="font-bold text-stone-900 text-sm truncate hover:text-violet-700 cursor-pointer"
                        >
                          {u.name} ({u.age})
                        </h4>
                        <p className="text-xs text-stone-500 truncate">{u.occupationTitle} • {u.city}</p>
                        <p className="text-[11px] text-violet-700 font-semibold mt-0.5">Budget: ₹{u.budgetMin / 1000}k - ₹{u.budgetMax / 1000}k</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <button
                        onClick={() => onRemoveShortlistedRoommate(u.id)}
                        className="text-stone-400 hover:text-rose-600 text-xs p-1"
                        title="Remove"
                      >
                        ✕
                      </button>
                      <button
                        onClick={() => onSendConnection(u)}
                        className="px-3 py-1 bg-violet-600 text-white rounded-lg text-xs font-bold hover:bg-violet-700 flex items-center gap-1"
                      >
                        <MessageSquarePlus className="w-3 h-3" />
                        <span>Connect</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
