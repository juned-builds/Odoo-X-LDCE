import React from 'react';
import { LogOut, CheckCircle2, ShieldCheck, Compass, Sparkles, MapPin, Calendar, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../ui/Button';
import { AuthenticatedUser } from '../../types/auth';

interface AuthSuccessViewProps {
  user: AuthenticatedUser;
  onLogout: () => void;
}

export const AuthSuccessView: React.FC<AuthSuccessViewProps> = ({ user, onLogout }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="w-full space-y-6"
    >
      {/* Success Badge */}
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Authentication Verified
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100/70 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" /> Demo Session Active
            </span>
          </div>
          <p className="text-xs text-emerald-700/90 truncate mt-0.5">
            Module 1 Authentication & Visual Foundation verified successfully
          </p>
        </div>
      </div>

      {/* User Welcome Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-display font-bold text-lg flex items-center justify-center shadow-md shadow-teal-600/20 ring-2 ring-white">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900 leading-tight">
                Welcome, {user.fullName}!
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{user.email}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            Explorer
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div className="p-2.5 rounded-xl bg-white border border-slate-100">
            <div className="text-slate-400 text-[11px] flex items-center gap-1 font-medium mb-1">
              <Calendar className="w-3 h-3 text-slate-400" /> Member Since
            </div>
            <div className="font-semibold text-slate-800">{user.memberSince}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-100">
            <div className="text-slate-400 text-[11px] flex items-center gap-1 font-medium mb-1">
              <Compass className="w-3 h-3 text-slate-400" /> Travel Persona
            </div>
            <div className="font-semibold text-slate-800 truncate">{user.preferredStyle || 'Personalized Explorer'}</div>
          </div>
        </div>

        {/* Readiness Note */}
        <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready for Next Development Module</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Frontend foundation, design system tokens, and authentication UX flows are fully implemented and responsive. Future modules will attach itineraries, trip creation, and AI planning.
          </p>
        </div>
      </div>

      {/* Logout / Switch User Action */}
      <div className="pt-2">
        <Button
          type="button"
          variant="outline"
          fullWidth
          size="md"
          onClick={onLogout}
          leftIcon={<LogOut className="w-4 h-4" />}
        >
          Sign Out / Test Other Auth Flows
        </Button>
      </div>
    </motion.div>
  );
};
