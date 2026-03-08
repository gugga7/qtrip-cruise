import { formatDate as format } from '../lib/dateFormat';
import { Calendar, Hotel, MapPin, Plane, Sparkles, Ticket, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTripStore } from '../store/tripStore';
import { tc } from '../config/themeClasses';

export function TripSummary() {
  const { t } = useTranslation();
  const { destination, startDate, endDate, travelers, selectedActivities, selectedAccommodation, selectedTransport, getTotalCost } = useTripStore();
  const totalCost = getTotalCost();
  const nights = startDate && endDate ? Math.max(Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)), 0) : 0;

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3"><div className={`rounded-2xl ${tc.bgPrimaryLight} p-3 ${tc.textPrimary}`}><Sparkles size={18} /></div><div><h2 className="text-xl font-semibold text-slate-900">{t('tripSummary.title')}</h2><p className="text-sm text-slate-500">{t('tripSummary.liveEstimate')}</p></div></div>
      <div className="space-y-4">
        <div className="rounded-3xl bg-slate-50 p-4"><div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500"><MapPin size={16} /> {t('tripSummary.destination')}</div><p className="text-lg font-semibold text-slate-900">{destination?.name ?? t('tripSummary.chooseDestination')}</p><p className="text-sm text-slate-500">{destination?.country ?? t('tripSummary.tailorAfter')}</p></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-slate-50 p-4"><div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500"><Calendar size={16} /> {t('tripSummary.dates')}</div><p className="text-sm font-semibold text-slate-900">{startDate ? format(new Date(startDate), 'MMM d') : t('tripSummary.start')} {endDate ? `→ ${format(new Date(endDate), 'MMM d')}` : ''}</p><p className="text-xs text-slate-500">{nights > 0 ? t('common.nights', { count: nights }) : t('tripSummary.selectDates')}</p></div>
          <div className="rounded-3xl bg-slate-50 p-4"><div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500"><Users size={16} /> {t('tripSummary.travelers')}</div><p className="text-sm font-semibold text-slate-900">{travelers} {t('common.travelers')}</p><p className="text-xs text-slate-500">{t('tripSummary.budgetAware')}</p></div>
        </div>
        <div className="rounded-3xl border border-slate-200 p-4"><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-medium text-slate-500"><Ticket size={16} /> {t('tripSummary.experiences')}</div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tc.tagPrimary}`}>{t('tripSummary.selected', { count: selectedActivities.length })}</span></div><div className="space-y-2">{selectedActivities.length ? selectedActivities.slice(0, 3).map((activity) => <div key={activity.id} className="rounded-2xl bg-slate-50 px-3 py-2"><p className="text-sm font-medium text-slate-800">{activity.title}</p><p className="text-xs text-slate-500">{activity.participants ?? travelers} ppl • €{activity.price * (activity.participants ?? travelers)} • {activity.duration}h</p></div>) : <p className="text-sm text-slate-500">{t('tripSummary.noActivities')}</p>}</div></div>
        <div className="space-y-3 rounded-3xl border border-slate-200 p-4"><div className="flex items-start gap-3"><Plane className="mt-0.5 text-slate-400" size={16} /><div><p className="text-sm font-medium text-slate-800">{selectedTransport?.name ?? t('tripSummary.transportNotSelected')}</p><p className="text-xs text-slate-500">{selectedTransport ? `${selectedTransport.type} • €${selectedTransport.price}` : t('tripSummary.transportHint')}</p></div></div><div className="flex items-start gap-3"><Hotel className="mt-0.5 text-slate-400" size={16} /><div><p className="text-sm font-medium text-slate-800">{selectedAccommodation?.name ?? t('tripSummary.accommodationNotSelected')}</p><p className="text-xs text-slate-500">{selectedAccommodation ? `${selectedAccommodation.location} • €${selectedAccommodation.pricePerNight}/${t('common.night')}` : t('tripSummary.accommodationHint')}</p></div></div></div>
        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-900 p-5 text-white"><p className="text-sm text-slate-400">{t('tripSummary.estimatedTotal')}</p><p className="mt-1 text-3xl font-semibold">€{totalCost.toFixed(0)}</p><p className="mt-2 text-sm text-slate-400">{t('tripSummary.totalHint')}</p></div>
      </div>
    </div>
  );
}