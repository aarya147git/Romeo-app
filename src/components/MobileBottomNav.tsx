import React from 'react';
import { Home, Search, Users, MessageSquare, User, Sparkles } from 'lucide-react';
import { ActiveTab } from '../types';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  unreadMessagesCount: number;
  userAvatar: string;
  userName: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  unreadMessagesCount,
  userAvatar,
  userName,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-5 h-16 items-center px-2">
        {/* 1. Home */}
        <button
          onClick={() => {
            onSelectTab('explore_rooms');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center h-full py-1 transition-all ${
            activeTab === 'explore_rooms'
              ? 'text-violet-700 font-extrabold'
              : 'text-stone-500 hover:text-stone-800 font-medium'
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 ${activeTab === 'explore_rooms' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {activeTab === 'explore_rooms' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-600" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Home</span>
        </button>

        {/* 2. Find Rooms */}
        <button
          onClick={() => {
            onSelectTab('explore_rooms');
            // Scroll to the rooms section
            const el = document.getElementById('marketplace-anchor');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center h-full py-1 transition-all ${
            activeTab === 'explore_rooms'
              ? 'text-violet-700 font-extrabold'
              : 'text-stone-500 hover:text-stone-800 font-medium'
          }`}
        >
          <Search className="w-5 h-5 stroke-2" />
          <span className="text-[10px] mt-1 tracking-tight">Find Rooms</span>
        </button>

        {/* 3. Roommates */}
        <button
          onClick={() => onSelectTab('explore_roommates')}
          className={`flex flex-col items-center justify-center h-full py-1 transition-all ${
            activeTab === 'explore_roommates'
              ? 'text-rose-600 font-extrabold'
              : 'text-stone-500 hover:text-stone-800 font-medium'
          }`}
        >
          <div className="relative">
            <Users className={`w-5 h-5 ${activeTab === 'explore_roommates' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {activeTab === 'explore_roommates' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-rose-500" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Roommates</span>
        </button>

        {/* 4. Messages */}
        <button
          onClick={() => onSelectTab('messages')}
          className={`flex flex-col items-center justify-center h-full py-1 transition-all relative ${
            activeTab === 'messages'
              ? 'text-violet-700 font-extrabold'
              : 'text-stone-500 hover:text-stone-800 font-medium'
          }`}
        >
          <div className="relative">
            <MessageSquare className={`w-5 h-5 ${activeTab === 'messages' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unreadMessagesCount}
              </span>
            )}
            {activeTab === 'messages' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-600" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Messages</span>
        </button>

        {/* 5. Profile */}
        <button
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center justify-center h-full py-1 transition-all ${
            activeTab === 'profile'
              ? 'text-violet-700 font-extrabold'
              : 'text-stone-500 hover:text-stone-800 font-medium'
          }`}
        >
          <div className="relative">
            <img
              src={userAvatar}
              alt=""
              className={`w-5 h-5 rounded-full object-cover ring-1 ${
                activeTab === 'profile' ? 'ring-violet-600' : 'ring-stone-300'
              }`}
            />
            {activeTab === 'profile' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-600" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Profile</span>
        </button>
      </div>
    </nav>
  );
};
