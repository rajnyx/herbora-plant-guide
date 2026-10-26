-- Migration: Add Amidha Ayurveda Dravyaguna attributes to existing Supabase PostgreSQL plants table
-- Run this migration in your Supabase SQL Editor if connecting to Supabase PostgreSQL.

ALTER TABLE public.plants ADD COLUMN IF NOT EXISTS sanskrit_synonyms JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.plants ADD COLUMN IF NOT EXISTS part_used JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.plants ADD COLUMN IF NOT EXISTS main_indications JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.plants ADD COLUMN IF NOT EXISTS pacify JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.plants ADD COLUMN IF NOT EXISTS aggravate JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.plants ADD COLUMN IF NOT EXISTS tridosha BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.plants ADD COLUMN IF NOT EXISTS rasa JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.plants ADD COLUMN IF NOT EXISTS guna JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.plants ADD COLUMN IF NOT EXISTS virya TEXT;
ALTER TABLE public.plants ADD COLUMN IF NOT EXISTS vipaka TEXT;
ALTER TABLE public.plants ADD COLUMN IF NOT EXISTS prabhav JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.plants ADD COLUMN IF NOT EXISTS family TEXT;
ALTER TABLE public.plants ADD COLUMN IF NOT EXISTS english_name TEXT;
ALTER TABLE public.plants ADD COLUMN IF NOT EXISTS monograph_url TEXT;

COMMENT ON COLUMN public.plants.sanskrit_synonyms IS 'Classical Sanskrit synonyms from Ayurvedic texts (Charaka, Sushruta, Bhavaprakasha)';
COMMENT ON COLUMN public.plants.part_used IS 'Ayurvedic plant morphology used therapeutically (Patra, Moola, Phala, etc.)';
COMMENT ON COLUMN public.plants.main_indications IS 'Classical Ayurvedic disease indications (Roga / Vyadhi)';
COMMENT ON COLUMN public.plants.pacify IS 'Doshas pacified by the herb (Vata, Pitta, Kapha)';
COMMENT ON COLUMN public.plants.aggravate IS 'Doshas aggravated if taken in excess';
COMMENT ON COLUMN public.plants.tridosha IS 'Whether the plant balances all three doshas (Tridoshahara)';
COMMENT ON COLUMN public.plants.rasa IS 'Ayurvedic tastes (Shad Rasa: Madhura, Amla, Lavana, Katu, Tikta, Kashaya)';
COMMENT ON COLUMN public.plants.guna IS 'Ayurvedic physical & pharmacological qualities (Gurvadi Gunas)';
COMMENT ON COLUMN public.plants.virya IS 'Ayurvedic thermal potency (Ushna / Sheeta)';
COMMENT ON COLUMN public.plants.vipaka IS 'Ayurvedic post-digestive metabolic transformation (Madhura / Amla / Katu)';
COMMENT ON COLUMN public.plants.prabhav IS 'Specific unique therapeutic actions (Prabhava, e.g. Rasayana, Deepana, Pachana)';
COMMENT ON COLUMN public.plants.monograph_url IS 'Direct link to source monograph at Amidha Ayurveda';

-- Performance indexes for lookup queries
CREATE INDEX IF NOT EXISTS idx_plants_scientific_name ON public.plants (scientific_name);
CREATE INDEX IF NOT EXISTS idx_plants_ayurvedic_name ON public.plants (ayurvedic_name);
CREATE INDEX IF NOT EXISTS idx_plants_category ON public.plants (category);
CREATE INDEX IF NOT EXISTS idx_plants_virya ON public.plants (virya);
CREATE INDEX IF NOT EXISTS idx_plants_family ON public.plants (family);
CREATE INDEX IF NOT EXISTS idx_plants_english_name ON public.plants (english_name);

