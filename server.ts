import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_USERS, INITIAL_PROPERTIES, INITIAL_CONNECTIONS, INITIAL_MESSAGES, INITIAL_REPORTS } from './src/data/seedData';
import { PropertyListing, UserProfile, ConnectionRequest, ChatMessage, ReportItem } from './src/types';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dbConnect } from './lib/dbConnect';
import { calculateCompatibility } from './lib/matching';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Attempt MongoDB connection
dbConnect().catch(err => console.warn('Database fallback active:', err.message));

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory persistent data store
let users: UserProfile[] = [...INITIAL_USERS];
let properties: PropertyListing[] = [...INITIAL_PROPERTIES];
let connections: ConnectionRequest[] = [...INITIAL_CONNECTIONS];
let messages: ChatMessage[] = [...INITIAL_MESSAGES];
let reports: ReportItem[] = [...INITIAL_REPORTS];
let savedPropertyIds: Set<string> = new Set(['prop-blr-koramangala', 'prop-delhi-southcampus']);
let shortlistedUserIds: Set<string> = new Set(['user-ananya', 'user-priya']);

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Active session user tracking on server
let currentUserId: string = 'user-rohan';

// ================= USER & AUTH ROUTES =================
app.get('/api/auth/current-user', (req: Request, res: Response) => {
  const user = users.find(u => u.id === currentUserId) || users[0];
  res.json({
    user,
    savedPropertyIds: Array.from(savedPropertyIds),
    shortlistedUserIds: Array.from(shortlistedUserIds)
  });
});

app.post('/api/auth/current-user', (req: Request, res: Response) => {
  const { userId } = req.body;
  if (userId && users.some(u => u.id === userId)) {
    currentUserId = userId;
  }
  const user = users.find(u => u.id === currentUserId) || users[0];
  res.json({
    user,
    savedPropertyIds: Array.from(savedPropertyIds),
    shortlistedUserIds: Array.from(shortlistedUserIds)
  });
});

app.get('/api/users', (req: Request, res: Response) => {
  const { city, role, genderPref, maxBudget } = req.query;
  let filtered = [...users];

  if (city && typeof city === 'string' && city !== 'all') {
    filtered = filtered.filter(u => u.city.toLowerCase() === city.toLowerCase());
  }
  if (role && typeof role === 'string' && role !== 'all') {
    filtered = filtered.filter(u => u.role === role);
  }
  if (genderPref && typeof genderPref === 'string' && genderPref !== 'all') {
    filtered = filtered.filter(u => u.gender === genderPref);
  }
  if (maxBudget && typeof maxBudget === 'string') {
    const budgetNum = parseInt(maxBudget, 10);
    if (!isNaN(budgetNum)) {
      filtered = filtered.filter(u => u.budgetMin <= budgetNum);
    }
  }

  res.json({ users: filtered });
});

app.get('/api/users/:id', (req: Request, res: Response) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});

app.post('/api/users', (req: Request, res: Response) => {
  const userData: Partial<UserProfile> = req.body;
  const newUser: UserProfile = {
    id: `user-${Date.now()}`,
    name: userData.name || 'Anonymous User',
    age: userData.age || 22,
    gender: userData.gender || 'male',
    avatar: userData.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80`,
    email: userData.email || `user${Date.now()}@example.com`,
    phone: userData.phone || '+91 98000 00000',
    bio: userData.bio || 'Looking for a compatible roommate and comfortable space.',
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
      smoking: 'non_smoker',
      drinking: 'social',
      foodDiet: 'no_preference',
      sleepSchedule: 'flexible',
      sleepTiming: '11:30 PM - 7:30 AM',
      cleanliness: 'moderate',
      socialVibe: 'balanced',
      guestPolicy: 'open_with_notice',
      wfhStatus: 'hybrid',
      pets: 'comfortable_with_pets',
      acPreference: 'must_have',
      furnishingPref: 'fully_furnished'
    },
    contactVisibility: userData.contactVisibility || 'after_connection',
    isVerified: true,
    verificationBadge: 'Govt ID Verified',
    hasPlaceToShare: userData.hasPlaceToShare || false,
    createdAt: new Date().toISOString().split('T')[0]
  };

  users.unshift(newUser);
  res.status(201).json({ user: newUser });
});

app.put('/api/users/:id', (req: Request, res: Response) => {
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  users[idx] = { ...users[idx], ...req.body };
  res.json({ user: users[idx] });
});

// ================= PROPERTY ROUTES =================
app.get('/api/properties', (req: Request, res: Response) => {
  const { city, locality, propertyType, maxRent, genderEligibility, furnishing, amenities } = req.query;
  let filtered = properties.map(p => ({
    ...p,
    isSaved: savedPropertyIds.has(p.id)
  }));

  if (city && typeof city === 'string' && city !== 'all') {
    filtered = filtered.filter(p => p.city.toLowerCase() === city.toLowerCase());
  }
  if (locality && typeof locality === 'string' && locality.trim() !== '') {
    filtered = filtered.filter(p => p.locality.toLowerCase().includes(locality.toLowerCase()));
  }
  if (propertyType && typeof propertyType === 'string' && propertyType !== 'all') {
    filtered = filtered.filter(p => p.propertyType === propertyType);
  }
  if (genderEligibility && typeof genderEligibility === 'string' && genderEligibility !== 'all') {
    filtered = filtered.filter(p => p.genderEligibility === genderEligibility || p.genderEligibility === 'Co-ed / Any');
  }
  if (furnishing && typeof furnishing === 'string' && furnishing !== 'all') {
    filtered = filtered.filter(p => p.furnishing === furnishing);
  }
  if (maxRent && typeof maxRent === 'string') {
    const rentNum = parseInt(maxRent, 10);
    if (!isNaN(rentNum) && rentNum > 0) {
      filtered = filtered.filter(p => p.monthlyRent <= rentNum);
    }
  }

  res.json({ properties: filtered, savedIds: Array.from(savedPropertyIds) });
});

app.get('/api/properties/:id', (req: Request, res: Response) => {
  const prop = properties.find(p => p.id === req.params.id);
  if (!prop) {
    return res.status(404).json({ error: 'Property not found' });
  }
  res.json({ property: { ...prop, isSaved: savedPropertyIds.has(prop.id) } });
});

app.post('/api/properties', (req: Request, res: Response) => {
  const data = req.body;
  const newProp: PropertyListing = {
    id: `prop-${Date.now()}`,
    title: data.title || 'Comfortable Modern Shared Space',
    description: data.description || 'Spacious and well ventilated accommodation.',
    propertyType: data.propertyType || 'private_room',
    city: data.city || 'Bangalore',
    locality: data.locality || 'Koramangala',
    approxAddress: data.approxAddress || `${data.locality || 'Koramangala'}, near major junction`,
    coordinates: data.coordinates || { lat: 12.935, lng: 77.62 },
    images: data.images && data.images.length > 0 ? data.images : [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
    ],
    monthlyRent: Number(data.monthlyRent) || 15000,
    securityDeposit: Number(data.securityDeposit) || 30000,
    maintenanceCharges: Number(data.maintenanceCharges) || 1000,
    brokerageFee: Number(data.brokerageFee) || 0,
    utilityCharges: data.utilityCharges || {
      electricity: 'Metered bill split equally',
      wifi: 'High-speed broadband included',
      water: '24/7 supply included',
      gasCooking: 'Modular kitchen gas pipeline'
    },
    roomType: data.roomType || 'Single Room',
    sharingCapacity: Number(data.sharingCapacity) || 1,
    furnishing: data.furnishing || 'Fully Furnished',
    totalBedrooms: Number(data.totalBedrooms) || 2,
    totalBathrooms: Number(data.totalBathrooms) || 2,
    bathroomType: data.bathroomType || 'Attached',
    kitchenDetails: data.kitchenDetails || 'Fully Equipped Modular',
    amenities: data.amenities || ['Air Conditioning', 'High-Speed Wi-Fi', 'Washing Machine', 'Refrigerator', 'Power Backup'],
    genderEligibility: data.genderEligibility || 'Co-ed / Any',
    visitorPolicy: data.visitorPolicy || 'Allowed (Daytime & Overnight with notice)',
    smokingRule: data.smokingRule || 'Balcony/Outdoor Only',
    alcoholRule: data.alcoholRule || 'Allowed Moderately',
    curfew: data.curfew || 'No Curfew',
    foodRules: data.foodRules || 'Non-Veg Allowed',
    minimumStayMonths: Number(data.minimumStayMonths) || 6,
    noticePeriodMonths: Number(data.noticePeriodMonths) || 1,
    availableFrom: data.availableFrom || new Date().toISOString().split('T')[0],
    lister: data.lister || {
      id: 'current-user',
      name: 'Property Lister',
      role: 'Owner',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      isVerified: true,
      verificationBadge: 'Verified Lister'
    },
    createdAt: new Date().toISOString().split('T')[0]
  };

  properties.unshift(newProp);
  res.status(201).json({ property: newProp });
});

// Toggle Save Property
app.post('/api/properties/:id/save', (req: Request, res: Response) => {
  const { id } = req.params;
  if (savedPropertyIds.has(id)) {
    savedPropertyIds.delete(id);
    res.json({ saved: false, id });
  } else {
    savedPropertyIds.add(id);
    res.json({ saved: true, id });
  }
});

// Toggle Shortlist Roommate
app.post('/api/users/:id/shortlist', (req: Request, res: Response) => {
  const { id } = req.params;
  if (shortlistedUserIds.has(id)) {
    shortlistedUserIds.delete(id);
    res.json({ shortlisted: false, id });
  } else {
    shortlistedUserIds.add(id);
    res.json({ shortlisted: true, id });
  }
});

app.get('/api/saved', (req: Request, res: Response) => {
  const savedProps = properties.filter(p => savedPropertyIds.has(p.id));
  const shortlistedUsers = users.filter(u => shortlistedUserIds.has(u.id));
  res.json({
    properties: savedProps,
    shortlistedRoommates: shortlistedUsers
  });
});

// ================= CONNECTION & MESSAGING ROUTES =================
app.get('/api/connections', (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId) {
    return res.json({ connections });
  }
  const userConns = connections.filter(c => c.senderId === userId || c.receiverId === userId);
  res.json({ connections: userConns });
});

app.post('/api/connections', (req: Request, res: Response) => {
  const { senderId, receiverId, message, propertyId, propertyTitle } = req.body;
  const sender = users.find(u => u.id === senderId);
  const receiver = users.find(u => u.id === receiverId);

  const newConn: ConnectionRequest = {
    id: `conn-${Date.now()}`,
    senderId: senderId || 'user-rohan',
    receiverId: receiverId,
    senderName: sender ? sender.name : 'Rohan Sharma',
    senderAvatar: sender ? sender.avatar : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    receiverName: receiver ? receiver.name : 'Roommate',
    receiverAvatar: receiver ? receiver.avatar : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    message: message || 'Hey! I saw your profile on Romeo and think our lifestyle preferences match well. Would love to connect!',
    status: 'pending',
    propertyId,
    propertyTitle,
    createdAt: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
  };

  connections.unshift(newConn);
  res.status(201).json({ connection: newConn });
});

app.put('/api/connections/:id', (req: Request, res: Response) => {
  const { status } = req.body;
  const idx = connections.findIndex(c => c.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Connection request not found' });
  }

  connections[idx].status = status;
  res.json({ connection: connections[idx] });
});

app.get('/api/messages', (req: Request, res: Response) => {
  const { userA, userB } = req.query;
  if (userA && userB) {
    const thread = messages.filter(
      m => (m.senderId === userA && m.receiverId === userB) ||
           (m.senderId === userB && m.receiverId === userA)
    );
    return res.json({ messages: thread });
  }
  res.json({ messages });
});

app.post('/api/messages', (req: Request, res: Response) => {
  const { senderId, receiverId, text, sharedProperty } = req.body;
  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    threadId: [senderId, receiverId].sort().join('-'),
    senderId,
    receiverId,
    text,
    timestamp: 'Just now',
    sharedProperty
  };

  messages.push(newMsg);

  // Auto-respond simulation if receiver is a seed profile
  if (receiverId && receiverId !== senderId) {
    setTimeout(() => {
      const simulatedReplies = [
        "Thanks for the message! I'm happy to chat and answer any questions about the space.",
        "Hey! The location is really convenient and peaceful. When were you thinking of moving in?",
        "Awesome! I'm free this weekend if you'd like to do a quick video walkthrough or meetup.",
        "Glad to connect! Keeping things clean and respecting quiet hours are my main priorities as well."
      ];
      const replyText = simulatedReplies[Math.floor(Math.random() * simulatedReplies.length)];
      messages.push({
        id: `msg-${Date.now() + 1}`,
        threadId: [senderId, receiverId].sort().join('-'),
        senderId: receiverId,
        receiverId: senderId,
        text: replyText,
        timestamp: 'Just now'
      });
    }, 2500);
  }

  res.status(201).json({ message: newMsg });
});

// ================= REPORTS & SAFETY ROUTES =================
app.get('/api/reports', (req: Request, res: Response) => {
  res.json({ reports });
});

app.post('/api/reports', (req: Request, res: Response) => {
  const { reporterId, reporterName, targetType, targetId, targetTitle, reason, details } = req.body;
  const newReport: ReportItem = {
    id: `rep-${Date.now()}`,
    reporterId: reporterId || 'user-rohan',
    reporterName: reporterName || 'Rohan Sharma',
    targetType: targetType || 'property',
    targetId: targetId || 'unknown',
    targetTitle: targetTitle || 'Reported Item',
    reason: reason || 'Inaccurate Details or Photos',
    details: details || 'Suspicious details flagged by user.',
    status: 'investigating',
    createdAt: new Date().toISOString().split('T')[0]
  };

  reports.unshift(newReport);
  res.status(201).json({ report: newReport });
});

app.put('/api/reports/:id', (req: Request, res: Response) => {
  const { status } = req.body;
  const idx = reports.findIndex(r => r.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Report not found' });
  }
  reports[idx].status = status;
  res.json({ report: reports[idx] });
});

// ================= GEMINI AI POWERED ENDPOINTS =================
// 1. AI Roommate Compatibility Insight
app.post('/api/ai/match-insight', async (req: Request, res: Response) => {
  const { userA, userB } = req.body;
  if (!userA || !userB) {
    return res.status(400).json({ error: 'Missing user profiles' });
  }

  const prompt = `You are Romeo's AI Roommate Matching Specialist. Analyze the compatibility between these two people who may live together:
Person A:
Name: ${userA.name}, Age: ${userA.age}, Role: ${userA.role} (${userA.occupationTitle} at ${userA.institution})
City: ${userA.city}, Budget: ₹${userA.budgetMin}-₹${userA.budgetMax}
Lifestyle: Smoking: ${userA.lifestyle.smoking}, Drinking: ${userA.lifestyle.drinking}, Diet: ${userA.lifestyle.foodDiet}, Sleep: ${userA.lifestyle.sleepSchedule} (${userA.lifestyle.sleepTiming}), Cleanliness: ${userA.lifestyle.cleanliness}, Social Vibe: ${userA.lifestyle.socialVibe}, Guest Policy: ${userA.lifestyle.guestPolicy}, WFH: ${userA.lifestyle.wfhStatus}, Pets: ${userA.lifestyle.pets}

Person B:
Name: ${userB.name}, Age: ${userB.age}, Role: ${userB.role} (${userB.occupationTitle} at ${userB.institution})
City: ${userB.city}, Budget: ₹${userB.budgetMin}-₹${userB.budgetMax}
Lifestyle: Smoking: ${userB.lifestyle.smoking}, Drinking: ${userB.lifestyle.drinking}, Diet: ${userB.lifestyle.foodDiet}, Sleep: ${userB.lifestyle.sleepSchedule} (${userB.lifestyle.sleepTiming}), Cleanliness: ${userB.lifestyle.cleanliness}, Social Vibe: ${userB.lifestyle.socialVibe}, Guest Policy: ${userB.lifestyle.guestPolicy}, WFH: ${userB.lifestyle.wfhStatus}, Pets: ${userB.lifestyle.pets}

Provide a concise, encouraging, objective compatibility breakdown.
Format with:
- Compatibility Verdict (1-2 sentences summarizing synergy)
- Top 3 Shared Strengths (bullet points)
- Potential Friction Points & How to Handle Them (2 practical communication tips)
- Recommended House Rules for Harmony (e.g. guest policies, cleaning schedules)`;

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });
      return res.json({ insight: response.text });
    }
  } catch (err) {
    console.warn('Gemini API call failed, using intelligent fallback:', err);
  }

  // Fallback insight
  const sharedHabits: string[] = [];
  if (userA.lifestyle.smoking === userB.lifestyle.smoking) sharedHabits.push(`Mutual alignment on smoking (${userA.lifestyle.smoking})`);
  if (userA.lifestyle.sleepSchedule === userB.lifestyle.sleepSchedule) sharedHabits.push(`Synchronized sleep rhythms (${userA.lifestyle.sleepSchedule})`);
  if (userA.lifestyle.cleanliness === userB.lifestyle.cleanliness) sharedHabits.push(`Identical cleanliness standards (${userA.lifestyle.cleanliness})`);
  if (userA.city.toLowerCase() === userB.city.toLowerCase()) sharedHabits.push(`Both actively focused in ${userA.city}`);

  const fallback = `### Compatibility Verdict
${userA.name} and ${userB.name} demonstrate strong potential for harmonious co-living, sharing complementary living schedules and mutually agreeable house ethics.

### Top Shared Strengths
- ${sharedHabits[0] || 'Similar daily routines and budget brackets'}
- ${sharedHabits[1] || 'Respectful communication styles and verified identity status'}
- Common focus on a calm, productive home environment.

### Potential Friction Points & How to Handle Them
- **Schedule differences**: Discuss morning bathroom routines and quiet hours (e.g. 11 PM to 7 AM) beforehand.
- **Guest etiquette**: Agree on a simple heads-up policy on WhatsApp before hosting weekend visitors.

### Recommended House Rules
1. Split shared kitchen groceries and utility bills digitally on the 1st of every month.
2. Maintain common living and cooking spaces clean after use.`;

  res.json({ insight: fallback });
});

// 2. Natural Language Search
app.post('/api/ai/nl-search', async (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const prompt = `The user is searching for accommodation or roommates on Romeo:
User Query: "${query}"

Here are the available properties:
${JSON.stringify(properties.map(p => ({ id: p.id, title: p.title, city: p.city, locality: p.locality, rent: p.monthlyRent, type: p.propertyType, gender: p.genderEligibility })))}

Here are the available roommate candidates:
${JSON.stringify(users.map(u => ({ id: u.id, name: u.name, city: u.city, role: u.role, budgetMax: u.budgetMax, smoking: u.lifestyle.smoking, sleep: u.lifestyle.sleepSchedule })))}

Return a JSON object with:
1. matchedPropertyIds: string[] (ids that match the user request)
2. matchedUserIds: string[] (ids that match)
3. summary: string (a friendly 2-sentence response explaining what you found and recommending the best options)`;

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });
      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return res.json(parsed);
      }
    }
  } catch (err) {
    console.warn('Gemini NL search failed, falling back:', err);
  }

  // Smart heuristic fallback
  const q = query.toLowerCase();
  const matchedProp = properties.filter(p =>
    p.city.toLowerCase().includes(q) ||
    p.locality.toLowerCase().includes(q) ||
    p.title.toLowerCase().includes(q) ||
    (q.includes('under') && p.monthlyRent <= 20000) ||
    (q.includes('pg') && p.propertyType === 'pg') ||
    (q.includes('female') && p.genderEligibility === 'Female Only')
  );

  const matchedUsers = users.filter(u =>
    u.city.toLowerCase().includes(q) ||
    (q.includes('student') && u.role === 'student') ||
    (q.includes('tech') && (u.occupationTitle.toLowerCase().includes('engineer') || u.occupationTitle.toLowerCase().includes('design'))) ||
    (q.includes('non-smoker') && u.lifestyle.smoking === 'non_smoker')
  );

  res.json({
    matchedPropertyIds: matchedProp.length > 0 ? matchedProp.map(p => p.id) : [properties[0].id, properties[1].id],
    matchedUserIds: matchedUsers.length > 0 ? matchedUsers.map(u => u.id) : [users[0].id, users[1].id],
    summary: `Found ${matchedProp.length} properties and ${matchedUsers.length} compatible roommates matching your search for "${query}". Check out the highlighted spaces and reach out directly!`
  });
});

// 3. AI Budget Planner & Cost Estimator
app.post('/api/ai/budget-calc', async (req: Request, res: Response) => {
  const { monthlyRent, maintenance, securityDeposit, city, roomType } = req.body;
  const rent = Number(monthlyRent) || 15000;
  const maint = Number(maintenance) || 1000;
  const deposit = Number(securityDeposit) || rent * 2;

  const prompt = `Act as an expert Indian urban rental and student/professional cost-of-living financial advisor.
Property details:
- City: ${city || 'Bangalore'}
- Room Type: ${roomType || 'Private Room'}
- Base Monthly Rent: ₹${rent}
- Maintenance: ₹${maint}
- Refundable Security Deposit: ₹${deposit}

Calculate an accurate monthly expense breakdown and upfront move-in capital required.
Return JSON with:
{
  "upfrontCost": number,
  "monthlyTotal": number,
  "breakdown": {
    "rent": number,
    "maintenance": number,
    "estimatedElectricityAndWifi": number,
    "estimatedFoodAndGroceries": number,
    "estimatedLocalCommute": number
  },
  "financialTip": string
}`;

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });
      const text = response.text;
      if (text) {
        return res.json(JSON.parse(text));
      }
    }
  } catch (err) {
    console.warn('Gemini budget calc failed, using fallback:', err);
  }

  const estUtilities = 1200;
  const estFood = 4500;
  const estCommute = 1500;
  const monthlyTotal = rent + maint + estUtilities + estFood + estCommute;
  const upfrontCost = deposit + rent + maint;

  res.json({
    upfrontCost,
    monthlyTotal,
    breakdown: {
      rent,
      maintenance: maint,
      estimatedElectricityAndWifi: estUtilities,
      estimatedFoodAndGroceries: estFood,
      estimatedLocalCommute: estCommute
    },
    financialTip: `Keep your total monthly housing & food cost under 35-40% of your take-home pay. Since the security deposit of ₹${deposit.toLocaleString()} is refundable, ensure you document the move-in condition on video to safeguard your full refund.`
  });
});

// 4. AI Listing Summarizer
app.post('/api/ai/summarize-listing', async (req: Request, res: Response) => {
  const { property } = req.body;
  if (!property) return res.status(400).json({ error: 'Property is required' });

  const prompt = `Summarize this rental listing for a busy student or working professional:
Title: ${property.title}
Rent: ₹${property.monthlyRent}/mo, Deposit: ₹${property.securityDeposit}
Location: ${property.locality}, ${property.city}
Type: ${property.roomType}, Furnishing: ${property.furnishing}
Description: ${property.description}
Rules: Smoking: ${property.smokingRule}, Alcohol: ${property.alcoholRule}, Curfew: ${property.curfew}, Visitors: ${property.visitorPolicy}, Food: ${property.foodRules}

Provide a crisp markdown summary:
- **TL;DR** (1 sentence punchline)
- **Top Pros** (3 bullets)
- **Key House Rules & Restrictions** (highlight any curfew, guest, or food limits)
- **Ideal For** (who will love this place)`;

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });
      return res.json({ summary: response.text });
    }
  } catch (err) {
    console.warn('Gemini summarizer failed, using fallback:', err);
  }

  res.json({
    summary: `**TL;DR**: ${property.furnishing} ${property.roomType} in prime ${property.locality} for ₹${property.monthlyRent.toLocaleString()}/month.

**Top Pros**:
- Zero brokerage direct listing with verified transparency.
- ${property.furnishing} with essential amenities (${property.amenities?.slice(0, 3).join(', ')}).
- Prime locality with immediate access to public transit and tech hubs.

**Key House Rules & Restrictions**:
- **Curfew**: ${property.curfew}
- **Visitors**: ${property.visitorPolicy}
- **Smoking & Alcohol**: ${property.smokingRule}; ${property.alcoholRule}

**Ideal For**: Young professionals or students seeking hassle-free move-in with predictable expenses.`
  });
});

// 5. AI Safety & Rental Scam Check
app.post('/api/ai/safety-advice', async (req: Request, res: Response) => {
  const { propertyTitle, rent, city } = req.body;

  const prompt = `You are Romeo's Trust & Safety Rental Advisor. Provide essential, practical rental safety guidelines for a person considering:
Property: "${propertyTitle || 'Shared Flat'}" in ${city || 'Metro City'} at ₹${rent || 15000}/mo.

Provide actionable advice divided into:
1. Red Flags to Watch Out For (e.g. upfront QR code fees, refusal of in-person visit)
2. Safe Physical Viewing Checklist
3. Rental Agreement & Deposit Safeguards`;

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });
      return res.json({ advice: response.text });
    }
  } catch (err) {
    console.warn('Gemini safety advice failed, using fallback:', err);
  }

  res.json({
    advice: `### 🚨 Rental Scam Red Flags
- **Never Pay "Gate Pass" or "Viewing Token" Fees**: Legitimate owners or roommates will NEVER ask for money via UPI/QR code just to show a property.
- **Unavailable Lister**: If the person claims to be "out of town/military/abroad" and asks for deposit before you inspect the room with your own eyes, stop immediately.
- **Prices that Look Too Good to Be True**: Luxury 2BHKs in Koramangala or Powai for ₹8,000 are classic phishing traps.

### 📋 Safe Physical Viewing Checklist
1. Visit during daylight hours and preferably bring a friend or colleague.
2. Test water pressure, mobile cellular network inside bedrooms, and check geyser/electrical switches.
3. Confirm meter reading protocols (is there a sub-meter or split bills?).
4. Talk directly to current tenants or society security guards about power cuts and society culture.

### 📝 Rental Agreement & Deposit Safeguards
- Always insist on a registered or stamped 11-month rent agreement clearly stating the **Refundable Security Deposit** amount.
- Ensure the agreement specifies a clear notice period (normally 1 month) and painting deduction terms (typically standard 1 month rent or actual receipt).
- Transfer deposits only to bank accounts matching the name in the title deed or rental agreement.`
  });
});

// ================= VITE DEV OR STATIC PROD SERVING =================
async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const hasDist = fs.existsSync(distPath);

  if (process.env.NODE_ENV === 'production' || (hasDist && process.env.NODE_ENV !== 'development')) {
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback to transform index.html for SPA routes if not handled by vite middleware
    app.get('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        if (fs.existsSync(indexPath)) {
          let html = fs.readFileSync(indexPath, 'utf-8');
          html = await vite.transformIndexHtml(req.originalUrl, html);
          return res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        }
      } catch (err) {
        return next(err);
      }
      next();
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Romeo server running at http://localhost:${PORT}`);
  });
}

startServer();
