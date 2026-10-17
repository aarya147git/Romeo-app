/**
 * src/services/api.ts  — Mock API layer (no backend required)
 *
 * Replaces all fetch('/api/...') calls with direct in-memory operations
 * on seedData. Same function signatures as the original — nothing else changes.
 */

import {
  PropertyListing,
  UserProfile,
  ConnectionRequest,
  ChatMessage,
  ReportItem,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PROPERTIES,
  INITIAL_CONNECTIONS,
  INITIAL_MESSAGES,
  INITIAL_REPORTS,
} from '../data/seedData';

// ─── In-memory store (persists for the browser session) ───────────────────────
let users: UserProfile[]             = [...INITIAL_USERS];
let properties: PropertyListing[]    = [...INITIAL_PROPERTIES];
let connections: ConnectionRequest[] = [...INITIAL_CONNECTIONS];
let messages: ChatMessage[]          = [...INITIAL_MESSAGES];
let reports: ReportItem[]            = [...INITIAL_REPORTS];
let savedPropertyIds: Set<string>    = new Set(['prop-blr-koramangala', 'prop-delhi-southcampus']);
let shortlistedUserIds: Set<string>  = new Set(['user-ananya', 'user-priya']);
let currentUserId: string            = 'user-rohan';

/** Keeps the API feeling async — same as real fetch responses. */
const delay = <T>(value: T): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(value), 0));

// ─── Exported API ─────────────────────────────────────────────────────────────
export const api = {

  // ── Auth ──────────────────────────────────────────────────────────────────
  async getCurrentUser(): Promise<{ user: UserProfile; savedPropertyIds: string[]; shortlistedUserIds: string[] } | null> {
    const user = users.find(u => u.id === currentUserId) || users[0];
    return delay({
      user,
      savedPropertyIds: Array.from(savedPropertyIds),
      shortlistedUserIds: Array.from(shortlistedUserIds),
    });
  },

  async setCurrentUser(userId: string): Promise<{ user: UserProfile; savedPropertyIds: string[]; shortlistedUserIds: string[] } | null> {
    if (userId && users.some(u => u.id === userId)) currentUserId = userId;
    const user = users.find(u => u.id === currentUserId) || users[0];
    return delay({
      user,
      savedPropertyIds: Array.from(savedPropertyIds),
      shortlistedUserIds: Array.from(shortlistedUserIds),
    });
  },

  // ── Users ─────────────────────────────────────────────────────────────────
  async fetchUsers(params?: Record<string, string | number>): Promise<UserProfile[]> {
    let filtered = [...users];
    if (params) {
      const { city, role, genderPref, maxBudget } = params as Record<string, string>;
      if (city && city !== 'all')
        filtered = filtered.filter(u => u.city.toLowerCase() === city.toLowerCase());
      if (role && role !== 'all')
        filtered = filtered.filter(u => u.role === role);
      if (genderPref && genderPref !== 'all')
        filtered = filtered.filter(u => u.gender === genderPref);
      if (maxBudget) {
        const budget = parseInt(maxBudget, 10);
        if (!isNaN(budget)) filtered = filtered.filter(u => u.budgetMin <= budget);
      }
    }
    return delay(filtered);
  },

  async fetchUserById(id: string): Promise<UserProfile | null> {
    return delay(users.find(u => u.id === id) ?? null);
  },

  async createUser(userData: Partial<UserProfile>): Promise<UserProfile> {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: userData.name || 'Anonymous User',
      age: userData.age || 22,
      gender: userData.gender || 'male',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      email: userData.email || `user${Date.now()}@example.com`,
      phone: userData.phone || '+91 98000 00000',
      bio: userData.bio || 'Looking for a compatible roommate.',
      role: userData.role || 'professional',
      institution: userData.institution || 'Bangalore Tech Park',
      occupationTitle: userData.occupationTitle || 'Software Engineer',
      city: userData.city || 'Bangalore',
      preferredLocalities: userData.preferredLocalities || ['Koramangala'],
      budgetMin: userData.budgetMin || 10000,
      budgetMax: userData.budgetMax || 20000,
      preferredMoveInDate: userData.preferredMoveInDate || '2026-11-01',
      preferredAccommodation: userData.preferredAccommodation || 'flat',
      preferredRoommateGender: userData.preferredRoommateGender || 'any',
      leaseDuration: userData.leaseDuration || '1 year+',
      lifestyle: userData.lifestyle || {
        smoking: 'non_smoker', drinking: 'social', foodDiet: 'no_preference',
        sleepSchedule: 'flexible', sleepTiming: '11:30 PM - 7:30 AM',
        cleanliness: 'moderate', socialVibe: 'balanced',
        guestPolicy: 'open_with_notice', wfhStatus: 'hybrid',
        pets: 'comfortable_with_pets', acPreference: 'must_have',
        furnishingPref: 'fully_furnished',
      },
      contactVisibility: userData.contactVisibility || 'after_connection',
      isVerified: true,
      verificationBadge: 'Govt ID Verified',
      hasPlaceToShare: userData.hasPlaceToShare || false,
      createdAt: new Date().toISOString().split('T')[0],
    };
    users.unshift(newUser);
    return delay(newUser);
  },

  async updateUser(id: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return delay(null);
    users[idx] = { ...users[idx], ...data };
    return delay(users[idx]);
  },

  // ── Properties ────────────────────────────────────────────────────────────
  async fetchProperties(params?: Record<string, string | number>): Promise<{ properties: PropertyListing[]; savedIds: string[] }> {
    let filtered = properties.map(p => ({ ...p, isSaved: savedPropertyIds.has(p.id) }));
    if (params) {
      const { city, locality, propertyType, maxRent, genderEligibility, furnishing } = params as Record<string, string>;
      if (city && city !== 'all')
        filtered = filtered.filter(p => p.city.toLowerCase() === city.toLowerCase());
      if (locality && locality.trim())
        filtered = filtered.filter(p => p.locality.toLowerCase().includes(locality.toLowerCase()));
      if (propertyType && propertyType !== 'all')
        filtered = filtered.filter(p => p.propertyType === propertyType);
      if (genderEligibility && genderEligibility !== 'all')
        filtered = filtered.filter(p => p.genderEligibility === genderEligibility || p.genderEligibility === 'Co-ed / Any');
      if (furnishing && furnishing !== 'all')
        filtered = filtered.filter(p => p.furnishing === furnishing);
      if (maxRent) {
        const rent = parseInt(maxRent, 10);
        if (!isNaN(rent) && rent > 0) filtered = filtered.filter(p => p.monthlyRent <= rent);
      }
    }
    return delay({ properties: filtered, savedIds: Array.from(savedPropertyIds) });
  },

  async fetchPropertyById(id: string): Promise<PropertyListing | null> {
    const prop = properties.find(p => p.id === id);
    if (!prop) return delay(null);
    return delay({ ...prop, isSaved: savedPropertyIds.has(prop.id) });
  },

  async createProperty(data: Partial<PropertyListing>): Promise<PropertyListing> {
    const newProp = {
      id: `prop-${Date.now()}`,
      title: data.title || 'Comfortable Modern Shared Space',
      description: data.description || 'Spacious and well ventilated accommodation.',
      propertyType: data.propertyType || 'private_room',
      city: data.city || 'Bangalore',
      locality: data.locality || 'Koramangala',
      approxAddress: data.approxAddress || `${data.locality || 'Koramangala'}, near major junction`,
      coordinates: data.coordinates || { lat: 12.935, lng: 77.62 },
      images: (data.images && data.images.length > 0) ? data.images : [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
      ],
      monthlyRent: Number(data.monthlyRent) || 15000,
      securityDeposit: Number(data.securityDeposit) || 30000,
      maintenanceCharges: Number(data.maintenanceCharges) || 1000,
      brokerageFee: Number(data.brokerageFee) || 0,
      utilityCharges: data.utilityCharges || {
        electricity: 'Metered bill split equally',
        wifi: 'Broadband included',
        water: '24/7 supply',
        gasCooking: 'Pipeline gas',
      },
      roomType: data.roomType || 'Single Room',
      sharingCapacity: Number(data.sharingCapacity) || 1,
      furnishing: data.furnishing || 'Fully Furnished',
      totalBedrooms: Number(data.totalBedrooms) || 2,
      totalBathrooms: Number(data.totalBathrooms) || 2,
      bathroomType: data.bathroomType || 'Attached',
      kitchenDetails: data.kitchenDetails || 'Fully Equipped Modular',
      amenities: data.amenities || ['Air Conditioning', 'High-Speed Wi-Fi', 'Washing Machine'],
      genderEligibility: data.genderEligibility || 'Co-ed / Any',
      visitorPolicy: data.visitorPolicy || 'Allowed with notice',
      smokingRule: data.smokingRule || 'Balcony only',
      alcoholRule: data.alcoholRule || 'Allowed',
      petPolicy: data.petPolicy || 'Case-by-case',
      leaseDuration: data.leaseDuration || '11 months (renewable)',
      availableFrom: data.availableFrom || '2026-11-01',
      listedBy: data.listedBy || currentUserId,
      postedAt: new Date().toISOString().split('T')[0],
      isSaved: false,
      ...(data as any),
    } as PropertyListing;
    properties.unshift(newProp);
    return delay(newProp);
  },

  // ── Saved Properties ──────────────────────────────────────────────────────
  async toggleSaveProperty(propertyId: string): Promise<{ savedIds: string[] }> {
    if (savedPropertyIds.has(propertyId)) savedPropertyIds.delete(propertyId);
    else savedPropertyIds.add(propertyId);
    return delay({ savedIds: Array.from(savedPropertyIds) });
  },

  async fetchSavedProperties(): Promise<{ properties: PropertyListing[]; savedIds: string[] }> {
    const saved = properties
      .filter(p => savedPropertyIds.has(p.id))
      .map(p => ({ ...p, isSaved: true }));
    return delay({ properties: saved, savedIds: Array.from(savedPropertyIds) });
  },

  // ── Shortlisted Users ─────────────────────────────────────────────────────
  async toggleShortlistUser(userId: string): Promise<{ shortlistedIds: string[] }> {
    if (shortlistedUserIds.has(userId)) shortlistedUserIds.delete(userId);
    else shortlistedUserIds.add(userId);
    return delay({ shortlistedIds: Array.from(shortlistedUserIds) });
  },

  async fetchShortlistedUsers(): Promise<{ users: UserProfile[]; shortlistedIds: string[] }> {
    const shortlisted = users.filter(u => shortlistedUserIds.has(u.id));
    return delay({ users: shortlisted, shortlistedIds: Array.from(shortlistedUserIds) });
  },

  // ── Connections ───────────────────────────────────────────────────────────
  async fetchConnections(): Promise<ConnectionRequest[]> {
    return delay([...connections]);
  },

  async sendConnectionRequest(toUserId: string): Promise<ConnectionRequest> {
    const existing = connections.find(
      c => c.fromUserId === currentUserId && c.toUserId === toUserId
    );
    if (existing) return delay(existing);
    const newConn: ConnectionRequest = {
      id: `conn-${Date.now()}`,
      fromUserId: currentUserId,
      toUserId,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };
    connections.push(newConn);
    return delay(newConn);
  },

  async updateConnectionStatus(connId: string, status: 'accepted' | 'rejected'): Promise<ConnectionRequest | null> {
    const idx = connections.findIndex(c => c.id === connId);
    if (idx === -1) return delay(null);
    connections[idx] = { ...connections[idx], status };
    return delay(connections[idx]);
  },

  // ── Messages ──────────────────────────────────────────────────────────────
  async fetchMessages(withUserId?: string): Promise<ChatMessage[]> {
    let filtered = [...messages];
    if (withUserId)
      filtered = filtered.filter(
        m => (m.fromUserId === currentUserId && m.toUserId === withUserId) ||
             (m.fromUserId === withUserId && m.toUserId === currentUserId)
      );
    return delay(filtered);
  },

  async sendMessage(toUserId: string, content: string): Promise<ChatMessage> {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      fromUserId: currentUserId,
      toUserId,
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    messages.push(newMsg);
    return delay(newMsg);
  },

  // ── Reports ───────────────────────────────────────────────────────────────
  async fetchReports(): Promise<ReportItem[]> {
    return delay([...reports]);
  },

  async submitReport(data: Partial<ReportItem>): Promise<ReportItem> {
    const newReport: ReportItem = {
      id: `report-${Date.now()}`,
      reportedBy: currentUserId,
      targetType: data.targetType || 'user',
      targetId: data.targetId || '',
      targetTitle: data.targetTitle || '',
      reason: data.reason || 'Other',
      description: data.description || '',
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };
    reports.push(newReport);
    return delay(newReport);
  },

  async updateReportStatus(reportId: string, status: string): Promise<ReportItem | null> {
    const idx = reports.findIndex(r => r.id === reportId);
    if (idx === -1) return delay(null);
    reports[idx] = { ...reports[idx], status: status as ReportItem['status'] };
    return delay(reports[idx]);
  },

  // ── AI (graceful fallback if no backend) ──────────────────────────────────
  async sendAIMessage(message: string, history: { role: string; content: string }[]): Promise<string> {
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
      });
      if (!res.ok) throw new Error('no backend');
      const data = await res.json();
      return data.response || data.message || 'No response.';
    } catch {
      return "Hi! I'm Romeo AI 🏠 — my AI backend isn't connected right now. Try browsing rooms or roommates using the tabs above!";
    }
  },
};
