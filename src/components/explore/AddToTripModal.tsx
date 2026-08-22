import React from 'react';
import {
  X,
  Luggage,
  Calendar,
  MapPin,
  Plus,
  Check,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Destination, Trip } from '../../types/dashboard';
import { formatTripDateRange } from '../../utils/dateUtils';
import { Button } from '../ui/Button';

interface AddToTripModalProps {
  isOpen: boolean;
  destination: Destination | null;
  trips: Trip[];
  onClose: () => void;
  onSelectTrip: (trip: Trip, destination: Destination) => void;
  onCreateNewTripWithDestination?: (destination: Destination) => void;
}

export const AddToTripModal: React.FC<AddToTripModalProps> = ({
  isOpen,
  destination,
  trips,
  onClose,
  onSelectTrip,
  onCreateNewTripWithDestination,
}) => {
  if (!isOpen || !destination) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-3 bg-gradient-to-br from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0 shadow-xs">
              <Luggage className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Trip Assignment
              </p>
              <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900 leading-tight">
                Add {destination.city} to a Trip
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Destination Preview Strip */}
        <div className="px-6 py-3 bg-teal-50/50 border-b border-teal-100 flex items-center gap-3">
          <img
            src={destination.image}
            alt={destination.city}
            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-teal-200/60"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 text-xs font-bold text-teal-950 truncate">
              <span>{destination.city}, {destination.country}</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-teal-200/70 text-teal-800">
                {destination.region}
              </span>
            </div>
            <p className="text-[11px] text-teal-700 truncate">
              {destination.highlights.slice(0, 2).join(' • ')}
            </p>
          </div>
        </div>

        {/* Modal Body: List of User's Existing Trips */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3 flex-1">
          <p className="text-xs font-semibold text-slate-500 mb-1">
            Choose which itinerary to include this stop in:
          </p>

          {trips.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-3">
              <p className="text-xs font-semibold text-slate-700">No journeys created yet</p>
              <p className="text-xs text-slate-500">
                Create your first trip now and start designing your travel itinerary.
              </p>
              {onCreateNewTripWithDestination && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    onClose();
                    onCreateNewTripWithDestination(destination);
                  }}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Create Trip with {destination.city}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {trips.map((trip) => {
                const isAlreadyAdded =
                  trip.destinations?.some(
                    (d) => d.toLowerCase() === destination.city.toLowerCase()
                  ) || false;

                return (
                  <div
                    key={trip.id}
                    className={`
                      p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3.5
                      ${isAlreadyAdded
                        ? 'bg-emerald-50/40 border-emerald-200/80 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-sm'
                      }
                    `}
                  >
                    {/* Trip Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {trip.coverImage ? (
                        <img
                          src={trip.coverImage}
                          alt={trip.name}
                          className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <Luggage className="w-5 h-5" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {trip.name}
                          </h4>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                              trip.status === 'upcoming'
                                ? 'bg-teal-100 text-teal-800'
                                : trip.status === 'planning'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {trip.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{formatTripDateRange(trip.startDate, trip.endDate)}</span>
                          <span className="text-slate-300">•</span>
                          <span>{trip.destinationCount} stops</span>
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0">
                      {isAlreadyAdded ? (
                        <button
                          type="button"
                          onClick={() => onSelectTrip(trip, destination)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors cursor-pointer"
                          title="Already added to this trip. Click to re-assign or update order."
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Added</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSelectTrip(trip, destination)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 transition-all active:scale-95 shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          {onCreateNewTripWithDestination && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onCreateNewTripWithDestination(destination);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Start New Trip with {destination.city}</span>
            </button>
          )}

          <Button variant="outline" size="sm" onClick={onClose} className="ml-auto">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
