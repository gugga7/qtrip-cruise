import { Compass } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FloatingContinueButton } from '../components/FloatingContinueButton';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { ActivityCardSkeleton } from '../components/Skeleton';
import { useActivities } from '../hooks/useCatalog';
import type { Activity } from '../lib/types';
import { useTripStore } from '../store/tripStore';
import { tc } from '../config/themeClasses';

interface ActivitiesProps { onNext: () => void; onBack: () => void; }

export function Activities({ onNext, onBack }: ActivitiesProps) {
  const { t } = useTranslation();
  const { selectedDestination, selectedActivities, addActivity, removeActivity, travelers, setActivityParticipants } = useTripStore();
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);
  const { activities, loading } = useActivities(selectedDestination?.id);
  const validationMessages = selectedActivities.length ? [] : [t('activities.validationMin')];

  if (!selectedDestination) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">{t('activities.noDestination')}</h1>
        <p className="mt-2 text-sm text-slate-500">{t('activities.noDestinationSub')}</p>
        <button onClick={onBack} className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm text-white">{t('activities.backToPrefs')}</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className={`flex items-center gap-2 ${tc.scheduleHeaderText}`}>
          <Compass size={16} />
          <span className="text-sm font-medium">{t('activities.sectionTitle')}</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
          {t('activities.whatToInclude', { destination: selectedDestination.name })}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          {t('activities.chooseSub')}
        </p>
      </section>

      {loading ? (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ActivityCardSkeleton key={i} />
          ))}
        </section>
      ) : activities.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Compass size={40} className="mx-auto text-slate-200" />
          <p className="mt-3 text-lg font-medium text-slate-600">{t('activities.noActivities')}</p>
          <p className="mt-1 text-sm text-slate-400">{t('activities.noActivitiesSub')}</p>
        </section>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {activities.map((activity) => (
            <ProductCard
              key={activity.id}
              product={activity}
              type="activity"
              isSelected={selectedActivities.some((item) => item.id === activity.id)}
              onSelect={() => setActiveActivity(activity)}
              onQuickAdd={(e) => { e.stopPropagation(); addActivity(activity); }}
              onQuickRemove={(e) => { e.stopPropagation(); removeActivity(activity.id); }}
              participants={selectedActivities.find((item) => item.id === activity.id)?.participants}
              travelers={travelers}
              onParticipantsChange={(count) => setActivityParticipants(activity.id, count)}
            />
          ))}
        </section>
      )}

      <ProductModal isOpen={!!activeActivity} onClose={() => setActiveActivity(null)} product={activeActivity} type="activity" onQuickAdd={(e, product) => addActivity(product as Activity)} onQuickRemove={(e, product) => removeActivity((product as Activity).id)} isSelected={!!activeActivity && selectedActivities.some((item) => item.id === activeActivity.id)} />
      <FloatingContinueButton onContinue={onNext} onBack={onBack} isValid={selectedActivities.length > 0} currentStep={2} totalSteps={6} validationMessages={validationMessages} nextText={t('activities.continueToTransport')} />
    </div>
  );
}
