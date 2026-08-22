import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Compass,
  Sparkles,
  Luggage,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Edit3,
} from 'lucide-react';
import { TripForm } from './TripForm';
import { TripPreviewCard, DEFAULT_TRIP_COVER } from './TripPreviewCard';
import { Trip, TripFormData } from '../../types/dashboard';
import { calculateTripDuration, deriveTripStatus } from '../../utils/dateUtils';
import { Button } from '../ui/Button';

interface CreateTripViewProps {
  onBackToDashboard: () => void;
  onTripCreated: (newTrip: Trip, actionType: 'save' | 'continue') => void;
  onTripUpdated?: (updatedTrip: Trip) => void;
  editingTrip?: Trip | null;
  fromSection?: 'dashboard' | 'my-trips';
}

export const CreateTripView: React.FC<CreateTripViewProps> = ({
  onBackToDashboard,
  onTripCreated,
  onTripUpdated,
  editingTrip,
  fromSection = 'dashboard',
}) => {
  const isEditMode = !!editingTrip;

  // Form State initialized with editingTrip if available
  const [formData, setFormData] = useState<TripFormData>({
    name: editingTrip ? editingTrip.name : '',
    startDate: editingTrip ? editingTrip.startDate : '',
    endDate: editingTrip ? editingTrip.endDate : '',
    description: editingTrip?.description || '',
    coverImage: editingTrip?.coverImage || '',
  });

  useEffect(() => {
    if (editingTrip) {
      setFormData({
        name: editingTrip.name,
        startDate: editingTrip.startDate,
        endDate: editingTrip.endDate,
        description: editingTrip.description || '',
        coverImage: editingTrip.coverImage || '',
      });
    }
  }, [editingTrip]);

  const [errors, setErrors] = useState<
    Partial<Record<keyof TripFormData | 'dateRange', string>>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedTripPreview, setSavedTripPreview] = useState<Trip | null>(null);

  // Check if user has entered or modified information
  const isDirty = isEditMode
    ? formData.name !== editingTrip.name ||
      formData.startDate !== editingTrip.startDate ||
      formData.endDate !== editingTrip.endDate ||
      formData.description !== (editingTrip.description || '') ||
      formData.coverImage !== (editingTrip.coverImage || '')
    : formData.name.trim() !== '' ||
      formData.startDate !== '' ||
      formData.endDate !== '' ||
      formData.description.trim() !== '' ||
      formData.coverImage !== '';

  const handleFieldChange = (field: keyof TripFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBack = () => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      onBackToDashboard();
    }
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TripFormData | 'dateRange', string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Trip name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Trip name should be at least 2 characters';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const duration = calculateTripDuration(formData.startDate, formData.endDate);
      if (!duration.isValid) {
        newErrors.dateRange = duration.errorMessage || 'End date cannot be earlier than start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (actionType: 'save' | 'continue') => {
    if (!validate()) {
      return;
    }

    setIsSaving(true);

    // Simulate short network save delay for realistic UX
    setTimeout(() => {
      const durationInfo = calculateTripDuration(formData.startDate, formData.endDate);
      const calculatedStatus = deriveTripStatus(
        formData.startDate,
        formData.endDate,
        editingTrip?.status || 'planning'
      );

      if (isEditMode && editingTrip) {
        const updated: Trip = {
          ...editingTrip,
          name: formData.name.trim(),
          route: editingTrip.route || formData.name.trim(),
          startDate: formData.startDate,
          endDate: formData.endDate,
          duration: durationInfo.formattedDuration || editingTrip.duration,
          status: calculatedStatus,
          coverImage: formData.coverImage || editingTrip.coverImage || DEFAULT_TRIP_COVER,
          description: formData.description.trim(),
        };

        setIsSaving(false);
        setSavedTripPreview(updated);
        setShowSuccessModal(true);

        if (onTripUpdated) {
          onTripUpdated(updated);
        }
      } else {
        const newTrip: Trip = {
          id: `trip_${Date.now()}`,
          name: formData.name.trim(),
          route: formData.name.trim(),
          destinationCount: 1,
          startDate: formData.startDate,
          endDate: formData.endDate,
          duration: durationInfo.formattedDuration || 'Flexible duration',
          status: calculatedStatus,
          coverImage: formData.coverImage || DEFAULT_TRIP_COVER,
          progressPercentage: 15,
          budgetTotal: 65000,
          budgetSpent: 0,
          currency: '₹',
          description: formData.description.trim(),
          notesCount: formData.description.trim() ? 1 : 0,
          destinations: [formData.name.trim()],
          createdAt: new Date().toISOString(),
        };

        setIsSaving(false);
        setSavedTripPreview(newTrip);
        setShowSuccessModal(true);

        // Trigger the parent state update
        onTripCreated(newTrip, actionType);
      }
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. Page Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="space-y-1.5">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <button
              type="button"
              onClick={handleBack}
              className="hover:text-teal-600 transition-colors cursor-pointer"
            >
              {fromSection === 'my-trips' ? 'My Trips' : 'Dashboard'}
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-teal-700 font-bold">
              {isEditMode ? 'Edit Trip' : 'Create Trip'}
            </span>
          </nav>

          {/* Title and Subtitle */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              {isEditMode ? (
                <>
                  <span>Edit Trip</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-sans font-semibold">
                    Editing Mode
                  </span>
                </>
              ) : (
                'Plan a New Trip'
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {isEditMode
                ? 'Update itinerary schedule, name, cover photo, or journey notes.'
                : 'Create the foundation for your next adventure.'}
            </p>
          </div>
        </div>

        {/* Back Action Button */}
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-semibold shadow-xs hover:bg-slate-50 transition-all active:scale-[0.98] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
            <span>{fromSection === 'my-trips' ? 'Back to My Trips' : 'Back to Dashboard'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Two-Column Layout (Form on Left, Live Preview on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Trip Information Form (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          <TripForm
            formData={formData}
            onChange={handleFieldChange}
            onSubmit={handleFormSubmit}
            onCancel={handleBack}
            isSaving={isSaving}
            errors={errors}
            setErrors={setErrors}
          />
        </div>

        {/* Right Column: Live Dynamic Preview Card (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          <TripPreviewCard
            name={formData.name}
            startDate={formData.startDate}
            endDate={formData.endDate}
            description={formData.description}
            coverImage={formData.coverImage}
          />
        </div>
      </div>

      {/* 3. Discard Unsaved Changes Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            onClick={() => setShowDiscardModal(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold font-display text-slate-900">
                {isEditMode ? 'Discard unsaved changes?' : 'Discard unsaved trip?'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isEditMode
                  ? 'You have unsaved edits to this trip. Navigating away now will revert changes to their previous state.'
                  : 'You have started customizing this trip. If you navigate back now, your entered details will not be saved.'}
              </p>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDiscardModal(false)}
              >
                Keep Editing
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={() => {
                  setShowDiscardModal(false);
                  onBackToDashboard();
                }}
              >
                Discard & Exit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Success Confirmation Modal / Banner */}
      {showSuccessModal && savedTripPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp z-10 text-center">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
              <CheckCircle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {isEditMode ? 'Trip Updated Successfully' : 'Trip Created Successfully'}
              </span>
              <h3 className="text-xl font-bold font-display text-slate-900">
                {savedTripPreview.name}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                {isEditMode
                  ? 'Your trip changes have been saved to your collection.'
                  : 'Your new journey has been saved to your local trip collection.'}
              </p>
            </div>

            {/* Trip Snapshot Pill */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-around text-xs text-slate-700">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span className="font-semibold">{savedTripPreview.duration}</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-teal-600" />
                <span className="font-semibold capitalize">{savedTripPreview.status}</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  setShowSuccessModal(false);
                  onBackToDashboard();
                }}
              >
                {fromSection === 'my-trips' ? 'Back to My Trips' : 'View on Dashboard'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
