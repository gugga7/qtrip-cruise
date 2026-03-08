export interface MediaItem {
  id?: number | string;
  name?: string;
  url: string;
  alternativeText?: string;
  caption?: string;
  mime?: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
}

export type ScheduleSlotName = 'Morning' | 'Afternoon' | 'Evening';

export interface ScheduleSlot {
  day: number;
  slot: ScheduleSlotName;
}

export interface Destination {
  id: string;
  slug: string;
  name: string;
  country: string;
  description: string;
  heroImageUrl: string;
  coverImageUrl?: string;
  currency: string;
  language: string;
  bestTimeToVisit: string[];
  highlights: string[];
  localTips: string[];
  healthAndSafety: string[];
  travelRequirements: string[];
  visaRequired?: boolean;
  emergencyNumber?: string;
  attributes?: {
    name: string;
    country: string;
    description: string;
    imageUrl?: string;
    coverImage?: { data?: { attributes?: { url?: string } } };
  };
}

export interface Activity {
  id: string;
  destinationId: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  location?: string;
  tags?: string[];
  mainImageUrl: string;
  galleryUrls?: string[];
  scheduled?: ScheduleSlot | null;
  participants?: number;
  mainImage?: MediaItem;
  imageGallery?: MediaItem[];
  name?: string;
}

export interface AccommodationType {
  id: string;
  destinationId: string;
  name: string;
  type: string;
  description: string;
  location: string;
  pricePerNight: number;
  rating: number;
  amenities: string[];
  mainImageUrl: string;
  galleryUrls?: string[];
  mainImage?: MediaItem | null;
  imageGallery?: MediaItem[] | null;
  destination?: Destination | null;
  price?: number;
}

export interface TransportType {
  id: string;
  destinationId: string;
  name: string;
  type: string;
  provider: string;
  price: number;
  duration: string;
  description: string;
  features: string[];
  pricingUnit: 'per_trip' | 'per_person';
  mainImageUrl: string;
  galleryUrls?: string[];
  vehicleImage?: MediaItem | null;
  interiorImages?: MediaItem[] | null;
  destination?: Destination | null;
}

export type Accommodation = AccommodationType;
export type Transport = TransportType;

export interface Booking {
  id: number | string;
  startDate: string;
  endDate: string;
  travelers: number;
  totalCost: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  activities?: { data: Array<{ id: number | string; attributes: Activity }> };
  accommodation?: { data: { id: number | string; attributes: AccommodationType } };
  transport?: { data: { id: number | string; attributes: TransportType } };
  destination?: { data: { id: number | string; attributes: Destination } };
  comments?: string;
}

export interface User {
  id: number | string;
  name: string;
  email?: string;
}

export interface CollaborationGroup {
  id: number;
  name: string;
  members: User[];
  trip: Booking;
  chat?: { messages: Array<{ id: number; user: User; content: string; timestamp: string }> };
}

export interface ScheduledActivity extends Activity {
  scheduled?: ScheduleSlot | null;
}

export interface QuoteRequestFormValues {
  fullName: string;
  email: string;
  phone: string;
  preferredContactMethod: 'email' | 'phone' | 'whatsapp';
  notes: string;
}