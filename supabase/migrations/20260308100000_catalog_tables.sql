-- ============================================================
-- Catalog tables: destinations, activities, accommodations,
-- transports, ai_configs  +  seed data
--
-- These are the canonical catalog tables with TEXT primary keys
-- (human-readable IDs used by the niche config system).
-- ============================================================

-- 1. DESTINATIONS
CREATE TABLE destinations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  description TEXT,
  hero_image_url TEXT,
  currency TEXT DEFAULT 'EUR',
  language TEXT,
  best_time_to_visit TEXT[],
  highlights TEXT[],
  local_tips TEXT[],
  health_and_safety TEXT[],
  travel_requirements TEXT[],
  visa_required BOOLEAN DEFAULT false,
  emergency_number TEXT,
  is_active BOOLEAN DEFAULT true,
  niche_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ACTIVITIES
CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  destination_id TEXT NOT NULL REFERENCES destinations(id),
  title TEXT NOT NULL,
  description TEXT,
  duration NUMERIC,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  location TEXT,
  tags TEXT[],
  main_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_activities_destination_id ON activities(destination_id);

-- 3. ACCOMMODATIONS
CREATE TABLE accommodations (
  id TEXT PRIMARY KEY,
  destination_id TEXT NOT NULL REFERENCES destinations(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  location TEXT,
  price_per_night NUMERIC NOT NULL,
  rating NUMERIC,
  amenities TEXT[],
  main_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_accommodations_destination_id ON accommodations(destination_id);

-- 4. TRANSPORTS
CREATE TABLE transports (
  id TEXT PRIMARY KEY,
  destination_id TEXT NOT NULL REFERENCES destinations(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT,
  price NUMERIC NOT NULL,
  duration TEXT,
  description TEXT,
  features TEXT[],
  pricing_unit TEXT DEFAULT 'per_trip',
  main_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_transports_destination_id ON transports(destination_id);

-- 5. AI_CONFIGS
CREATE TABLE ai_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  niche_id TEXT NOT NULL UNIQUE,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_ai_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_configs_updated_at
  BEFORE UPDATE ON ai_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_configs_updated_at();

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_configs ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read destinations" ON destinations FOR SELECT USING (true);
CREATE POLICY "Public read activities" ON activities FOR SELECT USING (true);
CREATE POLICY "Public read accommodations" ON accommodations FOR SELECT USING (true);
CREATE POLICY "Public read transports" ON transports FOR SELECT USING (true);
CREATE POLICY "Public read ai_configs" ON ai_configs FOR SELECT USING (true);

-- Authenticated write access (admin gating done at RLS level in user_profiles migration)
CREATE POLICY "Authenticated manage destinations" ON destinations FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated manage activities" ON activities FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated manage accommodations" ON accommodations FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated manage transports" ON transports FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated manage ai_configs" ON ai_configs FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================================
-- SEED DATA
-- ============================================================

-- -------------------- DESTINATIONS --------------------

INSERT INTO destinations (id, name, country, description, hero_image_url, currency, language, best_time_to_visit, highlights, local_tips, health_and_safety, travel_requirements, visa_required, emergency_number, niche_id)
VALUES
(
  'marrakech',
  'Marrakech',
  'Morocco',
  'Exotic riads, rooftop parties, desert adventures, and hammam rituals — the ultimate celebration destination.',
  'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=1200',
  'EUR',
  'Arabic / French',
  ARRAY['Mar–May', 'Sep–Nov'],
  ARRAY['Private riad takeovers', 'Quad biking in the Palmeraie', 'VIP rooftop parties', 'Traditional hammam experiences'],
  ARRAY['Carry cash for souk shopping.', 'Arrange airport transfers ahead of time.', 'Group restaurants should be booked in advance.', 'Dress modestly in the medina, anything goes at private venues.'],
  ARRAY['Use licensed guides and taxis.', 'Stay hydrated — it gets very hot.', 'Keep hotel contact details with you.', 'Travel in groups at night.'],
  ARRAY['Passport required.', 'Visa depends on nationality — most EU citizens exempt.', 'Travel insurance strongly recommended.'],
  false,
  '19',
  'bachelor'
),
(
  'marbella',
  'Marbella',
  'Spain',
  'Beach clubs, yacht parties, nightlife, and Mediterranean luxury — Marbella is the go-to for glamorous celebrations.',
  'https://images.unsplash.com/photo-1511316695145-4992006fde05?w=1200',
  'EUR',
  'Spanish',
  ARRAY['May–Sep'],
  ARRAY['Beach club day beds', 'Puerto Banús nightlife', 'Yacht & boat parties', 'Old town tapas trails'],
  ARRAY['Book beach clubs at least 2 weeks ahead in summer.', 'Puerto Banús is walkable from many hotels.', 'Pre-book restaurant terraces for sunset.', 'Uber works well for nightlife.'],
  ARRAY['Apply sunscreen generously.', 'Stay hydrated at beach clubs.', 'Keep valuables secure at the beach.', '112 is the emergency number.'],
  ARRAY['Passport or EU ID card.', 'Schengen rules apply.', 'Travel insurance recommended.'],
  false,
  '112',
  'bachelor'
),
(
  'faro',
  'Faro & Algarve',
  'Portugal',
  'Stunning coastline, boat parties, surf vibes, and lively bars — the Algarve delivers sun-soaked celebrations.',
  'https://images.unsplash.com/photo-1555881400-74d7acaacd6b?w=1200',
  'EUR',
  'Portuguese',
  ARRAY['May–Oct'],
  ARRAY['Benagil cave boat trips', 'Albufeira strip nightlife', 'Cliff-top beach bars', 'Water sports & surf'],
  ARRAY['Rent a car to explore hidden beaches.', 'Albufeira old town has the best nightlife.', 'Book boat tours early in peak season.', 'Many venues offer group packages.'],
  ARRAY['Strong currents on some beaches — check flags.', 'Use sunscreen and hats.', 'Tap water is safe to drink.', '112 is the emergency number.'],
  ARRAY['Passport or EU ID card.', 'Schengen rules apply.', 'Travel insurance recommended.'],
  false,
  '112',
  'bachelor'
)
ON CONFLICT (id) DO NOTHING;

-- -------------------- ACTIVITIES --------------------

INSERT INTO activities (id, destination_id, title, category, duration, price, location, tags, main_image_url) VALUES
('mk-rooftop-party', 'marrakech', 'VIP Rooftop Party Night', 'Party & Nightlife', 4, 85, 'Hivernage', ARRAY['party','nightlife','vip','evening'], 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'),
('mk-bar-crawl', 'marrakech', 'Guided Bar & Lounge Crawl', 'Party & Nightlife', 3, 45, 'Guéliz', ARRAY['party','nightlife','evening','drinks'], 'https://images.unsplash.com/photo-1575444758702-4a6b9222c016?w=800'),
('mk-quad-biking', 'marrakech', 'Quad Biking in the Palmeraie', 'Adventure & Outdoor', 2, 55, 'Palmeraie', ARRAY['adventure','outdoor','adrenaline'], 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800'),
('mk-camel-sunset', 'marrakech', 'Sunset Camel Ride', 'Adventure & Outdoor', 2, 35, 'Palmeraie', ARRAY['outdoor','sunset','photo'], 'https://images.unsplash.com/photo-1493814100601-2914e1e4739b?w=800'),
('mk-hammam', 'marrakech', 'Luxury Hammam & Spa Ritual', 'Wellness & Relaxation', 3, 75, 'Medina', ARRAY['spa','relaxing','wellness'], 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800'),
('mk-pool-day', 'marrakech', 'Private Pool Day Party', 'Wellness & Relaxation', 5, 65, 'Palmeraie', ARRAY['pool','relaxing','party'], 'https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc?w=800'),
('mk-cooking-class', 'marrakech', 'Moroccan Cooking Class', 'Food & Drink', 3, 50, 'Medina', ARRAY['food','cooking','group'], 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=800'),
('mk-cocktail-class', 'marrakech', 'Rooftop Cocktail Masterclass', 'Food & Drink', 2, 40, 'Guéliz', ARRAY['drinks','cocktails','evening','group'], 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800'),
('mk-medina-walk', 'marrakech', 'Medina Discovery Walk', 'Culture & Sightseeing', 3, 30, 'Medina', ARRAY['guided','culture','sightseeing'], 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800'),
('mk-majorelle', 'marrakech', 'Majorelle Garden & YSL Museum', 'Culture & Sightseeing', 2, 25, 'Guéliz', ARRAY['culture','photo','iconic'], 'https://images.unsplash.com/photo-1560441190-c3b49e07c4a4?w=800'),
('mk-private-chef', 'marrakech', 'Private Chef Dinner', 'Group Experiences', 3, 70, 'Your Riad', ARRAY['group','food','evening','private'], 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'),
('mk-henna-party', 'marrakech', 'Henna Art & Tea Ceremony', 'Group Experiences', 2, 30, 'Medina', ARRAY['group','culture','photo'], 'https://images.unsplash.com/photo-1595854341625-f2e1764257ec?w=800')
ON CONFLICT (id) DO NOTHING;

INSERT INTO activities (id, destination_id, title, category, duration, price, location, tags, main_image_url) VALUES
('mb-beach-club', 'marbella', 'VIP Beach Club Day', 'Party & Nightlife', 5, 120, 'Golden Mile', ARRAY['party','beach','vip','daytime'], 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800'),
('mb-puerto-night', 'marbella', 'Puerto Banús Night Out', 'Party & Nightlife', 4, 90, 'Puerto Banús', ARRAY['party','nightlife','evening','vip'], 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800'),
('mb-pool-party', 'marbella', 'Villa Pool Party', 'Party & Nightlife', 6, 95, 'Nueva Andalucía', ARRAY['party','pool','private','daytime'], 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800'),
('mb-yacht', 'marbella', 'Private Yacht Cruise', 'Adventure & Outdoor', 4, 150, 'Puerto Banús Marina', ARRAY['yacht','sea','luxury','photo'], 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800'),
('mb-jet-ski', 'marbella', 'Jet Ski Safari', 'Adventure & Outdoor', 2, 80, 'Marbella Beach', ARRAY['adventure','adrenaline','sea'], 'https://images.unsplash.com/photo-1625757511593-7cb6fd10b9f6?w=800'),
('mb-spa-day', 'marbella', 'Luxury Spa & Wellness Day', 'Wellness & Relaxation', 4, 110, 'Golden Mile', ARRAY['spa','relaxing','wellness','luxury'], 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800'),
('mb-yoga-beach', 'marbella', 'Sunrise Beach Yoga', 'Wellness & Relaxation', 1.5, 30, 'Nikki Beach Area', ARRAY['wellness','morning','beach'], 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'),
('mb-tapas-tour', 'marbella', 'Old Town Tapas Trail', 'Food & Drink', 3, 55, 'Casco Antiguo', ARRAY['food','tapas','wine','group'], 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=800'),
('mb-wine-tasting', 'marbella', 'Andalusian Wine Tasting', 'Food & Drink', 2.5, 60, 'Ronda area', ARRAY['wine','tasting','group'], 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800'),
('mb-old-town', 'marbella', 'Marbella Old Town Tour', 'Culture & Sightseeing', 2, 25, 'Casco Antiguo', ARRAY['culture','sightseeing','photo'], 'https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=800'),
('mb-dance-class', 'marbella', 'Flamenco & Salsa Dance Class', 'Group Experiences', 2, 40, 'Marbella Center', ARRAY['group','dance','fun'], 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800'),
('mb-karaoke', 'marbella', 'Private Karaoke Night', 'Group Experiences', 3, 35, 'Puerto Banús', ARRAY['group','party','evening','fun'], 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800'),
('mb-go-kart', 'marbella', 'Go-Kart Grand Prix', 'Group Experiences', 2, 45, 'San Pedro', ARRAY['adventure','group','competition'], 'https://images.unsplash.com/photo-1623776055032-c70e8d4d3b65?w=800')
ON CONFLICT (id) DO NOTHING;

INSERT INTO activities (id, destination_id, title, category, duration, price, location, tags, main_image_url) VALUES
('fa-strip-night', 'faro', 'Albufeira Strip Night Out', 'Party & Nightlife', 4, 40, 'Albufeira Strip', ARRAY['party','nightlife','evening','drinks'], 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800'),
('fa-boat-party', 'faro', 'Catamaran Party Cruise', 'Party & Nightlife', 4, 70, 'Albufeira Marina', ARRAY['party','boat','sea','daytime'], 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'),
('fa-benagil', 'faro', 'Benagil Cave & Coast Boat Tour', 'Adventure & Outdoor', 2.5, 45, 'Benagil', ARRAY['boat','nature','photo','iconic'], 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'),
('fa-surf', 'faro', 'Group Surf Lesson', 'Adventure & Outdoor', 3, 50, 'Sagres', ARRAY['adventure','surf','outdoor','group'], 'https://images.unsplash.com/photo-1502680390548-bdbac40e4ce3?w=800'),
('fa-jet-ski', 'faro', 'Jet Ski Adventure', 'Adventure & Outdoor', 1.5, 65, 'Vilamoura', ARRAY['adventure','adrenaline','sea'], 'https://images.unsplash.com/photo-1625757511593-7cb6fd10b9f6?w=800'),
('fa-spa-resort', 'faro', 'Resort Spa Morning', 'Wellness & Relaxation', 3, 85, 'Vilamoura', ARRAY['spa','relaxing','wellness','morning'], 'https://images.unsplash.com/photo-1540555700478-4be289fbec6c?w=800'),
('fa-beach-chill', 'faro', 'Hidden Beach & Cliff Bar', 'Wellness & Relaxation', 4, 25, 'Carvoeiro', ARRAY['beach','relaxing','photo'], 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800'),
('fa-seafood-feast', 'faro', 'Seafood & Wine Feast', 'Food & Drink', 3, 55, 'Olhão', ARRAY['food','seafood','wine','evening'], 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800'),
('fa-cocktail-sunset', 'faro', 'Sunset Cocktail Workshop', 'Food & Drink', 2, 40, 'Faro', ARRAY['drinks','cocktails','sunset','evening'], 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800'),
('fa-faro-town', 'faro', 'Faro Old Town & Ria Formosa', 'Culture & Sightseeing', 3, 30, 'Faro', ARRAY['culture','nature','sightseeing'], 'https://images.unsplash.com/photo-1548707309-dcebeab426c8?w=800'),
('fa-paintball', 'faro', 'Paintball Battle', 'Group Experiences', 2.5, 35, 'Albufeira', ARRAY['adventure','group','competition'], 'https://images.unsplash.com/photo-1565711561500-49678a10a63f?w=800'),
('fa-escape-room', 'faro', 'Group Escape Room', 'Group Experiences', 1.5, 25, 'Albufeira', ARRAY['group','fun','team'], 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800'),
('fa-life-drawing', 'faro', 'Life Drawing Class', 'Group Experiences', 2, 35, 'Albufeira', ARRAY['group','fun','creative'], 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800')
ON CONFLICT (id) DO NOTHING;

-- -------------------- ACCOMMODATIONS --------------------

INSERT INTO accommodations (id, destination_id, name, type, location, price_per_night, rating, amenities, main_image_url) VALUES
('mk-riad-luxury', 'marrakech', 'Riad Sapphire', 'Private Riad', 'Medina', 320, 4.9, ARRAY['Private pool','Rooftop terrace','Breakfast included','Airport transfer','AC','Wi-Fi'], 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800'),
('mk-villa', 'marrakech', 'Villa Rosa Palmeraie', 'Villa with Pool', 'Palmeraie', 450, 4.8, ARRAY['Large pool','Garden','BBQ','Parking','Housekeeper','Wi-Fi'], 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'),
('mk-hotel', 'marrakech', 'Hotel Naoura Barriere', '5 Stars Hotel', 'Hivernage', 280, 4.7, ARRAY['Spa','Multiple pools','Restaurants','Bar','Gym','Concierge'], 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'),
('mb-villa-luxury', 'marbella', 'Villa Blanca', 'Villa with Pool', 'Nueva Andalucía', 550, 4.9, ARRAY['Infinity pool','Sea views','BBQ','Entertainment room','Parking','AC'], 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'),
('mb-hotel-beach', 'marbella', 'Amare Beach Hotel', '4 Stars Hotel', 'Marbella Beach', 220, 4.6, ARRAY['Beach access','Rooftop pool','Spa','Restaurant','Bar','Wi-Fi'], 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'),
('mb-apartment', 'marbella', 'Puerto Banús Penthouse', 'Apartment', 'Puerto Banús', 350, 4.7, ARRAY['Terrace','Marina views','Kitchen','AC','Wi-Fi','Parking'], 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'),
('fa-villa-pool', 'faro', 'Villa Sol Algarve', 'Villa with Pool', 'Albufeira', 380, 4.8, ARRAY['Private pool','BBQ','Games room','Parking','Garden','Wi-Fi'], 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800'),
('fa-resort', 'faro', 'Pine Cliffs Resort', '5 Stars Hotel', 'Albufeira', 300, 4.9, ARRAY['Multiple pools','Private beach','Spa','Golf','Restaurants','Tennis'], 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'),
('fa-apartment', 'faro', 'Marina Vilamoura Flat', 'Apartment', 'Vilamoura', 180, 4.5, ARRAY['Marina views','Balcony','Kitchen','Pool access','AC','Wi-Fi'], 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800')
ON CONFLICT (id) DO NOTHING;

-- -------------------- TRANSPORTS --------------------

INSERT INTO transports (id, destination_id, name, type, provider, price, duration, features, pricing_unit, main_image_url) VALUES
('mk-private-car', 'marrakech', 'Private Airport & City Transfers', 'Private Car', 'Local Partner', 95, 'Flexible', ARRAY['Airport pickup & dropoff','English-speaking driver','Flexible timing','AC vehicle'], 'per_trip', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800'),
('mk-luxury-suv', 'marrakech', 'Luxury SUV with Driver', 'Luxury SUV', 'Premium Partner', 250, 'Full trip', ARRAY['Dedicated driver','Luxury SUV','Available 24/7','Seats 6'], 'per_trip', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800'),
('mb-minibus', 'marbella', 'Group Minibus + Airport', 'Sprinter', 'Costa Transfer', 180, 'Full trip', ARRAY['Airport transfers','Nightlife shuttle','Seats 12','AC'], 'per_trip', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800'),
('mb-convertible', 'marbella', 'Convertible Car Rental', 'Luxury Sedan', 'AutoSpain', 120, 'Per day', ARRAY['Convertible roof','Insurance included','GPS','Seats 4'], 'per_trip', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'),
('fa-minivan', 'faro', 'Group Minivan + Airport', 'Sprinter', 'Algarve Transfers', 150, 'Full trip', ARRAY['Airport transfers','Activity transport','Seats 8','AC'], 'per_trip', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800'),
('fa-rental-car', 'faro', 'SUV Rental', 'SUV', 'Europcar', 65, 'Per day', ARRAY['Insurance included','GPS','Seats 5','Faro airport pickup'], 'per_trip', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800')
ON CONFLICT (id) DO NOTHING;

-- -------------------- AI CONFIGS --------------------

INSERT INTO ai_configs (niche_id, settings) VALUES
('bachelor', '{"optimizationRules":{"maxActivitiesPerDay":5,"minBreakDuration":30,"preferredStartTime":"09:00","preferredEndTime":"22:00"},"constraints":{"mustIncludeCategories":["Party & Nightlife","Group Experiences"],"avoidConflictingTypes":[],"preferredSequence":[]},"scoring":{"timePreferenceWeight":0.3,"locationProximityWeight":0.3,"priceOptimizationWeight":0.4}}')
ON CONFLICT (niche_id) DO NOTHING;
