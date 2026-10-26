"""
Herbora Backend Application Entry Point
Flask REST API with SQLAlchemy Database & Seeding
"""
import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from models import init_db, SessionLocal, Plant, CommunityPost
from routes import api_bp

def create_app():
    app = Flask(__name__)
    
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "X-User-Id"]
        }
    })

    # Register blueprints
    app.register_blueprint(api_bp)

    # Initialize tables
    init_db()

    # Seed initial plants if empty
    seed_initial_data()

    @app.route('/')
    def root():
        return jsonify({
            "name": "Herbora Ayurvedic API",
            "tagline": "Ancient Wisdom • Modern Discovery",
            "endpoints": "/api/health, /api/plants, /api/identify, /api/chat, /api/dincharya, /api/remedies"
        })

    return app

def seed_initial_data():
    """Seed the database with rich Ayurvedic botanical data if table is empty"""
    db = SessionLocal()
    try:
        count = db.query(Plant).count()
        if count == 0:
            plants_data = [
                {
                    "slug": "tulsi",
                    "common_name": "Holy Basil",
                    "scientific_name": "Ocimum sanctum",
                    "ayurvedic_name": "Tulsi",
                    "regional_names": ["Tulasi", "Sacred Basil", "Manjari"],
                    "category": "Immunity",
                    "description": "Revered as the “Queen of Herbs” and “Mother Medicine of Nature”, Tulsi is an aromatic shrub celebrated for spiritual, environmental, and therapeutic balance.",
                    "traditional_uses": "Daily tea for respiratory clarity, modulating adaptogenic stress responses, and kindling digestion.",
                    "plant_parts_used": "Leaves, flowering tops, and whole herb",
                    "habitat": "Native to the Indian subcontinent; widely grown in courtyards, temples, and balconies.",
                    "cultivation_information": "Requires warm climate, well-draining soil, and 4-6 hours of sunlight. Water every 2 days.",
                    "safety_information": "Educational information only. May interact with blood-thinning medications and hypoglycemia agents. Avoid excessive therapeutic doses in pregnancy.",
                    "image_url": "/assets/tulsi.jpg",
                    "source_references": [
                        {"title": "Charaka Samhita — Sutrasthana", "url": "https://vedabase.io"},
                        {"title": "Kew Plants of the World Online — Ocimum tenuiflorum", "url": "https://powo.science.kew.org"}
                    ]
                },
                {
                    "slug": "ashwagandha",
                    "common_name": "Ashwagandha",
                    "scientific_name": "Withania somnifera",
                    "ayurvedic_name": "Ashwagandha",
                    "regional_names": ["Indian Ginseng", "Winter Cherry", "Asgandh"],
                    "category": "Adaptogens",
                    "description": "A grounding Rasayana (rejuvenator) in the nightshade family, historically praised for enhancing vitality, endurance, and restful sleep.",
                    "traditional_uses": "Used traditionally as a root powder in warm milk or ghee for calming Vata dosha, supporting cortisol balance and strength.",
                    "plant_parts_used": "Roots primarily, and occasionally leaves",
                    "habitat": "Dry, arid regions of northwestern India, the Mediterranean, and northern Africa.",
                    "cultivation_information": "Drought-tolerant; thrives in loose sandy-loam soil and full sun with minimal watering.",
                    "safety_information": "Avoid during pregnancy. Can affect thyroid hormone levels. Consult a healthcare practitioner if taking sedative or immunosuppressant medication.",
                    "image_url": "/assets/ashwagandha.jpg",
                    "source_references": [
                        {"title": "NCCIH — Ashwagandha Research Review", "url": "https://www.nccih.nih.gov/health/ashwagandha"}
                    ]
                },
                {
                    "slug": "neem",
                    "common_name": "Neem",
                    "scientific_name": "Azadirachta indica",
                    "ayurvedic_name": "Nimba",
                    "regional_names": ["Margosa", "Indian Lilac", "Veppam"],
                    "category": "Skin Care",
                    "description": "Known as “Arista” (the imperishable protector) in Sanskrit, Neem is a legendary bitter tree renowned for purification and skin health.",
                    "traditional_uses": "Leaves and bark historically used in herbal washes, pastes for purifying blood (Raktashodhaka), and oral chew sticks for dental hygiene.",
                    "plant_parts_used": "Leaves, bark, seeds, and seed oil",
                    "habitat": "Tropical and subtropical regions of South Asia; thrives in semi-arid conditions.",
                    "cultivation_information": "Deep-rooted, drought resistant, grows well in dry soils and requires full bright sunshine.",
                    "safety_information": "Pure neem seed oil is toxic if ingested internally and must never be swallowed, especially by children. For external use, always perform a patch test.",
                    "image_url": "/assets/neem.jpg",
                    "source_references": [
                        {"title": "Memorial Sloan Kettering — Neem Monograph", "url": "https://www.mskcc.org"}
                    ]
                },
                {
                    "slug": "brahmi",
                    "common_name": "Water Hyssop",
                    "scientific_name": "Bacopa monnieri",
                    "ayurvedic_name": "Brahmi",
                    "regional_names": ["Jalabrahmi", "Herpestis monniera", "Aindri"],
                    "category": "Stress Relief",
                    "description": "A premier Medhya Rasayana (mind and intellect rejuvenator), this creeping succulent has supported meditation, memory, and cognitive tranquility for millennia.",
                    "traditional_uses": "Traditionally prepared with ghee or warm water to nourish Majja dhatu (nervous tissue), sharpen concentration, and reduce mental fatigue.",
                    "plant_parts_used": "Whole succulent plant and leaves",
                    "habitat": "Wetlands, marshy ground, pond edges, and damp soils throughout warm regions.",
                    "cultivation_information": "Requires high moisture or boggy soil conditions and bright, indirect to direct light.",
                    "safety_information": "Large doses on an empty stomach may cause mild gastrointestinal upset. Note: distinct from Gotu Kola (Centella asiatica), which is also sometimes called Brahmi in north India.",
                    "image_url": "/assets/brahmi.jpg",
                    "source_references": [
                        {"title": "NCCIH — Bacopa monnieri Evidence Summary", "url": "https://www.nccih.nih.gov"}
                    ]
                },
                {
                    "slug": "turmeric",
                    "common_name": "Turmeric",
                    "scientific_name": "Curcuma longa",
                    "ayurvedic_name": "Haridra",
                    "regional_names": ["Haldi", "Kanchani", "Golden Spice"],
                    "category": "Heart Health",
                    "description": "A sacred golden rhizome in the ginger family, revered both as a daily culinary cornerstone and as a potent tridoshic purifying herb.",
                    "traditional_uses": "Traditionally simmered with milk and black pepper (Golden Milk) to relieve stiffness, purify circulation, and foster skin radiance.",
                    "plant_parts_used": "Rhizome (underground root stem)",
                    "habitat": "Humid tropical areas with heavy annual rainfall and fertile organic soil.",
                    "cultivation_information": "Planted after the last frost in warm partial shade. Requires moist, well-draining soil.",
                    "safety_information": "Culinary amounts are safe for almost everyone. High concentrated curcumin extracts may aggravate gallstones or interact with blood thinners.",
                    "image_url": "/assets/turmeric.jpg",
                    "source_references": [
                        {"title": "Kew Royal Botanic Gardens — Curcuma longa", "url": "https://powo.science.kew.org"}
                    ]
                },
                {
                    "slug": "aloe-vera",
                    "common_name": "Aloe Vera",
                    "scientific_name": "Aloe barbadensis",
                    "ayurvedic_name": "Kumari",
                    "regional_names": ["Ghritkumari", "Gwarpatha", "Korphad"],
                    "category": "Digestion",
                    "description": "Named “Kumari” (young maiden) reflecting its affinity for youthfulness, hormonal balance, and cooling liver support.",
                    "traditional_uses": "Clear inner leaf fillet consumed for cooling Pitta heat and soothing digestive mucous membranes; applied externally for sunburns.",
                    "plant_parts_used": "Inner clear leaf gel (excluding the bitter yellow aloin latex)",
                    "habitat": "Dry, sub-tropical arid zones of the Mediterranean, Africa, and Rajasthan.",
                    "cultivation_information": "Succulent requiring sandy cactus potting mix, minimal watering, and bright light.",
                    "safety_information": "Do not ingest whole leaf preparations containing the yellow latex sap (aloin), which is a potent laxative and contra-indicated in pregnancy.",
                    "image_url": "/assets/aloe-vera.jpg",
                    "source_references": [
                        {"title": "NCCIH — Aloe Vera Facts", "url": "https://www.nccih.nih.gov"}
                    ]
                },
                {
                    "slug": "ginger",
                    "common_name": "Ginger",
                    "scientific_name": "Zingiber officinale",
                    "ayurvedic_name": "Shunthi / Adrak",
                    "regional_names": ["Nagara", "Maha-aushadhi", "Universal Medicine"],
                    "category": "Digestion",
                    "description": "Known as “Vishwabheshaja” (the universal remedy), ginger is praised for kindling Agni (digestive fire) without provoking excessive heat.",
                    "traditional_uses": "Fresh ginger tea before meals stimulates appetite and eases nausea; dried ginger powder is used for respiratory comfort.",
                    "plant_parts_used": "Rhizome",
                    "habitat": "Cultivated globally across warm, humid subtropical climates.",
                    "cultivation_information": "Grows well in pots or garden beds with partial sun and consistently moist, rich compost.",
                    "safety_information": "Caution in active bleeding conditions or concurrent blood-thinning therapies.",
                    "image_url": "/assets/daily-wellness.jpg",
                    "source_references": [
                        {"title": "WHO Monographs on Selected Medicinal Plants", "url": "https://who.int"}
                    ]
                },
                {
                    "slug": "giloy",
                    "common_name": "Heart-Leaved Moonseed",
                    "scientific_name": "Tinospora cordifolia",
                    "ayurvedic_name": "Guduchi / Giloy",
                    "regional_names": ["Amrita", "Gurcha", "Chinnobhava"],
                    "category": "Immunity",
                    "description": "Known as “Amrita” (nectar of immortality), Guduchi is a climbing deciduous shrub famous for its ability to balance all three doshas without creating heat.",
                    "traditional_uses": "Classical root and stem decoctions used for lingering low fevers, cellular immunity, and natural detoxification.",
                    "plant_parts_used": "Mature stem and aerial roots",
                    "habitat": "Tropical deciduous and dry forests climbing upon Neem and Mango trees.",
                    "cultivation_information": "Very hardy vine propagated easily from cuttings; thrives in moist soil with trellis support.",
                    "safety_information": "Generally well-tolerated. Diabetics should monitor blood sugar levels as it may potentiate hypoglycemic medicines.",
                    "image_url": "/assets/herbal-wellness.jpg",
                    "source_references": [
                        {"title": "Ayurvedic Pharmacopoeia of India — Guduchi", "url": "https://ayush.gov.in"}
                    ]
                },
                {
                    "slug": "amla",
                    "common_name": "Indian Gooseberry",
                    "scientific_name": "Phyllanthus emblica",
                    "ayurvedic_name": "Amalaki",
                    "regional_names": ["Amla", "Dhatri", "Emblic Myrobalan", "Nellikai"],
                    "category": "Immunity",
                    "description": "Celebrated in classical Charaka Samhita as the premier Rasayana for longevity, Amalaki is one of nature's richest natural sources of heat-stable Vitamin C and rejuvenating polyphenols.",
                    "traditional_uses": "Cornerstone ingredient of Chyawanprash; tonifies digestion, purifies blood, strengthens eyesight, and enhances cellular immunity.",
                    "plant_parts_used": "Fresh and dried fruits (pericarp), seeds",
                    "habitat": "Tropical and subtropical deciduous forests across India and Southeast Asia.",
                    "cultivation_information": "Thrives in deep loamy soil and full sun; highly drought and frost resistant once established.",
                    "safety_information": "High doses may loosen bowels due to natural vitamin C and tannin content. Safe for daily long-term use.",
                    "image_url": "/assets/amla.jpg",
                    "source_references": [
                        {"title": "Charaka Samhita — Rasayana Adhyaya", "url": "https://vedabase.io"},
                        {"title": "NCCIH — Indian Gooseberry Overview", "url": "https://www.nccih.nih.gov"}
                    ]
                },
                {
                    "slug": "fenugreek",
                    "common_name": "Fenugreek",
                    "scientific_name": "Trigonella foenum-graecum",
                    "ayurvedic_name": "Methika",
                    "regional_names": ["Methi", "Greek Hay", "Vendhayam"],
                    "category": "Diabetes",
                    "description": "An aromatic leguminous annual herb prized in Ayurvedic dietary therapy (Ahara) for regulating blood glucose metabolism, improving insulin sensitivity, and easing digestive sluggishness.",
                    "traditional_uses": "Seeds soaked overnight in water and consumed in the morning for metabolic glucose control and soothing digestive fire (Agni).",
                    "plant_parts_used": "Seeds and fresh tender leaves",
                    "habitat": "Cultivated widely across western India, Mediterranean, and North Africa.",
                    "cultivation_information": "Easily grown in containers or vegetable gardens; prefers loose, well-draining soil and moderate watering.",
                    "safety_information": "May lower blood glucose levels; diabetic patients taking hypoglycemic medication should monitor blood sugar. Avoid large therapeutic doses during pregnancy.",
                    "image_url": "/assets/fenugreek.jpg",
                    "source_references": [
                        {"title": "Bhavaprakasha Nighantu — Haritakyadi Varga", "url": "https://ayush.gov.in"},
                        {"title": "PubMed — Trigonella foenum-graecum Glycemic Trials", "url": "https://pubmed.ncbi.nlm.nih.gov"}
                    ]
                },
                {
                    "slug": "shatavari",
                    "common_name": "Wild Asparagus",
                    "scientific_name": "Asparagus racemosus",
                    "ayurvedic_name": "Shatavari",
                    "regional_names": ["Satavar", "Shatawari", "Hundred Roots"],
                    "category": "Adaptogens",
                    "description": "Known as “she who possesses a hundred husbands”, Shatavari is the foremost Ayurvedic Rasayana for hormonal balance, reproductive vitality, and cooling Pitta inflammation.",
                    "traditional_uses": "Tuberous roots decocted in warm milk with ghee or raw honey to nourish Shukra and Artava dhatus (reproductive tissues) and calm nervous exhaustion.",
                    "plant_parts_used": "Tuberous roots",
                    "habitat": "Rocky, gravelly soils and low jungle hills throughout tropical India and the Himalayas.",
                    "cultivation_information": "Climbing woody shrub requiring trellis support, well-drained sandy loam, and partial shade.",
                    "safety_information": "Caution for individuals with severe asparagus allergies or estrogen-sensitive conditions. Generally gentle and nourishing.",
                    "image_url": "/assets/shatavari.jpg",
                    "source_references": [
                        {"title": "Sushruta Samhita — Sutrasthana", "url": "https://vedabase.io"},
                        {"title": "Kew Plants of the World Online — Asparagus racemosus", "url": "https://powo.science.kew.org"}
                    ]
                },
                {
                    "slug": "karela",
                    "common_name": "Bitter Melon",
                    "scientific_name": "Momordica charantia",
                    "ayurvedic_name": "Karavellaka",
                    "regional_names": ["Karela", "Bitter Gourd", "Pavakkai"],
                    "category": "Diabetes",
                    "description": "A celebrated bitter tonic and vegetable vine renowned in classical texts for reducing Medas (fat tissue), cleansing Pitta-Kapha impurities, and balancing insulin receptor function.",
                    "traditional_uses": "Fresh morning juice or steamed preparation to support pancreatic health, cleanse the liver, and maintain balanced blood sugar.",
                    "plant_parts_used": "Fruits, seeds, and tender leaves",
                    "habitat": "Tropical and subtropical regions; grown widely in home gardens and farmland.",
                    "cultivation_information": "Fast-growing annual climbing vine requiring sturdy trellis, warm weather, and regular watering.",
                    "safety_information": "Excessive intake of seeds may cause gastrointestinal discomfort. Monitor blood glucose closely when combined with antidiabetic prescription drugs.",
                    "image_url": "/assets/karela.jpg",
                    "source_references": [
                        {"title": "Charaka Samhita — Shakavarga", "url": "https://vedabase.io"},
                        {"title": "WHO Monographs on Selected Medicinal Plants", "url": "https://who.int"}
                    ]
                }
            ]

            seeded_count = 0
            for p_dict in plants_data:
                existing = db.query(Plant).filter(Plant.slug == p_dict['slug']).first()
                if not existing:
                    plant = Plant(**p_dict)
                    db.add(plant)
                    seeded_count += 1

            # Seed community posts for Raj, Yasha, Tejasvi if missing
            featured_authors = [
                {
                    "author_name": "Raj",
                    "plant_name": "Tulsi (Holy Basil)",
                    "note": "According to sacred tradition, the devoted Vrinda transformed into the holy Tulsi plant after her earthly life ended. Lord Vishnu blessed her with eternal reverence, promising she would always remain dear to him as the purest symbol of spiritual and bodily harmony. Plucking fresh leaves on my balcony brings such sacred tranquility and respiratory clarity each dawn.",
                    "likes_count": 18
                },
                {
                    "author_name": "Yasha",
                    "plant_name": "Ashwagandha (Withania somnifera)",
                    "note": "I have been preparing classical Ashwagandha root decoction with warm A2 cow milk, a small spoonful of pure cow ghee, and a dash of nutmeg before sleep for the past two months. My sleep quality and morning energy have improved drastically! Vata grounding is so profound when paired with warm milk (Anupana). Highly recommend to anyone experiencing modern screen fatigue.",
                    "likes_count": 14
                },
                {
                    "author_name": "Tejasvi",
                    "plant_name": "Neem & Turmeric (Nimba & Haridra)",
                    "note": "Our family tradition has always been a gentle morning paste of fresh ground Neem leaves and organic raw Turmeric with lukewarm water. For skin radiance, liver support, and natural blood purification (Raktashodhaka), there is simply no modern equivalent. During seasonal shifts (Ritu Sandhi), it keeps low fevers and breakouts completely at bay.",
                    "likes_count": 21
                }
            ]
            for post_item in featured_authors:
                if not db.query(CommunityPost).filter(CommunityPost.author_name == post_item["author_name"]).first():
                    db.add(CommunityPost(**post_item))

            db.commit()
            if seeded_count > 0:
                print(f"Successfully seeded {seeded_count} Ayurvedic plants into Herbora database!")

        # Idempotently synchronize / enrich with the 360 Amidha Ayurveda dataset records
        try:
            from import_dataset import import_amidha_dataset
            import_amidha_dataset()
        except Exception as ds_err:
            print(f"Notice: Dataset synchronization note: {ds_err}")
    except Exception as e:
        print(f"Notice during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 5000))
    print(f"Herbora Backend starting on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
