import requests
import os
import sys

PLANT_IMAGES = [
    'tulsi.jpg',
    'neem.jpg',
    'turmeric.jpg',
    'ashwagandha.jpg',
    'aloe-vera.jpg'
]

NON_PLANT_IMAGES = [
    'react.svg',
    'vite.svg',
    'boundary_check.png',
    'herbora-logo.png'
]

assets_dir = 'frontend/public/assets'

print('========================================')
print('1. TESTING REAL BOTANICAL SPECIMENS')
print('========================================')
plant_pass = True
for img_name in PLANT_IMAGES:
    path = os.path.join(assets_dir, img_name)
    if not os.path.exists(path):
        print(f'[SKIP] Missing {img_name}')
        continue
    with open(path, 'rb') as f:
        r = requests.post('http://127.0.0.1:5173/api/identify', files={'image': (img_name, f, 'image/jpeg')})
    data = r.json()
    status = r.status_code
    pred = data.get('predicted_name', 'None')
    conf = data.get('confidence_score', 0)
    matched = data.get('matched_plant') is not None
    is_ok = status == 200 and data.get('status') == 'success'
    if not is_ok:
        plant_pass = False
    print(f"[{'PASS' if is_ok else 'FAIL'}] {img_name:<16} -> Status {status} | Match: {pred} ({conf}%) | Indexed: {matched}")

print('\n========================================')
print('2. TESTING STRICT NON-PLANT REJECTIONS')
print('========================================')
non_plant_pass = True
for img_name in NON_PLANT_IMAGES:
    path = os.path.join(assets_dir, img_name)
    if not os.path.exists(path):
        continue
    with open(path, 'rb') as f:
        r = requests.post('http://127.0.0.1:5173/api/identify', files={'image': (img_name, f, 'image/png')})
    data = r.json()
    status = r.status_code
    is_not_plant = data.get('is_not_plant') is True
    is_rejected = status == 400 and is_not_plant
    if not is_rejected:
        non_plant_pass = False
    print(f"[{'PASS' if is_rejected else 'FAIL'}] {img_name:<18} -> Status {status} | Error: {data.get('error')} | is_not_plant: {is_not_plant}")

print('\n========================================')
print('3. TESTING 1-CLICK BOTANICAL SAMPLE PRESETS')
print('========================================')
sample_pass = True
for sample_hint in ['tulsi', 'neem', 'turmeric', 'ashwagandha']:
    r = requests.post('http://127.0.0.1:5173/api/identify', data={'hint': sample_hint})
    data = r.json()
    status = r.status_code
    pred = data.get('predicted_name')
    is_ok = status == 200 and data.get('status') == 'success' and pred is not None
    if not is_ok:
        sample_pass = False
    print(f"[{'PASS' if is_ok else 'FAIL'}] Preset: {sample_hint:<12} -> Status {status} | Plant: {pred} | Slug: {data.get('slug')}")

print('\n========================================')
print('4. TESTING DATABASE INTEGRITY & SEARCH')
print('========================================')
db_pass = True
r = requests.get('http://127.0.0.1:5173/api/plants?search=tulsi')
res_data = r.json()
plant_list = res_data if isinstance(res_data, list) else res_data.get('plants', [])
if r.status_code == 200 and len(plant_list) > 0:
    print(f"[PASS] Search 'tulsi': found {len(plant_list)} records")
else:
    print(f"[FAIL] Search 'tulsi' returned status {r.status_code}")
    db_pass = False

r2 = requests.get('http://127.0.0.1:5173/api/plants/tulsi')
p_data = r2.json()
plant_item = p_data.get('plant', p_data) if isinstance(p_data, dict) else {}
if r2.status_code == 200 and plant_item.get('slug') == 'tulsi':
    print(f"[PASS] Fetch monograph 'tulsi': {plant_item.get('common_name')} ({plant_item.get('scientific_name')})")
else:
    print(f"[FAIL] Fetch monograph 'tulsi' failed: {r2.status_code}")
    db_pass = False

print('\n========================================')
print('5. TESTING EDGE CASE: CORRUPTED DATA')
print('========================================')
edge_pass = True
r = requests.post('http://127.0.0.1:5173/api/identify', files={'image': ('garbage.bin', b'1234567890garbage', 'application/octet-stream')})
if r.status_code == 400 and r.json().get('is_not_plant') is True:
    print(f"[PASS] Corrupted binary payload rejected with HTTP 400 (is_not_plant=True)")
else:
    print(f"[FAIL] Corrupted binary payload was not rejected: {r.status_code} {r.text[:100]}")
    edge_pass = False

print('\n========================================')
all_passed = plant_pass and non_plant_pass and sample_pass and db_pass and edge_pass
print(f"OVERALL MATRIX TEST RESULT: {'SUCCESS (ALL PASSED)' if all_passed else 'FAILURE'}")
print('========================================')
if not all_passed:
    sys.exit(1)
