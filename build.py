#!/usr/bin/env python3
"""Builds index.html from template.html and the photo lists below.

Add a photo: drop name.jpg (1800px long edge) and name-sm.jpg (800px) into
assets/img, add a line to the right list, then run:  python3 build.py
Each line is (file name without .jpg, caption, camera settings, filter tag).
A filter with no photos yet shows "coming soon" frames instead.
Each section has its own print: weddings are cut film negatives, portraits are
Polaroids, events are slide mounts, video sits on a cinema camera monitor.
Add names to ROLL / HERO to put them on the 3D film roll and behind the lens.
"""
import html, json, re, struct
from pathlib import Path

ROOT = Path(__file__).parent
IMG = ROOT / "assets/img"

# ---------- photos (empty for now) ----------
WEDDINGS = [
    # ("wedding-0001", "First look · Sydney", "f/2 · 1/500s · ISO 200 · 56mm", "ceremony"),
]
PORTRAITS = [
    # ("grad-0001", "Graduation day · Sydney", "f/2.8 · 1/400s · ISO 160 · 35mm", "grad-au"),
]
EVENTS = [
    # ("event-0001", "On stage · Sydney", "f/2 · 1/250s · ISO 1600 · 50mm", "event"),
]
VIDEO = [
    # ("tvc-0001", "Brand film · Sydney", "Director & editor", "tvc"),
]

FILTERS = {
    "WEDDINGS": [("all", "All"), ("ceremony", "Ceremony"), ("prewedding", "Pre-wedding")],
    "PORTRAITS": [("all", "All"), ("grad-au", "Graduation · Australia"), ("grad-vn", "Graduation · Vietnam"),
                  ("daily", "Daily portraits"), ("concept", "Concept"), ("cosplay", "Cosplay")],
    "EVENTS": [("all", "All"), ("event", "Events"), ("tour", "Tour guide")],
    "VIDEO": [("all", "All"), ("tvc", "TVC projects"), ("uni", "Uni projects")],
}

# ---------- contact (fill these in; empty ones are hidden) ----------
CONTACT = {
    "instagram": "hoquocphoto",   # handle without @
    "phone": "0449 516 023",
    "email": "",
}

ROLL = []   # up to 24 names for the 3D film roll; placeholder frames show while it's empty
HERO = []   # a few names to cycle behind the lens aperture
FEATURE = []   # portrait names the 3D instant camera prints, in order (placeholders while empty)
ABOUT_PHOTO = ""   # a photo of Quoc for the About section, e.g. "about-quoc" (a placeholder print while empty)

# how each section holds its photos (portraits use the Polaroid wall)
STYLE = {"WEDDINGS": "neg", "EVENTS": "slide", "VIDEO": "monitor"}


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


SECTIONS = {"WEDDINGS": WEDDINGS, "PORTRAITS": PORTRAITS, "EVENTS": EVENTS, "VIDEO": VIDEO}
ALL = {p[0]: p for items in SECTIONS.values() for p in items}
counter = iter(range(1, len(ALL) + 1))


def dressing(style, fr, label, role=""):
    """What goes around the photo: the film rebate, the slide mount label, or the camera monitor overlay."""
    if style == "neg":
        return f'<span class="ph__edge" aria-hidden="true"><b>HO QUOC 400</b><i>{fr} ▸ {fr}A</i></span>'
    if style == "slide":
        return f'<span class="ph__mount" aria-hidden="true"><b>HO QUOC</b><i>{html.escape(label)} · {fr}</i></span>'
    return (f'<span class="ph__hud" aria-hidden="true"><span class="ph__hud-top"><i class="ph__rec">REC</i><b>00:{fr}:00:00</b><em>4K · 24P</em></span>'
            f'<span class="ph__hud-bot"><i>ISO 800</i><i>180°</i><i>5600K</i>{f"<i>{html.escape(role)}</i>" if role else ""}<i class="ph__batt"></i></span></span>')


def figure(name, cap, exif, tag, style=None, fr=None, label=""):
    w, h = jpeg_size(IMG / f"{name}.jpg")
    cls = "ph ph--land" if w > h else "ph"
    alt = html.escape(cap.split(" · ")[0])
    extra = f' data-fr="{fr}" style="--ar:{w}/{h}"' if style else ""
    dress = dressing(style, fr, label, exif if style == "monitor" else "") if style else ""
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
    shapes = ["16/9", "16/9"] if style == "monitor" else ["3/2", "2/3"]
    soon = "Videos coming soon" if style == "monitor" else "Photos coming soon"
    out = []
    for i, (ar, fr) in enumerate(zip(shapes, frs)):
        inner = f'<span>{html.escape(label)}</span><small>{soon}</small>' if i == 0 else ("<small>Standby</small>" if style == "monitor" else "")
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
# until there are photos for the roll, it carries labelled blank frames, one per kind of shoot
ROLL_SOON = ["Weddings", "Pre-wedding", "Graduation", "Daily portraits", "Concept", "Cosplay", "Events", "Tour groups", "Brand video", "Uni projects"]
roll = frames(ROLL) or [{"cap": c, "w": 3 if i % 3 != 1 else 2, "h": 2 if i % 3 != 1 else 3} for i, c in enumerate(ROLL_SOON)]
out = out.replace("{{N_ROLL}}", str(len(roll)))
data = json.dumps({"roll": roll, "hero": frames(HERO)}, ensure_ascii=False)
out = out.replace("{{SCENE_DATA}}", data.replace("</", "<\\/"))
out = out.replace("{{FEATURE_DATA}}", json.dumps(frames(FEATURE), ensure_ascii=False).replace("</", "<\\/"))
assert not re.search(r"\{\{\w+\}\}", out), "unfilled placeholder"
(ROOT / "index.html").write_text(out)
print("index.html built:", {k: len(v) for k, v in SECTIONS.items()}, "| roll:", len(ROLL), "| hero:", len(HERO))
