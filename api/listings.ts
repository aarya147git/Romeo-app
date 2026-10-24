import type { IncomingMessage, ServerResponse } from 'http';
import { dbConnect } from '../lib/dbConnect';
import { Listing } from '../models/Listing';
import { INITIAL_PROPERTIES } from '../src/data/seedData';

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

  const { method } = req;

  switch (method) {
    case 'GET': {
      try {
        const {
          city,
          locality,
          maxRent,
          minRent,
          accommodationType,
          propertyType,
          amenities,
          verifiedOnly,
          page = '1',
          limit = '50',
        } = req.query || {};

        if (!conn) {
          // Fallback if MONGODB_URI is not yet configured
          let filtered = [...INITIAL_PROPERTIES];
          if (city && city !== 'all') filtered = filtered.filter(p => p.city.toLowerCase() === city.toLowerCase());
          if (locality && locality.trim()) filtered = filtered.filter(p => p.locality.toLowerCase().includes(locality.toLowerCase()));
          return res.status(200).json({ success: true, count: filtered.length, properties: filtered, listings: filtered });
        }

        // Auto-seed if database is empty so initial deployment has data
        const count = await Listing.countDocuments();
        if (count === 0 && INITIAL_PROPERTIES.length > 0) {
          try {
            await Listing.insertMany(INITIAL_PROPERTIES as any[]);
          } catch (seedErr) {
            console.warn('Initial seeding error:', seedErr);
          }
        }

        const filter: Record<string, any> = {};

        if (city && city !== 'all') {
          filter.city = { $regex: new RegExp(`^${city}$`, 'i') };
        }

        if (locality && locality !== 'all') {
          filter.locality = { $regex: new RegExp(locality, 'i') };
        }

        const typeFilter = accommodationType || propertyType;
        if (typeFilter && typeFilter !== 'all') {
          filter.propertyType = typeFilter;
        }

        if (minRent || maxRent) {
          filter.monthlyRent = {};
          if (minRent) filter.monthlyRent.$gte = Number(minRent);
          if (maxRent) filter.monthlyRent.$lte = Number(maxRent);
        }

        if (amenities) {
          const list = Array.isArray(amenities) ? amenities : amenities.split(',');
          filter.amenities = { $all: list };
        }

        if (verifiedOnly === 'true') {
          filter.isVerified = true;
        }

        const pageNum = parseInt(page as string, 10) || 1;
        const limitNum = parseInt(limit as string, 10) || 50;
        const skip = (pageNum - 1) * limitNum;

        const [listings, totalCount] = await Promise.all([
          Listing.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
          Listing.countDocuments(filter),
        ]);

        return res.status(200).json({
          success: true,
          count: listings.length,
          total: totalCount,
          page: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          properties: listings,
          listings,
        });
      } catch (error: any) {
        console.error('Error in GET /api/listings:', error);
        return res.status(500).json({ success: false, message: error.message });
      }
    }

    case 'POST': {
      try {
        const body = req.body || (await parseBody(req));
        const {
          title,
          city,
          locality,
          monthlyRent,
          securityDeposit,
          propertyType,
          accommodationType,
          amenities,
          lister,
        } = body;

        if (!title || !city || !locality || !monthlyRent) {
          return res.status(400).json({
            success: false,
            message: 'Missing required listing fields: title, city, locality, monthlyRent.',
          });
        }

        const newListingData = {
          id: `prop-${Date.now()}`,
          title,
          propertyType: propertyType || accommodationType || 'private_room',
          city,
          locality,
          monthlyRent: Number(monthlyRent),
          securityDeposit: Number(securityDeposit || Number(monthlyRent) * 2),
          amenities: Array.isArray(amenities) ? amenities : [],
          images: body.images && body.images.length > 0 ? body.images : [
            'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
          ],
          furnishing: body.furnishing || 'Fully Furnished',
          genderEligibility: body.genderEligibility || 'Co-ed / Any',
          roomType: body.roomType || 'Single Room',
          sharingCapacity: body.sharingCapacity || 1,
          totalBedrooms: body.totalBedrooms || 2,
          totalBathrooms: body.totalBathrooms || 2,
          lister: lister || {
            id: 'current-user',
            name: 'Property Lister',
            role: 'Owner',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
            isVerified: true,
            verificationBadge: 'Verified Lister',
          },
          ...body,
        };

        if (conn) {
          const created = await Listing.create(newListingData);
          return res.status(201).json({
            success: true,
            message: 'Listing saved to MongoDB successfully',
            property: created,
            listing: created,
          });
        } else {
          return res.status(201).json({
            success: true,
            message: 'Listing created (in-memory mode)',
            property: newListingData,
            listing: newListingData,
          });
        }
      } catch (error: any) {
        console.error('Error in POST /api/listings:', error);
        return res.status(400).json({ success: false, message: error.message });
      }
    }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }
}
