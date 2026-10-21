"""Prepare a separately installable test release: python tools/new_release.py 0.2.1.

A version receives new pack AND module UUIDs once. Rebuilding or preparing the
same version reuses its recorded IDs; a different version gets a distinct pair.
This is an explicit release operation, never an implicit installation/build step.
"""
from pathlib import Path
import json,re,sys,uuid
ROOT=Path(__file__).resolve().parents[1]
def load(p):return json.loads(p.read_text())
def save(p,data):p.write_text(json.dumps(data,indent=2)+'\n')
if len(sys.argv)!=2 or not re.fullmatch(r'(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)',sys.argv[1]):
    raise SystemExit('Usage: python tools/new_release.py MAJOR.MINOR.PATCH')
version=sys.argv[1];parts=[int(v) for v in version.split('.')]
registry_path=ROOT/'tools/pack_identities.json'
registry=load(registry_path) if registry_path.exists() else {}
bp_path=ROOT/'Content/behavior_packs/AI_Bot/manifest.json'
rp_path=ROOT/'Content/resource_packs/AI_Bot/manifest.json'
bp=load(bp_path);rp=load(rp_path)
if version not in registry:
    registry[version]={'behavior':{'header':str(uuid.uuid4()),'data':str(uuid.uuid4()),'script':str(uuid.uuid4())},'resources':{'header':str(uuid.uuid4()),'resources':str(uuid.uuid4())}}
identity=registry[version]
for path,pack,kind in [(bp_path,bp,'behavior'),(rp_path,rp,'resources')]:
    pack['header']['uuid']=identity[kind]['header'];pack['header']['version']=parts
    title='Behavior' if kind=='behavior' else 'Resources'
    pack['header']['name']=f'Time Trap Studios AI Bot — {title} {version}'
    pack['header']['description']=f'Time Trap Studios AI Bot {title} pack — TEST VERSION {version}. Activate only with this version’s matching pack.'
    for module in pack['modules']:
        module['uuid']=identity[kind][module['type']];module['version']=parts
    if kind=='behavior':
        pack['dependencies']=[d for d in pack.get('dependencies',[]) if 'module_name' in d]+[{'uuid':identity['resources']['header'],'version':parts}]
    save(path,pack)
    lang=path.parent/'texts/en_US.lang';text=lang.read_text()
    text=re.sub(r'^(pack\.(?:name|description)=.*?)(?:\d+\.\d+\.\d+)(.*)$',lambda m:m[1]+version+m[2],text,flags=re.M)
    lang.write_text(text)
package_path=ROOT/'package.json';package=load(package_path);package['version']=version;save(package_path,package)
lock_path=ROOT/'package-lock.json'
if lock_path.exists():
    lock=load(lock_path);lock['version']=version
    if '' in lock.get('packages',{}):lock['packages']['']['version']=version
    save(lock_path,lock)
save(registry_path,registry)
print(f'Prepared isolated test release {version}; pack identities recorded in tools/pack_identities.json.')
print('Run npm run validate, copy the matching artifacts to downloads, and publish the source/build together.')
