import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X, Smartphone } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide prompt or show subtle "Installed PWA" badge
  if (isInstalled) {
    if (compact) return null;
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 text-xs font-semibold text-emerald-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        Installed on Home Screen
      </div>
    );
  }

  return (
    <>
      {isInstallable && (
        <button
          onClick={install}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-sky-500/20 hover:opacity-95 active:scale-[0.98] transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Install Winter Arc App
        </button>
      )}

      {/* For iOS Safari users where beforeinstallprompt does not trigger natively */}
      {(!isInstallable || isIOS) && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-sky-950/20 px-3.5 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-900/30 active:scale-[0.98] transition cursor-pointer ${
            compact ? 'text-[11px] py-1.5 px-3' : ''
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-sky-400" />
          Add to iPhone Home Screen
        </button>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-white bg-neutral-800/80 transition"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-950 border border-neutral-700 flex items-center justify-center shadow-inner">
                <span className="text-xl font-black text-sky-400">❄️</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Add to iPhone</h3>
                <p className="text-xs text-neutral-400">Full-screen native iPhone experience</p>
              </div>
            </div>

            <div className="space-y-3.5 my-5 text-xs text-neutral-300">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800/70">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-white">Step 1: Tap Share</span>
                  <p className="text-neutral-400 text-[11px] mt-0.5">
                    In Safari bottom navigation toolbar, tap the square Share button.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800/70">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-white">Step 2: Add to Home Screen</span>
                  <p className="text-neutral-400 text-[11px] mt-0.5">
                    Scroll down the options list and select <strong>&quot;Add to Home Screen&quot;</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800/70">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                  <span className="font-bold text-xs">✓</span>
                </div>
                <div>
                  <span className="font-semibold text-white">Step 3: Launch in Standalone</span>
                  <p className="text-neutral-400 text-[11px] mt-0.5">
                    Tap the icon on your home screen for edge-to-edge dark mode without Safari browser bars.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full rounded-2xl bg-white py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-neutral-200 transition"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
