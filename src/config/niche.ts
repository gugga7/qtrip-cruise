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

/* ── Bachelor / Bachelorette niche ── */

export const bachelorConfig: NicheConfig = {
  id: 'bachelor',
  name: {
    en: 'Bachelor & Bachelorette',
    fr: 'Enterrement de Vie de Garçon/Fille',
  },
  destinations: ['marrakech', 'marbella', 'faro'],
  features: {
    groupBooking: true,
    votingSystem: true,
    countdownTimer: true,
    expenseSplitting: true,
    guestList: true,
    profilePage: true,
    aiSchedule: true,
  },
  theme: {
    primary: 'pink',
    accent: 'rose',
    heroGradient: 'from-pink-500 via-rose-500 to-fuchsia-500',
    ctaGradient: 'from-pink-500 to-rose-500',
    appName: 'QTRIP',
    tagline: {
      en: 'Plan the ultimate celebration',
      fr: 'Organisez la fête parfaite',
    },
    description: {
      en: 'Plan unforgettable bachelor & bachelorette trips to Marrakech, Marbella, and the Algarve.',
      fr: 'Organisez des enterrements de vie de garçon et de jeune fille inoubliables à Marrakech, Marbella et en Algarve.',
    },
  },
  categories: [
    'Party & Nightlife',
    'Adventure & Outdoor',
    'Wellness & Relaxation',
    'Food & Drink',
    'Culture & Sightseeing',
    'Group Experiences',
  ],
  categoryColors: {
    'Party & Nightlife':     { bg: 'bg-fuchsia-50',  border: 'border-fuchsia-300', text: 'text-fuchsia-700', badge: 'bg-fuchsia-100 text-fuchsia-700', dot: 'bg-fuchsia-400', light: 'bg-fuchsia-50/60' },
    'Adventure & Outdoor':   { bg: 'bg-orange-50',   border: 'border-orange-300',  text: 'text-orange-700',  badge: 'bg-orange-100 text-orange-700',   dot: 'bg-orange-400',  light: 'bg-orange-50/60' },
    'Wellness & Relaxation': { bg: 'bg-teal-50',     border: 'border-teal-300',    text: 'text-teal-700',    badge: 'bg-teal-100 text-teal-700',       dot: 'bg-teal-400',    light: 'bg-teal-50/60' },
    'Food & Drink':          { bg: 'bg-rose-50',     border: 'border-rose-300',    text: 'text-rose-700',    badge: 'bg-rose-100 text-rose-700',       dot: 'bg-rose-400',    light: 'bg-rose-50/60' },
    'Culture & Sightseeing': { bg: 'bg-amber-50',    border: 'border-amber-300',   text: 'text-amber-700',   badge: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-400',   light: 'bg-amber-50/60' },
    'Group Experiences':     { bg: 'bg-violet-50',   border: 'border-violet-300',  text: 'text-violet-700',  badge: 'bg-violet-100 text-violet-700',   dot: 'bg-violet-400',  light: 'bg-violet-50/60' },
  },
  defaultCurrency: 'EUR',
  supportedLanguages: ['en', 'fr'],
  defaultLanguage: 'en',
  minGroupSize: 4,
  defaultGroupSize: 8,
};

/* ── Active niche ── */
// Change this to switch niches. In the future this could come from
// an env variable, subdomain detection, or a database lookup.
export const activeNiche: NicheConfig = bachelorConfig;
