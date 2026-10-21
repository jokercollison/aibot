"""Optional refresh from a local official samples checkout; never accesses the network."""
import json, re, sys
from pathlib import Path
root = Path(__file__).resolve().parents[1]
samples = Path(sys.argv[1])
def read_jsonc(path):
    source = path.read_text(encoding='utf-8-sig')
    source = re.sub(r'("(?:\\.|[^"\\])*"|//[^\n]*|/\*[\s\S]*?\*/)', lambda m: m[0] if m[0].startswith('"') else '', source)
    return json.loads(source)
recipes = {}
for path in sorted((samples/'behavior_pack/recipes').glob('*.json')):
    data = read_jsonc(path)
    for kind, body in data.items():
        if not kind.startswith('minecraft:recipe_'): continue
        if not isinstance(body, dict): continue
        recipes.setdefault(path.stem, []).append({'type':kind, 'definition':body, 'source':str(path.relative_to(samples))})
(root/'data/official_recipes.json').write_text(json.dumps(recipes, indent=2, ensure_ascii=False)+'\n')
print(f'Imported {len(recipes)} recipe files with original key mappings, tags and conditions preserved.')
