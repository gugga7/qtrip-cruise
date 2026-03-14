-- Cruise port destinations and activities seed data

-- Barcelona
INSERT INTO destinations (id, name, country, description, hero_image_url, currency, language, best_time_to_visit, highlights, local_tips, health_and_safety, travel_requirements, niche_id, is_active)
VALUES (
  'barcelona', 'Barcelona', 'Spain',
  'Gothic Quarter, Sagrada Familia, La Boqueria market, and Mediterranean beaches — all within reach of the cruise terminal.',
  'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
  'EUR', 'Spanish/Catalan',
  ARRAY['Apr-Jun', 'Sep-Oct'],
  ARRAY['Gothic Quarter', 'Sagrada Familia', 'La Boqueria', 'Barceloneta Beach'],
  ARRAY['The cruise terminal is a 15-min walk to La Rambla', 'Metro L4 connects the port to Sagrada Familia', 'Pickpockets are common on La Rambla — keep bags zipped'],
  ARRAY['Tap water is safe', 'EU health card accepted'],
  ARRAY['EU passport or Schengen visa'],
  'cruise', true
) ON CONFLICT (id) DO NOTHING;

-- Dubrovnik
INSERT INTO destinations (id, name, country, description, hero_image_url, currency, language, best_time_to_visit, highlights, local_tips, health_and_safety, travel_requirements, niche_id, is_active)
VALUES (
  'dubrovnik', 'Dubrovnik', 'Croatia',
  'Walk the ancient city walls, explore the Old Town, kayak the crystal-clear Adriatic, and discover Game of Thrones filming locations.',
  'https://images.unsplash.com/photo-1555990793-da11153b2473?w=800',
  'EUR', 'Croatian',
  ARRAY['May-Jun', 'Sep-Oct'],
  ARRAY['City Walls Walk', 'Old Town', 'Lokrum Island', 'Cable Car'],
  ARRAY['The port is in Gruž, 3km from Old Town — take bus #1A or taxi', 'City walls open at 8am — go early to beat the cruise crowds', 'Bring water — limited shade on the walls'],
  ARRAY['EU health card accepted', 'No special vaccinations needed'],
  ARRAY['EU passport or Croatian visa'],
  'cruise', true
) ON CONFLICT (id) DO NOTHING;

-- Santorini
INSERT INTO destinations (id, name, country, description, hero_image_url, currency, language, best_time_to_visit, highlights, local_tips, health_and_safety, travel_requirements, niche_id, is_active)
VALUES (
  'santorini', 'Santorini', 'Greece',
  'Iconic blue domes of Oia, volcanic caldera views, black sand beaches, and world-class sunset dining on the Aegean.',
  'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
  'EUR', 'Greek',
  ARRAY['Apr-Jun', 'Sep-Oct'],
  ARRAY['Oia Sunset', 'Fira to Oia Hike', 'Red Beach', 'Wine Tasting'],
  ARRAY['Tender port — allow extra time for small boat transfer', 'Cable car or donkey ride from port to Fira town', 'Fira to Oia hike is 10km along the caldera rim — stunning but exposed'],
  ARRAY['Strong sun — SPF 50+ essential', 'Steep paths — wear proper shoes'],
  ARRAY['EU passport or Schengen visa'],
  'cruise', true
) ON CONFLICT (id) DO NOTHING;

-- Naples
INSERT INTO destinations (id, name, country, description, hero_image_url, currency, language, best_time_to_visit, highlights, local_tips, health_and_safety, travel_requirements, niche_id, is_active)
VALUES (
  'naples', 'Naples', 'Italy',
  'Gateway to Pompeii and the Amalfi Coast. Authentic Neapolitan pizza, vibrant street life, and the stunning Bay of Naples.',
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800',
  'EUR', 'Italian',
  ARRAY['Apr-Jun', 'Sep-Oct'],
  ARRAY['Pompeii', 'Amalfi Coast', 'Naples Pizza', 'Naples Underground'],
  ARRAY['The port is walkable to the historic center', 'Circumvesuviana train to Pompeii takes 35 min', 'Book Amalfi Coast transport in advance — it sells out for cruise days'],
  ARRAY['Watch for traffic — Naples driving is intense', 'Keep valuables secure in crowded areas'],
  ARRAY['EU passport or Schengen visa'],
  'cruise', true
) ON CONFLICT (id) DO NOTHING;

-- Nassau
INSERT INTO destinations (id, name, country, description, hero_image_url, currency, language, best_time_to_visit, highlights, local_tips, health_and_safety, travel_requirements, niche_id, is_active)
VALUES (
  'nassau', 'Nassau', 'Bahamas',
  'Crystal-clear Caribbean waters, Atlantis resort, historic colonial architecture, and vibrant Junkanoo culture.',
  'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800',
  'USD', 'English',
  ARRAY['Nov-Apr'],
  ARRAY['Cable Beach', 'Atlantis Resort', 'Straw Market', 'Blue Lagoon Island'],
  ARRAY['Port is downtown — Bay Street shops are a 5-min walk', 'Jitney buses run along the coast for $1.25', 'Negotiate prices at the Straw Market'],
  ARRAY['Use reef-safe sunscreen', 'Stay hydrated — tropical heat year-round'],
  ARRAY['US passport or visa waiver'],
  'cruise', true
) ON CONFLICT (id) DO NOTHING;

-- Cozumel
INSERT INTO destinations (id, name, country, description, hero_image_url, currency, language, best_time_to_visit, highlights, local_tips, health_and_safety, travel_requirements, niche_id, is_active)
VALUES (
  'cozumel', 'Cozumel', 'Mexico',
  'World-class snorkeling and diving on the Mesoamerican Reef, Mayan ruins, tequila tasting, and laid-back Caribbean beach vibes.',
  'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800',
  'USD', 'Spanish',
  ARRAY['Nov-May'],
  ARRAY['Snorkeling Palancar Reef', 'San Gervasio Ruins', 'Playa Mia Beach', 'Downtown Shopping'],
  ARRAY['Two cruise terminals — check which one your ship uses', 'Taxis are fixed-rate zones — confirm price before riding', 'US dollars widely accepted but pesos give better value'],
  ARRAY['Drink bottled water only', 'Reef-safe sunscreen required by law for water activities'],
  ARRAY['US passport or Mexican tourist card'],
  'cruise', true
) ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════
-- ACTIVITIES per cruise port
-- ═══════════════════════════════════════════════

-- Barcelona Activities
INSERT INTO activities (id, destination_id, title, description, duration, price, category, location, tags, main_image_url, is_active) VALUES
('bcn-gothic', 'barcelona', 'Gothic Quarter Walking Tour', 'Explore 2000 years of history through the medieval streets, hidden squares, and Roman ruins of the Barri Gòtic.', 3, 35, 'Cultural Deep Dive', 'Gothic Quarter', ARRAY['walking', 'culture', 'history', 'morning'], 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400', true),
('bcn-sagrada', 'barcelona', 'Sagrada Familia Fast-Track', 'Skip the queue at Gaudí''s masterpiece. Guided tour of the interior, towers, and museum.', 2.5, 55, 'Must-See Landmarks', 'Eixample', ARRAY['sightseeing', 'architecture', 'guided', 'morning'], 'https://images.unsplash.com/photo-1523722214268-e435680f0707?w=400', true),
('bcn-boqueria', 'barcelona', 'La Boqueria Food Tour', 'Taste your way through Barcelona''s most famous market. Fresh seafood, jamón ibérico, local wines, and hidden pintxos bars.', 3.5, 55, 'Food & Local Flavour', 'La Rambla', ARRAY['food', 'market', 'tasting', 'afternoon'], 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400', true),
('bcn-beach', 'barcelona', 'Barceloneta Beach & Sailing', 'Relax on Barcelona''s city beach then set sail for a 2-hour Mediterranean catamaran cruise.', 4, 75, 'Beach & Water', 'Barceloneta', ARRAY['beach', 'sailing', 'relaxing', 'afternoon'], 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400', true),
('bcn-tapas', 'barcelona', 'El Born Tapas & Wine Crawl', 'Evening tapas crawl through the trendy El Born neighborhood. 4 stops, unlimited small plates, paired wines.', 3, 65, 'Food & Local Flavour', 'El Born', ARRAY['food', 'evening', 'nightlife', 'wine'], 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=400', true),
('bcn-montjuic', 'barcelona', 'Montjuïc Hill & Cable Car', 'Panoramic views from the castle, cable car ride, and Joan Miró Foundation. Perfect morning escape.', 3, 30, 'Must-See Landmarks', 'Montjuïc', ARRAY['sightseeing', 'outdoor', 'views', 'morning'], 'https://images.unsplash.com/photo-1579282240050-352db0a14c21?w=400', true)
ON CONFLICT (id) DO NOTHING;

-- Dubrovnik Activities
INSERT INTO activities (id, destination_id, title, description, duration, price, category, location, tags, main_image_url, is_active) VALUES
('dbk-walls', 'dubrovnik', 'City Walls Walk', 'Walk the complete 2km circuit of Dubrovnik''s ancient walls with stunning Adriatic views at every turn.', 2.5, 35, 'Must-See Landmarks', 'Old Town', ARRAY['walking', 'sightseeing', 'history', 'morning'], 'https://images.unsplash.com/photo-1555990793-da11153b2473?w=400', true),
('dbk-kayak', 'dubrovnik', 'Sea Kayaking & Snorkeling', 'Paddle along the old city walls, explore hidden caves, and snorkel at Lokrum Island.', 3.5, 45, 'Beach & Water', 'Pile Gate', ARRAY['kayak', 'snorkeling', 'outdoor', 'morning'], 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', true),
('dbk-got', 'dubrovnik', 'Game of Thrones Tour', 'Visit all the King''s Landing filming locations with a superfan guide. Costumes and props included.', 2.5, 40, 'Cultural Deep Dive', 'Old Town', ARRAY['culture', 'walking', 'guided', 'afternoon'], 'https://images.unsplash.com/photo-1592486958799-38cfb7e3591c?w=400', true),
('dbk-food', 'dubrovnik', 'Croatian Food & Wine Tasting', 'Sample local cheeses, olive oils, wines from Pelješac peninsula, and fresh Adriatic seafood.', 3, 50, 'Food & Local Flavour', 'Old Town', ARRAY['food', 'wine', 'tasting', 'afternoon'], 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', true),
('dbk-cable', 'dubrovnik', 'Cable Car & Mount Srđ', 'Ride the cable car to the summit for breathtaking panoramic views of the city, islands, and coastline.', 1.5, 25, 'Must-See Landmarks', 'Ploče Gate', ARRAY['sightseeing', 'views', 'outdoor', 'morning'], 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400', true)
ON CONFLICT (id) DO NOTHING;

-- Santorini Activities
INSERT INTO activities (id, destination_id, title, description, duration, price, category, location, tags, main_image_url, is_active) VALUES
('san-oia', 'santorini', 'Oia Sunset & Wine Tour', 'Guided visit to Oia village, 2 winery stops, and the famous sunset from the castle ruins.', 4, 70, 'Must-See Landmarks', 'Oia', ARRAY['sunset', 'wine', 'sightseeing', 'evening'], 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400', true),
('san-caldera', 'santorini', 'Caldera Catamaran Cruise', 'Sail the volcanic caldera, swim in hot springs, snorkel at Red Beach, BBQ lunch on board.', 5, 95, 'Beach & Water', 'Vlychada Port', ARRAY['sailing', 'beach', 'snorkeling', 'afternoon'], 'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=400', true),
('san-hike', 'santorini', 'Fira to Oia Caldera Hike', 'The iconic 10km rim walk with volcanic crater views, blue dome churches, and whitewashed villages.', 4, 30, 'Adventure & Active', 'Fira', ARRAY['hiking', 'outdoor', 'sightseeing', 'morning'], 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400', true),
('san-wine', 'santorini', 'Volcanic Wine Tasting', 'Visit 3 unique wineries built into the volcanic cliffs. Taste Assyrtiko and Vinsanto varietals.', 3, 55, 'Food & Local Flavour', 'Megalochori', ARRAY['wine', 'tasting', 'culture', 'afternoon'], 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400', true),
('san-akrotiri', 'santorini', 'Akrotiri Archaeological Site', 'Explore the ''Pompeii of the Aegean'' — a Minoan Bronze Age city preserved under volcanic ash.', 2, 25, 'Cultural Deep Dive', 'Akrotiri', ARRAY['history', 'culture', 'museum', 'morning'], 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=400', true)
ON CONFLICT (id) DO NOTHING;

-- Naples Activities
INSERT INTO activities (id, destination_id, title, description, duration, price, category, location, tags, main_image_url, is_active) VALUES
('nap-pompeii', 'naples', 'Pompeii Express Tour', 'Skip-the-line guided tour of the ancient Roman city. See the Forum, amphitheater, and preserved frescoes.', 4, 65, 'Cultural Deep Dive', 'Pompeii', ARRAY['history', 'culture', 'guided', 'morning'], 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=400', true),
('nap-pizza', 'naples', 'Naples Pizza Masterclass', 'Learn to make authentic Neapolitan pizza from a pizzaiolo master. Eat what you make with local wine.', 3, 55, 'Food & Local Flavour', 'Spaccanapoli', ARRAY['food', 'cooking', 'culture', 'afternoon'], 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', true),
('nap-amalfi', 'naples', 'Amalfi Coast Drive', 'Private minibus along the stunning coastal road. Stops in Positano, Amalfi, and Ravello.', 6, 95, 'Must-See Landmarks', 'Amalfi Coast', ARRAY['sightseeing', 'outdoor', 'driving', 'morning'], 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=400', true),
('nap-underground', 'naples', 'Naples Underground Tour', 'Descend 40m below the city streets to explore ancient Greek-Roman tunnels, cisterns, and WWII shelters.', 2, 20, 'Cultural Deep Dive', 'Centro Storico', ARRAY['history', 'culture', 'underground', 'afternoon'], 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400', true),
('nap-street-food', 'naples', 'Street Food Walking Tour', 'Taste Naples'' legendary street food: pizza fritta, sfogliatella, cuoppo di mare, and limoncello.', 3, 40, 'Food & Local Flavour', 'Centro Storico', ARRAY['food', 'walking', 'tasting', 'afternoon'], 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', true)
ON CONFLICT (id) DO NOTHING;

-- Nassau Activities
INSERT INTO activities (id, destination_id, title, description, duration, price, category, location, tags, main_image_url, is_active) VALUES
('nas-blue-lagoon', 'nassau', 'Blue Lagoon Island Beach Day', 'Private island escape with crystal-clear water, beach loungers, water sports, and dolphin encounters.', 5, 85, 'Beach & Water', 'Blue Lagoon Island', ARRAY['beach', 'swimming', 'relaxing', 'morning'], 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=400', true),
('nas-atlantis', 'nassau', 'Atlantis Aquaventure Day Pass', 'Full access to the mega water park — slides, lazy river, marine habitat, and Predator Lagoon.', 4, 75, 'Adventure & Active', 'Paradise Island', ARRAY['waterpark', 'adventure', 'family', 'morning'], 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=400', true),
('nas-food-tour', 'nassau', 'Bahamian Food & Rum Tour', 'Taste conch salad, guava duff, sky juice, and rum punch at 5 local favorites.', 3, 55, 'Food & Local Flavour', 'Downtown Nassau', ARRAY['food', 'rum', 'culture', 'afternoon'], 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', true),
('nas-snorkel', 'nassau', 'Reef Snorkeling Adventure', 'Boat trip to pristine reef sites. Swim with tropical fish, sea turtles, and rays.', 3.5, 60, 'Beach & Water', 'Rose Island Reef', ARRAY['snorkeling', 'outdoor', 'water', 'morning'], 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', true)
ON CONFLICT (id) DO NOTHING;

-- Cozumel Activities
INSERT INTO activities (id, destination_id, title, description, duration, price, category, location, tags, main_image_url, is_active) VALUES
('coz-reef', 'cozumel', 'Palancar Reef Snorkeling', 'World-class snorkeling on the Mesoamerican Reef. See coral formations, tropical fish, and sea turtles.', 3.5, 50, 'Beach & Water', 'Palancar Reef', ARRAY['snorkeling', 'outdoor', 'water', 'morning'], 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', true),
('coz-ruins', 'cozumel', 'San Gervasio Mayan Ruins', 'Explore the ancient Mayan archaeological site dedicated to Ixchel, goddess of fertility and the moon.', 2.5, 30, 'Cultural Deep Dive', 'San Gervasio', ARRAY['history', 'culture', 'ruins', 'morning'], 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=400', true),
('coz-tequila', 'cozumel', 'Tequila & Chocolate Tasting', 'Visit a local distillery for tequila tasting paired with artisan Mexican chocolate.', 2, 35, 'Food & Local Flavour', 'Downtown', ARRAY['food', 'tasting', 'culture', 'afternoon'], 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400', true),
('coz-beach', 'cozumel', 'Playa Mia All-Inclusive Beach', 'All-inclusive beach club with water park, floating playground, kayaks, snorkeling, food and drinks.', 5, 60, 'Beach & Water', 'Playa Mia', ARRAY['beach', 'relaxing', 'family', 'morning'], 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400', true),
('coz-jeep', 'cozumel', 'Jeep Island Adventure', 'Off-road jeep tour through the jungle, snorkeling at a secluded beach, and Mexican lunch at a beach club.', 4, 70, 'Adventure & Active', 'East Coast', ARRAY['adventure', 'outdoor', 'driving', 'morning'], 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400', true)
ON CONFLICT (id) DO NOTHING;
