import type { IncomingMessage } from 'http';
import { dbConnect } from '../lib/dbConnect';
import { MatchInquiry } from '../models/MatchInquiry';

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
      const { userId } = req.query || {};
      if (!conn) {
        return res.status(200).json({ success: true, inquiries: [] });
      }

      const query = userId
        ? { $or: [{ senderId: userId }, { receiverId: userId }] }
        : {};

      const inquiries = await MatchInquiry.find(query).sort({ updatedAt: -1 }).lean();
      return res.status(200).json({ success: true, inquiries });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body || (await parseBody(req));
      const { senderId, receiverId, listingId, listingTitle, message } = body;

      if (!senderId || !receiverId) {
        return res.status(400).json({ success: false, message: 'senderId and receiverId are required.' });
      }

      if (conn) {
        // Check if reciprocal inquiry already exists => Mutual Match!
        const reverse = await MatchInquiry.findOne({
          senderId: receiverId,
          receiverId: senderId,
        });

        if (reverse) {
          reverse.status = 'mutual_match';
          reverse.contactPrivacy.isMasked = false;
          reverse.contactPrivacy.revealedAt = new Date();
          if (message) {
            reverse.chatMessages.push({
              senderId,
              text: message,
              createdAt: new Date(),
            });
          }
          await reverse.save();

          return res.status(200).json({
            success: true,
            isMutualMatch: true,
            message: "It's a Mutual Match! Phone and contact details are unlocked.",
            inquiry: reverse,
          });
        }

        const newInquiry = await MatchInquiry.create({
          id: `inq-${Date.now()}`,
          senderId,
          receiverId,
          listingId,
          listingTitle,
          message: message || 'Hey! I would love to connect about accommodation.',
          status: 'pending',
          contactPrivacy: { isRequested: true, isMasked: true },
        });

        return res.status(201).json({
          success: true,
          isMutualMatch: false,
          message: 'Connection request sent. Contact stays masked until accepted.',
          inquiry: newInquiry,
        });
      } else {
        return res.status(201).json({
          success: true,
          isMutualMatch: false,
          message: 'Connection request simulated.',
        });
      }
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
}
