import React from 'react';
import { X, Check, Columns, MapPin, DollarSign, ShieldCheck } from 'lucide-react';
import { PropertyListing } from '../types';

interface ComparisonModalProps {
  compareList: PropertyListing[];
  onClose: () => void;
  onRemove: (propertyId: string) => void;
  onSelectProperty: (property: PropertyListing) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  compareList,
  onClose,
  onRemove,
  onSelectProperty,
}) => {
  if (compareList.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <Columns className="w-5 h-5 text-violet-600" />
            <h2 className="font-extrabold text-stone-900 text-lg">
              Side-by-Side Property Comparison ({compareList.length})
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto p-6 flex-1">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="p-3 w-40 text-stone-400 font-bold uppercase tracking-wider text-[11px]">
                  Feature
                </th>
                {compareList.map((prop) => (
                  <th key={prop.id} className="p-3 min-w-[240px] max-w-[280px]">
                    <div className="relative rounded-xl overflow-hidden h-32 mb-2 bg-stone-100">
                      <img src={prop.images[0]} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => onRemove(prop.id)}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white p-1 rounded-full text-xs"
                        title="Remove from comparison"
                      >
                        ✕
                      </button>
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm line-clamp-1">{prop.title}</h3>
                    <p className="text-stone-500 text-[11px] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      {prop.locality}, {prop.city}
                    </p>
                    <button
                      onClick={() => onSelectProperty(prop)}
                      className="mt-2 w-full py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg text-xs transition-colors"
                    >
                      View Details
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {/* Monthly Rent */}
              <tr className="bg-stone-50/50">
                <td className="p-3 font-bold text-stone-700">Monthly Rent</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-3 font-extrabold text-stone-900 text-base">
                    ₹{p.monthlyRent.toLocaleString()}<span className="text-xs font-normal text-stone-500">/mo</span>
                  </td>
                ))}
              </tr>

              {/* Security Deposit */}
              <tr>
                <td className="p-3 font-bold text-stone-700">Security Deposit</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-3 font-bold text-violet-700">
                    ₹{p.securityDeposit.toLocaleString()} (Refundable)
                  </td>
                ))}
              </tr>

              {/* Upfront Move-In Cost */}
              <tr className="bg-violet-50/40">
                <td className="p-3 font-bold text-violet-900">Total Upfront Move-In</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-3 font-extrabold text-violet-950 text-sm">
                    ₹{(p.monthlyRent + p.securityDeposit + p.maintenanceCharges + p.brokerageFee).toLocaleString()}
                  </td>
                ))}
              </tr>

              {/* Room & Sharing */}
              <tr>
                <td className="p-3 font-bold text-stone-700">Room Type</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-3 text-stone-800 font-semibold">
                    {p.roomType} ({p.sharingCapacity} person max)
                  </td>
                ))}
              </tr>

              {/* Furnishing */}
              <tr className="bg-stone-50/50">
                <td className="p-3 font-bold text-stone-700">Furnishing</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-3 text-stone-800">
                    {p.furnishing}
                  </td>
                ))}
              </tr>

              {/* Bathroom */}
              <tr>
                <td className="p-3 font-bold text-stone-700">Bathroom</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-3 text-stone-800">
                    {p.bathroomType}
                  </td>
                ))}
              </tr>

              {/* Gender Eligibility */}
              <tr className="bg-stone-50/50">
                <td className="p-3 font-bold text-stone-700">Gender Eligibility</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-3">
                    <span className="font-bold text-[11px] px-2 py-0.5 rounded bg-stone-200 text-stone-800">
                      {p.genderEligibility}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Curfew Policy */}
              <tr>
                <td className="p-3 font-bold text-stone-700">Curfew Policy</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-3 text-stone-800">
                    {p.curfew}
                  </td>
                ))}
              </tr>

              {/* Visitor Policy */}
              <tr className="bg-stone-50/50">
                <td className="p-3 font-bold text-stone-700">Visitor Policy</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-3 text-stone-800">
                    {p.visitorPolicy}
                  </td>
                ))}
              </tr>

              {/* Food & Cooking */}
              <tr>
                <td className="p-3 font-bold text-stone-700">Food & Meals</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-3 text-stone-800">
                    {p.foodRules} ({p.kitchenDetails})
                  </td>
                ))}
              </tr>

              {/* Smoking & Alcohol */}
              <tr className="bg-stone-50/50">
                <td className="p-3 font-bold text-stone-700">Smoking / Alcohol</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-3 text-stone-800">
                    {p.smokingRule} • {p.alcoholRule}
                  </td>
                ))}
              </tr>

              {/* Lister Verification */}
              <tr>
                <td className="p-3 font-bold text-stone-700">Lister Verification</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-3">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {p.lister.verificationBadge}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
