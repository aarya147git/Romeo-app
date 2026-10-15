export type AccommodationType = 'pg' | 'flat' | 'private_room' | 'shared_room' | 'has_flat_needs_roommate';
export type UserRole = 'student' | 'professional' | 'entrepreneur' | 'freelancer' | 'other';
export type Gender = 'male' | 'female' | 'non-binary' | 'other';
export type RoommateGenderPref = 'any' | 'same_gender' | 'female_only' | 'male_only';
export type SmokingHabit = 'non_smoker' | 'occasional' | 'regular' | 'flexible';
export type DrinkingHabit = 'non_drinker' | 'social' | 'regular' | 'flexible';
export type FoodPreference = 'vegetarian' | 'non_vegetarian' | 'eggetarian' | 'vegan' | 'no_preference';
export type SleepSchedule = 'early_bird' | 'night_owl' | 'flexible';
export type CleanlinessLevel = 'relaxed' | 'moderate' | 'spotless';
export type SocialLifestyle = 'quiet_private' | 'balanced' | 'social_outgoing';
export type GuestPolicy = 'rarely' | 'weekends_only' | 'open_with_notice' | 'frequent';
export type WfhFrequency = 'remote' | 'hybrid' | 'in_office' | 'college_classes';
export type PetsPolicy = 'has_pets' | 'comfortable_with_pets' | 'no_pets';

export interface LifestylePreferences {
  smoking: SmokingHabit;
  drinking: DrinkingHabit;
  foodDiet: FoodPreference;
  sleepSchedule: SleepSchedule;
  sleepTiming: string; // e.g. "11 PM - 7 AM"
  cleanliness: CleanlinessLevel;
  socialVibe: SocialLifestyle;
  guestPolicy: GuestPolicy;
  wfhStatus: WfhFrequency;
  pets: PetsPolicy;
  acPreference: 'must_have' | 'preferred' | 'neutral';
  furnishingPref: 'fully_furnished' | 'semi_furnished' | 'unfurnished';
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  avatar: string;
  email: string;
  phone?: string;
  bio: string;
  role: UserRole;
  institution: string; // College or Company
  occupationTitle: string; // Course/Degree or Job Role
  city: string;
  preferredLocalities: string[];
  budgetMin: number; // in INR
  budgetMax: number; // in INR
  preferredMoveInDate: string;
  preferredAccommodation: AccommodationType;
  preferredRoommateGender: RoommateGenderPref;
  leaseDuration: string; // '3-6 months' | '6-12 months' | '1 year+'
  lifestyle: LifestylePreferences;
  contactVisibility: 'in_app_only' | 'after_connection' | 'public';
  isVerified: boolean;
  verificationBadge?: 'Student ID Verified' | 'Work Email Verified' | 'Govt ID Verified' | 'Pending Verification';
  hasPlaceToShare?: boolean;
  sharedPropertyId?: string;
  createdAt: string;
}

export interface PropertyListing {
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
  visitorPolicy: 'Allowed (Daytime & Overnight with notice)' | 'Daytime Only' | 'No Visitors' | 'No Restrictions';
  smokingRule: 'Strictly Prohibited' | 'Balcony/Outdoor Only' | 'Allowed';
  alcoholRule: 'Strictly Prohibited' | 'Allowed Moderately' | 'Allowed';
  curfew: 'No Curfew' | 'Gate closes at 11:00 PM' | 'Gate closes at 10:30 PM' | 'Entry log after 12:00 AM';
  foodRules: 'Veg Only' | 'Non-Veg Allowed' | 'All Meals Provided (3 times/day)' | 'Breakfast & Dinner Provided' | 'No Meal Provided';
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
  createdAt: string;
}

export interface CompatibilityBreakdown {
  overallScore: number;
  sharedTraits: string[];
  differences: string[];
  categoryScores: {
    budget: number; // 0-100
    location: number;
    lifestyle: number;
    schedule: number;
    habits: number;
  };
}

export interface ConnectionRequest {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  senderAvatar: string;
  receiverName: string;
  receiverAvatar: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  propertyId?: string;
  propertyTitle?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  sharedProperty?: {
    id: string;
    title: string;
    rent: number;
    locality: string;
    image: string;
  };
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'property' | 'user' | 'message';
  targetId: string;
  targetTitle: string;
  reason: 'Scam or Fraud' | 'Harassment' | 'Discriminatory Listing' | 'Inaccurate Details or Photos' | 'Misleading Pricing' | 'Inappropriate Content';
  details: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
}

export type ActiveTab = 'explore_rooms' | 'explore_roommates' | 'saved' | 'messages' | 'list_property' | 'safety' | 'admin' | 'profile';
