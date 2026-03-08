import { Dialog } from '@headlessui/react';
import { Check, Clock, MapPin, Plus, Star, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Activity, AccommodationType, MediaItem, TransportType } from '../lib/types';
import { isAccommodation, isActivity, isTransport } from '../utils/typeGuards';
import { tc } from '../config/themeClasses';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Activity | AccommodationType | TransportType | null;
  type: 'activity' | 'accommodation' | 'transport';
  onQuickAdd: (e: React.MouseEvent, product: Activity | AccommodationType | TransportType) => void;
  onQuickRemove: (e: React.MouseEvent, product: Activity | AccommodationType | TransportType) => void;
  isSelected: boolean;
}

export function ProductModal({ isOpen, onClose, product, type, onQuickAdd, onQuickRemove, isSelected }: ProductModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  useEffect(() => setSelectedImageIndex(0), [product?.id]);
  const images = useMemo(() => {
    if (!product) return [] as MediaItem[];
    const extras = 'galleryUrls' in product ? (product.galleryUrls || []).map((url) => ({ url })) : [];
    if (isTransport(product)) return [product.vehicleImage, ...(product.interiorImages || []), ...extras].filter(Boolean) as MediaItem[];
    return [product.mainImage, ...(product.imageGallery || []), ...extras].filter(Boolean) as MediaItem[];
  }, [product]);
  if (!product) return null;

  const title = isActivity(product) ? product.title : product.name;
  const price = isAccommodation(product) ? product.pricePerNight : product.price;
  const priceSuffix = type === 'accommodation' ? 'per night' : isTransport(product) && product.pricingUnit === 'per_trip' ? 'per trip' : 'per person';

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[100]">
      <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
          <button onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-slate-700 shadow-md transition-colors hover:bg-white"><X size={18} /></button>
          <div className="max-h-[90vh] overflow-y-auto">
            {images.length > 0 && (
              <div className="relative aspect-[16/8] bg-slate-100">
                <img src={images[selectedImageIndex]?.url} alt={title} className="h-full w-full object-cover" />
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-3 right-3 flex gap-2 overflow-x-auto rounded-xl bg-black/20 p-1.5 backdrop-blur-sm">
                    {images.map((image, index) => (
                      <button key={`${image.url}-${index}`} onClick={() => setSelectedImageIndex(index)} className={`h-14 w-18 shrink-0 overflow-hidden rounded-lg border ${selectedImageIndex === index ? 'border-white' : 'border-transparent opacity-70'}`}>
                        <img src={image.url} alt={`${title} ${index + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Dialog.Title className="text-xl font-semibold text-slate-900">{title}</Dialog.Title>
                  <p className="mt-1 text-sm text-slate-500">{type === 'activity' ? 'Suggested experience' : type === 'accommodation' ? 'Suggested stay' : 'Suggested transport option'}</p>
                  {isAccommodation(product) && <div className="mt-1.5 flex items-center"><Star className="h-4 w-4 fill-current text-yellow-400" /><span className="ml-1 text-sm text-slate-600">{product.rating} / 5</span></div>}
                </div>
                <div className={`rounded-xl ${tc.bgPrimaryLight} px-4 py-2.5 text-left sm:text-right`}>
                  <div className={`text-lg font-semibold ${tc.textPrimary}`}>€{price}</div>
                  <div className="text-xs text-slate-500">{priceSuffix}</div>
                </div>
              </div>
              <p className="mb-5 text-sm text-slate-600">{product.description}</p>
              {isActivity(product) && (
                <div className="mb-5 flex flex-wrap gap-2 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs"><Clock size={14} /> {product.duration} hours</div>
                  {product.location && <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs"><MapPin size={14} /> {product.location}</div>}
                </div>
              )}
              {isAccommodation(product) && (
                <div className="mb-5">
                  <h3 className="mb-2 text-sm font-medium text-slate-900">Amenities</h3>
                  <div className="grid grid-cols-2 gap-1.5 text-sm text-slate-600">{product.amenities.map((amenity, index) => <div key={index} className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs">{amenity}</div>)}</div>
                </div>
              )}
              {isTransport(product) && (
                <div className="mb-5">
                  <h3 className="mb-2 text-sm font-medium text-slate-900">Features</h3>
                  <div className="grid grid-cols-2 gap-1.5 text-sm text-slate-600">{product.features.map((feature, index) => <div key={index} className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs">{feature}</div>)}</div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t p-5 sm:flex-row sm:justify-end">
            {isSelected && <button onClick={(e) => { onQuickRemove(e, product); onClose(); }} className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-sm text-slate-700 transition-all hover:bg-slate-200"><X size={18} />{type === 'activity' ? 'Remove activity' : type === 'accommodation' ? 'Remove stay' : 'Remove transport'}</button>}
            <button onClick={(e) => { onQuickAdd(e, product); onClose(); }} disabled={isSelected} className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm transition-all ${!isSelected ? `${tc.btnGradient} text-white ${tc.btnGradientHover}` : 'cursor-not-allowed bg-gray-100 text-gray-400'}`}>{isSelected ? <><Check size={18} />Already added</> : <><Plus size={18} />{type === 'activity' ? 'Add activity' : type === 'accommodation' ? 'Choose this stay' : 'Choose this transport'}</>}</button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
