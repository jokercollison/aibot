#!/usr/bin/env python3
"""Offline content record validator for Minecraft AI v40."""
import json,sys
from pathlib import Path
ALLOWED={"confirmed_from_samples","confirmed_from_official_docs","wiki_cross_checked","needs_validation","unknown","contradicted"}
REQUIRED={"record_id","category","subject_id","predicate","value","edition","source_refs","verification"}
def validate(record):
    errors=[]
    if not isinstance(record,dict): return ["Record must be an object"]
    errors += ["missing "+k for k in sorted(REQUIRED-set(record))]
    if record.get("edition")!="bedrock": errors.append("edition must be bedrock")
    if record.get("verification") not in ALLOWED: errors.append("invalid verification")
    if not isinstance(record.get("source_refs"),list) or not record.get("source_refs"): errors.append("source_refs must be a nonempty list")
    return errors
if __name__=="__main__":
    bad=0
    for name in sys.argv[1:]:
        data=json.loads(Path(name).read_text(encoding="utf8"))
        for i,rec in enumerate(data if isinstance(data,list) else [data]):
            errors=validate(rec)
            if errors: print(f"{name}:{i}: {', '.join(errors)}");bad+=1
    print(f"Validation complete; {bad} invalid record(s)")
    sys.exit(bool(bad))
