/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, PropertyListing, UserProfile } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { RoomSearch } from './components/RoomSearch';
import { RoommateSearch } from './components/RoommateSearch';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { RoommateDetailModal } from './components/RoommateDetailModal';
import { CreateListingModal } from './components/CreateListingModal';
import { ComparisonModal } from './components/ComparisonModal';
import { MessagesModal } from './components/MessagesModal';
import { SavedModal } from './components/SavedModal';
import { SafetyCenterModal } from './components/SafetyCenterModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { OnboardingModal } from './components/OnboardingModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ProfileViewModal } from './components/ProfileViewModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { Footer } from './components/Footer';
import { Sparkles, Home, Users, CheckCircle2, ShieldCheck, HeartHandshake, MapPin } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('explore_rooms');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>([]);
  const [shortlistedUserIds, setShortlistedUserIds] = useState<string[]>(['user-ananya']);
  const [compareList, setCompareList] = useState<PropertyListing[]>([]);

  // Modals state
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);
  const [selectedRoommate, setSelectedRoommate] = useState<UserProfile | null>(null);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [reportTarget, setReportTarget] = useState<{ type: 'property' | 'user' | 'message'; id: string; title: string } | undefined>(undefined);
  const [initialChatUser, setInitialChatUser] = useState<string | undefined>(undefined);

  // Load initial data from Express backend (single source of truth across devices)
  useEffect(() => {
    async function initData() {
      const [userList, propData, currentSession] = await Promise.all([
        api.fetchUsers(),
        api.fetchProperties(),
        api.getCurrentUser(),
      ]);
      setUsers(userList);
      setProperties(propData.properties);
      if (currentSession && currentSession.user) {
        setCurrentUser(currentSession.user);
        setSavedPropertyIds(currentSession.savedPropertyIds || propData.savedIds);
        setShortlistedUserIds(currentSession.shortlistedUserIds || ['user-ananya']);
      } else if (userList.length > 0) {
        setCurrentUser(userList[0]);
        setSavedPropertyIds(propData.savedIds);
      }
    }
    initData();
  }, []);

  const handleSwitchUser = async (user: UserProfile) => {
    setCurrentUser(user);
    const session = await api.setCurrentUser(user.id);
    if (session) {
      if (session.savedPropertyIds) setSavedPropertyIds(session.savedPropertyIds);
      if (session.shortlistedUserIds) setShortlistedUserIds(session.shortlistedUserIds);
    }
  };

  // Handlers
  const handleToggleSaveProperty = async (id: string) => {
    const isNowSaved = await api.toggleSaveProperty(id);
    if (isNowSaved) {
      setSavedPropertyIds((prev) => [...prev, id]);
    } else {
      setSavedPropertyIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleToggleShortlistUser = async (id: string) => {
    const isNowShortlisted = await api.toggleShortlistUser(id);
    if (isNowShortlisted) {
      setShortlistedUserIds((prev) => [...prev, id]);
    } else {
      setShortlistedUserIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleCompare = (property: PropertyListing) => {
    if (compareList.some((p) => p.id === property.id)) {
      setCompareList(compareList.filter((p) => p.id !== property.id));
    } else {
      if (compareList.length >= 3) {
        showToast('You can compare up to 3 properties at a time.');
        return;
      }
      setCompareList([...compareList, property]);
    }
  };

  const handleOpenContact = (property: PropertyListing) => {
    setSelectedProperty(null);
    setInitialChatUser(property.lister.id);
    setIsMessagesOpen(true);
  };

  const handleSendConnection = (user: UserProfile) => {
    setSelectedRoommate(null);
    setInitialChatUser(user.id);
    setIsMessagesOpen(true);
  };

  const handleReportProperty = (property: PropertyListing) => {
    setReportTarget({
      type: 'property',
      id: property.id,
      title: property.title,
    });
    setIsSafetyModalOpen(true);
  };

  const handleReportUser = (user: UserProfile) => {
    setReportTarget({
      type: 'user',
      id: user.id,
      title: `${user.name} (${user.occupationTitle})`,
    });
    setIsSafetyModalOpen(true);
  };

  const handleOpenNLSearch = (query: string) => {
    setAiSearchQuery(query);
    setIsAIOpen(true);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-rose-500 flex items-center justify-center text-white shadow-lg animate-pulse">
            <Home className="w-6 h-6 stroke-[2.5]" />
          </div>
          <p className="font-extrabold text-stone-900 text-lg tracking-tight">Romeo</p>
          <p className="text-xs text-stone-500 font-medium">Connecting you to verified spaces and compatible flatmates...</p>
        </div>
      </div>
    );
  }

  const savedPropertiesList = properties.filter((p) => savedPropertyIds.includes(p.id));
  const shortlistedUsersList = users.filter((u) => shortlistedUserIds.includes(u.id));

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-violet-100 selection:text-violet-900">
      {/* Top Global Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'saved') setIsSavedModalOpen(true);
          else if (tab === 'messages') setIsMessagesOpen(true);
          else if (tab === 'safety') setIsSafetyModalOpen(true);
          else if (tab === 'admin') setIsAdminModalOpen(true);
          else if (tab === 'profile') setIsProfileModalOpen(true);
          else if (tab === 'list_property') setIsCreateListingOpen(true);
          else setActiveTab(tab);
        }}
        currentUser={currentUser}
        allUsers={users}
        onSwitchUser={handleSwitchUser}
        savedCount={savedPropertyIds.length + shortlistedUserIds.length}
        unreadCount={2}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* Main Viewport Content with mobile safe-area bottom padding */}
      <main className="flex-1 pb-20 md:pb-0">
        {/* In-App PWA Install Banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <PWAInstallPrompt variant="banner" />
        </div>

        {/* Landing Hero (Featured on Room Search & Roommate Search top) */}
        <LandingHero
          onSelectMode={(mode, filters) => {
            if (mode === 'list_property') {
              setIsCreateListingOpen(true);
            } else {
              setActiveTab(mode);
            }
          }}
          onOpenNLSearch={handleOpenNLSearch}
          totalRooms={properties.length}
          totalRoommates={users.length}
        />

        {/* Dynamic Mode Content */}
        {activeTab === 'explore_rooms' && (
          <RoomSearch
            properties={properties}
            onSelectProperty={(prop) => setSelectedProperty(prop)}
            onToggleSave={handleToggleSaveProperty}
            savedIds={savedPropertyIds}
            compareList={compareList}
            onToggleCompare={handleToggleCompare}
            onOpenCompareModal={() => setIsCompareModalOpen(true)}
            initialCity={currentUser.city}
          />
        )}

        {activeTab === 'explore_roommates' && (
          <RoommateSearch
            users={users}
            currentUser={currentUser}
            onSelectUser={(candidate) => setSelectedRoommate(candidate)}
            onSendConnection={handleSendConnection}
            onToggleShortlist={handleToggleShortlistUser}
            shortlistedIds={shortlistedUserIds}
            initialCity={currentUser.city}
          />
        )}
      </main>

      {/* Modals & Dialogs */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onToggleSave={handleToggleSaveProperty}
          isSaved={savedPropertyIds.includes(selectedProperty.id)}
          onToggleCompare={handleToggleCompare}
          isComparing={compareList.some((p) => p.id === selectedProperty.id)}
          onContactLister={handleOpenContact}
          onReportProperty={handleReportProperty}
        />
      )}

      {selectedRoommate && (
        <RoommateDetailModal
          user={selectedRoommate}
          currentUser={currentUser}
          onClose={() => setSelectedRoommate(null)}
          onSendConnection={handleSendConnection}
          onToggleShortlist={handleToggleShortlistUser}
          isShortlisted={shortlistedUserIds.includes(selectedRoommate.id)}
          onReportUser={handleReportUser}
        />
      )}

      {isCreateListingOpen && (
        <CreateListingModal
          currentUser={currentUser}
          onClose={() => setIsCreateListingOpen(false)}
          onListingCreated={(newListing) => {
            setProperties((prev) => [newListing, ...prev]);
            setIsCreateListingOpen(false);
            setSelectedProperty(newListing);
          }}
        />
      )}

      {isCompareModalOpen && (
        <ComparisonModal
          compareList={compareList}
          onClose={() => setIsCompareModalOpen(false)}
          onRemove={(id) => setCompareList((prev) => prev.filter((p) => p.id !== id))}
          onSelectProperty={(prop) => {
            setIsCompareModalOpen(false);
            setSelectedProperty(prop);
          }}
        />
      )}

      {isMessagesOpen && (
        <MessagesModal
          currentUser={currentUser}
          allUsers={users}
          properties={properties}
          onClose={() => setIsMessagesOpen(false)}
          onOpenProperty={(prop) => {
            setIsMessagesOpen(false);
            setSelectedProperty(prop);
          }}
          initialChatUserId={initialChatUser}
          onReportUser={handleReportUser}
        />
      )}

      {isSavedModalOpen && (
        <SavedModal
          savedProperties={savedPropertiesList}
          shortlistedRoommates={shortlistedUsersList}
          onClose={() => setIsSavedModalOpen(false)}
          onSelectProperty={(prop) => {
            setIsSavedModalOpen(false);
            setSelectedProperty(prop);
          }}
          onSelectRoommate={(user) => {
            setIsSavedModalOpen(false);
            setSelectedRoommate(user);
          }}
          onRemoveSavedProperty={handleToggleSaveProperty}
          onRemoveShortlistedRoommate={handleToggleShortlistUser}
          onSendConnection={handleSendConnection}
        />
      )}

      {isSafetyModalOpen && (
        <SafetyCenterModal
          currentUser={currentUser}
          onClose={() => {
            setIsSafetyModalOpen(false);
            setReportTarget(undefined);
          }}
          initialReportTarget={reportTarget}
        />
      )}

      {isAdminModalOpen && (
        <AdminDashboardModal
          onClose={() => setIsAdminModalOpen(false)}
          properties={properties}
          users={users}
          onOpenProperty={(prop) => {
            setIsAdminModalOpen(false);
            setSelectedProperty(prop);
          }}
        />
      )}

      {isAIOpen && (
        <AIAssistantDrawer
          onClose={() => setIsAIOpen(false)}
          properties={properties}
          users={users}
          onSelectProperty={(prop) => {
            setIsAIOpen(false);
            setSelectedProperty(prop);
          }}
          onSelectUser={(user) => {
            setIsAIOpen(false);
            setSelectedRoommate(user);
          }}
          initialQuery={aiSearchQuery}
        />
      )}

      {isOnboardingOpen && (
        <OnboardingModal
          currentUser={currentUser}
          onClose={() => setIsOnboardingOpen(false)}
          onProfileUpdated={(updated) => {
            setCurrentUser(updated);
            setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
            setIsOnboardingOpen(false);
          }}
        />
      )}

      {/* User Profile View & Settings Modal */}
      {isProfileModalOpen && (
        <ProfileViewModal
          currentUser={currentUser}
          allUsers={users}
          onSwitchUser={handleSwitchUser}
          onEditPreferences={() => setIsOnboardingOpen(true)}
          onOpenSaved={() => setIsSavedModalOpen(true)}
          onOpenSafety={() => setIsSafetyModalOpen(true)}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
          onOpenListProperty={() => setIsCreateListingOpen(true)}
          onOpenAI={() => setIsAIOpen(true)}
          onClose={() => setIsProfileModalOpen(false)}
          savedCount={savedPropertyIds.length + shortlistedUserIds.length}
        />
      )}

      {/* Global Footer with bottom spacing for mobile navigation */}
      <div className="pb-16 md:pb-0">
        <Footer
          onNavigate={(tab) => {
            if (tab === 'saved') setIsSavedModalOpen(true);
            else if (tab === 'messages') setIsMessagesOpen(true);
            else if (tab === 'safety') setIsSafetyModalOpen(true);
            else if (tab === 'admin') setIsAdminModalOpen(true);
            else if (tab === 'profile') setIsProfileModalOpen(true);
            else if (tab === 'list_property') setIsCreateListingOpen(true);
            else setActiveTab(tab);
          }}
          onOpenSafety={() => setIsSafetyModalOpen(true)}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
          onOpenAI={() => setIsAIOpen(true)}
        />
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 font-bold text-stone-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Mobile-First Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'profile') {
            setIsProfileModalOpen(true);
          } else if (tab === 'messages') {
            setIsMessagesOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        unreadMessagesCount={2}
        userAvatar={currentUser.avatar}
        userName={currentUser.name}
      />
    </div>
  );
}
