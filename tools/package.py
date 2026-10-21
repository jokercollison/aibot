"""Package the add-on as two self-contained .mcpack files inside one .mcaddon."""
from pathlib import Path
from io import BytesIO
import zipfile, json
root=Path(__file__).resolve().parents[1]
version=json.loads((root/'package.json').read_text())['version']
expected_version=[int(n) for n in version.split('.')]
payloads={}
headers={}
for folder,kind in [('TimeTrapRobot_BP','Behavior'),('TimeTrapRobot_RP','Resources')]:
    buffer=BytesIO()
    with zipfile.ZipFile(buffer,'w',zipfile.ZIP_DEFLATED) as z:
        for p in sorted((root/'build'/folder).rglob('*')):
            if p.is_file():
                info=zipfile.ZipInfo(p.relative_to(root/'build'/folder).as_posix(),(2026,1,1,0,0,0))
                info.compress_type=zipfile.ZIP_DEFLATED
                z.writestr(info,p.read_bytes())
    content=buffer.getvalue()
    with zipfile.ZipFile(BytesIO(content)) as z:
        assert z.testzip() is None
        manifest=json.loads(z.read('manifest.json'))
        assert manifest['header']['version']==expected_version
        headers[kind]=manifest
    name=f'TimeTrapRobot-{kind}-{version}.mcpack'
    payloads[name]=content
    (root/'dist'/name).write_bytes(content)
resource=headers['Resources']['header']
assert any(d.get('uuid')==resource['uuid'] and d.get('version')==resource['version'] for d in headers['Behavior']['dependencies'])
target=root/f'dist/TimeTrapRobot-{version}.mcaddon'
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as z:
    for name,content in payloads.items():
        info=zipfile.ZipInfo(name,(2026,1,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED
        z.writestr(info,content)
with zipfile.ZipFile(target) as z:
    assert z.testzip() is None
    assert len(z.namelist())==2
print(f'Built and CRC-checked matching behavior/resource packs: {target}')
