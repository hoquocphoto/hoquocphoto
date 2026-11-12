#!/usr/bin/env python3
"""Builds index.html from template.html, albums.json and the photo lists below.

The galleries are albums: albums.json lists each album (section, title, place
line) and its photos, cover first. Each section dresses its album covers its
own way: weddings as film negatives, portraits as Polaroids, events as slide mounts.
The lists below (assets/img, 1800px + 800px -sm) are the hand-picked frames for
the 3D film roll, the lens, the film camera and the instant camera.
Run:  python3 build.py
"""
import html, json, re, struct
from pathlib import Path

ROOT = Path(__file__).parent
IMG = ROOT / "assets/img"

# ---------- photos ----------
WEDDINGS = [
    ('wedding-01', "The wedding day in Pyrmont", 'f/8 · 1/400s · ISO 500 · 41.4mm', 'ceremony'),
    ('wedding-02', "The wedding day in Pyrmont", 'f/8 · 1/320s · ISO 640 · 55mm', 'ceremony'),
    ('wedding-03', "The wedding day in Pyrmont", 'f/2.8 · 1/160s · ISO 1000 · 16mm', 'ceremony'),
    ('wedding-04', "The wedding day in Pyrmont", 'f/2.8 · 1/800s · ISO 500 · 37.6mm', 'ceremony'),
    ('wedding-05', "The wedding day in Pyrmont", 'f/8 · 1/640s · ISO 500 · 16mm', 'ceremony'),
    ('wedding-06', "The wedding day, on film", 'Shot on film', 'film'),
    ('wedding-07', "The wedding day, on film, at the Opera House", 'Shot on film', 'film'),
    ('wedding-08', "The wedding day, on film", 'Shot on film', 'film'),
    ('wedding-09', "The wedding day, on film", 'Shot on film', 'film'),
    ('wedding-10', "The wedding day, on film", 'Shot on film', 'film'),
    ('wedding-11', "The wedding day, on film", 'Shot on film', 'film'),
    ('wedding-12', "The wedding day, on film", 'Shot on film', 'film'),
    ('wedding-13', "The wedding day, on film", 'Shot on film', 'film'),
    ('wedding-14', "Pre-wedding by the Opera House", 'f/14 · 1/125s · ISO 500 · 16mm', 'prewedding'),
    ('wedding-15', "Pre-wedding by the Opera House", 'f/11 · 1/125s · ISO 500 · 22mm', 'prewedding'),
    ('wedding-16', "Pre-wedding at Circular Quay", 'f/14 · 1/125s · ISO 500 · 19.4mm', 'prewedding'),
]
PORTRAITS = [
    ('portrait-01', "Graduation day at UTS", 'f/4 · 1/100s · ISO 500 · 22.7mm', 'grad-au'),
    ('portrait-02', "Graduation day at UNSW", 'f/7.1 · 1/125s · ISO 500 · 19.4mm', 'grad-au'),
    ('portrait-03', "Graduation day under the sandstone at USYD", 'f/5.6 · 1/100s · ISO 500 · 53.3mm', 'grad-au'),
    ('portrait-04', "Graduation day under the sandstone at USYD", 'f/11 · 1/100s · ISO 500 · 17mm', 'grad-au'),
    ('portrait-05', "Graduation day at UOW", 'f/6.4 · 1/200s · ISO 500 · 16mm', 'grad-au'),
    ('portrait-06', "Graduation day at UNSW", 'f/16 · 1/125s · ISO 500 · 16mm', 'grad-au'),
    ('portrait-07', "Graduation day at UTS", 'f/5 · 1/80s · ISO 500 · 27.4mm', 'grad-au'),
    ('portrait-08', "Graduation day at Macquarie", 'f/8 · 1/125s · ISO 800 · 16mm', 'grad-au'),
    ('portrait-09', "Graduation day, back home in Vietnam", 'f/4 · 1/160s · ISO 500 · 55mm', 'grad-vn'),
    ('portrait-10', "Graduation day, back home in Vietnam", 'f/6.4 · 1/160s · ISO 500 · 44.1mm', 'grad-vn'),
    ('portrait-11', "Graduation day, back home in Vietnam", 'f/3.6 · 1/320s · ISO 500 · 37.6mm', 'grad-vn'),
    ('portrait-12', "Under the jacarandas", '', 'daily'),
    ('portrait-13', "The sails at golden hour", 'f/9 · 1/125s · ISO 500 · 53.3mm', 'daily'),
    ('portrait-14', "An afternoon in Hyde Park", 'f/11 · 1/125s · ISO 800 · 55mm', 'daily'),
    ('portrait-15', "The sails at golden hour", 'f/16 · 1/125s · ISO 800 · 23mm', 'daily'),
    ('portrait-16', "Under the bridge at Milsons Point", 'f/8 · 1/160s · ISO 500 · 16.5mm', 'daily'),
    ('portrait-17', "Under the jacarandas", 'f/5.6 · 1/200s · ISO 640 · 23mm', 'daily'),
    ('portrait-18', "Bougainvillea in full bloom", 'f/13 · 1/125s · ISO 640 · 23mm', 'daily'),
    ('portrait-19', "Looking across from McMahons Point", 'Shot on film', 'daily'),
    ('portrait-20', "Curls and harbour light", 'f/2 · 1/800s · ISO 500 · 75mm', 'daily'),
    ('portrait-21', "Kirribilli, by the water", '', 'daily'),
    ('portrait-22', "Harbour light", 'Shot on film', 'daily'),
    ('portrait-23', "Áo dài, a little piece of home", '', 'daily'),
    ('portrait-24', "Between the paths at the Botanic Garden", 'Shot on film', 'daily'),
    ('portrait-25', "Last light at Barangaroo", 'f/16 · 1/100s · ISO 800 · 55mm', 'daily'),
    ('portrait-26', "Train concept, somewhere between stops", '', 'concept'),
    ('portrait-27', "Idol cover concept in the city", '', 'concept'),
    ('portrait-28', "A day out on the harbour, yacht concept", '', 'concept'),
    ('portrait-29', "Out on the streets of Haymarket", 'f/20 · 1/160s · ISO 500 · 17mm', 'concept'),
    ('portrait-30', "Train concept, somewhere between stops", '', 'concept'),
    ('portrait-31', "Out on the streets of Haymarket", '1/160s · ISO 500 · 21mm', 'concept'),
    ('portrait-32', "In character", 'f/1.6 · 1/200s · ISO 500 · 75mm', 'cosplay'),
    ('portrait-33', "In character", 'f/1.6 · 1/250s · ISO 500 · 75mm', 'cosplay'),
    ('portrait-34', "In character", 'f/2 · 1/500s · ISO 500 · 85mm', 'cosplay'),
    ('portrait-35', "In character", 'f/1.6 · 1/250s · ISO 500 · 75mm', 'cosplay'),
]
EVENTS = [
    ('event-01', "A first birthday", 'f/3.2 · 1/100s · ISO 640 · 36.5mm', 'event'),
    ('event-02', "A first birthday", 'f/3.2 · 1/125s · ISO 640 · 34.2mm', 'event'),
    ('event-03', "A first birthday", 'f/4 · 1/100s · ISO 640 · 16mm', 'event'),
    ('event-04', "A family tour at the Opera House", 'f/14 · 1/100s · ISO 500 · 19.4mm', 'tour'),
    ('event-05', "Waiting for the ferry at Circular Quay", 'f/13 · 1/100s · ISO 500 · 24.2mm', 'tour'),
    ('event-06', "The bridge from McMahons Point", 'f/14 · 1/125s · ISO 500 · 18.7mm', 'tour'),
    ('event-07', "Sunset from Mrs Macquarie's Chair", 'f/11 · 1/125s · ISO 800 · 50mm', 'tour'),
    ('event-08', "Under the dome of the Queen Victoria Building", 'f/3.2 · 1/125s · ISO 500 · 30.2mm', 'tour'),
    ('event-09', "Through the lanes of The Rocks", 'f/16 · 1/100s · ISO 500 · 48.5mm', 'tour'),
    ('event-10', "After dark on the harbour", 'f/2.8 · 1/50s · ISO 6400 · 35.3mm', 'car'),
    ('event-11', "After dark on the harbour", 'f/2.8 · 1/50s · ISO 5000 · 17.6mm', 'car'),
    ('event-12', "After dark on the harbour", 'f/2.8 · 1/50s · ISO 5000 · 23.4mm', 'car'),
]

# ---------- contact (fill these in; empty ones are hidden) ----------
CONTACT = {
    "instagram": "hoquocphoto",   # handle without @
    "phone": "0449 516 023",
    "email": "",
}

ROLL = ['wedding-06', 'wedding-14', 'wedding-01', 'portrait-13', 'portrait-12', 'portrait-02', 'wedding-07', 'portrait-26', 'portrait-14', 'portrait-32', 'portrait-15', 'portrait-09', 'wedding-08', 'portrait-16', 'portrait-27', 'event-04', 'portrait-01', 'event-01', 'portrait-18', 'event-10', 'portrait-33', 'event-07', 'portrait-20', 'event-11']   # up to 24 names for the 3D film roll
HERO = ['wedding-06', 'portrait-12', 'portrait-15', 'portrait-01']   # a few names to cycle behind the lens aperture
FEATURE = ['portrait-12', 'portrait-13', 'portrait-14', 'portrait-20', 'portrait-26', 'portrait-03']   # portrait names the 3D instant camera prints, in order
FILMCAM = ['wedding-06', 'wedding-07', 'wedding-08', 'wedding-09', 'wedding-10', 'wedding-12']   # up to 6 wedding names for the 3D film camera's strip
ABOUT_PHOTO = ""   # a photo of Quoc for the About section, e.g. "about-quoc" (a placeholder print while empty)

def jpeg_size(path):
    """Width and height from a JPEG's SOF marker (no Pillow needed)."""
    with open(path, "rb") as f:
        f.read(2)
        while True:
            marker, length = struct.unpack(">2sH", f.read(4))
            if marker[1] in (0xC0, 0xC1, 0xC2):
                h, w = struct.unpack(">xHH", f.read(5))
                return w, h
            f.seek(length - 2, 1)


SECTIONS = {"WEDDINGS": WEDDINGS, "PORTRAITS": PORTRAITS, "EVENTS": EVENTS}
ALL = {p[0]: p for items in SECTIONS.values() for p in items}


# ---------- albums (albums.json, kept in step with albums/<album>/ by tools/sync_albums.py) ----------
ALBUMS = [a for a in json.loads((ROOT / "albums.json").read_text()) if a["photos"]]   # an emptied album drops off the page
for a in ALBUMS:
    for p in a["photos"]:
        p["w"], p["h"] = jpeg_size(ROOT / p["src"])


def srcset(p):
    return f'{p["src"]} {jpeg_size(ROOT / p["src"])[0]}w, {p["full"]} {jpeg_size(ROOT / p["full"])[0]}w'


def album_card(a, wide, first_n):
    ph = a["photos"]
    # the cover fits the card's shape: a landscape frame for a wide card, an upright one otherwise
    near = ph[:6]
    cover = next((p for p in near if (p["w"] > p["h"]) == wide), ph[0])
    behind = [p for p in ph if p is not cover][:2]
    title = html.escape(a["title"]) + (f' <em>{html.escape(a["em"])}</em>' if a["em"] else "")
    plain = html.escape(f'{a["title"]} {a["em"]}'.strip())
    stack = "".join(f'<img src="{p["src"]}" alt="" loading="lazy" decoding="async">' for p in behind)
    return f"""          <a class="album{' album--wide' if wide else ''}" href="#album-{a["slug"]}" data-album="{a["slug"]}" data-n="{first_n:03d}" data-exif="{html.escape(cover["exif"])}">
            <span class="album__pile"><span class="album__stack" aria-hidden="true">{stack}</span><span class="album__cover" data-exif="{html.escape(cover["exif"])}"><img src="{cover["src"]}" srcset="{srcset(cover)}" sizes="(max-width: 760px) 92vw, {'90vw' if wide else '46vw'}" width="{cover["w"]}" height="{cover["h"]}" alt="{plain}: album cover" loading="lazy" decoding="async"><span class="album__edge" aria-hidden="true">{plain}</span></span></span>
            <span class="album__meta"><b class="album__t">{title}</b><span class="album__note">{html.escape(a["note"])}</span><span class="album__sub">{html.escape(a["sub"])}</span><span class="album__go">Open album <span aria-hidden="true">→</span></span></span>
          </a>"""


def album_grid(section):
    mine = [a for a in ALBUMS if a["section"] == section]
    out, n = [], 1 + sum(len(a["photos"]) for a in ALBUMS[:ALBUMS.index(mine[0])])
    for i, a in enumerate(mine):
        out.append(album_card(a, i == 0 and len(mine) % 2 == 1, n))   # an odd count: the first album runs full width
        n += len(a["photos"])
    return "\n".join(out)


def frames(names):
    out = []
    for n in names:
        _, cap, exif, _ = ALL[n]
        w, h = jpeg_size(IMG / f"{n}-sm.jpg")
        out.append({"src": f"assets/img/{n}-sm.jpg", "full": f"assets/img/{n}.jpg", "cap": cap, "exif": exif, "w": w, "h": h})
    return out


out = (ROOT / "template.html").read_text()
for key in SECTIONS:
    out = out.replace(f"{{{{ALBUMS_{key}}}}}", album_grid(key))
album_data = {a["slug"]: {"title": a["title"], "em": a["em"], "sub": a["sub"], "note": a["note"],
                          "photos": [[p["src"], p["full"], p["w"], p["h"], p["cap"], p["exif"]] for p in a["photos"]]} for a in ALBUMS}
out = out.replace("{{ALBUM_DATA}}", json.dumps(album_data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/"))
IG_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/></svg>'
PH_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.5h3l1.5 4.2-2 1.3a12 12 0 0 0 5.9 5.9l1.3-2 4.2 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
MAIL_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 7l8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
def card(href, icon, small, big, extra=""):
    return f"""          <a class="reach__card{extra}" href="{href}"{' target="_blank" rel="noopener"' if href.startswith('http') else ''}>
            <span class="reach__icon">{icon}</span>
            <span class="reach__text"><small>{small}</small><b>{html.escape(big)}</b></span>
            <span class="reach__go" aria-hidden="true">{'↗' if href.startswith('http') else '→'}</span>
          </a>"""
cards = []
if CONTACT["instagram"]:
    h = CONTACT["instagram"].lstrip("@")
    cards.append(card(f"https://www.instagram.com/{h}/", IG_SVG, "DM me on Instagram", "@" + h, " reach__card--ig"))
if CONTACT["phone"]:
    num = re.sub(r"[^0-9+]", "", CONTACT["phone"])
    intl = "+61" + num[1:] if num.startswith("0") else num   # Australian mobile, so it works from overseas too
    cards.append(f"""          <div class="reach__card reach__card--phone">
            <span class="reach__icon">{PH_SVG}</span>
            <span class="reach__text"><small>Call or text</small><a href="tel:{intl}"><b>{html.escape(CONTACT["phone"])}</b></a></span>
            <span class="reach__acts"><a href="tel:{intl}">Call</a><a href="sms:{intl}">Text</a></span>
          </div>""")
if CONTACT["email"]:
    cards.append(card("mailto:" + CONTACT["email"], MAIL_SVG, "Email me", CONTACT["email"]))
if not cards:
    cards.append('          <div class="reach__card reach__card--soon"><span class="reach__text"><small>Contact</small><b>Details coming soon</b></span></div>')
out = out.replace("{{CONTACT_CARDS}}", "\n".join(cards))
if CONTACT["phone"]:
    out = out.replace("{{PHONE_LINE}}", f' Or call or text me on <a href="tel:{intl}">{html.escape(CONTACT["phone"])}</a>.')
    out = out.replace("{{PHONE_FOOT}}", f' · <a href="tel:{intl}">{html.escape(CONTACT["phone"])}</a>')
else:
    out = out.replace("{{PHONE_LINE}}", "").replace("{{PHONE_FOOT}}", "")
if ABOUT_PHOTO:
    w, h = jpeg_size(IMG / f"{ABOUT_PHOTO}-sm.jpg")
    about_img = f'<img src="assets/img/{ABOUT_PHOTO}-sm.jpg" srcset="assets/img/{ABOUT_PHOTO}-sm.jpg 800w, assets/img/{ABOUT_PHOTO}.jpg 1800w" sizes="(max-width: 960px) 80vw, 34vw" width="{w}" height="{h}" alt="Anh Quoc Ho with his camera" loading="lazy" decoding="async">'
else:
    about_img = '<div class="about__soon"><span>photo of me<br>coming soon</span></div>'
out = out.replace("{{ABOUT_PHOTO}}", about_img)
# until there are photos for the roll, it carries labelled blank frames, one per kind of shoot
ROLL_SOON = ["Weddings", "Pre-wedding", "Graduation", "Daily portraits", "Concept", "Cosplay", "Events", "Tour groups", "Car shoots"]
roll = frames(ROLL) or [{"cap": c, "w": 3 if i % 3 != 1 else 2, "h": 2 if i % 3 != 1 else 3} for i, c in enumerate(ROLL_SOON)]
out = out.replace("{{N_ROLL}}", str(len(roll)))
data = json.dumps({"roll": roll, "hero": frames(HERO)}, ensure_ascii=False)
out = out.replace("{{SCENE_DATA}}", data.replace("</", "<\\/"))
out = out.replace("{{FEATURE_DATA}}", json.dumps(frames(FEATURE), ensure_ascii=False).replace("</", "<\\/"))
out = out.replace("{{FILMCAM_DATA}}", json.dumps(frames(FILMCAM), ensure_ascii=False).replace("</", "<\\/"))
assert not re.search(r"\{\{\w+\}\}", out), "unfilled placeholder"
(ROOT / "index.html").write_text(out)
print("index.html built:", {a["slug"]: len(a["photos"]) for a in ALBUMS}, "| roll:", len(ROLL), "| hero:", len(HERO))
