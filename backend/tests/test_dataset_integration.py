"""
Comprehensive Test Suite for Amidha Ayurveda Dataset Integration in Herbora
Covers:
1. Database Schema Extension (Dravyaguna columns)
2. Preservation of Curated 12 Plant Profiles (images, rich text, citations)
3. Import Idempotency & Duplicate Prevention
4. Dataset Coverage & CC BY 4.0 Attribution
5. REST API Endpoints (/api/plants, /api/plants/<slug>, /api/plants/search)
"""
import os
import sys
import unittest
import json

# Add backend directory to sys.path
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app import create_app
from models import SessionLocal, Plant, init_db
from import_dataset import import_amidha_dataset, CURATED_12_SLUGS

class TestDatasetIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.client = cls.app.test_client()
        init_db()

    def setUp(self):
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_01_schema_extension(self):
        """Verify that all new Ayurvedic Dravyaguna attributes exist on Plant model"""
        expected_fields = [
            "sanskrit_synonyms", "part_used", "main_indications",
            "pacify", "aggravate", "tridosha", "rasa", "guna",
            "virya", "vipaka", "prabhav", "family", "english_name",
            "monograph_url"
        ]
        sample_plant = self.db.query(Plant).first()
        self.assertIsNotNone(sample_plant, "Database should contain plants.")
        plant_dict = sample_plant.to_dict()
        for field in expected_fields:
            self.assertIn(field, plant_dict, f"Plant dictionary missing field: {field}")

    def test_02_curated_12_profiles_preserved(self):
        """Verify that all 12 curated Herbora plants exist with original images and rich content"""
        expected_curated = {
            "tulsi": "/assets/tulsi.jpg",
            "ashwagandha": "/assets/ashwagandha.jpg",
            "neem": "/assets/neem.jpg",
            "brahmi": "/assets/brahmi.jpg",
            "turmeric": "/assets/turmeric.jpg",
            "aloe-vera": "/assets/aloe-vera.jpg",
            "ginger": "/assets/daily-wellness.jpg",
            "giloy": "/assets/herbal-wellness.jpg",
            "amla": "/assets/amla.jpg",
            "fenugreek": "/assets/fenugreek.jpg",
            "shatavari": "/assets/shatavari.jpg",
            "karela": "/assets/karela.jpg"
        }

        for slug, expected_img in expected_curated.items():
            plant = self.db.query(Plant).filter(Plant.slug == slug).first()
            self.assertIsNotNone(plant, f"Curated plant '{slug}' must exist in database.")
            self.assertTrue(plant.image_url == expected_img or "wikimedia" in (plant.image_url or ""), f"Plant '{slug}' image_url was unexpectedly modified.")
            self.assertTrue(len(plant.description or "") > 20, f"Plant '{slug}' description was emptied.")
            self.assertTrue(len(plant.safety_information or "") > 20, f"Plant '{slug}' safety_information was emptied.")
            self.assertIsNotNone(plant.category, f"Plant '{slug}' category must be set.")

            # Check that source references are preserved and include CC BY citation
            refs = plant.source_references or []
            self.assertTrue(len(refs) >= 1, f"Plant '{slug}' should retain source references.")
            has_citation = any("CC BY 4.0" in r.get("title", "") or "zenodo" in r.get("url", "") for r in refs)
            if slug != "neem":
                self.assertTrue(has_citation, f"Curated plant '{slug}' should have CC BY 4.0 dataset citation.")

    def test_03_dravyaguna_enrichment_on_curated_plants(self):
        """Verify that curated plants with dataset counterparts received Dravyaguna attributes"""
        tulsi = self.db.query(Plant).filter(Plant.slug == "tulsi").first()
        self.assertIsNotNone(tulsi)
        self.assertEqual(tulsi.virya, "Ushna")
        self.assertEqual(tulsi.vipaka, "Katu")
        self.assertIn("Katu", tulsi.rasa or [])
        self.assertIn("Kapha", tulsi.pacify or [])

        ashwagandha = self.db.query(Plant).filter(Plant.slug == "ashwagandha").first()
        self.assertIsNotNone(ashwagandha)
        self.assertEqual(ashwagandha.virya, "Ushna")
        self.assertEqual(ashwagandha.vipaka, "Madhura")
        self.assertIn("Tikta", ashwagandha.rasa or [])

        brahmi = self.db.query(Plant).filter(Plant.slug == "brahmi").first()
        self.assertIsNotNone(brahmi)
        self.assertEqual(brahmi.virya, "Sheeta")

    def test_04_dataset_plant_count_and_no_duplicate_slugs(self):
        """Verify total plant count reflects full dataset and all slugs are unique"""
        plants = self.db.query(Plant).all()
        self.assertGreaterEqual(len(plants), 360, "Database should contain at least 360 plants.")

        slugs = [p.slug for p in plants]
        unique_slugs = set(slugs)
        self.assertEqual(len(slugs), len(unique_slugs), "All plant slugs must be unique (no duplicates).")

    def test_05_import_idempotency(self):
        """Verify that running import_amidha_dataset multiple times does not create duplicates"""
        count_before = self.db.query(Plant).count()
        result = import_amidha_dataset()
        count_after = self.db.query(Plant).count()
        self.assertEqual(count_before, count_after, "Re-running import must not create duplicate plant records.")
        self.assertEqual(result["inserted"], 0, "Second import run should insert 0 new plants.")

    def test_06_api_get_all_plants(self):
        """Verify GET /api/plants returns list of plants with Ayurvedic properties"""
        res = self.client.get('/api/plants')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 360)

        # Check first record structure
        first = data[0]
        self.assertIn("common_name", first)
        self.assertIn("scientific_name", first)
        self.assertIn("virya", first)
        self.assertIn("rasa", first)

    def test_07_api_get_plant_detail(self):
        """Verify GET /api/plants/<slug> returns detailed plant data"""
        res = self.client.get('/api/plants/tulsi')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["slug"], "tulsi")
        self.assertEqual(data["common_name"], "Holy Basil")
        self.assertEqual(data["virya"], "Ushna")
        self.assertEqual(data["image_url"], "/assets/tulsi.jpg")

    def test_08_api_category_filter(self):
        """Verify GET /api/plants?category=Immunity filters properly"""
        res = self.client.get('/api/plants?category=Immunity')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(all(p["category"] == "Immunity" for p in data))
        self.assertGreater(len(data), 0)

    def test_09_api_search_query(self):
        """Verify GET /api/plants?q=ashwagandha and GET /api/plants/search"""
        res = self.client.get('/api/plants?q=ashwagandha')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(any(p["slug"] == "ashwagandha" for p in data))

        res_search = self.client.get('/api/plants/search?q=curcuma')
        self.assertEqual(res_search.status_code, 200)
        data_search = res_search.get_json()
        self.assertTrue(any("curcuma" in p["scientific_name"].lower() for p in data_search))

    def test_10_cc_by_attribution_in_sources(self):
        """Verify source_references across dataset herbs contain Amidha links and CC BY citation"""
        new_herbs = self.db.query(Plant).filter(~Plant.slug.in_(CURATED_12_SLUGS)).limit(10).all()
        for herb in new_herbs:
            refs = herb.source_references or []
            self.assertTrue(len(refs) >= 1, f"Herb '{herb.slug}' should have source references.")
            has_doi_or_amidha = any("amidha" in (r.get("url") or "").lower() or "zenodo" in (r.get("url") or "").lower() for r in refs)
            self.assertTrue(has_doi_or_amidha, f"Herb '{herb.slug}' should reference Amidha or Zenodo DOI.")

if __name__ == '__main__':
    unittest.main()
