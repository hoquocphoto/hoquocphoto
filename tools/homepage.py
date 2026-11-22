"""Turns the built portfolio page into the new homepage: a drawn front page, trending
concepts, the live map, recent shoots and the full portfolio below, plus about.html.
Called from build.py after index.html is assembled. Fragments live in home/home.html."""
import json, re, sys
from pathlib import Path
R = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(R / 'tools')); import sydney_map

def cut(s, start, end, repl='', keep_end=True):
    a = s.index(start); b = s.index(end, a)
    return s[:a] + repl + (s[b:] if keep_end else s[b + len(end):])

def cut_div(s, start):
    a = s.index(start); depth = 0
    for m in re.finditer(r'<div\b|</div>', s[a:]):
        depth += 1 if m.group(0) == '<div' else -1
        if depth == 0: return s[:a] + s[a + m.end():]
    raise ValueError(start)

def apply(html):
    src = html
    ALB = json.load(open(R / 'albums.json'))
    frag = (R / 'home/home.html').read_text()
    def part(name):
        a = frag.index('<!--' + name + '-->') + len(name) + 7
        b = frag.index('<!--', a)
        return frag[a:b]
    BAR, HOME, BOOK, FOOT = part('BAR'), part('HOME'), part('BOOK'), part('FOOT')
    # ---------- trending rows ----------
    ROWS = [
      ('jac', 'p-jacaranda-propeller', 'Woman under purple jacaranda blossom', '01', 'Jacaranda, last weeks', 'Propeller Park · Kirribilli',
       'The purple only lasts a few weeks a year. Catch it on the water at Balmain East or in the lanes of Kirribilli.', 'Last call', '', 'Nov', 'Propeller Park', '-2.2deg'),
      ('usyd', 'grad-usyd-1', 'Graduate in front of the sandstone Quadrangle, University of Sydney', '02', 'Graduation season', 'USYD · UNSW · MQ · UTS · UOW',
       'Gown, cap and the campus you earned it on. December ceremony days are the first to go, so lock in your date early.', 'Now booking', '', 'Dec', 'The Quad, USYD', '1.6deg'),
      ('ferry', 'p-milsons-point', 'Woman on a Sydney ferry with the skyline and the wake behind', '03', 'A ferry day', 'Circular Quay → Milsons Point',
       'Wind, wake and the skyline from the back deck. Shot on digital, or on one roll of film. Tap the ferry in the drawing.', 'Summer', 'soft', 'Dec–Feb', 'On the ferry', '-1.4deg'),
      ('opera', 'p-opera-golden', 'Woman on the Opera House steps at golden hour', '04', 'Golden hour at the sails', 'Sydney Opera House',
       'The last forty minutes before sunset, when the steps turn warm and the harbour turns to light.', 'Every clear evening', 'soft', 'All summer', 'The sails at sunset', '2deg'),
    ]
    rows = ''
    for art, slug, alt, n, t, where, txt, tag, soft, when, cap, tilt in ROWS:
        rows += f'''      <article class="n-row">
            <div class="n-row__pair">
              <figure class="n-pol" style="--tilt:{tilt};margin:0" data-open="{slug}"><img src="assets/home/{slug}.jpg" alt="{alt}" loading="lazy"><figcaption>{cap}</figcaption></figure>
              <div class="n-art" data-art="{art}" role="img" aria-label="{t}, drawn as moving shapes"></div>
            </div>
            <div class="n-row__meta"><span class="n-mono n">{n} / 04</span><h3>{t}</h3><span class="n-mono where">{where}</span><p>{txt}</p>
              <dl class="n-mono"><div><dt>Status</dt><dd><span class="n-tag {soft}"><i></i>{tag}</span></dd></div><div><dt>When</dt><dd>{when}</dd></div><div><dt>Price</dt><dd>Ask for a quote</dd></div></dl>
              <a class="n-go" href="https://ig.me/m/hoquocphoto" target="_blank" rel="noopener">Book this concept →</a></div>
          </article>
    '''
    HOME = HOME.replace('@@ROWS@@', rows)

    # ---------- places: the portfolio map, with hot spots ----------
    m = sydney_map.render(ALB)
    spot = {k: (x, y) for k, name, area, (x, y), *_ in sydney_map.SPOTS}
    HOT = [('circularquay', 'BUSY', '#1f2326', 46, -30, -22), ('opera', 'BUSY', '#1f2326', 46, -34, -18), ('mrsmac', 'ALWAYS BUSY', '#1f2326', 96, 0, 30),
           ('qvb', 'ALWAYS BUSY', '#1f2326', 96, 0, -30), ('balmain', 'VIRAL · TRENDING NOW', '#c0392b', 150, 0, -34)]
    badges = ''
    for key, label, col, w, dx, dy in HOT:
        x, y = spot[key]
        badges += (f'<g class="m-hot" transform="translate({x} {y})" pointer-events="none"><circle class="hot-ring" r="11" fill="none" stroke="{col}" stroke-width="2"/>'
                   f'<g class="hot-pill"><g transform="translate({dx} {dy})"><rect x="{-w/2}" y="-10" width="{w}" height="19" rx="9.5" fill="{col}"/>'
                   f'<text y="3.2" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8.5" font-weight="500" letter-spacing="1.2" fill="#fff">{label}</text></g></g></g>')
    i = m.index('class="m-spots"'); j = m.index('</svg>', i)
    m = m[:j] + badges + m[j:]
    m = m.replace('<p class="sydmap__k">Where I shoot</p>', '<p class="sydmap__k">Live map · Sydney</p>')
    HOME = HOME.replace('@@MAP@@', m)

    # ---------- contact-sheet strip ----------
    st = '<svg viewBox="0 0 3000 34" preserveAspectRatio="none">'
    for x in range(0, 3000, 20): st += f'<rect x="{x+5}" y="4" width="10" height="4" rx="1" fill="#1f2326" opacity=".55"/><rect x="{x+5}" y="26" width="10" height="4" rx="1" fill="#1f2326" opacity=".55"/>'
    for x in range(0, 3000, 150):
        k = (x // 150) % 8 + 1
        st += f'<text x="{x+12}" y="21" font-family="JetBrains Mono, monospace" font-size="9" letter-spacing="1.5" fill="#6a665e">▸ {k:02d}A  HQ-26  ISO 400</text>'
    st += '</svg>'
    HOME = HOME.replace('@@STRIP@@', st)

    REC = [('prewedding-mrs-macquarie', 'Pre-wedding at Mrs Macquarie\'s Chair', 'Weddings', 22), ('prewedding-gerringong', 'Pre-wedding on the coast', 'Gerringong', 7),
           ('tours-wildflowers', 'A family day in the wildflowers', 'Events', 10), ('grad-macquarie-2', 'Caps up over the lake', 'Macquarie University', 18),
           ('grad-usyd-7', 'The Quad on film', 'The University of Sydney', 18), ('grad-icms-1', 'Arches above Manly', 'ICMS', 15),
           ('p-newtown', 'Newtown mornings', 'AP Bakery, Newtown', 6), ('p-couple-camperdown', 'Bougainvillea in Camperdown', 'Portraits', 6)]
    rec = ''
    for i2, (slug, t, sub, cnt) in enumerate(REC, 1):
        rec += (f'        <a class="n-shot" href="#album-{slug}" data-open="{slug}"><div class="n-shot__img"><img src="assets/home/{slug}.jpg" alt="{t}" loading="lazy"></div>'
                f'<svg class="n-shot__mark" viewBox="0 0 100 125" preserveAspectRatio="none" aria-hidden="true"><ellipse cx="50" cy="62.5" rx="49" ry="61" vector-effect="non-scaling-stroke" transform="rotate(-2 50 62)"/></svg>'
                f'<div class="n-shot__cap"><span class="n-mono">{i2:02d}A</span><b>{t}</b><small>{sub} · {cnt} photos</small></div></a>\n')
    HOME = HOME.replace('@@RECENT@@', rec)

    # ---------- stitch into the portfolio page ----------
    fonts = '<link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,300..800;1,62..125,300..800&family=JetBrains+Mono:wght@300;400;500&family=Patrick+Hand&family=Playfair+Display:ital,wght@0,600;0,700;1,500&family=Yellowtail&display=swap" rel="stylesheet">'
    html = re.sub(r'<link href="https://fonts.googleapis.com/css2[^>]*>', fonts, html, count=1)
    def cut_div(s, start):
        a = s.index(start); i = a; depth = 0
        for m in re.finditer(r'<div\b|</div>', s[a:]):
            depth += 1 if m.group(0) == '<div' else -1
            if depth == 0: return s[:a] + s[a + m.end():]
        raise ValueError(start)
    html = cut_div(html, '<div class="sydmap" data-sydmap>')  # the portraits map; the homepage has its own
    html = re.sub(r'(<link rel="stylesheet" href="assets/css/hq.css[^>]*>)', r'\1\n  <link rel="stylesheet" href="assets/css/home.css">', html, count=1)
    html = cut(html, '<nav class="nav"', '</nav>', BAR, keep_end=False)
    html = cut(html, '<header class="hero" id="top">', '<main class="paper">')
    html = cut(html, '<section class="about"', '<div class="tx"', HOME)
    html = html.replace('<div class="tx" style="--from:#0c0b0a;', '<div class="tx" style="--from:#f1ece3;', 1)
    html = cut(html, '<section class="offer"', '</main>', BOOK + '\n  </main>\n' + FOOT, keep_end=False)
    html = cut(html, '<footer class="footer">', '</footer>', '', keep_end=False)
    html = re.sub(r'\s*<script type="module" src="assets/js/scene.js[^>]*></script>', '', html)
    html = html.replace('<canvas id="gl" aria-hidden="true"></canvas>', '')
    html = html.replace('</body>', '  <script src="assets/js/home.js"></script>\n</body>')

    # ---------- about page ----------
    about = src[src.index('<section class="about"'):src.index('<div class="tx"')]
    about_html = f'''<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
      <title>A bit about me · Ho Quoc Photography</title>
      <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
      <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      {fonts}
      <link rel="stylesheet" href="assets/css/site.css"><link rel="stylesheet" href="assets/css/hq.css">
      <style>
        body {{ background: #121110; }}
        .paper .about {{ min-height: 100vh; display: flex; align-items: center; }}
        .back {{ position: fixed; top: 22px; left: 22px; z-index: 10; display: inline-flex; gap: 10px; align-items: center; padding: 12px 18px; border-radius: 999px; background: #f1ece3; color: #1f2326; text-decoration: none; font: 400 11px/1 "JetBrains Mono", monospace; letter-spacing: .14em; text-transform: uppercase; transition: background .25s; }}
        .back:hover {{ background: #fff; }}
      </style>
    </head>
    <body>
      <a class="back" href="index.html">← Back to home</a>
      <main class="paper">
    {about}
      </main>
      <script>document.querySelectorAll('[data-year]').forEach(function (e) {{ e.textContent = new Date().getFullYear(); }});</script>
    </body>
    </html>
    '''


    (R / 'about.html').write_text(about_html)
    return html
