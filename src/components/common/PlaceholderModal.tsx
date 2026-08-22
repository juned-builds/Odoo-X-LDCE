import React from 'react';
import { Sparkles, X, Compass, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';

interface PlaceholderModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  moduleName?: string;
  actionText?: string;
}

export const PlaceholderModal: React.FC<PlaceholderModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  moduleName = 'Next Development Module',
  actionText = 'Got it',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 z-10 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                <Compass className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-100/70 text-teal-800">
                <Sparkles className="w-3 h-3 text-teal-600" />
                <span>{moduleName}</span>
              </div>
              <h3 className="text-xl font-bold font-display text-slate-900">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {description}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Current Scope: Module 2 Dashboard</p>
              <p className="text-[11px] text-slate-500">
                The dashboard navigation, recent trips, upcoming trip preview, destination cards, and budget highlights are live and fully interactive in this prototype.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="primary" size="md" onClick={onClose} rightIcon={<ArrowRight className="w-4 h-4" />}>
                {actionText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
