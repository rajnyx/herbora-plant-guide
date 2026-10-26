import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

WORKSPACE = Path(r"c:\Users\rajsi\OneDrive\Desktop\Documents\raj\Herbora-workspace")
HERB_JSON = WORKSPACE / "herbaura" / "database" / "data" / "herb.json"
PLANT_IMAGES_JSON = WORKSPACE / "herbaura" / "database" / "data" / "plant_images.json"
FRONTEND_IMAGES_JSON = WORKSPACE / "herbaura" / "frontend" / "src" / "data" / "plant_images.json"

FRONTEND_IMAGES_JSON.parent.mkdir(parents=True, exist_ok=True)

CURATED_LOCAL_IMAGES = {
    "tulsi": "/assets/tulsi.jpg",
    "ashwagandha": "/assets/ashwagandha.jpg",
    "neem": "/assets/neem.jpg",
    "brahmi": "/assets/brahmi.jpg",
    "turmeric": "/assets/turmeric.jpg",
    "aloe-vera": "/assets/aloe-vera.jpg",
    "amla": "/assets/amla.jpg",
    "fenugreek": "/assets/fenugreek.jpg",
    "shatavari": "/assets/shatavari.jpg",
    "karela": "/assets/karela.jpg"
}

def slugify(text):
    text = (text or "").strip().lower()
    text = re.sub(r'[\(\)\',.]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    return text.strip('-')

def clean_botanical_name(name):
    if not name:
        return ""
    # Remove author citations, e.g. "Terminalia bellirica (Gaertn.) Roxb." -> "Terminalia bellirica"
    name = re.sub(r'\(.*?\)', '', name)
    parts = name.split()
    if len(parts) >= 2:
        return f"{parts[0]} {parts[1]}".strip()
    return name.strip()

headers = {
    "User-Agent": "HerboraAyurvedicPlantEncyclopedia/1.0 (educational non-commercial; contact: info@herbora.org)"
}

def query_wikipedia_batch(titles):
    if not titles:
        return {}
    query_str = "|".join(titles)
    url = (
        "https://en.wikipedia.org/w/api.php?action=query&prop=pageimages"
        f"&pithumbsize=600&redirects=1&format=json&titles={urllib.parse.quote(query_str)}"
    )
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        
        # Build normalized/redirect map
        # normalizations: from -> to
        norm_map = {}
        for norm in data.get("query", {}).get("normalized", []):
            norm_map[norm["to"]] = norm["from"]
        
        # redirects: from -> to
        redirect_map = {}
        for red in data.get("query", {}).get("redirects", []):
            orig = norm_map.get(red["from"], red["from"])
            redirect_map[red["to"]] = orig

        results = {}
        pages = data.get("query", {}).get("pages", {})
        for page_id, page in pages.items():
            if page_id == "-1":
                continue
            title = page.get("title")
            thumb = page.get("thumbnail", {}).get("source")
            if thumb:
                # Map back to queried title
                orig_title = redirect_map.get(title, norm_map.get(title, title))
                results[title.lower()] = thumb
                results[orig_title.lower()] = thumb
                # Also without parenthesis
                clean_t = re.sub(r'\(.*?\)', '', title).strip().lower()
                results[clean_t] = thumb
        return results
    except Exception as e:
        print(f"Error querying batch: {e}")
        return {}

def search_wikipedia_single(query):
    if not query:
        return None
    url = (
        "https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=1&format=json"
        f"&srsearch={urllib.parse.quote(query)}"
    )
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        hits = data.get("query", {}).get("search", [])
        if hits:
            best_title = hits[0]["title"]
            # Now fetch thumbnail for this title
            batch_res = query_wikipedia_batch([best_title])
            for k, thumb in batch_res.items():
                if thumb:
                    return thumb
    except Exception as e:
        pass
    return None

def main():
    print("Loading plants from herb.json...")
    with open(HERB_JSON, "r", encoding="utf-8") as f:
        plants = json.load(f)

    # Load existing images if any
    image_map = {}
    if PLANT_IMAGES_JSON.exists():
        try:
            with open(PLANT_IMAGES_JSON, "r", encoding="utf-8") as f:
                image_map = json.load(f)
        except Exception:
            pass

    # Ensure curated 10 have local asset paths
    for slug, path in CURATED_LOCAL_IMAGES.items():
        image_map[slug] = path

    print(f"Total plants: {len(plants)}. Initially resolved: {sum(1 for v in image_map.values() if v)}")

    # Round 1: Batch botanical names
    missing_plants = []
    for p in plants:
        name = p.get("name", "").strip()
        slug = slugify(name)
        if not image_map.get(slug):
            missing_plants.append(p)

    print(f"Plants missing images: {len(missing_plants)}")

    # Prepare batches of 35
    botanical_to_slug = {}
    titles_to_query = []
    for p in missing_plants:
        slug = slugify(p["name"])
        bot = clean_botanical_name(p.get("botanical_name"))
        if bot:
            botanical_to_slug[bot.lower()] = slug
            titles_to_query.append(bot)

    # Unique titles
    unique_titles = list(dict.fromkeys(titles_to_query))
    print(f"Round 1: Querying {len(unique_titles)} botanical names in batches of 35...")
    
    batch_size = 35
    for i in range(0, len(unique_titles), batch_size):
        chunk = unique_titles[i:i + batch_size]
        res = query_wikipedia_batch(chunk)
        for t_lower, thumb in res.items():
            if t_lower in botanical_to_slug:
                slug = botanical_to_slug[t_lower]
                if not image_map.get(slug) and thumb:
                    image_map[slug] = thumb
        print(f"  Batch {i//batch_size + 1}/{(len(unique_titles) + batch_size - 1)//batch_size} done. Total found: {sum(1 for v in image_map.values() if v)}")
        time.sleep(1)

    # Round 2: For still missing, batch english names
    still_missing = [p for p in plants if not image_map.get(slugify(p["name"]))]
    print(f"Plants still missing after Round 1: {len(still_missing)}")
    
    eng_to_slug = {}
    eng_titles = []
    for p in still_missing:
        slug = slugify(p["name"])
        eng = p.get("english_name", "").strip()
        if eng and len(eng) > 2 and eng.lower() not in ("none", "unknown"):
            eng_to_slug[eng.lower()] = slug
            eng_titles.append(eng)

    unique_eng = list(dict.fromkeys(eng_titles))
    print(f"Round 2: Querying {len(unique_eng)} English names in batches of 35...")
    for i in range(0, len(unique_eng), batch_size):
        chunk = unique_eng[i:i + batch_size]
        res = query_wikipedia_batch(chunk)
        for t_lower, thumb in res.items():
            if t_lower in eng_to_slug:
                slug = eng_to_slug[t_lower]
                if not image_map.get(slug) and thumb:
                    image_map[slug] = thumb
        time.sleep(1)

    print(f"Total resolved after Round 2: {sum(1 for v in image_map.values() if v)}")

    # Round 3: Wikipedia Search for remaining plants
    still_missing_2 = [p for p in plants if not image_map.get(slugify(p["name"]))]
    print(f"Plants still missing after Round 2: {len(still_missing_2)}")
    
    for idx, p in enumerate(still_missing_2):
        slug = slugify(p["name"])
        bot = clean_botanical_name(p.get("botanical_name"))
        eng = p.get("english_name", "")
        name = p.get("name", "")

        found = None
        # Try botanical name search
        if bot:
            found = search_wikipedia_single(f"{bot} plant")
            if not found:
                found = search_wikipedia_single(bot)
        if not found and eng and len(eng) > 2:
            found = search_wikipedia_single(f"{eng} plant")
        if not found and name:
            found = search_wikipedia_single(f"{name} medicinal plant")

        if found:
            image_map[slug] = found
            print(f"  [Search Match {idx+1}/{len(still_missing_2)}] {p['name']} ({bot}) -> Found image")
        else:
            print(f"  [Still Unmatched {idx+1}/{len(still_missing_2)}] {p['name']} ({bot})")
        time.sleep(0.5)

    # Save to both locations
    with open(PLANT_IMAGES_JSON, "w", encoding="utf-8") as f:
        json.dump(image_map, f, indent=2, ensure_ascii=False)

    with open(FRONTEND_IMAGES_JSON, "w", encoding="utf-8") as f:
        json.dump(image_map, f, indent=2, ensure_ascii=False)

    total_final = sum(1 for v in image_map.values() if v)
    print(f"\nFINISHED! Total plant images mapped: {total_final}/{len(plants)}")

if __name__ == "__main__":
    main()
