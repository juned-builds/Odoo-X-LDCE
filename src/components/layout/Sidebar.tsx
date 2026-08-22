import React from 'react';
import {
  LayoutDashboard,
  Luggage,
  Compass,
  Sparkles,
  Calendar,
  Wallet,
  Settings,
  Plus,
  LogOut,
  X,
} from 'lucide-react';
import { Logo } from '../brand/Logo';
import { NavSection } from '../../types/dashboard';
import { AuthenticatedUser } from '../../types/auth';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  onPlanTrip: () => void;
  user: AuthenticatedUser | null;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  tripsCount?: number;
}

interface NavItem {
  id: NavSection;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  onPlanTrip,
  user,
  onLogout,
  isOpenMobile,
  onCloseMobile,
  tripsCount = 4,
}) => {
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'my-trips',
      label: 'My Trips',
      icon: <Luggage className="w-4 h-4" />,
      badge: `${tripsCount}`,
    },
    {
      id: 'explore',
      label: 'Explore',
      icon: <Compass className="w-4 h-4" />,
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'budget',
      label: 'Budget',
      icon: <Wallet className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const handleNavClick = (section: NavSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 sm:p-5 bg-white border-r border-slate-200/90 select-none">
      {/* Brand Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Logo size="sm" showTagline={false} />
          {/* Mobile close button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary CTA button in sidebar */}
        <div>
          <button
            type="button"
            onClick={onPlanTrip}
            className="w-full h-11 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold text-sm shadow-md shadow-teal-700/20 hover:shadow-lg hover:shadow-teal-700/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Plan New Trip</span>
          </button>
        </div>

        {/* Navigation items list */}
        <nav className="space-y-1" aria-label="Main Navigation">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
            Menu
          </p>
          {navItems.map((item) => {
            const isActive =
              activeSection === item.id ||
              (item.id === 'my-trips' &&
                (activeSection === 'itinerary' || activeSection === 'itinerary-builder'));
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer
                  ${isActive
                    ? 'bg-teal-50 text-teal-900 font-semibold shadow-xs border border-teal-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? 'text-teal-600' : 'text-slate-400'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile & Sign Out */}
      <div className="pt-4 border-t border-slate-100">
        {/* User Card */}
        <div className="p-2 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-2 shadow-xs">
          <button
            type="button"
            onClick={() => handleNavClick('settings')}
            className="flex items-center gap-2.5 min-w-0 flex-1 text-left hover:opacity-80 transition-opacity cursor-pointer"
            title="Open Profile & Settings"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName || 'Explorer'}
                className="w-8 h-8 rounded-full object-cover shrink-0 shadow-xs ring-1 ring-teal-500/40"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-display font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'E'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {user?.fullName || 'Explorer'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.email || 'wanderer@demo.io'}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={onLogout}
            title="Sign out to Auth Screen"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0 cursor-pointer"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed / Column) */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Slide-out drawer */}
          <div className="relative w-72 max-w-[80vw] h-full z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
