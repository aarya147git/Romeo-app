import mongoose, { Document, Model, Schema } from 'mongoose';

export type CityType = 'Bangalore' | 'Mumbai' | 'Delhi NCR' | 'Pune' | 'Hyderabad' | 'Chennai';
export type GenderType = 'male' | 'female' | 'non-binary' | 'other';
export type SleepScheduleType = 'early_bird' | 'night_owl' | 'flexible';
export type CleanlinessType = 'relaxed' | 'moderate' | 'spotless';
export type DietType = 'vegetarian' | 'non_vegetarian' | 'eggetarian' | 'vegan' | 'no_preference';
export type SmokingType = 'non_smoker' | 'occasional' | 'regular' | 'flexible';
export type SocialHabitsType = 'quiet_private' | 'balanced' | 'social_outgoing';

export interface ILifestyle {
  smoking: SmokingType;
  drinking: 'non_drinker' | 'social' | 'regular' | 'flexible';
  diet: DietType;
  sleepSchedule: SleepScheduleType;
  sleepTiming: string;
  cleanliness: CleanlinessType;
  socialHabits: SocialHabitsType;
  guestPolicy: 'rarely' | 'weekends_only' | 'open_with_notice' | 'frequent';
  wfhStatus: 'remote' | 'hybrid' | 'in_office' | 'college_classes';
  pets: 'has_pets' | 'comfortable_with_pets' | 'no_pets';
  acPreference?: 'must_have' | 'preferred' | 'neutral';
  furnishingPref?: 'fully_furnished' | 'semi_furnished' | 'unfurnished';
}

export interface IUser extends Document {
  id: string;
  name: string;
  age: number;
  gender: GenderType;
  avatar: string;
  email: string;
  phone?: string;
  bio: string;
  role: 'student' | 'professional' | 'entrepreneur' | 'freelancer' | 'other';
  institution?: string;
  occupationTitle?: string;
  city: CityType;
  preferredLocalities: string[];
  budgetMin: number;
  budgetMax: number;
  preferredMoveInDate?: string;
  preferredAccommodation: 'pg' | 'flat' | 'private_room' | 'shared_room';
  preferredRoommateGender: 'any' | 'same_gender' | 'female_only' | 'male_only';
  leaseDuration?: string;
  lifestyle: ILifestyle;
  contactVisibility: 'in_app_only' | 'after_connection' | 'public';
  isVerified: boolean;
  verificationBadge?: 'Student ID Verified' | 'Work Email Verified' | 'Govt ID Verified' | 'Pending Verification';
  hasPlaceToShare?: boolean;
  sharedPropertyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LifestyleSchema = new Schema<ILifestyle>(
  {
    smoking: { type: String, enum: ['non_smoker', 'occasional', 'regular', 'flexible'], default: 'non_smoker' },
    drinking: { type: String, enum: ['non_drinker', 'social', 'regular', 'flexible'], default: 'social' },
    diet: { type: String, enum: ['vegetarian', 'non_vegetarian', 'eggetarian', 'vegan', 'no_preference'], default: 'no_preference' },
    sleepSchedule: { type: String, enum: ['early_bird', 'night_owl', 'flexible'], default: 'flexible' },
    sleepTiming: { type: String, default: '11:30 PM - 7:30 AM' },
    cleanliness: { type: String, enum: ['relaxed', 'moderate', 'spotless'], default: 'moderate' },
    socialHabits: { type: String, enum: ['quiet_private', 'balanced', 'social_outgoing'], default: 'balanced' },
    guestPolicy: { type: String, enum: ['rarely', 'weekends_only', 'open_with_notice', 'frequent'], default: 'open_with_notice' },
    wfhStatus: { type: String, enum: ['remote', 'hybrid', 'in_office', 'college_classes'], default: 'hybrid' },
    pets: { type: String, enum: ['has_pets', 'comfortable_with_pets', 'no_pets'], default: 'comfortable_with_pets' },
    acPreference: { type: String, enum: ['must_have', 'preferred', 'neutral'], default: 'must_have' },
    furnishingPref: { type: String, enum: ['fully_furnished', 'semi_furnished', 'unfurnished'], default: 'fully_furnished' },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, index: true },
    name: { type: String, required: [true, 'Name is required'], trim: true },
    age: { type: Number, required: [true, 'Age is required'], min: 18, max: 99 },
    gender: { type: String, enum: ['male', 'female', 'non-binary', 'other'], required: true },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true },
    bio: { type: String, default: '' },
    role: { type: String, enum: ['student', 'professional', 'entrepreneur', 'freelancer', 'other'], default: 'professional' },
    institution: { type: String, default: '' },
    occupationTitle: { type: String, default: '' },
    city: {
      type: String,
      enum: ['Bangalore', 'Mumbai', 'Delhi NCR', 'Pune', 'Hyderabad', 'Chennai'],
      required: true,
      index: true,
    },
    preferredLocalities: [{ type: String, trim: true }],
    budgetMin: { type: Number, required: true, min: 0 },
    budgetMax: { type: Number, required: true, min: 0 },
    preferredMoveInDate: { type: String, default: '2026-11-01' },
    preferredAccommodation: {
      type: String,
      enum: ['pg', 'flat', 'private_room', 'shared_room', 'has_flat_needs_roommate'],
      default: 'flat',
    },
    preferredRoommateGender: {
      type: String,
      enum: ['any', 'same_gender', 'female_only', 'male_only'],
      default: 'any',
    },
    leaseDuration: { type: String, default: '1 year+' },
    lifestyle: { type: LifestyleSchema, default: () => ({}) },
    contactVisibility: {
      type: String,
      enum: ['in_app_only', 'after_connection', 'public'],
      default: 'after_connection',
    },
    isVerified: { type: Boolean, default: true },
    verificationBadge: {
      type: String,
      enum: ['Student ID Verified', 'Work Email Verified', 'Govt ID Verified', 'Pending Verification'],
      default: 'Govt ID Verified',
    },
    hasPlaceToShare: { type: Boolean, default: false },
    sharedPropertyId: { type: String },
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

UserSchema.index({ city: 1, budgetMin: 1, budgetMax: 1 });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
