import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  X,
  FileCheck,
  Eye,
  Lock,
  Flag,
  Sparkles,
  CheckCircle2,
  PhoneCall,
  Send
} from 'lucide-react';
import { api } from '../services/api';
import { UserProfile } from '../types';

interface SafetyCenterModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  initialReportTarget?: { type: 'property' | 'user' | 'message'; id: string; title: string };
}

export const SafetyCenterModal: React.FC<SafetyCenterModalProps> = ({
  currentUser,
  onClose,
  initialReportTarget,
}) => {
  const [activeTab, setActiveTab] = useState<'guidelines' | 'ai_checker' | 'report'>(
    initialReportTarget ? 'report' : 'guidelines'
  );

  // AI Scam Checker State
  const [queryText, setQueryText] = useState('');
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  // Report Form State
  const [reportType, setReportType] = useState<'property' | 'user' | 'message'>(
    initialReportTarget?.type || 'property'
  );
  const [targetTitle, setTargetTitle] = useState(initialReportTarget?.title || '');
  const [targetId, setTargetId] = useState(initialReportTarget?.id || '');
  const [reason, setReason] = useState<any>('Scam or Fraud');
  const [details, setDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);

  const handleRunAiCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) return;

    setLoadingAdvice(true);
    try {
      const advice = await api.getSafetyAdvice({
        propertyTitle: queryText,
        rent: 15000,
        city: currentUser.city,
      });
      setAiAdvice(advice);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAdvice(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;

    setSubmittingReport(true);
    try {
      await api.submitReport({
        reporterId: currentUser.id,
        reporterName: currentUser.name,
        targetType: reportType,
        targetId: targetId || 'flagged-item',
        targetTitle: targetTitle || 'Reported Item',
        reason,
        details,
      });
      setReportSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="font-extrabold text-stone-900 text-lg">Romeo Trust & Safety Centre</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex gap-2">
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'guidelines'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Safety Guidelines
          </button>
          <button
            onClick={() => setActiveTab('ai_checker')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ai_checker'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>AI Scam Advisor</span>
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'report'
                ? 'bg-white text-rose-700 shadow-xs border border-rose-200'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report Incident</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-xs sm:text-sm">
          {activeTab === 'guidelines' && (
            <div className="space-y-6">
              {/* Mandatory 18+ & Fair Housing */}
              <div className="p-4 bg-violet-50 rounded-2xl border border-violet-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-violet-900 text-sm">18+ Community & Fair Living Policy</h4>
                  <p className="text-violet-800 text-xs leading-relaxed">
                    Romeo is strictly restricted to adults aged 18 and older. We do not use gender, occupation, or personal background to judge a person's worth. Roommate preferences reflect transparent lifestyle choices (sleep, cleanliness, smoking, quietness) to foster genuine harmony.
                  </p>
                </div>
              </div>

              {/* 4 Pillars of Rental Safety */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>1. Zero Upfront Token Fees</span>
                  </div>
                  <p className="text-stone-600 text-xs leading-relaxed">
                    NEVER pay a "gate pass fee", "QR code verification token", or advance deposit before inspecting the room in person. Legitimate listers never ask for payment before viewing.
                  </p>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                    <Eye className="w-4 h-4" />
                    <span>2. Daylight Physical Viewing</span>
                  </div>
                  <p className="text-stone-600 text-xs leading-relaxed">
                    Always schedule your first visit during daytime. Test the shower water pressure, check cellular network signals inside the bedroom, and ask neighbors about society power cuts.
                  </p>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                    <FileCheck className="w-4 h-4" />
                    <span>3. 11-Month Rental Agreement</span>
                  </div>
                  <p className="text-stone-600 text-xs leading-relaxed">
                    Never rely on verbal agreements. Always sign an agreement specifying the exact refundable security deposit, 1-month notice period, and fair painting deduction clauses.
                  </p>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                    <Lock className="w-4 h-4" />
                    <span>4. Protected Privacy</span>
                  </div>
                  <p className="text-stone-600 text-xs leading-relaxed">
                    Romeo masks full phone numbers and exact flat numbers until mutual connection. Keep conversations on Romeo chat until you feel confident and ready.
                  </p>
                </div>
              </div>

              {/* Verified Badges Legend */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <h4 className="font-bold text-stone-900 text-sm">How Romeo Verifications Work</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-stone-200">
                    <strong className="text-emerald-700 block">Student ID Verified</strong>
                    <span className="text-stone-500 text-[11px]">Valid university enrollment ID or college email domain confirmed.</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-stone-200">
                    <strong className="text-violet-700 block">Work Email Verified</strong>
                    <span className="text-stone-500 text-[11px]">Corporate email verification (@swiggy.com, @microsoft.com, etc.).</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-stone-200">
                    <strong className="text-blue-700 block">Govt Title / Deed Verified</strong>
                    <span className="text-stone-500 text-[11px]">Property ownership title deed or police verified PG manager license.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai_checker' && (
            <div className="space-y-4">
              <div className="p-3 bg-violet-50 rounded-xl text-xs text-violet-900 font-medium">
                💡 Paste any suspicious message, landlord demand, or listing scenario below. Romeo's AI Safety Advisor will instantly analyze red flags.
              </div>

              <form onSubmit={handleRunAiCheck} className="space-y-3">
                <textarea
                  rows={4}
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder="e.g. 'The landlord says he is in the army and cannot meet, but will courier the flat keys once I pay a ₹5,000 visiting pass on GPay.'"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  type="submit"
                  disabled={loadingAdvice || !queryText.trim()}
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loadingAdvice ? 'Analyzing Safety Checks...' : 'Check Red Flags with Gemini'}</span>
                </button>
              </form>

              {aiAdvice && (
                <div className="p-4 bg-stone-900 text-stone-100 rounded-2xl text-xs space-y-2 border border-stone-800 animate-in fade-in">
                  <div className="flex items-center justify-between text-violet-400 font-bold">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Gemini Safety Assessment</span>
                    </div>
                  </div>
                  <div className="whitespace-pre-line text-stone-200 leading-relaxed font-sans">
                    {aiAdvice}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'report' && (
            <div className="space-y-4">
              {reportSubmitted ? (
                <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="font-extrabold text-emerald-950 text-base">Report Submitted Successfully</h3>
                  <p className="text-xs text-emerald-800 max-w-md mx-auto">
                    Thank you for keeping Romeo safe. Our moderation team reviews flagged listings within 2 hours. If a scam is confirmed, the listing is permanently delisted.
                  </p>
                  <button
                    onClick={() => {
                      setReportSubmitted(false);
                      setDetails('');
                    }}
                    className="mt-3 px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl"
                  >
                    Submit Another Report
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} className="space-y-4">
                  <div className="p-3 bg-rose-50 rounded-xl text-xs text-rose-900 font-medium">
                    ⚠️ We take all reports seriously. False claims or harassment are violations of our Community Guidelines.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Report Target Type
                      </label>
                      <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value as any)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                      >
                        <option value="property">Property Listing</option>
                        <option value="user">User / Roommate Profile</option>
                        <option value="message">Inappropriate Message / Chat</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Reason for Report *
                      </label>
                      <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value as any)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                      >
                        <option value="Scam or Fraud">Scam or Advance Fee Demand</option>
                        <option value="Inaccurate Details or Photos">Inaccurate Photos / Condition</option>
                        <option value="Discriminatory Listing">Discriminatory / Unlawful Practice</option>
                        <option value="Misleading Pricing">Misleading / Hidden Extra Charges</option>
                        <option value="Harassment">Harassment or Offensive Behavior</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Title or Identifier of Listing / User
                    </label>
                    <input
                      type="text"
                      value={targetTitle}
                      onChange={(e) => setTargetTitle(e.target.value)}
                      placeholder="e.g. 2BHK Koramangala or User Rohan"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Detailed Explanation *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="Please describe specifically what occurred (e.g. UPI ID asked, abusive messages, discrepancy in security deposit)..."
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReport || !details.trim()}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Flag className="w-4 h-4" />
                    <span>{submittingReport ? 'Submitting to Moderation...' : 'Submit Confidential Report'}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
