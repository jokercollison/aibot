from pathlib import Path
import zipfile
root=Path(__file__).resolve().parents[1]
target=root/'dist/TimeTrapRobot-0.1.0.mcaddon'
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted((root/'build').rglob('*')):
        if p.is_file():
            info=zipfile.ZipInfo(p.relative_to(root/'build').as_posix(),(2026,1,1,0,0,0))
            info.compress_type=zipfile.ZIP_DEFLATED
            z.writestr(info,p.read_bytes())
with zipfile.ZipFile(target) as z:
    assert z.testzip() is None
    assert 'TimeTrapRobot_BP/manifest.json' in z.namelist()
    assert 'TimeTrapRobot_RP/manifest.json' in z.namelist()
print(f'Built and CRC-checked: {target}')
