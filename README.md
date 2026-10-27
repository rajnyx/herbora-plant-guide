# 🌿 Herbora — Ancient Wisdom • Modern Discovery

An enterprise-grade, open-source Ayurvedic discovery platform bridging millennia-old traditional botanical medicine (*Dravyaguna Vijnana*) with modern web discovery, computational taxonomy, computer vision plant identification, and circadian wellness science.

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel%20Serverless%20%26%20Edge-black?logo=vercel&logoColor=white)](https://vercel.com/)
[![License: CC BY 4.0](https://img.shields.io/badge/Dataset_License-CC_BY_4.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![DOI](https://img.shields.io/badge/DOI-10.5281%2Fzenodo.17475351-blue)](https://doi.org/10.5281/zenodo.17475351)

---

## 📑 Table of Contents

- [The Problem Statement (PS)](#-the-problem-statement-ps)
  - [1. Fragmentation of Classical Knowledge](#1-fragmentation-of-classical-knowledge)
  - [2. The Modern Misinformation & Misapplication Crisis](#2-the-modern-misinformation--misapplication-crisis)
  - [3. The Taxonomical Disconnect](#3-the-taxonomical-disconnect)
  - [4. The Accessibility & Identification Barrier](#4-the-accessibility--identification-barrier)
- [The Objective](#-the-objective)
- [The Solution: Herbora](#-the-solution-herbora)
  - [Architectural Overview](#architectural-overview)
  - [Dual-Lens Botanical Taxonomy](#dual-lens-botanical-taxonomy)
- [Comprehensive Feature Suite](#-comprehensive-feature-suite)
  - [1. Plantopedia (361-Herb Monograph Library)](#1-plantopedia-361-herb-monograph-library)
  - [2. AI Botanical Vision & Identification Suite](#2-ai-botanical-vision--identification-suite)
  - [3. Daily Wellness (Dincharya Circadian Routine)](#3-daily-wellness-dincharya-circadian-routine)
  - [4. Classical Remedies & 3D Myths vs. Facts](#4-classical-remedies--3d-myths-vs-facts)
  - [5. Balcony Garden Planner & Care Checklist](#5-balcony-garden-planner--care-checklist)
  - [6. Interactive Ayurvedic Knowledge Quiz](#6-interactive-ayurvedic-knowledge-quiz)
  - [7. My Plant DB (Personal Herbarium)](#7-my-plant-db-personal-herbarium)
  - [8. Botanical AI Chat Assistant](#8-botanical-ai-chat-assistant)
  - [9. Balcony Grower Community Feed](#9-balcony-grower-community-feed)
  - [10. Direct Feedback Dispatch System](#10-direct-feedback-dispatch-system)
  - [11. Instant English / Hindi Bilingual Localization](#11-instant-english--hindi-bilingual-localization)
- [Botanical Database & Classical Pharmacology Schema](#-botanical-database--classical-pharmacology-schema)
  - [Database Breakdown](#database-breakdown)
  - [Dravyaguna Vijnana Classical Attributes](#dravyaguna-vijnana-classical-attributes)
  - [Idempotent Ingestion Pipeline](#idempotent-ingestion-pipeline)
- [Project Directory Structure](#-project-directory-structure)
- [Visual Identity & Design System](#-visual-identity--design-system)
- [REST API Reference](#-rest-api-reference)
- [Local Installation & Development Guide](#-local-installation--development-guide)
  - [Prerequisites](#prerequisites)
  - [Option A: One-Click Startup (Windows)](#option-a-one-click-startup-windows)
  - [Option B: Manual Step-by-Step Setup](#option-b-manual-step-by-step-setup)
- [Automated Testing Suite](#-automated-testing-suite)
- [Cloud Deployment & Production Architecture](#-cloud-deployment--production-architecture)
- [Academic Citation & Dataset Licensing](#-academic-citation--dataset-licensing)
- [Medical & Safety Disclaimer](#-medical--safety-disclaimer)
- [Author & Maintenance](#-author--maintenance)

---

## 🎯 The Problem Statement (PS)

Traditional medicine, particularly Ayurveda (*The Science of Longevity*), represents over 5,000 years of clinical observation, pharmacology, and botanical research. However, modern society faces four critical bottlenecks that hinder its safe and effective adoption:

### 1. Fragmentation of Classical Knowledge
Centuries of verified botanical treatises—such as the *Charaka Samhita*, *Sushruta Samhita*, *Ashtanga Hridaya*, and medieval *Nighantus* (*Bhavaprakasha*, *Raj Nighantu*, *Kaiyadeva Nighantu*)—are locked behind dense classical Sanskrit verses, archived palm-leaf manuscripts, or paywalled academic journals. Everyday consumers, wellness enthusiasts, and researchers cannot readily look up verified properties without encountering fragmented or contradictory interpretations.

### 2. The Modern Misinformation & Misapplication Crisis
Social media trends and commercialized herbal marketing frequently promote dangerous simplifications:
- **Raw Curcumin Ingestion**: Millions consume dry turmeric powder with water, unaware that without black pepper (*piperine*) and healthy fats (*ghee/milk*), curcumin bioavailability is under 1% and excessive dry powder can aggravate *Pitta* and irritate mucosal linings.
- **Constitutional Neglect**: Herbs are not "one size fits all." A heating herb like *Ashwagandha* can aggravate high *Pitta* conditions; excessive bitter *Neem* provokes *Vata*; heavy *Chyawanprash* in high summer creates digestive sluggishness. Without understanding individual *Prakriti* (constitution) and *Ritu Sandhi* (seasonal transitions), herbs can cause unintended adverse reactions.

### 3. The Taxonomical Disconnect
Western Linnaean taxonomy classifies plants purely through genetic, floral, and morphological structures (*Kingdom, Family, Genus, Species*). While scientifically essential, morphology does not describe functional physiological action in living systems:
- It fails to capture taste (*Rasa*), physical qualities (*Guna*), post-digestive bio-transformation (*Vipaka*), thermal potency (*Virya*), or unique non-linear medicinal actions (*Prabhava*).
- Modern botanical software lacks a bridge between standard Linnaean binomials and multi-dimensional Ayurvedic pharmacology.

### 4. The Accessibility & Identification Barrier
When someone spots a medicinal herb on a hike, in a community park, or on their balcony, they have no intuitive way to:
- Instantly identify the plant using computational vision.
- Map the botanical identification directly to verified Ayurvedic monographs, safe dosages, home remedies, and cultivation instructions.
- Save bookmarks into an authenticated personal herbarium accessible across devices.

---

## 💡 The Objective

To build an intuitive, scientifically rigorous, and aesthetic full-stack digital herbarium that:
1. **Democratizes 361 Verified Ayurvedic Plant Monographs** sourced from classical literature and citable open datasets.
2. **Harmonizes Modern Taxonomy with Classical Pharmacology** (*Dravyaguna Vijnana*), indexing *Rasa, Guna, Virya, Vipaka, Prabhava*, and *Dosha Karma*.
3. **Equips Users with Computer Vision Plant Identification**, multi-modal image matching, and taxonomical synonym resolution.
4. **Debunks Commercial Myths** through interactive 3D comparative evidence cards and provides verified kitchen remedies.
5. **Guides Circadian Living** (*Dincharya*) aligned with 24-hour doshic biological clocks.
6. **Fosters Urban Herbalism** through balcony gardening guides, an interactive quiz, an AI assistant, and a grower community.
7. **Maintains Zero-Barrier Accessibility** with instantaneous English $\leftrightarrow$ Hindi bilingual localization and resilient offline fallbacks.

---

## 🌿 The Solution: Herbora

**Herbora** (*Ancient Wisdom • Modern Discovery*) is an integrated digital platform that connects ancestral Ayurvedic wisdom with modern web architectures.

```mermaid
graph TD
    User([User / Botanical Explorer]) -->|HTTP / HTTPS| WebClient[React 19 + Vite + Tailwind v4 Client]
    
    subgraph Frontend Portals
        WebClient --> Plantopedia[Plantopedia: 361 Monographs]
        WebClient --> AIIdentify[AI Botanical Vision Suite]
        WebClient --> Dincharya[Circadian Timeline]
        WebClient --> Remedies[Apothecary & 3D Myths]
        WebClient --> Garden[Balcony Garden Planner]
        WebClient --> Quiz[Dynamic Ayurvedic Quiz]
        WebClient --> MyPlantDB[Personal Herbarium]
        WebClient --> Community[Balcony Grower Community]
        WebClient --> ChatBot[Botanical AI Assistant]
    end

    subgraph Service & API Gateway
        WebClient -->|Direct REST / Proxy| EdgeProxy[Vercel Edge / Vite Proxy / Forwarder 5174]
        EdgeProxy --> FlaskAPI[Flask REST API Server :5000]
        WebClient -->|Direct SDK| SupabaseAuth[Supabase Auth Engine]
    end

    subgraph Backend Intelligence & Storage
        FlaskAPI --> ModelEngine[SQLAlchemy ORM + Dravyaguna Schema]
        FlaskAPI --> VisionService[Botanical Vision Engine & Pl@ntNet Bridge]
        FlaskAPI --> MailService[Feedback Dispatch to Team Herbora]
        ModelEngine --> Database[(PostgreSQL on Supabase / SQLite Local)]
        FlaskAPI --> IngestionPipeline[Idempotent Amidha Dataset Importer]
        IngestionPipeline --> HerbJson[(360 Amidha v2.0 Dataset)]
    end
```

### Dual-Lens Botanical Taxonomy
Herbora's core innovation is its **Dual-Lens Taxonomic Engine**:
1. **Scientific Lens**: Genus, species, Linnaean family, vernacular synonyms, verified high-resolution Wikimedia Commons and studio photography, and DOI citations.
2. **Ayurvedic Lens**: *Ṣaḍ Rasa* (6 tastes), *Gurvādi Guṇa* (20 qualities), *Vīrya* (thermal potency), *Vipāka* (post-digestive effect), *Prabhāva* (specific actions), and *Doṣa Karma* (Vata, Pitta, Kapha pacification/aggravation).

---

## 🚀 Comprehensive Feature Suite

### 1. Plantopedia (361-Herb Monograph Library)
- **Comprehensive Catalog**: 361 unique medicinal plants—12 deeply curated cornerstone herbs with bespoke studio photography, plus 349 standardized monographs from the Amidha dataset.
- **Multi-Field Real-Time Search**: Instantaneous search across English names, botanical binomials, Sanskrit names, parts used, tastes (*Rasa*), potency (*Virya*), and clinical disease indications (*Roga / Vyādhi*).
- **10 Therapeutic Category Filters**:
  - 🛡️ *Immunity & Vitality*
  - 🌿 *Adaptogens & Rejuvenation (Rasayana)*
  - ✨ *Skin & Complexion (Tvachya/Varnya)*
  - 🧠 *Stress Relief & Nootropics (Medhya)*
  - 🫀 *Heart Health & Circulation (Hridya)*
  - 🍵 *Diet, Agni & Digestion (Deepana/Pachana)*
  - 🩺 *Metabolism & Blood Sugar (Prameha)*
  - 🫁 *Respiratory & Lung Support (Kasahara/Shwasa)*
  - 🦴 *Joint Care & Mobility (Sandhi/Shothahara)*
  - 🌸 *Vitality & Hormonal Balance*
- **Interactive Plant Detail Modal**:
  - High-res photography with verified Wikimedia fallback resolvers.
  - 4-Cell Dravyaguna Matrix: *Rasa, Guna, Virya, Vipaka*.
  - Dosha Karma Pills: Tridosha balancer, pacifies, or aggravates.
  - Classical Indications (*Roga*), Therapeutic Actions (*Prabhava*), and Medicinal Parts Used (*Prayojyanga*).
  - Wild habitat mapping, micro-climate cultivation guides, and pharmaceutical contraindications.
  - Direct citable links to Amidha Ayurveda monographs and Zenodo DOIs.

### 2. AI Botanical Vision & Identification Suite
- **Multi-Modal Image Capture**:
  - Drag-and-drop or file selector for device photographs.
  - Live device camera capture for field identification.
  - Pre-loaded interactive herbarium gallery for testing and learning.
- **Zero-CORS Edge/Node API Architecture**: Proxies raw multipart image buffers securely through Vercel Edge functions and Node.js middlewares directly to the Pl@ntNet API without client-side CORS hurdles.
- **Botanical Synonym Resolution**: Built-in 30+ taxonomical mapping dictionary (e.g., *Ocimum tenuiflorum* $\leftrightarrow$ *Ocimum sanctum* $\rightarrow$ **Tulsi**; *Curcuma domestica* $\leftrightarrow$ *Curcuma longa* $\rightarrow$ **Turmeric**; *Emblica officinalis* $\leftrightarrow$ *Phyllanthus emblica* $\rightarrow$ **Amla**).
- **Graceful Heuristic Fallback**: Includes a standalone visual signature analyzer that evaluates image descriptors and matches against known Ayurvedic profiles even when completely offline.

### 3. Daily Wellness (*Dincharya* Circadian Routine)
- **Synchronized 24-Hour Circadian Timeline**: Aligns daily biological routines with traditional Ayurvedic doshic peaks:
  - 🌅 **5:00 – 7:00 AM (Brahma Muhurta & Awakening)**: Early waking, *Ushapan* (warm/copper-infused water), tongue scraping (*Jihwa Nirlekhana*), and astringent herbal oral care.
  - 🧘 **7:00 – 10:00 AM (Movement & Kapha Hour)**: *Abhyanga* (warm sesame oil self-massage), *Pranayama*, *Surya Namaskar*, and light seasonal breakfast.
  - 🍲 **12:00 – 2:00 PM (Midday Pitta Peak)**: Principal and largest nutrient-dense meal of the day when digestive fire (*Agni*) is at its solar zenith.
  - 🌙 **7:00 – 10:00 PM (Wind Down & Kapha Transition)**: Light supper 3 hours before sleep, warm Golden Turmeric Milk with nutmeg, screen sunset, and restorative sleep (*Nidra*).

### 4. Classical Remedies & 3D Myths vs. Facts
- **Classical Kitchen Apothecary**:
  - *Golden Turmeric Elixir* (Turmeric + black pepper piperine + ghee/milk carrier).
  - *Honey & Holy Basil Infusion* (Fresh Tulsi tea steeped and cooled to lukewarm before raw honey).
  - *Agni Kindling Ginger Tonic* (Fresh ginger + rock salt + lime juice).
  - *Rose & Fennel Cooling Tonic* (Pitta-soothing summer infusion).
- **Interactive 3D Flip Cards (Myths vs. Facts)**:
  - 12 interactive 3D flip cards addressing widespread commercial myths (e.g., dry turmeric bioavailability, unmonitored raw fasting, summer Chyawanprash consumption, onset speeds, and personal constitution requirements).

### 5. Balcony Garden Planner & Care Checklist
- **Balcony Herbalist Guides**: Practical urban gardening profiles for domestic medicinal herbs:
  - *Tulsi (Holy Basil)*: 4–6 hrs direct sunlight, watering every 2 days, flower pinching techniques.
  - *Spearmint & Pudina*: Partial shade, moisture-retentive soil, root-containment tips.
  - *Aloe Vera (Kumari)*: Bright indirect light, deep soaking every 7–10 days, basal leaf harvesting.
  - *Brahmi (Water Hyssop)*: Damp bog conditions, shallow terracotta dishes, morning sunlight.
- **Interactive Watering Checklist**: Live checklist with state preservation to track household watering routines.

### 6. Interactive Ayurvedic Knowledge Quiz
- **Dynamic 5-Question Shuffling**: Dynamically samples 5 randomized questions from an extensive 20-question classical question pool.
- **Repeat-Prevention Memory**: Smart `excludeIds` algorithm ensures that refreshing the quiz serves fresh, unseen questions.
- **Bilingual Question & Answer Engine**: Every question, option, and educational explanation is translated into Hindi and English.
- **Live Scoring & Percentage Certificates**: Instant visual feedback (green/red validation) with post-quiz evaluation cards.

### 7. My Plant DB (Personal Herbarium)
- **Hybrid Authentication Engine**:
  - **Primary**: Supabase Auth (Email + Password) with automatic session persistence, JWT refreshes, and RPC email-verification diagnostics.
  - **Resilient Fallback**: Local user state fallback to ensure bookmarking and exploration remain functional even if network requests to remote auth services are delayed.
- **Curated Herbarium**: Bookmark any plant from cards or modals with single-click bookmark toggles, persistent database synchronization, and deletion controls.

### 8. Botanical AI Chat Assistant
- **Floating Corner Widget**: Instant botanical helper available across all pages.
- **Natural Language Intent Recognition**: Answers queries regarding cough/cold remedies, sleep, skin care, digestive bloating, memory enhancers (*Medhya Rasayanas*), and balcony plant care.

### 9. Balcony Grower Community Feed
- **Collaborative Urban Herbarium**: Community forum where urban herbalists and gardeners share seed germination logs, balcony soil formulas, and herbal tea recipes.
- **Interactive Post Creator**: Users can post herbal updates, select plant tags, like posts in real time, and contribute comments.

### 10. Direct Feedback Dispatch System
- **Built-In Feedback Modal**: Users can rate their experience (1–5 stars) and submit detailed reviews.
- **Direct Dispatch**: Automatically delivers feedback to **Team Herbora** via the backend notification dispatcher and provides a pre-populated action for immediate delivery.

### 11. Instant English / Hindi Bilingual Localization
- **Single-Click Global Switcher**: Persistent language context toggles the entire UI between English and Hindi (`हिन्दी`).
- **Deep Translation Dictionary**: Covers navigation headers, search placeholders, clinical indications, Dravyaguna properties, remedies, myths, quizzes, and disclaimers.

---

## 🗄️ Botanical Database & Classical Pharmacology Schema

### Database Breakdown

| Classification | Count | Source & Methodology |
|:---|:---:|:---|
| **Curated Cornerstone Herbs** | **12** | Hand-crafted botanical profiles featuring custom high-resolution studio photography (`/assets/*.jpg`), detailed micro-climate cultivation guides, wild habitat mapping, and specific pharmaceutical contraindications (*Tulsi, Ashwagandha, Neem, Brahmi, Turmeric, Aloe Vera, Ginger, Giloy, Amla, Fenugreek, Shatavari, Karela*). |
| **Integrated Dataset Herbs** | **349** | Standardized canonical records integrated directly from the open-source **Amidha Ayurveda Herb Database v2.0** by Sparsh Varshney (Uttarakhand Ayurved University), licensed under **CC BY 4.0**. |
| **Total Botanical Records** | **361** | 100% unique plant taxa indexed with zero duplicates. |

### Dravyaguna Vijnana Classical Attributes

Every plant record in Herbora is modeled with classical Ayurvedic pharmacology:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DRAVYAGUNA PHARMACOLOGY                         │
├────────────────────────────────┬───────────────────────────────────────┤
│ Ṣaḍ Rasa (Six Primary Tastes)  │ Madhura, Amla, Lavana, Katu, Tikta,   │
│                                │ Kashaya                               │
├────────────────────────────────┼───────────────────────────────────────┤
│ Gurvādi Guṇa (20 Qualities)    │ Laghu, Guru, Snigdha, Ruksha, Sheeta, │
│                                │ Ushna, Tikshna, Sara, etc.            │
├────────────────────────────────┼───────────────────────────────────────┤
│ Vīrya (Thermal Potency)        │ Ushna (Heating) or Sheeta (Cooling)   │
├────────────────────────────────┼───────────────────────────────────────┤
│ Vipāka (Post-Digestive Effect) │ Madhura (Nourishing), Amla (Sour),    │
│                                │ Katu (Catabolic)                      │
├────────────────────────────────┼───────────────────────────────────────┤
│ Prabhāva (Unique Action)       │ Rasayana, Medhya, Hridya, Dipana,     │
│                                │ Pachana, Krmighna, Balya, etc.        │
├────────────────────────────────┼───────────────────────────────────────┤
│ Doṣa Karma (Constitutional)    │ Pacifies, Aggravates, Tridoshahara    │
├────────────────────────────────┼───────────────────────────────────────┤
│ Prayojyāṅga (Parts Used)       │ Patra (Leaves), Mula (Roots), Phala   │
│                                │ (Fruit), Kanda (Rhizome), Tvak (Bark) │
├────────────────────────────────┼───────────────────────────────────────┤
│ Roga / Vyādhi (Indications)    │ Kasa, Shwasa, Jwara, Prameha, Kushta, │
│                                │ Pandu, Raktapitta                     │
├────────────────────────────────┼───────────────────────────────────────┤
│ Nāma & Paryāya (Synonyms)      │ Classical Sanskrit synonyms from      │
│                                │ Bhavaprakasha & Raj Nighantu          │
└────────────────────────────────┴───────────────────────────────────────┘
```

### Idempotent Ingestion Pipeline

The dataset ingestion pipeline ([backend/import_dataset.py](file:///c:/Users/rajsi/OneDrive/Desktop/Documents/raj/Herbora-workspace/herbaura/backend/import_dataset.py)) guarantees zero degradation of existing records:
1. **Normalized Binomial Matching**: Matches existing records via normalized scientific binomials, known botanical synonyms (*Aloe vera* $\leftrightarrow$ *Aloe barbadensis*, *Emblica officinalis* $\leftrightarrow$ *Phyllanthus emblica*), and Sanskrit names.
2. **Protected Rich Metadata**: Retains hand-crafted studio photography, tailored cultivation tips, and custom safety warnings for the 12 cornerstone herbs.
3. **Automated High-Resolution Image Resolver**: Automatically updates Wikimedia thumbnail URLs to high-res upload endpoints.
4. **Standalone or Integrated Execution**:
   ```powershell
   cd backend
   python import_dataset.py
   ```

---

## 📂 Project Directory Structure

```
herbaura/
│
├── frontend/                               # React 19 + Vite 8 + Tailwind CSS v4 Client
│   ├── public/
│   │   ├── assets/                         # Studio plant photos, emblems, and icons
│   │   │   ├── herbora-logo.png            # Official Herbora brand seal
│   │   │   ├── herbora-hero.jpg            # Botanical still life hero banner
│   │   │   ├── tulsi.jpg                   # Dedicated Tulsi photography
│   │   │   ├── ashwagandha.jpg             # Dedicated Ashwagandha photography
│   │   │   ├── neem.jpg                    # Dedicated Neem photography
│   │   │   ├── turmeric.jpg                # Dedicated Turmeric photography
│   │   │   ├── aloe-vera.jpg               # Dedicated Aloe Vera photography
│   │   │   ├── brahmi.jpg                  # Dedicated Brahmi photography
│   │   │   ├── amla.jpg                    # Dedicated Amla photography
│   │   │   ├── fenugreek.jpg               # Dedicated Fenugreek photography
│   │   │   ├── shatavari.jpg               # Dedicated Shatavari photography
│   │   │   └── karela.jpg                  # Dedicated Bitter Melon photography
│   │   ├── favicon.svg
│   │   └── robots.txt
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx                  # Top navigation, search bar, language & auth toggles
│   │   │   ├── HeroSection.jsx             # Serif hero section with classical botanical styling
│   │   │   ├── FeatureCards.jsx            # Quick entry portals to core features
│   │   │   ├── NavigationDrawer.jsx        # Mobile slide-over navigation
│   │   │   ├── PlantDetailModal.jsx        # Complete Dravyaguna & clinical detail modal
│   │   │   ├── ChatAssistant.jsx           # Floating botanical assistant bot
│   │   │   ├── AuthModal.jsx               # Supabase + local hybrid authentication modal
│   │   │   ├── ProfileModal.jsx            # User profile & saved collections manager
│   │   │   ├── LanguageSelector.jsx        # English / Hindi language selector
│   │   │   └── HerboraEmblem.jsx           # Vector emblem badge component
│   │   ├── pages/
│   │   │   ├── PlantopediaPage.jsx         # 361-herb library with multi-field search & filters
│   │   │   ├── MyPlantDBPage.jsx           # Personal saved plant collection
│   │   │   ├── IdentifyPlantPage.jsx       # Multi-modal AI botanical vision identification suite
│   │   │   ├── DailyWellnessPage.jsx       # 24-hour Dincharya circadian timeline
│   │   │   ├── WellnessTipsPage.jsx        # Kitchen remedies & 3D Myths vs. Facts
│   │   │   ├── GardenPlannerPage.jsx       # Urban herb care guide & watering checklist
│   │   │   ├── QuizPage.jsx                # Dynamic randomized 5-question Ayurvedic test
│   │   │   ├── CommunityPage.jsx           # Balcony grower notes feed & post creator
│   │   │   └── AboutPage.jsx               # Academic vision, direct feedback form, & disclaimer
│   │   ├── context/
│   │   │   ├── LanguageContext.jsx         # Bilingual localization provider
│   │   │   └── translations.js             # English & Hindi translation dictionaries
│   │   ├── services/
│   │   │   └── api.js                      # Resilient REST API client & offline fallbacks
│   │   ├── data/
│   │   │   └── plant_images.json           # Curated botanical image mapping dictionary
│   │   ├── App.jsx                         # Central router & state manager
│   │   ├── index.css                       # Design tokens, color palette, & typography
│   │   └── main.jsx                        # React 19 application entry point
│   ├── package.json                        # Frontend dependencies & build scripts
│   ├── vite.config.js                      # Vite 8 config, Tailwind v4 plugin, & API dev proxy
│   └── vercel.json                         # Vercel SPA rewrite rules
│
├── backend/                                # Python Flask REST API
│   ├── app.py                              # Flask application factory, CORS, & seeding
│   ├── models.py                           # SQLAlchemy models with Dravyaguna schema
│   ├── routes.py                           # REST API endpoints (/api/plants, /api/identify, etc.)
│   ├── import_dataset.py                   # Repeatable, idempotent 360-herb importer
│   ├── fetch_all_360_images.py             # High-resolution image resolver script
│   ├── sync_database_images.py             # Database image sync utility
│   ├── herbora.db                          # Active SQLite database (361 records)
│   ├── herbora.db.bak                      # Initial database backup snapshot
│   ├── services/
│   │   ├── plant_identifier.py             # Botanical vision analyzer & synonym dictionary
│   │   └── email_service.py                # Feedback dispatcher to Team Herbora
│   ├── tests/
│   │   └── test_dataset_integration.py     # 10 automated unit & integration tests
│   ├── requirements.txt                    # Python backend dependencies
│   ├── pyproject.toml                      # Python build configuration
│   ├── wsgi.py                             # WSGI production entrypoint
│   └── .env                                # Local environment configuration
│
├── api/                                    # Vercel Serverless & Edge API Handlers
│   ├── health.js                           # Serverless health endpoint
│   └── identify.js                         # Edge function for botanical identification & Pl@ntNet
│
├── database/                               # Database Schemas & Migrations
│   ├── schema.sql                          # Production Supabase PostgreSQL schema with RLS
│   ├── migration_amidha_properties.sql     # Idempotent migration script for Supabase
│   ├── migration_check_user_email.sql      # RPC email diagnostic function
│   └── data/
│       ├── herb.json                       # 360 Amidha Ayurveda records (CC BY 4.0)
│       └── plant_images.json               # Image mapping dictionary
│
├── start-herbora.bat                       # One-click dual-server Windows launcher
└── README.md                               # Primary documentation (GitHub Repository Root)
```

---

## 🎨 Visual Identity & Design System

Herbora's visual identity reflects the tranquility of ancient Ayurvedic herbal sanctuaries balanced with contemporary editorial design:

- **Color Palette**:
  - **Ivory Cream (Canvas)**: `#F8F5EA` / `#FAF8F2` — Warm, parchment-like canvas inspired by ancient palm-leaf manuscripts (*Talapatra*).
  - **Deep Forest Green (Primary)**: `#113E21` / `#174B2B` — Deep sacred grove and canopy tones.
  - **Mid Forest Green**: `#285D36`
  - **Sage Green (Accents & Badges)**: `#8DA56B` / `#E2ECD5` — Fresh medicinal leaf shoots.
  - **Parchment Borders**: `#DDD6C3` / `#D9D6C9` — Subtle, organic dividing lines.
- **Typography**:
  - **Headings & Titles**: *Cormorant Garamond* (stately classical serif).
  - **Body, UI, & Search**: *DM Sans* (clean, legible contemporary sans-serif).
- **Design Touches**:
  - Tactile 3D card flips with CSS `perspective: 1000px`.
  - Subtle frosted glassmorphic navigation bars (`backdrop-blur-md`).
  - Graceful rise micro-animations (`.herbora-rise`).

---

## 📡 REST API Reference

The Flask backend provides clean REST endpoints under `/api`:

| Method | Endpoint | Parameters / Body | Description |
|:---|:---|:---|:---|
| `GET` | `/api/health` | None | Service status, connected database dialect, and botanical signature count |
| `GET` | `/api/health/db` | None | Detailed database connectivity diagnostics |
| `GET` | `/api/plants` | `?category=...&q=...` | Complete list of published botanical monographs with optional category and search filters |
| `GET` | `/api/plants/<slug_or_id>` | None | Detailed single-plant monograph including Dravyaguna attributes, uses, and citations |
| `GET` | `/api/plants/search` | `?q=...` | Multi-field search across English, scientific, Ayurvedic names, virya, and vipaka |
| `POST` | `/api/identify` | Multipart `image` file | Identifies botanical images using Pl@ntNet or heuristic visual signatures |
| `POST` | `/api/chat` | JSON `{ "message": "..." }` | Botanical AI Assistant responding to queries on remedies, doshas, and sleep |
| `GET` | `/api/dincharya` | None | 24-Hour circadian routine timeline data |
| `GET` | `/api/remedies` | None | Classical kitchen apothecary remedy formulas |
| `GET` | `/api/myths` | None | 12 Myths vs. Facts data for 3D flip cards |
| `GET` | `/api/quiz` | None | Complete pool of randomized Ayurvedic quiz questions |
| `GET` | `/api/garden-plants` | None | Domestic herbal gardening profiles and care tips |
| `GET` | `/api/user/saved-plants` | Header `X-User-Id` | Retrieves authenticated user's bookmarked plant collection |
| `POST` | `/api/user/saved-plants` | Header `X-User-Id`, `{ "plant_id": "..." }` | Adds a plant monograph to the user's personal collection |
| `DELETE` | `/api/user/saved-plants/<plant_id>` | Header `X-User-Id` | Removes a plant monograph from the user's personal collection |
| `GET` | `/api/community/posts` | None | Retrieves community grower feed posts with likes and comment counts |
| `POST` | `/api/community/posts` | JSON `{ "author_name", "plant_name", "note" }` | Publishes a new grower note to the community feed |
| `POST` | `/api/community/posts/<post_id>/like`| None | Increments like counter for a community post |
| `POST` | `/api/feedback` | JSON `{ "rating", "message", "name", "email" }` | Dispatches feedback directly to Team Herbora |

---

## 💻 Local Installation & Development Guide

### Prerequisites
- **Node.js**: v18.0 or newer (v24.x recommended)
- **Python**: v3.10 or newer (v3.12 / v3.14 tested)
- **Git**

### Option A: One-Click Startup (Windows)
Double-click [start-herbora.bat](file:///c:/Users/rajsi/OneDrive/Desktop/Documents/raj/Herbora-workspace/herbaura/start-herbora.bat) in the project directory. It automatically:
1. Starts the Python Flask backend on `http://127.0.0.1:5000`.
2. Starts the Vite React frontend on `http://localhost:5173`.
3. Starts the port forwarder bridge on `http://localhost:5174`.

---

### Option B: Manual Step-by-Step Setup

#### 1. Backend Setup (Flask + SQLAlchemy)
```powershell
# Navigate to the backend directory
cd backend

# Create and activate a Python virtual environment
python -m venv venv
.\venv\Scripts\activate   # On Linux/macOS: source venv/bin/activate

# Install required packages
pip install -r requirements.txt

# Start the Flask API server
python app.py
```
* Backend API starts on: **`http://127.0.0.1:5000`**
* Health check: **`http://127.0.0.1:5000/api/health`**
* SQLite database `herbora.db` is initialized and automatically seeded with all 361 botanical monographs on first boot.

#### 2. Frontend Setup (React 19 + Vite 8 + Tailwind v4)
```powershell
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
* Open your browser at: **`http://localhost:5173`**
* Vite automatically proxies all `/api` calls to `http://127.0.0.1:5000`.

#### 3. (Optional) Run Port Forwarder Bridge
```powershell
cd frontend
node forwarder5174.js
```
* Mirrors requests on **`http://localhost:5174`** to the active Vite and Flask instances.

---

## 🧪 Automated Testing Suite

Herbora includes an automated test suite verifying dataset integration, schema extensions, Dravyaguna attributes, and API functionality:

```powershell
cd backend
python -m unittest tests/test_dataset_integration.py
```

### Verified Test Cases (10 Automated Tests)
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

## ☁️ Cloud Deployment & Production Architecture

### Frontend Deployment (Vercel SPA)
- The frontend is configured for deployment on Vercel with single-page application (SPA) routing in `frontend/vercel.json`:
  ```json
  {
    "$schema": "https://openapi.vercel.sh/vercel.json",
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```
- Build Command: `npm run build`
- Output Directory: `dist`

### Backend Serverless & Edge API
- Production WSGI entry points (`backend/wsgi.py`, `backend/index.py`) provide serverless compatibility.
- Vercel Edge functions in `api/identify.js` deliver zero-cold-start botanical vision identification and proxying.

### Supabase PostgreSQL Configuration
To connect to a managed Supabase database:
1. In `backend/.env`, configure your PostgreSQL connection string:
   ```env
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
2. In the **Supabase SQL Editor**, execute:
   - [database/schema.sql](file:///c:/Users/rajsi/OneDrive/Desktop/Documents/raj/Herbora-workspace/herbaura/database/schema.sql) (Initial table creation and Row-Level Security policies).
   - [database/migration_amidha_properties.sql](file:///c:/Users/rajsi/OneDrive/Desktop/Documents/raj/Herbora-workspace/herbaura/database/migration_amidha_properties.sql) (Dravyaguna schema extensions).
   - [database/migration_check_user_email.sql](file:///c:/Users/rajsi/OneDrive/Desktop/Documents/raj/Herbora-workspace/herbaura/database/migration_check_user_email.sql) (RPC diagnostic functions).

---

## 📜 Academic Citation & Dataset Licensing

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

- **Dataset Source**: [Amidha Ayurveda Monograph Database](https://www.amidhaayurveda.com/p/herb-database.html)
- **Zenodo Archive DOI**: [10.5281/zenodo.17475351](https://doi.org/10.5281/zenodo.17475351)
- **License**: [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)

---

## ⚖️ Medical & Safety Disclaimer

> **IMPORTANT EDUCATIONAL NOTICE**: Herbora is strictly an academic, botanical, and cultural educational reference platform. The classical Ayurvedic classifications, pharmacological qualities (*Rasa, Guna, Virya, Vipaka, Prabhava*), home remedies, and *Dincharya* practices presented in this software are compiled for informational and historical learning. They do **not** constitute licensed medical advice, diagnosis, prescription, or clinical treatment plans. Potent botanicals interact with prescription pharmaceuticals, blood pressure, endocrine function, pregnancy, and lactation. Always consult a qualified Ayurvedic physician (*Vaidya*) or licensed healthcare practitioner before starting any herbal regimen.

---

## 👤 Author & Maintenance

- **Developer & Creator**: Raj Singh
- **Direct Feedback & Inquiries**: Team Herbora ([team@herbora.app](mailto:team@herbora.app))
- **GitHub Repository**: [rajnyx/herbora-plant-guide](https://github.com/rajnyx/herbora-plant-guide)
