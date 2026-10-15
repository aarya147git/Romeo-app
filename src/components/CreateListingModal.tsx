import React, { useState } from 'react';
import {
  X,
  Building,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Image,
  Info,
  Check,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { PropertyListing, UserProfile } from '../types';
import { api } from '../services/api';

interface CreateListingModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  onListingCreated: (listing: PropertyListing) => void;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  currentUser,
  onClose,
  onListingCreated,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState<'pg' | 'flat' | 'private_room' | 'shared_room'>('private_room');
  const [roomType, setRoomType] = useState<'Single Room' | 'Double Sharing' | 'Triple Sharing' | '1 BHK Flat' | '2 BHK Flat' | '3 BHK Flat'>('Single Room');
  const [city, setCity] = useState('Bangalore');
  const [locality, setLocality] = useState('');
  const [approxAddress, setApproxAddress] = useState('');

  // Financials
  const [monthlyRent, setMonthlyRent] = useState<number>(15000);
  const [securityDeposit, setSecurityDeposit] = useState<number>(30000);
  const [maintenanceCharges, setMaintenanceCharges] = useState<number>(1000);
  const [brokerageFee, setBrokerageFee] = useState<number>(0);
  const [electricityInfo, setElectricityInfo] = useState('Split equally per monthly meter bill');
  const [wifiInfo, setWifiInfo] = useState('High-speed broadband included in rent');
  const [waterInfo, setWaterInfo] = useState('24/7 municipal/borewell water included');

  // Specs & Amenities
  const [furnishing, setFurnishing] = useState<'Fully Furnished' | 'Semi Furnished' | 'Unfurnished'>('Fully Furnished');
  const [bathroomType, setBathroomType] = useState<'Attached' | 'Common' | 'Both Available'>('Attached');
  const [kitchenDetails, setKitchenDetails] = useState<'Fully Equipped Modular' | 'Shared Community Kitchen' | 'Meals Included' | 'Self Cook' | 'No Kitchen'>('Fully Equipped Modular');
  const [amenities, setAmenities] = useState<string[]>([
    'Air Conditioning',
    'High-Speed Wi-Fi',
    'Power Backup',
    'Washing Machine',
    'Refrigerator',
    '24/7 Security & CCTV',
  ]);

  // Rules & Policies
  const [genderEligibility, setGenderEligibility] = useState<'Female Only' | 'Male Only' | 'Co-ed / Any'>('Co-ed / Any');
  const [visitorPolicy, setVisitorPolicy] = useState<'Allowed (Daytime & Overnight with notice)' | 'Daytime Only' | 'No Visitors' | 'No Restrictions'>('Allowed (Daytime & Overnight with notice)');
  const [smokingRule, setSmokingRule] = useState<'Strictly Prohibited' | 'Balcony/Outdoor Only' | 'Allowed'>('Balcony/Outdoor Only');
  const [alcoholRule, setAlcoholRule] = useState<'Strictly Prohibited' | 'Allowed Moderately' | 'Allowed'>('Allowed Moderately');
  const [curfew, setCurfew] = useState<'No Curfew' | 'Gate closes at 11:00 PM' | 'Gate closes at 10:30 PM' | 'Entry log after 12:00 AM'>('No Curfew');
  const [foodRules, setFoodRules] = useState<'Veg Only' | 'Non-Veg Allowed' | 'All Meals Provided (3 times/day)' | 'Breakfast & Dinner Provided' | 'No Meal Provided'>('Non-Veg Allowed');
  const [minimumStayMonths, setMinimumStayMonths] = useState(6);
  const [noticePeriodMonths, setNoticePeriodMonths] = useState(1);
  const [availableFrom, setAvailableFrom] = useState('2026-11-01');
  const [listerRole, setListerRole] = useState<'Owner' | 'Current Tenant' | 'PG Manager' | 'Broker'>('Current Tenant');

  // Images presets
  const [selectedImage, setSelectedImage] = useState(
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80'
  );

  const availableImagePresets = [
    { label: 'Modern Master Bedroom', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Sunlit Living Room', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Luxury Studio Apartment', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Cozy PG Double Room', url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Aesthetic Minimalist Flat', url: 'https://images.unsplash.com/photo-1502005229762-ee1b2da97a0f?auto=format&fit=crop&w=1200&q=80' }
  ];

  const toggleAmenity = (name: string) => {
    if (amenities.includes(name)) {
      setAmenities(amenities.filter((a) => a !== name));
    } else {
      setAmenities([...amenities, name]);
    }
  };

  const upfrontCost = monthlyRent + securityDeposit + maintenanceCharges + brokerageFee;

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!title.trim() || !locality.trim()) {
      setFormError('Please fill in both a property title and locality area before publishing.');
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const newListing = await api.createProperty({
        title,
        description: description || `Well-maintained ${roomType} located in ${locality}, ${city}. Includes ${amenities.slice(0, 3).join(', ')}.`,
        propertyType,
        roomType,
        city,
        locality,
        approxAddress: approxAddress || `Near major junction, ${locality}, ${city}`,
        images: [selectedImage],
        monthlyRent,
        securityDeposit,
        maintenanceCharges,
        brokerageFee,
        utilityCharges: {
          electricity: electricityInfo,
          wifi: wifiInfo,
          water: waterInfo,
          gasCooking: 'Modular kitchen gas connection'
        },
        furnishing,
        bathroomType,
        kitchenDetails,
        amenities,
        genderEligibility,
        visitorPolicy,
        smokingRule,
        alcoholRule,
        curfew,
        foodRules,
        minimumStayMonths,
        noticePeriodMonths,
        availableFrom,
        lister: {
          id: currentUser.id,
          name: currentUser.name,
          role: listerRole,
          avatar: currentUser.avatar,
          isVerified: currentUser.isVerified,
          verificationBadge: currentUser.verificationBadge || 'Verified Lister',
          contactNumber: currentUser.phone
        }
      });

      onListingCreated(newListing);
    } catch (err) {
      console.error('Failed to create listing:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white sticky top-0 z-20">
          <div>
            <h2 className="font-extrabold text-stone-900 text-lg">List Your Space on Romeo</h2>
            <p className="text-xs text-stone-500">Step {step} of 4: {step === 1 ? 'Basic Info' : step === 2 ? 'Pricing & Utilities' : step === 3 ? 'Amenities & Setup' : 'House Rules & Finalize'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-stone-100 h-1.5">
          <div
            className="bg-gradient-to-r from-violet-600 to-rose-500 h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {formError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center justify-between">
              <span>{formError}</span>
              <button type="button" onClick={() => setFormError(null)} className="font-bold ml-2">✕</button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Listing Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Spacious Private Bedroom in Koramangala 3BHK Flat"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Property Category
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="private_room">Private Room in Flat</option>
                    <option value="pg">Coliving / PG</option>
                    <option value="flat">Independent Entire Flat</option>
                    <option value="shared_room">Shared / Twin Room</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Room Configuration
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="Single Room">Single Room</option>
                    <option value="Double Sharing">Double Sharing</option>
                    <option value="Triple Sharing">Triple Sharing</option>
                    <option value="1 BHK Flat">1 BHK Flat</option>
                    <option value="2 BHK Flat">2 BHK Flat</option>
                    <option value="3 BHK Flat">3 BHK Flat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    City *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi NCR</option>
                    <option value="Pune">Pune</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Locality / Sector *
                  </label>
                  <input
                    type="text"
                    required
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Koramangala 4th Block, Powai Lake"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Approximate Landmark / Address Hint
                </label>
                <input
                  type="text"
                  value={approxAddress}
                  onChange={(e) => setApproxAddress(e.target.value)}
                  placeholder="e.g. 5 mins from Sony World Junction (Exact flat withheld for safety)"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  🛡️ For safety, do not put your exact apartment number publicly.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the atmosphere, flatmates, ventilation, lighting, and community..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3 bg-violet-50 rounded-xl text-xs text-violet-900 font-medium">
                💡 Romeo enforces 100% price transparency. Clearly state all deposits and utility arrangements so tenants have zero surprises.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Monthly Rent (₹) *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    required
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Refundable Security Deposit (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Maintenance Charges (₹/mo)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={maintenanceCharges}
                    onChange={(e) => setMaintenanceCharges(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Brokerage Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={brokerageFee}
                    onChange={(e) => setBrokerageFee(Number(e.target.value))}
                    placeholder="0 for direct owner/roommate"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Live Fee Calculator */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                <div className="flex justify-between text-stone-600">
                  <span>Calculated Upfront Move-In Cost:</span>
                  <strong className="text-stone-900 text-sm">₹{upfrontCost.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between text-stone-500 text-[11px]">
                  <span>Ongoing Monthly Cost:</span>
                  <span>₹{(monthlyRent + maintenanceCharges).toLocaleString()}/month</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Electricity Billing Arrangement
                </label>
                <input
                  type="text"
                  value={electricityInfo}
                  onChange={(e) => setElectricityInfo(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Wi-Fi & Internet Setup
                </label>
                <input
                  type="text"
                  value={wifiInfo}
                  onChange={(e) => setWifiInfo(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Furnishing
                  </label>
                  <select
                    value={furnishing}
                    onChange={(e) => setFurnishing(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="Fully Furnished">Fully Furnished</option>
                    <option value="Semi Furnished">Semi Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Bathroom
                  </label>
                  <select
                    value={bathroomType}
                    onChange={(e) => setBathroomType(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="Attached">Attached Private</option>
                    <option value="Common">Common Shared</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Kitchen
                  </label>
                  <select
                    value={kitchenDetails}
                    onChange={(e) => setKitchenDetails(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="Fully Equipped Modular">Fully Equipped Modular</option>
                    <option value="Meals Included">Meals Included</option>
                    <option value="Shared Community Kitchen">Shared Community Kitchen</option>
                    <option value="Self Cook">Self Cook Setup</option>
                  </select>
                </div>
              </div>

              {/* Amenities Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Select Included Amenities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'Air Conditioning',
                    'High-Speed Wi-Fi',
                    'Power Backup',
                    'Washing Machine',
                    'Refrigerator',
                    'RO Water Purifier',
                    '24/7 Security & CCTV',
                    'Daily Housekeeping',
                    'Covered Bike Parking',
                    'Gym Access',
                    'Elevator / Lift',
                    'Balcony Garden',
                  ].map((amenity) => (
                    <button
                      type="button"
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                        amenities.includes(amenity)
                          ? 'bg-violet-50 border-violet-400 text-violet-900'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <span>{amenity}</span>
                      {amenities.includes(amenity) && <Check className="w-3.5 h-3.5 text-violet-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Presets */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Select Cover Photo
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableImagePresets.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setSelectedImage(preset.url)}
                      className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === preset.url ? 'border-violet-600 ring-2 ring-violet-200' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded truncate">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Gender Eligibility *
                  </label>
                  <select
                    value={genderEligibility}
                    onChange={(e) => setGenderEligibility(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="Co-ed / Any">Co-ed / Any Gender</option>
                    <option value="Female Only">Female Only</option>
                    <option value="Male Only">Male Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Your Lister Role
                  </label>
                  <select
                    value={listerRole}
                    onChange={(e) => setListerRole(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="Current Tenant">Current Tenant (Seeking Roommate)</option>
                    <option value="Owner">Direct Property Owner</option>
                    <option value="PG Manager">PG Manager / Operator</option>
                    <option value="Broker">Broker</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Curfew Policy
                  </label>
                  <select
                    value={curfew}
                    onChange={(e) => setCurfew(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="No Curfew">No Curfew</option>
                    <option value="Entry log after 12:00 AM">Entry log after 12:00 AM</option>
                    <option value="Gate closes at 11:00 PM">Gate closes at 11:00 PM</option>
                    <option value="Gate closes at 10:30 PM">Gate closes at 10:30 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Visitor Policy
                  </label>
                  <select
                    value={visitorPolicy}
                    onChange={(e) => setVisitorPolicy(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="Allowed (Daytime & Overnight with notice)">Allowed with Notice</option>
                    <option value="Daytime Only">Daytime Only</option>
                    <option value="No Restrictions">No Restrictions</option>
                    <option value="No Visitors">No Visitors</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Smoking Rule
                  </label>
                  <select
                    value={smokingRule}
                    onChange={(e) => setSmokingRule(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="Balcony/Outdoor Only">Balcony Only</option>
                    <option value="Strictly Prohibited">Strictly Prohibited</option>
                    <option value="Allowed">Allowed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Food Arrangement
                  </label>
                  <select
                    value={foodRules}
                    onChange={(e) => setFoodRules(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="Non-Veg Allowed">Non-Veg Allowed</option>
                    <option value="Veg Only">Veg Only</option>
                    <option value="All Meals Provided (3 times/day)">3 Meals Provided</option>
                    <option value="Breakfast & Dinner Provided">Breakfast & Dinner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Available From
                  </label>
                  <input
                    type="date"
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((step + 1) as any)}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-rose-500 hover:from-violet-700 hover:to-rose-600 text-white text-xs font-extrabold shadow-md shadow-violet-200 flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Publishing...' : 'Publish Verified Listing'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
