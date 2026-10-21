"""User-required layout: one outer archive, ordinary Content pack folders.

The .mcaddon and Content .zip have identical folder entries. Standalone .mcpack
files are optional alternative imports and are NEVER embedded in either archive.
"""
from pathlib import Path
import zipfile,json
root=Path(__file__).resolve().parents[1]
version=json.loads((root/'package.json').read_text())['version']
expected=[int(n) for n in version.split('.')]
headers={};content={}
def write_zip(target,files):
    with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as z:
        for name,payload in sorted(files.items()):
            info=zipfile.ZipInfo(name,(2026,1,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED
            z.writestr(info,payload)
    with zipfile.ZipFile(target) as z:
        assert z.testzip() is None
for folder,kind,category in [('TimeTrapRobot_BP','Behavior','behavior_packs'),('TimeTrapRobot_RP','Resources','resource_packs')]:
    source=root/'build'/folder
    files={p.relative_to(source).as_posix():p.read_bytes() for p in source.rglob('*') if p.is_file()}
    manifest=json.loads(files['manifest.json']);assert manifest['header']['version']==expected
    headers[kind]=manifest
    # A separate optional import file, never nested in the .mcaddon.
    write_zip(root/f'dist/TimeTrapRobot-{kind}-{version}.mcpack',files)
    content.update({f'Content/{category}/AI_Bot/{name}':payload for name,payload in files.items()})
resource=headers['Resources']['header']
assert any(d.get('uuid')==resource['uuid'] and d.get('version')==resource['version'] for d in headers['Behavior']['dependencies'])
assert not any(name.lower().endswith(('.zip','.mcpack','.mcaddon')) for name in content)
for suffix in [f'TimeTrapRobot-{version}.mcaddon',f'TimeTrapRobot-Content-{version}.zip']:
    target=root/'dist'/suffix;write_zip(target,content)
    with zipfile.ZipFile(target) as z:
        for category in ['behavior_packs','resource_packs']:
            assert f'Content/{category}/AI_Bot/manifest.json' in z.namelist()
        assert not any(n.lower().endswith(('.zip','.mcpack','.mcaddon')) for n in z.namelist())
    print(f'Built and CRC-checked single-layer Content folder archive: {target}')
