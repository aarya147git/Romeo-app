import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  UserCheck,
  CheckCircle2,
  X,
  Send,
  Building,
  ShieldAlert,
  Phone,
  PhoneCall,
  Check,
  Sparkles,
  Info,
  Clock,
  MoreVertical,
  Flag,
  Share2,
  ArrowLeft
} from 'lucide-react';
import { ChatMessage, ConnectionRequest, PropertyListing, UserProfile } from '../types';
import { api } from '../services/api';

interface MessagesModalProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  properties: PropertyListing[];
  onClose: () => void;
  onOpenProperty: (property: PropertyListing) => void;
  initialChatUserId?: string;
  onReportUser: (user: UserProfile) => void;
}

export const MessagesModal: React.FC<MessagesModalProps> = ({
  currentUser,
  allUsers,
  properties,
  onClose,
  onOpenProperty,
  initialChatUserId,
  onReportUser,
}) => {
  const [connections, setConnections] = useState<ConnectionRequest[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<string>(initialChatUserId || 'user-kabir');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [showSharePropertyMenu, setShowSharePropertyMenu] = useState(false);
  const [phoneShared, setPhoneShared] = useState(false);
  const [activeTab, setActiveTab] = useState<'chats' | 'requests'>('chats');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>(initialChatUserId ? 'chat' : 'list');

  // Load connections
  const loadConnections = async () => {
    const list = await api.fetchConnections(currentUser.id);
    setConnections(list);
  };

  // Load messages for current pair
  const loadMessages = async (partnerId: string) => {
    const msgs = await api.fetchMessages(currentUser.id, partnerId);
    setMessages(msgs);
  };

  useEffect(() => {
    loadConnections();
  }, [currentUser.id]);

  useEffect(() => {
    if (activePartnerId) {
      loadMessages(activePartnerId);
    }
  }, [activePartnerId, currentUser.id]);

  const activePartner = allUsers.find((u) => u.id === activePartnerId) || allUsers[1];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = await api.sendMessage({
      senderId: currentUser.id,
      receiverId: activePartnerId,
      text: inputText.trim(),
    });

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Re-fetch after 3s to capture simulated auto-reply
    setTimeout(() => {
      loadMessages(activePartnerId);
    }, 3200);
  };

  const handleShareProperty = async (prop: PropertyListing) => {
    setShowSharePropertyMenu(false);
    const newMsg = await api.sendMessage({
      senderId: currentUser.id,
      receiverId: activePartnerId,
      text: `Hey, I came across this place on Romeo and thought of you: ${prop.title} in ${prop.locality}!`,
      sharedProperty: {
        id: prop.id,
        title: prop.title,
        rent: prop.monthlyRent,
        locality: `${prop.locality}, ${prop.city}`,
        image: prop.images[0],
      },
    });

    setMessages((prev) => [...prev, newMsg]);
  };

  const handleUpdateConnection = async (id: string, status: 'accepted' | 'declined') => {
    await api.updateConnectionStatus(id, status);
    loadConnections();
  };

  const pendingRequests = connections.filter(
    (c) => c.receiverId === currentUser.id && c.status === 'pending'
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-5xl h-[88vh] rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-violet-600" />
            <h2 className="font-extrabold text-stone-900 text-lg">Romeo Connect & Inbox</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Conversations & Requests */}
          <div className={`w-full sm:w-80 border-r border-stone-200 flex flex-col bg-stone-50/50 ${mobileView === 'chat' ? 'hidden sm:flex' : 'flex'}`}>
            {/* Toggle Tabs */}
            <div className="p-3 border-b border-stone-200 flex gap-2">
              <button
                onClick={() => setActiveTab('chats')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'chats'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Conversations
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all relative ${
                  activeTab === 'requests'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <span>Requests</span>
                {pendingRequests.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {activeTab === 'chats' ? (
                allUsers
                  .filter((u) => u.id !== currentUser.id)
                  .map((user) => {
                    const isSelected = activePartnerId === user.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          setActivePartnerId(user.id);
                          setMobileView('chat');
                        }}
                        className={`w-full p-3 rounded-2xl text-left flex items-center gap-3 transition-colors ${
                          isSelected ? 'bg-violet-100/70 border border-violet-200' : 'hover:bg-stone-100'
                        }`}
                      >
                        <div className="relative">
                          <img src={user.avatar} alt="" className="w-11 h-11 rounded-xl object-cover" />
                          {user.isVerified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-violet-600 fill-violet-100 absolute -bottom-1 -right-1" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-900 text-xs truncate">{user.name}</span>
                            <span className="text-[10px] text-stone-400 capitalize">{user.city}</span>
                          </div>
                          <p className="text-[11px] text-stone-500 truncate mt-0.5">{user.occupationTitle}</p>
                          <div className="text-[10px] text-violet-700 font-semibold mt-1">
                            Budget: ₹{user.budgetMin / 1000}k - ₹{user.budgetMax / 1000}k
                          </div>
                        </div>
                      </button>
                    );
                  })
              ) : (
                <div className="p-2 space-y-3">
                  {connections.length === 0 ? (
                    <p className="text-xs text-stone-400 text-center py-8">No connection requests yet.</p>
                  ) : (
                    connections.map((req) => (
                      <div key={req.id} className="p-3 bg-white rounded-2xl border border-stone-200 text-xs space-y-2">
                        <div className="flex items-center gap-2">
                          <img src={req.senderAvatar} alt="" className="w-8 h-8 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-stone-900 truncate">{req.senderName}</div>
                            <span className="text-[10px] text-stone-400">{req.createdAt}</span>
                          </div>
                        </div>
                        <p className="text-stone-600 italic text-[11px] bg-stone-50 p-2 rounded-lg">
                          "{req.message}"
                        </p>
                        {req.propertyTitle && (
                          <div className="text-[10px] text-violet-700 font-medium">
                            Regarding: {req.propertyTitle}
                          </div>
                        )}
                        {req.receiverId === currentUser.id && req.status === 'pending' && (
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => handleUpdateConnection(req.id, 'accepted')}
                              className="flex-1 py-1.5 bg-violet-600 text-white rounded-lg font-bold text-[11px] hover:bg-violet-700"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateConnection(req.id, 'declined')}
                              className="flex-1 py-1.5 bg-stone-100 text-stone-600 rounded-lg font-bold text-[11px] hover:bg-stone-200"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                        {req.status !== 'pending' && (
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            req.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'
                          }`}>
                            {req.status}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Pane: Active Chat Conversation */}
          <div className={`flex-1 flex flex-col bg-white ${mobileView === 'list' ? 'hidden sm:flex' : 'flex'}`}>
            {/* Chat Top Banner */}
            <div className="px-3 sm:px-5 py-3 border-b border-stone-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={() => setMobileView('list')}
                  className="sm:hidden p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors shrink-0"
                  title="Back to conversation list"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <img src={activePartner.avatar} alt="" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover" />
                <div>
                  <div className="font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <span>{activePartner.name}</span>
                    {activePartner.isVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-violet-600 fill-violet-100" />
                    )}
                  </div>
                  <div className="text-[11px] sm:text-xs text-stone-500 truncate max-w-[150px] sm:max-w-none">
                    {activePartner.occupationTitle} • {activePartner.city}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPhoneShared(!phoneShared)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                    phoneShared
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{phoneShared ? `Shared: ${currentUser.phone}` : 'Share Contact'}</span>
                </button>

                <button
                  onClick={() => onReportUser(activePartner)}
                  className="p-2 text-stone-400 hover:text-rose-600 transition-colors"
                  title="Report user"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Privacy Reminder Bar */}
            <div className="bg-stone-100/70 px-4 py-2 text-[11px] text-stone-500 flex items-center justify-between border-b border-stone-200">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-violet-600" />
                <span>Keep chats on Romeo until you are ready to meet. Never pay upfront booking fees.</span>
              </span>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-xs">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Start a conversation with {activePartner.name.split(' ')[0]} to discuss rooms, move-in timelines, and house rules.</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.senderId === currentUser.id;
                  return (
                    <div key={m.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isMine
                            ? 'bg-violet-600 text-white rounded-br-xs'
                            : 'bg-stone-100 text-stone-900 rounded-bl-xs'
                        }`}
                      >
                        <p>{m.text}</p>

                        {/* Shared property preview card inside chat */}
                        {m.sharedProperty && (
                          <div
                            onClick={() => {
                              const p = properties.find((x) => x.id === m.sharedProperty?.id);
                              if (p) onOpenProperty(p);
                            }}
                            className={`mt-2.5 p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                              isMine
                                ? 'bg-violet-700/60 border-violet-500 hover:bg-violet-700 text-white'
                                : 'bg-white border-stone-200 hover:border-violet-300 text-stone-900'
                            }`}
                          >
                            <img src={m.sharedProperty.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0 text-left">
                              <div className="font-bold truncate text-[11px]">{m.sharedProperty.title}</div>
                              <div className="text-[10px] opacity-80">{m.sharedProperty.locality}</div>
                              <div className="font-extrabold text-[11px] mt-0.5">₹{m.sharedProperty.rent.toLocaleString()}/mo</div>
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 mt-1 px-1">{m.timestamp}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Share Property Flyout */}
            {showSharePropertyMenu && (
              <div className="p-3 border-t border-stone-200 bg-stone-50 max-h-48 overflow-y-auto space-y-1.5 animate-in slide-in-from-bottom duration-150">
                <div className="flex justify-between items-center text-xs font-bold text-stone-700 mb-1">
                  <span>Share a Property Listing with {activePartner.name.split(' ')[0]}:</span>
                  <button onClick={() => setShowSharePropertyMenu(false)} className="text-stone-400 hover:text-stone-600">✕</button>
                </div>
                {properties.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleShareProperty(p)}
                    className="w-full p-2 bg-white rounded-xl border border-stone-200 hover:border-violet-400 text-left flex items-center gap-2 text-xs"
                  >
                    <img src={p.images[0]} alt="" className="w-8 h-8 rounded-md object-cover" />
                    <div className="flex-1 truncate">
                      <span className="font-bold text-stone-900 truncate block">{p.title}</span>
                      <span className="text-[10px] text-stone-500">₹{p.monthlyRent.toLocaleString()}/mo • {p.locality}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Message Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-stone-200 flex items-center gap-2 pb-safe bg-white">
              <button
                type="button"
                onClick={() => setShowSharePropertyMenu(!showSharePropertyMenu)}
                className="p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600 transition-colors shrink-0"
                title="Share property listing in chat"
              >
                <Building className="w-4 h-4 text-violet-600" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${activePartner.name.split(' ')[0]}...`}
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all min-h-[44px]"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center shadow-md shadow-violet-200"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
