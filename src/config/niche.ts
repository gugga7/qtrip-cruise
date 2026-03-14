/* ════════════════════════════════════════════════════════════════
   Niche Configuration System

   Each niche is a config object that controls:
   - Theme (colors, gradients, branding)
   - Feature flags (which modules are enabled)
   - Destinations (which cities this niche serves)
   - Categories (activity categories for this niche)
   - Supported languages
   - Default settings
   ════════════════════════════════════════════════════════════════ */

export interface NicheFeatures {
  groupBooking: boolean;
  votingSystem: boolean;
  countdownTimer: boolean;
  expenseSplitting: boolean;
  guestList: boolean;
  profilePage: boolean;
  aiSchedule: boolean;
}

export interface NicheTheme {
  /** Tailwind color prefix, e.g. 'pink' → bg-pink-500, text-pink-700 */
  primary: string;
  /** Secondary accent color prefix */
  accent: string;
  /** Gradient classes for hero sections */
  heroGradient: string;
  /** Gradient for buttons and CTAs */
  ctaGradient: string;
  /** App name displayed in the UI */
  appName: string;
  /** Tagline shown on landing/header */
  tagline: Record<string, string>;
  /** Description for SEO / meta */
  description: Record<string, string>;
}

export interface CategoryColor {
  bg: string;
  border: string;
  text: string;
  badge: string;
  dot: string;
  light: string;
}

export interface NicheConfig {
  /** Unique niche identifier */
  id: string;
  /** Display name for the niche */
  name: Record<string, string>;
  /** Which destinations are available */
  destinations: string[];
  /** Enabled features */
  features: NicheFeatures;
  /** Visual theme */
  theme: NicheTheme;
  /** Activity categories for this niche */
  categories: string[];
  /** Color scheme per activity category (key = category name) */
  categoryColors: Record<string, CategoryColor>;
  /** Default currency */
  defaultCurrency: string;
  /** Supported languages (ISO codes) */
  supportedLanguages: string[];
  /** Default language */
  defaultLanguage: string;
  /** Minimum group size */
  minGroupSize: number;
  /** Default group size */
  defaultGroupSize: number;
}

/* ── Cruise Onshore Tours niche ── */

export const cruiseConfig: NicheConfig = {
  id: 'cruise',
  name: {
    en: 'Cruise Onshore Tours',
    fr: 'Excursions à Terre',
    es: 'Excursiones en Puerto',
  },
  destinations: ['barcelona', 'dubrovnik', 'santorini', 'naples', 'nassau', 'cozumel'],
  features: {
    groupBooking: true,
    votingSystem: true,
    countdownTimer: true,
    expenseSplitting: true,
    guestList: false,
    profilePage: true,
    aiSchedule: true,
  },
  theme: {
    primary: 'sky',
    accent: 'blue',
    heroGradient: 'from-sky-500 via-blue-500 to-indigo-600',
    ctaGradient: 'from-sky-500 to-blue-600',
    appName: 'QTRIP Shore',
    tagline: {
      en: 'Make every port count',
      fr: 'Maximisez chaque escale',
      es: 'Aprovecha cada puerto',
    },
    description: {
      en: 'Skip overpriced ship excursions. Plan your own port-day adventures with curated activities, local guides, and tight timing.',
      fr: 'Oubliez les excursions hors de prix du bateau. Planifiez vos propres aventures portuaires avec des activités sélectionnées et un timing parfait.',
      es: 'Olvídate de las excursiones caras del barco. Planifica tus propias aventuras en puerto con actividades seleccionadas y horarios precisos.',
    },
  },
  categories: [
    'Must-See Landmarks',
    'Food & Local Flavour',
    'Beach & Water',
    'Adventure & Active',
    'Shopping & Markets',
    'Cultural Deep Dive',
  ],
  categoryColors: {
    'Must-See Landmarks':   { bg: 'bg-sky-50',     border: 'border-sky-300',    text: 'text-sky-700',    badge: 'bg-sky-100 text-sky-700',       dot: 'bg-sky-400',    light: 'bg-sky-50/60' },
    'Food & Local Flavour': { bg: 'bg-amber-50',   border: 'border-amber-300',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-400',  light: 'bg-amber-50/60' },
    'Beach & Water':        { bg: 'bg-cyan-50',    border: 'border-cyan-300',   text: 'text-cyan-700',   badge: 'bg-cyan-100 text-cyan-700',     dot: 'bg-cyan-400',   light: 'bg-cyan-50/60' },
    'Adventure & Active':   { bg: 'bg-orange-50',  border: 'border-orange-300', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700',  dot: 'bg-orange-400', light: 'bg-orange-50/60' },
    'Shopping & Markets':   { bg: 'bg-rose-50',    border: 'border-rose-300',   text: 'text-rose-700',   badge: 'bg-rose-100 text-rose-700',     dot: 'bg-rose-400',   light: 'bg-rose-50/60' },
    'Cultural Deep Dive':   { bg: 'bg-indigo-50',  border: 'border-indigo-300', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700',  dot: 'bg-indigo-400', light: 'bg-indigo-50/60' },
  },
  defaultCurrency: 'EUR',
  supportedLanguages: ['en', 'fr', 'es'],
  defaultLanguage: 'en',
  minGroupSize: 2,
  defaultGroupSize: 4,
};

/* ── Active niche ── */
export const activeNiche: NicheConfig = cruiseConfig;
