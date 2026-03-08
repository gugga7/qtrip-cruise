import { BedDouble } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FloatingContinueButton } from '../components/FloatingContinueButton';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { ActivityCardSkeleton } from '../components/Skeleton';
import { useAccommodations } from '../hooks/useCatalog';
import type { AccommodationType } from '../lib/types';
import { useTripStore } from '../store/tripStore';
import { tc } from '../config/themeClasses';

interface AccommodationProps { onNext: () => void; onBack: () => void; }

export function Accommodation({ onNext, onBack }: AccommodationProps) {
  const { t } = useTranslation();
  const { selectedDestination, selectedAccommodation, setAccommodation } = useTripStore();
  const [activeAccommodation, setActiveAccommodation] = useState<AccommodationType | null>(null);
  const { accommodations: options, loading } = useAccommodations(selectedDestination?.id);
  const validationMessages = selectedAccommodation ? [] : [t('accommodation.validationMin')];

  if (!selectedDestination) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">{t('accommodation.noDestination')}</h1>
        <p className="mt-2 text-sm text-slate-500">{t('accommodation.noDestinationSub')}</p>
        <button onClick={onBack} className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm text-white">{t('accommodation.backToPrefs')}</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className={`flex items-center gap-2 ${tc.scheduleHeaderText}`}>
          <BedDouble size={16} />
          <span className="text-sm font-medium">{t('accommodation.sectionTitle')}</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
          {t('accommodation.chooseFor', { destination: selectedDestination.name })}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          {t('accommodation.chooseSub')}
        </p>
      </section>

      {loading ? (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ActivityCardSkeleton key={i} />
          ))}
        </section>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {options.map((accommodation) => (
            <ProductCard key={accommodation.id} product={accommodation} type="accommodation" isSelected={selectedAccommodation?.id === accommodation.id} onSelect={() => setActiveAccommodation(accommodation)} onQuickAdd={(e) => { e.stopPropagation(); setAccommodation(accommodation); }} onQuickRemove={(e) => { e.stopPropagation(); setAccommodation(null); }} />
          ))}
        </section>
      )}

      <ProductModal isOpen={!!activeAccommodation} onClose={() => setActiveAccommodation(null)} product={activeAccommodation} type="accommodation" onQuickAdd={(e, product) => setAccommodation(product as AccommodationType)} onQuickRemove={() => setAccommodation(null)} isSelected={!!activeAccommodation && selectedAccommodation?.id === activeAccommodation.id} />
      <FloatingContinueButton onContinue={onNext} onBack={onBack} isValid={!!selectedAccommodation} currentStep={4} totalSteps={6} validationMessages={validationMessages} nextText={t('accommodation.continueToSchedule')} />
    </div>
  );
}
