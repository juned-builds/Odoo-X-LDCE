import React, { useState, useRef } from 'react';
import {
  User,
  Mail,
  Camera,
  Globe,
  Bookmark,
  LogOut,
  Trash2,
  Check,
  AlertCircle,
  Sparkles,
  Info,
  Calendar,
  Compass,
  ArrowRight,
  Shield,
  Edit3,
  X,
} from 'lucide-react';
import { AuthenticatedUser } from '../../types/auth';
import { Destination, Trip } from '../../types/dashboard';
import { Button } from '../ui/Button';
import { DeleteAccountModal } from './DeleteAccountModal';
import { UnsavedChangesModal } from './UnsavedChangesModal';
import { SavedDestinationCard } from './SavedDestinationCard';

interface SettingsViewProps {
  user: AuthenticatedUser | null;
  onUpdateUser: (updatedUser: AuthenticatedUser) => void;
  savedDestinations: Destination[];
  onRemoveSavedDestination: (destinationId: string) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onNavigateToExplore: () => void;
  onAddToTrip?: (destination: Destination) => void;
  onExploreActivities?: (destination: Destination) => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English (US / Global)', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'de', label: 'German', native: 'Deutsch' },
  { code: 'ja', label: 'Japanese', native: '日本語' },
  { code: 'it', label: 'Italian', native: 'Italiano' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateUser,
  savedDestinations,
  onRemoveSavedDestination,
  onLogout,
  onDeleteAccount,
  onNavigateToExplore,
  onAddToTrip,
  onExploreActivities,
}) => {
  // Editing profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || 'Alex Morgan');
  const [email, setEmail] = useState(user?.email || 'alex.morgan@example.com');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatarUrl);
  const [language, setLanguage] = useState<string>(user?.language || 'en');
  const [homeCity, setHomeCity] = useState<string>(user?.homeCity || 'San Francisco, CA');
  const [bio, setBio] = useState<string>(
    user?.bio || 'Passionate world traveler, avid photographer, and culture explorer.'
  );

  // Form errors
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; photo?: string }>({});

  // Modals & Confirmation state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // File input ref for avatar
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  // Check if profile form is dirty
  const isDirty =
    fullName !== (user?.fullName || '') ||
    email !== (user?.email || '') ||
    avatarUrl !== user?.avatarUrl ||
    homeCity !== (user?.homeCity || '') ||
    bio !== (user?.bio || '');

  // Validation
  const validateForm = () => {
    const newErrors: { fullName?: string; email?: string } = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save profile changes
  const handleSaveProfile = () => {
    if (!validateForm()) return;

    if (user) {
      const updatedUser: AuthenticatedUser = {
        ...user,
        fullName: fullName.trim(),
        email: email.trim(),
        avatarUrl,
        language,
        homeCity: homeCity.trim(),
        bio: bio.trim(),
      };
      onUpdateUser(updatedUser);
      setIsEditingProfile(false);
      setErrors({});
      showToast('Profile information saved successfully.');
    }
  };

  // Cancel profile changes
  const handleCancelProfile = () => {
    if (isDirty) {
      setIsUnsavedModalOpen(true);
      setPendingAction(() => () => {
        resetFormToUser();
        setIsEditingProfile(false);
      });
    } else {
      resetFormToUser();
      setIsEditingProfile(false);
    }
  };

  const resetFormToUser = () => {
    setFullName(user?.fullName || 'Alex Morgan');
    setEmail(user?.email || 'alex.morgan@example.com');
    setAvatarUrl(user?.avatarUrl);
    setHomeCity(user?.homeCity || 'San Francisco, CA');
    setBio(user?.bio || 'Passionate world traveler, avid photographer, and culture explorer.');
    setErrors({});
  };

  // Handle Photo upload
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, photo: 'Please select an image file (PNG, JPG, WebP).' }));
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: 'Photo size should be under 5MB.' }));
      return;
    }

    setErrors((prev) => ({ ...prev, photo: undefined }));
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarUrl(result);
      showToast('Profile photo updated in draft.');
    };
    reader.readAsDataURL(file);
  };

  // Remove photo
  const handleRemovePhoto = () => {
    setAvatarUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showToast('Profile photo removed.');
  };

  // Handle Language Change
  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    if (user) {
      onUpdateUser({
        ...user,
        language: newLang,
      });
    }
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === newLang);
    showToast(`Language preference set to ${langObj?.label || newLang}.`);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700 text-xs font-medium animate-slideUp">
          <Check className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your profile, preferences, and saved destinations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-teal-600" />
            <span>Authenticated Profile</span>
          </span>
        </div>
      </div>

      <div className="space-y-8">
        {/* ========================================================================= */}
        {/* SECTION 1: PROFILE INFORMATION */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-7 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-slate-900">
                  Profile Information
                </h2>
                <p className="text-xs text-slate-500">
                  Your personal traveler identity and public information
                </p>
              </div>
            </div>

            {!isEditingProfile ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingProfile(true)}
                leftIcon={<Edit3 className="w-3.5 h-3.5 text-teal-600" />}
              >
                Edit Profile
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCancelProfile}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveProfile}
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  Save Changes
                </Button>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-7 space-y-6">
            {/* Avatar & Photo Picker */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="relative group shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="w-20 h-20 rounded-2xl object-cover shadow-sm ring-2 ring-teal-500/30"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-display font-bold text-2xl flex items-center justify-center shadow-sm">
                    {fullName.charAt(0).toUpperCase() || 'E'}
                  </div>
                )}

                {isEditingProfile && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs"
                    title="Change Photo"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="text-[10px] font-semibold mt-1">Upload</span>
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                  <span>Profile Photo</span>
                  {avatarUrl && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                      Custom Avatar
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">
                  Upload a high-resolution photo (JPG, PNG, WebP up to 5MB) or use your default traveler monogram.
                </p>

                {errors.photo && (
                  <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.photo}</span>
                  </p>
                )}

                {isEditingProfile && (
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      leftIcon={<Camera className="w-3.5 h-3.5 text-teal-600" />}
                    >
                      {avatarUrl ? 'Replace Photo' : 'Upload Photo'}
                    </Button>

                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                {isEditingProfile ? (
                  <div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all ${
                        errors.fullName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                      }`}
                      placeholder="e.g. Alex Morgan"
                    />
                    {errors.fullName && (
                      <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.fullName}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-sm font-semibold text-slate-800">
                    {fullName}
                  </div>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                {isEditingProfile ? (
                  <div>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all ${
                          errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                        }`}
                        placeholder="you@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1">
                      Private to your account. Never displayed on public shared itineraries.
                    </p>
                  </div>
                ) : (
                  <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{email}</span>
                  </div>
                )}
              </div>

              {/* Home City / Base */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Home City / Base
                </label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={homeCity}
                    onChange={(e) => setHomeCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    placeholder="e.g. San Francisco, CA"
                  />
                ) : (
                  <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-700">
                    {homeCity || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Member Since */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Member Status
                </label>
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>Member since {user?.memberSince || 'October 2024'}</span>
                </div>
              </div>
            </div>

            {/* Bio field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Traveler Bio & Style
              </label>
              {isEditingProfile ? (
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  placeholder="Share a short summary of your travel style and preferences..."
                />
              ) : (
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-700 leading-relaxed">
                  {bio || 'No bio added.'}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: LANGUAGE & PREFERENCES */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-7 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-slate-900">
                  Language Preference
                </h2>
                <p className="text-xs text-slate-500">
                  Configure your preferred language and regional settings
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7 space-y-5">
            <div className="max-w-md space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Select Display Language
              </label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer shadow-xs"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label} — ({lang.native})
                  </option>
                ))}
              </select>
            </div>

            {/* Prototype Indicator Notice */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3 text-xs text-indigo-900">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-indigo-950">Prototype Preference Indicator</p>
                <p className="text-indigo-800 leading-relaxed">
                  Language preferences are stored with your profile and synchronized across your session.
                  Full multi-lingual localization will be supported in upcoming production releases.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: SAVED DESTINATIONS */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-7 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-lg text-slate-900">
                    Saved Destinations
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    {savedDestinations.length}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Destinations you have bookmarked while exploring GlobeTrotter
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToExplore}
              leftIcon={<Compass className="w-3.5 h-3.5 text-teal-600" />}
            >
              Explore Destinations
            </Button>
          </div>

          <div className="p-5 sm:p-7">
            {savedDestinations.length === 0 ? (
              /* Clean Empty State */
              <div className="py-12 px-4 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Bookmark className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div className="max-w-sm mx-auto space-y-1">
                  <h3 className="font-display font-bold text-base text-slate-800">
                    No saved destinations yet
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Your saved destinations will appear here. Browse world-class cities, landmarks, and hidden gems in Explore.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onNavigateToExplore}
                  leftIcon={<Compass className="w-3.5 h-3.5" />}
                  className="shadow-sm"
                >
                  Explore Destinations
                </Button>
              </div>
            ) : (
              /* Saved Destinations Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {savedDestinations.map((dest) => (
                  <SavedDestinationCard
                    key={dest.id}
                    destination={dest}
                    onRemove={(id) => {
                      onRemoveSavedDestination(id);
                      showToast(`Removed ${dest.city} from saved destinations.`);
                    }}
                    onAddToTrip={onAddToTrip}
                    onExploreActivities={onExploreActivities}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: ACCOUNT & SESSION ACTIONS */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-7 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-slate-900">
                  Account & Session
                </h2>
                <p className="text-xs text-slate-500">
                  Manage your authenticated session and prototype account status
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-slate-900">Sign Out</h4>
                <p className="text-xs text-slate-500">
                  Sign out of your session and return to the login screen.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                leftIcon={<LogOut className="w-3.5 h-3.5 text-slate-500" />}
              >
                Sign Out
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-rose-50/40 border border-rose-100">
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-rose-950">Delete Account</h4>
                <p className="text-xs text-rose-700/90">
                  Permanently clear this prototype profile, saved destinations, and custom session data.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirmDelete={() => {
          setIsDeleteDialogOpen(false);
          onDeleteAccount();
        }}
        userName={user?.fullName}
      />

      {/* Unsaved Changes Confirmation Modal */}
      <UnsavedChangesModal
        isOpen={isUnsavedModalOpen}
        onClose={() => {
          setIsUnsavedModalOpen(false);
          setPendingAction(null);
        }}
        onDiscard={() => {
          setIsUnsavedModalOpen(false);
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          }
        }}
        onSave={() => {
          setIsUnsavedModalOpen(false);
          handleSaveProfile();
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          }
        }}
      />
    </div>
  );
};
