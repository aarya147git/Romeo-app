import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, CheckCircle2, Sparkles, Home } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallPromptProps {
  variant?: 'banner' | 'modal' | 'button';
  onDismiss?: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ variant = 'banner', onDismiss }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already installed, hide prompt
  if (isInstalled || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  // Button variant (for headers, profile or settings)
  if (variant === 'button') {
    if (isInstallable) {
      return (
        <button
          onClick={install}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-rose-500 hover:from-violet-700 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-violet-200 transition-all hover:scale-102 active:scale-98"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      );
    }

    return (
      <>
        <button
          onClick={() => setShowIOSModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-violet-200 bg-violet-50 text-violet-800 text-xs font-bold hover:bg-violet-100 transition-colors"
        >
          <Smartphone className="w-3.5 h-3.5 text-violet-600" />
          <span>Install on Phone</span>
        </button>

        {showIOSModal && (
          <IOSInstallModal onClose={() => setShowIOSModal(false)} isAndroid={isAndroid} />
        )}
      </>
    );
  }

  // Floating or In-page Banner variant
  return (
    <>
      <div className="bg-gradient-to-r from-stone-900 via-violet-950 to-stone-900 text-white px-4 py-3 sm:px-6 rounded-2xl shadow-xl border border-violet-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-violet-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-rose-500 flex items-center justify-center shrink-0 shadow-md">
            <Home className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-white text-sm">Install Romeo on Your Phone</h4>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-violet-500/30 text-violet-300">
                PWA
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-0.5">
              Full-screen experience, instant access from home screen, and fast roommate notifications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center relative z-10">
          {isInstallable ? (
            <button
              onClick={install}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-rose-500 hover:from-violet-600 hover:to-rose-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install Now</span>
            </button>
          ) : (
            <button
              onClick={() => setShowIOSModal(true)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs border border-white/20 transition-all flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-rose-400" />
              <span>How to Install</span>
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="p-1.5 text-stone-400 hover:text-stone-200 transition-colors"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showIOSModal && (
        <IOSInstallModal onClose={() => setShowIOSModal(false)} isAndroid={isAndroid} />
      )}
    </>
  );
};

interface IOSInstallModalProps {
  onClose: () => void;
  isAndroid: boolean;
}

const IOSInstallModal: React.FC<IOSInstallModalProps> = ({ onClose, isAndroid }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-rose-500 flex items-center justify-center text-white">
              <Home className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-stone-900 text-base">Install Romeo</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-stone-100 text-stone-500 hover:bg-stone-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isAndroid ? (
          <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
            <p className="font-bold text-stone-800">Install on Android (Chrome / Samsung Internet):</p>
            <div className="space-y-2 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <span>Tap the <strong>three dots menu (⋮)</strong> in Chrome or your browser.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <span>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <span>Confirm install. Romeo will open as a standalone app on your home screen!</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
            <p className="font-bold text-stone-800">Add to iPhone / iPad Home Screen via Safari:</p>
            <div className="space-y-2.5 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <div>
                  Tap the <strong className="text-stone-900">Share button</strong> (square with arrow up <Share className="w-3.5 h-3.5 inline text-blue-600" />) at the bottom of Safari.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <div>
                  Scroll down the share sheet and tap <strong className="text-stone-900">Add to Home Screen</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-stone-700" />).
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <div>
                  Tap <strong className="text-stone-900">Add</strong> in the top-right corner.
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-stone-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
