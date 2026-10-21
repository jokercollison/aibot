"""Generate our original two-note robot chirp; ffmpeg encodes the final OGG."""
from pathlib import Path
import math,struct,wave,subprocess,tempfile
root=Path(__file__).resolve().parents[1]
target=root/'Content/resource_packs/AI_Bot/sounds/tts/ai_bot/robot/chirp.ogg'
rate=44100
with tempfile.TemporaryDirectory(prefix='tts-audio-') as tmp:
    path=Path(tmp)/'chirp.wav'
    frames=[]
    for frequency,duration in [(880,0.18),(0,0.07),(1320,0.20)]:
        n=int(rate*duration)
        for i in range(n):
            envelope=min(1,i/(rate*0.012),(n-1-i)/(rate*0.025))
            value=int(18000*max(0,envelope)*math.sin(2*math.pi*frequency*i/rate)) if frequency else 0
            frames.append(struct.pack('<h',value))
    with wave.open(str(path),'wb') as out:
        out.setparams((1,2,rate,0,'NONE','not compressed'));out.writeframes(b''.join(frames))
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(path),'-c:a','libvorbis','-q:a','4',str(target)],check=True)
print('Generated original 0.45-second mono OGG chirp:',target)
