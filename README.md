# 🌿 Herbora — Ancient Wisdom • Modern Discovery

An Ayurveda-focused digital platform that bridges millennia-old traditional botanical medicine (*Dravyaguna Vijnana*) with modern web discovery, computational plant taxonomy, and heuristic identification.

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![License: CC BY 4.0](https://img.shields.io/badge/Dataset_License-CC_BY_4.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![DOI](https://img.shields.io/badge/DOI-10.5281%2Fzenodo.17475351-blue)](https://doi.org/10.5281/zenodo.17475351)

---

## 📖 Project Overview

**Herbora** is designed to preserve, organize, and democratize authentic Ayurvedic botanical wisdom through a full-stack digital experience. It provides students, researchers, herbalists, and wellness seekers with an interactive herbarium containing **361 unique medicinal plants**, complete with traditional Ayurvedic pharmacology, clinical disease indications, home remedies, circadian regimens (*Dincharya*), and botanical vision tools.

---

## 🗄️ Botanical Database & Dataset Integration

Herbora's core botanical repository contains **361 unique plant records**, uniting deeply curated high-resolution plant guides with an open-source citable dataset:

### 1. Database Architecture & Breakdown

| Category | Count | Source & Details |
|---|---|---|
| **Curated Cornerstone Herbs** | **12** | Hand-crafted botanical profiles featuring custom high-resolution studio photography (`/assets/*.jpg`), detailed micro-climate cultivation guides, wild habitat mapping, and specific pharmaceutical contraindications (*Tulsi, Ashwagandha, Neem, Brahmi, Turmeric, Aloe Vera, Ginger, Giloy, Amla, Fenugreek, Shatavari, Karela*). |
| **Integrated Dataset Herbs** | **349** | Standardized canonical records integrated directly from the open-source **Amidha Ayurveda Herb Database v2.0** by Sparsh Varshney (Uttarakhand Ayurved University), licensed under **CC BY 4.0**. |
| **Total Botanical Records** | **361** | 100% unique plant taxa indexed with zero duplicates. |

### 2. Ayurvedic Pharmacology Schema (*Dravyaguna Vijnana*)

Every plant record is structured with comprehensive classical attributes:

* **Ṣaḍ Rasa (Six Primary Tastes)**: *Madhura* (Sweet), *Amla* (Sour), *Lavana* (Salty), *Katu* (Pungent), *Tikta* (Bitter), *Kashaya* (Astringent).
* **Gurvādi Guṇa (20 Physical & Pharmacological Qualities)**: *Laghu* (Light), *Guru* (Heavy), *Snigdha* (Unctuous), *Ruksha* (Dry), *Sheeta* (Cold), *Ushna* (Hot), *Tikshna* (Sharp), *Sara* (Mobile), etc.
* **Vīrya (Thermal Potency)**: *Ushna* (Heating) or *Sheeta* (Cooling).
* **Vipāka (Post-Digestive Transformation)**: *Madhura* (Sweet/Nourishing), *Amla* (Sour), or *Katu* (Pungent/Catabolic).
* **Prabhāva (Specific Therapeutic Actions)**: Actions beyond standard taste-potency rules, including *Rasāyana* (Rejuvenator), *Dīpana* (Agni/Enzyme Kindle), *Pācana* (Toxin Digestant), *Medhya* (Nootropic/Cognitive), *Hṛdya* (Cardiotonic), *Chakṣuṣya* (Ophthalmic), *Kṛmighna* (Anthelmintic/Antimicrobial), *Balya* (Strength-Promoting).
* **Doṣa Karma (Constitutional Balance)**:
  * **Pacifies (*Śamana*)**: Which of *Vāta, Pitta, Kapha* are normalized.
  * **Aggravates (*Prakopa*)**: Which doshas are provoked if taken in excess.
  * **Tridoṣahara**: Flags herbs that harmonize all three doshas simultaneously (*e.g. Giloy, Amla, Brahmi, Aloe Vera*).
* **Prayojyāṅga (Medicinal Parts Used)**: *Patra* (Leaves), *Mūla* (Roots), *Phala* (Fruits), *Kanda* (Rhizomes/Tubers), *Tvāk* (Bark), *Bīja* (Seeds), *Puṣpa* (Flowers).
* **Roga / Vyādhi (Classical Clinical Indications)**: Disease states documented in foundational texts (*Kāsa* [Cough], *Śvāsa* [Dyspnea/Asthma], *Jvara* [Fever], *Prameha* [Metabolic/Diabetes], *Kuṣṭha* [Dermatological], *Pāṇḍu* [Anemia], *Raktapitta* [Bleeding Disorders]).
* **Nāma & Paryāya (Sanskrit Synonyms)**: Verified citations from classical *Nighantus* (*Bhavaprakasha, Raj Nighantu, Kaiyadeva Nighantu*).
* **Source Monograph & Citable DOI**: Direct links to Amidha Ayurveda monographs and the Zenodo archive DOI citation.

### 3. Idempotent Ingestion Pipeline

The dataset is ingested through a repeatable pipeline ([backend/import_dataset.py](file:///c:/Users/rajsi/OneDrive/Desktop/Documents/raj/Herbora-workspace/herbaura/backend/import_dataset.py)):
* **Zero Data Degradation**: Matches existing plants via normalized scientific binomials, known botanical synonyms (*Aloe vera* $\leftrightarrow$ *Aloe barbadensis*, *Emblica officinalis* $\leftrightarrow$ *Phyllanthus emblica*), and Sanskrit names.
* **Protected Curated Fields**: Existing rich descriptions, photos, and cultivation guides are strictly retained.
* **Auto-Execution**: The pipeline runs automatically during backend database initialization or standalone via CLI:
  ```powershell
  cd backend
  python import_dataset.py
  ```

---

## 🌿 Project Directory Structure

```
herbaura/
│
├── frontend/                               # React 19 + Vite 8 + Tailwind CSS v4 Client
│   ├── public/
│   │   └── assets/                         # High-res photography & official crest
│   │       ├── herbora-logo.png            # Official Herbora brand seal
│   │       ├── herbora-hero.jpg            # Stone mortar & pestle botanical still life
│   │       ├── tulsi.jpg                   # Dedicated Tulsi photograph
│   │       ├── ashwagandha.jpg             # Dedicated Ashwagandha photograph
│   │       ├── neem.jpg                    # Dedicated Neem photograph
│   │       ├── turmeric.jpg                # Dedicated Turmeric photograph
│   │       ├── aloe-vera.jpg               # Dedicated Aloe Vera photograph
│   │       ├── brahmi.jpg                  # Dedicated Brahmi photograph
│   │       ├── amla.jpg                    # Dedicated Amla photograph
│   │       ├── fenugreek.jpg               # Dedicated Fenugreek photograph
│   │       ├── shatavari.jpg               # Dedicated Shatavari photograph
│   │       ├── karela.jpg                  # Dedicated Bitter Melon photograph
│   │       ├── daily-wellness.jpg          # Daily Wellness banner photo
│   │       └── herbal-wellness.jpg         # Classical fallback botanical still life
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx                  # Top banner with global search & profile
│   │   │   ├── HeroSection.jsx             # Serif hero banner with sage accents
│   │   │   ├── FeatureCards.jsx            # 3 entry-point cards to core portals
│   │   │   ├── NavigationDrawer.jsx        # Responsive slide-over drawer
│   │   │   ├── PlantDetailModal.jsx        # Complete Dravyaguna & clinical detail modal
│   │   │   ├── ChatAssistant.jsx           # Floating botanical assistant bot
│   │   │   ├── AuthModal.jsx               # Supabase + local hybrid authentication
│   │   │   └── ProfileModal.jsx            # User profile & saved collections manager
│   │   ├── pages/
│   │   │   ├── PlantopediaPage.jsx         # 361-herb library with multi-field search
│   │   │   ├── MyPlantDBPage.jsx           # Personal saved plant collection
│   │   │   ├── IdentifyPlantPage.jsx       # AI Botanical vision identification suite
│   │   │   ├── DailyWellnessPage.jsx       # 24-hour Dincharya circadian timeline
│   │   │   ├── WellnessTipsPage.jsx        # Kitchen remedies & 3D Myths vs. Facts
│   │   │   ├── GardenPlannerPage.jsx       # Herb care guide & watering checklist
│   │   │   ├── QuizPage.jsx                # Interactive 5-question Ayurvedic test
│   │   │   ├── CommunityPage.jsx           # Balcony grower notes feed & post creator
│   │   │   └── AboutPage.jsx               # Academic vision, team, & health disclaimer
│   │   ├── context/
│   │   │   ├── LanguageContext.jsx         # Bilingual provider (English & Hindi)
│   │   │   └── translations.js             # Dual-language botanical dictionary
│   │   ├── services/
│   │   │   └── api.js                      # Resilient REST API client & offline fallbacks
│   │   ├── App.jsx                         # Central router & state manager
│   │   └── index.css                       # Design tokens (#F8F5EA cream, #174B2B deep green)
│   ├── package.json
│   └── vite.config.js
│
├── backend/                                # Python Flask REST API
│   ├── app.py                              # Flask application factory, CORS, & seeding
│   ├── models.py                           # SQLAlchemy models with Dravyaguna schema
│   ├── routes.py                           # REST API endpoints (/api/plants, /api/identify, etc.)
│   ├── import_dataset.py                   # Repeatable, idempotent 360-herb importer
│   ├── herbora.db                          # Active SQLite database (361 records)
│   ├── herbora.db.bak                      # Initial database backup snapshot
│   ├── services/
│   │   └── plant_identifier.py             # Botanical vision analyzer & synonym dictionary
│   ├── tests/
│   │   └── test_dataset_integration.py     # 10 automated unit & integration tests
│   ├── requirements.txt
│   └── .env                                # Local configuration (PORT=5000, SQLite)
│
├── database/
│   ├── schema.sql                          # Production Supabase PostgreSQL schema with RLS
│   └── migration_amidha_properties.sql     # Idempotent migration script for Supabase
│
└── start-herbora.bat                       # One-click dual-server Windows launcher
```

---

## 🎨 Visual Identity & Design System

* **Brand Crest**: Circular crest featuring a botanical mortar and pestle encircled by leaves, with the serif wordmark *Herbora* and tagline *"ANCIENT WISDOM • MODERN DISCOVERY"*.
* **Color Palette**:
  * **Ivory Cream (Background)**: `#F8F5EA` / `#FAF8F2` — Warm, parchment-like canvas reflecting ancient palm-leaf manuscripts.
  * **Deep Forest Green (Primary)**: `#174B2B` / `#113E21` — Dense Ayurvedic medicinal forest.
  * **Mid Forest Green**: `#285D36`
  * **Sage Green (Accents & Badges)**: `#8DA56B` / `#E2ECD5`
  * **Parchment Borders**: `#DDD6C3` / `#D9D6C9`
* **Typography**:
  * **Headings**: *Cormorant Garamond* (refined classical serif).
  * **Body, UI, & Search**: *DM Sans* (clean, legible contemporary sans-serif).
* **Bilingual Localization**: Built-in instantaneous English $\leftrightarrow$ Hindi toggle covering navigation, categories, plant names, remedies, myths, and disclaimers.

---

## 🚀 How to Run Locally

### Option A: One-Click Launcher (Windows)
Double-click `start-herbora.bat` in the project root. It automatically:
1. Launches the Flask backend on `http://127.0.0.1:5000`.
2. Launches the React/Vite frontend on `http://localhost:5173`.
3. Opens the port bridge forwarder.

---

### Option B: Manual Step-by-Step

#### 1. Backend (Python Flask + SQLAlchemy)
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
* The API starts on `http://127.0.0.1:5000`.
* Automatically initializes the SQLite database `herbora.db` and syncs all **361 botanical records**.
* Health check: `http://127.0.0.1:5000/api/health`.

#### 2. Frontend (React 19 + Vite)
```powershell
cd frontend
npm install
npm run dev
```
* Opens in browser at `http://localhost:5173`.
* Automatically proxies `/api` calls to `http://127.0.0.1:5000`.

---

## 🧪 Running Automated Tests

A dedicated test suite is included in `backend/tests/`:

```powershell
cd backend
python -m unittest tests/test_dataset_integration.py
```

### Test Coverage (10 Automated Tests)
1. **Schema Extension**: Verifies all 14 Dravyaguna attributes exist on model and in JSON serializations.
2. **Curated Profile Preservation**: Verifies the 12 cornerstone plants retain dedicated photos, cultivation guides, and safety text without degradation.
3. **Dravyaguna Enrichment**: Validates *Rasa, Guna, Virya, Vipaka, and Prabhava* on matched herbs (*Tulsi, Ashwagandha, Brahmi, etc.*).
4. **Plant Count & Unique Slugs**: Verifies 361 total records with 100% unique slugs (zero duplicate collisions).
5. **Import Idempotency**: Tests running `import_amidha_dataset()` repeatedly without data duplication.
6. **API Catalog (`GET /api/plants`)**: Verifies 200 OK and complete plant lists.
7. **API Detail (`GET /api/plants/<slug>`)**: Verifies single plant lookup by slug or ID.
8. **Category Filtering (`GET /api/plants?category=Immunity`)**: Verifies category query parameters.
9. **Multi-Field Search (`GET /api/plants/search`)**: Verifies searching by common name, botanical name, and Ayurvedic attributes.
10. **CC BY 4.0 Attribution**: Validates that all records contain DOI citations and Amidha monograph URLs.

---

## 📋 Comprehensive Feature Suite

### 1. Plantopedia (Botanical Library)
* Instantaneous client-side search across English names, botanical names, Sanskrit names, parts used, tastes (*Rasa*), potency (*Virya*), and clinical indications.
* Seven category filters: **Immunity, Adaptogens, Skin Care, Stress Relief, Heart Health, Digestion, Diabetes**.
* Detailed modal cards featuring:
  * High-res imagery or graceful botanical still-life fallbacks.
  * Dosha Karma indicators (*Tridosha Balancer, Pacifies, Aggravates*).
  * 4-cell Dravyaguna matrix (*Rasa, Guna, Virya, Vipaka*).
  * Clinical indications (*Roga / Vyādhi*) and specific action (*Prabhava*).
  * Traditional uses, parts used, habitat, and cultivation tips.
  * Clinical safety warnings and educational disclaimers.
  * Scientific references with clickable DOI links.

### 2. My Plant DB (Saved Collection)
* Secure personal repository powered by hybrid Supabase Auth and local session fallback.
* Users can bookmark herbs directly from cards or modals with persistent tracking.

### 3. AI Botanical Vision & Identification
* Multi-modal input: file upload, drag-and-drop, device camera trigger, or sample herb gallery.
* Powered by real-time heuristic analyzer and botanical synonym dictionary (30+ taxonomical synonyms mapped to Plantopedia).
* Returns matched plant profile, confidence score, and direct link to the full plant guide.

### 4. Daily Wellness (*Dincharya*)
* Circadian routine timeline synchronized with traditional 24-hour doshic cycles:
  * **5:00 – 7:00 AM (Brahma Muhurta)**: Awakening, *Ushapan* (warm water), tongue scraping (*Jihwa Nirlekhana*).
  * **7:00 – 10:00 AM**: *Abhyanga* (sesame oil massage), *Pranayama*, light breakfast.
  * **12:00 – 2:00 PM (Pitta Peak)**: Largest nutrient-dense meal when digestive fire (*Agni*) is highest.
  * **7:00 – 10:00 PM (Kapha Transition)**: Golden turmeric milk, digital sunset, restorative sleep.

### 5. Herbal Remedies & Myths vs. Facts
* Classical kitchen apothecary formulas:
  * *Golden Turmeric Elixir* (Turmeric + black pepper + ghee in warm milk).
  * *Honey & Holy Basil Infusion* (Fresh Tulsi tea with raw honey).
  * *Agni Kindling Ginger Infusion* (Fresh ginger + rock salt + lime).
  * *Rose & Fennel Cooling Tonic* (Pitta-calming summer infusion).
* Interactive 3D flip cards addressing herbal misconceptions (safety, onset speed, personalization, mixing).

### 6. Home Garden Planner
* Beginner-friendly balcony gardening guides for household herbs (Tulsi, Mint, Aloe Vera, Brahmi).
* Parameter matrix: sunlight requirements, watering intervals, soil composition, and pruning tips.
* Interactive watering schedule checklist.

### 7. Interactive Ayurvedic Quiz
* 5-question randomized knowledge test on classical botany, doshas, and herb terminology.
* Instant explanations and percentage score cards.

### 8. Balcony Grower Community
* Community feed where urban herbalists share germination logs, soil blends, and balcony photos.
* Interactive post creation and like counter.

### 9. Floating Botanical Assistant
* Corner avatar widget with instant keyword search and guidance on remedies, sleep, skin health, and cultivation.

---

## 🗄️ Supabase PostgreSQL Setup (Optional)

Herbora is pre-configured with local SQLite for development. To connect directly to a remote Supabase PostgreSQL database:

1. In `backend/.env`, set your connection string:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
2. In the **Supabase SQL Editor**, execute [database/schema.sql](file:///c:/Users/rajsi/OneDrive/Desktop/Documents/raj/Herbora-workspace/herbaura/database/schema.sql) for a fresh instance, or execute [database/migration_amidha_properties.sql](file:///c:/Users/rajsi/OneDrive/Desktop/Documents/raj/Herbora-workspace/herbaura/database/migration_amidha_properties.sql) to add the Dravyaguna attributes to an existing database.
3. Row-Level Security (RLS) policies are pre-configured to ensure published plants and community posts are publicly readable while personal saved herbs remain protected.

---

## 📜 Dataset License & Academic Citation

Herbora proudly integrates the **Amidha Ayurveda Herb Database v2.0** created by **Sparsh Varshney** (Uttarakhand Ayurved University / Amidha Ayurveda). The dataset is licensed under the **Creative Commons Attribution 4.0 International License (CC BY 4.0)**.

### Academic Citation
```bibtex
@dataset{varshney_2026_amidha,
  author       = {Varshney, Sparsh},
  title        = {Amidha Ayurveda Herb Database v2.0: An open-source, citable dataset of Ayurvedic medicinal plants},
  year         = {2026},
  publisher    = {Zenodo},
  doi          = {10.5281/zenodo.17475351},
  url          = {https://doi.org/10.5281/zenodo.17475351}
}
```

* **Dataset Source Repository**: [sciencewithsaucee-sudo/herb-database](https://github.com/sciencewithsaucee-sudo/herb-database)
* **Dataset Monograph Portal**: [https://www.amidhaayurveda.com/p/herb-database.html](https://www.amidhaayurveda.com/p/herb-database.html)
* **Creative Commons License**: [CC BY 4.0 Details](https://creativecommons.org/licenses/by/4.0/)

---

## ⚖️ Educational & Health Disclaimer

> **IMPORTANT DISCLAIMER**: Herbora is strictly an academic, educational, and botanical reference platform. Traditional Ayurvedic classifications, pharmacological qualities (*Rasa, Guna, Virya, Vipaka, Prabhava*), and folk herbal remedies presented in this application are compiled for historical, scientific, and cultural learning. They do not constitute licensed medical advice, diagnosis, prescription, or clinical treatment plans. Potent herbs interact with prescription medications, blood pressure, endocrine function, and pregnancy. Always consult a qualified Ayurvedic physician (*Vaidya*) or licensed healthcare provider before initiating any herbal therapy.

---

## 👥 Authors & Acknowledgments

* **Herbora Platform**: Full-stack Ayurvedic discovery web application.
* **Botanical Dataset**: *Amidha Ayurveda Herb Database v2.0* by **Sparsh Varshney** (Uttarakhand Ayurved University).
* **Botanical Reference Databases**: *Charaka Samhita*, *Bhavaprakasha Nighantu*, Kew Royal Botanic Gardens (*Plants of the World Online*), WHO Monographs on Selected Medicinal Plants.
