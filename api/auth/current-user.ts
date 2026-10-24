import type { IncomingMessage } from 'http';
import { dbConnect } from '../../lib/dbConnect';
import { User } from '../../models/User';
import { INITIAL_USERS } from '../../src/data/seedData';

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

  try {
    let user: any = null;
    if (conn) {
      user = await User.findOne({ id: 'user-rohan' }).lean();
      if (!user) {
        user = await User.findOne({}).lean();
      }
    }

    if (!user) {
      user = INITIAL_USERS[0];
    }

    return res.status(200).json({
      user,
      savedPropertyIds: ['prop-blr-koramangala', 'prop-delhi-southcampus'],
      shortlistedUserIds: ['user-ananya', 'user-priya'],
    });
  } catch (error: any) {
    console.error('Error in /api/auth/current-user:', error);
    return res.status(200).json({
      user: INITIAL_USERS[0],
      savedPropertyIds: ['prop-blr-koramangala', 'prop-delhi-southcampus'],
      shortlistedUserIds: ['user-ananya', 'user-priya'],
    });
  }
}
