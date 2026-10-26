import sys
import os
import json
import re
import time
from pathlib import Path
from dotenv import load_dotenv

WORKSPACE_ROOT = Path(r"c:\Users\rajsi\OneDrive\Desktop\Documents\raj\Herbora-workspace")
HERBAURA_DIR = WORKSPACE_ROOT / "herbaura"
BACKEND_DIR = HERBAURA_DIR / "backend"
sys.path.insert(0, str(BACKEND_DIR))
load_dotenv(HERBAURA_DIR / ".env")

import models
from sqlalchemy import text

def norm(s):
    return re.sub(r'[\s_\-\(\)\',.]+', '', (s or '').lower())

def main():
    images = json.load(open(HERBAURA_DIR / "database" / "data" / "plant_images.json", encoding="utf-8"))
    img_norm = {norm(k): v for k, v in images.items()}

    print(f"Loaded {len(images)} images from plant_images.json.")

    with models.engine.connect() as conn:
        res = conn.execute(text("SELECT id, slug, common_name, ayurvedic_name, image_url FROM plants;"))
        rows = res.fetchall()
        print(f"Found {len(rows)} plants in database.")

        to_update = []
        for r in rows:
            p_id, slug, common_name, ayurvedic_name, cur_img = r
            slug_n = norm(slug)
            name_n = norm(common_name)
            ayur_n = norm(ayurvedic_name)

            img_url = (
                images.get(slug)
                or img_norm.get(slug_n)
                or img_norm.get(ayur_n)
                or img_norm.get(name_n)
            )

            if img_url and cur_img != img_url:
                to_update.append({"id": p_id, "image_url": img_url})

        print(f"Plants requiring image update: {len(to_update)}")

    # Update in chunks of 25 with commits
    chunk_size = 25
    updated_total = 0
    for i in range(0, len(to_update), chunk_size):
        chunk = to_update[i:i + chunk_size]
        for attempt in range(3):
            try:
                with models.engine.connect() as conn:
                    for item in chunk:
                        conn.execute(
                            text("UPDATE plants SET image_url = :image_url WHERE id = :id"),
                            {"image_url": item["image_url"], "id": item["id"]}
                        )
                    conn.commit()
                updated_total += len(chunk)
                print(f"  Batch {i//chunk_size + 1}/{(len(to_update) + chunk_size - 1)//chunk_size} committed ({updated_total}/{len(to_update)})")
                break
            except Exception as e:
                print(f"  Attempt {attempt + 1} failed: {e}. Retrying in 2s...")
                time.sleep(2)

    # Verification query
    with models.engine.connect() as conn:
        count_res = conn.execute(text("SELECT count(*) FROM plants WHERE image_url IS NOT NULL;"))
        with_img = count_res.scalar()
        total_res = conn.execute(text("SELECT count(*) FROM plants;"))
        total = total_res.scalar()
        print(f"\nFinal Verification: {with_img}/{total} plants in database now have actual botanical images!")

if __name__ == "__main__":
    main()
