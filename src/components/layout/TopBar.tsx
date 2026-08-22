import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
  Plus,
  Compass,
  Check,
  Sparkles,
  User,
  LogOut,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { AuthenticatedUser } from '../../types/auth';
import { Logo } from '../brand/Logo';

interface TopBarProps {
  user: AuthenticatedUser | null;
  onOpenMobileMenu: () => void;
  onPlanTrip: () => void;
  onLogout: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  onOpenMobileMenu,
  onPlanTrip,
  onLogout,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sampleNotifications = [
    {
      id: '1',
      title: 'Upcoming Trip in 14 days',
      desc: 'European Escape starts on June 10. Check your travel checklist.',
      time: '1h ago',
      unread: true,
    },
    {
      id: '2',
      title: 'Recommended for you',
      desc: 'New curated scenic spots added in Swiss Alps & Tokyo.',
      time: '1d ago',
      unread: false,
    },
  ];

  return (
    <header className="sticky top-0 z-20 w-full h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left Area: Mobile Menu Toggle & Brand (on mobile) */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="lg:hidden">
          <Logo size="sm" showTagline={false} />
        </div>

        {/* Global Search Bar on Tablet/Desktop */}
        <div className="hidden md:flex items-center relative w-64 lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search trips, cities, itineraries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3.5 text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-teal-500 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
          />
        </div>
      </div>

      {/* Right Area: Action CTA, Notifications, Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick "+ Plan Trip" header CTA (on tablet/desktop) */}
        <button
          type="button"
          onClick={onPlanTrip}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Plan Trip</span>
        </button>

        {/* Notifications Button & Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white shadow-xl border border-slate-200 p-4 z-40 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Notifications (Demo)
                </h4>
                <span className="text-[10px] text-teal-600 font-semibold cursor-pointer hover:underline">
                  Mark all as read
                </span>
              </div>

              <div className="space-y-2">
                {sampleNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-2.5 rounded-xl text-xs space-y-1 transition-colors ${
                      notif.unread
                        ? 'bg-teal-50/60 border border-teal-100'
                        : 'bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span>{notif.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{notif.time}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{notif.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Menu */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1 pl-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
            aria-label="User profile menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-display font-bold text-xs flex items-center justify-center shadow-xs">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'E'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {user?.fullName || 'Explorer'}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">Personalized Plan</p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-200 p-2 z-40 space-y-1 animate-fadeIn">
              <div className="p-3 border-b border-slate-100 text-xs">
                <p className="font-bold text-slate-900">{user?.fullName || 'Explorer'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'traveler@globetrotter.io'}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Profile Details</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Preferences</span>
              </button>

              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left font-medium"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out to Auth View</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
