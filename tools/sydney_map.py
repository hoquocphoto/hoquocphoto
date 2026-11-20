"""The illustrated Sydney map in the Portraits section.

Each spot sits on the map at (x, y) in a 1200 x 720 drawing, lists the portrait albums shot there
(slugs from albums.json) and has its own little effect that plays while the spot is hovered or tapped.
To add a spot: add a line to SPOTS. Albums that no longer exist are skipped, and a spot with none is hidden.
build.py calls render(albums) and puts the result where template.html says {{PORTRAIT_MAP}}.
"""
import html, json

# key, name, area line, (x, y) of the pin, album slugs, effect, label side
SPOTS = [
    ("opera", "Sydney Opera House", "Bennelong Point", (612, 374), ["p-opera-soft", "p-opera-golden", "p-opera-bridge"], "golden", "r"),
    ("milsons", "Milsons Point", "Under the bridge", (666, 326), ["p-milsons-point"], "ferry", "t"),
    ("mcmahons", "McMahons Point", "Henry Lawson Avenue · Blues Point", (568, 312), ["p-mcmahons", "p-couple-blues-point"], "ferry", "l"),
    ("kirribilli", "Kirribilli", "Lanes, walls and the water", (768, 334), ["p-kirribilli", "p-jacaranda-kirribilli", "p-bougainvillea-kirribilli", "p-couple-kirribilli"], "bougain", "r"),
    ("barangaroo", "Barangaroo", "Last light on the west side", (462, 430), ["p-barangaroo"], "sunset", "l"),
    ("balmain", "Propeller Park", "Balmain East", (254, 418), ["p-jacaranda-propeller", "p-jacaranda-propeller-2"], "jacaranda", "l"),
    ("pirrama", "Pirrama Park", "Pyrmont", (356, 446), ["p-pirrama", "wedding-pyrmont"], "leaves", "b"),
    ("circularquay", "Circular Quay", "Campbell's Cove, under the bridge", (548, 428), ["p-circular-quay"], "ferry", "r"),
    ("chinese", "Chinese Garden of Friendship", "Darling Harbour", (420, 634), ["ao-chinese-garden"], "lantern", "l"),
    ("qvb", "Queen Victoria Building", "George Street", (510, 574), ["p-qvb", "p-idol-qvb"], "sparkle", "l"),
    ("haymarket", "Haymarket", "Chinatown and the city streets", (496, 684), ["p-street"], "neon", "r"),
    ("central", "Central Station", "Platforms and carriages", (584, 706), ["p-train"], "train", "r"),
    ("hyde", "Hyde Park", "The avenue of figs", (614, 600), ["p-hyde-park", "p-hyde-park-2"], "leaves", "r"),
    ("stmarys", "St Mary's Cathedral", "College Street", (654, 556), ["p-st-marys"], "sparkle", "r"),
    ("botanic", "Royal Botanic Garden", "And Government House", (676, 484), ["p-botanic", "p-government-house"], "leaves", "r"),
    ("mrsmac", "Mrs Macquarie's Chair", "The sails and the bridge in one frame", (742, 412), ["prewedding-mrs-macquarie"], "sparkle", "r"),
    ("taronga", "Taronga Zoo Wharf", "Across the harbour", (1016, 290), ["p-yacht"], "ferry", "t"),
    ("redleaf", "Redleaf Pool", "Woollahra", (1040, 450), ["p-redleaf"], "ferry", "t"),
    ("usyd", "The University of Sydney", "Camperdown", (128, 676), ["ao-usyd", "p-magnolia-usyd"], "bougain", "r"),
    ("camperdown", "Camperdown", "Bougainvillea streets by the university", (176, 616), ["p-bougainvillea-usyd", "p-couple-camperdown"], "bougain", "r"),
    # further afield: drawn in the inset box in the top-left corner
    ("mq", "Macquarie Park", "Macquarie University", (44, 70), ["p-maple-mq"], "maple", "r"),
    ("outer", "Merrylands · Bowral · Gerringong", "Out of the city", (44, 100), ["p-further", "prewedding-gerringong"], "leaves", "r"),
    ("vietnam", "Vietnam", "Back home", (44, 130), ["ao-vietnam", "ao-dalat", "p-curls"], "lantern", "r"),
    ("newtown", "Newtown", "AP Bakery and the brick lanes", (44, 160), ["p-newtown"], "leaves", "r"),
]

INK, LINE, CREAM, TAN, SAGE, SAGE2, TRUNK = "#5d6a76", "#7d8b98", "#fbf7ef", "#eadfcd", "#8fae90", "#5d7a62", "#5b4638"

NORTH = ("M0 0H1110V300C1040 296 1010 280 1000 250C995 232 980 228 972 245C964 268 960 300 940 316C930 326 918 334 906 326"
         "C890 312 880 290 864 270C852 252 842 238 830 240C818 244 818 262 812 280C804 304 790 330 772 340C760 346 748 340 742 330"
         "C734 316 720 312 704 316C690 322 676 330 664 334C650 334 644 322 640 306C636 284 630 262 618 254C606 248 598 258 596 274"
         "C594 296 588 316 572 322C558 326 548 316 544 302C540 284 534 268 520 262C506 258 498 270 492 286C484 302 470 316 452 314"
         "C430 312 410 300 380 296C300 290 200 296 100 292C60 290 30 292 0 294Z")
SOUTH = ("M0 400C80 396 160 398 210 402C236 404 254 410 262 420C270 432 264 446 252 452C240 460 236 476 240 500"
         "C246 530 252 556 270 566C284 574 300 568 304 552C310 520 312 480 322 456C330 440 348 432 366 434C384 436 392 446 394 466"
         "C398 510 396 560 402 596C406 612 424 614 430 598C436 560 432 500 436 460C440 440 452 428 470 422C490 414 506 404 516 396"
         "C526 390 538 392 544 402C550 418 552 440 562 450C572 458 584 452 588 438C594 412 598 384 610 372C620 364 630 372 632 388"
         "C636 414 640 440 656 452C672 462 692 456 698 440C704 420 708 398 720 388C732 380 742 390 744 406C748 432 752 460 768 468"
         "C784 474 796 464 800 448C806 428 816 416 836 414C880 410 930 420 980 430C1030 438 1070 440 1110 446V720H0Z")


def tree(x, y, s=1.0, c=SAGE):
    r = 9 * s
    return (f'<g class="m-tree"><path d="M{x} {y}v{-12*s:.1f}" stroke="{TRUNK}" stroke-width="{1.6*s:.1f}"/>'
            f'<circle cx="{x}" cy="{y-14*s:.1f}" r="{r:.1f}" fill="{c}"/><circle cx="{x-5*s:.1f}" cy="{y-10*s:.1f}" r="{r*.7:.1f}" fill="{SAGE2}" opacity=".55"/></g>')


def block(x, y, w, h, d=8, fill=TAN):
    """A little 2.5D building: front face, roof and side, drawn from its bottom-left corner."""
    return (f'<g class="m-bld"><path d="M{x} {y}h{w}v{-h}h{-w}Z" fill="{fill}" stroke="{LINE}" stroke-width=".8"/>'
            f'<path d="M{x+w} {y}l{d} {-d*.6:.1f}v{-h}l{-d} {d*.6:.1f}Z" fill="#dccfb9" stroke="{LINE}" stroke-width=".8"/>'
            f'<path d="M{x} {y-h}l{d} {-d*.6:.1f}h{w}l{-d} {d*.6:.1f}Z" fill="#f3ebdc" stroke="{LINE}" stroke-width=".8"/>'
            + "".join(f'<path d="M{x+3} {y-h+5+i*7}h{w-6}" stroke="#c9bba3" stroke-width=".7"/>' for i in range(max(1, int(h // 7) - 1)))
            + '</g>')


def art():
    """Everything that is always on the map: land, water, landmarks, labels."""
    out = []
    out.append('<g class="m-ripples" stroke="#b9c7d0" stroke-width="1" fill="none" stroke-linecap="round">'
               + "".join(f'<path d="M{x} {y}h{w}"/>' for x, y, w in [(320, 352, 34), (420, 344, 26), (860, 372, 44), (960, 380, 30), (1020, 404, 40),
                                                                 (1140, 240, 30), (1140, 560, 40), (272, 520, 14), (412, 540, 10), (700, 352, 24), (150, 350, 40), (1130, 660, 30)])
               + '</g>')
    for d in (NORTH, SOUTH):
        out.append(f'<path d="{d}" fill="#dfd2ba" transform="translate(0 9)"/>')
        out.append(f'<path d="{d}" fill="#f6f1e7" stroke="{LINE}" stroke-width="1.2"/>')
    out.append('<g stroke="#e6dccb" stroke-width="1">' + "".join(f'<path d="M{x} 470V720"/>' for x in range(450, 820, 32))
               + "".join(f'<path d="M440 {y}H820"/>' for y in range(490, 720, 32)) + '</g>')
    out.append(f'<path d="M640 454C660 464 690 458 700 440L740 474L726 532H650Z" fill="#e3ead9"/>')              # Botanic Garden
    out.append(f'<path d="M588 560h52v84h-52z" fill="#e3ead9" stroke="{LINE}" stroke-width=".8"/>')               # Hyde Park
    out.append(f'<path d="M206 402C232 404 254 410 262 420L248 452C228 448 212 432 206 402Z" fill="#e3ead9"/>')   # Balmain East
    out.append(f'<path d="M404 618h44v40h-44z" fill="#e3ead9" stroke="{LINE}" stroke-width=".8"/>')               # Chinese Garden
    for x, y in [(120, 250), (210, 230), (300, 258), (380, 236), (470, 250), (560, 222), (690, 268), (900, 210), (960, 196), (1050, 250), (1040, 150), (880, 130), (760, 200), (640, 200), (320, 160)]:
        out.append(block(x, y, 16, 12, 5, "#efe5d3"))
    for x, y in [(160, 260), (260, 240), (420, 270), (510, 230), (600, 230), (720, 240), (800, 210), (940, 240), (1000, 200), (1070, 190), (90, 200), (440, 180), (700, 160), (980, 120), (560, 150)]:
        out.append(tree(x, y, .9))
    for x, y, w, h in [(470, 470, 20, 44), (500, 460, 18, 56), (548, 470, 20, 40), (500, 530, 22, 70), (466, 540, 20, 50), (556, 548, 18, 84),
                       (470, 610, 22, 48), (524, 600, 20, 60), (660, 580, 22, 60), (690, 560, 18, 46), (700, 640, 22, 50), (560, 640, 20, 46), (650, 690, 22, 40)]:
        out.append(block(x, y, w, h))
    out.append(f'<g class="m-tower"><path d="M534 590V454" stroke="{LINE}" stroke-width="2.2"/><path d="M526 462h16l-3 -14h-10z" fill="{TAN}" stroke="{LINE}" stroke-width=".9"/>'
               f'<path d="M534 448v-20" stroke="{LINE}" stroke-width="1.2"/></g>')
    hangers = "".join(f'<path d="M{x} {-4 - 30 * (1 - ((x - 79) / 70) ** 2):.1f}V-4"/>' for x in range(18, 141, 10))
    out.append(f'<g class="m-bridge" transform="translate(516 394) rotate(-23)" fill="none" stroke="{LINE}">'
               f'<path d="M-6 -4H164" stroke-width="2.2"/><path d="M10 -4Q79 -66 148 -4" stroke-width="2.4"/><path d="M10 -4Q79 -48 148 -4" stroke-width="1.2"/>'
               f'<g stroke-width=".7">{hangers}</g>'
               f'<path d="M2 3V-22H15V3Z" fill="{TAN}" stroke-width="1"/><path d="M143 3V-22H156V3Z" fill="{TAN}" stroke-width="1"/></g>')
    out.append(f'<text x="520" y="350" class="m-lab" transform="rotate(-23 520 350)">HARBOUR BRIDGE</text>')
    out.append(f'<g class="m-opera" transform="translate(594 384)"><path d="M-6 6h44l-4 -4h-36z" fill="{TAN}" stroke="{LINE}" stroke-width=".8"/>'
               f'<path d="M0 2C2 -12 8 -20 14 -22C12 -14 12 -6 14 2Z" fill="{CREAM}" stroke="{LINE}" stroke-width=".9"/>'
               f'<path d="M10 2C12 -16 20 -26 28 -28C24 -18 24 -8 26 2Z" fill="{CREAM}" stroke="{LINE}" stroke-width=".9"/>'
               f'<path d="M22 2C24 -10 30 -16 36 -17C34 -10 34 -4 35 2Z" fill="{CREAM}" stroke="{LINE}" stroke-width=".9"/></g>')
    out.append(block(470, 444, 10, 46, 5, "#efe5d3") + block(484, 438, 8, 30, 4, "#efe5d3"))                   # Barangaroo
    out.append(block(752, 322, 14, 12, 5, "#efe5d3") + block(774, 318, 12, 10, 4, "#efe5d3"))                   # Kirribilli
    out.append(f'<path d="M566 324l-6 12h8l4 -12" fill="{TAN}" stroke="{LINE}" stroke-width=".8"/>')              # McMahons wharf
    out.append(f'<path d="M690 498q12 -16 24 0z" fill="#eef3ee" stroke="{LINE}" stroke-width=".9"/>' + block(650, 470, 18, 10, 4, "#efe5d3"))
    for x, y in [(660, 512), (712, 470), (722, 516), (690, 524), (646, 494)]:
        out.append(tree(x, y, .85))
    for y in (576, 594, 612, 630):
        out.append(tree(598, y, .6) + tree(630, y, .6))
    out.append(f'<circle cx="614" cy="612" r="5" fill="#dbe3e7" stroke="{LINE}" stroke-width=".9"/>')
    out.append(tree(222, 416, .8) + tree(240, 430, .7))
    out.append(f'<g transform="translate(428 648)"><path d="M-8 0h16v-8h-16z" fill="#d9a07a" stroke="{LINE}" stroke-width=".8"/>'
               f'<path d="M-12 -8h24l-6 -6h-12z" fill="#b9554a" stroke="{LINE}" stroke-width=".8"/><path d="M-9 -14h18l-5 -5h-8z" fill="#b9554a" stroke="{LINE}" stroke-width=".8"/></g>'
               + tree(412, 656, .55) + tree(442, 656, .55))
    out.append(f'<g transform="translate(486 698)"><path d="M-14 0v-14M14 0v-14" stroke="#b9554a" stroke-width="2.4"/>'
               f'<path d="M-19 -14h38l-4 -6h-30z" fill="#b9554a" stroke="{LINE}" stroke-width=".7"/><path d="M-10 -11h20" stroke="#e0b862" stroke-width="1.6"/></g>')
    boat = '<path d="M0 0h22l-3 5h-16z" fill="#2f6b4f"/><path d="M4 0v-4h12v4" fill="#f3ead5" stroke="#2f6b4f" stroke-width=".8"/>'
    out.append(f'<g class="m-ferry m-ferry--a">{boat}</g><g class="m-ferry m-ferry--b">{boat}</g>')
    for x, y, t in [(560, 170, "NORTH SYDNEY"), (90, 450, "BALMAIN"), (330, 512, "PYRMONT"), (470, 576, "CBD"), (870, 470, "POTTS POINT"),
                    (840, 372, "SYDNEY HARBOUR"), (360, 690, "ULTIMO"), (190, 620, "GLEBE"), (1000, 160, "MOSMAN"), (700, 704, "SURRY HILLS"), (812, 262, "NEUTRAL BAY")]:
        out.append(f'<text x="{x}" y="{y}" class="m-lab m-lab--area">{t}</text>')
    out.append('<text x="1158" y="300" class="m-lab m-lab--area" transform="rotate(90 1158 300)">TASMAN SEA</text>')
    # further afield: places off the edge of this map
    out.append(f'<g class="m-inset"><rect x="18" y="20" width="232" height="158" rx="10" fill="{CREAM}" stroke="{LINE}" stroke-dasharray="4 3"/>'
               f'<text x="34" y="44" class="m-lab">FURTHER AFIELD</text><path d="M34 52h200" stroke="#e2d8c6"/></g>')
    out.append(f'<g class="m-compass" transform="translate(1040 650)"><circle r="24" fill="{CREAM}" stroke="{LINE}"/><path d="M0 -18L6 0L0 18L-6 0Z" fill="{TAN}" stroke="{LINE}" stroke-width=".8"/>'
               f'<path d="M0 -18L6 0H-6Z" fill="#b9554a"/><text y="-28" class="m-lab m-lab--sm" text-anchor="middle">N</text></g>')
    return "".join(out)


def effect(kind, x, y):
    """The little scene that plays at a spot while it's active."""
    if kind == "jacaranda":
        petals = "".join(f'<ellipse class="mfx-petal" cx="{x + dx}" cy="{y - 50}" rx="2.6" ry="1.8" style="--d:{d}s;--dx:{dx//3}px"/>'
                         for dx, d in [(-30, 0), (-16, .6), (-4, 1.2), (8, .3), (20, .9), (32, 1.5), (-24, 1.8), (14, 2.1), (-8, 2.4), (26, 2.7), (0, .15), (-36, 1.05)])
        return (f'<g class="mfx mfx--jacaranda"><g class="mfx-grow" style="transform-origin:{x}px {y + 6}px">'
                f'<path d="M{x} {y + 6}V{y - 22}M{x} {y - 10}l-12 -12M{x} {y - 14}l10 -10" stroke="{TRUNK}" stroke-width="3" stroke-linecap="round" fill="none"/>'
                + "".join(f'<circle cx="{x + cx}" cy="{y + cy}" r="{r}" fill="{c}"/>' for cx, cy, r, c in
                          [(-14, -28, 13, "#a58bd6"), (12, -30, 14, "#8f73c6"), (0, -40, 15, "#b9a2e3"), (-22, -38, 9, "#8f73c6"), (22, -40, 10, "#a58bd6"), (2, -26, 10, "#c8b6ea")])
                + f'</g><g fill="#a58bd6">{petals}</g></g>')
    if kind == "golden":
        # seagulls circling the sails: each gull flaps (inner group) while it drifts along its own loop (outer group)
        gull = ('<path d="M-9 0Q-5 -6 0 0Q5 -6 9 0" fill="none" stroke="#5d6a76" stroke-width="1.6" stroke-linecap="round"/>'
                '<path d="M-9 0l-2 1M9 0l2 1" stroke="#2f3a44" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="0" cy=".6" rx="2.2" ry="1.3" fill="#ffffff" stroke="#5d6a76" stroke-width=".5"/>')
        gulls = "".join(f'<g class="mfx-gull" style="--d:{d}s;--t:{t}s;--x0:{x + x0}px;--y0:{y + y0}px;--x1:{x + x1}px;--y1:{y + y1}px;--s:{sc}">'
                        f'<g class="mfx-flap" style="--f:{f}s">{gull}</g></g>'
                        for x0, y0, x1, y1, sc, t, f, d in [(-70, -40, 60, -70, 1.6, 5.5, .45, 0), (50, -20, -60, -60, 1.3, 6.5, .38, -1.5),
                                                            (-30, -75, 70, -35, 1.2, 7, .5, -3), (20, -55, -80, -25, 1.45, 6, .42, -4.2)])
        return (f'<g class="mfx mfx--golden"><circle cx="{x}" cy="{y - 6}" r="70" fill="url(#m-glow)"/>'
                + "".join(f'<path class="mfx-ray" d="M{x} {y - 6}l{dx} {dy}" stroke="#f2c27a" stroke-width="1.6" stroke-linecap="round"/>' for dx, dy in [(-46, -30), (-20, -50), (12, -54), (40, -36), (54, -8)])
                + gulls + '</g>')
    if kind == "ferry":
        return (f'<g class="mfx mfx--ferry"><g class="mfx-boat" style="--x0:{x - 60}px;--x1:{x + 40}px;--y:{y + 22}px"><path d="M0 0h26l-4 6h-18z" fill="#2f6b4f"/><path d="M5 0v-5h14v5" fill="#f3ead5" stroke="#2f6b4f" stroke-width=".8"/><path d="M-14 4h12M-20 7h14" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/></g>'
                + "".join(f'<path class="mfx-spark" d="M{x + sx} {y + sy}l3 -3l3 3l-3 3z" fill="#ffffff" style="--d:{d}s"/>' for sx, sy, d in [(-30, 30, 0), (10, 34, .5), (30, 26, 1), (-10, 40, 1.4)])
                + '</g>')
    if kind == "bougain":
        return ('<g class="mfx mfx--bougain">' + "".join(
            f'<g class="mfx-bloom" style="--d:{d}s;transform-origin:{x + bx}px {y + by}px"><circle cx="{x + bx}" cy="{y + by}" r="{r}" fill="#d63d8f"/><circle cx="{x + bx + 3}" cy="{y + by - 2}" r="{r * .6:.1f}" fill="#ef79b3"/></g>'
            for bx, by, r, d in [(-20, 0, 6, 0), (-12, -8, 5, .1), (-2, 4, 6, .2), (8, -6, 5, .3), (16, 6, 6, .15), (24, -2, 4, .25), (-26, 10, 4, .35), (2, -14, 4, .4)]) + '</g>')
    if kind == "sunset":
        return (f'<g class="mfx mfx--sunset"><circle cx="{x - 40}" cy="{y - 20}" r="60" fill="url(#m-sunset)"/>'
                + "".join(f'<rect class="mfx-win" x="{x + wx}" y="{y + wy}" width="3" height="3" fill="#f6c86a" style="--d:{d}s"/>' for wx, wy, d in [(4, -40, 0), (4, -30, .4), (8, -24, .8), (18, -20, .2), (18, -12, .6), (6, -16, 1)])
                + '</g>')
    if kind == "lantern":
        return ('<g class="mfx mfx--lantern">' + f'<path d="M{x - 30} {y - 24}Q{x} {y - 12} {x + 30} {y - 24}" stroke="{TRUNK}" stroke-width=".8" fill="none"/>' + "".join(
            f'<g class="mfx-lamp" style="--d:{d}s"><circle cx="{x + lx}" cy="{y + ly}" r="8" fill="#f2b04a" opacity=".35"/><ellipse cx="{x + lx}" cy="{y + ly}" rx="4" ry="5" fill="#c8382c"/><path d="M{x + lx} {y + ly + 5}v3" stroke="#e0b862"/></g>'
            for lx, ly, d in [(-22, -18, 0), (-8, -14, .3), (8, -14, .6), (22, -18, .9)]) + '</g>')
    if kind == "neon":
        return ('<g class="mfx mfx--neon">' + "".join(
            f'<rect class="mfx-sign" x="{x + nx}" y="{y + ny}" width="{w}" height="5" rx="2" fill="{c}" style="--d:{d}s"/>'
            for nx, ny, w, c, d in [(-30, -40, 16, "#ff5fa2", 0), (-10, -48, 12, "#4fd1e8", .3), (8, -38, 18, "#ffd25f", .6), (-24, -28, 10, "#4fd1e8", .9), (14, -26, 12, "#ff5fa2", 1.2)])
            + '</g>')
    if kind == "sparkle":
        return ('<g class="mfx mfx--sparkle">' + f'<circle cx="{x}" cy="{y - 10}" r="40" fill="url(#m-glow)"/>' + "".join(
            f'<path class="mfx-spark" d="M{x + sx} {y + sy - 6}l2 4l4 2l-4 2l-2 4l-2 -4l-4 -2l4 -2z" fill="#f2c27a" style="--d:{d}s"/>'
            for sx, sy, d in [(-24, -20, 0), (-6, -36, .3), (16, -28, .6), (26, -10, .9), (-18, -4, 1.2), (6, -14, .45)]) + '</g>')
    if kind == "train":
        car = ('<rect width="26" height="10" rx="3" fill="#f3ead5" stroke="#5d6a76" stroke-width=".8"/><rect x="3" y="2" width="5" height="4" fill="#8fb3c7"/>'
               '<rect x="11" y="2" width="5" height="4" fill="#8fb3c7"/><rect x="19" y="2" width="4" height="4" fill="#8fb3c7"/><path d="M0 7h26" stroke="#e0b862" stroke-width="1.4"/>')
        return (f'<g class="mfx mfx--train"><path d="M{x - 70} {y + 18}h140" stroke="#5d6a76" stroke-width="1.2" stroke-dasharray="3 3"/>'
                f'<g class="mfx-boat" style="--x0:{x - 80}px;--x1:{x + 30}px;--y:{y + 6}px">{car}<g transform="translate(28 0)">{car}</g></g></g>')
    if kind == "maple":
        leaves = "".join(f'<path class="mfx-leaf" d="M{x + lx} {y - 30}l3 -6l3 6l5 -2l-3 5l4 3l-6 1l1 5l-4 -3l-4 3l1 -5l-6 -1l4 -3l-3 -5z" fill="{c}" style="--d:{d}s;--dx:{lx // 2}px"/>'
                         for lx, c, d in [(-20, "#c8402b", 0), (-4, "#e2703a", .5), (12, "#b5321f", 1), (26, "#e89a3c", 1.5), (-30, "#c8402b", 2)])
        return f'<g class="mfx mfx--maple">{leaves}</g>'
    if kind == "leaves":
        birds = "".join(f'<path class="mfx-bird" d="M{x + bx} {y + by}q4 -4 8 0q4 -4 8 0" stroke="{INK}" stroke-width="1.2" fill="none" style="--d:{d}s"/>' for bx, by, d in [(-30, -50, 0), (-6, -62, .4), (16, -52, .8)])
        leaves = "".join(f'<ellipse class="mfx-leaf" cx="{x + lx}" cy="{y - 30}" rx="3" ry="1.8" fill="{c}" style="--d:{d}s;--dx:{lx // 2}px"/>' for lx, c, d in [(-20, SAGE, 0), (-4, "#c9a85c", .5), (12, SAGE2, 1), (26, "#c9a85c", 1.5), (-30, SAGE2, 2)])
        return f'<g class="mfx mfx--leaves">{birds}{leaves}</g>'
    return ""


def render(albums):
    by_slug = {a["slug"]: a for a in albums if a["photos"]}
    pins, effects, cards, chips, data = [], [], [], [], {}
    for key, name, area, (x, y), slugs, kind, side in SPOTS:
        sets = [by_slug[s] for s in slugs if s in by_slug]
        if not sets:
            continue
        lx, ly, anchor = {"r": (x + 14, y + 4, "start"), "l": (x - 14, y + 4, "end"), "t": (x, y - 14, "middle"), "b": (x, y + 20, "middle")}[side]
        k = {"jacaranda": 1.9, "golden": 1.3}.get(kind, 1.5)          # scenes are drawn small and scaled up around the pin
        effects.append(f'<g transform="translate({x} {y}) scale({k}) translate({-x} {-y})">'
                       + effect(kind, x, y).replace('class="mfx ', f'data-fx="{key}" class="mfx ') + '</g>')
        pins.append(f'<g class="m-spot" data-spot="{key}" tabindex="0" role="button" aria-label="{html.escape(name)}: {len(sets)} {"album" if len(sets) == 1 else "albums"}">'
                    f'<circle class="m-hit" cx="{x}" cy="{y}" r="20"/><circle class="m-pulse" cx="{x}" cy="{y}" r="7"/>'
                    f'<circle class="m-pin" cx="{x}" cy="{y}" r="6"/><circle cx="{x}" cy="{y}" r="2.2" fill="#fbf7ef"/>'
                    f'<text x="{lx}" y="{ly}" text-anchor="{anchor}" class="m-lab m-lab--spot">{html.escape(name.upper())}</text></g>')
        chips.append(f'<button class="sydmap__chip" type="button" data-spot="{key}">{html.escape(name)}</button>')
        data[key] = {"name": name, "area": area, "sets": [{"slug": a["slug"], "title": a["title"], "em": a["em"], "n": len(a["photos"]),
                                                            "src": a["photos"][0]["src"]} for a in sets]}
    svg = (f'<svg class="sydmap__svg" viewBox="0 0 1200 720" role="img" aria-label="Illustrated map of Sydney Harbour with the places I shoot portraits">'
           '<defs><radialGradient id="m-glow"><stop offset="0" stop-color="#ffd79a" stop-opacity=".9"/><stop offset="1" stop-color="#ffd79a" stop-opacity="0"/></radialGradient>'
           '<radialGradient id="m-sunset"><stop offset="0" stop-color="#f4a36c" stop-opacity=".75"/><stop offset="1" stop-color="#f4a36c" stop-opacity="0"/></radialGradient></defs>'
           f'<rect width="1200" height="720" fill="#dbe3e7"/>{art()}<g class="m-effects">{"".join(effects)}</g><g class="m-spots">{"".join(pins)}</g></svg>')
    return (f'''        <div class="sydmap" data-sydmap>
          <div class="sydmap__head">
            <p class="sydmap__k">Where I shoot</p>
            <h3 class="sydmap__t">A map of <em>my Sydney</em></h3>
            <p class="sydmap__hint">Hover or tap a spot to see the shoots from there.</p>
          </div>
          <div class="sydmap__stage"><div class="sydmap__plane">{svg}</div>
            <div class="sydmap__pop" role="dialog" aria-live="polite" hidden></div>
          </div>
          <div class="sydmap__chips">{"".join(chips)}</div>
          <script type="application/json" id="sydmap-data">{json.dumps(data, ensure_ascii=False).replace("</", "<\\/")}</script>
        </div>''')
