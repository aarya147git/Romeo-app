import React, { useState } from 'react';
import {
  X,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  DollarSign,
  Heart,
  Sliders,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { UserProfile, AccommodationType, UserRole, Gender, RoommateGenderPref } from '../types';
import { api } from '../services/api';

interface OnboardingModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  onProfileUpdated: (updated: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  currentUser,
  onClose,
  onProfileUpdated,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // Profile data
  const [name, setName] = useState(currentUser.name);
  const [age, setAge] = useState(currentUser.age || 23);
  const [gender, setGender] = useState<Gender>(currentUser.gender || 'male');
  const [prefGender, setPrefGender] = useState<RoommateGenderPref>(currentUser.preferredRoommateGender || 'any');
  const [city, setCity] = useState(currentUser.city || 'Bangalore');
  const [locality, setLocality] = useState(currentUser.preferredLocalities?.[0] || 'Koramangala');
  const [role, setRole] = useState<UserRole>(currentUser.role || 'professional');
  const [institution, setInstitution] = useState(currentUser.institution || 'Tech Park');
  const [occupationTitle, setOccupationTitle] = useState(currentUser.occupationTitle || 'Software Engineer');
  const [budgetMin, setBudgetMin] = useState(currentUser.budgetMin || 12000);
  const [budgetMax, setBudgetMax] = useState(currentUser.budgetMax || 22000);
  const [preferredMoveInDate, setPreferredMoveInDate] = useState(currentUser.preferredMoveInDate || '2026-11-01');
  const [preferredAccommodation, setPreferredAccommodation] = useState<AccommodationType>(
    currentUser.preferredAccommodation || 'flat'
  );
  const [contactVisibility, setContactVisibility] = useState<'in_app_only' | 'after_connection' | 'public'>(
    currentUser.contactVisibility || 'after_connection'
  );

  // Lifestyle Preferences
  const [smoking, setSmoking] = useState(currentUser.lifestyle?.smoking || 'non_smoker');
  const [drinking, setDrinking] = useState(currentUser.lifestyle?.drinking || 'social');
  const [foodDiet, setFoodDiet] = useState(currentUser.lifestyle?.foodDiet || 'non_vegetarian');
  const [sleepSchedule, setSleepSchedule] = useState(currentUser.lifestyle?.sleepSchedule || 'early_bird');
  const [sleepTiming, setSleepTiming] = useState(currentUser.lifestyle?.sleepTiming || '11:00 PM - 7:00 AM');
  const [cleanliness, setCleanliness] = useState(currentUser.lifestyle?.cleanliness || 'spotless');
  const [socialVibe, setSocialVibe] = useState(currentUser.lifestyle?.socialVibe || 'balanced');
  const [guestPolicy, setGuestPolicy] = useState(currentUser.lifestyle?.guestPolicy || 'open_with_notice');
  const [wfhStatus, setWfhStatus] = useState(currentUser.lifestyle?.wfhStatus || 'hybrid');
  const [pets, setPets] = useState(currentUser.lifestyle?.pets || 'comfortable_with_pets');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await api.updateUser(currentUser.id, {
        name,
        age,
        gender,
        preferredRoommateGender: prefGender,
        city,
        preferredLocalities: [locality],
        role,
        institution,
        occupationTitle,
        budgetMin,
        budgetMax,
        preferredMoveInDate,
        preferredAccommodation,
        contactVisibility,
        lifestyle: {
          ...currentUser.lifestyle,
          smoking,
          drinking,
          foodDiet,
          sleepSchedule,
          sleepTiming,
          cleanliness,
          socialVibe,
          guestPolicy,
          wfhStatus,
          pets,
        },
      });
      onProfileUpdated(updated);
    } catch (err) {
      console.error(err);
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
            <h2 className="font-extrabold text-stone-900 text-lg">Your Profile & Living Preferences</h2>
            <p className="text-xs text-stone-500">Step {step} of 3: {step === 1 ? 'Personal & Target Locality' : step === 2 ? 'Budget & Living Mode' : 'Lifestyle & Co-Living Habits'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-stone-100 h-1.5">
          <div
            className="bg-gradient-to-r from-violet-600 to-rose-500 h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Age (Must be 18+) *
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="99"
                    required
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Your Gender *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-Binary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Preferred Roommate Gender *
                  </label>
                  <select
                    value={prefGender}
                    onChange={(e) => setPrefGender(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900"
                  >
                    <option value="any">Any / Comfortable with all</option>
                    <option value="same_gender">Same Gender Only</option>
                    <option value="female_only">Female Only</option>
                    <option value="male_only">Male Only</option>
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900"
                  >
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi NCR</option>
                    <option value="Pune">Pune</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Target Locality / Sector *
                  </label>
                  <input
                    type="text"
                    required
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Koramangala, Powai"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Occupation Category
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900"
                  >
                    <option value="professional">Working Professional</option>
                    <option value="student">Student / Postgraduate</option>
                    <option value="freelancer">Freelancer / Creator</option>
                    <option value="entrepreneur">Entrepreneur / Founder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Organization / College Name
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. IIT Bombay, Swiggy, DU"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Job Role or Degree / Major
                </label>
                <input
                  type="text"
                  value={occupationTitle}
                  onChange={(e) => setOccupationTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer or MA Economics"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Min Budget (₹)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-bold text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Max Monthly Rent Budget (₹)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-bold text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Target Move-In Date
                  </label>
                  <input
                    type="date"
                    value={preferredMoveInDate}
                    onChange={(e) => setPreferredMoveInDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Current Accommodation Status
                  </label>
                  <select
                    value={preferredAccommodation}
                    onChange={(e) => setPreferredAccommodation(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900"
                  >
                    <option value="flat">Looking for a Flat</option>
                    <option value="pg">Looking for Coliving / PG</option>
                    <option value="private_room">Private Room in Flat</option>
                    <option value="shared_room">Shared Twin Room</option>
                    <option value="has_flat_needs_roommate">I Have a Flat (Need Roommate)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Contact Privacy Preference
                </label>
                <select
                  value={contactVisibility}
                  onChange={(e) => setContactVisibility(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900"
                >
                  <option value="after_connection">Share phone number only after mutual connection</option>
                  <option value="in_app_only">In-app messaging only (Keep phone private)</option>
                  <option value="public">Visible to all registered users</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Smoking Habit
                  </label>
                  <select
                    value={smoking}
                    onChange={(e) => setSmoking(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900"
                  >
                    <option value="non_smoker">Non-smoker</option>
                    <option value="flexible">Flexible / Outdoor only</option>
                    <option value="regular">Regular smoker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Drinking Habit
                  </label>
                  <select
                    value={drinking}
                    onChange={(e) => setDrinking(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900"
                  >
                    <option value="non_drinker">Non-drinker</option>
                    <option value="social">Social / Occasional drinker</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Food & Kitchen Diet
                  </label>
                  <select
                    value={foodDiet}
                    onChange={(e) => setFoodDiet(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900"
                  >
                    <option value="vegetarian">Vegetarian</option>
                    <option value="non_vegetarian">Non-Vegetarian</option>
                    <option value="eggetarian">Eggetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="no_preference">No Preference</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Cleanliness Standard
                  </label>
                  <select
                    value={cleanliness}
                    onChange={(e) => setCleanliness(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900"
                  >
                    <option value="spotless">Spotless & Very Tidy</option>
                    <option value="moderate">Moderate & Balanced</option>
                    <option value="relaxed">Relaxed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Sleep Routine
                  </label>
                  <select
                    value={sleepSchedule}
                    onChange={(e) => setSleepSchedule(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900"
                  >
                    <option value="early_bird">Early Bird (Early to bed & rise)</option>
                    <option value="night_owl">Night Owl (Late nights)</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Sleep Time Range
                  </label>
                  <input
                    type="text"
                    value={sleepTiming}
                    onChange={(e) => setSleepTiming(e.target.value)}
                    placeholder="e.g. 11 PM - 7 AM"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Social Vibe
                  </label>
                  <select
                    value={socialVibe}
                    onChange={(e) => setSocialVibe(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900"
                  >
                    <option value="balanced">Balanced</option>
                    <option value="quiet_private">Quiet & Peaceful</option>
                    <option value="social_outgoing">Social & Outgoing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Work / Study Setup
                  </label>
                  <select
                    value={wfhStatus}
                    onChange={(e) => setWfhStatus(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900"
                  >
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Fully Remote</option>
                    <option value="in_office">In-Office</option>
                    <option value="college_classes">College Classes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Pets
                  </label>
                  <select
                    value={pets}
                    onChange={(e) => setPets(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900"
                  >
                    <option value="comfortable_with_pets">Comfortable with Pets</option>
                    <option value="has_pets">Has Pets</option>
                    <option value="no_pets">No Pets (Allergies/pref)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Buttons */}
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

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((step + 1) as any)}
                className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-rose-500 hover:from-violet-700 hover:to-rose-600 text-white text-xs font-extrabold shadow-md shadow-violet-200 flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Saving Preferences...' : 'Save & Update Compatibility'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
