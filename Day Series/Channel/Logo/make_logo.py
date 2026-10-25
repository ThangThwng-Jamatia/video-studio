#!/usr/bin/env python3
"""Survivy Guy channel logo generator.
Needs: fonttools, cairosvg, pillow (e.g. a venv). Font: InterTight-Black.ttf (OFL, instanced at wght 900) in this folder.
Run: python make_logo.py   -> writes all SVG/PNG deliverables next to this file.
"""
import os, random, math, io
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import cairosvg
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(HERE, "InterTight-Black.ttf")
NAVY, NAVY2 = "#080C14", "#0B0E14"
LIME, RED, AMBER, BLUE, WHITE = "#C8FF3D", "#FF3B3B", "#FFB23D", "#5CC8FF", "#FFFFFF"

# ---------------------------------------------------------------- text -> path
_font = TTFont(FONT)
_gs = _font.getGlyphSet()
_cmap = _font.getBestCmap()
_upm = _font["head"].unitsPerEm
_hmtx = _font["hmtx"]

def text_path(s, size, x, y, tracking=0.0):
    """Return (svg path d, advance width) for s with baseline at y."""
    pen = SVGPathPen(_gs)
    sc = size / _upm
    cx = 0.0
    for ch in s:
        g = _cmap.get(ord(ch))
        if g is None:
            continue
        tp = TransformPen(pen, (sc, 0, 0, -sc, x + cx, y))
        _gs[g].draw(tp)
        cx += _hmtx[g][0] * sc + tracking * size
    return pen.getCommands(), cx - tracking * size

def text_width(s, size, tracking=0.0):
    return text_path(s, size, 0, 0, tracking)[1]

# ---------------------------------------------------------------- emblem
def P(pts, fill, extra=""):
    return '<polygon points="%s" fill="%s"%s/>' % (" ".join("%g,%g" % p for p in pts), fill, extra)

def mir(p):
    return (1000 - p[0], p[1])

# skin shades: light from upper-left; right side gets the darker set
SKIN_L = ["#F6C49A", "#E9AC7E", "#D69466", "#B8784F", "#8E5A3C"]
SKIN_R = ["#E9AC7E", "#D69466", "#BF7F55", "#9C6442", "#774A31"]

def emblem(ring=True):
    """Low-poly head inside a faceted circle badge. 1000x1000 space, centre (500,500)."""
    o = []
    R = 372
    o.append('<defs><clipPath id="badge"><circle cx="500" cy="500" r="%d"/></clipPath></defs>' % R)
    # badge background: faceted navy disc
    o.append('<circle cx="500" cy="500" r="%d" fill="#121A2B"/>' % R)
    o.append('<g clip-path="url(#badge)">')
    rnd = random.Random(7)
    cols = ["#101827", "#131D30", "#172238", "#0E1522", "#1A2640"]
    ring_pts = [(500 + 430 * math.cos(a * math.pi / 6), 500 + 430 * math.sin(a * math.pi / 6)) for a in range(12)]
    mid_pts = [(500 + 230 * math.cos((a + .5) * math.pi / 6), 500 + 230 * math.sin((a + .5) * math.pi / 6)) for a in range(12)]
    for i in range(12):
        a, b = ring_pts[i], ring_pts[(i + 1) % 12]
        m, n = mid_pts[i], mid_pts[(i - 1) % 12]
        o.append(P([a, b, m], cols[i % 5]))
        o.append(P([a, m, n], cols[(i + 2) % 5]))
        o.append(P([(500, 500), m, n], cols[(i + 3) % 5]))
    # sun glint facets top-left (amber, subtle)
    o.append(P([(250, 250), (360, 170), (330, 300)], "#1E2A44"))

    # ---- shoulders / life vest (yellow), bottom of badge
    vest = [
        ([(140, 1000), (170, 830), (330, 770), (420, 800), (440, 1000)], "#FFC531"),
        ([(330, 770), (420, 800), (300, 880)], "#FFD95E"),
        ([(170, 830), (330, 770), (300, 880)], "#FFE07A"),
        ([(170, 830), (300, 880), (240, 1000), (140, 1000)], "#E6A81E"),
        ([(300, 880), (420, 800), (440, 1000), (240, 1000)], "#F2B526"),
    ]
    for pts, c in vest:
        o.append(P(pts, c))
    for pts, c in vest:
        dark = {"#FFC531": "#E0A21F", "#FFD95E": "#F0B830", "#FFE07A": "#F5C443", "#E6A81E": "#C88A12", "#F2B526": "#D9991A"}[c]
        o.append(P([mir(p) for p in pts], dark))
    # vest reflective stripe (white facets) + centre opening dark
    o.append(P([(185, 905), (320, 860), (330, 895), (200, 945)], "#F4F6FA"))
    o.append(P([mir(p) for p in [(185, 905), (320, 860), (330, 895), (200, 945)]], "#C9CFDA"))
    # neck
    o.append(P([(425, 700), (575, 700), (565, 820), (500, 850), (435, 820)], "#9C6442"))
    o.append(P([(435, 760), (500, 790), (500, 850), (435, 820)], "#B8784F"))
    o.append(P([(420, 800), (500, 860), (580, 800), (560, 1000), (440, 1000)], "#0E1522"))
    # vest collar raised
    o.append(P([(330, 770), (425, 760), (500, 860), (420, 820)], "#FFE07A"))
    o.append(P([mir(p) for p in [(330, 770), (425, 760), (500, 860), (420, 820)]], "#E0A21F"))

    # ---- ears
    ear = [(306, 452), (272, 462), (262, 520), (284, 568), (318, 575)]
    o.append(P(ear, SKIN_L[2]))
    o.append(P([(306, 470), (284, 482), (282, 530), (310, 548)], SKIN_L[3]))
    o.append(P([mir(p) for p in ear], SKIN_R[2]))
    o.append(P([mir(p) for p in [(306, 470), (284, 482), (282, 530), (310, 548)]], SKIN_R[3]))

    # ---- face facets (left side defined, mirrored for right)
    T, F1, FC = (305, 375), (400, 366), (500, 362)
    Bl, Bm, Bc = (318, 440), (410, 428), (470, 448)
    Ck, Cm = (304, 505), (392, 545)
    N1, N2, NW = (500, 445), (500, 590), (456, 588)
    J1, J2 = (322, 600), (372, 685)
    M, MC, CM = (440, 650), (500, 652), (500, 705)
    C1, C = (438, 740), (500, 756)
    tris = [
        ((T, F1, Bl), 1), ((F1, Bm, Bl), 0), ((F1, FC, Bm), 0), ((FC, Bc, Bm), 1), ((FC, N1, Bc), 0),
        ((T, Bl, Ck), 2), ((Bl, Cm, Ck), 1), ((Bl, Bm, Cm), 1), ((Bm, Bc, Cm), 1),
        ((Bc, N1, NW), 0), ((N1, N2, NW), 0), ((Bc, NW, Cm), 2),
        ((Ck, Cm, J1), 2), ((Cm, NW, M), 1), ((Cm, M, J1), 2), ((J1, M, J2), 3), ((J2, M, C1), 3),
        ((M, MC, CM), 2), ((M, CM, C1), 3), ((C1, CM, C), 2), ((NW, N2, MC), 1), ((NW, MC, M), 1),
    ]
    for pts, s in tris:
        o.append(P(pts, SKIN_L[s]))
        o.append(P([mir(p) for p in pts], SKIN_R[s]))
    # nose shadow facet on the right side
    o.append(P([(500, 460), (544, 588), (500, 596)], SKIN_R[3]))
    # stubble chin (darker facets)
    o.append(P([(440, 668), (500, 674), (560, 668), (552, 736), (500, 752), (448, 736)], "#7A4C33", ' opacity="0.55"'))

    # ---- hair (dark facets above bandana)
    HC, H1, H2, H3 = (500, 196), (382, 220), (318, 288), (300, 340)
    hair = [((HC, H1, (445, 300)), "#3A4459"), ((H1, H2, (445, 300)), "#2E3648"), ((H2, H3, (445, 300)), "#252C3B"),
            ((HC, (445, 300), (500, 300)), "#434E66")]
    for pts, c in hair:
        o.append(P(pts, c))
        o.append(P([mir(p) for p in pts], "#1C2230"))
    o.append(P([H3, (445, 300), (500, 300), (500, 330), (298, 345)], "#252C3B"))
    o.append(P([mir(p) for p in [H3, (445, 300), (500, 300), (500, 330), (298, 345)]], "#1C2230"))

    # ---- red bandana band across forehead
    bt = [(296, 318), (400, 296), (500, 290), (600, 296), (704, 318)]
    bb = [(304, 388), (400, 376), (500, 372), (600, 376), (696, 388)]
    reds = ["#FF6A5E", "#FF3B3B", "#FF3B3B", "#D92B2B", "#B81F24", "#D92B2B", "#A3191F", "#8E141A"]
    k = 0
    for i in range(4):
        o.append(P([bt[i], bt[i + 1], bb[i]], reds[min(2 * i, 7)]))
        o.append(P([bt[i + 1], bb[i + 1], bb[i]], reds[min(2 * i + 1, 7)]))
    # knot + tails on the right side
    o.append(P([(690, 320), (735, 335), (728, 372), (694, 380)], "#B81F24"))
    o.append(P([(728, 340), (790, 372), (770, 420), (722, 372)], "#D92B2B"))
    o.append(P([(722, 372), (770, 420), (735, 452)], "#8E141A"))
    o.append(P([(724, 350), (800, 330), (790, 372)], "#FF3B3B"))

    # ---- headlamp on the bandana
    lamp_c = (500, 332)
    hexo = [(lamp_c[0] + 50 * math.cos(math.pi / 6 + a * math.pi / 3), lamp_c[1] + 50 * math.sin(math.pi / 6 + a * math.pi / 3)) for a in range(6)]
    o.append(P(hexo, "#2A3142"))
    o.append(P([hexo[3], hexo[4], hexo[5], lamp_c], "#3B4558"))
    hexi = [(lamp_c[0] + 33 * math.cos(math.pi / 6 + a * math.pi / 3), lamp_c[1] + 33 * math.sin(math.pi / 6 + a * math.pi / 3)) for a in range(6)]
    lens = ["#FFB23D", "#FFC766", "#FFE3A3", "#FFF4D6", "#FFD27A", "#F29A1F"]
    for a in range(6):
        o.append(P([lamp_c, hexi[a], hexi[(a + 1) % 6]], lens[a]))

    # ---- brows (thick, angled down to centre = determined)
    brow = [(322, 432), (420, 410), (478, 438), (472, 458), (418, 436), (330, 452)]
    o.append(P(brow, "#1F2533"))
    o.append(P([mir(p) for p in brow], "#151A25"))
    # ---- eyes
    eye = [(348, 480), (398, 462), (456, 478), (442, 504), (380, 506)]
    o.append(P(eye, "#F4F6FA"))
    o.append(P([mir(p) for p in eye], "#DDE2EA"))
    iris = [(388, 466), (426, 468), (432, 502), (392, 504)]
    o.append(P(iris, "#0B0E14"))
    o.append(P([mir(p) for p in iris], "#0B0E14"))
    o.append(P([(392, 472), (410, 470), (400, 484)], "#FFFFFF"))
    o.append(P([mir(p) for p in [(408, 472), (426, 474), (416, 486)]], "#FFFFFF"))
    # ---- mouth: firm flat line, slight smirk
    o.append(P([(446, 652), (500, 644), (566, 634), (562, 650), (500, 658), (450, 664)], "#4A2416"))
    # ---- cheek scar/dirt facet (survival grit)
    o.append(P([(612, 520), (650, 512), (618, 532)], "#8E5A3C"))
    o.append('</g>')
    if ring:
        o.append('<circle cx="500" cy="500" r="%d" fill="none" stroke="%s" stroke-width="22"/>' % (R, LIME))
        # HUD tick marks on ring (top + red dot)
        o.append('<circle cx="500" cy="%d" r="15" fill="%s" stroke="%s" stroke-width="7"/>' % (500 - R, RED, NAVY))
    return "\n".join(o)

# ---------------------------------------------------------------- wordmark
def wordmark(x, y, size, stroke=True):
    """'SURVIVY GUY' with baseline at y. Returns (svg, width)."""
    t1, t2 = "SURVIVY", "GUY"
    tr = -0.01
    d1, w1 = text_path(t1, size, x, y, tr)
    gap = size * 0.24
    d2, w2 = text_path(t2, size, x + w1 + gap, y, tr)
    sw = size * 0.11
    s = []
    if stroke:
        s.append('<path d="%s %s" fill="#000" stroke="#000" stroke-width="%g" stroke-linejoin="round"/>' % (d1, d2, sw * 2))
    s.append('<path d="%s" fill="%s"/>' % (d1, WHITE))
    s.append('<path d="%s" fill="%s"/>' % (d2, LIME))
    W = w1 + gap + w2
    # underline HUD bar: red dot + lime bar
    by = y + size * 0.16
    bh = size * 0.12
    s.append('<rect x="%g" y="%g" width="%g" height="%g" rx="%g" fill="#000"/>' % (x - sw * .6, by - sw * .6, W + sw * 1.2, bh + sw * 1.2, (bh + sw) / 2))
    s.append('<rect x="%g" y="%g" width="%g" height="%g" rx="%g" fill="%s"/>' % (x + bh * 1.6, by, W - bh * 1.6, bh, bh / 2, LIME))
    s.append('<circle cx="%g" cy="%g" r="%g" fill="%s"/>' % (x + bh * .5, by + bh / 2, bh * .62, RED))
    return "\n".join(s), W

def svg_doc(w, h, body, bg=None):
    b = '<rect width="100%%" height="100%%" fill="%s"/>' % bg if bg else ""
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">%s\n%s\n</svg>' % (w, h, w, h, b, body))

def group(body, tx, ty, s):
    return '<g transform="translate(%g %g) scale(%g)">%s</g>' % (tx, ty, s, body)

def write(name, txt):
    with open(os.path.join(HERE, name), "w") as f:
        f.write(txt)

def png(svg_txt, name, w=None, h=None):
    cairosvg.svg2png(bytestring=svg_txt.encode(), write_to=os.path.join(HERE, name), output_width=w, output_height=h)

# ---------------------------------------------------------------- build
def main():
    E = emblem()
    # avatar: emblem scaled so the ring sits inside the inner ~80% circle
    av = svg_doc(1000, 1000, group(E, 500 - 500 * 1.04, 500 - 500 * 1.04, 1.04), bg=NAVY)
    write("avatar.svg", av)
    png(av, "avatar-800.png", 800, 800)

    # horizontal: emblem 1000 -> height 760; wordmark to the right
    size = 300
    wm, W = wordmark(0, 0, size)
    eh = 800
    pad = 40
    tx = pad + eh + 70
    total_w = tx + W + pad + 30
    H = eh + 2 * pad
    body = group(E, pad - eh * 0.05, pad - eh * 0.05, eh * 1.1 / 1000) + '<g transform="translate(%g %g)">%s</g>' % (tx, pad + eh / 2 + size * 0.30, wm)
    hz = svg_doc(int(total_w), int(H), body)
    write("logo-horizontal.svg", hz)
    png(hz, "logo-horizontal.png", 2000)

    # stacked
    sw_ = W + 120
    eh2 = 820
    H2 = eh2 + 60 + size + 140
    body = group(E, sw_ / 2 - eh2 / 2, 30, eh2 / 1000) + '<g transform="translate(%g %g)">%s</g>' % ((sw_ - W) / 2, 30 + eh2 + 30 + size * 0.73, wm)
    st = svg_doc(int(sw_), int(H2), body)
    write("logo-stacked.svg", st)
    png(st, "logo-stacked.png", 1200)

    # banner 2560x1440, safe area 1546x423 centred
    rnd = random.Random(11)
    facets = []
    cols = ["#0B111D", "#0D1422", "#0F1727", "#0A0F1A", "#111A2C", "#0C1320"]
    step = 160
    grid = {}
    for i in range(-1, 2560 // step + 2):
        for j in range(-1, 1440 // step + 2):
            grid[i, j] = (i * step + rnd.uniform(-55, 55), j * step + rnd.uniform(-55, 55))
    for i in range(-1, 2560 // step + 1):
        for j in range(-1, 1440 // step + 1):
            a, b, c, d = grid[i, j], grid[i + 1, j], grid[i, j + 1], grid[i + 1, j + 1]
            facets.append(P([a, b, d], rnd.choice(cols)))
            facets.append(P([a, d, c], rnd.choice(cols)))
    # lime accent shards
    facets.append(P([(0, 1440), (0, 1180), (260, 1440)], "#C8FF3D", ' opacity="0.10"'))
    facets.append(P([(2560, 0), (2560, 260), (2300, 0)], "#C8FF3D", ' opacity="0.10"'))
    bsize = 150
    wmb, Wb = wordmark(0, 0, bsize)
    ehb = 330
    logo_w = ehb + 50 + Wb
    lx = 1280 - logo_w / 2
    top = 720 - 423 / 2 + 6
    tag = "ONE DAY. ONE SURVIVAL RULE."
    tsize = 58
    td, tw = text_path(tag, tsize, 0, 0, 0.12)
    body = "\n".join(facets)
    body += group(E, lx - ehb * 0.03, top - ehb * 0.03, ehb * 1.06 / 1000)
    body += '<g transform="translate(%g %g)">%s</g>' % (lx + ehb + 50, top + ehb * 0.52, wmb)
    tx0 = lx + ehb + 50
    body += '<g transform="translate(%g %g)"><path d="%s" fill="#000" stroke="#000" stroke-width="10" stroke-linejoin="round"/><path d="%s" fill="%s"/></g>' % (tx0, top + ehb * 0.52 + bsize * 0.72, td, td, WHITE)
    bn = svg_doc(2560, 1440, body, bg=NAVY)
    write("banner-2560x1440.svg", bn)
    png(bn, "banner-2560x1440.png", 2560, 1440)
    print("banner logo width", logo_w, "tag width", tw, "wordmark", Wb)

    preview()

def circ(img, d):
    im = img.convert("RGBA").resize((d, d), Image.LANCZOS)
    m = Image.new("L", (d * 4, d * 4), 0)
    ImageDraw.Draw(m).ellipse((0, 0, d * 4 - 1, d * 4 - 1), fill=255)
    im.putalpha(m.resize((d, d), Image.LANCZOS))
    return im

def preview():
    W, H = 2400, 2050
    sheet = Image.new("RGBA", (W, H), "#1A2030")
    dr = ImageDraw.Draw(sheet)
    f = ImageFont.truetype(FONT, 34)
    def L(x, y, t):
        dr.text((x, y), t, font=f, fill="#C8FF3D")
    ld = lambda n: Image.open(os.path.join(HERE, n)).convert("RGBA")
    av = ld("avatar-800.png")
    L(60, 40, "AVATAR 800 (circle crop)")
    sheet.alpha_composite(circ(av, 520), (60, 100))
    L(640, 40, "SQUARE")
    sheet.alpha_composite(av.resize((300, 300), Image.LANCZOS), (640, 100))
    L(640, 440, "120 px")
    sheet.alpha_composite(circ(av, 120), (640, 490))
    L(840, 440, "48 px")
    sheet.alpha_composite(circ(av, 48), (840, 526))
    # on light bg too
    dr.rectangle((1000, 440, 1260, 640), fill="#F2F2F2")
    sheet.alpha_composite(circ(av, 120), (1020, 490))
    sheet.alpha_composite(circ(av, 48), (1170, 526))
    st = ld("logo-stacked.png")
    st.thumbnail((700, 700))
    L(1400, 40, "STACKED")
    sheet.alpha_composite(st, (1400, 100))
    hz = ld("logo-horizontal.png")
    hz.thumbnail((2280, 600))
    L(60, 700, "HORIZONTAL")
    sheet.alpha_composite(hz, (60, 760))
    bn = ld("banner-2560x1440.png")
    bn.thumbnail((1100, 700))
    L(60, 1360, "BANNER 2560x1440 (safe area outlined)")
    sheet.alpha_composite(bn, (60, 1410))
    s = 1100 / 2560
    dr.rectangle((60 + (2560 - 1546) / 2 * s, 1410 + (1440 - 423) / 2 * s, 60 + (2560 + 1546) / 2 * s, 1410 + (1440 + 423) / 2 * s), outline="#FF3B3B", width=2)
    # banner safe-area crop at full scale
    L(1240, 1360, "MOBILE SAFE AREA 1546x423")
    crop = ld("banner-2560x1440.png").crop(((2560 - 1546) // 2, (1440 - 423) // 2, (2560 + 1546) // 2, (1440 + 423) // 2))
    crop.thumbnail((1100, 400))
    sheet.alpha_composite(crop, (1240, 1410))
    sheet.convert("RGB").save(os.path.join(HERE, "preview-sheet.png"))

if __name__ == "__main__":
    main()
