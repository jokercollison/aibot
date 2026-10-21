"""Build a small runtime catalog while preserving the complete inherited research."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
records=json.loads((root/'data/knowledge_v64.json').read_text())['records']
fields=['id','kind','name','minecraft_id','source','verification','effect','maximum_level','equipment','recipes']
catalog={id:{key:record[key] for key in fields if key in record} for id,record in records.items() if record['kind'] in ['entity','block','item','enchantment','biome']}
(root/'data/catalog.json').write_text(json.dumps({'records':catalog,'originalRecordCount':len(records)},indent=2,ensure_ascii=False)+'\n')
