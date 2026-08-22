import React, { useState, useEffect } from 'react';
import { MapPin, Star, Compass, Sparkles, Navigation, Globe, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Destination {
  id: string;
  title: string;
  country: string;
  tagline: string;
  image: string;
  rating: number;
  highlight: string;
  testimonial: {
    quote: string;
    author: string;
    role: string;
  };
}

const DESTINATIONS: Destination[] = [
  {
    id: 'amalfi',
    title: 'Positano & Amalfi Coast',
    country: 'Italy',
    tagline: 'Coastal Cliffside Sunsets & Lemon Groves',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    rating: 4.98,
    highlight: 'Curated 5-day Scenic Route',
    testimonial: {
      quote: 'GlobeTrotter planned our dream anniversary trip with hidden restaurants we never would have found on our own.',
      author: 'Elena & Marcus Vance',
      role: 'Slow Travel Enthusiasts',
    },
  },
  {
    id: 'kyoto',
    title: 'Kyoto & Arashiyama',
    country: 'Japan',
    tagline: 'Zen Gardens, Bamboo Groves & Tea Ceremonies',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    rating: 4.96,
    highlight: 'Optimized Crowd-Free Timing',
    testimonial: {
      quote: 'The personalized pacing kept us relaxed yet able to see every UNESCO shrine with zero travel fatigue.',
      author: 'David Tan',
      role: 'Photography Nomad',
    },
  },
  {
    id: 'dolomites',
    title: 'Tre Cime di Lavaredo',
    country: 'Italian Alps',
    tagline: 'Dramatic Peaks, Alpine Lakes & Vista Trails',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    rating: 4.99,
    highlight: 'High-Altitude Trek Curation',
    testimonial: {
      quote: 'From mountain hut bookings to sunset vistas, the itinerary precision was completely unmatched.',
      author: 'Sophia Lindqvist',
      role: 'Adventure Explorer',
    },
  },
];

export const TravelShowcase: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % DESTINATIONS.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const current = DESTINATIONS[currentIndex];

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950 flex flex-col justify-between p-8 sm:p-10 lg:p-12 text-white">
      {/* Background Scenic Image Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-0 z-0"
        >
          <img
            src={current.image}
            alt={current.title}
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          {/* Multi-layered cinematic gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />
          <div className="absolute inset-0 bg-teal-950/20 mix-blend-multiply" />
        </motion.div>
      </AnimatePresence>

      {/* Top Bar on Showcase Side */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-white shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Empowering Personalized Travel</span>
        </div>

        {/* Featured Destination Indicator Dots */}
        <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          {DESTINATIONS.map((dest, idx) => (
            <button
              key={dest.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-6 bg-teal-400' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`View ${dest.title}`}
            />
          ))}
        </div>
      </div>

      {/* Middle Floating Feature Pills */}
      <div className="relative z-10 my-auto py-8 space-y-4">
        <motion.div
          key={`headline-${current.id}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-2 max-w-lg"
        >
          <div className="inline-flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider bg-teal-950/60 backdrop-blur-sm px-2.5 py-1 rounded-md border border-teal-500/30">
            <MapPin className="w-3.5 h-3.5" />
            <span>{current.country}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white drop-shadow-md leading-tight">
            {current.title}
          </h2>

          <p className="text-sm sm:text-base text-slate-200 font-normal leading-relaxed drop-shadow">
            {current.tagline}
          </p>
        </motion.div>

        {/* Quick Highlights Row */}
        <div className="flex flex-wrap gap-2.5 pt-2">
          <div className="inline-flex items-center gap-1.5 text-xs bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-slate-100">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-semibold">{current.rating}</span>
            <span className="text-slate-300 font-light">rating</span>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-slate-100">
            <Compass className="w-3.5 h-3.5 text-teal-400" />
            <span>{current.highlight}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-slate-100">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Gems</span>
          </div>
        </div>
      </div>

      {/* Bottom Traveler Testimonial Card */}
      <div className="relative z-10">
        <motion.div
          key={`quote-${current.id}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl space-y-3"
        >
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            ))}
          </div>

          <p className="text-xs sm:text-sm text-slate-100 italic leading-relaxed font-light">
            "{current.testimonial.quote}"
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs">
            <div>
              <span className="font-semibold text-white">{current.testimonial.author}</span>
              <span className="text-slate-300 ml-2 text-[11px] font-normal">· {current.testimonial.role}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-teal-300 font-medium">
              <Globe className="w-3 h-3" />
              <span>GlobeTrotter Verified</span>
            </div>
          </div>
        </motion.div>

        {/* Footnote */}
        <p className="text-[11px] text-slate-400 mt-4 text-center font-normal">
          Explore hundreds of bespoke routes, curated restaurants, and secret scenic stops.
        </p>
      </div>
    </div>
  );
};
