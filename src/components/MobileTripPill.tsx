import { ChevronUp, X } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { TripSummary } from './TripSummary';
import { useTripStore } from '../store/tripStore';
import { tc } from '../config/themeClasses';

export function MobileTripPill() {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const { getTotalCost, selectedActivities, selectedAccommodation, selectedTransport, currency } = useTripStore();
  const totalCost = getTotalCost();
  const itemCount = selectedActivities.length + (selectedAccommodation ? 1 : 0) + (selectedTransport ? 1 : 0);

  return (
    <>
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed right-4 top-20 z-40 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-lg xl:hidden"
      >
        <span className="text-sm font-semibold text-slate-900">
          {currency === 'EUR' ? '€' : currency} {totalCost.toFixed(0)}
        </span>
        {itemCount > 0 && (
          <span className={`flex h-5 w-5 items-center justify-center rounded-full ${tc.bgPrimary} text-xs font-medium text-white`}>
            {itemCount}
          </span>
        )}
        <ChevronUp size={14} className="text-slate-400" />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm xl:hidden"
              onClick={() => setIsExpanded(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-slate-50 p-4 pb-8 xl:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">{t('tripSummary.title')}</h2>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-200"
                >
                  <X size={20} />
                </button>
              </div>
              <TripSummary />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
