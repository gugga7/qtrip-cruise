import type { Activity, AccommodationType, TransportType } from '../lib/types';

export const isActivity = (product: Activity | AccommodationType | TransportType): product is Activity => 'title' in product;
export const isAccommodation = (product: Activity | AccommodationType | TransportType): product is AccommodationType => 'pricePerNight' in product;
export const isTransport = (product: Activity | AccommodationType | TransportType): product is TransportType => 'provider' in product && 'pricingUnit' in product;