import React, { useState } from 'react';
import { X, Share2, Copy, Check, Globe, Users, Lock, Sparkles } from 'lucide-react';
import { Trip } from '../../types/dashboard';
import { Button } from '../ui/Button';

interface ShareTripModalProps {
  isOpen: boolean;
  trip: Trip | null;
  onClose: () => void;
}

export const ShareTripModal: React.FC<ShareTripModalProps> = ({
  isOpen,
  trip,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !trip) return null;

  const simulatedShareUrl = `${window.location.origin}/share/trip/${trip.id || 'globetrotter-demo'}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(simulatedShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-scaleUp"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-trip-title"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="share-trip-title" className="text-base font-bold font-display text-white">
                Share Trip Itinerary
              </h3>
              <p className="text-xs text-slate-300">
                {trip.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close share modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Feature Preview Notice */}
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-teal-900">
                Public Sharing Module Upcoming
              </h4>
              <p className="text-[11px] text-teal-700 leading-relaxed">
                Full interactive public link sharing, co-traveler invitations, and read-only export will be unlocked in the dedicated Sharing & Collaboration module.
              </p>
            </div>
          </div>

          {/* Shareable Link Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <span>Itinerary Preview URL</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={simulatedShareUrl}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 select-all focus:outline-hidden"
              />
              <Button
                variant={copied ? 'primary' : 'outline'}
                size="sm"
                onClick={handleCopyLink}
                leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Privacy summary */}
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Currently in private workspace view. Only you have access to modify activities.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
