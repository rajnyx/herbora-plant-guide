"""
Herbora REST API Routes
Provides endpoints for Plantopedia, My Plant DB, AI Plant Identification,
Ayurvedic Assistant, Dincharya, Remedies, Myths, Quiz, and Community.
"""
from flask import Blueprint, request, jsonify
from models import SessionLocal, Plant, UserSavedPlant, IdentificationResult, CommunityPost, Feedback, User, PostLike, PostComment
from werkzeug.security import generate_password_hash, check_password_hash
from services.plant_identifier import identify_plant_image, AYURVEDIC_BOTANICAL_SIGNATURES
import uuid

api_bp = Blueprint('api', __name__, url_prefix='/api')

# --- Static Ayurvedic Knowledge Fallbacks ---
DINCHARYA_DATA = [
    {
        "time": "5:00 – 7:00 AM",
        "icon": "🌅",
        "title": "Brahma Muhurta & Awakening",
        "text": "Wake before sunrise during pure sattvic hours. Sip warm water with lemon or copper-infused water (Ushapan), scrape the tongue to remove ama (toxins), and brush teeth with bitter or astringent herbal tooth powder."
    },
    {
        "time": "7:00 – 10:00 AM",
        "icon": "🧘",
        "title": "Movement & Nourishment",
        "text": "Perform Abhyanga (warm sesame oil self-massage), 15-20 minutes of Pranayama (alternate nostril breathing) and gentle Surya Namaskar. Follow with a light, warm breakfast suited to your dominant dosha."
    },
    {
        "time": "12:00 – 2:00 PM",
        "icon": "🍲",
        "title": "Main Meal (Pitta Peak)",
        "text": "Digestive fire (Agni) peaks in alignment with the midday sun. Make lunch your largest and most nutrient-dense meal of the day, including all six tastes (Shad Rasa)."
    },
    {
        "time": "7:00 – 10:00 PM",
        "icon": "🌙",
        "title": "Wind Down & Restorative Sleep",
        "text": "Enjoy a light dinner at least 3 hours before sleep. Sip warm golden turmeric milk with a pinch of nutmeg. Power down screens by 9 PM to allow melatonin and restorative Ojas production."
    }
]

REMEDIES_DATA = [
    {
        "id": "remedy-1",
        "icon": "🍯",
        "category": "Immunity & Throat",
        "title": "Honey & Holy Basil Tea",
        "herb": "Tulsi (Ocimum sanctum)",
        "preparation": "Crush 5-6 fresh Tulsi leaves into boiled water, steep for 5 minutes, let cool slightly to lukewarm, and stir in raw honey.",
        "benefits": "Soothes irritated throat linings, clears bronchial passages, and enhances cellular immunity.",
        "safety": "Never add honey to boiling hot water as heated honey creates metabolic toxins (Ama) according to classical Charaka Samhita."
    },
    {
        "id": "remedy-2",
        "icon": "🥛",
        "category": "Joint Care & Mobility",
        "title": "Golden Turmeric Elixir",
        "herb": "Turmeric (Curcuma longa)",
        "preparation": "Whisk 1/2 tsp organic turmeric powder and a pinch of freshly ground black pepper into warm cow milk or almond milk with 1/4 tsp ghee.",
        "benefits": "Eases joint stiffness, dispels inflammatory tension, and fosters deeply restful sleep.",
        "safety": "Piperine from black pepper increases curcumin bioavailability by up to 2000%."
    },
    {
        "id": "remedy-3",
        "icon": "🫚",
        "category": "Digestion & Bloating",
        "title": "Agni Kindling Ginger Infusion",
        "herb": "Ginger (Zingiber officinale)",
        "preparation": "Grate 1 inch of fresh ginger root into a cup of hot water with a squeeze of fresh lime juice and a pinch of rock salt (Saindhava).",
        "benefits": "Ignites sluggish digestion (Manda Agni), relieves post-meal bloating, and reduces nausea.",
        "safety": "Avoid if suffering from active acid peptic ulcers or acute bleeding conditions."
    },
    {
        "id": "remedy-4",
        "icon": "🌸",
        "category": "Cooling & Pitta",
        "title": "Rose & Fennel Cooling Tonic",
        "herb": "Fennel & Rose Petals",
        "preparation": "Soak 1 tsp fennel seeds and organic rose petals overnight in cool water. Strain and sip during hot midday hours.",
        "benefits": "Calms excess Pitta fire, reduces acid heartburn, and cools the liver and skin.",
        "safety": "Excellent during summer months (Grishma Ritu) and high stress."
    },
    {
        "id": "remedy-5",
        "icon": "🌱",
        "category": "Immunity & Throat",
        "title": "Licorice & Cardamom Voice Elixir",
        "herb": "Yashtimadhu (Glycyrrhiza glabra) & Cardamom",
        "preparation": "Boil 1/2 tsp crushed organic licorice root and 2 crushed green cardamom pods in 1.5 cups water until reduced by half. Sip warm.",
        "benefits": "Lubricates vocal chords, coats inflamed pharyngeal mucosa, and eases hoarseness or persistent dry tickly cough.",
        "safety": "Those with chronic high blood pressure should avoid excessive daily licorice consumption due to glycyrrhizin retention."
    },
    {
        "id": "remedy-6",
        "icon": "🌙",
        "category": "Sleep & Stress",
        "title": "Ashwagandha Moon Milk",
        "herb": "Ashwagandha (Withania somnifera) & Nutmeg",
        "preparation": "Warm 1 cup cow or oat milk with 1/2 tsp Ashwagandha powder, a pinch of freshly grated nutmeg (Jaiphal), and 1 tsp raw sugar or ghee before bed.",
        "benefits": "Pacifies racing Vata minds, lowers cortisol, deeply rejuvenates the nervous system, and induces restorative REM sleep.",
        "safety": "Nutmeg is potent in micro-doses (a pinch only); avoid taking heavy doses during early pregnancy."
    },
    {
        "id": "remedy-7",
        "icon": "🌿",
        "category": "Digestion & Bloating",
        "title": "Amla & Cumin Digestive Coolant",
        "herb": "Amalaki (Phyllanthus emblica) & Jeera",
        "preparation": "Stir 1/2 tsp dry Amla powder and 1/2 tsp roasted cumin powder into 1 glass of fresh, room-temperature buttermilk or water.",
        "benefits": "Instantly neutralizes fiery Pitta hyperacidity, stops sour water brash, and stimulates cellular metabolic enzymes without heating the stomach.",
        "safety": "Take after midday lunch for optimal enzyme activation and digestive comfort."
    },
    {
        "id": "remedy-8",
        "icon": "🌾",
        "category": "Metabolism & Blood Sugar",
        "title": "Fenugreek & Cinnamon Glycemic Infusion",
        "herb": "Methika (Trigonella foenum-graecum) & Dalchini",
        "preparation": "Soak 1 tsp fenugreek seeds overnight in 1 cup water with a small Ceylon cinnamon stick. Strain and drink the golden water at dawn, chewing the softened seeds.",
        "benefits": "Enhances insulin sensitivity, slows post-prandial carbohydrate absorption, and tones sluggish Kapha lipid metabolism.",
        "safety": "Monitor blood glucose levels regularly if taking prescribed hypoglycemic medication."
    },
    {
        "id": "remedy-9",
        "icon": "🫚",
        "category": "Joint Care & Mobility",
        "title": "Dry Ginger & Castor Oil Joint Compress",
        "herb": "Shunthi (Zingiber officinale) & Eranda Taila",
        "preparation": "Mix 1 tbsp dry ginger powder with 2 tbsp warm castor oil into a warm paste. Apply locally over stiff, aching joints, wrapping with a warm cloth for 30 minutes.",
        "benefits": "Penetrates deep into joint capsules, clears accumulated metabolic toxicity (Ama), and relieves morning knee and finger stiffness.",
        "safety": "For external use only. Test a tiny patch of skin first to check for castor sensitivity."
    },
    {
        "id": "remedy-10",
        "icon": "🍃",
        "category": "Hair & Scalp Health",
        "title": "Bhringraj & Coconut Scalp Infusion",
        "herb": "Bhringraj (Eclipta alba) & Coconut Oil",
        "preparation": "Gently warm 3 tbsp organic coconut oil with 1 tsp Bhringraj powder in a water bath. Massage into the scalp in circular motions and leave for 1 hour before washing.",
        "benefits": "Cools excess heat in the scalp follicles (Pitta), strengthens the hair cortex, prevents premature graying, and dispels tension headaches.",
        "safety": "Wash with a gentle sulfate-free cleanser or herbal Shikakai powder for best results."
    },
    {
        "id": "remedy-11",
        "icon": "🫐",
        "category": "Eye & Gentle Detox",
        "title": "Triphala Eye & Cleansing Elixir",
        "herb": "Triphala (Amalaki, Bibhitaki, Haritaki)",
        "preparation": "Steep 1/2 tsp Triphala churna in 1 cup boiling water overnight. Filter through a double layer of sterile unbleached muslin cloth twice before using as an eye splash, or sip the decanted liquid for digestive toning.",
        "benefits": "Soothes tired screen eyes, reduces conjunctival redness, tones colon peristalsis, and removes mucosal toxins without dependence.",
        "safety": "Ensure liquid is impeccably filtered through multiple layers of clean cloth when used as an ocular wash."
    },
    {
        "id": "remedy-12",
        "icon": "🧊",
        "category": "Cooling & Pitta",
        "title": "Coriander & Mint Pitta Quencher",
        "herb": "Dhanyaka (Coriandrum sativum) & Pudina",
        "preparation": "Crush 1 tbsp whole coriander seeds and fresh mint leaves in 2 cups cool water. Let steep for 4 hours, strain, and sip with a drop of raw rock sugar (Mishri).",
        "benefits": "Classical 'Hima' (cold infusion) that relieves burning sensations during urination, soothes heat prickly skin rashes, and quenches intense thirst.",
        "safety": "Best consumed freshly made on the same day; ideal during Grishma (summer) and Sharad (autumn)."
    },
    {
        "id": "remedy-13",
        "icon": "🌿",
        "category": "Digestion & Bloating",
        "title": "Ajwain & Rock Salt Rapid Carminative",
        "herb": "Ajwain (Trachyspermum ammi) & Saindhava",
        "preparation": "Take 1/2 tsp ajwain seeds with a pinch of rock salt (Saindhava Lavana) and chew thoroughly followed by 1/2 cup warm water.",
        "benefits": "Relieves spasmodic stomach gas, abdominal colic, and acute indigestion within 15 to 20 minutes by relaxing smooth intestinal muscles.",
        "safety": "Ajwain is strongly heating; do not consume in large quantities during acute hyperacidity or active ulcers."
    },
    {
        "id": "remedy-14",
        "icon": "✨",
        "category": "Vitality & Hormonal Balance",
        "title": "Shatavari & Saffron Vitality Nectar",
        "herb": "Shatavari (Asparagus racemosus) & Kesar",
        "preparation": "Simmer 1 tsp Shatavari root powder and 3-4 strands of pure Kashmiri saffron in 1 cup milk for 5 minutes. Sweeten lightly with raw honey once lukewarm.",
        "benefits": "Nourishes the deepest reproductive tissue (Shukra Dhatu), balances female menstrual and menopausal transitions, and replenishes Ojas (vital glow).",
        "safety": "Take after meals in the evening; avoid if experiencing heavy mucus congestion or acute respiratory cold."
    }
]

MYTHS_DATA = [
    {
        "id": "myth-1",
        "category": "Safety & Dosage",
        "myth": "Because Ayurvedic herbs are natural, they can never have side effects or contraindications.",
        "fact": "Natural does not equal risk-free. Potent herbs like Ashwagandha, Neem, and Guggulu affect endocrine pathways, blood pressure, and liver metabolism. Classical texts insist on precise dosage (Matra), timing (Kala), and vehicle (Anupana)."
    },
    {
        "id": "myth-2",
        "category": "Effectiveness & Speed",
        "myth": "Ayurveda is only a slow-acting preventative discipline and cannot address immediate complaints.",
        "fact": "While constitutional rejuvenation takes patience, acute remedies—such as fresh ginger for nausea, ajwain seeds for spasmodic bloating, or clove for toothaches—often provide relief in minutes to hours."
    },
    {
        "id": "myth-3",
        "category": "Personalized Medicine",
        "myth": "One Ayurvedic herbal supplement works equally well for all people with the same condition.",
        "fact": "Ayurveda treats the unique individual (Prakriti and Vikriti), not the generic disease label. An herb that soothes a dry Vata cough might worsen a congested Kapha cough."
    },
    {
        "id": "myth-4",
        "category": "Herbal Synergy",
        "myth": "You can mix multiple Ayurvedic herbs together without any specific guidance.",
        "fact": "In classical formulation (Samyoga), herbs possess mutual enhancing (Sahakari) or opposing (Viruddha) actions. Synergistic balance is essential for proper absorption."
    },
    {
        "id": "myth-5",
        "category": "Diet & Digestion",
        "myth": "Raw salads and cold green smoothies are the healthiest daily foods for every body type in Ayurveda.",
        "fact": "Classical Ayurveda cautions that raw, ice-cold foods are Guru (heavy to digest) and Sheeta (cold), which douses digestive Agni and severely aggravates Vata. Warm, lightly steamed, spiced meals are essential for optimal nutrient absorption."
    },
    {
        "id": "myth-6",
        "category": "Diet & Digestion",
        "myth": "Pure honey can be safely boiled, baked into warm pastries, or stirred into boiling tea without any drawback.",
        "fact": "Charaka Samhita warns that heated honey becomes toxic ('Madhu Ama'). High heat alters the chemical bonds of honey, creating a sticky, fermenting metabolic toxin that clogs micro-channels (Srotas) and impairs tissue metabolism."
    },
    {
        "id": "myth-7",
        "category": "Diet & Digestion",
        "myth": "Ghee is pure saturated fat and will inevitably clog your arteries and cause heart disease.",
        "fact": "Pure A2 cow's ghee is celebrated in Ayurveda as the supreme Rasayana and Agni kindle. Rich in butyric acid and fat-soluble vitamins (A, D, E, K), classical ghee lubricates connective tissues and transports medicinal phytochemicals across the blood-brain barrier."
    },
    {
        "id": "myth-8",
        "category": "Diet & Digestion",
        "myth": "Drinking large glasses of ice-cold water during or immediately after meals aids fat loss and cleanses the stomach.",
        "fact": "Drinking ice-cold water douses the digestive fire (Jatharagni) like pouring cold water on an open flame. This stops digestive enzymes, congeals dietary fats, and causes undigested food to ferment into toxic Ama. Warm or room-temperature sips are recommended."
    },
    {
        "id": "myth-9",
        "category": "Daily Practices",
        "myth": "Drinking water stored in copper vessels all day and all night is universally healthy without any limits.",
        "fact": "Tamra Jal (copper water) is an oligodynamic antimicrobial tonic intended only for morning Ushapana (1-2 glasses stored for 6–8 hours). Drinking copper water continuously all day for months can lead to copper toxicity, liver strain, and Pitta inflammation."
    },
    {
        "id": "myth-10",
        "category": "Herbal Synergy",
        "myth": "Consuming huge tablespoons of dry raw Turmeric powder daily gives maximum anti-inflammatory benefits.",
        "fact": "Isolated Curcumin in dry turmeric has poor intestinal bioavailability (under 1%). Classical Ayurveda always pairs Haridra with black pepper (piperine increases absorption up to 2000%) and healthy lipids like ghee or warm milk to carry it into deep Dhatus."
    },
    {
        "id": "myth-11",
        "category": "Safety & Dosage",
        "myth": "Chyawanprash is a general multi-vitamin and should be eaten in heavy spoonfuls during the hottest days of summer.",
        "fact": "Authentic Chyawanprash contains warming, pungent spices like Pippali, cinnamon, and cardamoms designed to kindle winter Agni and expel Kapha cold. Eating large amounts during scorching summer heat can aggravate Pitta, causing acid reflux or skin eruptions."
    },
    {
        "id": "myth-12",
        "category": "Daily Practices",
        "myth": "Complete waterless fasting for multiple consecutive days is the supreme detox for all constitutions.",
        "fact": "Ayurvedic 'Langhana' (therapeutic lightening) must be carefully customized to individual Prakriti. While robust Kapha constitutions can tolerate short water fasts, dry Vata individuals severely deplete their bodily tissues (Ojas & Dhatus) and damage Agni if they fast excessively without water."
    }
]

QUIZ_DATA = [
    {
        "id": 1,
        "question": "Which revered plant is celebrated in Ayurvedic tradition as the “Queen of Herbs”?",
        "options": ["Neem (Nimba)", "Holy Basil (Tulsi)", "Giloy (Guduchi)", "Shatavari"],
        "answerIndex": 1,
        "explanation": "Tulsi (Ocimum sanctum) is revered as the Queen of Herbs for its tridoshic balancing power, spiritual purity, and adaptogenic strength."
    },
    {
        "id": 2,
        "question": "Ashwagandha (Withania somnifera) is classically categorized as which type of botanical agent?",
        "options": ["Rasayana (Rejuvenator & Adaptogen)", "Laxative", "Bitter Diuretic", "Cooling Febrifuge"],
        "answerIndex": 0,
        "explanation": "Ashwagandha is one of Ayurveda's greatest Rasayanas, traditionally used to nourish tissues, calm Vata, and support vitality without nervous stimulation."
    },
    {
        "id": 3,
        "question": "What active natural compound gives Turmeric its distinctive golden hue and studied properties?",
        "options": ["Allicin", "Curcumin", "Eugenol", "Azadirachtin"],
        "answerIndex": 1,
        "explanation": "Curcumin, alongside related curcuminoids and essential turmerones, is the primary polyphenol studied for turmeric's properties."
    },
    {
        "id": 4,
        "question": "In classical Ayurvedic wisdom, what does the term “Dincharya” represent?",
        "options": ["A seasonal fasting ritual", "An herbal detox tea", "A structured daily routine in harmony with nature", "A diagnostic pulse exam"],
        "answerIndex": 2,
        "explanation": "Dincharya (Din = day, Charya = regimen) is the daily routine synchronized with circadian rhythms and the 24-hour doshic cycle."
    },
    {
        "id": 5,
        "question": "Which creeping wetland herb is honored as a prime “Medhya Rasayana” for cognitive clarity and memory?",
        "options": ["Brahmi (Bacopa monnieri)", "Senna", "Fenugreek", "Mustard"],
        "answerIndex": 0,
        "explanation": "Bacopa monnieri (Brahmi) has been used for centuries by students and scholars to sharpen retention, tranquility, and memory."
    },
    {
        "id": 6,
        "question": "The classical Ayurvedic formula “Triphala” is composed of which three sacred medicinal fruits?",
        "options": ["Amalaki, Haritaki, and Bibhitaki", "Tulsi, Neem, and Giloy", "Ashwagandha, Shatavari, and Bala", "Ginger, Black Pepper, and Pippali"],
        "answerIndex": 0,
        "explanation": "Triphala ('Three Fruits') consists of Amalaki (Emblica officinalis), Haritaki (Terminalia chebula), and Bibhitaki (Terminalia bellirica), harmonizing all three doshas."
    },
    {
        "id": 7,
        "question": "Which bitter botanical is historically termed “Arishta” ('Reliever of Sickness') and used for skin and blood purification?",
        "options": ["Sandalwood", "Neem (Azadirachta indica)", "Cardamom", "Licorice"],
        "answerIndex": 1,
        "explanation": "Neem possesses cooling (Sheeta) Virya and bitter (Tikta) Rasa, acting as a premier Raktashodhaka (blood purifier) for inflammatory Pitta skin conditions."
    },
    {
        "id": 8,
        "question": "Which climbing shrub is known in Sanskrit as “Amrita” ('Nectar of Immortality') and used to alleviate chronic fevers?",
        "options": ["Giloy / Guduchi (Tinospora cordifolia)", "Fenugreek", "Coriander", "Cinnamon"],
        "answerIndex": 0,
        "explanation": "Guduchi is celebrated as Amrita because it protects cells from free radical damage, kindles Agni, and acts as a premier antipyretic (Jwarahara)."
    },
    {
        "id": 9,
        "question": "The bark of Terminalia arjuna is renowned in classical Ayurveda for its affinity to which vital organ?",
        "options": ["Kidneys", "Lungs", "Heart (Hridya)", "Gallbladder"],
        "answerIndex": 2,
        "explanation": "Arjuna bark is the preeminent 'Hridya' (cardiotonic) herb in Ayurveda, traditionally prepared with milk (Arjuna Ksheerapaka) to strengthen cardiac muscle."
    },
    {
        "id": 10,
        "question": "Which adaptogenic root herb, translating to “She Who Possesses a Hundred Husbands”, is revered for female vitality and hormonal harmony?",
        "options": ["Shatavari (Asparagus racemosus)", "Turmeric", "Nutmeg", "Guggulu"],
        "answerIndex": 0,
        "explanation": "Shatavari is the premier female reproductive Rasayana, celebrated for cooling Pitta, nourishing Ojas, and supporting hormonal balance across life stages."
    },
    {
        "id": 11,
        "question": "In Ayurvedic philosophy, what does the fundamental concept of “Agni” refer to?",
        "options": ["Body Temperature", "Digestive and Metabolic Fire", "Blood Pressure", "Physical Muscle Strength"],
        "answerIndex": 1,
        "explanation": "Agni is the biological fire responsible for digestion, absorption, and cellular transformation. When Agni is balanced (Sama Agni), vitality flourishes."
    },
    {
        "id": 12,
        "question": "Fresh Ginger (Adrak) and Black Pepper (Maricha) primarily exhibit which taste (Rasa) in Dravyaguna?",
        "options": ["Madhura (Sweet)", "Tikta (Bitter)", "Katu (Pungent)", "Kashaya (Astringent)"],
        "answerIndex": 2,
        "explanation": "Katu (pungent) rasa kindles digestive Agni, clears respiratory Kapha, and stimulates blood circulation."
    },
    {
        "id": 13,
        "question": "Which therapeutic action earned Bhringraj (Eclipta alba) the title “Keshya” in classical texts?",
        "options": ["Purifying the liver", "Strengthening and nourishing hair follicles", "Alleviating joint aches", "Improving eyesight"],
        "answerIndex": 1,
        "explanation": "Bhringraj is the sovereign herb for hair health (Keshya), cooling excess Pitta in the scalp to prevent premature graying and hair thinning."
    },
    {
        "id": 14,
        "question": "Which of the three Doshas is composed of Air and Ether elements, governing movement, breath, and nerve impulses?",
        "options": ["Vata Dosha", "Pitta Dosha", "Kapha Dosha", "Agni Dosha"],
        "answerIndex": 0,
        "explanation": "Vata is composed of Vayu (Air) and Akasha (Ether). It governs all bodily locomotion, circulation, elimination, and neurological transmissions."
    },
    {
        "id": 15,
        "question": "Why does classical Ayurveda prescribe pairing Turmeric with Black Pepper (Maricha) and ghee/milk?",
        "options": ["To improve shelf life", "Piperine and lipids dramatically enhance Curcumin absorption", "To sweeten the blend", "To alter the yellow color"],
        "answerIndex": 1,
        "explanation": "Piperine in black pepper enhances curcumin bioavailability by up to 2000%, while lipids in ghee act as a fat-soluble carrier (Anupana)."
    },
    {
        "id": 16,
        "question": "Amalaki (Phyllanthus emblica) is celebrated as the richest whole-food botanical source of which nutrient?",
        "options": ["Vitamin D", "Vitamin C (Ascorbic Acid)", "Vitamin B12", "Calcium Carbonate"],
        "answerIndex": 1,
        "explanation": "Amla is an extraordinary natural source of bioavailable Vitamin C and heat-stable polyphenols, remaining potent even after drying or cooking."
    },
    {
        "id": 17,
        "question": "In classical Ayurvedic pharmacology (Dravyaguna), what does “Virya” refer to?",
        "options": ["The taste on the tongue", "The energetic heating (Ushna) or cooling (Sheeta) potency", "The shelf life of the root", "The geographical elevation of the plant"],
        "answerIndex": 1,
        "explanation": "Virya represents the active energetic potency of a substance, predominantly categorized as Ushna (heating) or Sheeta (cooling)."
    },
    {
        "id": 18,
        "question": "Which medicinal vine is named “Gurmar” ('Destroyer of Sugar') for its property of suppressing the taste of sweetness?",
        "options": ["Gymnema sylvestre", "Licorice", "Peppermint", "Stevia"],
        "answerIndex": 0,
        "explanation": "Chewing fresh leaves of Gymnema sylvestre temporarily paralyzes sweet taste receptors, traditionally used to support healthy blood sugar."
    },
    {
        "id": 19,
        "question": "What classical Ayurvedic morning oral hygiene practice involves swishing warm sesame or coconut oil in the mouth?",
        "options": ["Gandusha / Kavala", "Nasya", "Abhyanga", "Neti"],
        "answerIndex": 0,
        "explanation": "Gandusha (oil pulling) strengthens gums, prevents dental caries, pulls oral toxins, and clears dullness from the vocal cords and jaw."
    },
    {
        "id": 20,
        "question": "The fragrant purified gum resin “Guggulu” (Commiphora mukul) is famously utilized in Ayurveda for which wellness benefit?",
        "options": ["Joint mobility, anti-inflammation, and scraping metabolic lipid accumulation (Meda)", "Inducing sudden sleep", "Cooling eye drops", "Rapid weight gain"],
        "answerIndex": 0,
        "explanation": "Guggulu possesses deep 'Lekhana' (scraping) action, clearing accumulated Ama, promoting joint mobility, and balancing blood lipids."
    }
]

GARDEN_PLANTS_DATA = [
    {
        "id": "gp-1",
        "name": "Tulsi (Holy Basil)",
        "emoji": "🌿",
        "sunlight": "Full direct sunlight (4–6 hours daily)",
        "watering": "Every 2 days when top inch of soil feels dry",
        "soil": "Rich, well-aerated potting mix with perlite",
        "tips": "Pinch off flower buds regularly to encourage bushy leaf foliage."
    },
    {
        "id": "gp-2",
        "name": "Spearmint & Pudina",
        "emoji": "🌱",
        "sunlight": "Partial shade or morning sunlight",
        "watering": "Daily or when soil surface starts to lighten",
        "soil": "Moist, organic-rich humus soil",
        "tips": "Grow in an individual container as roots spread vigorously."
    },
    {
        "id": "gp-3",
        "name": "Aloe Vera (Kumari)",
        "emoji": "🪴",
        "sunlight": "Bright indirect light; avoid scorching midday sun",
        "watering": "Every 7–10 days; allow soil to dry completely between waterings",
        "soil": "Cactus or succulent gritty soil with sand and pebbles",
        "tips": "Harvest outer, mature leaves at the base with a clean knife."
    },
    {
        "id": "gp-4",
        "name": "Brahmi (Water Hyssop)",
        "emoji": "🪷",
        "sunlight": "Partial to full morning sunlight",
        "watering": "Keep soil consistently damp; thrives near shallow water trays",
        "soil": "Moisture-retentive bog soil or loam",
        "tips": "Excellent for shallow terracotta dishes or balcony pond borders."
    }
]

BOT_KNOWLEDGE = [
    {
        "keywords": ["tulsi", "holy basil", "cough", "cold", "respiratory", "bronchial"],
        "response": "Tulsi (Ocimum sanctum) is renowned for respiratory health and immunity. A classic preparation is steeping 5 fresh crushed leaves in boiling water with a slice of fresh ginger and a touch of raw honey once lukewarm. It balances Kapha and Vata."
    },
    {
        "keywords": ["sleep", "insomnia", "anxiety", "stress", "calm", "relax"],
        "response": "For restful sleep and evening calm, Ayurveda recommends warm Golden Turmeric Milk with a small pinch of nutmeg and cardamom 45 minutes before bed. Ashwagandha root powder (1/2 tsp) taken in warm milk is also classical for grounding restless Vata."
    },
    {
        "keywords": ["skin", "acne", "blemish", "glow", "complexion"],
        "response": "Neem and Turmeric form the classical Ayurvedic pairing for clear skin. Neem purifies the blood and soothes inflammatory Pitta, while Turmeric supports healing. A gentle topical paste of sandalwood and turmeric is traditional for calming breakouts."
    },
    {
        "keywords": ["digestion", "bloat", "stomach", "gas", "agni", "acid"],
        "response": "To kindle healthy Agni (digestive fire) without creating excess heat, sip fresh ginger infusion before meals with a pinch of rock salt. Chewing 1/2 tsp of roasted fennel and cumin seeds after meals is an authentic method to ease gas and bloating."
    },
    {
        "keywords": ["memory", "focus", "study", "brain", "concentration"],
        "response": "Brahmi (Bacopa monnieri) is celebrated as the ultimate 'Medhya Rasayana' (intellect rejuvenator). It has been documented for centuries to promote mental clarity, soothe nervous fatigue, and support sustained focus."
    },
    {
        "keywords": ["garden", "grow", "water", "care", "balcony"],
        "response": "Beginners can easily cultivate Tulsi, Mint, and Aloe Vera at home. Tulsi thrives in 4–6 hours of sunlight and watering every 2 days, while Aloe Vera needs bright indirect light and infrequent watering every 7–10 days."
    }
]

# --- Plantopedia Endpoints ---

@api_bp.route('/plants', methods=['GET'])
def get_plants():
    db = SessionLocal()
    try:
        query = db.query(Plant).filter(Plant.is_published == True)
        
        category = request.args.get('category')
        if category and category != 'All':
            from sqlalchemy import or_
            clean_cat = category.strip().lower()
            cat_filters = [Plant.category == category, Plant.category.ilike(f"%{category}%")]
            
            if any(k in clean_cat for k in ['immunity', 'vitality']):
                cat_filters.extend([Plant.category.in_(['Immunity', 'Adaptogens']), Plant.description.ilike('%immunity%'), Plant.traditional_uses.ilike('%immunity%')])
            elif any(k in clean_cat for k in ['digest', 'gut']):
                cat_filters.extend([Plant.category.in_(['Digestion', 'Diet & Digestion', 'Digestion & Bloating']), Plant.description.ilike('%digest%'), Plant.traditional_uses.ilike('%digest%')])
            elif any(k in clean_cat for k in ['stress', 'sleep', 'brain']):
                cat_filters.extend([Plant.category.in_(['Stress Relief', 'Sleep & Stress']), Plant.description.ilike('%stress%'), Plant.description.ilike('%memory%')])
            elif any(k in clean_cat for k in ['skin', 'hair']):
                cat_filters.extend([Plant.category.in_(['Skin Care', 'Hair & Scalp Health']), Plant.description.ilike('%skin%'), Plant.description.ilike('%complexion%')])
            elif any(k in clean_cat for k in ['respiratory', 'lung', 'cough']):
                cat_filters.extend([Plant.category.in_(['Respiratory', 'Immunity & Throat']), Plant.description.ilike('%cough%'), Plant.description.ilike('%respiratory%'), Plant.traditional_uses.ilike('%respiratory%')])
            elif any(k in clean_cat for k in ['joint', 'mobility']):
                cat_filters.extend([Plant.category.in_(['Joint Care & Mobility']), Plant.description.ilike('%joint%'), Plant.traditional_uses.ilike('%joint%'), Plant.description.ilike('%arthritis%')])
            elif any(k in clean_cat for k in ['heart', 'cardio', 'circulation']):
                cat_filters.extend([Plant.category.in_(['Heart Health']), Plant.description.ilike('%heart%'), Plant.description.ilike('%circulation%')])
            elif any(k in clean_cat for k in ['diabet', 'sugar', 'glucose']):
                cat_filters.extend([Plant.category.in_(['Diabetes', 'Metabolism & Blood Sugar']), Plant.description.ilike('%diabetes%'), Plant.description.ilike('%blood sugar%')])
            elif any(k in clean_cat for k in ['detox', 'liver']):
                cat_filters.extend([Plant.category.in_(['Eye & Gentle Detox', 'Cooling & Pitta']), Plant.description.ilike('%liver%'), Plant.description.ilike('%detox%')])
            elif any(k in clean_cat for k in ['women', 'female', 'hormon']):
                cat_filters.extend([Plant.category.in_(['Vitality & Hormonal Balance']), Plant.description.ilike('%women%'), Plant.description.ilike('%hormon%')])
                
            query = query.filter(or_(*cat_filters))
            
        search_q = request.args.get('q', '').strip().lower()
        if search_q:
            query = query.filter(
                (Plant.common_name.ilike(f"%{search_q}%")) |
                (Plant.scientific_name.ilike(f"%{search_q}%")) |
                (Plant.ayurvedic_name.ilike(f"%{search_q}%")) |
                (Plant.english_name.ilike(f"%{search_q}%")) |
                (Plant.virya.ilike(f"%{search_q}%")) |
                (Plant.vipaka.ilike(f"%{search_q}%"))
            )
            
        plants = query.order_by(Plant.common_name.asc()).all()
        return jsonify([p.to_dict() for p in plants])
    finally:
        db.close()

@api_bp.route('/plants/<slug_or_id>', methods=['GET'])
def get_plant_detail(slug_or_id):
    db = SessionLocal()
    try:
        plant = db.query(Plant).filter(
            (Plant.slug == slug_or_id) | (Plant.id == slug_or_id)
        ).first()
        if not plant:
            return jsonify({"error": "Plant not found in Herbora database"}), 404
        return jsonify(plant.to_dict())
    finally:
        db.close()

@api_bp.route('/plants/search', methods=['GET'])
def search_plants():
    q = request.args.get('q', '').strip().lower()
    db = SessionLocal()
    try:
        plants = db.query(Plant).filter(
            (Plant.common_name.ilike(f"%{q}%")) |
            (Plant.scientific_name.ilike(f"%{q}%")) |
            (Plant.ayurvedic_name.ilike(f"%{q}%")) |
            (Plant.english_name.ilike(f"%{q}%")) |
            (Plant.description.ilike(f"%{q}%"))
        ).limit(20).all()
        return jsonify([p.to_dict() for p in plants])
    finally:
        db.close()

# --- My Plant DB (Saved Plants) ---

@api_bp.route('/my-plants', methods=['GET'])
def get_user_saved_plants():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "Authentication required. user_id parameter missing."}), 401
        
    db = SessionLocal()
    try:
        saved = db.query(UserSavedPlant).filter(UserSavedPlant.user_id == user_id).all()
        return jsonify([s.to_dict() for s in saved])
    finally:
        db.close()

@api_bp.route('/plants/<plant_id>/save', methods=['POST'])
def save_plant(plant_id):
    data = request.get_json(silent=True) or {}
    user_id = data.get('user_id') or request.headers.get('X-User-Id')
    notes = data.get('notes', '')
    
    if not user_id:
        return jsonify({"error": "Please log in to save plants to My Plant DB"}), 401

    db = SessionLocal()
    try:
        # Check plant exists
        plant = db.query(Plant).filter((Plant.id == plant_id) | (Plant.slug == plant_id)).first()
        if not plant:
            return jsonify({"error": "Plant does not exist"}), 404

        existing = db.query(UserSavedPlant).filter(
            UserSavedPlant.user_id == user_id,
            UserSavedPlant.plant_id == plant.id
        ).first()

        if existing:
            return jsonify({"message": "Plant already saved", "saved_plant": existing.to_dict()}), 200

        new_saved = UserSavedPlant(
            user_id=user_id,
            plant_id=plant.id,
            notes=notes
        )
        db.add(new_saved)
        db.commit()
        db.refresh(new_saved)
        return jsonify({"message": f"{plant.common_name} saved to My Plant DB", "saved_plant": new_saved.to_dict()}), 201
    finally:
        db.close()

@api_bp.route('/plants/<plant_id>/save', methods=['DELETE'])
def remove_saved_plant(plant_id):
    data = request.get_json(silent=True) or {}
    user_id = data.get('user_id') or request.args.get('user_id') or request.headers.get('X-User-Id')

    if not user_id:
        return jsonify({"error": "Authentication required"}), 401

    db = SessionLocal()
    try:
        plant = db.query(Plant).filter((Plant.id == plant_id) | (Plant.slug == plant_id)).first()
        target_id = plant.id if plant else plant_id

        entry = db.query(UserSavedPlant).filter(
            UserSavedPlant.user_id == user_id,
            UserSavedPlant.plant_id == target_id
        ).first()

        if not entry:
            return jsonify({"error": "Plant is not in saved list"}), 404

        db.delete(entry)
        db.commit()
        return jsonify({"message": "Plant removed from personal collection"}), 200
    finally:
        db.close()

# --- AI Plant Identification Endpoint ---

@api_bp.route('/identify', methods=['POST'])
def identify_plant():
    image_bytes = None
    filename = "upload.jpg"
    hint = request.form.get('hint')
    user_id = request.form.get('user_id')

    if 'image' in request.files:
        file = request.files['image']
        filename = file.filename or "upload.jpg"
        image_bytes = file.read()
    elif request.data:
        image_bytes = request.data
    else:
        json_data = request.get_json(silent=True) or {}
        hint = hint or json_data.get('hint')
        user_id = user_id or json_data.get('user_id')
        # If no file provided, simulate with botanical query
        image_bytes = b""

    # Analyze & Identify
    result = identify_plant_image(image_bytes, filename=filename, custom_hint=hint)

    # Cross-reference with database to return full entry
    db = SessionLocal()
    try:
        db_plant = None
        if result.get("slug"):
            db_plant = db.query(Plant).filter(Plant.slug == result["slug"]).first()
        if not db_plant and result.get("scientific_name"):
            db_plant = db.query(Plant).filter(Plant.scientific_name.ilike(f"%{result['scientific_name']}%")).first()
        if not db_plant and result.get("predicted_name"):
            db_plant = db.query(Plant).filter(Plant.common_name.ilike(f"%{result['predicted_name']}%")).first()

        if db_plant:
            result["matched_plant"] = db_plant.to_dict()
            result["slug"] = db_plant.slug
            if not result.get("ayurvedic_name"):
                result["ayurvedic_name"] = db_plant.ayurvedic_name
            matched_id = db_plant.id
        else:
            result["matched_plant"] = None
            matched_id = None

        # Log identification result
        log_entry = IdentificationResult(
            user_id=user_id,
            predicted_name=result["predicted_name"],
            scientific_name=result["scientific_name"],
            confidence_score=result["confidence_score"],
            matched_plant_id=matched_id,
            status="completed",
            botanical_traits=result["botanical_traits"]
        )
        db.add(log_entry)
        db.commit()
        result["log_id"] = log_entry.id
    except Exception as e:
        result["log_error"] = str(e)
    finally:
        db.close()

    return jsonify(result), 200

# --- Botanical AI Chat Assistant Endpoint ---

@api_bp.route('/chat', methods=['POST'])
def bot_chat():
    data = request.get_json(silent=True) or {}
    text = (data.get('message') or data.get('text') or '').strip().lower()

    if not text:
        return jsonify({
            "reply": "Namaste! I am your Herbora Botanical Assistant. Ask me about any Ayurvedic plant (like Tulsi, Ashwagandha, Neem), remedies for sleep or digestion, or daily wellness routines."
        })

    # Search keyword signatures
    for item in BOT_KNOWLEDGE:
        if any(k in text for k in item["keywords"]):
            return jsonify({"reply": item["response"]})

    # Search database for matching plants
    db = SessionLocal()
    try:
        words = [w for w in text.replace('?', ' ').replace('.', ' ').replace(',', ' ').split() if len(w) >= 3 and w not in {'what', 'how', 'use', 'take', 'plant', 'herb', 'tell', 'about', 'benefits', 'with', 'help', 'cure', 'does', 'good'}]
        for w in words:
            plant = db.query(Plant).filter(
                (Plant.common_name.ilike(f"%{w}%")) |
                (Plant.scientific_name.ilike(f"%{w}%")) |
                (Plant.ayurvedic_name.ilike(f"%{w}%")) |
                (Plant.slug.ilike(f"%{w}%"))
            ).first()
            if plant:
                uses = plant.traditional_uses or plant.description or "Revered in classical Ayurveda for overall balance."
                reply_parts = [
                    f"🌿 **{plant.common_name}** (*{plant.scientific_name}*)" + (f" — Ayurvedic: **{plant.ayurvedic_name}**" if plant.ayurvedic_name else ""),
                    f"**Category**: {plant.category}",
                    f"**Overview**: {plant.description}",
                    f"**Traditional Uses & Benefits**:\n{uses}"
                ]
                energetics = []
                if plant.virya:
                    energetics.append(f"• Virya (Potency): {plant.virya}")
                if plant.vipaka:
                    energetics.append(f"• Vipaka (Post-Digestive): {plant.vipaka}")
                if plant.tridosha:
                    energetics.append("• Dosha: Tridoshic (Balances Vata, Pitta, and Kapha)")
                if plant.plant_parts_used:
                    energetics.append(f"• Part Used: {plant.plant_parts_used}")
                if plant.main_indications:
                    energetics.append(f"• Indications: {', '.join(plant.main_indications)}")
                
                if energetics:
                    reply_parts.append("**Ayurvedic Energetics**:\n" + "\n".join(energetics))
                
                return jsonify({"reply": "\n\n".join(reply_parts)})
    except Exception as e:
        pass
    finally:
        db.close()

    # General botanical knowledge fallback
    fallback_reply = (
        "In Ayurveda, every herb carries a specific Rasa (taste), Virya (energy), and Vipaka (post-digestive effect) "
        "that interacts with your unique Doshas (Vata, Pitta, Kapha). You can ask me about specific plants (such as Tulsi, "
        "Ashwagandha, Neem, Turmeric, Brahmi, or Giloy), traditional remedies for sleep, digestion, or skin care, or home gardening."
    )
    return jsonify({"reply": fallback_reply})

# --- Classical Features Endpoints ---

@api_bp.route('/dincharya', methods=['GET'])
def get_dincharya():
    return jsonify(DINCHARYA_DATA)

@api_bp.route('/remedies', methods=['GET'])
def get_remedies():
    return jsonify(REMEDIES_DATA)

@api_bp.route('/myths', methods=['GET'])
def get_myths():
    return jsonify(MYTHS_DATA)

@api_bp.route('/quiz', methods=['GET'])
def get_quiz():
    return jsonify(QUIZ_DATA)

@api_bp.route('/garden-plants', methods=['GET'])
def get_garden_plants():
    return jsonify(GARDEN_PLANTS_DATA)

@api_bp.route('/posts', methods=['GET', 'POST'])
def handle_posts():
    db = SessionLocal()
    try:
        if request.method == 'POST':
            data = request.get_json(silent=True) or {}
            user_id = data.get('user_id') or request.headers.get('X-User-Id')
            
            # Enforce that only logged-in users can post
            if not user_id:
                return jsonify({"error": "Please log in to share your post with the community"}), 401

            author = data.get('author_name', 'Botanical Explorer').strip()
            plant = data.get('plant_name', 'Ayurvedic Herb').strip()
            note = data.get('note', '').strip()

            if not note:
                return jsonify({"error": "Note message cannot be empty"}), 400

            new_post = CommunityPost(
                user_id=user_id,
                author_name=author,
                plant_name=plant,
                note=note
            )
            db.add(new_post)
            db.commit()
            db.refresh(new_post)
            return jsonify(new_post.to_dict()), 201
        else:
            user_filter = request.args.get('user_id')
            query = db.query(CommunityPost)
            if user_filter:
                query = query.filter(CommunityPost.user_id == user_filter)
            posts = query.order_by(CommunityPost.created_at.desc()).limit(50).all()
            return jsonify([p.to_dict() for p in posts])
    finally:
        db.close()

@api_bp.route('/posts/<post_id>', methods=['PUT'])
def edit_post(post_id):
    db = SessionLocal()
    try:
        data = request.get_json(silent=True) or {}
        user_id = data.get('user_id') or request.headers.get('X-User-Id')
        if not user_id:
            return jsonify({"error": "Please log in to edit your post"}), 401
            
        post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
        if not post:
            return jsonify({"error": "Post not found"}), 404
            
        # Permission check: ensure user owns the post
        if post.user_id and post.user_id != user_id:
            return jsonify({"error": "You are not authorized to edit this post"}), 403
            
        plant = data.get('plant_name', '').strip()
        note = data.get('note', '').strip()
        
        if not note:
            return jsonify({"error": "Note content cannot be empty"}), 400
            
        if plant:
            post.plant_name = plant
        post.note = note
        if data.get('author_name'):
            post.author_name = data.get('author_name').strip()
            
        db.commit()
        db.refresh(post)
        return jsonify(post.to_dict()), 200
    finally:
        db.close()

@api_bp.route('/posts/<post_id>', methods=['DELETE'])
def delete_post(post_id):
    db = SessionLocal()
    try:
        data = request.get_json(silent=True) or {}
        user_id = data.get('user_id') or request.headers.get('X-User-Id')
        if not user_id:
            return jsonify({"error": "Please log in to delete your post"}), 401
            
        post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
        if not post:
            return jsonify({"error": "Post not found"}), 404
            
        # Permission check: ensure user owns the post
        if post.user_id and post.user_id != user_id:
            return jsonify({"error": "You are not authorized to delete this post"}), 403
            
        db.delete(post)
        db.commit()
        return jsonify({"message": "Post deleted successfully", "id": post_id}), 200
    finally:
        db.close()

@api_bp.route('/posts/<post_id>/like', methods=['POST'])
def like_post(post_id):
    data = request.get_json(silent=True) or {}
    user_id = data.get('user_id') or request.headers.get('X-User-Id') or request.remote_addr or 'guest'
    
    db = SessionLocal()
    try:
        post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
        if not post:
            return jsonify({"error": "Post not found"}), 404

        # Check if already liked by this user/client
        existing_like = db.query(PostLike).filter(
            PostLike.post_id == post_id,
            PostLike.user_id == user_id
        ).first()

        if existing_like:
            # Second like on heart -> dislike / remove like
            db.delete(existing_like)
            post.likes_count = max(0, (post.likes_count or 0) - 1)
            db.commit()
            return jsonify({
                "liked": False,
                "likes_count": post.likes_count,
                "message": "Disliked / unliked note"
            }), 200

        # First like on heart -> like note
        new_like = PostLike(post_id=post_id, user_id=user_id)
        db.add(new_like)
        post.likes_count = (post.likes_count or 0) + 1
        db.commit()
        return jsonify({
            "liked": True,
            "likes_count": post.likes_count,
            "message": "Liked successfully"
        }), 200
    finally:
        db.close()

@api_bp.route('/posts/<post_id>/comments', methods=['GET'])
def get_post_comments(post_id):
    db = SessionLocal()
    try:
        comments = db.query(PostComment).filter(PostComment.post_id == post_id).order_by(PostComment.created_at.asc()).all()
        return jsonify([c.to_dict() for c in comments]), 200
    finally:
        db.close()

@api_bp.route('/posts/<post_id>/comments', methods=['POST'])
def add_post_comment(post_id):
    data = request.get_json(silent=True) or {}
    user_id = data.get('user_id') or request.headers.get('X-User-Id')
    author_name = (data.get('author_name') or '').strip() or 'Botanical Reader'
    content = (data.get('content') or data.get('comment') or '').strip()

    if not content:
        return jsonify({"error": "Comment cannot be empty"}), 400

    db = SessionLocal()
    try:
        post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
        if not post:
            return jsonify({"error": "Post not found"}), 404

        new_comment = PostComment(
            post_id=post_id,
            user_id=user_id,
            author_name=author_name,
            content=content
        )
        db.add(new_comment)
        db.commit()
        db.refresh(new_comment)

        total_comments = db.query(PostComment).filter(PostComment.post_id == post_id).count()
        return jsonify({
            "message": "Comment posted successfully",
            "comment": new_comment.to_dict(),
            "comments_count": total_comments
        }), 201
    finally:
        db.close()

@api_bp.route('/comments/<comment_id>', methods=['DELETE'])
def delete_post_comment(comment_id):
    data = request.get_json(silent=True) or {}
    user_id = data.get('user_id') or request.headers.get('X-User-Id')
    if not user_id:
        return jsonify({"error": "Please log in to delete your comment"}), 401

    db = SessionLocal()
    try:
        comment = db.query(PostComment).filter(PostComment.id == comment_id).first()
        if not comment:
            return jsonify({"error": "Comment not found"}), 404

        if comment.user_id and comment.user_id != user_id:
            return jsonify({"error": "You are not authorized to delete this comment"}), 403

        post_id = comment.post_id
        db.delete(comment)
        db.commit()
        total_comments = db.query(PostComment).filter(PostComment.post_id == post_id).count()
        return jsonify({
            "message": "Comment deleted successfully",
            "comment_id": comment_id,
            "post_id": post_id,
            "comments_count": total_comments
        }), 200
    finally:
        db.close()

@api_bp.route('/feedback', methods=['POST'])
def handle_feedback():
    data = request.get_json(silent=True) or {}
    rating = int(data.get('rating', 5))
    message = data.get('message', '').strip()
    user_name = data.get('user_name', '').strip() or 'Herbora Visitor'
    user_email = data.get('user_email', '').strip() or None

    full_db_message = message
    if user_email:
        full_db_message = f"[{user_name} <{user_email}>]\n{message}"
    elif user_name and user_name != 'Herbora Visitor':
        full_db_message = f"[{user_name}]\n{message}"

    db = SessionLocal()
    try:
        fb = Feedback(rating=max(1, min(5, rating)), message=full_db_message)
        db.add(fb)
        db.commit()
    finally:
        db.close()

    # Dispatch notification email to rajsingh2007.rs@gmail.com
    from services.email_service import send_feedback_email
    dispatch_info = send_feedback_email(
        rating=rating,
        message=message,
        user_name=user_name,
        user_email=user_email
    )

    return jsonify({
        "message": "Thank you for your valuable feedback on Herbora!",
        "recipient": "rajsingh2007.rs@gmail.com",
        "dispatch": dispatch_info
    }), 201

@api_bp.route('/auth/signup', methods=['POST'])
def auth_signup():
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    full_name = data.get('full_name', '').strip()

    if not email or '@' not in email:
        return jsonify({"error": "A valid email address is required"}), 400
    if not password or len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            return jsonify({"error": "An account with this email already exists. Please sign in."}), 400

        pw_hash = generate_password_hash(password)
        new_user = User(
            email=email,
            password_hash=pw_hash,
            full_name=full_name or email.split('@')[0]
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return jsonify({
            "message": "Account created successfully",
            "user": new_user.to_dict()
        }), 201
    finally:
        db.close()

@api_bp.route('/auth/check-email', methods=['GET', 'POST'])
def auth_check_email():
    email = (request.args.get('email') or (request.get_json(silent=True) or {}).get('email') or '').strip().lower()
    if not email:
        return jsonify({"error": "Email is required"}), 400

    db = SessionLocal()
    try:
        from sqlalchemy import text
        try:
            res = db.execute(text("SELECT public.check_user_email(:email)"), {"email": email}).scalar()
            if res and isinstance(res, dict):
                return jsonify(res), 200
        except Exception:
            pass

        # Check public.users table as secondary fallback
        user = db.query(User).filter(User.email == email).first()
        return jsonify({
            "exists": user is not None,
            "confirmed": True
        }), 200
    finally:
        db.close()

@api_bp.route('/auth/signin', methods=['POST'])
def auth_signin():
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return jsonify({
                "error": "No account found with this email address. Please sign up.",
                "code": "USER_NOT_FOUND"
            }), 404

        if not check_password_hash(user.password_hash, password):
            return jsonify({
                "error": "Incorrect password. Please verify your password and try again.",
                "code": "WRONG_PASSWORD"
            }), 401

        return jsonify({
            "message": "Signed in successfully",
            "user": user.to_dict()
        }), 200
    finally:
        db.close()

@api_bp.route('/auth/user/<user_id>', methods=['GET'])
def auth_get_user(user_id):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"user": user.to_dict()}), 200
    finally:
        db.close()

@api_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "Herbora Backend API",
        "version": "1.0.0",
        "ayurveda_plants_seeded": len(AYURVEDIC_BOTANICAL_SIGNATURES)
    })
