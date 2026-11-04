#!/usr/bin/env python3
"""Builds index.html from template.html and the photo lists below.

Add a photo: drop name.jpg (1800px long edge) and name-sm.jpg (800px) into
assets/img, add a line to the right list, then run:  python3 build.py
Each line is (file name without .jpg, caption, camera settings, filter tag).
A filter with no photos yet shows "coming soon" frames instead.
Each section has its own print: weddings are cut film negatives, portraits are
Polaroids and events are slide mounts.
Add names to ROLL / HERO to put them on the 3D film roll and behind the lens.
"""
import html, json, re, struct
from pathlib import Path

ROOT = Path(__file__).parent
IMG = ROOT / "assets/img"

# ---------- photos ----------
WEDDINGS = [
    ('wedding-01', 'Wedding day · Pyrmont', 'f/8 · 1/400s · ISO 500 · 41.4mm', 'ceremony'),
    ('wedding-02', 'Wedding day · Pyrmont', 'f/8 · 1/320s · ISO 640 · 55mm', 'ceremony'),
    ('wedding-03', 'Wedding day · Pyrmont', 'f/2.8 · 1/160s · ISO 1000 · 16mm', 'ceremony'),
    ('wedding-04', 'Wedding day · Pyrmont', 'f/2.8 · 1/800s · ISO 500 · 37.6mm', 'ceremony'),
    ('wedding-05', 'Wedding day · Pyrmont', 'f/8 · 1/640s · ISO 500 · 16mm', 'ceremony'),
    ('wedding-06', 'Wedding day · Sydney', 'Shot on film', 'film'),
    ('wedding-07', 'Wedding day · Sydney Opera House', 'Shot on film', 'film'),
    ('wedding-08', 'Wedding day · Sydney', 'Shot on film', 'film'),
    ('wedding-09', 'Wedding day · Sydney', 'Shot on film', 'film'),
    ('wedding-10', 'Wedding day · Sydney', 'Shot on film', 'film'),
    ('wedding-11', 'Wedding day · Sydney', 'Shot on film', 'film'),
    ('wedding-12', 'Wedding day · Sydney', 'Shot on film', 'film'),
    ('wedding-13', 'Wedding day · Sydney', 'Shot on film', 'film'),
    ('wedding-14', 'Pre-wedding · Sydney Opera House', 'f/14 · 1/125s · ISO 500 · 16mm', 'prewedding'),
    ('wedding-15', 'Pre-wedding · Sydney Opera House', 'f/11 · 1/125s · ISO 500 · 22mm', 'prewedding'),
    ('wedding-16', 'Pre-wedding · Circular Quay', 'f/14 · 1/125s · ISO 500 · 19.4mm', 'prewedding'),
]
PORTRAITS = [
    ('portrait-01', 'Graduation · Sydney', 'f/4 · 1/100s · ISO 500 · 22.7mm', 'grad-au'),
    ('portrait-02', 'Graduation · UNSW', 'f/7.1 · 1/125s · ISO 500 · 19.4mm', 'grad-au'),
    ('portrait-03', 'Graduation · University of Sydney', 'f/5.6 · 1/100s · ISO 500 · 53.3mm', 'grad-au'),
    ('portrait-04', 'Graduation · University of Sydney', 'f/11 · 1/100s · ISO 500 · 17mm', 'grad-au'),
    ('portrait-05', 'Graduation · UOW', 'f/6.4 · 1/200s · ISO 500 · 16mm', 'grad-au'),
    ('portrait-06', 'Graduation · UNSW', 'f/16 · 1/125s · ISO 500 · 16mm', 'grad-au'),
    ('portrait-07', 'Graduation · Sydney', 'f/5 · 1/80s · ISO 500 · 27.4mm', 'grad-au'),
    ('portrait-08', 'Graduation · Macquarie University', 'f/8 · 1/125s · ISO 800 · 16mm', 'grad-au'),
    ('portrait-09', 'Graduation · Vietnam', 'f/4 · 1/160s · ISO 500 · 55mm', 'grad-vn'),
    ('portrait-10', 'Graduation · Vietnam', 'f/6.4 · 1/160s · ISO 500 · 44.1mm', 'grad-vn'),
    ('portrait-11', 'Graduation · Vietnam', 'f/3.6 · 1/320s · ISO 500 · 37.6mm', 'grad-vn'),
    ('portrait-12', 'Jacaranda season · Sydney', '', 'daily'),
    ('portrait-13', 'Portrait · Sydney Opera House', 'f/9 · 1/125s · ISO 500 · 53.3mm', 'daily'),
    ('portrait-14', 'Portrait · Hyde Park', 'f/11 · 1/125s · ISO 800 · 55mm', 'daily'),
    ('portrait-15', 'Golden hour · Sydney Opera House', 'f/16 · 1/125s · ISO 800 · 23mm', 'daily'),
    ('portrait-16', 'Harbour portrait · Milsons Point', 'f/8 · 1/160s · ISO 500 · 16.5mm', 'daily'),
    ('portrait-17', 'Jacaranda season · Sydney', 'f/5.6 · 1/200s · ISO 640 · 23mm', 'daily'),
    ('portrait-18', 'Bougainvillea · Sydney', 'f/13 · 1/125s · ISO 640 · 23mm', 'daily'),
    ('portrait-19', 'Harbour portrait · McMahons Point', 'Shot on film', 'daily'),
    ('portrait-20', 'Portrait · by the water', 'f/2 · 1/800s · ISO 500 · 75mm', 'daily'),
    ('portrait-21', 'Portrait · Kirribilli', '', 'daily'),
    ('portrait-22', 'Harbour portrait · Sydney', 'Shot on film', 'daily'),
    ('portrait-23', 'Áo dài portrait', '', 'daily'),
    ('portrait-24', 'Royal Botanic Garden · Sydney', 'Shot on film', 'daily'),
    ('portrait-25', 'Golden hour · Barangaroo', 'f/16 · 1/100s · ISO 800 · 55mm', 'daily'),
    ('portrait-26', 'Train concept · Sydney', '', 'concept'),
    ('portrait-27', 'Idol concept · Sydney CBD', '', 'concept'),
    ('portrait-28', 'Yacht shoot · Sydney Harbour', '', 'concept'),
    ('portrait-29', 'Street shoot · Haymarket', 'f/20 · 1/160s · ISO 500 · 17mm', 'concept'),
    ('portrait-30', 'Train concept · Sydney', '', 'concept'),
    ('portrait-31', 'Street shoot · Haymarket', '1/160s · ISO 500 · 21mm', 'concept'),
    ('portrait-32', 'Cosplay · Sydney', 'f/1.6 · 1/200s · ISO 500 · 75mm', 'cosplay'),
    ('portrait-33', 'Cosplay · Sydney', 'f/1.6 · 1/250s · ISO 500 · 75mm', 'cosplay'),
    ('portrait-34', 'Cosplay · Sydney', 'f/2 · 1/500s · ISO 500 · 85mm', 'cosplay'),
    ('portrait-35', 'Cosplay · Sydney', 'f/1.6 · 1/250s · ISO 500 · 75mm', 'cosplay'),
]
EVENTS = [
    ('event-01', 'First birthday party · Sydney', 'f/3.2 · 1/100s · ISO 640 · 36.5mm', 'event'),
    ('event-02', 'First birthday party · Sydney', 'f/3.2 · 1/125s · ISO 640 · 34.2mm', 'event'),
    ('event-03', 'First birthday party · Sydney', 'f/4 · 1/100s · ISO 640 · 16mm', 'event'),
    ('event-04', 'Family tour · Sydney Opera House', 'f/14 · 1/100s · ISO 500 · 19.4mm', 'tour'),
    ('event-05', 'Family tour · Circular Quay', 'f/13 · 1/100s · ISO 500 · 24.2mm', 'tour'),
    ('event-06', 'Family tour · McMahons Point', 'f/14 · 1/125s · ISO 500 · 18.7mm', 'tour'),
    ('event-07', "Sunset · Mrs Macquarie's Chair", 'f/11 · 1/125s · ISO 800 · 50mm', 'tour'),
    ('event-08', 'Family tour · Queen Victoria Building', 'f/3.2 · 1/125s · ISO 500 · 30.2mm', 'tour'),
    ('event-09', 'Family tour · The Rocks', 'f/16 · 1/100s · ISO 500 · 48.5mm', 'tour'),
    ('event-10', 'Night car shoot · Sydney Harbour', 'f/2.8 · 1/50s · ISO 6400 · 35.3mm', 'car'),
    ('event-11', 'Night car shoot · Sydney Harbour', 'f/2.8 · 1/50s · ISO 5000 · 17.6mm', 'car'),
    ('event-12', 'Night car shoot · Sydney Harbour', 'f/2.8 · 1/50s · ISO 5000 · 23.4mm', 'car'),
]

FILTERS = {
    "WEDDINGS": [("all", "All"), ("ceremony", "Wedding day"), ("film", "On film"), ("prewedding", "Pre-wedding")],
    "PORTRAITS": [("all", "All"), ("grad-au", "Graduation · Australia"), ("grad-vn", "Graduation · Vietnam"),
                  ("daily", "Daily portraits"), ("concept", "Concept"), ("cosplay", "Cosplay")],
    "EVENTS": [("all", "All"), ("event", "Events"), ("tour", "Tour guide"), ("car", "Car shoots")],
}

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
INSTANT_PHOTO = "portrait-15"   # the instant print that develops in the transition into portraits
ABOUT_PHOTO = ""   # a photo of Quoc for the About section, e.g. "about-quoc" (a placeholder print while empty)

# how each section holds its photos (portraits use the Polaroid wall)
STYLE = {"WEDDINGS": "neg", "EVENTS": "slide"}


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
counter = iter(range(1, len(ALL) + 1))


def dressing(style, fr, label):
    """What goes around the photo: the film rebate or the slide mount label."""
    if style == "neg":
        return f'<span class="ph__edge" aria-hidden="true"><b>HO QUOC 400</b><i>{fr} ▸ {fr}A</i></span>'
    return f'<span class="ph__mount" aria-hidden="true"><b>HO QUOC</b><i>{html.escape(label)} · {fr}</i></span>'


def figure(name, cap, exif, tag, style=None, fr=None, label=""):
    w, h = jpeg_size(IMG / f"{name}.jpg")
    cls = "ph ph--land" if w > h else "ph"
    alt = html.escape(cap.split(" · ")[0])
    extra = f' data-fr="{fr}" style="--ar:{w}/{h}"' if style else ""
    dress = dressing(style, fr, label) if style else ""
    cap, exif = html.escape(cap), html.escape(exif)
    n = next(counter)
    return f"""          <figure class="{cls}" data-tag="{tag}" data-n="{n:03d}"{extra}>
            <a href="assets/img/{name}.jpg" data-cap="{cap}" data-exif="{exif}"><img src="assets/img/{name}-sm.jpg" srcset="assets/img/{name}-sm.jpg 800w, assets/img/{name}.jpg 1800w" sizes="(max-width: 700px) 50vw, 33vw" width="{w}" height="{h}" alt="{alt}" loading="lazy" decoding="async"></a>
            <figcaption>{alt}</figcaption>{dress}
          </figure>"""


def placeholder(tag, label):
    return f"""          <figure class="ph ph--empty" data-tag="{tag}">
            <div class="ph__soon"><span>{html.escape(label)}</span><small>Photos coming soon</small></div>
          </figure>"""


def blanks(style, tag, label, frs):
    """Two empty prints per filter until the photos come in, the first one labelled."""
    shapes = ["3/2", "2/3"]
    out = []
    for i, (ar, fr) in enumerate(zip(shapes, frs)):
        inner = f'<span>{html.escape(label)}</span><small>Photos coming soon</small>' if i == 0 else ""
        land = " ph--land" if ar != "2/3" else ""
        out.append(f"""          <figure class="ph ph--empty{land}" data-tag="{tag}" data-fr="{fr}" style="--ar:{ar}">
            <div class="ph__soon">{inner}</div>{dressing(style, fr, label)}
          </figure>""")
    return out


def grid(key, items):
    style = STYLE.get(key)
    if not style:
        out = [figure(*p) for p in items]
        have = {p[3] for p in items}
        out += [placeholder(v, label) for v, label in FILTERS[key] if v != "all" and v not in have]
        return "\n".join(out)
    labels = dict(FILTERS[key])
    frame = iter(range(1, 999))
    fr = lambda: f"{next(frame):02d}"
    out = [figure(*p, style=style, fr=fr(), label=labels.get(p[3], "")) for p in items]
    have = {p[3] for p in items}
    for v, label in FILTERS[key]:
        if v != "all" and v not in have:
            out += blanks(style, v, label, [fr(), fr()])
    return "\n".join(out)


def chips(key):
    return "\n".join(
        f'            <button class="chip{" is-on" if v == "all" else ""}" data-filter="{v}" aria-pressed="{str(v == "all").lower()}">{label}</button>'
        for v, label in FILTERS[key])


def frames(names):
    out = []
    for n in names:
        _, cap, exif, _ = ALL[n]
        w, h = jpeg_size(IMG / f"{n}-sm.jpg")
        out.append({"src": f"assets/img/{n}-sm.jpg", "full": f"assets/img/{n}.jpg", "cap": cap, "exif": exif, "w": w, "h": h})
    return out


out = (ROOT / "template.html").read_text()
for key, items in SECTIONS.items():
    out = out.replace(f"{{{{{key}}}}}", grid(key, items))
    out = out.replace(f"{{{{CHIPS_{key}}}}}", chips(key))
    out = out.replace(f"{{{{N_{key}}}}}", f"{len(items):02d}")
out = out.replace("{{N_ALL}}", f"{len(ALL):03d}")
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
out = out.replace("{{INSTANT_PHOTO}}", f'<img class="instant__scene" src="assets/img/{INSTANT_PHOTO}-sm.jpg" alt="" decoding="async">')
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
print("index.html built:", {k: len(v) for k, v in SECTIONS.items()}, "| roll:", len(ROLL), "| hero:", len(HERO))
