"""Inventory exact reviewed block family applications, not wiki completeness."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def audit(filename, output):
    data = json.loads((ROOT / filename).read_text())
    catalog = json.loads((ROOT / 'data/catalog.json').read_text())['records']
    blocks = [r for r in catalog.values() if r['kind'] == 'block']
    families = []
    claimed = set()
    for rule in data['rules']:
        members = sorted(r['minecraft_id'] for r in blocks
                         if re.fullmatch(rule['pattern'], r['minecraft_id'][10:]))
        assert members, rule['id']
        assert not claimed.intersection(members), rule['id']
        claimed.update(members)
        families.append({
            'family': rule['id'], 'topics': list(rule['topics']),
            'members': members, 'subject_count': len(members),
            'facet_applications': len(members) * len(rule['topics'])
        })
    report = {
        'scope': filename,
        'families': families,
        'full_block_phase_complete': False,
        'subject_count': len(claimed),
        'facet_applications': sum(f['facet_applications'] for f in families),
        'independent_family_summaries': sum(len(r['topics']) for r in data['rules'])
    }
    (ROOT / output).write_text(json.dumps(report, indent=2) + '\n')
    print(filename, {k: v for k, v in report.items() if k not in ['families', 'scope']})


if __name__ == '__main__':
    audit('data/blocks/families.json', 'docs/BLOCK_FAMILY_AUDIT.json')
    audit('data/blocks/ground.json', 'docs/BLOCK_GROUND_AUDIT.json')

    audit('data/blocks/masonry.json', 'docs/BLOCK_MASONRY_AUDIT.json')

    audit('data/blocks/plants.json', 'docs/BLOCK_PLANT_AUDIT.json')

    audit('data/blocks/devices.json', 'docs/BLOCK_DEVICE_AUDIT.json')
