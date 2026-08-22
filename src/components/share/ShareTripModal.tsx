import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Globe,
  ExternalLink,
  Lock,
  Sparkles,
  Send,
  MessageCircle,
  Eye,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Layers,
  CopyPlus,
  ShieldCheck,
  PowerOff,
} from 'lucide-react';
import { Trip } from '../../types/dashboard';
import { Button } from '../ui/Button';
import { formatTripDateRange } from '../../utils/dateUtils';
import {
  getTripShareId,
  getShareUrl,
  triggerNativeShare,
  getSocialShareUrl,
} from '../../utils/shareUtils';

interface ShareTripModalProps {
  isOpen: boolean;
  trip: Trip | null;
  onClose: () => void;
  onOpenPublicView?: (shareId: string) => void;
  onCopyTrip?: (trip: Trip) => void;
  onToggleShareStatus?: (trip: Trip, isShared: boolean) => void;
}

export const ShareTripModal: React.FC<ShareTripModalProps> = ({
  isOpen,
  trip,
  onClose,
  onOpenPublicView,
  onCopyTrip,
  onToggleShareStatus,
}) => {
  const [copied, setCopied] = useState(false);
  const [nativeShareSuccess, setNativeShareSuccess] = useState<boolean | null>(null);
  const [shareStatusMessage, setShareStatusMessage] = useState<string | null>(null);

  if (!isOpen || !trip) return null;

  const isShared = trip.isShared !== false; // Default true if unspecified
  const shareId = getTripShareId(trip);
  const shareUrl = getShareUrl(shareId);
  const dateRangeDisplay = formatTripDateRange(trip.startDate, trip.endDate);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for older browsers / iframe contexts
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setShareStatusMessage('Link copied to clipboard!');
      setTimeout(() => {
        setCopied(false);
        setShareStatusMessage(null);
      }, 3000);
    } catch (e) {
      console.warn('Failed to copy text: ', e);
    }
  };

  const handleNativeShare = async () => {
    const success = await triggerNativeShare(trip, shareUrl);
    if (success) {
      setNativeShareSuccess(true);
      setTimeout(() => setNativeShareSuccess(null), 3000);
    }
  };

  const handleSocialShare = (platform: 'whatsapp' | 'twitter' | 'facebook' | 'linkedin') => {
    const url = getSocialShareUrl(platform, trip, shareUrl);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleToggleSharing = () => {
    const nextState = !isShared;
    if (onToggleShareStatus) {
      onToggleShareStatus(trip, nextState);
    }
    setShareStatusMessage(
      nextState
        ? 'Public sharing enabled for this itinerary.'
        : 'Sharing disabled. Public link is now inactive.'
    );
    setTimeout(() => setShareStatusMessage(null), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-trip-title"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-scaleUp my-8">
        {/* Header with gradient theme */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950 text-white flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Globe className="w-3 h-3" />
                <span>Public Share</span>
              </div>
              <h3 id="share-trip-title" className="text-xl font-bold font-display text-white">
                Share Your Trip
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close share modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Trip Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-slate-200">
              <img
                src={trip.coverImage}
                alt={trip.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <h4 className="font-bold text-base text-slate-900 truncate">
                {trip.name}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-teal-700 font-medium truncate">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{trip.route}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{dateRangeDisplay}</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{trip.duration}</span>
                </span>
                <span>•</span>
                <span>{trip.destinationCount} destinations</span>
              </div>
            </div>
          </div>

          {/* Toast / Status Alert if any */}
          {shareStatusMessage && (
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{shareStatusMessage}</span>
            </div>
          )}

          {/* Share Status Control Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-3 h-3 rounded-full ${
                  isShared ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Status: {isShared ? 'Shared (Public Link Active)' : 'Not Shared (Private)'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {isShared
                    ? 'Anyone with the link can view the read-only itinerary.'
                    : 'The public link is currently deactivated.'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleSharing}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isShared
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
              }`}
            >
              {isShared ? (
                <>
                  <PowerOff className="w-3.5 h-3.5" />
                  <span>Stop Sharing</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5" />
                  <span>Enable Sharing</span>
                </>
              )}
            </button>
          </div>

          {/* Public Itinerary Link */}
          {isShared ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-teal-600" />
                  <span>Public Itinerary Link</span>
                </label>
                {copied && (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Link copied!</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 select-all focus:outline-hidden pr-8 truncate"
                  />
                </div>

                <Button
                  variant={copied ? 'primary' : 'outline'}
                  size="sm"
                  onClick={handleCopyLink}
                  leftIcon={
                    copied ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )
                  }
                >
                  {copied ? 'Copied' : 'Copy Link'}
                </Button>
              </div>

              <p className="text-[11px] text-slate-400">
                Frontend prototype share link for demonstration and peer review.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>Link Inactive</span>
              </div>
              <p className="text-amber-800 text-[11px]">
                Click "Enable Sharing" above to generate an active public itinerary link for this trip.
              </p>
            </div>
          )}

          {/* Public Preview Button */}
          {isShared && onOpenPublicView && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPublicView(shareId);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer shadow-2xs"
            >
              <Eye className="w-4 h-4 text-teal-600" />
              <span>Preview Public Itinerary Page</span>
              <ExternalLink className="w-3.5 h-3.5 text-teal-500 ml-0.5" />
            </button>
          )}

          {/* Social Media Sharing Section */}
          {isShared && (
            <div className="space-y-2.5 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Social Sharing
                </span>
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-800 underline flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Native Device Share</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* WhatsApp */}
                <button
                  type="button"
                  onClick={() => handleSocialShare('whatsapp')}
                  className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  title="Share via WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp</span>
                </button>

                {/* X / Twitter */}
                <button
                  type="button"
                  onClick={() => handleSocialShare('twitter')}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  title="Share on X (Twitter)"
                >
                  <span className="font-mono font-black text-slate-900">𝕏</span>
                  <span>X / Tweet</span>
                </button>

                {/* Facebook */}
                <button
                  type="button"
                  onClick={() => handleSocialShare('facebook')}
                  className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  title="Share on Facebook"
                >
                  <span className="font-bold text-blue-600">f</span>
                  <span>Facebook</span>
                </button>

                {/* LinkedIn */}
                <button
                  type="button"
                  onClick={() => handleSocialShare('linkedin')}
                  className="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100/80 border border-sky-200 text-sky-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  title="Share on LinkedIn"
                >
                  <span className="font-bold text-sky-700">in</span>
                  <span>LinkedIn</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 text-center sm:text-left">
                Sharing is available through your device and standard web share protocols.
              </div>
            </div>
          )}

          {/* Privacy & Read-Only Notice */}
          <div className="flex items-start gap-2.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Read-Only Privacy:</strong> Visitors on the public page cannot edit
              activities, see personal email addresses, or access private expenses.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            {onCopyTrip && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onCopyTrip(trip);
                }}
                leftIcon={<CopyPlus className="w-3.5 h-3.5 text-teal-600" />}
              >
                Copy Trip
              </Button>
            )}

            <Button variant="primary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
