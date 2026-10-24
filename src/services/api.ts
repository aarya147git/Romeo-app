import { PropertyListing, UserProfile, ConnectionRequest, ChatMessage, ReportItem } from '../types';
import { INITIAL_USERS, INITIAL_PROPERTIES, INITIAL_CONNECTIONS, INITIAL_MESSAGES, INITIAL_REPORTS } from '../data/seedData';

// Helper for safe JSON fetching with fallback
async function safeFetch<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.warn(`[API] ${options?.method || 'GET'} ${url} returned ${res.status}`);
      if (fallback !== undefined) return fallback;
    }
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    return (fallback !== undefined ? fallback : ({} as T));
  } catch (err) {
    console.warn(`[API] Network error fetching ${url}:`, err);
    if (fallback !== undefined) return fallback;
    throw err;
  }
}

export const api = {
  // ── Auth & Current User ───────────────────────────────────────────────────
  async getCurrentUser(): Promise<{ user: UserProfile; savedPropertyIds: string[]; shortlistedUserIds: string[] } | null> {
    const fallback = {
      user: INITIAL_USERS[0],
      savedPropertyIds: ['prop-blr-koramangala', 'prop-delhi-southcampus'],
      shortlistedUserIds: ['user-ananya', 'user-priya'],
    };
    return safeFetch('/api/auth/current-user', {}, fallback);
  },

  async setCurrentUser(userId: string): Promise<{ user: UserProfile; savedPropertyIds: string[]; shortlistedUserIds: string[] } | null> {
    const targetUser = INITIAL_USERS.find(u => u.id === userId) || INITIAL_USERS[0];
    const fallback = {
      user: targetUser,
      savedPropertyIds: ['prop-blr-koramangala', 'prop-delhi-southcampus'],
      shortlistedUserIds: ['user-ananya', 'user-priya'],
    };
    return safeFetch('/api/auth/current-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    }, fallback);
  },

  // ── Users & Roommates (MongoDB via /api/roommates & /api/users) ─────────────
  async fetchUsers(params?: Record<string, string | number>): Promise<UserProfile[]> {
    const search = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
    const res = await safeFetch<{ users?: UserProfile[] }>(`/api/users?${search}`, {}, { users: INITIAL_USERS });
    return res.users || INITIAL_USERS;
  },

  async fetchUserById(id: string): Promise<UserProfile | null> {
    const userFallback = INITIAL_USERS.find(u => u.id === id) || null;
    const res = await safeFetch<{ user?: UserProfile }>(`/api/users/${id}`, {}, { user: userFallback || undefined });
    return res.user || userFallback;
  },

  async createUser(userData: Partial<UserProfile>): Promise<UserProfile> {
    const res = await safeFetch<{ user: UserProfile }>('/api/roommates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    }, { user: userData as UserProfile });
    return res.user || (userData as UserProfile);
  },

  async updateUser(id: string, userData: Partial<UserProfile>): Promise<UserProfile> {
    const res = await safeFetch<{ user: UserProfile }>(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    }, { user: { ...INITIAL_USERS[0], ...userData, id } as UserProfile });
    return res.user;
  },

  // ── Property Listings (MongoDB via /api/listings & /api/properties) ─────────
  async fetchProperties(params?: Record<string, string | number>): Promise<{ properties: PropertyListing[]; savedIds: string[] }> {
    const search = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
    const res = await safeFetch<{ properties?: PropertyListing[]; savedIds?: string[] }>(
      `/api/properties?${search}`,
      {},
      { properties: INITIAL_PROPERTIES, savedIds: ['prop-blr-koramangala', 'prop-delhi-southcampus'] }
    );
    return {
      properties: res.properties || INITIAL_PROPERTIES,
      savedIds: res.savedIds || ['prop-blr-koramangala', 'prop-delhi-southcampus'],
    };
  },

  async fetchPropertyById(id: string): Promise<PropertyListing | null> {
    const fallback = INITIAL_PROPERTIES.find(p => p.id === id) || null;
    const res = await safeFetch<{ property?: PropertyListing }>(`/api/properties/${id}`, {}, { property: fallback || undefined });
    return res.property || fallback;
  },

  async createProperty(propertyData: Partial<PropertyListing>): Promise<PropertyListing> {
    const res = await safeFetch<{ property: PropertyListing; listing: PropertyListing }>('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propertyData),
    }, { property: propertyData as PropertyListing, listing: propertyData as PropertyListing });
    return res.property || res.listing || (propertyData as PropertyListing);
  },

  async toggleSaveProperty(id: string): Promise<boolean> {
    const res = await safeFetch<{ saved: boolean }>(`/api/properties/${id}/save`, { method: 'POST' }, { saved: true });
    return res.saved;
  },

  async toggleShortlistUser(id: string): Promise<boolean> {
    const res = await safeFetch<{ shortlisted: boolean }>(`/api/users/${id}/shortlist`, { method: 'POST' }, { shortlisted: true });
    return res.shortlisted;
  },

  async fetchSaved(): Promise<{ properties: PropertyListing[]; shortlistedRoommates: UserProfile[] }> {
    return safeFetch('/api/saved', {}, {
      properties: INITIAL_PROPERTIES.slice(0, 2),
      shortlistedRoommates: INITIAL_USERS.slice(1, 3),
    });
  },

  // ── Connections & Inquiries (MongoDB via /api/inquiries & /api/connections) ─
  async fetchConnections(userId?: string): Promise<ConnectionRequest[]> {
    const res = await safeFetch<{ connections?: ConnectionRequest[] }>(
      `/api/connections?userId=${userId || ''}`,
      {},
      { connections: INITIAL_CONNECTIONS }
    );
    return res.connections || INITIAL_CONNECTIONS;
  },

  async sendConnection(payload: {
    senderId: string;
    receiverId: string;
    message?: string;
    propertyId?: string;
    propertyTitle?: string;
  }): Promise<ConnectionRequest> {
    const res = await safeFetch<{ connection: ConnectionRequest; inquiry: any }>('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, { connection: { id: `conn-${Date.now()}`, ...payload, status: 'pending', createdAt: 'Just now' } as any, inquiry: {} });
    return res.connection;
  },

  async updateConnectionStatus(id: string, status: 'accepted' | 'declined'): Promise<ConnectionRequest> {
    const res = await safeFetch<{ connection: ConnectionRequest }>(`/api/connections/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }, { connection: { id, status, createdAt: 'Just now' } as any });
    return res.connection;
  },

  // ── Messaging ─────────────────────────────────────────────────────────────
  async fetchMessages(userA: string, userB: string): Promise<ChatMessage[]> {
    const res = await safeFetch<{ messages?: ChatMessage[] }>(
      `/api/messages?userA=${userA}&userB=${userB}`,
      {},
      { messages: INITIAL_MESSAGES }
    );
    return res.messages || INITIAL_MESSAGES;
  },

  async sendMessage(payload: {
    senderId: string;
    receiverId: string;
    text: string;
    sharedProperty?: ChatMessage['sharedProperty'];
  }): Promise<ChatMessage> {
    const res = await safeFetch<{ message: ChatMessage }>('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, {
      message: {
        id: `msg-${Date.now()}`,
        threadId: [payload.senderId, payload.receiverId].sort().join('-'),
        senderId: payload.senderId,
        receiverId: payload.receiverId,
        text: payload.text,
        timestamp: 'Just now',
        sharedProperty: payload.sharedProperty,
      },
    });
    return res.message;
  },

  // ── Reports & Moderation ──────────────────────────────────────────────────
  async fetchReports(): Promise<ReportItem[]> {
    const res = await safeFetch<{ reports?: ReportItem[] }>('/api/reports', {}, { reports: INITIAL_REPORTS });
    return res.reports || INITIAL_REPORTS;
  },

  async submitReport(payload: Partial<ReportItem>): Promise<ReportItem> {
    const res = await safeFetch<{ report: ReportItem }>('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, { report: { id: `rep-${Date.now()}`, ...payload, status: 'pending', createdAt: 'Just now' } as any });
    return res.report;
  },

  async updateReportStatus(id: string, status: string): Promise<ReportItem> {
    const res = await safeFetch<{ report: ReportItem }>(`/api/reports/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }, { report: { id, status, createdAt: 'Just now' } as any });
    return res.report;
  },

  // ── AI Match Insights & Assistants ────────────────────────────────────────
  async getMatchInsight(userA: UserProfile, userB: UserProfile): Promise<string> {
    const res = await safeFetch<{ insight?: string }>('/api/ai/match-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userA, userB }),
    }, {
      insight: `High compatibility! Both ${userA.name} and ${userB.name} prefer ${userA.lifestyle?.cleanliness || 'clean'} spaces and aligned work styles.`,
    });
    return res.insight || 'High lifestyle match based on sleep schedule and cleanliness.';
  },

  async naturalLanguageSearch(query: string): Promise<{
    matchedPropertyIds: string[];
    matchedUserIds: string[];
    summary: string;
  }> {
    return safeFetch('/api/ai/nl-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    }, {
      matchedPropertyIds: ['prop-blr-koramangala', 'prop-blr-hsr'],
      matchedUserIds: ['user-ananya', 'user-rohan'],
      summary: `Found verified rooms and compatible roommates matching "${query}".`,
    });
  },

  async getBudgetPlan(payload: {
    monthlyRent: number;
    maintenance?: number;
    securityDeposit?: number;
    city?: string;
    roomType?: string;
  }): Promise<{
    upfrontCost: number;
    monthlyTotal: number;
    breakdown: {
      rent: number;
      maintenance: number;
      estimatedElectricityAndWifi: number;
      estimatedFoodAndGroceries: number;
      estimatedLocalCommute: number;
    };
    financialTip: string;
  }> {
    const rent = payload.monthlyRent || 15000;
    const maintenance = payload.maintenance || 1000;
    const deposit = payload.securityDeposit || rent * 2;
    const fallback = {
      upfrontCost: deposit + rent + maintenance,
      monthlyTotal: rent + maintenance + 3500 + 4000,
      breakdown: {
        rent,
        maintenance,
        estimatedElectricityAndWifi: 1500,
        estimatedFoodAndGroceries: 5000,
        estimatedLocalCommute: 2000,
      },
      financialTip: 'Keep your total accommodation expenses under 35% of your take-home monthly budget for optimal savings.',
    };
    return safeFetch('/api/ai/budget-calc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, fallback);
  },

  async summarizeListing(property: PropertyListing): Promise<string> {
    const res = await safeFetch<{ summary?: string }>('/api/ai/summarize-listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property }),
    }, {
      summary: `${property.title} located in ${property.locality}, ${property.city}. Features ${property.furnishing.toLowerCase()} setup with ${property.amenities?.slice(0, 3).join(', ')}.`,
    });
    return res.summary || 'Summary generated.';
  },

  async getSafetyAdvice(payload: {
    propertyTitle?: string;
    rent?: number;
    city?: string;
  }): Promise<string> {
    const res = await safeFetch<{ advice?: string }>('/api/ai/safety-advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, {
      advice: 'Always insist on a physical or live video walkthrough before transferring any advance deposit. Verify the landlord/manager identity and review rental agreement terms.',
    });
    return res.advice || 'Safety guidelines loaded.';
  },
};
