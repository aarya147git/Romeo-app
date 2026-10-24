import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IHouseRules {
  curfew: string;
  food: string;
  smoking: string;
  visitors: string;
  alcoholRule?: string;
}

export interface IListing extends Document {
  id: string;
  title: string;
  description: string;
  propertyType: 'pg' | 'flat' | 'shared_room' | 'private_room';
  city: string;
  locality: string;
  approxAddress: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  images: string[];
  monthlyRent: number;
  securityDeposit: number;
  maintenanceCharges: number;
  brokerageFee: number;
  utilityCharges: {
    electricity: string;
    wifi: string;
    water: string;
    gasCooking: string;
  };
  roomType: 'Single Room' | 'Double Sharing' | 'Triple Sharing' | '1 BHK Flat' | '2 BHK Flat' | '3 BHK Flat';
  sharingCapacity: number;
  furnishing: 'Fully Furnished' | 'Semi Furnished' | 'Unfurnished';
  totalBedrooms: number;
  totalBathrooms: number;
  bathroomType: 'Attached' | 'Common' | 'Both Available';
  kitchenDetails: 'Fully Equipped Modular' | 'Shared Community Kitchen' | 'Meals Included' | 'Self Cook' | 'No Kitchen';
  amenities: string[];
  genderEligibility: 'Female Only' | 'Male Only' | 'Co-ed / Any';
  visitorPolicy: string;
  smokingRule: string;
  alcoholRule: string;
  curfew: string;
  foodRules: string;
  minimumStayMonths: number;
  noticePeriodMonths: number;
  availableFrom: string;
  lister: {
    id: string;
    name: string;
    role: 'Owner' | 'Current Tenant' | 'PG Manager' | 'Broker';
    avatar: string;
    isVerified: boolean;
    verificationBadge: string;
    contactNumber?: string;
  };
  isSaved?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HouseRulesSchema = new Schema(
  {
    curfew: { type: String, default: 'No Curfew' },
    food: { type: String, default: 'Non-Veg Allowed' },
    smoking: { type: String, default: 'Balcony/Outdoor Only' },
    visitors: { type: String, default: 'Allowed (Daytime & Overnight with notice)' },
    alcoholRule: { type: String, default: 'Allowed Moderately' },
  },
  { _id: false }
);

const ListingSchema = new Schema<IListing>(
  {
    id: { type: String, index: true },
    title: { type: String, required: [true, 'Listing title is required'], trim: true },
    description: { type: String, default: '' },
    propertyType: {
      type: String,
      enum: ['pg', 'flat', 'shared_room', 'private_room'],
      required: true,
      index: true,
    },
    city: { type: String, required: true, trim: true, index: true },
    locality: { type: String, required: true, trim: true, index: true },
    approxAddress: { type: String, default: '' },
    coordinates: {
      lat: { type: Number, default: 12.935 },
      lng: { type: Number, default: 77.62 },
    },
    images: [{ type: String }],
    monthlyRent: { type: Number, required: true, min: 0, index: true },
    securityDeposit: { type: Number, required: true, min: 0 },
    maintenanceCharges: { type: Number, default: 0 },
    brokerageFee: { type: Number, default: 0 },
    utilityCharges: {
      electricity: { type: String, default: 'Metered bill split equally' },
      wifi: { type: String, default: 'High-speed broadband included' },
      water: { type: String, default: '24/7 supply included' },
      gasCooking: { type: String, default: 'Modular kitchen gas pipeline' },
    },
    roomType: {
      type: String,
      enum: ['Single Room', 'Double Sharing', 'Triple Sharing', '1 BHK Flat', '2 BHK Flat', '3 BHK Flat'],
      default: 'Single Room',
    },
    sharingCapacity: { type: Number, default: 1 },
    furnishing: {
      type: String,
      enum: ['Fully Furnished', 'Semi Furnished', 'Unfurnished'],
      default: 'Fully Furnished',
    },
    totalBedrooms: { type: Number, default: 2 },
    totalBathrooms: { type: Number, default: 2 },
    bathroomType: {
      type: String,
      enum: ['Attached', 'Common', 'Both Available'],
      default: 'Attached',
    },
    kitchenDetails: {
      type: String,
      enum: ['Fully Equipped Modular', 'Shared Community Kitchen', 'Meals Included', 'Self Cook', 'No Kitchen'],
      default: 'Fully Equipped Modular',
    },
    amenities: [{ type: String, index: true }],
    genderEligibility: {
      type: String,
      enum: ['Female Only', 'Male Only', 'Co-ed / Any'],
      default: 'Co-ed / Any',
    },
    visitorPolicy: { type: String, default: 'Allowed (Daytime & Overnight with notice)' },
    smokingRule: { type: String, default: 'Balcony/Outdoor Only' },
    alcoholRule: { type: String, default: 'Allowed Moderately' },
    curfew: { type: String, default: 'No Curfew' },
    foodRules: { type: String, default: 'Non-Veg Allowed' },
    minimumStayMonths: { type: Number, default: 6 },
    noticePeriodMonths: { type: Number, default: 1 },
    availableFrom: { type: String, default: 'Immediately' },
    lister: {
      id: { type: String, default: 'current-user' },
      name: { type: String, required: true },
      role: { type: String, enum: ['Owner', 'Current Tenant', 'PG Manager', 'Broker'], default: 'Owner' },
      avatar: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80' },
      isVerified: { type: Boolean, default: true },
      verificationBadge: { type: String, default: 'Verified Lister' },
      contactNumber: { type: String },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        if (!ret.id && ret._id) ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

ListingSchema.index({ city: 1, locality: 1, monthlyRent: 1 });

export const Listing: Model<IListing> = mongoose.models.Listing || mongoose.model<IListing>('Listing', ListingSchema);
