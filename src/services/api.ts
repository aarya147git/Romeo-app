import { PropertyListing, UserProfile, ConnectionRequest, ChatMessage, ReportItem } from '../types';

export const api = {
  async getCurrentUser(): Promise<{ user: UserProfile; savedPropertyIds: string[]; shortlistedUserIds: string[] } | null> {
    try {
      const res = await fetch('/api/auth/current-user');
      return await res.json();
    } catch (e) {
      console.error('Failed to get current user:', e);
      return null;
    }
  },

  async setCurrentUser(userId: string): Promise<{ user: UserProfile; savedPropertyIds: string[]; shortlistedUserIds: string[] } | null> {
    try {
      const res = await fetch('/api/auth/current-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      return await res.json();
    } catch (e) {
      console.error('Failed to set current user:', e);
      return null;
    }
  },
  async fetchUsers(params?: Record<string, string | number>): Promise<UserProfile[]> {
    try {
      const search = new URLSearchParams(params as Record<string, string>).toString();
      const res = await fetch(`/api/users?${search}`);
      const data = await res.json();
      return data.users || [];
    } catch (e) {
      console.error('Failed to fetch users:', e);
      return [];
    }
  },

  async fetchUserById(id: string): Promise<UserProfile | null> {
    try {
      const res = await fetch(`/api/users/${id}`);
      const data = await res.json();
      return data.user || null;
    } catch (e) {
      console.error('Failed to fetch user:', e);
      return null;
    }
  },

  async createUser(userData: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    return data.user;
  },

  async updateUser(id: string, userData: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    return data.user;
  },

  async fetchProperties(params?: Record<string, string | number>): Promise<{ properties: PropertyListing[]; savedIds: string[] }> {
    try {
      const search = new URLSearchParams(params as Record<string, string>).toString();
      const res = await fetch(`/api/properties?${search}`);
      const data = await res.json();
      return {
        properties: data.properties || [],
        savedIds: data.savedIds || [],
      };
    } catch (e) {
      console.error('Failed to fetch properties:', e);
      return { properties: [], savedIds: [] };
    }
  },

  async fetchPropertyById(id: string): Promise<PropertyListing | null> {
    try {
      const res = await fetch(`/api/properties/${id}`);
      const data = await res.json();
      return data.property || null;
    } catch (e) {
      console.error('Failed to fetch property:', e);
      return null;
    }
  },

  async createProperty(propertyData: Partial<PropertyListing>): Promise<PropertyListing> {
    const res = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propertyData),
    });
    const data = await res.json();
    return data.property;
  },

  async toggleSaveProperty(id: string): Promise<boolean> {
    const res = await fetch(`/api/properties/${id}/save`, { method: 'POST' });
    const data = await res.json();
    return data.saved;
  },

  async toggleShortlistUser(id: string): Promise<boolean> {
    const res = await fetch(`/api/users/${id}/shortlist`, { method: 'POST' });
    const data = await res.json();
    return data.shortlisted;
  },

  async fetchSaved(): Promise<{ properties: PropertyListing[]; shortlistedRoommates: UserProfile[] }> {
    try {
      const res = await fetch('/api/saved');
      return await res.json();
    } catch (e) {
      console.error('Failed to fetch saved items:', e);
      return { properties: [], shortlistedRoommates: [] };
    }
  },

  async fetchConnections(userId?: string): Promise<ConnectionRequest[]> {
    try {
      const res = await fetch(`/api/connections?userId=${userId || ''}`);
      const data = await res.json();
      return data.connections || [];
    } catch (e) {
      console.error('Failed to fetch connections:', e);
      return [];
    }
  },

  async sendConnection(payload: {
    senderId: string;
    receiverId: string;
    message?: string;
    propertyId?: string;
    propertyTitle?: string;
  }): Promise<ConnectionRequest> {
    const res = await fetch('/api/connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.connection;
  },

  async updateConnectionStatus(id: string, status: 'accepted' | 'declined'): Promise<ConnectionRequest> {
    const res = await fetch(`/api/connections/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    return data.connection;
  },

  async fetchMessages(userA: string, userB: string): Promise<ChatMessage[]> {
    try {
      const res = await fetch(`/api/messages?userA=${userA}&userB=${userB}`);
      const data = await res.json();
      return data.messages || [];
    } catch (e) {
      console.error('Failed to fetch messages:', e);
      return [];
    }
  },

  async sendMessage(payload: {
    senderId: string;
    receiverId: string;
    text: string;
    sharedProperty?: ChatMessage['sharedProperty'];
  }): Promise<ChatMessage> {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.message;
  },

  async fetchReports(): Promise<ReportItem[]> {
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      return data.reports || [];
    } catch (e) {
      console.error('Failed to fetch reports:', e);
      return [];
    }
  },

  async submitReport(payload: Partial<ReportItem>): Promise<ReportItem> {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.report;
  },

  async updateReportStatus(id: string, status: string): Promise<ReportItem> {
    const res = await fetch(`/api/reports/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    return data.report;
  },

  // Gemini AI features
  async getMatchInsight(userA: UserProfile, userB: UserProfile): Promise<string> {
    const res = await fetch('/api/ai/match-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userA, userB }),
    });
    const data = await res.json();
    return data.insight || 'No insight available';
  },

  async naturalLanguageSearch(query: string): Promise<{
    matchedPropertyIds: string[];
    matchedUserIds: string[];
    summary: string;
  }> {
    const res = await fetch('/api/ai/nl-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    return await res.json();
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
    const res = await fetch('/api/ai/budget-calc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  },

  async summarizeListing(property: PropertyListing): Promise<string> {
    const res = await fetch('/api/ai/summarize-listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property }),
    });
    const data = await res.json();
    return data.summary || 'Summary unavailable';
  },

  async getSafetyAdvice(payload: {
    propertyTitle?: string;
    rent?: number;
    city?: string;
  }): Promise<string> {
    const res = await fetch('/api/ai/safety-advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.advice || 'Safety guidelines unavailable';
  },
};
