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
        "title": "Honey & Holy Basil Tea",
        "herb": "Tulsi (Ocimum sanctum)",
        "preparation": "Crush 5-6 fresh Tulsi leaves into boiled water, steep for 5 minutes, let cool slightly to lukewarm, and stir in raw honey.",
        "benefits": "Soothes irritated throat linings, clears bronchial passages, and enhances cellular immunity.",
        "safety": "Never add honey to boiling hot water as heated honey creates metabolic toxins (Ama) according to classical Charaka Samhita."
    },
    {
        "id": "remedy-2",
        "icon": "🥛",
        "title": "Golden Turmeric Elixir",
        "herb": "Turmeric (Curcuma longa)",
        "preparation": "Whisk 1/2 tsp organic turmeric powder and a pinch of freshly ground black pepper into warm cow milk or almond milk with 1/4 tsp ghee.",
        "benefits": "Eases joint stiffness, dispels inflammatory tension, and fosters deeply restful sleep.",
        "safety": "Piperine from black pepper increases curcumin bioavailability by up to 2000%."
    },
    {
        "id": "remedy-3",
        "icon": "🫚",
        "title": "Agni Kindling Ginger Infusion",
        "herb": "Ginger (Zingiber officinale)",
        "preparation": "Grate 1 inch of fresh ginger root into a cup of hot water with a squeeze of fresh lime juice and a pinch of rock salt (Saindhava).",
        "benefits": "Ignites sluggish digestion (Manda Agni), relieves post-meal bloating, and reduces nausea.",
        "safety": "Avoid if suffering from active acid peptic ulcers or acute bleeding conditions."
    },
    {
        "id": "remedy-4",
        "icon": "🌸",
        "title": "Rose & Fennel Cooling Tonic",
        "herb": "Fennel & Rose Petals",
        "preparation": "Soak 1 tsp fennel seeds and organic rose petals overnight in cool water. Strain and sip during hot midday hours.",
        "benefits": "Calms excess Pitta fire, reduces acid heartburn, and cools the liver and skin.",
        "safety": "Excellent during summer months (Grishma Ritu) and high stress."
    }
]

MYTHS_DATA = [
    {
        "id": "myth-1",
        "myth": "Because Ayurvedic herbs are natural, they can never have side effects or contraindications.",
        "fact": "Natural does not equal risk-free. Potent herbs like Ashwagandha, Neem, and Guggulu affect endocrine pathways, blood pressure, and liver metabolism. Classical texts insist on precise dosage (Matra), timing (Kala), and vehicle (Anupana)."
    },
    {
        "id": "myth-2",
        "myth": "Ayurveda is only a slow-acting preventative discipline and cannot address immediate complaints.",
        "fact": "While constitutional rejuvenation takes patience, acute remedies—such as fresh ginger for nausea, ajwain seeds for spasmodic bloating, or clove for toothaches—often provide relief in minutes to hours."
    },
    {
        "id": "myth-3",
        "myth": "One Ayurvedic herbal supplement works equally well for all people with the same condition.",
        "fact": "Ayurveda treats the unique individual (Prakriti and Vikriti), not the generic disease label. An herb that soothes a dry Vata cough might worsen a congested Kapha cough."
    },
    {
        "id": "myth-4",
        "myth": "You can mix multiple Ayurvedic herbs together without any specific guidance.",
        "fact": "In classical formulation (Samyoga), herbs possess mutual enhancing (Sahakari) or opposing (Viruddha) actions. Synergistic balance is essential for proper absorption."
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
            query = query.filter(Plant.category == category)
            
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

    # General botanical knowledge fallback
    fallback_reply = (
        "In Ayurveda, every herb carries a specific Rasa (taste), Virya (energy), and Vipaka (post-digestive effect) "
        "that interacts with your unique Doshas (Vata, Pitta, Kapha). Would you like to explore herbs for immunity, "
        "calming stress, digestion, or skin care? You can also check our Plantopedia library or try identifying a plant photo!"
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

    db = SessionLocal()
    try:
        fb = Feedback(rating=max(1, min(5, rating)), message=message)
        db.add(fb)
        db.commit()
        return jsonify({"message": "Thank you for your valuable feedback on Herbora!"}), 201
    finally:
        db.close()

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
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({"error": "Invalid email or password"}), 401

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
