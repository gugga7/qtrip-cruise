# Creating a New Niche from QTRIP

This guide walks you through forking QTRIP to create a new niche travel planning app.

## Quick Start

1. Fork/clone the repo
2. Add your niche config to `src/config/niche.ts`
3. Set `activeNiche` to your new config
4. Update Supabase with your destinations and activities
5. Update translations in `src/locales/`
6. Update SEO in `index.html` and `public/sitemap.xml`
7. Deploy

## Step-by-Step

### 1. Define Your Niche Config

Edit `src/config/niche.ts`. Copy `bachelorConfig` as a template:

```typescript
export const yourNicheConfig: NicheConfig = {
  id: 'your-niche',
  name: {
    en: 'Your Niche Name',
    fr: 'Nom de votre niche',
  },
  destinations: ['city-slug-1', 'city-slug-2'],
  features: {
    groupBooking: true,      // Group creation & invite links
    votingSystem: false,      // Activity voting within groups
    countdownTimer: true,     // Countdown to trip date
    expenseSplitting: false,  // Split costs among group members
    guestList: true,          // Guest list management
    profilePage: true,        // User profile with bookings
    aiSchedule: true,         // AI-powered itinerary suggestions
  },
  theme: {
    primary: 'blue',          // Tailwind color prefix
    accent: 'indigo',         // Secondary color prefix
    heroGradient: 'from-blue-500 via-indigo-500 to-violet-500',
    ctaGradient: 'from-blue-500 to-indigo-500',
    appName: 'YourApp',
    tagline: { en: 'Your tagline', fr: 'Votre slogan' },
    description: { en: 'SEO description', fr: 'Description SEO' },
  },
  categories: [
    'Category 1',
    'Category 2',
    'Category 3',
  ],
  categoryColors: {
    'Category 1': { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400', light: 'bg-blue-50/60' },
    'Category 2': { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400', light: 'bg-emerald-50/60' },
    'Category 3': { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400', light: 'bg-amber-50/60' },
  },
  defaultCurrency: 'EUR',
  supportedLanguages: ['en', 'fr'],
  defaultLanguage: 'en',
  minGroupSize: 2,
  defaultGroupSize: 4,
};
```

Then set the active niche:

```typescript
export const activeNiche: NicheConfig = yourNicheConfig;
```

### 2. Tailwind Safelist

The theme uses dynamic Tailwind classes (`bg-${color}-500`). Add your color prefixes to `tailwind.config.js` safelist:

```javascript
safelist: [
  { pattern: /^(bg|text|border|ring|shadow|from|via|to|hover:bg|hover:text|hover:border|focus:border|focus:ring|border-t)-(blue|indigo|violet)-(50|100|200|300|400|500|600|700|800|900)/ },
]
```

### 3. Database Setup

#### Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Seed Your Destinations

The migration at `supabase/migrations/20260308100000_catalog_tables.sql` contains bachelor niche seed data. For your niche:

1. Run `supabase db reset` to apply the schema
2. Insert your destinations via admin panel or SQL:

```sql
INSERT INTO destinations (id, name, country, description, hero_image_url, currency, language, niche_id, is_active)
VALUES ('your-city', 'Your City', 'Country', 'Description...', 'https://...', 'EUR', 'English', 'your-niche', true);
```

3. Add activities, accommodations, and transports for each destination
4. Add an AI config for your niche:

```sql
INSERT INTO ai_configs (niche_id, model, system_prompt, scheduling_prompt)
VALUES ('your-niche', 'gpt-4o-mini', 'You are a travel planner...', 'Given these activities...');
```

### 4. Translations

Update `src/locales/en/common.json` and `src/locales/fr/common.json`:

- Change niche-specific copy (taglines, descriptions)
- Category names if they differ
- Any niche-specific terminology

### 5. SEO Updates

- **`index.html`**: Update title, meta description, OG tags, JSON-LD schemas
- **`public/sitemap.xml`**: Update domain
- **`public/og-image.svg`**: Update branding colors and text
- **`src/components/SEO.tsx`**: Update `BASE_URL` constant
- **`public/robots.txt`**: Update sitemap URL domain

### 6. PWA Manifest

Update `vite.config.ts` → VitePWA manifest:
- `name`, `short_name`, `description`
- `theme_color` (match your primary color)

## Architecture Overview

```
src/
  config/
    niche.ts          ← Niche definition (THE source of truth)
    themeClasses.ts   ← Auto-derives Tailwind classes from niche theme
  hooks/
    useNiche.ts       ← useNiche(), useFeature(), useNicheText()
    useCatalog.ts     ← Fetches destinations/activities from Supabase
  pages/              ← All pages use theme classes (tc.*)
  components/         ← Reusable UI components
  admin/              ← Admin dashboard
  locales/            ← i18n translations
```

## Feature Flags

Toggle features via `features` in your niche config. Components check `useFeature('featureName')` before rendering. Disabled features are completely hidden from the UI.

## What You Get Out of the Box

- Multi-step trip planning wizard (destination → activities → transport → accommodation → schedule → review)
- AI-powered schedule suggestions
- Group booking with invite links
- Expense splitting
- Activity voting
- User profiles with booking history
- Admin dashboard (destinations, products, AI config, quote review)
- i18n (EN/FR, extensible)
- PWA with offline support
- SEO (helmet, sitemap, JSON-LD)
- Responsive design with Tailwind CSS
