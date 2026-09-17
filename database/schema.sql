-- Herbora Database Schema
-- Supabase PostgreSQL with Row Level Security (RLS)

-- 1. Plants Library
CREATE TABLE IF NOT EXISTS public.plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  common_name TEXT NOT NULL,
  scientific_name TEXT NOT NULL,
  ayurvedic_name TEXT,
  regional_names TEXT[] NOT NULL DEFAULT '{}',
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  traditional_uses TEXT,
  plant_parts_used TEXT,
  habitat TEXT,
  cultivation_information TEXT,
  safety_information TEXT NOT NULL,
  image_url TEXT,
  source_references JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for plants
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published plants are publicly readable" 
  ON public.plants FOR SELECT TO anon, authenticated 
  USING (is_published = true);

-- 2. User Saved Plants (My Plant DB)
CREATE TABLE IF NOT EXISTS public.user_saved_plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, plant_id)
);

-- RLS for user_saved_plants
ALTER TABLE public.user_saved_plants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their saved plants" 
  ON public.user_saved_plants FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can save plants" 
  ON public.user_saved_plants FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their saved plants" 
  ON public.user_saved_plants FOR DELETE TO authenticated 
  USING (auth.uid() = user_id);

-- 3. Plant Identification Results
CREATE TABLE IF NOT EXISTS public.plant_identification_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  predicted_name TEXT NOT NULL,
  scientific_name TEXT,
  confidence_score NUMERIC(5,2),
  matched_plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'completed',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.plant_identification_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own identification records"
  ON public.plant_identification_results FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert identification records"
  ON public.plant_identification_results FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 4. Community Posts (Garden & Herb Grower Stories)
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  plant_name TEXT NOT NULL,
  note TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view community posts"
  ON public.community_posts FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "Anyone can share community posts"
  ON public.community_posts FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 5. User Feedback
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit feedback"
  ON public.user_feedback FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Initial Seed Data: 10 Core Ayurvedic Plants
INSERT INTO public.plants (slug, common_name, scientific_name, ayurvedic_name, regional_names, category, description, traditional_uses, plant_parts_used, habitat, cultivation_information, safety_information, image_url, source_references)
VALUES
(
  'tulsi',
  'Holy Basil',
  'Ocimum sanctum / Ocimum tenuiflorum',
  'Tulsi',
  ARRAY['Tulasi', 'Sacred Basil', 'Manjari'],
  'Immunity',
  'Revered as the “Queen of Herbs” and “Mother Medicine of Nature”, Tulsi is an aromatic shrub celebrated for spiritual, environmental, and therapeutic balance.',
  'Daily tea for respiratory clarity, modulating adaptogenic stress responses, and kindling digestion.',
  'Leaves, flowering tops, and whole herb',
  'Native to the Indian subcontinent; widely grown in courtyards, temples, and balconies.',
  'Requires warm climate, well-draining soil, and 4-6 hours of sunlight. Water every 2 days.',
  'Educational information only. May interact with blood-thinning medications and hypoglycemia agents. Avoid excessive therapeutic doses in pregnancy.',
  '/assets/tulsi.jpg',
  '[{"title": "Charaka Samhita — Sutrasthana", "url": "https://vedabase.io"}, {"title": "Kew Plants of the World — Ocimum tenuiflorum", "url": "https://powo.science.kew.org"}]'::jsonb
),
(
  'ashwagandha',
  'Ashwagandha',
  'Withania somnifera',
  'Ashwagandha',
  ARRAY['Indian Ginseng', 'Winter Cherry', 'Asgandh'],
  'Adaptogens',
  'A grounding Rasayana (rejuvenator) in the nightshade family, historically praised for enhancing vitality, endurance, and restful sleep.',
  'Used traditionally as a root powder in warm milk or ghee for calming Vata dosha, supporting cortisol balance and strength.',
  'Roots primarily, and occasionally leaves',
  'Dry, arid regions of northwestern India, the Mediterranean, and northern Africa.',
  'Drought-tolerant; thrives in loose sandy-loam soil and full sun with minimal watering.',
  'Avoid during pregnancy. Can affect thyroid hormone levels. Consult a healthcare practitioner if taking sedative or immunosuppressant medication.',
  '/assets/ashwagandha.jpg',
  '[{"title": "NCCIH — Ashwagandha Research Review", "url": "https://www.nccih.nih.gov/health/ashwagandha"}]'::jsonb
),
(
  'neem',
  'Neem',
  'Azadirachta indica',
  'Nimba',
  ARRAY['Margosa', 'Indian Lilac', 'Veppam'],
  'Skin Care',
  'Known as “Arista” (the imperishable protector) in Sanskrit, Neem is a legendary bitter tree renowned for purification and skin health.',
  'Leaves and bark historically used in herbal washes, pastes for purifying blood (Raktashodhaka), and oral chew sticks for dental hygiene.',
  'Leaves, bark, seeds, and seed oil',
  'Tropical and subtropical regions of South Asia; thrives in semi-arid conditions.',
  'Deep-rooted, drought resistant, grows well in dry soils and requires full bright sunshine.',
  'Pure neem seed oil is toxic if ingested internally and must never be swallowed, especially by children. For external use, always perform a patch test.',
  '/assets/neem.jpg',
  '[{"title": "Memorial Sloan Kettering — Neem Monograph", "url": "https://www.mskcc.org"}]'::jsonb
),
(
  'brahmi',
  'Water Hyssop',
  'Bacopa monnieri',
  'Brahmi',
  ARRAY['Jalabrahmi', 'Herpestis monniera', 'Aindri'],
  'Stress Relief',
  'A premier Medhya Rasayana (mind and intellect rejuvenator), this creeping succulent has supported meditation, memory, and cognitive tranquility for millennia.',
  'Traditionally prepared with ghee or warm water to nourish Majja dhatu (nervous tissue), sharpen concentration, and reduce mental fatigue.',
  'Whole succulent plant and leaves',
  'Wetlands, marshy ground, pond edges, and damp soils throughout warm regions.',
  'Requires high moisture or boggy soil conditions and bright, indirect to direct light.',
  'Large doses on an empty stomach may cause mild gastrointestinal upset. Note: distinct from Gotu Kola (Centella asiatica), which is also sometimes called Brahmi in north India.',
  '/assets/brahmi.jpg',
  '[{"title": "NCCIH — Bacopa monnieri Evidence Summary", "url": "https://www.nccih.nih.gov"}]'::jsonb
),
(
  'turmeric',
  'Turmeric',
  'Curcuma longa',
  'Haridra',
  ARRAY['Haldi', 'Kanchani', 'Golden Spice'],
  'Heart Health',
  'A sacred golden rhizome in the ginger family, revered both as a daily culinary cornerstone and as a potent tridoshic purifying herb.',
  'Traditionally simmered with milk and black pepper (Golden Milk) to relieve stiffness, purify circulation, and foster skin radiance.',
  'Rhizome (underground root stem)',
  'Humid tropical areas with heavy annual rainfall and fertile organic soil.',
  'Planted after the last frost in warm partial shade. Requires moist, well-draining soil.',
  'Culinary amounts are safe for almost everyone. High concentrated curcumin extracts may aggravate gallstones or interact with blood thinners.',
  '/assets/turmeric.jpg',
  '[{"title": "Kew Royal Botanic Gardens — Curcuma longa", "url": "https://powo.science.kew.org"}]'::jsonb
),
(
  'giloy',
  'Heart-Leaved Moonseed',
  'Tinospora cordifolia',
  'Guduchi / Giloy',
  ARRAY['Amrita', 'Gurcha', 'Chinnobhava'],
  'Immunity',
  'Known as “Amrita” (nectar of immortality), Guduchi is an climbing deciduous shrub famous for its ability to balance all three doshas without creating heat.',
  'Classical root and stem decoctions used for lingering low fevers, cellular immunity, and natural detoxification.',
  'Mature stem and aerial roots',
  'Tropical deciduous and dry forests climbing upon Neem and Mango trees.',
  'Very hardy vine propagated easily from cuttings; thrives in moist soil with trellis support.',
  'Generally well-tolerated. Diabetics should monitor blood sugar levels as it may potentiate hypoglycemic medicines.',
  '/assets/giloy.jpg',
  '[{"title": "Ayurvedic Pharmacopoeia of India — Guduchi", "url": "https://ayush.gov.in"}]'::jsonb
),
(
  'aloe-vera',
  'Aloe Vera',
  'Aloe barbadensis',
  'Kumari',
  ARRAY['Ghritkumari', 'Gwarpatha', 'Korphad'],
  'Digestion',
  'Named “Kumari” (young maiden) reflecting its affinity for youthfulness, hormonal balance, and cooling liver support.',
  'Clear inner leaf fillet consumed for cooling Pitta heat and soothing digestive mucous membranes; applied externally for sunburns.',
  'Inner clear leaf gel (excluding the bitter yellow aloin latex)',
  'Dry, sub-tropical arid zones of the Mediterranean, Africa, and Rajasthan.',
  'Succulent requiring sandy cactus potting mix, minimal watering, and bright light.',
  'Do not ingest whole leaf preparations containing the yellow latex sap (aloin), which is a potent laxative and contra-indicated in pregnancy.',
  '/assets/aloe-vera.jpg',
  '[{"title": "NCCIH — Aloe Vera Facts", "url": "https://www.nccih.nih.gov"}]'::jsonb
),
(
  'ginger',
  'Ginger',
  'Zingiber officinale',
  'Shunthi (dry) / Adrak (fresh)',
  ARRAY['Nagara', 'Maha-aushadhi', 'Universal Medicine'],
  'Digestion',
  'Known as “Vishwabheshaja” (the universal remedy), ginger is praised for kindling Agni (digestive fire) without provoking excessive heat.',
  'Fresh ginger tea before meals stimulates appetite and eases nausea; dried ginger powder is used for respiratory comfort.',
  'Rhizome',
  'Cultivated globally across warm, humid subtropical climates.',
  'Grows well in pots or garden beds with partial sun and consistently moist, rich compost.',
  'Caution in active bleeding conditions or concurrent blood-thinning therapies.',
  '/assets/ginger.jpg',
  '[{"title": "World Health Organization Monographs — Rhizoma Zingiberis", "url": "https://who.int"}]'::jsonb
),
(
  'amla',
  'Indian Gooseberry',
  'Phyllanthus emblica',
  'Amalaki',
  ARRAY['Dhatri', 'Aonla', 'Emblic Myrobalan'],
  'Immunity',
  'Celebrated as one of the three sacred fruits of Triphala and the chief ingredient in Chyawanprash, bursting with stable natural vitamin C and polyphenols.',
  'Nourishes all tissues, supports vision, radiant hair, heart health, and balances Pitta and Vata.',
  'Fresh and dried fruit pericarp',
  'Tropical and subtropical deciduous forests of the Indian subcontinent.',
  'Tolerant of varied soils once established; requires warm sunny environment.',
  'High sourness may occasionally cause mild hyperacidity in sensitive stomachs if taken on an empty stomach without water or honey.',
  '/assets/amla.jpg',
  '[{"title": "Ayurvedic Pharmacopoeia of India — Amalaki", "url": "https://ayush.gov.in"}]'::jsonb
),
(
  'fenugreek',
  'Fenugreek',
  'Trigonella foenum-graecum',
  'Methika',
  ARRAY['Methi', 'Bird’s Foot'],
  'Diabetes',
  'An aromatic annual herb with small trifoliate leaves and golden-brown seeds, renowned for metabolic and glycemic balance.',
  'Soaked seeds taken in the morning to balance Kapha and Vata, support healthy blood sugar, and stimulate digestion.',
  'Seeds and fresh leaves',
  'Native to southern Europe and Asia; cultivated widely across India.',
  'Easy to grow in shallow containers; ready for microgreens in 2-3 weeks.',
  'May lower blood glucose; patients on anti-diabetic medications should monitor their metrics carefully.',
  '/assets/fenugreek.jpg',
  '[{"title": "NCCIH — Fenugreek Research Overview", "url": "https://www.nccih.nih.gov"}]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;
