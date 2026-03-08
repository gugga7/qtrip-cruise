# QTRIP Niche Portfolio — Design Document

> Strategy document defining the 7 QTRIP niches, their feature configurations,
> recommended destinations, and customization requirements.

**Goal:** Transform the QTRIP template into 7 distinct travel planning products, each
tailored to a specific group travel use case, deployable as independent apps with
their own domains, databases, and branding.

**Template repo:** [gugga7/trip-planner](https://github.com/gugga7/trip-planner) (GitHub template)

---

## Priority Order

| # | Niche | Repo | Status |
|---|-------|------|--------|
| 1 | Bachelor & Bachelorette | `qtrip-bachelor` | Built |
| 2 | Destination Weddings | `qtrip-weddings` | Template cloned |
| 3 | Proposal Planning | `qtrip-proposals` | Template cloned |
| 4 | Group Birthday Trips | `qtrip-birthdays` | Template cloned |
| 5 | Sports Fan Travel | `qtrip-sports` | Template cloned |
| 6 | Wellness Retreats | `qtrip-wellness` | Template cloned |
| 7 | Reunion Trips | `qtrip-reunions` | Template cloned |

---

## Feature Matrix

Each niche enables/disables features via `NicheConfig.features`. This matrix shows
what each niche needs:

| Feature | Bachelor | Weddings | Proposals | Birthdays | Sports | Wellness | Reunions |
|---------|----------|----------|-----------|-----------|--------|----------|----------|
| groupBooking | yes | yes | **no** | yes | yes | yes | yes |
| votingSystem | yes | yes | **no** | yes | yes | **no** | yes |
| countdownTimer | yes | yes | yes | yes | yes | yes | yes |
| expenseSplitting | yes | yes | **no** | yes | yes | yes | yes |
| guestList | yes | yes | **no** | yes | **no** | **no** | yes |
| profilePage | yes | yes | yes | yes | yes | yes | yes |
| aiSchedule | yes | yes | yes | yes | yes | yes | yes |

### Notes on Disabled Features

**Proposals** disables group features entirely — this is a solo/couple experience.
The AI scheduler becomes the hero feature: "Plan my 3-day proposal trip with
the perfect moment, photographer timing, and romantic experiences."

**Sports** disables guestList (groups are informal, not RSVP-based) but keeps
groupBooking for coordinating tickets + accommodation.

**Wellness** disables votingSystem (retreat schedules are structured, not voted on)
and guestList (retreats are informal friend groups, not managed guest lists).

---

## Niche Details

### 1. Bachelor & Bachelorette (BUILT)

**Repo:** [qtrip-bachelor](https://github.com/gugga7/qtrip-bachelor)

**Theme:**
- Primary: `pink` / Accent: `rose`
- Gradient: `from-pink-500 via-rose-500 to-fuchsia-500`
- App name: QTRIP

**Group Size:** 8-12 (min: 4, default: 8)
**Trip Duration:** 2-3 nights

**Destinations:**
| City | Country | Currency |
|------|---------|----------|
| Marrakech | Morocco | EUR |
| Marbella | Spain | EUR |
| Faro & Algarve | Portugal | EUR |
| Barcelona | Spain | EUR |
| Mykonos | Greece | EUR |
| Las Vegas | USA | USD |
| Cartagena | Colombia | COP |
| Tulum | Mexico | MXN |

**Activity Categories:**
1. Party & Nightlife
2. Adventure & Outdoor
3. Wellness & Relaxation
4. Food & Drink
5. Culture & Sightseeing
6. Group Experiences

**Languages:** EN, FR, ES

---

### 2. Destination Weddings

**Repo:** [qtrip-weddings](https://github.com/gugga7/qtrip-weddings)

**Positioning:** Not wedding planning — the **guest experience**. "We're getting
married in Tuscany. Here's your 4-day itinerary: welcome dinner, day activities,
ceremony day, farewell brunch."

**Theme:**
- Primary: `amber` / Accent: `orange`
- Gradient: `from-amber-500 via-orange-400 to-yellow-500`
- App name: QTRIP Weddings
- Tagline: "Every guest deserves an unforgettable experience"

**Group Size:** 20-80 (min: 10, default: 40)
**Trip Duration:** 3-5 days

**Destinations:**
| City | Country | Currency |
|------|---------|----------|
| Tulum / Riviera Maya | Mexico | MXN |
| Amalfi Coast | Italy | EUR |
| Santorini | Greece | EUR |
| Marrakech | Morocco | EUR |
| Bali | Indonesia | IDR |
| Lake Como | Italy | EUR |
| Phuket | Thailand | THB |
| Algarve | Portugal | EUR |

**Activity Categories:**
1. Welcome Events (welcome dinner, cocktail reception, meet-and-greet)
2. Cultural Excursions (local tours, market visits, historic sites)
3. Beach & Water (beach day, boat excursion, snorkeling)
4. Food & Wine (tastings, cooking class, farewell brunch)
5. Wellness & Spa (couples spa, hammam, yoga session)
6. Adventure & Exploration (hiking, ATV, cenote visits)

**Languages:** EN, FR, ES, HI, AR, PT

**Key Customization:**
- Larger default group size (40 vs 8)
- Countdown timer targets "Wedding Day" instead of "Trip Date"
- Schedule includes fixed ceremony-day block (non-movable)
- Expense splitting labels as "Guest Contribution" not "Split"

---

### 3. Proposal Planning

**Repo:** [qtrip-proposals](https://github.com/gugga7/qtrip-proposals)

**Positioning:** Plan the perfect proposal moment. AI builds a 2-4 day romantic
trip with the proposal as the centerpiece — timing the sunset, booking the
photographer, coordinating the ring, planning the celebration dinner after.

**Theme:**
- Primary: `red` / Accent: `rose`
- Gradient: `from-red-400 via-rose-500 to-pink-500`
- App name: QTRIP Proposals
- Tagline: "Plan the perfect moment"

**Group Size:** 1-2 (min: 1, default: 2)
**Trip Duration:** 2-4 days

**Destinations:**
| City | Country | Currency |
|------|---------|----------|
| Paris | France | EUR |
| Santorini | Greece | EUR |
| Amalfi Coast | Italy | EUR |
| Maldives | Maldives | USD |
| New York City | USA | USD |
| Dubai | UAE | AED |
| Kyoto | Japan | JPY |
| Bora Bora | French Polynesia | XPF |

**Activity Categories:**
1. The Proposal Moment (location scouting, decor setup, timing)
2. Romantic Dining (private dinners, Michelin restaurants, rooftop reservations)
3. Photography & Video (surprise photographer, couple shoot, drone footage)
4. Ring & Logistics (ring pickup, jeweler coordination, safe storage)
5. Celebration (champagne toast, celebration dinner, calling family)
6. Romantic Experiences (couples spa, sunset cruise, hot air balloon)

**Languages:** EN, FR, AR, JA, KO

**Key Customization:**
- Group features disabled (no voting, no expense splitting, no guest list)
- AI scheduler emphasis on timing: "Propose at sunset at 18:47 at Imerovigli"
- Vendor catalog: photographers, florists, musicians (new catalog entity)
- "Secret mode" — partner can't see the plan (privacy-first UX)
- Wizard flow simplified: Destination → The Moment → Experiences → Dining → Review

---

### 4. Group Birthday Trips

**Repo:** [qtrip-birthdays](https://github.com/gugga7/qtrip-birthdays)

**Positioning:** "I'm turning 30/40/50, let's go somewhere amazing." The organizer
picks a destination, friends vote on activities, AI builds the itinerary, everyone
splits costs.

**Theme:**
- Primary: `violet` / Accent: `purple`
- Gradient: `from-violet-500 via-purple-500 to-fuchsia-500`
- App name: QTRIP Birthdays
- Tagline: "Celebrate your milestone in style"

**Group Size:** 6-15 (min: 4, default: 10)
**Trip Duration:** 3-4 nights

**Destinations:**
| City | Country | Currency |
|------|---------|----------|
| Ibiza | Spain | EUR |
| Mykonos | Greece | EUR |
| Las Vegas | USA | USD |
| Tulum | Mexico | MXN |
| Bali | Indonesia | IDR |
| Amalfi Coast | Italy | EUR |
| Cartagena | Colombia | COP |
| Napa Valley | USA | USD |

**Activity Categories:**
1. Nightlife & Parties (clubs, VIP tables, private parties)
2. Food & Drink (group dinners, wine tastings, cooking classes, brunch)
3. Beach & Pool (beach clubs, boat charters, water sports)
4. Adventure (hiking, diving, ATV, parasailing)
5. Wellness & Relaxation (spa days, yoga, villa downtime)
6. Cultural & Sightseeing (city tours, markets, sunset excursions)

**Languages:** EN, FR, ES, DE

**Key Customization:**
- Countdown timer shows "Birthday" instead of "Trip Date"
- Milestone badge system (30th, 40th, 50th — different suggested activity tiers)
- "Birthday surprise" activities (hidden from the birthday person in planning)
- Expense splitting can exclude the birthday person ("It's on us!")

---

### 5. Sports Fan Travel

**Repo:** [qtrip-sports](https://github.com/gugga7/qtrip-sports)

**Positioning:** Groups of friends traveling to Champions League away games, F1
Grand Prix, World Cup matches, NFL international series. The event is the anchor;
QTRIP plans everything around it.

**Theme:**
- Primary: `emerald` / Accent: `teal`
- Gradient: `from-emerald-500 via-teal-500 to-cyan-500`
- App name: QTRIP Sports
- Tagline: "Your crew. Your game. Sorted."

**Group Size:** 4-8 (min: 2, default: 6)
**Trip Duration:** 3-5 days

**Destinations (event-driven, rotating):**
| City | Country | Event Examples | Currency |
|------|---------|----------------|----------|
| Monaco | Monaco | F1 Grand Prix | EUR |
| Singapore | Singapore | F1 Night Race | SGD |
| London | UK | Premier League, NFL, Wimbledon | GBP |
| Barcelona | Spain | Champions League, MotoGP | EUR |
| Abu Dhabi | UAE | F1 Season Finale | AED |
| Melbourne | Australia | F1, Australian Open | AUD |
| New York | USA | NFL, 2026 World Cup | USD |
| Tokyo | Japan | F1 Suzuka, Rugby | JPY |

**Activity Categories:**
1. Match / Race Day (tickets, hospitality packages, fan zone access)
2. City Exploration (sightseeing between event days, landmarks)
3. Sports Culture (stadium tours, sports bars, museums, fan zones)
4. Food & Nightlife (local cuisine, post-game celebrations, group dinners)
5. VIP & Hospitality (pit lane walks, paddock access, luxury suites)
6. Active Experiences (go-karting, golf, group sports, simulators)

**Languages:** EN, ES, AR, DE, JA

**Key Customization:**
- Destinations are **event-driven** not just city-based — "Monaco F1 2026" not just "Monaco"
- Event date is central: countdown shows "Match Day" / "Race Day"
- Ticket tiers as a catalog entity (General, Premium, Hospitality, VIP)
- Schedule has a fixed "Event Day" block (like ceremony day in weddings)
- No guest list (informal groups, not managed invites)
- Sports-specific categories in AI prompts ("avoid scheduling activities during the race")

---

### 6. Wellness Retreats

**Repo:** [qtrip-wellness](https://github.com/gugga7/qtrip-wellness)

**Positioning:** Friend groups organizing their own wellness getaway — yoga, spa,
detox, nature. The AI scheduler balances active sessions with rest, nutrition
with movement, and group activities with solo time.

**Theme:**
- Primary: `teal` / Accent: `emerald`
- Gradient: `from-teal-400 via-emerald-400 to-green-400`
- App name: QTRIP Wellness
- Tagline: "Restore. Reconnect. Retreat."

**Group Size:** 6-15 (min: 4, default: 8)
**Trip Duration:** 3-7 days

**Destinations:**
| City | Country | Currency |
|------|---------|----------|
| Ubud, Bali | Indonesia | IDR |
| Phuket | Thailand | THB |
| Rishikesh | India | INR |
| Sedona | USA | USD |
| Tulum | Mexico | MXN |
| Algarve | Portugal | EUR |
| Bavarian Alps | Germany | EUR |
| Malibu | USA | USD |

**Activity Categories:**
1. Yoga & Movement (daily classes, Pilates, tai chi, breathwork)
2. Meditation & Mindfulness (guided meditation, sound baths, journaling)
3. Spa & Body (massages, facials, hammam, hot springs, Ayurveda)
4. Nutrition & Detox (clean eating programs, juice cleanses, cooking workshops)
5. Nature & Adventure (hiking, forest bathing, sunrise walks, waterfall visits)
6. Holistic Healing (reiki, acupuncture, chakra balancing, cacao ceremonies)

**Languages:** EN, FR, DE, JA

**Key Customization:**
- No voting system (retreat schedules are curated, not debated)
- AI scheduler understands energy flow: active morning → restorative afternoon
- Schedule includes meal blocks (nutrition is part of the program)
- Intensity levels on activities (gentle / moderate / active)
- "Digital detox" mode — optional notification to put phone away during sessions
- No guest list (informal friend groups)

---

### 7. Reunion Trips

**Repo:** [qtrip-reunions](https://github.com/gugga7/qtrip-reunions)

**Positioning:** "We haven't all been together in 5 years." Family reunions, old
college friend groups, multi-generational gatherings. The challenge: planning for
mixed ages, interests, and energy levels.

**Theme:**
- Primary: `blue` / Accent: `indigo`
- Gradient: `from-blue-500 via-indigo-500 to-violet-500`
- App name: QTRIP Reunions
- Tagline: "Bring everyone together"

**Group Size:** 10-50 (min: 6, default: 15)
**Trip Duration:** 3-5 days

**Destinations:**
| City | Country | Currency |
|------|---------|----------|
| Tuscany | Italy | EUR |
| Algarve | Portugal | EUR |
| Phuket | Thailand | THB |
| Costa Rica (Guanacaste) | Costa Rica | CRC |
| Lake Tahoe | USA | USD |
| Loire Valley | France | EUR |
| Outer Banks | USA | USD |
| Caribbean Cruise | Various | USD |

**Activity Categories:**
1. Group Meals & Cooking (family dinners, BBQs, cooking together, restaurants)
2. Beach & Pool (swimming, kayaking, water games — all ages)
3. Cultural & Heritage (ancestry visits, local history tours, museums)
4. Outdoor Adventure (hiking, biking, snorkeling — tiered by difficulty)
5. Games & Bonding (trivia nights, talent shows, sports tournaments)
6. Kids & Family (amusement parks, nature walks, crafts, youth programs)

**Languages:** EN, FR, ES, IT, HI, ZH

**Key Customization:**
- Largest default group size (15, up to 50)
- AI scheduler handles **subgroups** (activities for kids, active adults, seniors)
- Activity difficulty tiers (easy / moderate / challenging) with age suitability tags
- "Family tree" view instead of flat guest list
- Expense splitting supports unequal splits (parents pay more, kids free)
- Accommodation shows capacity prominently (villa for 20, not "1 room")

---

## Cross-Niche Synergies

The niches form a natural **customer lifecycle**:

```
Proposal → Destination Wedding → Bachelor/Bachelorette
                                        ↓
                              Group Birthday Trips (annual)
                                        ↓
                              Reunion Trips (every few years)
                              Wellness Retreats (annual)
                              Sports Fan Travel (seasonal)
```

A couple who plans a proposal through QTRIP Proposals becomes a lead for QTRIP
Weddings. Their wedding party uses QTRIP Bachelor. Their friend groups come back
for birthdays. Their families use Reunions. This is a **3-5x lifetime multiplier**
per initial customer.

## Shared Destination Overlap

Several destinations appear across multiple niches, which means shared seed data
and local operator relationships:

| Destination | Niches |
|-------------|--------|
| Algarve | Bachelor, Weddings, Wellness, Reunions |
| Tulum | Bachelor, Weddings, Birthdays, Wellness |
| Mykonos | Bachelor, Birthdays |
| Marrakech | Bachelor, Weddings |
| Bali | Weddings, Birthdays, Wellness |
| Amalfi Coast | Weddings, Proposals, Birthdays |
| Santorini | Weddings, Proposals |
| Phuket | Weddings, Wellness, Reunions |
| Las Vegas | Bachelor, Birthdays |

This means operator onboarding in one destination unlocks multiple niches.

---

## Implementation Per Niche

For each niche repo, the work is:

1. **Update `src/config/niche.ts`** — new NicheConfig with theme, features, categories, destinations
2. **Tailwind safelist** — add the niche's color prefixes
3. **Seed data** — new destinations, activities, accommodations, transports in migration
4. **Translations** — update niche-specific copy in `src/locales/`
5. **SEO** — update `index.html` (title, meta, JSON-LD), `sitemap.xml`, OG image
6. **PWA manifest** — update name, theme_color in `vite.config.ts`
7. **AI prompts** — customize AI scheduling prompts for the niche's activity types
8. **Custom features** (if any) — e.g. "Secret mode" for proposals, subgroups for reunions

Estimated effort per niche: **2-4 hours** for basic config + seed data, **1-2 days**
for custom features unique to that niche.
