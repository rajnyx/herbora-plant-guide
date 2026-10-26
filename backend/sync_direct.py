import sys
import os
import json
import re
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

WORKSPACE_ROOT = Path(r"c:\Users\rajsi\OneDrive\Desktop\Documents\raj\Herbora-workspace")
HERBAURA_DIR = WORKSPACE_ROOT / "herbaura"
load_dotenv(HERBAURA_DIR / ".env")

db_url = os.getenv("DATABASE_URL").replace(":6543/", ":5432/")
engine = create_engine(db_url, echo=False)

images = json.load(open(HERBAURA_DIR / "database" / "data" / "plant_images.json", encoding="utf-8"))

def norm(s):
    return re.sub(r'[\s_\-\(\)\',.]+', '', (s or '').lower())

img_norm = {norm(k): v for k, v in images.items()}

def main():
    print("Connecting directly to Supabase PostgreSQL (port 5432)...", flush=True)
    with engine.connect() as conn:
        rows = conn.execute(text("SELECT id, slug, common_name, ayurvedic_name, image_url FROM plants;")).fetchall()
        print(f"Total plants in table: {len(rows)}", flush=True)

        updated_count = 0
        for p_id, slug, c_name, a_name, cur_img in rows:
            img = (
                images.get(slug)
                or img_norm.get(norm(slug))
                or img_norm.get(norm(a_name))
                or img_norm.get(norm(c_name))
            )
            if img and cur_img != img:
                conn.execute(
                    text("UPDATE plants SET image_url = :img WHERE id = :id"),
                    {"img": img, "id": p_id}
                )
                updated_count += 1
                if updated_count % 50 == 0:
                    conn.commit()
                    print(f"Updated and committed {updated_count} plants...", flush=True)

        conn.commit()
        print(f"All updates committed! Total updated: {updated_count}", flush=True)

        with_img = conn.execute(text("SELECT count(*) FROM plants WHERE image_url IS NOT NULL;")).scalar()
        total = conn.execute(text("SELECT count(*) FROM plants;")).scalar()
        print(f"\nFINAL VERIFICATION: {with_img}/{total} plants have image_url in Supabase PostgreSQL!", flush=True)

if __name__ == "__main__":
    main()
