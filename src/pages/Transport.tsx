import { PlaneTakeoff } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FloatingContinueButton } from '../components/FloatingContinueButton';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { ActivityCardSkeleton } from '../components/Skeleton';
import { useTransports } from '../hooks/useCatalog';
import type { TransportType } from '../lib/types';
import { useTripStore } from '../store/tripStore';
import { tc } from '../config/themeClasses';

interface TransportProps { onNext: () => void; onBack: () => void; }

export function Transport({ onNext, onBack }: TransportProps) {
  const { t } = useTranslation();
  const { selectedDestination, selectedTransport, setTransport } = useTripStore();
  const [activeTransport, setActiveTransport] = useState<TransportType | null>(null);
  const { transports: options, loading } = useTransports(selectedDestination?.id);
  const validationMessages = selectedTransport ? [] : [t('transport.validationMin')];

  if (!selectedDestination) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">{t('transport.noDestination')}</h1>
        <p className="mt-2 text-sm text-slate-500">{t('transport.noDestinationSub')}</p>
        <button onClick={onBack} className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm text-white">{t('transport.backToPrefs')}</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className={`flex items-center gap-2 ${tc.scheduleHeaderText}`}>
          <PlaneTakeoff size={16} />
          <span className="text-sm font-medium">{t('transport.sectionTitle')}</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
          {t('transport.chooseFor', { destination: selectedDestination.name })}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          {t('transport.chooseSub')}
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
          {options.map((transport) => (
            <ProductCard key={transport.id} product={transport} type="transport" isSelected={selectedTransport?.id === transport.id} onSelect={() => setActiveTransport(transport)} onQuickAdd={(e) => { e.stopPropagation(); setTransport(transport); }} onQuickRemove={(e) => { e.stopPropagation(); setTransport(null); }} />
          ))}
        </section>
      )}

      <ProductModal isOpen={!!activeTransport} onClose={() => setActiveTransport(null)} product={activeTransport} type="transport" onQuickAdd={(e, product) => setTransport(product as TransportType)} onQuickRemove={() => setTransport(null)} isSelected={!!activeTransport && selectedTransport?.id === activeTransport.id} />
      <FloatingContinueButton onContinue={onNext} onBack={onBack} isValid={!!selectedTransport} currentStep={3} totalSteps={6} validationMessages={validationMessages} nextText={t('transport.continueToAccommodation')} />
    </div>
  );
}
