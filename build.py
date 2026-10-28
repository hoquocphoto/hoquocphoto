#!/usr/bin/env python3
"""Builds index.html from template.html and the photo lists below.

Add a photo: drop name.jpg (1800px long edge) and name-sm.jpg (800px) into
assets/img, add a line to the right list, then run:  python3 build.py
Each line is (file name without .jpg, caption, camera settings, filter tag).
Add the name to ROLL as well to put it on the 3D film roll.
"""
import html, json, re, struct
from pathlib import Path

ROOT = Path(__file__).parent
IMG = ROOT / "assets/img"

SCENERY = [
    ("sydney-4407", "Opera House after sunset · Sydney", "f/3.6 · 1/26s · ISO 6400 · 16mm", "sydney"),
    ("ninhbinh-9334", "Pagoda reflected in the pond · Ninh Bình", "f/5.6 · 1/80s · ISO 80 · 22mm", "vietnam"),
    ("hoian-4516", "Lantern shop · Hội An", "f/5.6 · 1/60s · ISO 4000 · 21mm", "vietnam"),
    ("harbour-5341", "Harbour at golden hour · Sydney", "f/4.5 · 1/105s · ISO 320 · 21mm", "sydney"),
    ("sydney-4376", "Office towers · Sydney CBD", "f/5 · 1/125s · ISO 2000 · 16mm", "sydney"),
    ("ninhbinh-9301", "Temple gate · Ninh Bình", "f/5.6 · 1/250s · ISO 200 · 45mm", "vietnam"),
    ("harbour-5284", "Afternoon sun on the water · Sydney", "f/13 · 1/400s · ISO 320 · 45mm", "sydney"),
    ("sydney-4417", "Harbour Bridge at night · Sydney", "f/4.7 · 1/7s · ISO 6400 · 30mm", "sydney"),
    ("elsewhere-4649", "Towers in Lujiazui · Shanghai", "f/4.4 · 1/125s · ISO 200 · 26mm", "abroad"),
    ("hoian-4536", "Old town at night · Hội An", "f/5.6 · 1/60s · ISO 8000 · 45mm", "vietnam"),
    ("harbour-5313", "Harbour Bridge from the rocks · Sydney", "f/13 · 1/120s · ISO 640 · 40mm", "sydney"),
    ("ninhbinh-9316", "Walkway between the cliffs · Ninh Bình", "f/5.6 · 1/80s · ISO 80 · 15mm", "vietnam"),
    ("harbour-5355", "Harbour after sunset · Sydney", "f/4.9 · 1/100s · ISO 2500 · 32mm", "sydney"),
    ("elsewhere-4629", "Skyline · Shanghai", "f/4.5 · 1/180s · ISO 80 · 28mm", "abroad"),
    ("sydney-4412", "City skyline at dusk · Sydney", "f/5.2 · 1/17s · ISO 6400 · 38mm", "sydney"),
    ("ninhbinh-9326", "Temple by the lake · Ninh Bình", "f/5.6 · 1/80s · ISO 80 · 40mm", "vietnam"),
    ("harbour-5287", "Climbing the rocks · Sydney", "f/13 · 1/100s · ISO 320 · 20mm", "sydney"),
    ("hoian-4521", "Lantern stall · Hội An", "f/5.6 · 1/60s · ISO 2000 · 15mm", "vietnam"),
    ("sydney-4251", "Opera House at midday · Sydney", "f/5.6 · 1/250s · ISO 500 · 37mm", "sydney"),
    ("elsewhere-4670", "Canal in a water town · near Shanghai", "f/4.4 · 1/125s · ISO 400 · 24mm", "abroad"),
    ("ninhbinh-9347", "Looking out at the pagoda · Ninh Bình", "f/4.5 · 1/180s · ISO 200 · 15mm", "vietnam"),
    ("harbour-5357", "The city at dusk · Sydney", "f/5.6 · 1/85s · ISO 12800 · 45mm", "sydney"),
    ("sydney-4236", "Harbour Bridge on a clear day · Sydney", "f/5.6 · 1/250s · ISO 500 · 23mm", "sydney"),
    ("ninhbinh-9351", "Temple rooftops · Ninh Bình", "f/4.9 · 1/180s · ISO 400 · 33mm", "vietnam"),
    ("harbour-5334", "Last light on the harbour · Sydney", "f/5.6 · 1/320s · ISO 320 · 26mm", "sydney"),
    ("elsewhere-4745", "Feeding the koi · near Shanghai", "f/5.6 · 1/60s · ISO 1000 · 44mm", "abroad"),
    ("elsewhere-4558", "Tree-lined street · Shanghai", "f/5.6 · 1/60s · ISO 250 · 35mm", "abroad"),
]
PEOPLE = [
    ("ivy-5378", "Sitting on the ledge · USyd", "f/7.1 · 1/170s · ISO 320 · 15mm", "concept"),
    ("grad-4198", "Graduation day in áo dài · USyd", "f/18 · 1/125s · ISO 160 · 58mm", "graduation"),
    ("ivy-5413", "On the steps · USyd", "f/5.6 · 1/140s · ISO 1600 · 45mm", "portrait"),
    ("mqgrad-4761", "Graduation portrait · Macquarie", "f/22 · 1/125s · ISO 2000 · 35mm", "graduation"),
    ("ivy-5414", "Chin on hand, close · USyd", "f/5.6 · 1/140s · ISO 2000 · 45mm", "portrait"),
    ("ivy-5450", "On the lawn · USyd", "f/7.1 · 1/150s · ISO 320 · 21mm", "concept"),
    ("grad-4310", "On the bench · USyd graduation", "f/22 · 1/125s · ISO 12800 · 86mm", "graduation"),
    ("ivy-5400", "In the courtyard · USyd", "f/5.6 · 1/125s · ISO 800 · 42mm", "portrait"),
    ("mqgrad-5091", "By the fountain · Macquarie", "f/5.6 · 1/240s · ISO 320 · 42mm", "graduation"),
    ("ivy-5385", "In front of the Quad · USyd", "f/7.1 · 1/150s · ISO 320 · 23mm", "concept"),
    ("grad-4422", "Flowers and sunglasses · USyd graduation", "f/20 · 1/60s · ISO 160 · 55mm", "graduation"),
    ("ivy-5389", "Sitting in the sun · USyd", "f/6.4 · 1/160s · ISO 320 · 23mm", "portrait"),
    ("ivy-5493", "Under the arch · USyd", "f/5.6 · 1/160s · ISO 320 · 16mm", "concept"),
    ("mqgrad-4889", "Celebrating · Macquarie", "f/22 · 1/125s · ISO 1600 · 33mm", "graduation"),
    ("ivy-5420", "By the railing · USyd", "f/5.6 · 1/140s · ISO 800 · 45mm", "portrait"),
    ("grad-4549", "Celebrating · USyd graduation", "f/5.6 · 1/1250s · ISO 320 · 58mm", "graduation"),
    ("ivy-5504", "On the path to the Quad · USyd", "f/6.4 · 1/160s · ISO 320 · 17mm", "concept"),
    ("mqgrad-5123", "The stole, from behind · Macquarie", "f/5.6 · 1/150s · ISO 160 · 30mm", "graduation"),
    ("grad-4232", "In front of the Quad · USyd graduation", "f/22 · 1/125s · ISO 320 · 55mm", "graduation"),
    ("ivy-5426", "By the stair rail · USyd", "f/5.6 · 1/140s · ISO 800 · 45mm", "portrait"),
    ("ivy-5411", "Sitting on the stairs · USyd", "f/5.6 · 1/140s · ISO 2000 · 45mm", "concept"),
    ("grad-4386", "In the Quad · USyd graduation", "f/22 · 1/100s · ISO 400 · 58mm", "graduation"),
    ("ivy-5488", "Arch and tower · USyd", "f/6.4 · 1/150s · ISO 320 · 15mm", "concept"),
    ("mqgrad-4605", "Surrounded by flowers · Macquarie", "f/16 · 1/60s · ISO 320 · 32mm", "graduation"),
    ("grad-4459", "Group photo · USyd graduation", "f/14 · 1/60s · ISO 320 · 58mm", "graduation"),
    ("ivy-5393", "Close-up in the sun · USyd", "f/5.6 · 1/160s · ISO 320 · 29mm", "portrait"),
    ("mqgrad-4985", "Group photo · Macquarie", "f/22 · 1/125s · ISO 3200 · 41mm", "graduation"),
    ("grad-4327", "On the bench · USyd graduation", "f/22 · 1/125s · ISO 12800 · 90mm", "graduation"),
    ("ivy-5425", "On the stairs · USyd", "f/4.5 · 1/110s · ISO 320 · 19mm", "concept"),
    ("ivy-5484", "In the shade · USyd", "f/7.1 · 1/150s · ISO 320 · 15mm", "concept"),
    ("ivy-5521", "By the lamppost · USyd", "f/7.1 · 1/160s · ISO 320 · 18mm", "concept"),
]
EVENTS = [
    ("stage-4156", "Dance performance · Serenade '24", "f/5.6 · 1/250s · ISO 4000 · 45mm", "stage"),
    ("sydneygo-1023", "All the teams · Sydney Go 2026", "f/3.5 · 1/100s · ISO 400 · 15mm", "community"),
    ("daihoi-4066", "Delegates with certificates · Đại hội 2026", "f/3.5 · 1/100s · ISO 2500 · 15mm", "conference"),
    ("events-0320", "Volleyball · UAVS Sports Day 2026", "f/4 · 1/250s · ISO 3200 · 50mm", "sport"),
    ("hack-9590", "Presenting · Hackathon 2026", "f/4.2 · 1/160s · ISO 2000 · 122mm", "conference"),
    ("cultural-8478", "Making rice paper rolls · Cultural Day 2025", "f/4.4 · 1/60s · ISO 1250 · 26mm", "community"),
    ("events-3138", "With the sponsor · Sydney Go 2026", "f/4 · 1/500s · ISO 1250 · 32mm", "community"),
    ("stage-4146", "On stage · Serenade '24", "f/5.6 · 1/250s · ISO 4000 · 45mm", "stage"),
    ("hack-9596", "Taking a break · Hackathon 2026", "f/3.8 · 1/160s · ISO 2000 · 78mm", "conference"),
    ("sydneygo-1087", "Solving a clue · Sydney Go 2026", "f/5.6 · 1/60s · ISO 1000 · 36mm", "community"),
    ("cultural-8460", "Rolling gỏi cuốn · Cultural Day 2025", "f/5.6 · 1/80s · ISO 2500 · 43mm", "community"),
    ("events-0297", "Basketball · UAVS Sports Day 2026", "f/4 · 1/250s · ISO 3200 · 50mm", "sport"),
    ("daihoi-4020", "Group photo · Đại hội 2026", "f/4.2 · 1/40s · ISO 3200 · 22mm", "conference"),
    ("stage-4166", "The finale · Serenade '24", "f/5.2 · 1/250s · ISO 4000 · 38mm", "stage"),
    ("events-3155", "Everyone at the end · Sydney Go 2026", "f/7.1 · 1/125s · ISO 1250 · 18mm", "community"),
    ("hack-9616", "A team at their table · Hackathon 2026", "f/3.5 · 1/250s · ISO 1250 · 55mm", "conference"),
    ("cultural-8315", "The ingredients · Cultural Day 2025", "f/5 · 1/160s · ISO 2500 · 35mm", "community"),
    ("sydneygo-1041", "Reading the clue · Sydney Go 2026", "f/5.6 · 1/60s · ISO 800 · 33mm", "community"),
    ("daihoi-4090", "Award photo · Đại hội 2026", "f/3.8 · 1/100s · ISO 5000 · 17mm", "conference"),
    ("hack-9578", "Working · Hackathon 2026", "f/3.5 · 1/160s · ISO 1600 · 55mm", "conference"),
    ("events-3059", "Building the challenge · Sydney Go 2026", "f/3.6 · 1/250s · ISO 500 · 18mm", "community"),
    ("cultural-8403", "Rolling · Cultural Day 2025", "f/5.6 · 1/60s · ISO 1600 · 45mm", "community"),
    ("sydneygo-1005", "Mid-challenge · Sydney Go 2026", "f/4 · 1/240s · ISO 640 · 19mm", "community"),
    ("daihoi-4035", "Group photo on stage · Đại hội 2026", "f/3.5 · 1/100s · ISO 4000 · 15mm", "conference"),
    ("events-2428", "Team photo · Sydney Go 2026", "f/4 · 1/320s · ISO 640 · 27mm", "community"),
    ("events-3062", "Hands-on challenge · Sydney Go 2026", "f/3.6 · 1/250s · ISO 1000 · 18mm", "community"),
]

# 24 frames for the 3D film roll, in order
ROLL = [
    "sydney-4407", "hoian-4516", "ivy-5413", "stage-4156", "ninhbinh-9334", "grad-4198",
    "sydney-4417", "ivy-5493", "harbour-5341", "mqgrad-5091", "hoian-4536", "ivy-5504",
    "stage-4146", "ninhbinh-9301", "ivy-5378", "sydney-4376", "mqgrad-4761", "harbour-5355",
    "events-0320", "ninhbinh-9347", "ivy-5450", "elsewhere-4649", "hoian-4521", "harbour-5313",
]
# behind the lens aperture in the hero
HERO = ["sydney-4407", "ivy-5413", "stage-4156", "ninhbinh-9334", "grad-4198", "hoian-4516"]

FILTERS = {
    "SCENERY": [("all", "All"), ("sydney", "Sydney"), ("vietnam", "Vietnam"), ("abroad", "Shanghai")],
    "PEOPLE": [("all", "All"), ("portrait", "Portraits"), ("graduation", "Graduation"), ("concept", "Concepts")],
    "EVENTS": [("all", "All"), ("community", "Community"), ("stage", "Stage"), ("conference", "Conferences"), ("sport", "Sport")],
}


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


ALL = {p[0]: p for p in SCENERY + PEOPLE + EVENTS}
counter = iter(range(1, len(ALL) + 1))


def figure(name, cap, exif, tag):
    w, h = jpeg_size(IMG / f"{name}.jpg")
    cls = "ph ph--land" if w > h else "ph"
    cap, exif = html.escape(cap), html.escape(exif)
    alt = cap.split(" · ")[0]
    n = next(counter)
    return f"""          <figure class="{cls}" data-tag="{tag}" data-n="{n:03d}">
            <a href="assets/img/{name}.jpg" data-cap="{cap}" data-exif="{exif}"><img src="assets/img/{name}-sm.jpg" srcset="assets/img/{name}-sm.jpg 800w, assets/img/{name}.jpg 1800w" sizes="(max-width: 700px) 50vw, 33vw" width="{w}" height="{h}" alt="{alt}" loading="lazy" decoding="async"></a>
            <figcaption>{alt}</figcaption>
          </figure>"""


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
for key, items in (("SCENERY", SCENERY), ("PEOPLE", PEOPLE), ("EVENTS", EVENTS)):
    out = out.replace(f"{{{{{key}}}}}", "\n".join(figure(*p) for p in items))
    out = out.replace(f"{{{{CHIPS_{key}}}}}", chips(key))
    out = out.replace(f"{{{{N_{key}}}}}", f"{len(items):02d}")
out = out.replace("{{N_ALL}}", f"{len(ALL):03d}")
data = json.dumps({"roll": frames(ROLL), "hero": frames(HERO)}, ensure_ascii=False)
out = out.replace("{{SCENE_DATA}}", data.replace("</", "<\\/"))
assert not re.search(r"\{\{\w+\}\}", out), "unfilled placeholder"
(ROOT / "index.html").write_text(out)
print("index.html built:", len(SCENERY), "scenery,", len(PEOPLE), "people,", len(EVENTS), "events;", len(ROLL), "on the roll")
