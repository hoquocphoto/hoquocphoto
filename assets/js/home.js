// New home: living infographics (trains, gulls, ferries, petals, caps), a ferry horn, and the bar.
(function () {
  var PAPER = '#f4efe6';
  function op(c) { return c[1] == null ? 1 : c[1]; }
  function lg(id, a, b, x2, y2) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + (x2 == null ? 0 : x2) + '" y2="' + (y2 == null ? 1 : y2) + '"><stop offset="0" stop-color="' + a[0] + '" stop-opacity="' + op(a) + '"/><stop offset="1" stop-color="' + b[0] + '" stop-opacity="' + op(b) + '"/></linearGradient>'; }
  function rg(id, a, b) { return '<radialGradient id="' + id + '"><stop offset="0" stop-color="' + a[0] + '" stop-opacity="' + op(a) + '"/><stop offset="1" stop-color="' + b[0] + '" stop-opacity="' + op(b) + '"/></radialGradient>'; }
  function eY(x, cx, base, rx, ry) { var t = (x - cx) / rx; return base - ry * Math.sqrt(Math.max(0, 1 - t * t)); }
  function waves(x0, x1, y, r, o) { var w = ''; for (var x = x0 - 2 * r; x < x1 + 2 * r; x += 2 * r) w += 'M' + x + ' ' + y + 'a' + r + ' ' + r + ' 0 0 1 ' + (2 * r) + ' 0'; return '<path class="n-wv" style="--wv:-' + (2 * r) + 'px" d="' + w + '" fill="none" stroke="#fff" stroke-width="1" opacity="' + (o || .55) + '"/>'; }
  function gull(x, y, s, dx, dur, del, c) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><g class="n-fly" style="--dx:' + dx + 'px;--dur:' + dur + 's;--del:' + del + 's"><path class="n-flap" d="M-12 0Q-6 -7 0 0Q6 -7 12 0" fill="none" stroke="' + (c || '#3a3f44') + '" stroke-width="2" stroke-linecap="round"/></g></g>';
  }
  function frame(p, noLeaf) {
    var L = p.line, s = '', cx = p.cx || 300, cy = p.cy || 236, cr = p.cr || 198;
    s += '<g fill="none" stroke="' + L + '" stroke-width=".6"><path d="M118 0V400M212 0V400M388 0V400M482 0V400M0 118H600M0 302H600" opacity=".22"/>' +
      '<g class="n-spin" style="--dur:120s;--o:' + cx + 'px ' + cy + 'px"><circle cx="' + cx + '" cy="' + cy + '" r="' + cr + '" stroke-dasharray="1 3.2" opacity=".55"/></g>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + Math.round(cr * .64) + '" stroke-dasharray="1 3.2" opacity=".3"/></g>';
    s += '<g fill="none" stroke="' + L + '" stroke-width=".9" opacity=".8"><circle cx="50" cy="42" r="12"/><circle cx="67" cy="42" r="12"/><circle cx="84" cy="42" r="12"/></g>';
    s += '<g font-family="JetBrains Mono, monospace" font-size="8.5" fill="' + L + '" opacity=".85" letter-spacing=".6"><text x="40" y="70">01</text><text x="60" y="70">02</text><text x="80" y="70">03</text></g>';
    s += '<g stroke="' + L + '" stroke-width=".8" fill="none" opacity=".75"><path d="M24 40V332M24 186H30"/><path d="M34 236h8M38 232v8M34 252h8M38 248v8M34 268h8M38 264v8"/></g>';
    p.sw.forEach(function (c, i) { s += '<rect x="' + (572 - (p.sw.length - i) * 17) + '" y="34" width="11" height="11" fill="' + c + '"/>'; });
    if (!noLeaf) s += '<g fill="none" stroke="' + L + '" stroke-width=".8" opacity=".75"><rect x="506" y="262" width="62" height="62"/><path d="M506 324A62 62 0 0 1 568 262A62 62 0 0 1 506 324Z"/></g>';
    s += '<rect x="26" y="346" width="8" height="8" fill="' + p.sw[0] + '"/><rect x="34" y="354" width="8" height="8" fill="' + p.sw[1] + '"/><rect x="26" y="354" width="8" height="8" fill="' + p.sw[2] + '" opacity=".7"/><rect x="42" y="362" width="8" height="8" fill="' + p.sw[1] + '" opacity=".8"/>';
    s += '<g stroke="' + L + '" stroke-width=".8" opacity=".8"><path d="M424 370H564M462 366V370M504 366V370M542 366V370"/></g><circle cx="566" cy="370" r="3" fill="' + L + '"/>';
    return s;
  }

  /* ---------------- pieces ---------------- */
  function sailDefs(k) { return lg(k + 's1', ['#fffaf2'], ['#ddcbb2'], 1, 1) + lg(k + 's2', ['#f4e9d9'], ['#c9b294'], 0, 1); }
  function sails(k) { // local coords, base line y=0, spans x -20..326
    var g = '<path d="M76 0V-74A74 74 0 0 0 2 0Z" fill="url(#' + k + 's2)"/>';
    g += '<path d="M76 0V-140A140 140 0 0 1 216 0Z" fill="url(#' + k + 's1)"/>';
    g += '<path d="M76 -104A104 104 0 0 1 180 0M76 -68A68 68 0 0 1 144 0" fill="none" stroke="#cdb89c" stroke-width="1"/>';
    g += '<path d="M162 0V-104A104 104 0 0 1 266 0Z" fill="url(#' + k + 's2)" opacity=".96"/><path d="M162 -70A70 70 0 0 1 232 0" fill="none" stroke="#c2ab8d" stroke-width="1"/>';
    g += '<path d="M242 0V-60A60 60 0 0 1 302 0Z" fill="url(#' + k + 's1)"/>';
    g += '<rect x="-20" y="0" width="346" height="20" fill="#c9b59a"/><path d="M-20 6H326M-20 12H326" stroke="#b09a7c" stroke-width=".8"/>';
    return g;
  }
  function ferryDefs(k) { return lg(k + 'h', ['#2f5c46'], ['#1d3f2f']) + lg(k + 'c', ['#f4e8c6'], ['#dfca95']); }
  function ferryBody(k) { // local coords: hull 110..486, waterline y=334, mast top y=186
    var s = '<path d="M110 300H486L462 334H140Z" fill="url(#' + k + 'h)"/><path d="M128 318H472" stroke="#d8b45a" stroke-width="2"/>';
    s += '<rect x="150" y="262" width="300" height="38" fill="url(#' + k + 'c)"/><path d="M150 262A19 19 0 0 0 150 300ZM450 262A19 19 0 0 1 450 300Z" fill="#e4d2a2"/>';
    for (var x = 162; x < 440; x += 22) s += '<rect x="' + x + '" y="272" width="13" height="13" fill="#2e5a44" opacity=".85"/>';
    s += '<rect x="196" y="236" width="208" height="26" fill="#f6edd4"/><path d="M196 236H404" stroke="#2e5a44" stroke-width="1.2"/>';
    for (var x2 = 206; x2 < 396; x2 += 18) s += '<rect x="' + x2 + '" y="243" width="10" height="10" fill="#2e5a44" opacity=".55"/>';
    s += '<path d="M262 236V214H338V236Z" fill="#2e5a44"/><rect x="272" y="220" width="12" height="8" fill="#f6edd4"/><rect x="294" y="220" width="12" height="8" fill="#f6edd4"/><rect x="316" y="220" width="12" height="8" fill="#f6edd4"/>';
    s += '<path d="M300 214V186" stroke="#1f4231" stroke-width="2"/><path d="M300 187L320 193L300 199Z" fill="#c0392b"/>';
    return s;
  }
  function horn(x, y, flip) { // sound rings + a speech tag; shown when the ferry is clicked
    var d = flip ? -1 : 1;
    return '<g class="n-horn" transform="translate(' + x + ' ' + y + ')"><g fill="none" stroke="#2f4fd0" stroke-width="1.6" stroke-linecap="round">' +
      '<path class="arc" d="M' + (6 * d) + ' -6a9 9 0 0 ' + (flip ? 0 : 1) + ' 0 12"/><path class="arc" d="M' + (12 * d) + ' -11a15 15 0 0 ' + (flip ? 0 : 1) + ' 0 22"/><path class="arc" d="M' + (18 * d) + ' -16a21 21 0 0 ' + (flip ? 0 : 1) + ' 0 32"/></g>' +
      '<g transform="translate(' + (26 * d - (flip ? 92 : 0)) + ' -44)"><rect width="92" height="24" rx="12" fill="#1f2326"/><text x="46" y="16" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" letter-spacing="1.5" fill="#f1ece3">TOOT TOOT!</text></g></g>';
  }
  function train(y, startX, run) { // a Sydney Trains set: silver cars, yellow doors, dark window band
    var s = '<g class="n-train" style="--run:' + run + 'px"><g transform="translate(' + startX + ' ' + y + ')">';
    for (var i = 0; i < 5; i++) {
      var x = i * 44;
      s += '<rect x="' + x + '" y="0" width="42" height="12" rx="2" fill="#d6dbde"/><rect x="' + (x + 2) + '" y="2.5" width="38" height="3.5" fill="#33404a"/>' +
        '<rect x="' + (x + 8) + '" y="2" width="4" height="9.5" fill="#f0b323"/><rect x="' + (x + 30) + '" y="2" width="4" height="9.5" fill="#f0b323"/><path d="M' + x + ' 9.5H' + (x + 42) + '" stroke="#9aa4ab" stroke-width=".6"/>';
    }
    s += '<path d="M220 0H226A6 6 0 0 1 232 6V12H220Z" fill="#f0b323"/><circle cx="229" cy="9" r="1.2" fill="#fff"/></g></g>';
    return s;
  }

  /* ---------------- scenes ---------------- */
  function bridgeScene(k, o) {
    o = o || {};
    var L = o.L || 128, R = o.R || 448, cx = (L + R) / 2, base = 288, rx = (R - L) / 2, ry = 150, irx = rx - 28, iry = ry - 26, deck = 282;
    var s = '<defs>' + lg(k + 'sky', ['#c7d7e2'], ['#c7d7e2', 0]) + lg(k + 'st', ['#66725f'], ['#3c4639']) + lg(k + 'pl', ['#e2d2b8'], ['#b79f80']) + lg(k + 'w', ['#7e9aac', .9], ['#7e9aac', 0]) + rg(k + 'sun', ['#f4c58d'], ['#eaa76b', 0]) + sailDefs(k) + ferryDefs(k) + '</defs>';
    s += '<g data-d="4"><path d="M' + (cx - 186) + ' 304A186 186 0 0 1 ' + (cx + 186) + ' 304Z" fill="url(#' + k + 'sky)"/><circle class="n-pulse" cx="' + (cx + 120) + '" cy="150" r="40" fill="url(#' + k + 'sun)"/></g>';
    s += '<g data-d="8">' + gull(150, 120, 1, 300, 13, 0) + gull(120, 150, .8, 340, 16, 4) + gull(200, 100, .7, 260, 11, 7) + '</g>';
    s += '<g data-d="10"><path d="M' + L + ' ' + base + 'A' + rx + ' ' + ry + ' 0 0 1 ' + R + ' ' + base + 'H' + (R - 28) + 'A' + irx + ' ' + iry + ' 0 0 0 ' + (L + 28) + ' ' + base + 'Z" fill="url(#' + k + 'st)"/>';
    var z = '', up = true;
    for (var x = L + 30; x <= R - 30; x += 16) { var yo = eY(x, cx, base, rx, ry) + 3, yi = eY(x, cx, base, irx, iry) - 1; z += (z ? 'L' : 'M') + x + ' ' + (up ? yo : yi).toFixed(1); up = !up; }
    s += '<path d="' + z + '" fill="none" stroke="#e7ecee" stroke-width=".7" opacity=".75"/>';
    var h = ''; for (var x2 = cx - 120; x2 <= cx + 120; x2 += 20) { var y = eY(x2, cx, base, irx, iry); if (y < deck - 6) h += 'M' + x2 + ' ' + y.toFixed(1) + 'V' + deck; }
    s += '<path d="' + h + '" stroke="#3c4639" stroke-width=".8"/>';
    s += train(deck - 13, L - 330, 820);
    s += '<rect x="' + (L - 46) + '" y="' + (deck - 1) + '" width="' + (R - L + 92) + '" height="7" fill="#3c4639"/>';
    [L - 44, R + 4].forEach(function (px) { s += '<rect x="' + px + '" y="224" width="40" height="116" fill="url(#' + k + 'pl)"/><rect x="' + (px + 6) + '" y="212" width="28" height="12" fill="#cdb898"/><path d="M' + (px + 20) + ' 236V330" stroke="#a88f70" stroke-width=".6"/>'; });
    s += '</g>';
    s += '<g data-d="5"><rect x="' + (L - 52) + '" y="340" width="' + (R - L + 104) + '" height="50" fill="url(#' + k + 'w)"/><path d="M' + (L + 28) + ' 340A' + irx + ' 52 0 0 0 ' + (R - 28) + ' 340" fill="none" stroke="#3c4639" stroke-opacity=".22"/>' + waves(L - 40, R + 40, 362, 14) + '</g>';
    s += '<g data-d="14"><g transform="translate(60 342) scale(.34)">' + sails(k) + '</g></g>';
    s += '<g data-d="18"><g class="n-run"><g class="n-click n-ferry" role="button" aria-label="Sound the ferry horn"><g transform="translate(400 356) scale(.36) translate(-300 -334)"><g class="n-bob">' + ferryBody(k) + '</g></g><rect x="330" y="318" width="140" height="40" fill="transparent"/></g>' + horn(400, 300) + '</g></g>';
    return s;
  }

  function usydScene(k) {
    var s = '<defs>' + lg(k + 'sky', ['#d4e0e8'], ['#d4e0e8', 0]) + lg(k + 'a', ['#e6c7a1'], ['#c79d6d']) + lg(k + 'b', ['#d8b285'], ['#b98b5d']) + lg(k + 'g', ['#7d905f', .8], ['#7d905f', 0]) + '</defs>';
    var arch = function (x, y, w, b) { return 'M' + x + ' ' + b + 'V' + (y + w) + 'Q' + x + ' ' + y + ' ' + (x + w / 2) + ' ' + (y - w * .4) + 'Q' + (x + w) + ' ' + y + ' ' + (x + w) + ' ' + (y + w) + 'V' + b + 'Z'; };
    s += '<g data-d="4"><path d="M124 344V214A176 176 0 0 1 476 214V344Z" fill="url(#' + k + 'sky)"/></g>';
    s += '<g data-d="7">' + gull(150, 96, .7, 300, 15, 2, '#5b6670') + '</g>';
    s += '<g data-d="9">';
    [[132, 236], [340, 236]].forEach(function (p) {
      s += '<rect x="' + p[0] + '" y="' + p[1] + '" width="128" height="108" fill="url(#' + k + 'b)"/>';
      for (var x = p[0]; x < p[0] + 128; x += 14) s += '<rect x="' + x + '" y="' + (p[1] - 7) + '" width="7" height="7" fill="#c49a6c"/>';
      var w = ''; for (var i = 0; i < 4; i++) w += arch(p[0] + 12 + i * 29, 300, 16, 344);
      s += '<path d="' + w + '" fill="' + PAPER + '"/>';
      for (var j = 0; j < 4; j++) s += '<rect class="n-twk" style="--del:' + (j * .7 + p[0] / 300) + 's" x="' + (p[0] + 16 + j * 29) + '" y="252" width="8" height="18" rx="4" fill="#9c7650" opacity=".55"/>';
    });
    s += '</g><g data-d="12">';
    s += '<rect x="260" y="140" width="80" height="204" fill="url(#' + k + 'a)"/>';
    s += '<rect x="250" y="120" width="14" height="224" fill="url(#' + k + 'b)"/><polygon points="250,120 257,78 264,120" fill="#b98b5d"/>';
    s += '<rect x="336" y="120" width="14" height="224" fill="url(#' + k + 'b)"/><polygon points="336,120 343,78 350,120" fill="#b98b5d"/>';
    for (var x = 266; x < 336; x += 12) s += '<rect x="' + x + '" y="133" width="6" height="7" fill="#c49a6c"/>';
    s += '<circle cx="300" cy="180" r="18" fill="' + PAPER + '" stroke="#1f2c33" stroke-width="1.1"/>';
    s += '<path class="n-spin" style="--dur:7s;--o:300px 180px" d="M300 180V166" stroke="#1f2c33" stroke-width="1.1" stroke-linecap="round"/><path class="n-spin" style="--dur:84s;--o:300px 180px" d="M300 180L308 185" stroke="#1f2c33" stroke-width="1.4" stroke-linecap="round"/>';
    s += '<path d="' + arch(282, 270, 36, 344) + arch(284, 220, 12, 244) + arch(304, 220, 12, 244) + '" fill="' + PAPER + '"/><path d="M300 140V344" stroke="#a7825b" stroke-width=".6" opacity=".7"/></g>';
    s += '<rect x="110" y="344" width="380" height="40" fill="url(#' + k + 'g)"/>';
    var conf = function (x, y, c, d, del, extra) { return '<rect class="n-fall' + (extra ? ' n-more' : '') + '" style="--del:' + del + 's;--dur:' + d + 's;--dx:' + ((x % 3) * 8 - 8) + 'px" x="' + x + '" y="' + y + '" width="6" height="3" fill="' + c + '"/>'; };
    s += '<g data-d="16">' + conf(170, 90, '#d8b46a', 5, 0) + conf(390, 80, '#1f2c33', 6, 1.4) + conf(440, 110, '#c79d6d', 5.5, 2.6) + conf(220, 70, '#7d905f', 6.5, 3.4) + conf(360, 60, '#d8b46a', 5, 4.1);
    s += '<g class="n-more">' + conf(140, 60, '#d8b46a', 3.2, 0, 1) + conf(200, 50, '#c0392b', 3.6, .6, 1) + conf(420, 50, '#1f2c33', 3.4, .3, 1) + conf(470, 70, '#d8b46a', 3, 1, 1) + conf(260, 40, '#7d905f', 3.8, 1.4, 1) + conf(330, 44, '#c0392b', 3.2, 1.8, 1) + '</g>';
    s += '<g class="n-toss"><polygon points="120,128 168,112 216,128 168,144" fill="#1f2c33"/><rect x="150" y="136" width="36" height="13" fill="#1f2c33"/><path d="M168 128L198 136V158" fill="none" stroke="#d8b46a" stroke-width="1.4"/><circle cx="198" cy="160" r="3" fill="#d8b46a"/></g></g>';
    return s;
  }

  function ferryScene(k) {
    var s = '<defs>' + rg(k + 'sun', ['#f1d07a'], ['#e8c063', 0]) + lg(k + 'city', ['#aab8c2'], ['#aab8c2', 0]) + lg(k + 'w', ['#6f93ab', .9], ['#6f93ab', 0]) + ferryDefs(k) + '</defs>';
    s += '<g data-d="3"><circle class="n-pulse" cx="210" cy="150" r="74" fill="url(#' + k + 'sun)"/></g>';
    s += '<g data-d="6">' + gull(120, 110, .8, 360, 14, 1) + gull(160, 90, .6, 300, 12, 6) + '</g>';
    var c = [[312, 146, 24, 160], [338, 106, 22, 200], [362, 160, 30, 146], [394, 124, 18, 182], [414, 176, 30, 130], [446, 150, 20, 156]];
    s += '<g data-d="8">';
    c.forEach(function (b, i) {
      s += '<rect x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '" fill="url(#' + k + 'city)"/>';
      for (var j = 0; j < 3; j++) s += '<rect class="n-twk" style="--del:' + ((i * 3 + j) * .37).toFixed(2) + 's" x="' + (b[0] + 4 + (j % 2) * 8) + '" y="' + (b[1] + 14 + j * 16) + '" width="4" height="5" fill="#fff4cf" opacity=".9"/>';
    });
    s += '<path d="M338 106L349 92L360 106Z" fill="#aab8c2"/><circle cx="403" cy="118" r="5" fill="none" stroke="#9aa9b4"/></g>';
    s += '<g data-d="14"><g class="n-run2"><g class="n-click n-ferry" role="button" aria-label="Sound the ferry horn"><g class="n-bob">' + ferryBody(k) + '</g></g>' + horn(300, 186) + '</g></g>';
    s += '<g data-d="5"><rect x="86" y="334" width="420" height="54" fill="url(#' + k + 'w)"/><path d="M140 334A70 26 0 0 0 70 360M140 334A110 40 0 0 0 40 376" fill="none" stroke="#fff" stroke-width="1.2" opacity=".7"/>' + waves(100, 500, 356, 13, .5) + waves(120, 480, 372, 10, .35) + '</g>';
    return s;
  }

  function operaScene(k) {
    var s = '<defs>' + lg(k + 'sky', ['#9db6c6'], ['#9db6c6', 0]) + rg(k + 'sun', ['#f2ad72'], ['#e99a5c', 0]) + lg(k + 'w', ['#7f9aab', .85], ['#7f9aab', 0]) + sailDefs(k) + ferryDefs(k) + '</defs>';
    s += '<g data-d="3"><path d="M134 304A166 166 0 0 1 466 304Z" fill="url(#' + k + 'sky)"/><g class="n-set"><circle class="n-pulse" cx="404" cy="166" r="58" fill="url(#' + k + 'sun)"/><circle cx="404" cy="166" r="24" fill="#eea267"/></g></g>';
    s += '<g data-d="7">' + gull(170, 120, .9, 280, 12, 0) + gull(140, 140, .7, 320, 15, 3) + gull(220, 104, .6, 240, 10, 6) + gull(300, 90, .5, 200, 9, 8.5) + '</g>';
    s += '<g data-d="11"><g class="n-glow"><g transform="translate(120 300)">' + sails(k) + '</g></g></g>';
    s += '<g data-d="5"><rect x="80" y="320" width="420" height="64" fill="url(#' + k + 'w)"/>' + waves(92, 480, 346, 15, .6) +
      '<path class="n-shim" d="M196 332H330" stroke="#f6e3c9" stroke-width="2"/><path class="n-shim" style="--del:1.2s" d="M220 340H300" stroke="#f6e3c9" stroke-width="2"/><path class="n-shim" style="--del:.6s" d="M380 330H440" stroke="#f6e3c9" stroke-width="2"/></g>';
    s += '<g data-d="16"><g class="n-pass"><g transform="translate(560 366) scale(.16) translate(-300 -334)"><g class="n-bob">' + ferryBody(k) + '</g></g></g></g>';
    return s;
  }

  function jacScene(k) {
    var s = '<defs>' + lg(k + 'a', ['#8a72c2'], ['#c8b9ec', .85]) + lg(k + 'b', ['#b29de0'], ['#e6ddf6', .7]) + lg(k + 'c', ['#6f5aa8'], ['#a993d8', .6]) + lg(k + 'w', ['#7a95a9', .85], ['#7a95a9', 0]) + '</defs>';
    var tree = function (x, b, r, f, extra, del) {
      var t = '<g class="n-sway" style="--del:' + del + 's"><rect x="' + (x - 2) + '" y="' + b + '" width="4" height="' + (338 - b) + '" fill="#5b4b4e" opacity=".85"/>';
      t += '<g class="n-bloom"><path d="M' + (x - r) + ' ' + b + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + r) + ' ' + b + 'Z" fill="url(#' + k + f + ')"/>';
      if (extra) t += '<path d="M' + x + ' ' + b + 'H' + (x + r * .8) + 'A' + (r * .8) + ' ' + (r * .8) + ' 0 0 1 ' + x + ' ' + (b + r * .8) + 'Z" fill="url(#' + k + 'c)" opacity=".7"/>';
      return t + '</g></g>';
    };
    s += '<g data-d="4"><circle class="n-pulse" cx="300" cy="150" r="46" fill="url(#' + k + 'c)" opacity=".5"/></g>';
    s += '<g data-d="10">' + tree(156, 262, 52, 'b', 0, 0) + tree(230, 220, 78, 'a', 1, .8) + tree(352, 186, 104, 'b', 1, 1.6) + tree(452, 246, 60, 'c', 0, 2.4) + '</g>';
    var cols = ['#9b86c8', '#b6a5da', '#8a72c2', '#cfc2e6'];
    var pet = '';
    for (var i = 0; i < 16; i++) {
      var x = 120 + (i * 53) % 360, y = 180 + (i * 37) % 90, more = i >= 10;
      pet += '<g transform="translate(' + x + ' ' + y + ')"' + (more ? ' class="n-more"' : '') + '><path class="n-fall" style="--del:' + ((i * .61) % 6).toFixed(2) + 's;--dur:' + (4.5 + (i % 4)) + 's;--dx:' + ((i % 5) * 9 - 18) + 'px;--rot:' + (200 + i * 20) + 'deg" d="M0 -6A6 6 0 0 1 0 6A6 6 0 0 1 0 -6Z" fill="' + cols[i % 4] + '"/></g>';
    }
    s += '<g data-d="16">' + pet + '</g>';
    s += '<g data-d="5"><rect x="86" y="338" width="430" height="48" fill="url(#' + k + 'w)"/><path d="M86 338H516" stroke="#5b4b4e" stroke-width="1"/>' + waves(100, 500, 360, 14) + '</g>';
    return s;
  }

  var ART = {
    hero: { f: bridgeScene, bg: '#f2ede4', p: { line: '#4d5648', sw: ['#3c4639', '#cdb898', '#c7d7e2', '#7e9aac'], cy: 250, cr: 200 } },
    usyd: { f: usydScene, bg: '#f3ece1', p: { line: '#6b5a48', sw: ['#1f2c33', '#c79d6d', '#e6c7a1', '#7d905f'] } },
    opera: { f: operaScene, bg: '#f4eee5', p: { line: '#6f6156', sw: ['#9db6c6', '#eea267', '#f4e9d9', '#7f9aab'], cx: 330 } },
    ferry: { f: ferryScene, bg: '#f1eee5', p: { line: '#3d5a4b', sw: ['#2f5c46', '#f4e8c6', '#d8b45a', '#6f93ab'] } },
    jac: { f: jacScene, bg: '#f2eef1', p: { line: '#6a5d80', sw: ['#8a72c2', '#b29de0', '#5b4b4e', '#7a95a9'], cy: 230 } }
  };

  /* paper grain shared by every art */
  document.body.insertAdjacentHTML('afterbegin', '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><filter id="n-paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .3  0 0 0 0 .24  0 0 0 0 .18  0 0 0 .3 0"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs></svg>');

  var n = 0;
  document.querySelectorAll('.n-art[data-art]').forEach(function (el) {
    var a = ART[el.dataset.art], k = 'n' + (n++) + '-';
    el.style.setProperty('--bg', a.bg);
    el.innerHTML = '<svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="600" height="400" fill="' + a.bg + '"/>' + frame(a.p) + a.f(k) +
      '<rect width="600" height="400" fill="#000" filter="url(#n-paper)" opacity=".5" pointer-events="none"/></svg>';
  });

  /* mouse parallax: each layer drifts by its own depth */
  var fine = matchMedia('(pointer: fine)').matches, still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (fine && !still) document.querySelectorAll('.n-art').forEach(function (el) {
    var layers = [].slice.call(el.querySelectorAll('[data-d]')), tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    var tick = function () {
      x += (tx - x) * .08; y += (ty - y) * .08;
      layers.forEach(function (g) { var d = +g.dataset.d; g.setAttribute('transform', 'translate(' + (x * d).toFixed(2) + ' ' + (y * d).toFixed(2) + ')'); });
      raf = Math.abs(tx - x) + Math.abs(ty - y) > .001 ? requestAnimationFrame(tick) : 0;
    };
    var host = el.closest('.n-row') || el;
    host.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - .5) * -1.2; ty = ((e.clientY - r.top) / r.height - .5) * -1.2; if (!raf) raf = requestAnimationFrame(tick); });
    host.addEventListener('pointerleave', function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tick); });
  });

  /* the ferry horn: a synthesised two-blast horn and the rings on the drawing */
  var ctx = null;
  function blast() {
    var C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    ctx = ctx || new C(); if (ctx.state === 'suspended') ctx.resume();
    [0, .62].forEach(function (t0) {
      var t = ctx.currentTime + t0, g = ctx.createGain(), f = ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = 820; f.Q.value = 2;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.2, t + .06); g.gain.setValueAtTime(.2, t + .42); g.gain.linearRampToValueAtTime(0, t + .54);
      [116.5, 146.8, 174.6].forEach(function (fr) { var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(fr * .97, t); o.frequency.linearRampToValueAtTime(fr, t + .08); o.connect(f); o.start(t); o.stop(t + .56); });
      f.connect(g); g.connect(ctx.destination);
    });
  }
  document.querySelectorAll('.n-ferry').forEach(function (f) {
    f.setAttribute('tabindex', '0');
    var svg = f.closest('svg');
    var go = function (e) { e.preventDefault(); e.stopPropagation(); blast(); svg.classList.remove('is-toot'); void svg.getBoundingClientRect(); svg.classList.add('is-toot'); setTimeout(function () { svg.classList.remove('is-toot'); }, 1600); };
    f.addEventListener('click', go);
    f.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') go(e); });
  });

  /* photos and frames open their album, exactly like the album cards in the portfolio */
  document.querySelectorAll('[data-open]').forEach(function (el) {
    el.style.cursor = 'pointer';
    el.addEventListener('click', function (e) {
      var card = document.querySelector('.album[data-album="' + el.dataset.open + '"]');
      if (card) { e.preventDefault(); card.click(); }
    });
  });


  /* ---------- every jump plays a chapter card (title + flying motifs) instead of the black shutter ---------- */
  var lastHref = null, lastXY = null;
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (a) { lastHref = a.getAttribute('href'); lastXY = [e.clientX, e.clientY]; }
  }, true);
  function rnd(i, k) { var x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); }
  function use(id) { return '<svg><use href="#' + id + '"/></svg>'; }
  var PIN = '<svg viewBox="0 0 30 40"><path d="M15 39C15 39 2 23 2 14a13 13 0 0 1 26 0c0 9-13 25-13 25Z" fill="#c0392b"/><circle cx="15" cy="14" r="5" fill="#fff"/></svg>';
  var PIN2 = '<svg viewBox="0 0 30 40"><path d="M15 39C15 39 2 23 2 14a13 13 0 0 1 26 0c0 9-13 25-13 25Z" fill="#1f2326"/><circle cx="15" cy="14" r="5" fill="#f1ece3"/></svg>';
  var GULL = '<svg viewBox="0 0 40 20"><path d="M2 14Q11 2 20 12Q29 2 38 14" fill="none" stroke="#3a3f44" stroke-width="3" stroke-linecap="round"/></svg>';
  var TAG = '<svg viewBox="0 0 60 34"><rect width="60" height="34" rx="4" fill="#2f4fd0"/><path d="M44 0v34" stroke="#fff" stroke-dasharray="3 3"/><text x="8" y="21" font-family="JetBrains Mono, monospace" font-size="10" fill="#fff">QUOTE</text></svg>';
  function fx(kind, items, n) {
    var out = '<div class="fx fx--' + kind + '" aria-hidden="true">';
    for (var i = 0; i < n; i++) {
      var it = items[i % items.length], w = it[1] + Math.round(rnd(i, 1) * it[2]);
      if (kind === 'toss') out += '<i class="fx__i" style="--x:' + Math.round(4 + rnd(i, 2) * 90) + '%;--d:-' + (rnd(i, 3) * 7).toFixed(1) + 's;--t:' + (6 + rnd(i, 4) * 3).toFixed(1) + 's;--r:' + Math.round((rnd(i, 5) - .5) * 900) + 'deg;--dx:' + Math.round((rnd(i, 6) - .5) * 160) + 'px;--w:' + w + 'px">' + it[0] + '</i>';
      else if (kind === 'burst') { var ang = i / n * Math.PI * 2; out += '<i class="fx__i" style="--dx:' + Math.round(Math.cos(ang) * (34 + rnd(i, 7) * 20)) + 'vw;--dy:' + Math.round(Math.sin(ang) * (30 + rnd(i, 8) * 18)) + 'vh;--d:-' + (i * .3).toFixed(2) + 's;--t:6s;--r:' + Math.round((rnd(i, 9) - .5) * 360) + 'deg;--w:' + w + 'px">' + it[0] + '</i>'; }
      else out += '<i class="fx__i" style="--x:' + Math.round(4 + rnd(i, 2) * 90) + '%;--d:-' + (rnd(i, 3) * 10).toFixed(1) + 's;--t:' + (9 + rnd(i, 4) * 5).toFixed(1) + 's;--r:' + Math.round((rnd(i, 5) - .5) * 500) + 'deg;--sw:' + Math.round(30 + rnd(i, 6) * 40) + 'px;--w:' + w + 'px">' + it[0] + '</i>';
    }
    return out + '</div>';
  }
  var PET = function (c) { return '<svg viewBox="0 0 30 22"><path d="M0 22C0 8 10 0 30 0C30 14 20 22 0 22Z" fill="' + c + '"/></svg>'; };
  var DOG = '<div class="n-dog" aria-hidden="true"><div class="n-dog__walk"><svg viewBox="0 0 230 180" overflow="visible"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><ellipse class="n-dog__shadow" cx="105" cy="170" rx="62" ry="6" fill="#1f2326" opacity=".12" stroke="none"/><g class="n-dog__body"><path class="n-dog__tail" d="M44 112c-14-4-20-14-18-24" stroke="#3b2a1c" stroke-width="3" fill="none"/><g class="n-dog__leg n-dog__leg--b2"><path d="M62 128v32c0 5 12 5 12 0v-30" fill="#e8c38a" stroke="#3b2a1c" stroke-width="2.6"/></g><g class="n-dog__leg n-dog__leg--f2"><path d="M118 128v32c0 5 12 5 12 0v-30" fill="#e8c38a" stroke="#3b2a1c" stroke-width="2.6"/></g><path d="M50 104c0-26 30-38 62-36 30 2 40 18 38 40-2 22-20 30-50 30s-50-8-50-34Z" fill="#e8c38a" stroke="#3b2a1c" stroke-width="2.6"/><path d="M52 98c10-22 40-30 66-28 18 2 28 10 32 22l-6 34c-30 10-66 10-90-2Z" fill="#8a5a34" stroke="#3b2a1c" stroke-width="2.6"/><path d="M66 82l14 50M100 72v62" stroke="#6b4428" stroke-width="2"/><circle cx="108" cy="96" r="2.4" fill="#3b2a1c" stroke="none"/><circle cx="108" cy="112" r="2.4" fill="#3b2a1c" stroke="none"/><path d="M60 88c14-14 50-20 80-10l-4 14c-26-8-56-4-72 8Z" fill="#a46e3f" stroke="#3b2a1c" stroke-width="2.2"/><g class="n-dog__leg n-dog__leg--b1"><path d="M70 130v32c0 5 13 5 13 0v-30" fill="#efcf9b" stroke="#3b2a1c" stroke-width="2.6"/></g><g class="n-dog__leg n-dog__leg--f1"><path d="M126 130v32c0 5 13 5 13 0v-30" fill="#efcf9b" stroke="#3b2a1c" stroke-width="2.6"/></g><g class="n-dog__arm"><path d="M134 96c14 6 26 14 34 26" stroke="#3b2a1c" stroke-width="13"/><path d="M134 96c14 6 26 14 34 26" stroke="#8a5a34" stroke-width="8"/><circle cx="170" cy="124" r="6" fill="#efcf9b" stroke="#3b2a1c" stroke-width="2.4"/><path d="M174 128l14 14" stroke="#3b2a1c" stroke-width="6"/><circle cx="198" cy="152" r="15" fill="#dff0f6" fill-opacity=".55" stroke="#3b2a1c" stroke-width="3.4"/><path class="n-dog__glint" d="M190 146a9 9 0 0 1 8-5" stroke="#fff" stroke-width="2.6"/></g><g class="n-dog__head"><path d="M118 60c-4-28 14-46 40-46s44 18 40 46c-3 22-20 32-40 32s-37-10-40-32Z" fill="#efcf9b" stroke="#3b2a1c" stroke-width="2.6"/><path class="n-dog__ear" d="M128 34c-14 2-20 18-16 34 3 10 12 10 16 2" fill="#e0b578" stroke="#3b2a1c" stroke-width="2.6"/><g class="n-dog__eyes"><circle cx="150" cy="50" r="3.4" fill="#2a1d12" stroke="none"/><circle cx="178" cy="49" r="3.4" fill="#2a1d12" stroke="none"/><circle cx="151" cy="48.6" r="1" fill="#fff" stroke="none"/><circle cx="179" cy="47.6" r="1" fill="#fff" stroke="none"/></g><path d="M146 42c3-2 6-2 8 0M174 41c3-2 6-2 8 0" stroke="#3b2a1c" stroke-width="1.6"/><ellipse cx="166" cy="62" rx="6" ry="4.4" fill="#2a1d12" stroke="none"/><ellipse class="n-dog__mouth" cx="166" cy="74" rx="4" ry="5" fill="#5a2a22" stroke="#3b2a1c" stroke-width="1.8"/><path d="M120 30c6-22 70-26 78 0l6 4c-30-6-60-6-92 2Z" fill="#a46e3f" stroke="#3b2a1c" stroke-width="2.4"/><path d="M122 32c4-18 64-22 74-2" fill="#a46e3f" stroke="#3b2a1c" stroke-width="2.4"/><path d="M140 14v18M160 10v20M180 14v16M128 24h66" stroke="#7c4f2a" stroke-width="1.4"/><path d="M196 30c10 0 16 4 14 8l-14-2Z" fill="#8a5a34" stroke="#3b2a1c" stroke-width="2.2"/><circle cx="158" cy="10" r="3" fill="#7c4f2a" stroke="#3b2a1c" stroke-width="1.6"/></g></g><g class="n-dog__q"><text x="206" y="36" font-family="Archivo, sans-serif" font-weight="700" font-size="22" fill="#c0392b">?</text></g></g></svg></div><div class="n-dog__prints"><i></i><i></i><i></i><i></i><i></i></div></div>';
  var CARDS = {
    '#top': { n: 'HQ', t: 'Ho Quoc', s: 'Photography · Sydney', bg: '#f1ece3', fx: fx('toss', [[use('fx-print'), 40, 30], [use('fx-print2'), 40, 30], [use('fx-strip'), 110, 40]], 14) },
    '#trending': { n: '01', t: 'Trending', s: 'Jacaranda season · now', bg: '#ece6f2', fx: fx('drift', [[PET('#9a86c8'), 26, 18], [PET('#b6a5da'), 22, 16], [PET('#7f6bb3'), 24, 14], [use('fx-bloom'), 44, 24]], 26) },
    '#places': { n: '02', t: 'Places', s: 'Where we can shoot', bg: '#e3ebef', x: DOG, fx: fx('toss', [[PIN, 34, 26], [PIN2, 30, 22], [GULL, 44, 24]], 18) },
    '#recent': { n: '03', t: 'Recent', s: 'Fresh off the card', bg: '#efe7da', fx: fx('burst', [[use('fx-print'), 54, 30], [use('fx-strip'), 130, 40], [use('fx-print2'), 54, 30], [use('fx-canister'), 44, 16]], 14) },
    '#work': { n: '04', t: 'Portfolio', s: 'Every shoot, every chapter', bg: '#e9e2d5', fx: fx('burst', [[use('fx-cap'), 70, 30], [use('fx-instax'), 70, 20], [use('fx-rings'), 70, 20], [use('fx-print'), 54, 24], [use('fx-heart'), 40, 20]], 16) },
    '#book': { n: '05', t: 'Pricelist', s: 'Prices & booking', bg: '#efe2dc', fx: fx('drift', [[TAG, 60, 20], [use('fx-heart'), 34, 20], [use('fx-print'), 44, 20], [use('fx-rose'), 40, 20]], 20) }
  };
  function cardFor(href) {
    var el = href && document.querySelector(href); if (!el) return null;
    var tx = el.previousElementSibling;
    while (tx && tx.nodeType === 1 && !tx.classList.contains('tx') && tx.tagName === 'SCRIPT') tx = tx.previousElementSibling;
    if (tx && tx.classList && tx.classList.contains('tx')) {
      var st = tx.querySelector('.tx__stick'), lab = st.querySelector('.tx__label');
      var tt = function (sel) { var e = lab && lab.querySelector(sel); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; };
      var fxl = st.querySelector('.fx');
      return { html: '<i class="tx__wash"></i>' + (fxl ? fxl.outerHTML : '') + '<div class="tx__label"><span>' + tt('span') + '</span><b>' + tt('b') + '</b><small>' + tt('small') + '</small></div>', to: tx.style.getPropertyValue('--to'), cls: tx.className.replace(/\btx\b/, '').trim() };
    }
    var c = CARDS[href] || CARDS['#' + (el.closest('[id]') || {}).id];
    if (!c) return null;
    return { html: '<i class="tx__wash"></i>' + c.fx + '<div class="tx__label"><span>' + c.n + '</span><b>' + c.t + '</b><small>' + c.s + '</small>' + (c.x || '') + '</div>', to: c.bg, cls: '' };
  }
  function chapter(mid) {
    var c = cardFor(lastHref);
    if (!c || still) { mid && mid(); return; }
    var o = document.createElement('div');
    o.className = 'n-txo ' + c.cls; o.setAttribute('aria-hidden', 'true');
    o.style.setProperty('--to', c.to);
    if (lastXY) { o.style.setProperty('--cx', lastXY[0] + 'px'); o.style.setProperty('--cy', lastXY[1] + 'px'); }
    o.innerHTML = '<div class="tx__stick" style="--from:' + c.to + '">' + c.html + '</div>';
    document.body.appendChild(o);
    requestAnimationFrame(function () { requestAnimationFrame(function () { o.classList.add('is-in'); }); });
    setTimeout(function () { mid && mid(); }, 680);
    setTimeout(function () { o.classList.add('is-out'); }, 1700);
    setTimeout(function () { o.remove(); }, 2300);
  }
  if (window.NB) window.NB.shutter = chapter;
  // without the portfolio's scroll library, jumps still get the card
  if (!window.NB || !window.gsap) document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var el = document.querySelector(a.getAttribute('href')); if (!el) return;
      e.preventDefault(); lastHref = a.getAttribute('href'); lastXY = [e.clientX, e.clientY];
      chapter(function () { el.scrollIntoView({ behavior: 'auto' }); });
    });
  });

  /* floating quick buttons: next chapter + book now */
  (function () {
    var nx = document.querySelector('.n-fab__next'), bk = document.querySelector('.n-fab__book'); if (!nx) return;
    var SEQ = [['#top', 'Top'], ['#trending', 'Trending'], ['#places', 'Places'], ['#recent', 'Recent'], ['#work', 'Portfolio'], ['#graduation', 'Graduation'], ['#portraits', 'Portraits'], ['#weddings', 'Weddings'], ['#events', 'Events'], ['#book', 'Prices & booking']]
      .map(function (s) { return [document.querySelector(s[0]), s[0], s[1]]; }).filter(function (s) { return s[0]; });
    var lab = nx.querySelector('b'), book = document.querySelector('#book');
    function upd() {
      var y = innerHeight * .4, next = null;
      for (var i = 0; i < SEQ.length; i++) if (SEQ[i][0].getBoundingClientRect().top > y + 4) { next = SEQ[i]; break; }
      if (next) { nx.setAttribute('href', next[1]); lab.textContent = next[2]; nx.classList.remove('is-gone'); } else nx.classList.add('is-gone');
      var r = book.getBoundingClientRect(); bk.classList.toggle('is-gone', r.top < innerHeight * .6);
      if (next && next[1] === '#book') nx.classList.add('is-gone');
    }
    addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); setInterval(upd, 800); upd();
  })();

  /* the bar gets a hairline once you scroll; the portfolio's viewfinder hides while you're on the new pages */
  var bar = document.querySelector('.n-bar');
  var zones = [].slice.call(document.querySelectorAll('[data-nzone]')), root = document.documentElement;
  var onScroll = function () {
    bar && bar.classList.toggle('is-stuck', scrollY > 10);
    var mid = innerHeight / 2, inZone = zones.some(function (z) { var r = z.getBoundingClientRect(); return r.top < mid && r.bottom > mid; });
    root.classList.toggle('n-zone', inZone);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
})();
