# Herbora — Ancient Wisdom • Modern Discovery

An Ayurveda-focused digital platform for discovering, learning about, and identifying medicinal plants.

---

## 🌿 Project Architecture

Organized according to clean full-stack college project guidelines:

```
herbaura/
│
├── frontend/                     # React 19 + Vite + Tailwind CSS + Lucide Icons + Supabase Auth
│   ├── public/
│   │   └── assets/               # Botanical imagery & official logo
│   │       ├── herbora-logo.png      # Official Herbora brand crest
│   │       ├── herbora-hero.jpg      # Ayurvedic stone mortar & pestle still life
│   │       ├── herbal-wellness.jpg   # Card 1 photo
│   │       ├── daily-wellness.jpg    # Card 2 photo
│   │       ├── herbal-tips.jpg       # Card 3 photo
│   │       ├── herbora-bot.png       # Floating botanical assistant avatar
│   │       ├── tulsi.jpg             # Dedicated Tulsi botanical photo
│   │       ├── ashwagandha.jpg       # Dedicated Ashwagandha botanical photo
│   │       ├── neem.jpg              # Dedicated Neem botanical photo
│   │       ├── turmeric.jpg          # Dedicated Turmeric botanical photo
│   │       ├── aloe-vera.jpg         # Dedicated Aloe Vera botanical photo
│   │       └── brahmi.jpg            # Dedicated Brahmi botanical photo
│   ├── src/
│   │   ├── components/           # Header, HeroSection, FeatureCards, Drawer, Modals, Chatbot
│   │   ├── pages/                # Plantopedia, My Plant DB, Identify, Dincharya, Remedies, Quiz, etc.
│   │   ├── services/             # Supabase Auth client & Flask REST API fetch() helpers
│   │   ├── App.jsx               # Central router & state manager
│   │   └── index.css             # Design tokens (#F8F5EA cream, #174B2B deep green)
│   └── package.json
│
├── backend/                      # Python Flask REST API + SQLAlchemy Database
│   ├── app.py                    # Flask app factory, CORS, database seeding
│   ├── models.py                 # SQLAlchemy models (Plants, Saved, Identifications, Posts)
│   ├── routes.py                 # REST API endpoints (/api/plants, /api/identify, /api/chat, etc.)
│   ├── services/
│   │   └── plant_identifier.py   # AI botanical heuristic image analyzer
│   ├── requirements.txt
│   └── .env
│
└── database/
    └── schema.sql                # Supabase PostgreSQL schema with RLS & seed data
```

---

## 🎨 Visual Design & UI/UX

- **Brand Logo**: Official Herbora circular crest featuring a green mortar and pestle with leaves, serif wordmark *Herbora*, and tagline *"ANCIENT WISDOM • MODERN DISCOVERY"*.
- **Color Palette**:
  - Background: Warm ivory / soft cream (`#F8F5EA`)
  - Deep Forest Green: `#174B2B`
  - Mid Forest Green: `#285D36`
  - Sage Green: `#8DA56B`
  - Light Sage: `#DDE5C9`
  - Subtle Border: `#D9D6C9`
- **Typography**:
  - Headings: *Cormorant Garamond* (refined serif)
  - UI, body, & search: *DM Sans* (clean modern sans-serif)
- **Top Brand Header**: Centered `herbora.com` with the twin-leaf sprout emblem.
- **Navigation Row**: Responsive hamburger drawer, wide search bar (`Search herbs, remedies, wellness...`), camera trigger for identification, and user profile button.
- **Hero Section**:
  > *“Herbora – because every herb has a purpose and every learner has a journey.”*
  Flanked by the sage green quotation mark, leaf flourish divider, and Ayurvedic still life.
- **3 Feature Cards**:
  1. **Herbal Wellness** (`Explore Herbs →`) -> Plantopedia
  2. **Daily Wellness** (`Read More →`) -> Daily Wellness (Dincharya)
  3. **Herbal Wellness Tips** (`Explore Tips →`) -> Remedies & Myths
- **Floating Botanical Assistant**: Friendly green robot head button in bottom-right corner opening the interactive AI assistant.

---

## 🚀 How to Run Locally

### 1. Backend (Flask REST API)
```powershell
cd backend
pip install -r requirements.txt
python app.py
```
- Server starts on `http://127.0.0.1:5000`
- Automatically initializes SQLite database `herbora.db` and seeds initial plants.
- To connect directly to Supabase PostgreSQL, set `DATABASE_URL` in `backend/.env`.

### 2. Frontend (React + Vite)
```powershell
cd frontend
npm install
npm run dev
```
- Application opens on `http://localhost:5173` (or `http://localhost:5174`)
- Communicates with Flask via the Vite proxy (`/api` -> `http://127.0.0.1:5000`).

---

## 📋 Features Overview

1. **Plantopedia**: Full botanical library with search by common/scientific/Ayurvedic name, category filtering (Immunity, Adaptogens, Skin Care, Stress Relief, Heart Health, Digestion, Diabetes), and detailed modal information sheets with safety warnings and scientific citations.
2. **My Plant DB**: User's personal collection protected by Supabase Authentication. Allows bookmarking and removing plants.
3. **AI Plant Identification**: Visual image recognition via file upload, drag & drop, device camera, or sample test herbs. Predicts plant identity with confidence score, botanical traits, and links to Plantopedia.
4. **Daily Wellness (Dincharya)**: Circadian routine timeline from morning *Brahma Muhurta* to evening restorative wind-down.
5. **Practical Home Remedies**: Authentic kitchen apothecary recipes (Golden Turmeric milk, Honey-Tulsi tea, Agni-kindling Ginger, Rose-Fennel cooler).
6. **Myths vs. Facts**: 3D interactive flip cards clarifying common misconceptions about herbal medicine.
7. **Home Garden Planner**: Care guides for household herbs (Tulsi, Mint, Aloe Vera, Brahmi) with sunlight, watering parameters, and interactive watering checklist.
8. **Ayurvedic Quiz**: 5-question knowledge test with instant feedback and score evaluation.
9. **Community Stories**: Balcony grower notes feed and submission form.
10. **Botanical AI Assistant**: Floating chatbot with quick prompts and Ayurvedic guidance.

---

## ⚖️ Educational & Health Disclaimer

Herbora is an educational and academic digital platform for botanical discovery. Traditional Ayurvedic uses and herbal properties presented on this website are for historical and informational purposes only. They do not constitute medical diagnoses, prescriptions, or clinical treatment plans. Always consult a licensed healthcare practitioner or qualified Ayurvedic doctor before therapeutic use.
