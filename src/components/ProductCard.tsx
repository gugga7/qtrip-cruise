import { Check, Image, Plus, Star, X } from 'lucide-react';
import type { Activity, AccommodationType, TransportType } from '../lib/types';
import { isAccommodation, isActivity, isTransport } from '../utils/typeGuards';
import { tc } from '../config/themeClasses';

interface ProductCardProps {
  product: Activity | AccommodationType | TransportType;
  type: 'activity' | 'accommodation' | 'transport';
  isSelected: boolean;
  onSelect: () => void;
  onQuickAdd: (e: React.MouseEvent) => void;
  onQuickRemove: (e: React.MouseEvent) => void;
  participants?: number;
  travelers?: number;
  onParticipantsChange?: (count: number) => void;
}

export function ProductCard({ product, type, isSelected, onSelect, onQuickAdd, onQuickRemove, participants, travelers, onParticipantsChange }: ProductCardProps) {
  const imageUrl = isTransport(product) ? product.mainImageUrl || product.vehicleImage?.url : product.mainImageUrl || product.mainImage?.url;
  const name = isActivity(product) ? product.title : product.name;
  const priceLabel = isAccommodation(product) ? `€${product.pricePerNight}/night` : isTransport(product) ? `€${product.price}${product.pricingUnit === 'per_person' ? '/person' : '/trip'}` : `€${product.price}/person`;
  const meta = isActivity(product) ? `${product.duration}h · ${product.category}` : isAccommodation(product) ? `${product.type} · ${product.location}` : `${product.type} · ${product.duration}`;

  return (
    <div onClick={onSelect} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        {imageUrl ? <img src={imageUrl} alt={name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="flex h-full w-full items-center justify-center bg-slate-100"><Image size={40} className="text-slate-400" /></div>}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/65 via-slate-950/15 to-transparent p-3 text-white">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="font-semibold leading-tight">{name}</p>
              <p className="text-xs text-white/80">{meta}</p>
            </div>
            {isAccommodation(product) && <div className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-xs backdrop-blur-sm"><Star size={12} className="fill-current text-amber-300" />{product.rating.toFixed(1)}</div>}
          </div>
        </div>
        {isSelected ? (
          <>
            <div className="absolute right-3 top-3 rounded-full bg-emerald-500 p-1.5 text-white shadow-lg"><Check size={14} /></div>
            <button onClick={(e) => { e.stopPropagation(); onQuickRemove(e); }} className={`absolute left-3 top-3 rounded-full bg-white/90 p-1.5 ${tc.textAccent} opacity-0 shadow-lg transition-opacity group-hover:opacity-100`}><X size={14} /></button>
          </>
        ) : (
          <button onClick={(e) => { e.stopPropagation(); onQuickAdd(e); }} className={`absolute right-3 top-3 rounded-full bg-white/90 p-1.5 ${tc.textPrimary} opacity-0 shadow-lg transition-opacity group-hover:opacity-100`}><Plus size={14} /></button>
        )}
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${tc.tagPrimary}`}>{type}</span>
          <span className={`text-sm font-semibold ${tc.textPrimary}`}>{priceLabel}</span>
        </div>
        <p className="line-clamp-2 text-sm text-slate-600">{product.description}</p>
      </div>
      {isSelected && type === 'activity' && participants != null && travelers != null && onParticipantsChange && (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <span className="text-xs font-medium text-slate-500">
            {participants}/{travelers} people
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onParticipantsChange(participants - 1); }}
              disabled={participants <= 1}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-30"
            >
              −
            </button>
            <span className="min-w-[2rem] text-center text-sm font-semibold text-slate-900">{participants}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onParticipantsChange(participants + 1); }}
              disabled={participants >= travelers}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-30"
            >
              +
            </button>
          </div>
          <span className={`text-xs font-semibold ${tc.textPrimary}`}>
            €{(isActivity(product) ? product.price * participants : 0)}
          </span>
        </div>
      )}
    </div>
  );
}
