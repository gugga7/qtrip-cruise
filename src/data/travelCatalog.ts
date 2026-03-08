import type { AccommodationType, Activity, Destination, TransportType } from '../lib/types';

const image = (url: string) => ({ url, mime: 'image/jpeg' });

/* ════════════════════════════════════════════════════════════════
   DESTINATIONS — Bachelor / Bachelorette focus
   ════════════════════════════════════════════════════════════════ */

export const destinations: Destination[] = [
  {
    id: 'marrakech',
    slug: 'marrakech',
    name: 'Marrakech',
    country: 'Morocco',
    description: 'Exotic riads, rooftop parties, desert adventures, and hammam rituals — the ultimate celebration destination.',
    heroImageUrl: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=1200',
    coverImageUrl: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=1200',
    currency: 'EUR',
    language: 'Arabic / French',
    bestTimeToVisit: ['Mar–May', 'Sep–Nov'],
    highlights: ['Private riad takeovers', 'Quad biking in the Palmeraie', 'VIP rooftop parties', 'Traditional hammam experiences'],
    localTips: ['Carry cash for souk shopping.', 'Arrange airport transfers ahead of time.', 'Group restaurants should be booked in advance.', 'Dress modestly in the medina, anything goes at private venues.'],
    healthAndSafety: ['Use licensed guides and taxis.', 'Stay hydrated — it gets very hot.', 'Keep hotel contact details with you.', 'Travel in groups at night.'],
    travelRequirements: ['Passport required.', 'Visa depends on nationality — most EU citizens exempt.', 'Travel insurance strongly recommended.'],
    visaRequired: false,
    emergencyNumber: '19',
    attributes: { name: 'Marrakech', country: 'Morocco', description: 'Exotic riads, rooftop parties, desert adventures, and hammam rituals.', imageUrl: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=1200', coverImage: { data: { attributes: { url: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=1200' } } } },
  },
  {
    id: 'marbella',
    slug: 'marbella',
    name: 'Marbella',
    country: 'Spain',
    description: 'Beach clubs, yacht parties, nightlife, and Mediterranean luxury — Marbella is the go-to for glamorous celebrations.',
    heroImageUrl: 'https://images.unsplash.com/photo-1511316695145-4992006fde05?w=1200',
    coverImageUrl: 'https://images.unsplash.com/photo-1511316695145-4992006fde05?w=1200',
    currency: 'EUR',
    language: 'Spanish',
    bestTimeToVisit: ['May–Sep'],
    highlights: ['Beach club day beds', 'Puerto Banús nightlife', 'Yacht & boat parties', 'Old town tapas trails'],
    localTips: ['Book beach clubs at least 2 weeks ahead in summer.', 'Puerto Banús is walkable from many hotels.', 'Pre-book restaurant terraces for sunset.', 'Uber works well for nightlife.'],
    healthAndSafety: ['Apply sunscreen generously.', 'Stay hydrated at beach clubs.', 'Keep valuables secure at the beach.', '112 is the emergency number.'],
    travelRequirements: ['Passport or EU ID card.', 'Schengen rules apply.', 'Travel insurance recommended.'],
    visaRequired: false,
    emergencyNumber: '112',
    attributes: { name: 'Marbella', country: 'Spain', description: 'Beach clubs, yacht parties, nightlife, and Mediterranean luxury.', imageUrl: 'https://images.unsplash.com/photo-1511316695145-4992006fde05?w=1200', coverImage: { data: { attributes: { url: 'https://images.unsplash.com/photo-1511316695145-4992006fde05?w=1200' } } } },
  },
  {
    id: 'faro',
    slug: 'faro',
    name: 'Faro & Algarve',
    country: 'Portugal',
    description: 'Stunning coastline, boat parties, surf vibes, and lively bars — the Algarve delivers sun-soaked celebrations.',
    heroImageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd6b?w=1200',
    coverImageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd6b?w=1200',
    currency: 'EUR',
    language: 'Portuguese',
    bestTimeToVisit: ['May–Oct'],
    highlights: ['Benagil cave boat trips', 'Albufeira strip nightlife', 'Cliff-top beach bars', 'Water sports & surf'],
    localTips: ['Rent a car to explore hidden beaches.', 'Albufeira old town has the best nightlife.', 'Book boat tours early in peak season.', 'Many venues offer group packages.'],
    healthAndSafety: ['Strong currents on some beaches — check flags.', 'Use sunscreen and hats.', 'Tap water is safe to drink.', '112 is the emergency number.'],
    travelRequirements: ['Passport or EU ID card.', 'Schengen rules apply.', 'Travel insurance recommended.'],
    visaRequired: false,
    emergencyNumber: '112',
    attributes: { name: 'Faro & Algarve', country: 'Portugal', description: 'Stunning coastline, boat parties, surf vibes, and lively bars.', imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd6b?w=1200', coverImage: { data: { attributes: { url: 'https://images.unsplash.com/photo-1555881400-74d7acaacd6b?w=1200' } } } },
  },
];

/* ════════════════════════════════════════════════════════════════
   ACTIVITIES
   Categories: Party & Nightlife, Adventure & Outdoor,
               Wellness & Relaxation, Food & Drink,
               Culture & Sightseeing, Group Experiences
   ════════════════════════════════════════════════════════════════ */

export const activities: Activity[] = [
  /* ─── MARRAKECH ─── */
  // Party & Nightlife
  { id: 'mk-rooftop-party', destinationId: 'marrakech', title: 'VIP Rooftop Party Night', description: 'Private rooftop setup with DJ, cocktails, shisha, and city views. The ultimate group night out.', duration: 4, price: 85, category: 'Party & Nightlife', location: 'Hivernage', tags: ['party', 'nightlife', 'vip', 'evening'], mainImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'), imageGallery: [] },
  { id: 'mk-bar-crawl', destinationId: 'marrakech', title: 'Guided Bar & Lounge Crawl', description: 'Hit the best bars in Guéliz and Hivernage with a local guide, skip-the-line access, and welcome shots.', duration: 3, price: 45, category: 'Party & Nightlife', location: 'Guéliz', tags: ['party', 'nightlife', 'evening', 'drinks'], mainImageUrl: 'https://images.unsplash.com/photo-1575444758702-4a6b9222c016?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1575444758702-4a6b9222c016?w=800'), imageGallery: [] },
  // Adventure & Outdoor
  { id: 'mk-quad-biking', destinationId: 'marrakech', title: 'Quad Biking in the Palmeraie', description: 'Adrenaline-fueled quad bike session through palm groves and desert trails. Helmets and guides included.', duration: 2, price: 55, category: 'Adventure & Outdoor', location: 'Palmeraie', tags: ['adventure', 'outdoor', 'adrenaline'], mainImageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800'), imageGallery: [] },
  { id: 'mk-camel-sunset', destinationId: 'marrakech', title: 'Sunset Camel Ride', description: 'Group camel trek through the Palmeraie at golden hour with mint tea and photo stops.', duration: 2, price: 35, category: 'Adventure & Outdoor', location: 'Palmeraie', tags: ['outdoor', 'sunset', 'photo'], mainImageUrl: 'https://images.unsplash.com/photo-1493814100601-2914e1e4739b?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1493814100601-2914e1e4739b?w=800'), imageGallery: [] },
  // Wellness & Relaxation
  { id: 'mk-hammam', destinationId: 'marrakech', title: 'Luxury Hammam & Spa Ritual', description: 'Traditional hammam with eucalyptus steam, black soap scrub, argan oil massage, and mint tea.', duration: 3, price: 75, category: 'Wellness & Relaxation', location: 'Medina', tags: ['spa', 'relaxing', 'wellness'], mainImageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800'), imageGallery: [] },
  { id: 'mk-pool-day', destinationId: 'marrakech', title: 'Private Pool Day Party', description: 'Exclusive pool access at a luxury villa with music, cocktails, BBQ, and sun loungers for the group.', duration: 5, price: 65, category: 'Wellness & Relaxation', location: 'Palmeraie', tags: ['pool', 'relaxing', 'party'], mainImageUrl: 'https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc?w=800'), imageGallery: [] },
  // Food & Drink
  { id: 'mk-cooking-class', destinationId: 'marrakech', title: 'Moroccan Cooking Class', description: 'Learn to make tagine, couscous, and Moroccan pastries at a private riad kitchen with a local chef.', duration: 3, price: 50, category: 'Food & Drink', location: 'Medina', tags: ['food', 'cooking', 'group'], mainImageUrl: 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=800'), imageGallery: [] },
  { id: 'mk-cocktail-class', destinationId: 'marrakech', title: 'Rooftop Cocktail Masterclass', description: 'Mix Moroccan-inspired cocktails on a panoramic rooftop with a professional mixologist.', duration: 2, price: 40, category: 'Food & Drink', location: 'Guéliz', tags: ['drinks', 'cocktails', 'evening', 'group'], mainImageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800'), imageGallery: [] },
  // Culture & Sightseeing
  { id: 'mk-medina-walk', destinationId: 'marrakech', title: 'Medina Discovery Walk', description: 'Guided walk through the souks, Bahia Palace, and hidden squares with a local storyteller.', duration: 3, price: 30, category: 'Culture & Sightseeing', location: 'Medina', tags: ['guided', 'culture', 'sightseeing'], mainImageUrl: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800'), imageGallery: [] },
  { id: 'mk-majorelle', destinationId: 'marrakech', title: 'Majorelle Garden & YSL Museum', description: 'Visit the iconic blue garden and Yves Saint Laurent museum. Perfect morning activity with great photo ops.', duration: 2, price: 25, category: 'Culture & Sightseeing', location: 'Guéliz', tags: ['culture', 'photo', 'iconic'], mainImageUrl: 'https://images.unsplash.com/photo-1560441190-c3b49e07c4a4?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1560441190-c3b49e07c4a4?w=800'), imageGallery: [] },
  // Group Experiences
  { id: 'mk-private-chef', destinationId: 'marrakech', title: 'Private Chef Dinner', description: 'A dedicated chef prepares a multi-course Moroccan feast at your riad with live music.', duration: 3, price: 70, category: 'Group Experiences', location: 'Your Riad', tags: ['group', 'food', 'evening', 'private'], mainImageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'), imageGallery: [] },
  { id: 'mk-henna-party', destinationId: 'marrakech', title: 'Henna Art & Tea Ceremony', description: 'Get traditional henna designs while sipping mint tea on a rooftop — a perfect pre-celebration ritual.', duration: 2, price: 30, category: 'Group Experiences', location: 'Medina', tags: ['group', 'culture', 'photo'], mainImageUrl: 'https://images.unsplash.com/photo-1595854341625-f2e1764257ec?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1595854341625-f2e1764257ec?w=800'), imageGallery: [] },

  /* ─── MARBELLA ─── */
  // Party & Nightlife
  { id: 'mb-beach-club', destinationId: 'marbella', title: 'VIP Beach Club Day', description: 'Reserved daybeds, bottle service, DJ, and Mediterranean vibes at a top Marbella beach club.', duration: 5, price: 120, category: 'Party & Nightlife', location: 'Golden Mile', tags: ['party', 'beach', 'vip', 'daytime'], mainImageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800'), imageGallery: [] },
  { id: 'mb-puerto-night', destinationId: 'marbella', title: 'Puerto Banús Night Out', description: 'Guided nightlife tour of Puerto Banús with VIP entry, welcome drinks, and skip-the-line at top clubs.', duration: 4, price: 90, category: 'Party & Nightlife', location: 'Puerto Banús', tags: ['party', 'nightlife', 'evening', 'vip'], mainImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800'), imageGallery: [] },
  { id: 'mb-pool-party', destinationId: 'marbella', title: 'Villa Pool Party', description: 'Private villa with infinity pool, DJ, catering, and full bar setup for the ultimate group celebration.', duration: 6, price: 95, category: 'Party & Nightlife', location: 'Nueva Andalucía', tags: ['party', 'pool', 'private', 'daytime'], mainImageUrl: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800'), imageGallery: [] },
  // Adventure & Outdoor
  { id: 'mb-yacht', destinationId: 'marbella', title: 'Private Yacht Cruise', description: 'Half-day yacht charter along the Costa del Sol with swimming stops, snacks, and champagne.', duration: 4, price: 150, category: 'Adventure & Outdoor', location: 'Puerto Banús Marina', tags: ['yacht', 'sea', 'luxury', 'photo'], mainImageUrl: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800'), imageGallery: [] },
  { id: 'mb-jet-ski', destinationId: 'marbella', title: 'Jet Ski Safari', description: 'Guided jet ski tour along the coast with stops at hidden coves. Life jackets and instruction included.', duration: 2, price: 80, category: 'Adventure & Outdoor', location: 'Marbella Beach', tags: ['adventure', 'adrenaline', 'sea'], mainImageUrl: 'https://images.unsplash.com/photo-1625757511593-7cb6fd10b9f6?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1625757511593-7cb6fd10b9f6?w=800'), imageGallery: [] },
  // Wellness & Relaxation
  { id: 'mb-spa-day', destinationId: 'marbella', title: 'Luxury Spa & Wellness Day', description: 'Full spa circuit with massage, facial, jacuzzi, and relaxation area at a 5-star resort.', duration: 4, price: 110, category: 'Wellness & Relaxation', location: 'Golden Mile', tags: ['spa', 'relaxing', 'wellness', 'luxury'], mainImageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800'), imageGallery: [] },
  { id: 'mb-yoga-beach', destinationId: 'marbella', title: 'Sunrise Beach Yoga', description: 'Group yoga session on the beach at sunrise with smoothies and fresh fruit to follow.', duration: 1.5, price: 30, category: 'Wellness & Relaxation', location: 'Nikki Beach Area', tags: ['wellness', 'morning', 'beach'], mainImageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'), imageGallery: [] },
  // Food & Drink
  { id: 'mb-tapas-tour', destinationId: 'marbella', title: 'Old Town Tapas Trail', description: 'Guided walk through Marbella old town hitting 4 authentic tapas bars with wine pairings.', duration: 3, price: 55, category: 'Food & Drink', location: 'Casco Antiguo', tags: ['food', 'tapas', 'wine', 'group'], mainImageUrl: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=800'), imageGallery: [] },
  { id: 'mb-wine-tasting', destinationId: 'marbella', title: 'Andalusian Wine Tasting', description: 'Private wine tasting at a local vineyard with charcuterie boards and expert sommelier.', duration: 2.5, price: 60, category: 'Food & Drink', location: 'Ronda area', tags: ['wine', 'tasting', 'group'], mainImageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800'), imageGallery: [] },
  // Culture & Sightseeing
  { id: 'mb-old-town', destinationId: 'marbella', title: 'Marbella Old Town Tour', description: 'Stroll through whitewashed streets, Plaza de los Naranjos, and artisan shops with a local guide.', duration: 2, price: 25, category: 'Culture & Sightseeing', location: 'Casco Antiguo', tags: ['culture', 'sightseeing', 'photo'], mainImageUrl: 'https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=800'), imageGallery: [] },
  // Group Experiences
  { id: 'mb-dance-class', destinationId: 'marbella', title: 'Flamenco & Salsa Dance Class', description: 'Private group dance class with professional instructors, followed by sangria on the terrace.', duration: 2, price: 40, category: 'Group Experiences', location: 'Marbella Center', tags: ['group', 'dance', 'fun'], mainImageUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800'), imageGallery: [] },
  { id: 'mb-karaoke', destinationId: 'marbella', title: 'Private Karaoke Night', description: 'VIP karaoke room with drinks package, song library, and disco lights for the group.', duration: 3, price: 35, category: 'Group Experiences', location: 'Puerto Banús', tags: ['group', 'party', 'evening', 'fun'], mainImageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800'), imageGallery: [] },
  { id: 'mb-go-kart', destinationId: 'marbella', title: 'Go-Kart Grand Prix', description: 'Competitive group go-karting with timed laps, podium ceremony, and bragging rights.', duration: 2, price: 45, category: 'Group Experiences', location: 'San Pedro', tags: ['adventure', 'group', 'competition'], mainImageUrl: 'https://images.unsplash.com/photo-1623776055032-c70e8d4d3b65?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1623776055032-c70e8d4d3b65?w=800'), imageGallery: [] },

  /* ─── FARO & ALGARVE ─── */
  // Party & Nightlife
  { id: 'fa-strip-night', destinationId: 'faro', title: 'Albufeira Strip Night Out', description: 'Guided pub crawl along the famous Albufeira strip with free shots, VIP entries, and group games.', duration: 4, price: 40, category: 'Party & Nightlife', location: 'Albufeira Strip', tags: ['party', 'nightlife', 'evening', 'drinks'], mainImageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800'), imageGallery: [] },
  { id: 'fa-boat-party', destinationId: 'faro', title: 'Catamaran Party Cruise', description: 'All-inclusive catamaran cruise with open bar, DJ, swimming stops, and coastline views.', duration: 4, price: 70, category: 'Party & Nightlife', location: 'Albufeira Marina', tags: ['party', 'boat', 'sea', 'daytime'], mainImageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'), imageGallery: [] },
  // Adventure & Outdoor
  { id: 'fa-benagil', destinationId: 'faro', title: 'Benagil Cave & Coast Boat Tour', description: 'Explore the famous Benagil sea cave and dramatic Algarve coastline by speedboat.', duration: 2.5, price: 45, category: 'Adventure & Outdoor', location: 'Benagil', tags: ['boat', 'nature', 'photo', 'iconic'], mainImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'), imageGallery: [] },
  { id: 'fa-surf', destinationId: 'faro', title: 'Group Surf Lesson', description: 'Beginner-friendly group surf session with certified instructors, wetsuits, and boards included.', duration: 3, price: 50, category: 'Adventure & Outdoor', location: 'Sagres', tags: ['adventure', 'surf', 'outdoor', 'group'], mainImageUrl: 'https://images.unsplash.com/photo-1502680390548-bdbac40e4ce3?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1502680390548-bdbac40e4ce3?w=800'), imageGallery: [] },
  { id: 'fa-jet-ski', destinationId: 'faro', title: 'Jet Ski Adventure', description: 'High-speed jet ski ride along the Algarve coast with cliff views and racing option.', duration: 1.5, price: 65, category: 'Adventure & Outdoor', location: 'Vilamoura', tags: ['adventure', 'adrenaline', 'sea'], mainImageUrl: 'https://images.unsplash.com/photo-1625757511593-7cb6fd10b9f6?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1625757511593-7cb6fd10b9f6?w=800'), imageGallery: [] },
  // Wellness & Relaxation
  { id: 'fa-spa-resort', destinationId: 'faro', title: 'Resort Spa Morning', description: 'Relaxing spa session at a 5-star Algarve resort with massage, pool, and ocean views.', duration: 3, price: 85, category: 'Wellness & Relaxation', location: 'Vilamoura', tags: ['spa', 'relaxing', 'wellness', 'morning'], mainImageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6c?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1540555700478-4be289fbec6c?w=800'), imageGallery: [] },
  { id: 'fa-beach-chill', destinationId: 'faro', title: 'Hidden Beach & Cliff Bar', description: 'Visit a secluded golden beach followed by drinks at a clifftop bar with panoramic views.', duration: 4, price: 25, category: 'Wellness & Relaxation', location: 'Carvoeiro', tags: ['beach', 'relaxing', 'photo'], mainImageUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800'), imageGallery: [] },
  // Food & Drink
  { id: 'fa-seafood-feast', destinationId: 'faro', title: 'Seafood & Wine Feast', description: 'Group dinner at a traditional Algarve seafood restaurant with cataplana, grilled fish, and local wines.', duration: 3, price: 55, category: 'Food & Drink', location: 'Olhão', tags: ['food', 'seafood', 'wine', 'evening'], mainImageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800'), imageGallery: [] },
  { id: 'fa-cocktail-sunset', destinationId: 'faro', title: 'Sunset Cocktail Workshop', description: 'Learn to craft Portuguese-inspired cocktails at a rooftop bar while watching the Algarve sunset.', duration: 2, price: 40, category: 'Food & Drink', location: 'Faro', tags: ['drinks', 'cocktails', 'sunset', 'evening'], mainImageUrl: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800'), imageGallery: [] },
  // Culture & Sightseeing
  { id: 'fa-faro-town', destinationId: 'faro', title: 'Faro Old Town & Ria Formosa', description: 'Explore the walled old town, cathedral views, and take a short boat ride through Ria Formosa lagoon.', duration: 3, price: 30, category: 'Culture & Sightseeing', location: 'Faro', tags: ['culture', 'nature', 'sightseeing'], mainImageUrl: 'https://images.unsplash.com/photo-1548707309-dcebeab426c8?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1548707309-dcebeab426c8?w=800'), imageGallery: [] },
  // Group Experiences
  { id: 'fa-paintball', destinationId: 'faro', title: 'Paintball Battle', description: 'Outdoor paintball session with full gear, multiple game modes, and group competition.', duration: 2.5, price: 35, category: 'Group Experiences', location: 'Albufeira', tags: ['adventure', 'group', 'competition'], mainImageUrl: 'https://images.unsplash.com/photo-1565711561500-49678a10a63f?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1565711561500-49678a10a63f?w=800'), imageGallery: [] },
  { id: 'fa-escape-room', destinationId: 'faro', title: 'Group Escape Room', description: 'Team-based escape room challenge with themed rooms and a celebratory drink afterwards.', duration: 1.5, price: 25, category: 'Group Experiences', location: 'Albufeira', tags: ['group', 'fun', 'team'], mainImageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800'), imageGallery: [] },
  { id: 'fa-life-drawing', destinationId: 'faro', title: 'Life Drawing Class', description: 'A hilarious group life drawing session with a model, an art instructor, prosecco, and plenty of laughs.', duration: 2, price: 35, category: 'Group Experiences', location: 'Albufeira', tags: ['group', 'fun', 'creative'], mainImageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800'), imageGallery: [] },
];

/* ════════════════════════════════════════════════════════════════
   ACCOMMODATIONS
   ════════════════════════════════════════════════════════════════ */

export const accommodations: AccommodationType[] = [
  /* ─── MARRAKECH ─── */
  { id: 'mk-riad-luxury', destinationId: 'marrakech', name: 'Riad Sapphire', type: 'Private Riad', description: 'Exclusive riad takeover with 6 bedrooms, courtyard pool, rooftop terrace, and private chef available.', location: 'Medina', pricePerNight: 320, price: 320, rating: 4.9, amenities: ['Private pool', 'Rooftop terrace', 'Breakfast included', 'Airport transfer', 'AC', 'Wi-Fi'], mainImageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800'), imageGallery: [] },
  { id: 'mk-villa', destinationId: 'marrakech', name: 'Villa Rosa Palmeraie', type: 'Villa with Pool', description: 'Spacious villa in the Palmeraie with large pool, gardens, BBQ area, and room for 12 guests.', location: 'Palmeraie', pricePerNight: 450, price: 450, rating: 4.8, amenities: ['Large pool', 'Garden', 'BBQ', 'Parking', 'Housekeeper', 'Wi-Fi'], mainImageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'), imageGallery: [] },
  { id: 'mk-hotel', destinationId: 'marrakech', name: 'Hotel Naoura Barriere', type: '5 Stars Hotel', description: 'Five-star hotel with spa, multiple pools, and restaurants in the heart of Hivernage.', location: 'Hivernage', pricePerNight: 280, price: 280, rating: 4.7, amenities: ['Spa', 'Multiple pools', 'Restaurants', 'Bar', 'Gym', 'Concierge'], mainImageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'), imageGallery: [] },

  /* ─── MARBELLA ─── */
  { id: 'mb-villa-luxury', destinationId: 'marbella', name: 'Villa Blanca', type: 'Villa with Pool', description: 'Modern luxury villa with infinity pool, sea views, 8 bedrooms, and entertainment area.', location: 'Nueva Andalucía', pricePerNight: 550, price: 550, rating: 4.9, amenities: ['Infinity pool', 'Sea views', 'BBQ', 'Entertainment room', 'Parking', 'AC'], mainImageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'), imageGallery: [] },
  { id: 'mb-hotel-beach', destinationId: 'marbella', name: 'Amare Beach Hotel', type: '4 Stars Hotel', description: 'Adults-only beachfront hotel with rooftop pool, spa, and direct beach access.', location: 'Marbella Beach', pricePerNight: 220, price: 220, rating: 4.6, amenities: ['Beach access', 'Rooftop pool', 'Spa', 'Restaurant', 'Bar', 'Wi-Fi'], mainImageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'), imageGallery: [] },
  { id: 'mb-apartment', destinationId: 'marbella', name: 'Puerto Banús Penthouse', type: 'Apartment', description: 'Stylish penthouse with terrace overlooking the marina. Walking distance to nightlife and restaurants.', location: 'Puerto Banús', pricePerNight: 350, price: 350, rating: 4.7, amenities: ['Terrace', 'Marina views', 'Kitchen', 'AC', 'Wi-Fi', 'Parking'], mainImageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'), imageGallery: [] },

  /* ─── FARO & ALGARVE ─── */
  { id: 'fa-villa-pool', destinationId: 'faro', name: 'Villa Sol Algarve', type: 'Villa with Pool', description: 'Large group villa with pool, BBQ, games room, and easy access to Albufeira nightlife.', location: 'Albufeira', pricePerNight: 380, price: 380, rating: 4.8, amenities: ['Private pool', 'BBQ', 'Games room', 'Parking', 'Garden', 'Wi-Fi'], mainImageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800'), imageGallery: [] },
  { id: 'fa-resort', destinationId: 'faro', name: 'Pine Cliffs Resort', type: '5 Stars Hotel', description: 'Premium clifftop resort with multiple pools, spa, golf, and private beach access.', location: 'Albufeira', pricePerNight: 300, price: 300, rating: 4.9, amenities: ['Multiple pools', 'Private beach', 'Spa', 'Golf', 'Restaurants', 'Tennis'], mainImageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'), imageGallery: [] },
  { id: 'fa-apartment', destinationId: 'faro', name: 'Marina Vilamoura Flat', type: 'Apartment', description: 'Modern apartment overlooking Vilamoura marina, close to beach, bars, and restaurants.', location: 'Vilamoura', pricePerNight: 180, price: 180, rating: 4.5, amenities: ['Marina views', 'Balcony', 'Kitchen', 'Pool access', 'AC', 'Wi-Fi'], mainImageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', galleryUrls: [], mainImage: image('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'), imageGallery: [] },
];

/* ════════════════════════════════════════════════════════════════
   TRANSPORT
   ════════════════════════════════════════════════════════════════ */

export const transports: TransportType[] = [
  /* ─── MARRAKECH ─── */
  { id: 'mk-private-car', destinationId: 'marrakech', name: 'Private Airport & City Transfers', type: 'Private Car', provider: 'Local Partner', price: 95, duration: 'Flexible', description: 'Round-trip airport transfers plus one in-city transfer. English-speaking driver.', features: ['Airport pickup & dropoff', 'English-speaking driver', 'Flexible timing', 'AC vehicle'], pricingUnit: 'per_trip', mainImageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800', galleryUrls: [], vehicleImage: image('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800'), interiorImages: [] },
  { id: 'mk-luxury-suv', destinationId: 'marrakech', name: 'Luxury SUV with Driver', type: 'Luxury SUV', provider: 'Premium Partner', price: 250, duration: 'Full trip', description: 'Dedicated luxury SUV and driver for the entire stay. Perfect for groups wanting flexibility.', features: ['Dedicated driver', 'Luxury SUV', 'Available 24/7', 'Seats 6'], pricingUnit: 'per_trip', mainImageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800', galleryUrls: [], vehicleImage: image('https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800'), interiorImages: [] },

  /* ─── MARBELLA ─── */
  { id: 'mb-minibus', destinationId: 'marbella', name: 'Group Minibus + Airport', type: 'Sprinter', provider: 'Costa Transfer', price: 180, duration: 'Full trip', description: 'Airport transfers plus a group minibus available for nightlife and activity transport.', features: ['Airport transfers', 'Nightlife shuttle', 'Seats 12', 'AC'], pricingUnit: 'per_trip', mainImageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800', galleryUrls: [], vehicleImage: image('https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800'), interiorImages: [] },
  { id: 'mb-convertible', destinationId: 'marbella', name: 'Convertible Car Rental', type: 'Luxury Sedan', provider: 'AutoSpain', price: 120, duration: 'Per day', description: 'Cruise the Costa del Sol in a convertible. Insurance and GPS included.', features: ['Convertible roof', 'Insurance included', 'GPS', 'Seats 4'], pricingUnit: 'per_trip', mainImageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', galleryUrls: [], vehicleImage: image('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'), interiorImages: [] },

  /* ─── FARO & ALGARVE ─── */
  { id: 'fa-minivan', destinationId: 'faro', name: 'Group Minivan + Airport', type: 'Sprinter', provider: 'Algarve Transfers', price: 150, duration: 'Full trip', description: 'Airport transfers and group transport for activities and nightlife throughout the Algarve.', features: ['Airport transfers', 'Activity transport', 'Seats 8', 'AC'], pricingUnit: 'per_trip', mainImageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800', galleryUrls: [], vehicleImage: image('https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800'), interiorImages: [] },
  { id: 'fa-rental-car', destinationId: 'faro', name: 'SUV Rental', type: 'SUV', provider: 'Europcar', price: 65, duration: 'Per day', description: 'Spacious SUV to explore the Algarve coastline. Insurance and GPS included.', features: ['Insurance included', 'GPS', 'Seats 5', 'Faro airport pickup'], pricingUnit: 'per_trip', mainImageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800', galleryUrls: [], vehicleImage: image('https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800'), interiorImages: [] },
];

/* ════════════════════════════════════════════════════════════════
   ACCESSORS
   ════════════════════════════════════════════════════════════════ */

export const getDestinationById = (id?: string | null) => destinations.find((d) => d.id === id) ?? null;
export const getActivitiesByDestination = (destinationId?: string | null) => activities.filter((a) => a.destinationId === destinationId);
export const getAccommodationsByDestination = (destinationId?: string | null) => accommodations.filter((a) => a.destinationId === destinationId);
export const getTransportsByDestination = (destinationId?: string | null) => transports.filter((t) => t.destinationId === destinationId);
