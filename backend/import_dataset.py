"""
Repeatable, Idempotent Dataset Importer for Amidha Ayurveda Herb Database (v2.0)
Preserves all existing 12 curated Herbora plants, matching by normalized scientific
and Ayurvedic names without overwriting richer content. Enriches both existing and new
records with complete classical Dravyaguna properties and CC BY 4.0 citations.
"""
import os
import re
import json
import logging
from datetime import datetime, timezone
from sqlalchemy import text
from models import SessionLocal, Plant, init_db

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("herbora_importer")

# Curated 12 plants that are the cornerstone profiles of Herbora
CURATED_12_SLUGS = {
    "tulsi", "ashwagandha", "neem", "brahmi", "turmeric",
    "aloe-vera", "ginger", "giloy", "amla", "fenugreek",
    "shatavari", "karela"
}

# Botanical & vernacular mapping directly to the 12 curated Herbora plant slugs
KNOWN_HERBORA_SLUG_MAP = {
    # Botanical names
    "ocimum sanctum": "tulsi",
    "ocimum tenuiflorum": "tulsi",
    "withania somnifera": "ashwagandha",
    "azadirachta indica": "neem",
    "bacopa monnieri": "brahmi",
    "curcuma longa": "turmeric",
    "aloe barbadensis": "aloe-vera",
    "aloe vera": "aloe-vera",
    "zingiber officinale": "ginger",
    "tinospora cordifolia": "giloy",
    "phyllanthus emblica": "amla",
    "emblica officinalis": "amla",
    "trigonella foenum-graecum": "fenugreek",
    "asparagus racemosus": "shatavari",
    "momordica charantia": "karela",
    # Vernacular / Sanskrit names
    "tulsi": "tulsi",
    "ashwagandha": "ashwagandha",
    "nimba": "neem",
    "brahmi": "brahmi",
    "haridra": "turmeric",
    "kumari": "aloe-vera",
    "shunthi": "ginger",
    "giloy": "giloy",
    "amalaki": "amla",
    "amla": "amla",
    "methika": "fenugreek",
    "methi": "fenugreek",
    "shatavari": "shatavari",
    "karavellaka": "karela"
}

CC_BY_ATTRIBUTION = {
    "title": "Dataset Citation: Amidha Ayurveda Herb Database v2.0 (CC BY 4.0)",
    "url": "https://doi.org/10.5281/zenodo.17475351"
}

def normalize_text(val):
    if not val:
        return ""
    return re.sub(r'[^a-z0-9]', '', str(val).lower().strip())

def slugify(text):
    text = re.sub(r'[^a-zA-Z0-9\s-]', '', str(text)).strip().lower()
    return re.sub(r'[\s_-]+', '-', text)

def infer_category(p):
    prabhavs = [str(x).lower() for x in p.get('prabhav', [])]
    indications = [str(x).lower() for x in p.get('main_indications', [])]
    text_corpus = (p.get('preview', '') + ' ' + ' '.join(prabhavs) + ' ' + ' '.join(indications)).lower()

    if any(k in text_corpus for k in ['prameha', 'madhumeha', 'diabetes', 'glycemic', 'insulin', 'blood sugar']):
        return 'Diabetes'
    if any(k in text_corpus for k in ['kushta', 'tvachya', 'varnya', 'skin', 'complexion', 'kandu']):
        return 'Skin Care'
    if any(k in text_corpus for k in ['medhya', 'smriti', 'brain', 'memory', 'stress', 'insomnia', 'manasa', 'sleep', 'anxiety', 'nervine', 'neuro']):
        return 'Stress Relief'
    if any(k in text_corpus for k in ['hridya', 'hridaya', 'heart', 'cardio', 'blood circulation', 'cholesterol', 'rakta pitta', 'raktapitta']):
        return 'Heart Health'
    if any(k in text_corpus for k in ['deepana', 'pachana', 'agni', 'digest', 'grahi', 'anulomana', 'yakrit', 'liver', 'atisara', 'grahani', 'aruchi']):
        return 'Digestion'
    if any(k in text_corpus for k in ['rasayan', 'balya', 'adaptogen', 'vitality', 'rejuvenat', 'vrishya', 'ojovardhak']):
        return 'Adaptogens'
    if any(k in text_corpus for k in ['jwaraghna', 'jwara', 'krimighna', 'kasahara', 'shwasa', 'respiratory', 'immunity', 'cough', 'fever', 'shothahara']):
        return 'Immunity'
    return 'Immunity'

def generate_traditional_uses(p):
    uses_parts = []
    if p.get('main_indications'):
        uses_parts.append(f"Classically indicated in Ayurveda for {', '.join(p['main_indications'])}")
    if p.get('prabhav'):
        uses_parts.append(f"Demonstrates {', '.join(p['prabhav'])} therapeutic action")
    if p.get('pacify'):
        uses_parts.append(f"Helps pacify {', '.join(p['pacify'])} dosha")
    if uses_parts:
        return ". ".join(uses_parts) + "."
    return p.get('preview', '')

def resolve_dataset_path():
    candidate_paths = [
        os.getenv("HERB_DATASET_PATH"),
        os.path.join(os.path.dirname(__file__), "..", "database", "data", "herb.json"),
        os.path.join(os.getcwd(), "database", "data", "herb.json"),
        os.path.join(os.path.dirname(__file__), "data", "herb.json"),
        os.path.join(os.path.dirname(__file__), "..", "..", "herb-database", "herb.json"),
        os.path.join(os.path.dirname(__file__), "..", "herb-database", "herb.json"),
        os.path.join(os.getcwd(), "herb-database", "herb.json"),
        os.path.join(os.getcwd(), "..", "herb-database", "herb.json"),
    ]
    for cp in candidate_paths:
        if cp and os.path.isfile(cp):
            return os.path.abspath(cp)
    raise FileNotFoundError("Could not locate herb.json in repository or workspace directories.")

def import_amidha_dataset(dataset_path=None):
    """
    Idempotent dataset import function.
    Reads dataset, matches existing 12 curated records without overwriting rich content,
    and inserts or updates dataset records.
    """
    if dataset_path is None:
        dataset_path = resolve_dataset_path()

    logger.info(f"Loading dataset from: {dataset_path}")
    with open(dataset_path, "r", encoding="utf-8") as f:
        records = json.load(f)

    logger.info(f"Loaded {len(records)} plant records from dataset.")

    # Ensure schema has all columns
    init_db()

    db = SessionLocal()
    try:
        # Load all existing plants into memory
        existing_plants = db.query(Plant).all()
        by_slug = {p.slug: p for p in existing_plants}

        enriched_curated_slugs = set()
        updated_count = 0
        inserted_count = 0

        for r in records:
            name = (r.get("name") or "").strip()
            botanical = (r.get("botanical_name") or "").strip()
            english = (r.get("english_name") or "").strip()
            name_lower = name.lower()
            botanical_lower = botanical.lower()

            # 1. Check if this record matches one of the 12 curated plants
            matched_curated_slug = None
            if botanical_lower in KNOWN_HERBORA_SLUG_MAP:
                target_slug = KNOWN_HERBORA_SLUG_MAP[botanical_lower]
                # Disambiguate multi-record plants
                if target_slug == "ginger" and name_lower not in ("shunthi", "ginger", "adrak"):
                    pass
                elif target_slug == "giloy" and name_lower not in ("giloy", "guduchi"):
                    pass
                else:
                    matched_curated_slug = target_slug
            elif name_lower in KNOWN_HERBORA_SLUG_MAP:
                matched_curated_slug = KNOWN_HERBORA_SLUG_MAP[name_lower]

            target_plant = None
            is_curated_match = False

            if matched_curated_slug and matched_curated_slug in by_slug and matched_curated_slug not in enriched_curated_slugs:
                target_plant = by_slug[matched_curated_slug]
                enriched_curated_slugs.add(matched_curated_slug)
                is_curated_match = True
            else:
                # Regular dataset record: lookup by canonical slug
                std_slug = slugify(name)
                if std_slug in by_slug and std_slug not in CURATED_12_SLUGS:
                    target_plant = by_slug[std_slug]

            # Prepare source references with Amidha Monograph & CC BY citation
            source_refs = []
            if r.get("link"):
                source_refs.append({"title": f"Amidha Ayurveda — {name} Monograph", "url": r["link"]})
            source_refs.append(CC_BY_ATTRIBUTION)

            if target_plant:
                # ENRICH PLANT RECORD IDEMPOTENTLY
                target_plant.sanskrit_synonyms = r.get("sanskrit_synonyms") or target_plant.sanskrit_synonyms or []
                target_plant.part_used = r.get("part_used") or target_plant.part_used or []
                target_plant.main_indications = r.get("main_indications") or target_plant.main_indications or []
                target_plant.pacify = r.get("pacify") or target_plant.pacify or []
                target_plant.aggravate = r.get("aggravate") or target_plant.aggravate or []
                target_plant.tridosha = bool(r.get("tridosha", False))
                target_plant.rasa = r.get("rasa") or target_plant.rasa or []
                target_plant.guna = r.get("guna") or target_plant.guna or []
                target_plant.virya = r.get("virya") or target_plant.virya
                target_plant.vipaka = r.get("vipaka") or target_plant.vipaka
                target_plant.prabhav = r.get("prabhav") or target_plant.prabhav or []
                target_plant.family = r.get("family") or target_plant.family
                target_plant.monograph_url = r.get("link") or target_plant.monograph_url

                if not is_curated_match:
                    # For non-curated dataset records, update common_name / description if needed
                    target_plant.common_name = english or name
                    target_plant.scientific_name = botanical
                    target_plant.ayurvedic_name = name
                    target_plant.english_name = english or name
                    if not target_plant.description or len(target_plant.description) < len(r.get("preview", "")):
                        target_plant.description = r.get("preview") or target_plant.description
                else:
                    # For curated 12 plants, keep english_name updated without touching common_name
                    target_plant.english_name = english or target_plant.common_name

                # If plant_parts_used was empty, populate from part_used
                if not target_plant.plant_parts_used and r.get("part_used"):
                    target_plant.plant_parts_used = ", ".join(r["part_used"])

                # Merge source references without duplicates
                existing_ref_urls = {ref.get("url") for ref in (target_plant.source_references or [])}
                updated_refs = list(target_plant.source_references or [])
                for ref in source_refs:
                    if ref["url"] not in existing_ref_urls:
                        updated_refs.append(ref)
                        existing_ref_urls.add(ref["url"])
                target_plant.source_references = updated_refs

                # Merge regional names with Sanskrit synonyms
                current_regional = list(target_plant.regional_names or [])
                for syn in (r.get("sanskrit_synonyms") or []):
                    if syn not in current_regional:
                        current_regional.append(syn)
                target_plant.regional_names = current_regional

                target_plant.updated_at = datetime.now(timezone.utc)
                updated_count += 1
            else:
                # INSERT NEW PLANT RECORD
                std_slug = slugify(name)
                # Safeguard against slug collision with a curated slug
                slug_candidate = std_slug
                counter = 2
                while slug_candidate in by_slug:
                    slug_candidate = f"{std_slug}-{counter}"
                    counter += 1

                category = infer_category(r)
                traditional_uses = generate_traditional_uses(r)
                parts_str = ", ".join(r.get("part_used") or [])
                safety_info = "Educational reference only. Traditional Ayurvedic herbs should be taken under the guidance of a qualified Ayurvedic practitioner (Vaidya), especially during pregnancy, nursing, or alongside prescription therapies."

                new_plant = Plant(
                    slug=slug_candidate,
                    common_name=english or name,
                    scientific_name=botanical,
                    ayurvedic_name=name,
                    regional_names=r.get("sanskrit_synonyms") or [],
                    category=category,
                    description=r.get("preview") or f"{name} ({botanical}) is an Ayurvedic medicinal herb in the {r.get('family', 'botanical')} family.",
                    traditional_uses=traditional_uses,
                    plant_parts_used=parts_str,
                    habitat=f"Botanical Family: {r.get('family', 'Plantae')}" if r.get("family") else None,
                    cultivation_information=None,
                    safety_information=safety_info,
                    image_url=None,  # Frontend gracefully falls back to /assets/herbal-wellness.jpg
                    source_references=source_refs,
                    is_published=True,
                    # Ayurvedic Dravyaguna properties
                    sanskrit_synonyms=r.get("sanskrit_synonyms") or [],
                    part_used=r.get("part_used") or [],
                    main_indications=r.get("main_indications") or [],
                    pacify=r.get("pacify") or [],
                    aggravate=r.get("aggravate") or [],
                    tridosha=bool(r.get("tridosha", False)),
                    rasa=r.get("rasa") or [],
                    guna=r.get("guna") or [],
                    virya=r.get("virya"),
                    vipaka=r.get("vipaka"),
                    prabhav=r.get("prabhav") or [],
                    family=r.get("family"),
                    english_name=english or name,
                    monograph_url=r.get("link")
                )
                db.add(new_plant)
                by_slug[slug_candidate] = new_plant
                inserted_count += 1

        db.commit()
        total_plants = db.query(Plant).count()
        logger.info(
            f"Import complete: {updated_count} plants enriched/updated, "
            f"{inserted_count} new plants added, {total_plants} total plants now in database."
        )
        return {
            "updated": updated_count,
            "inserted": inserted_count,
            "total": total_plants
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error during dataset import: {e}", exc_info=True)
        raise
    finally:
        db.close()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Herbora - Amidha Ayurveda Dataset Importer")
    parser.add_argument("--source", default=None, help="Path to herb.json file")
    args = parser.parse_args()
    import_amidha_dataset(dataset_path=args.source)
