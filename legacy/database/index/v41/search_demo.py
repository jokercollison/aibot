"""Offline lookup demo for V41; no external network calls."""
import json,re,pathlib
ROOT=pathlib.Path(__file__).resolve().parent
INDEX=json.loads((ROOT/'lookup_index.json').read_text())
def search(text, category=None):
    query=re.sub(r'[^a-z0-9]+',' ',text.lower().replace('minecraft:','')).strip()
    hits=INDEX.get(query,[])
    if not hits:
        matches=[k for k in INDEX if query in k and query]
        hits=[v for k in matches[:20] for v in INDEX[k]]
    return [x for x in hits if category is None or x['category']==category]
if __name__=='__main__':
    for query in ('hopper','creeper','sharpness','plains'):
        print(query,search(query)[:3])
