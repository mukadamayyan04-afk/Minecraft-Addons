#!/usr/bin/env python3
"""Generate original Solo Leveling-inspired Bedrock resource assets.
All textures are deterministic procedural artwork, not padding or duplicated files.
"""
from pathlib import Path
import math, random, wave, struct
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path("SoloLeveling-RP")
TEX = ROOT / "textures"
ENTITY = TEX / "entity"
ITEMS = TEX / "items"
BLOCKS = TEX / "blocks"
SOUNDS = ROOT / "sounds"
for p in (ENTITY, ITEMS, BLOCKS, SOUNDS):
    p.mkdir(parents=True, exist_ok=True)

def make_texture(path, size, seed, palette, style):
    rng = random.Random(seed)
    im = Image.new("RGB", (size, size))
    px = im.load()
    a, b, c = palette
    # Layered directional fields + fine material grain create unique, usable texture maps.
    for y in range(size):
        for x in range(size):
            n = rng.randrange(-24, 25)
            wave1 = math.sin((x + seed * 7) / (size / 13)) * 13
            wave2 = math.cos((y - seed * 3) / (size / 17)) * 11
            vein = math.sin((x * 0.7 + y * 1.3 + seed) / (size / 28)) * 17
            t = (math.sin((x+y+seed*11)/(size/9))+1)/2
            base = [a[i]*(1-t)+b[i]*t for i in range(3)]
            if style == "rune":
                line = abs(((x + y*2 + seed*19) % max(18,size//7)) - max(18,size//14))
                glow = max(0, 1-line/(size/90))*65
            elif style == "metal":
                glow = max(0, math.sin((x+y*0.28)/(size/15)))*25
            elif style == "stone":
                glow = max(0, math.sin((x//18+y//13+seed)))*12
            else:
                glow = max(0, math.sin((x*0.3-y*0.5+seed)/(size/20)))*18
            px[x,y] = tuple(max(0,min(255,int(base[i] + n + wave1 + wave2 + vein*.25 + glow + c[i]*.08))) for i in range(3))
    d = ImageDraw.Draw(im, "RGBA")
    # Fine engraved borders and subtle panel seams.
    step = max(64, size//4)
    for k in range(0,size,step):
        d.line((k,0,k,size), fill=(170,120,255,22), width=max(1,size//512))
        d.line((0,k,size,k), fill=(170,120,255,18), width=max(1,size//512))
    if style == "rune":
        for i in range(9):
            x=rng.randrange(size); y=rng.randrange(size); r=rng.randrange(size//70,size//24)
            d.ellipse((x-r,y-r,x+r,y+r), outline=(130,65,255,95), width=max(1,size//256))
            d.line((x-r,y,x+r,y), fill=(140,80,255,75), width=max(1,size//256))
    im.save(path, "PNG", optimize=False)

materials = [
 ("shadow_knight",(17,19,31),(45,38,69),(106,54,164),"rune"),
 ("shadow_armor",(12,15,24),(38,42,58),(105,112,145),"metal"),
 ("violet_steel",(28,19,48),(83,47,126),(177,115,255),"metal"),
 ("mana_crystal",(15,30,65),(35,103,164),(99,219,255),"rune"),
 ("dungeon_stone",(35,32,43),(76,67,82),(120,100,128),"stone"),
 ("blood_ore",(42,13,23),(105,25,47),(202,61,81),"stone"),
 ("monarch_gold",(51,34,13),(137,98,35),(241,197,86),"metal"),
 ("frost_rune",(19,40,57),(57,117,148),(166,231,255),"rune"),
 ("infernal_core",(53,17,8),(139,45,18),(255,126,38),"rune"),
 ("beast_hide",(35,25,21),(94,62,47),(161,117,77),"stone"),
 ("hunter_fabric",(20,29,39),(55,71,87),(117,145,164),"stone"),
 ("dark_leather",(22,17,22),(65,43,48),(119,79,83),"stone"),
 ("rune_obsidian",(10,10,19),(35,31,55),(109,67,180),"rune"),
 ("ancient_bone",(54,48,39),(137,124,98),(214,198,157),"stone"),
 ("storm_alloy",(25,36,43),(69,92,103),(151,192,202),"metal"),
 ("monarch_aura",(28,11,47),(94,30,139),(211,117,255),"rune"),
]
for i,(name,a,b,c,style) in enumerate(materials):
    folder = ENTITY if name == "shadow_knight" else BLOCKS
    make_texture(folder/(name+".png"), 1024, 9301+i, (a,b,c), style)

item_materials = [
 ("dagger_void",(15,13,25),(63,42,96),(174,126,255),"rune"),
 ("sword_monarch",(44,28,12),(151,104,29),(255,218,111),"metal"),
 ("mana_potion",(12,38,69),(27,115,170),(111,221,255),"rune"),
 ("hunter_badge",(27,33,47),(79,92,119),(185,202,230),"metal"),
 ("shadow_token",(18,12,31),(76,37,112),(190,120,255),"rune"),
 ("rune_scroll",(62,48,29),(154,127,77),(232,211,156),"stone"),
]
for i,(name,a,b,c,style) in enumerate(item_materials):
    make_texture(ITEMS/(name+".png"), 512, 12001+i, (a,b,c), style)

# Original short game sound effects (PCM WAV, mono, 22.05 kHz).
def sound(path, kind, seed):
    rate=22050; duration=1.35; count=int(rate*duration); rng=random.Random(seed)
    with wave.open(str(path),"wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate)
        frames=[]
        for i in range(count):
            t=i/rate; env=math.exp(-t*(3.1 if kind!="ambient" else 1.1))
            if kind=="summon":
                f=95+520*t
                v=math.sin(2*math.pi*f*t)+.35*math.sin(2*math.pi*f*2.01*t)
            elif kind=="levelup":
                f=440+220*math.sin(t*8)
                v=math.sin(2*math.pi*f*t)+.45*math.sin(2*math.pi*f*1.5*t)
            elif kind=="gate":
                f=70+120*math.sin(t*3)
                v=.7*math.sin(2*math.pi*f*t)+.25*rng.uniform(-1,1)
            else:
                f=110+18*math.sin(t*5)
                v=.5*math.sin(2*math.pi*f*t)+.18*math.sin(2*math.pi*f*2.7*t)+.12*rng.uniform(-1,1)
            sample=int(max(-1,min(1,v*env*.68))*32767)
            frames.append(struct.pack("<h",sample))
        w.writeframes(b"".join(frames))
for i,name in enumerate(("shadow_summon","hunter_levelup","dungeon_gate","shadow_ambience")):
    sound(SOUNDS/(name+".wav"), ("summon","levelup","gate","ambient")[i], 440+i)

print("Generated", len(materials)+len(item_materials), "original texture assets and 4 sound effects.")
