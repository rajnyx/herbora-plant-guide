CREATE TABLE public.plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  common_name text NOT NULL,
  scientific_name text NOT NULL,
  ayurvedic_name text,
  regional_names text[] NOT NULL DEFAULT '{}',
  category text NOT NULL,
  description text NOT NULL,
  traditional_uses text,
  plant_parts_used text,
  habitat text,
  cultivation_information text,
  safety_information text NOT NULL,
  image_url text,
  source_references jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plants TO anon, authenticated;
GRANT ALL ON public.plants TO service_role;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published plants are publicly readable" ON public.plants FOR SELECT TO anon, authenticated USING (is_published = true);

CREATE TABLE public.user_saved_plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plant_id uuid NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, plant_id)
);
GRANT SELECT, INSERT, DELETE ON public.user_saved_plants TO authenticated;
GRANT ALL ON public.user_saved_plants TO service_role;
ALTER TABLE public.user_saved_plants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their saved plants" ON public.user_saved_plants FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can save plants" ON public.user_saved_plants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their saved plants" ON public.user_saved_plants FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER plants_set_updated_at BEFORE UPDATE ON public.plants FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.plants (slug, common_name, scientific_name, ayurvedic_name, regional_names, category, description, traditional_uses, plant_parts_used, habitat, cultivation_information, safety_information, source_references) VALUES
('tulsi', 'Holy Basil', 'Ocimum tenuiflorum', 'Tulsi', ARRAY['Tulasi','Sacred basil'], 'Aromatic herbs', 'An aromatic shrub in the mint family, widely cultivated across India and valued in household and ceremonial traditions.', 'Traditionally described in Ayurvedic literature as an aromatic herb used in household wellness practices.', 'Leaves and flowering tops', 'Native to tropical and subtropical Asia; commonly cultivated around homes and gardens.', 'Prefers warm weather, well-drained soil, and regular sunlight.', 'Educational information only. Tulsi may interact with medicines and may not be appropriate during pregnancy. Consult a qualified health professional before therapeutic use.', '[{"title":"Kew Plants of the World Online — Ocimum tenuiflorum","url":"https://powo.science.kew.org/"},{"title":"NCCIH — Holy Basil","url":"https://www.nccih.nih.gov/"}]'),
('ashwagandha', 'Ashwagandha', 'Withania somnifera', 'Ashwagandha', ARRAY['Indian ginseng','Winter cherry'], 'Roots', 'A small evergreen shrub of the nightshade family found in dry regions of India and nearby areas.', 'The root has a long history of traditional Ayurvedic use. Evidence and safety depend on preparation and context.', 'Primarily root; leaves are also documented in traditional practice', 'Dry and subtropical regions across South Asia, the Middle East, and parts of Africa.', 'Grows best in dry, well-drained soil and full sun.', 'Avoid during pregnancy. It may affect thyroid function and interact with medicines. Seek professional guidance before use.', '[{"title":"Kew Plants of the World Online — Withania somnifera","url":"https://powo.science.kew.org/"},{"title":"NCCIH — Ashwagandha","url":"https://www.nccih.nih.gov/health/ashwagandha"}]'),
('neem', 'Neem', 'Azadirachta indica', 'Nimba', ARRAY['Margosa'], 'Trees', 'A fast-growing evergreen tree native to the Indian subcontinent, recognized by its compound leaves and small white flowers.', 'Different parts of neem are documented in traditional practices. These uses are historical and are not proof of treatment effectiveness.', 'Leaves, bark, seeds, and oil', 'Tropical and subtropical regions; tolerant of hot, seasonally dry conditions.', 'Needs sun, warmth, and well-drained soil; established trees tolerate drought.', 'Neem oil and extracts can be toxic if swallowed, especially for children and during pregnancy. Do not self-medicate.', '[{"title":"Kew Plants of the World Online — Azadirachta indica","url":"https://powo.science.kew.org/"},{"title":"Memorial Sloan Kettering — Neem","url":"https://www.mskcc.org/cancer-care/integrative-medicine/herbs/neem"}]'),
('turmeric', 'Turmeric', 'Curcuma longa', 'Haridra', ARRAY['Haldi'], 'Rhizomes', 'A perennial herb in the ginger family, cultivated for its bright yellow-orange underground rhizomes.', 'Turmeric has longstanding culinary and traditional use. Research on concentrated curcumin products does not make them a substitute for medical care.', 'Rhizome', 'Cultivated throughout tropical South and Southeast Asia.', 'Prefers warm, humid conditions, rich soil, and partial to full sun.', 'Food amounts are generally well tolerated. Concentrated products can interact with medicines or aggravate gallbladder conditions.', '[{"title":"Kew Plants of the World Online — Curcuma longa","url":"https://powo.science.kew.org/"},{"title":"NCCIH — Turmeric","url":"https://www.nccih.nih.gov/health/turmeric"}]'),
('amla', 'Indian Gooseberry', 'Phyllanthus emblica', 'Amalaki', ARRAY['Amla'], 'Fruits', 'A small to medium deciduous tree that produces pale green, round, distinctly sour fruits.', 'Amla fruit is prominent in Ayurvedic food and traditional formulations. Traditional significance should not be read as a guaranteed health outcome.', 'Fruit', 'Native across tropical and subtropical South and Southeast Asia.', 'Thrives in sun and tolerates a range of soils once established.', 'Food use is generally common. Concentrated preparations may affect blood sugar or interact with medicines.', '[{"title":"Kew Plants of the World Online — Phyllanthus emblica","url":"https://powo.science.kew.org/"}]'),
('brahmi', 'Water Hyssop', 'Bacopa monnieri', 'Brahmi', ARRAY['Jalabrahmi'], 'Aquatic herbs', 'A creeping succulent herb with small white flowers, naturally found in wetlands and damp ground.', 'Brahmi is traditionally discussed in Ayurveda in relation to learning and memory. Clinical evidence varies by preparation.', 'Whole plant', 'Wetlands, marshy ground, and tropical shorelines in many regions.', 'Needs consistently moist or shallow-water conditions and bright light.', 'May cause digestive effects and interact with medicines. Confirm botanical identity because the name Brahmi is used for more than one plant.', '[{"title":"Kew Plants of the World Online — Bacopa monnieri","url":"https://powo.science.kew.org/"},{"title":"Memorial Sloan Kettering — Bacopa","url":"https://www.mskcc.org/cancer-care/integrative-medicine/herbs/bacopa"}]'),
('aloe-vera', 'Aloe Vera', 'Aloe vera', 'Kumari', ARRAY['Ghritkumari'], 'Succulents', 'A stemless or short-stemmed succulent with fleshy, serrated leaves containing a clear inner gel and yellow latex layer.', 'The clear inner gel has a history of topical use. Aloe latex is chemically different and carries greater safety concerns.', 'Inner leaf gel; latex is distinct and should not be confused with gel', 'Probably native to the Arabian Peninsula and now cultivated widely in dry climates.', 'Requires bright light and freely draining soil; avoid overwatering.', 'Do not ingest aloe latex; it can cause serious adverse effects. Patch-test topical products and seek advice for persistent skin problems.', '[{"title":"Kew Plants of the World Online — Aloe vera","url":"https://powo.science.kew.org/"},{"title":"NCCIH — Aloe Vera","url":"https://www.nccih.nih.gov/health/aloe-vera"}]'),
('ginger', 'Ginger', 'Zingiber officinale', 'Shunthi', ARRAY['Adrak'], 'Rhizomes', 'A tropical perennial herb cultivated for its aromatic underground rhizome and narrow leafy shoots.', 'Ginger is used as food and has extensive traditional documentation across Asian medical systems.', 'Rhizome', 'Known primarily in cultivation across tropical regions; its exact wild origin is uncertain.', 'Prefers warmth, humidity, rich soil, and filtered sunlight.', 'Food amounts are usually well tolerated. Supplements may interact with anticoagulants and can cause digestive discomfort.', '[{"title":"Kew Plants of the World Online — Zingiber officinale","url":"https://powo.science.kew.org/"},{"title":"NCCIH — Ginger","url":"https://www.nccih.nih.gov/health/ginger"}]');