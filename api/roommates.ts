import type { IncomingMessage } from 'http';
import { dbConnect } from '../lib/dbConnect';
import { calculateCompatibility } from '../lib/matching';
import { User, IUser } from '../models/User';
import { INITIAL_USERS } from '../src/data/seedData';

async function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON payload'));
      }
    });
  });
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  const conn = await dbConnect();

  if (req.method === 'GET') {
    try {
      const { city, role, genderPref, maxBudget } = req.query || {};

      if (!conn) {
        let filtered = [...INITIAL_USERS];
        if (city && city !== 'all') filtered = filtered.filter(u => u.city.toLowerCase() === (city as string).toLowerCase());
        if (role && role !== 'all') filtered = filtered.filter(u => u.role === role);
        return res.status(200).json({ success: true, count: filtered.length, users: filtered, roommates: filtered });
      }

      // Auto-seed if database is empty
      const count = await User.countDocuments();
      if (count === 0 && INITIAL_USERS.length > 0) {
        try {
          await User.insertMany(INITIAL_USERS as any[]);
        } catch (seedErr) {
          console.warn('Initial user seeding error:', seedErr);
        }
      }

      const filter: Record<string, any> = {};
      if (city && city !== 'all') filter.city = { $regex: new RegExp(`^${city}$`, 'i') };
      if (role && role !== 'all') filter.role = role;
      if (genderPref && genderPref !== 'all') filter.gender = genderPref;
      if (maxBudget) {
        const budget = parseInt(maxBudget, 10);
        if (!isNaN(budget)) filter.budgetMin = { $lte: budget };
      }

      const users = await User.find(filter).sort({ createdAt: -1 }).lean();
      return res.status(200).json({
        success: true,
        count: users.length,
        users,
        roommates: users,
      });
    } catch (error: any) {
      console.error('Error in GET /api/roommates:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body || (await parseBody(req));
      const profileData = body.profile || body;
      const { findMatches = true } = body;

      if (!profileData || !profileData.name) {
        return res.status(400).json({
          success: false,
          message: 'Invalid profile data. Name and lifestyle preferences are required.',
        });
      }

      const userEmail = (profileData.email || `user-${Date.now()}@romeoapp.com`).toLowerCase();

      let currentUser: any;
      if (conn) {
        currentUser = await User.findOneAndUpdate(
          { email: userEmail },
          {
            $set: {
              ...profileData,
              email: userEmail,
              id: profileData.id || `user-${Date.now()}`,
            },
          },
          { new: true, upsert: true, runValidators: false }
        ).lean();
      } else {
        currentUser = {
          id: profileData.id || `user-${Date.now()}`,
          ...profileData,
          email: userEmail,
        };
      }

      // Compatibility Matching
      let candidateUsers: any[] = [];
      if (conn) {
        candidateUsers = await User.find({
          email: { $ne: userEmail },
          city: currentUser.city || 'Bangalore',
        })
          .limit(50)
          .lean();
      } else {
        candidateUsers = INITIAL_USERS.filter(u => u.email !== userEmail);
      }

      const scoredMatches = candidateUsers.map((candidate) => {
        const compatibility = calculateCompatibility(currentUser, candidate);
        const maskedPhone = candidate.phone
          ? candidate.phone.replace(/(\+?\d{2,3})?(\d{2})\d+(\d{2})/, '$1 $2*** ***$3')
          : undefined;

        return {
          ...candidate,
          phone: maskedPhone,
          compatibility,
        };
      });

      scoredMatches.sort((a, b) => b.compatibility.overallScore - a.compatibility.overallScore);

      return res.status(200).json({
        success: true,
        message: 'Roommate profile saved and compatibility calculated',
        user: currentUser,
        matchCount: scoredMatches.length,
        matches: scoredMatches,
        users: scoredMatches,
      });
    } catch (error: any) {
      console.error('Error in POST /api/roommates:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
}
