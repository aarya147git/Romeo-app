import React, { useState } from 'react';
import {
  X,
  MapPin,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Clock,
  Sparkles,
  Columns,
  Share2,
  DollarSign,
  Info,
  Check,
  Send,
  Building,
  Flag,
  FileText
} from 'lucide-react';
import { PropertyListing, UserProfile } from '../types';
import { api } from '../services/api';

interface PropertyDetailModalProps {
  property: PropertyListing;
  onClose: () => void;
  onToggleSave: (id: string) => void;
  isSaved: boolean;
  onToggleCompare: (property: PropertyListing) => void;
  isComparing: boolean;
  onContactLister: (property: PropertyListing) => void;
  onReportProperty: (property: PropertyListing) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onToggleSave,
  isSaved,
  onToggleCompare,
  isComparing,
  onContactLister,
  onReportProperty,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [budgetPlan, setBudgetPlan] = useState<any | null>(null);
  const [loadingBudget, setLoadingBudget] = useState(false);

  const totalMonthlyCost = property.monthlyRent + property.maintenanceCharges;
  const totalUpfrontMoveIn = property.monthlyRent + property.securityDeposit + property.maintenanceCharges + property.brokerageFee;

  const handleGenerateSummary = async () => {
    setLoadingSummary(true);
    try {
      const summary = await api.summarizeListing(property);
      setAiSummary(summary);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleCalculateBudget = async () => {
    setLoadingBudget(true);
    try {
      const plan = await api.getBudgetPlan({
        monthlyRent: property.monthlyRent,
        maintenance: property.maintenanceCharges,
        securityDeposit: property.securityDeposit,
        city: property.city,
        roomType: property.roomType,
      });
      setBudgetPlan(plan);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBudget(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white/95 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2 truncate pr-4">
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-stone-100 text-stone-800">
              {property.roomType}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-violet-100 text-violet-800">
              {property.genderEligibility}
            </span>
            <span className="text-xs text-stone-500 truncate hidden sm:inline">
              • {property.locality}, {property.city}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleCompare(property)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                isComparing
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
              title={isComparing ? 'Remove from compare' : 'Compare property'}
            >
              <Columns className="w-4 h-4" />
              <span className="hidden sm:inline">{isComparing ? 'Comparing' : 'Compare'}</span>
            </button>

            <button
              onClick={() => onToggleSave(property.id)}
              className={`p-2 rounded-xl border transition-all ${
                isSaved
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save property'}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Photo Gallery */}
          <div className="space-y-3">
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-stone-100">
              <img
                src={property.images[activePhotoIdx] || property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-lg backdrop-blur-xs font-semibold">
                Photo {activePhotoIdx + 1} of {property.images.length}
              </div>
            </div>

            {property.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activePhotoIdx === idx ? 'border-violet-600 ring-2 ring-violet-200' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title and Address */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight leading-tight">
              {property.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-stone-600">
              <span className="flex items-center gap-1 font-semibold text-stone-800">
                <MapPin className="w-4 h-4 text-rose-500" />
                {property.approxAddress}
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-xs text-stone-500">
                Approximate map location for safety & privacy
              </span>
            </div>
          </div>

          {/* Transparent Fee & Cost Breakdown Card (Critical Requirement) */}
          <div className="bg-gradient-to-br from-stone-50 to-violet-50/40 rounded-2xl p-5 border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-stone-900 text-base">
                  100% Transparent Cost Breakdown
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                No Hidden Restrictions
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-xs">
                <div className="text-[11px] text-stone-500 font-bold uppercase">Monthly Rent</div>
                <div className="text-xl font-extrabold text-stone-900 mt-0.5">
                  ₹{property.monthlyRent.toLocaleString()}
                </div>
                <div className="text-[10px] text-stone-400">Fixed monthly cost</div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-xs">
                <div className="text-[11px] text-stone-500 font-bold uppercase">Security Deposit</div>
                <div className="text-xl font-extrabold text-violet-700 mt-0.5">
                  ₹{property.securityDeposit.toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">100% Refundable</div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-xs">
                <div className="text-[11px] text-stone-500 font-bold uppercase">Maintenance</div>
                <div className="text-xl font-extrabold text-stone-900 mt-0.5">
                  ₹{property.maintenanceCharges.toLocaleString()}
                </div>
                <div className="text-[10px] text-stone-400">{property.maintenanceCharges === 0 ? 'Included' : '/month'}</div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-xs">
                <div className="text-[11px] text-stone-500 font-bold uppercase">Brokerage Fee</div>
                <div className="text-xl font-extrabold text-emerald-600 mt-0.5">
                  {property.brokerageFee === 0 ? '₹0 FREE' : `₹${property.brokerageFee.toLocaleString()}`}
                </div>
                <div className="text-[10px] text-stone-400">Direct from lister</div>
              </div>
            </div>

            {/* Upfront Total Highlight */}
            <div className="mt-4 pt-3 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-stone-500">Upfront Capital to Move-in (Rent + Deposit + Maintenance):</span>
                <span className="block sm:inline font-extrabold text-stone-900 text-sm sm:ml-2">
                  ₹{totalUpfrontMoveIn.toLocaleString()}
                </span>
              </div>
              <div className="space-y-0.5 text-right sm:text-left">
                <span className="text-stone-500">Ongoing Monthly Outflow:</span>
                <span className="font-extrabold text-violet-700 text-sm sm:ml-2">
                  ₹{totalMonthlyCost.toLocaleString()}/month
                </span>
              </div>
            </div>

            {/* Utilities Breakdown */}
            <div className="mt-3.5 pt-3 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600">
              <p>• <strong className="text-stone-800">Electricity:</strong> {property.utilityCharges.electricity}</p>
              <p>• <strong className="text-stone-800">Wi-Fi:</strong> {property.utilityCharges.wifi}</p>
              <p>• <strong className="text-stone-800">Water:</strong> {property.utilityCharges.water}</p>
              <p>• <strong className="text-stone-800">Cooking Gas:</strong> {property.utilityCharges.gasCooking}</p>
            </div>
          </div>

          {/* AI Assistants Trigger Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleGenerateSummary}
              disabled={loadingSummary}
              className="p-3.5 bg-violet-50 hover:bg-violet-100/80 border border-violet-200 text-violet-900 rounded-2xl text-left transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-violet-600 animate-pulse" />
                <div>
                  <div className="text-xs font-bold">Gemini Listing Summarizer</div>
                  <div className="text-[11px] text-violet-700">Get 10-second pros, cons & rule highlights</div>
                </div>
              </div>
              <span className="text-xs font-bold text-violet-700 bg-white px-2 py-1 rounded-lg shadow-2xs">
                {loadingSummary ? 'Analyzing...' : 'Summarize'}
              </span>
            </button>

            <button
              onClick={handleCalculateBudget}
              disabled={loadingBudget}
              className="p-3.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 rounded-2xl text-left transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold">Total Living Cost Estimator</div>
                  <div className="text-[11px] text-emerald-700">Calculate utilities + groceries + commute</div>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-1 rounded-lg shadow-2xs">
                {loadingBudget ? 'Calculating...' : 'Estimate'}
              </span>
            </button>
          </div>

          {/* AI Summary Box */}
          {aiSummary && (
            <div className="p-4 bg-stone-900 text-stone-100 rounded-2xl text-xs space-y-2 border border-stone-800 animate-in fade-in">
              <div className="flex items-center justify-between text-violet-400 font-bold">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Listing Summary</span>
                </div>
                <button onClick={() => setAiSummary(null)} className="text-stone-400 hover:text-white">✕</button>
              </div>
              <div className="whitespace-pre-line text-stone-200 leading-relaxed font-sans">
                {aiSummary}
              </div>
            </div>
          )}

          {/* Budget Breakdown Result Box */}
          {budgetPlan && (
            <div className="p-4 bg-emerald-950 text-emerald-50 rounded-2xl text-xs space-y-3 border border-emerald-900 animate-in fade-in">
              <div className="flex items-center justify-between font-bold text-emerald-300">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  <span>Estimated Total Monthly Cost of Living: ₹{budgetPlan.monthlyTotal?.toLocaleString()}/mo</span>
                </div>
                <button onClick={() => setBudgetPlan(null)} className="text-emerald-400 hover:text-white">✕</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-emerald-900/60 p-2 rounded-lg">
                  <span className="text-emerald-300">Rent + Maint:</span>
                  <p className="font-bold">₹{property.monthlyRent + property.maintenanceCharges}</p>
                </div>
                <div className="bg-emerald-900/60 p-2 rounded-lg">
                  <span className="text-emerald-300">Electricity & Wi-Fi:</span>
                  <p className="font-bold">~₹{budgetPlan.breakdown?.estimatedElectricityAndWifi}</p>
                </div>
                <div className="bg-emerald-900/60 p-2 rounded-lg">
                  <span className="text-emerald-300">Food & Groceries:</span>
                  <p className="font-bold">~₹{budgetPlan.breakdown?.estimatedFoodAndGroceries}</p>
                </div>
                <div className="bg-emerald-900/60 p-2 rounded-lg">
                  <span className="text-emerald-300">Local Commute:</span>
                  <p className="font-bold">~₹{budgetPlan.breakdown?.estimatedLocalCommute}</p>
                </div>
              </div>
              <p className="text-[11px] text-emerald-200 italic">
                💡 {budgetPlan.financialTip}
              </p>
            </div>
          )}

          {/* Key Specifications Grid */}
          <div>
            <h3 className="font-bold text-stone-900 text-sm mb-3">Property Specifications</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                <span className="text-stone-400 font-semibold block">Furnishing</span>
                <span className="font-bold text-stone-800 text-sm">{property.furnishing}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                <span className="text-stone-400 font-semibold block">Bathrooms</span>
                <span className="font-bold text-stone-800 text-sm">{property.bathroomType}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                <span className="text-stone-400 font-semibold block">Kitchen Setup</span>
                <span className="font-bold text-stone-800 text-sm">{property.kitchenDetails}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                <span className="text-stone-400 font-semibold block">Min Stay / Notice</span>
                <span className="font-bold text-stone-800 text-sm">{property.minimumStayMonths} mo / {property.noticePeriodMonths} mo</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-bold text-stone-900 text-sm mb-2">About the Property</h3>
            <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* House Rules & Policies */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <h3 className="font-bold text-stone-900 text-sm mb-3">House Rules & Eligibility Policies</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="font-semibold text-stone-500">Curfew Policy:</span>{' '}
                <span className="font-bold text-stone-800">{property.curfew}</span>
              </div>
              <div>
                <span className="font-semibold text-stone-500">Visitor Policy:</span>{' '}
                <span className="font-bold text-stone-800">{property.visitorPolicy}</span>
              </div>
              <div>
                <span className="font-semibold text-stone-500">Smoking:</span>{' '}
                <span className="font-bold text-stone-800">{property.smokingRule}</span>
              </div>
              <div>
                <span className="font-semibold text-stone-500">Alcohol:</span>{' '}
                <span className="font-bold text-stone-800">{property.alcoholRule}</span>
              </div>
              <div>
                <span className="font-semibold text-stone-500">Food & Cooking:</span>{' '}
                <span className="font-bold text-stone-800">{property.foodRules}</span>
              </div>
              <div>
                <span className="font-semibold text-stone-500">Eligible Tenants:</span>{' '}
                <span className="font-bold text-stone-800">{property.genderEligibility}</span>
              </div>
            </div>
          </div>

          {/* Amenities Grid */}
          <div>
            <h3 className="font-bold text-stone-900 text-sm mb-3">Included Amenities & Facilities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {property.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200/70 text-stone-700">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lister Verification & Safety Card */}
          <div className="p-4 bg-white rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={property.lister.avatar}
                alt={property.lister.name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-stone-100"
              />
              <div>
                <div className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <span>{property.lister.name}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                    {property.lister.role}
                  </span>
                </div>
                <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                  <span>{property.lister.verificationBadge}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onReportProperty(property)}
              className="text-stone-400 hover:text-rose-600 text-xs font-semibold flex items-center gap-1 transition-colors self-start sm:self-center"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report Inaccurate Listing</span>
            </button>
          </div>
        </div>

        {/* Modal Sticky Footer / CTA */}
        <div className="p-4 sm:p-5 bg-white border-t border-stone-200 flex items-center justify-between gap-4 sticky bottom-0 z-20">
          <div>
            <div className="text-xs text-stone-400 font-bold uppercase">Total Monthly Rent</div>
            <div className="text-xl sm:text-2xl font-extrabold text-stone-900">
              ₹{property.monthlyRent.toLocaleString()}
              <span className="text-xs text-stone-500 font-normal"> /mo</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onContactLister(property)}
              className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-sm shadow-md shadow-violet-200 transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Contact Lister & Request Tour</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
