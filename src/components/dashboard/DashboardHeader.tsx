import React from 'react';
import { Plus, Compass, Sparkles, MapPin, Calendar, Wallet } from 'lucide-react';
import { AuthenticatedUser } from '../../types/auth';

interface DashboardHeaderProps {
  user: AuthenticatedUser | null;
  onPlanTrip: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, onPlanTrip }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.fullName ? user.fullName.split(' ')[0] : 'Explorer';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white p-6 sm:p-8 lg:p-10 shadow-lg border border-slate-700/50">
      {/* Background ambient elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Side Greeting & Description */}
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-400/30 text-teal-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Ready for your next journey</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display tracking-tight text-white leading-tight">
            {getGreeting()}, {displayName} 👋
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Where will your wanderlust take you next? Explore personalized itineraries, track budgets, and curate memorable adventures across the globe.
          </p>

          {/* Quick Metrics Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs text-slate-200">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              <span>Next trip: <strong className="text-white">10 Jun</strong></span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Route: <strong className="text-white">3 Cities</strong></span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs text-slate-200">
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
              <span>Planned: <strong className="text-white">₹80,000</strong></span>
            </div>
          </div>
        </div>

        {/* Right Side Primary CTA */}
        <div className="shrink-0 flex items-center">
          <button
            type="button"
            onClick={onPlanTrip}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold text-sm shadow-xl shadow-teal-900/40 hover:shadow-2xl hover:shadow-teal-900/50 flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] border border-teal-300/30"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>+ Plan New Trip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
