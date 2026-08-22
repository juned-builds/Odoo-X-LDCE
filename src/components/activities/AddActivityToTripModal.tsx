import React, { useState, useMemo } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Plus,
  Check,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Plane,
} from 'lucide-react';
import { Activity } from '../../types/activity';
import { Trip, TripStop } from '../../types/dashboard';
import { Button } from '../ui/Button';

interface AddActivityToTripModalProps {
  isOpen: boolean;
  activity: Activity | null;
  trips: Trip[];
  onClose: () => void;
  onAddActivity: (tripId: string, stopCity: string, activity: Activity) => void;
  onRemoveActivity?: (tripId: string, activityId: string, stopCity?: string) => void;
  onCreateNewTrip?: () => void;
}

export const AddActivityToTripModal: React.FC<AddActivityToTripModalProps> = ({
  isOpen,
  activity,
  trips,
  onClose,
  onAddActivity,
  onRemoveActivity,
  onCreateNewTrip,
}) => {
  if (!isOpen || !activity) return null;

  // Selected trip state - default to first trip or trip that matches activity destination
  const defaultTrip = useMemo(() => {
    const matchingTrip = trips.find(
      (t) =>
        t.destinations?.some(
          (d) => d.toLowerCase() === activity.destinationCity.toLowerCase()
        ) ||
        t.stops?.some(
          (s) => s.city.toLowerCase() === activity.destinationCity.toLowerCase()
        )
    );
    return matchingTrip ? matchingTrip.id : trips[0]?.id || '';
  }, [trips, activity]);

  const [selectedTripId, setSelectedTripId] = useState<string>(defaultTrip);

  // Current active trip object
  const currentTrip = useMemo(() => {
    return trips.find((t) => t.id === selectedTripId) || null;
  }, [trips, selectedTripId]);

  // Selected stop / city in the chosen trip
  const [selectedCity, setSelectedCity] = useState<string>(activity.destinationCity);

  // Check if this activity is already added in the selected trip
  const isAlreadyInTrip = useMemo(() => {
    if (!currentTrip) return false;
    const inTripActivities = currentTrip.activities?.some(
      (a) => a.activityId === activity.id
    );
    const inStopsActivities = currentTrip.stops?.some((s) =>
      s.activities?.some((a) => a.activityId === activity.id)
    );
    return Boolean(inTripActivities || inStopsActivities);
  }, [currentTrip, activity.id]);

  const handleSave = () => {
    if (!selectedTripId) return;
    onAddActivity(selectedTripId, selectedCity || activity.destinationCity, activity);
    onClose();
  };

  const handleRemove = () => {
    if (!selectedTripId || !onRemoveActivity) return;
    onRemoveActivity(selectedTripId, activity.id, selectedCity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900 leading-tight">
                Add to Itinerary
              </h2>
              <p className="text-xs text-slate-500">
                Assign experience to one of your trips
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Selected Activity Preview Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5">
            <img
              src={activity.image}
              alt={activity.name}
              className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  {activity.type}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {activity.cost}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {activity.name}
              </h4>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                <span>
                  {activity.destinationCity}, {activity.destinationCountry}
                </span>
              </p>
            </div>
          </div>

          {/* Trip Selection */}
          {trips.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  No Trips Available Yet
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  You need to create a trip before attaching activities to it.
                </p>
              </div>
              {onCreateNewTrip && (
                <Button
                  size="sm"
                  onClick={() => {
                    onClose();
                    onCreateNewTrip();
                  }}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Create New Trip
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Trip selector dropdown / radio list */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Select Trip
                </label>
                <div className="space-y-2">
                  {trips.map((trip) => {
                    const isSelected = trip.id === selectedTripId;
                    const matchesCity =
                      trip.destinations?.some(
                        (d) =>
                          d.toLowerCase() === activity.destinationCity.toLowerCase()
                      ) ||
                      trip.stops?.some(
                        (s) =>
                          s.city.toLowerCase() ===
                          activity.destinationCity.toLowerCase()
                      );

                    const hasActivity =
                      trip.activities?.some(
                        (a) => a.activityId === activity.id
                      ) ||
                      trip.stops?.some((s) =>
                        s.activities?.some((a) => a.activityId === activity.id)
                      );

                    return (
                      <div
                        key={trip.id}
                        onClick={() => setSelectedTripId(trip.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-teal-50/70 border-teal-500 ring-1 ring-teal-500 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-teal-600 bg-teal-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {trip.name}
                              </span>
                              {matchesCity && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
                                  Matches City
                                </span>
                              )}
                              {hasActivity && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-800 shrink-0">
                                  ✓ Added
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">
                              {trip.route || trip.destinations?.join(' → ')} •{' '}
                              {trip.duration}
                            </p>
                          </div>
                        </div>

                        <span className="text-[11px] font-medium text-slate-400 capitalize shrink-0">
                          {trip.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stop / Destination Assignment within Trip */}
              {currentTrip && currentTrip.stops && currentTrip.stops.length > 1 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Assign to Destination Stop
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    {currentTrip.stops.map((stop, idx) => (
                      <option key={`${stop.city}-${idx}`} value={stop.city}>
                        Stop {idx + 1}: {stop.city}{' '}
                        {stop.city.toLowerCase() ===
                        activity.destinationCity.toLowerCase()
                          ? '(Recommended)'
                          : ''}
                      </option>
                    ))}
                    {!currentTrip.stops.some(
                      (s) =>
                        s.city.toLowerCase() ===
                        activity.destinationCity.toLowerCase()
                    ) && (
                      <option value={activity.destinationCity}>
                        Add as new stop: {activity.destinationCity}
                      </option>
                    )}
                  </select>
                </div>
              )}

              {/* Status Alert if already added */}
              {isAlreadyInTrip && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>This activity is currently in your trip itinerary.</span>
                  </div>
                  {onRemoveActivity && (
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          {trips.length > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              leftIcon={<Check className="w-4 h-4 stroke-[3]" />}
            >
              {isAlreadyInTrip ? 'Confirm & Update' : 'Add to Selected Trip'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
