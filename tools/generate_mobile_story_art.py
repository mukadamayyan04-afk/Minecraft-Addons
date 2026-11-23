from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import math, random

OUT = Path("MobileSafe-RP/textures/ui/hunter_chapters")
OUT.mkdir(parents=True, exist_ok=True)
W = H = 1024

def make_scene(index, title, palette, seed):
    random.seed(seed)
    top, mid, low, glow = palette
    im = Image.new("RGB", (W, H))
    px = im.load()
    for y in range(H):
        t = y / (H - 1)
        if t < .58:
            q = t / .58
            c = tuple(int(top[k] * (1-q) + mid[k] * q) for k in range(3))
        else:
            q = (t-.58)/.42
            c = tuple(int(mid[k] * (1-q) + low[k] * q) for k in range(3))
        for x in range(W):
            n = random.randint(-7, 7)
            px[x,y] = tuple(max(0,min(255,v+n)) for v in c)
    d = ImageDraw.Draw(im, "RGBA")
    # atmospheric moon / registry beacon
    cx, cy = 760, 245
    for r in range(190, 20, -10):
        alpha = int(2 + (190-r) / 190 * 13)
        d.ellipse((cx-r,cy-r,cx+r,cy+r), fill=(*glow,alpha))
    d.ellipse((cx-62,cy-62,cx+62,cy+62), fill=(*glow,210), outline=(235,244,255,220), width=5)
    # layered original landscapes
    for layer in range(4):
        ybase = 610 + layer*105
        pts=[(0,H)]
        for x in range(0,W+1,16):
            y = ybase + math.sin((x/W*math.pi*2)+(index*.8)+layer)*55 + math.sin(x/W*math.pi*5+layer)*22
            pts.append((x,int(y)))
        pts.append((W,H))
        col = (12+layer*8, 20+layer*9, 37+layer*11, 245)
        d.polygon(pts, fill=col)
    # distant ruins / outpost silhouettes
    for x in range(80, 960, 145):
        y = random.randint(500,650)
        h = random.randint(80,190)
        d.rectangle((x,y-h,x+random.randint(35,75),y), fill=(8,14,28,170))
        d.polygon([(x-12,y-h),(x+24,y-h-35),(x+70,y-h)], fill=(10,17,32,190))
        for wy in range(y-h+25,y-15,42):
            d.rectangle((x+15,wy,x+23,wy+17), fill=(*glow,130))
    # glowing route / discovery marks
    for j in range(8):
        x = random.randint(60,960); y=random.randint(650,950)
        r=random.randint(3,9)
        d.ellipse((x-r,y-r,x+r,y+r), fill=(*glow,150))
    # subtle map grid and frame
    for x in range(0,W,128): d.line((x,0,x,H), fill=(210,230,255,12), width=1)
    for y in range(0,H,128): d.line((0,y,W,y), fill=(210,230,255,12), width=1)
    d.rounded_rectangle((28,28,W-28,H-28), radius=28, outline=(190,220,255,115), width=3)
    # chapter seal and title panel
    d.rounded_rectangle((54,790,970,950), radius=24, fill=(5,10,22,205), outline=(*glow,190), width=3)
    d.text((88,820), f"CHAPTER {index:02d}", fill=(*glow,255), stroke_width=1, stroke_fill=(0,0,0,255))
    d.text((88,865), title.upper(), fill=(245,248,255,255), stroke_width=1, stroke_fill=(0,0,0,255))
    # fine grain for rich, non-flat artwork
    grain = Image.effect_noise((W,H), 18).convert("L").filter(ImageFilter.GaussianBlur(0.35))
    overlay = Image.new("RGBA",(W,H),(255,255,255,0))
    overlay.putalpha(grain.point(lambda v: int(v*.10)))
    im = Image.alpha_composite(im.convert("RGBA"), overlay).convert("RGB")
    im.save(OUT / f"chapter_{index:02d}.png", optimize=True)

chapters = [
 ("The First Awakening", ((8,18,40),(25,48,78),(9,17,32),(95,190,255))),
 ("A Message from the Outpost", ((25,20,48),(68,42,77),(18,19,39),(255,185,120))),
 ("Echoes of the Old Mine", ((15,27,39),(38,63,67),(12,20,28),(120,230,190))),
 ("The Sealed Archive", ((22,17,43),(58,39,78),(15,13,32),(190,155,255))),
 ("A New Chapter", ((13,28,48),(34,65,88),(9,22,35),(255,215,135))),
]
for i,(name,palette) in enumerate(chapters,1): make_scene(i,name,palette,400+i)

# A dedicated square pack icon, matching the story artwork.
icon=Image.new("RGB",(256,256),(7,13,28)); d=ImageDraw.Draw(icon,"RGBA")
for r in range(118,10,-4):
    d.ellipse((128-r,128-r,128+r,128+r), fill=(30,95,150,max(2,100-r//2)))
d.polygon([(128,34),(157,102),(222,128),(157,157),(128,222),(99,157),(34,128),(99,102)], fill=(80,190,255,225), outline=(230,245,255,255))
d.ellipse((105,105,151,151),fill=(8,18,35,255),outline=(240,250,255,255),width=5)
icon.save("MobileSafe-RP/pack_icon.png", optimize=True)
