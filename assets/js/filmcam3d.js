// Ho Quoc: a 3D 35mm film camera for the weddings section.
// Modelled from primitives (no third-party model). Scroll it into view: the lever winds on, the strip of film
// feeds out across the section, the shutter fires, and the new frame develops from negative to photo.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const wrap = document.querySelector('.feature--film');
const canvas = wrap && wrap.querySelector('.feature__gl');
const root = document.documentElement;
if (canvas && !root.classList.contains('no-gl') && window.gsap) start();
else if (wrap) wrap.classList.add('feature--static');

function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { wrap.classList.add('feature--static'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xfff6ea, 0xd9b8b0, 1));
  const key = new THREE.DirectionalLight(0xffffff, 1.8); key.position.set(-4, 7, 8); scene.add(key);
  const flashLight = new THREE.PointLight(0xffffff, 0, 30); flashLight.position.set(-5, 3, 5); scene.add(flashLight);

  const canvasTex = (w, h, draw) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; return t;
  };

  // ---------- the camera ----------
  const rig = new THREE.Group(); scene.add(rig);
  const body = new THREE.Group(); rig.add(body);
  const leatherTex = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { const v = 90 + Math.random() * 90 | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 1.5 + Math.random() * 3, 0, 7); g.fill(); }
  });
  leatherTex.colorSpace = THREE.NoColorSpace; leatherTex.wrapS = leatherTex.wrapT = THREE.RepeatWrapping; leatherTex.repeat.set(3, 2);
  const knurlTex = canvasTex(512, 16, (g, w, h) => {
    for (let x = 0; x < w; x += 6) { const gr = g.createLinearGradient(x, 0, x + 6, 0); gr.addColorStop(0, '#000'); gr.addColorStop(.5, '#fff'); gr.addColorStop(1, '#000'); g.fillStyle = gr; g.fillRect(x, 0, 6, h); }
  });
  knurlTex.colorSpace = THREE.NoColorSpace; knurlTex.wrapS = THREE.RepeatWrapping; knurlTex.repeat.set(3, 1);
  const M = {
    chrome: new THREE.MeshStandardMaterial({ color: 0xd8d3ca, metalness: 1, roughness: .26 }),
    chromeKnurl: new THREE.MeshStandardMaterial({ color: 0xd8d3ca, metalness: 1, roughness: .32, bumpMap: knurlTex, bumpScale: 2.4 }),
    blackKnurl: new THREE.MeshStandardMaterial({ color: 0x141313, metalness: .35, roughness: .5, bumpMap: knurlTex, bumpScale: 3 }),
    leather: new THREE.MeshStandardMaterial({ color: 0x5a2f22, metalness: .05, roughness: .78, bumpMap: leatherTex, bumpScale: 2.2 }),
    black: new THREE.MeshStandardMaterial({ color: 0x111010, metalness: .4, roughness: .45 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x0c0c14, roughness: .03, clearcoat: 1, iridescence: 1, iridescenceIOR: 1.6, iridescenceThicknessRange: [200, 700] }),
    flash: new THREE.MeshStandardMaterial({ color: 0xf6f3ee, emissive: 0xffffff, emissiveIntensity: 0, roughness: .2 }),
  };
  const add = (geo, mat, x = 0, y = 0, z = 0, parent = body) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const onZ = (geo, mat, x, y, z) => { const m = add(geo, mat, x, y, z); m.rotation.x = Math.PI / 2; return m; };   // cylinder along the lens axis

  const W = 5.2, D = 1.5, Y0 = -1.35, Y1 = .7, Y2 = 1.2, front = D / 2;
  add(new RoundedBoxGeometry(W, Y1 - Y0, D, 5, .18), M.leather, 0, (Y0 + Y1) / 2, 0);
  add(new RoundedBoxGeometry(W + .02, Y2 - Y1, D + .02, 5, .14), M.chrome, 0, (Y1 + Y2) / 2, 0);
  add(new RoundedBoxGeometry(W + .03, .24, D + .03, 4, .08), M.chrome, 0, Y0 + .06, 0);
  add(new RoundedBoxGeometry(W - .1, .04, D - .04, 2, .02), M.black, 0, Y1, 0);

  // pentaprism hump, with a name plate on its front
  {
    const s = new THREE.Shape();
    s.moveTo(-1.05, 0); s.lineTo(1.05, 0); s.lineTo(.62, .8); s.lineTo(-.62, .8); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 1.1, bevelEnabled: true, bevelThickness: .05, bevelSize: .05, bevelSegments: 3 });
    g.translate(0, 0, -.55);
    add(g, M.chrome, 0, Y2 - .02, 0);
    const plate = canvasTex(512, 110, (g2, w, h) => {
      g2.fillStyle = '#d8d3ca'; g2.fillRect(0, 0, w, h);
      g2.fillStyle = '#1b1716'; g2.font = '600 58px "Archivo", system-ui, sans-serif'; g2.textAlign = 'center'; g2.textBaseline = 'middle';
      g2.fillText('HO QUOC', w / 2, h / 2 + 3);
    });
    add(new THREE.PlaneGeometry(1.2, .26), new THREE.MeshStandardMaterial({ map: plate, metalness: .75, roughness: .35 }), 0, Y2 + .32, .615);
  }
  // a flash on the hot shoe
  add(new THREE.BoxGeometry(.6, .1, .5), M.black, 0, Y2 + .83, 0);
  add(new RoundedBoxGeometry(1.25, .62, .7, 3, .07), M.black, 0, Y2 + 1.18, 0);
  add(new RoundedBoxGeometry(1.02, .42, .06, 3, .03), M.flash, 0, Y2 + 1.18, .36);

  // top plate: shutter dial and button, frame counter, advance lever, rewind knob
  const dialTop = canvasTex(512, 512, (g, w) => {
    g.fillStyle = '#c2bcb2'; g.fillRect(0, 0, w, w); g.translate(w / 2, w / 2);
    g.font = '600 40px "JetBrains Mono", ui-monospace, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    ['B', '1', '2', '4', '8', '15', '30', '60', '125', '250', '500', '1000'].forEach((t, i, a) => {
      g.save(); g.rotate(i / a.length * Math.PI * 2); g.translate(0, -w * .37); g.fillStyle = t === '125' ? '#b3262d' : '#1b1716'; g.fillText(t, 0, 0); g.restore();
    });
  });
  add(new THREE.CylinderGeometry(.48, .48, .22, 64, 1, true), M.chromeKnurl, -1.3, Y2 + .11, .05);
  add(new THREE.CircleGeometry(.48, 64), new THREE.MeshStandardMaterial({ map: dialTop, metalness: .7, roughness: .34 }), -1.3, Y2 + .221, .05).rotation.x = -Math.PI / 2;
  const button = add(new THREE.CylinderGeometry(.12, .13, .18, 32), M.chrome, -1.3, Y2 + .31, .05);
  add(new THREE.CylinderGeometry(.2, .2, .05, 32), M.black, -2.05, Y2 + .03, .36);
  add(new THREE.CylinderGeometry(.26, .28, .14, 40), M.chrome, -2.05, Y2 + .07, -.28);
  const lever = new THREE.Group(); lever.position.set(-2.05, Y2 + .16, -.28); body.add(lever);
  add(new THREE.BoxGeometry(1.15, .05, .15), M.chrome, .58, 0, -.02, lever);
  add(new THREE.CylinderGeometry(.09, .09, .22, 20), M.black, 1.12, .1, -.02, lever);
  add(new THREE.CylinderGeometry(.42, .42, .2, 48, 1, true), M.chromeKnurl, 1.9, Y2 + .1, 0);
  add(new THREE.CircleGeometry(.42, 48), M.chrome, 1.9, Y2 + .2, 0).rotation.x = -Math.PI / 2;
  add(new THREE.BoxGeometry(.5, .05, .1), M.chrome, 1.9, Y2 + .24, 0);

  // lens: chrome barrel, knurled focus ring, and the maker's ring around the glass
  const AY = -.2;
  onZ(new THREE.CylinderGeometry(1.2, 1.26, .12, 72), M.chrome, 0, AY, front + .05);
  onZ(new THREE.CylinderGeometry(1.1, 1.14, .5, 72), M.chrome, 0, AY, front + .35);
  onZ(new THREE.CylinderGeometry(1.2, 1.2, .55, 90, 1, true), M.blackKnurl, 0, AY, front + .85);
  const scaleTex = canvasTex(1024, 64, (g, w, h) => {
    g.fillStyle = '#c9c4ba'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1b1716'; g.font = '600 30px "JetBrains Mono", monospace'; g.textBaseline = 'middle';
    ['∞', '10', '5', '3', '2', '1.5', '1', '.8', '.6', '.45'].forEach((t, i) => g.fillText(t, 20 + i * 100, h / 2));
  });
  onZ(new THREE.CylinderGeometry(1.14, 1.14, .3, 90, 1, true), new THREE.MeshStandardMaterial({ map: scaleTex, metalness: .7, roughness: .35 }), 0, AY, front + 1.27);
  onZ(new THREE.CylinderGeometry(1.1, 1.16, .14, 72), M.chrome, 0, AY, front + 1.48);
  const ringTex = canvasTex(1024, 1024, (g, w) => {
    g.fillStyle = '#0c0c0c'; g.fillRect(0, 0, w, w); g.translate(w / 2, w / 2);
    g.fillStyle = '#d9d4ca'; g.font = '500 52px "Archivo", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    [...'HO QUOC 50mm 1:1.4  ·  FILM  ·  '].forEach((ch, i, a) => { g.save(); g.rotate(i / a.length * Math.PI * 2); g.translate(0, -w * .43); g.fillText(ch, 0, 0); g.restore(); });
  });
  add(new THREE.CircleGeometry(1.05, 72), new THREE.MeshStandardMaterial({ map: ringTex, roughness: .5 }), 0, AY, front + 1.555);
  add(new THREE.SphereGeometry(1.4, 48, 16, 0, Math.PI * 2, 0, .6), M.glass, 0, AY, front + 1.56 - 1.4 * Math.cos(.6)).rotation.x = Math.PI / 2;

  // front details and strap lugs
  onZ(new THREE.CylinderGeometry(.14, .14, .1, 24), M.chrome, -1.85, -.75, front + .03);
  onZ(new THREE.CylinderGeometry(.16, .16, .08, 24), M.black, 1.85, .25, front + .03);
  [-1, 1].forEach((s) => { const lug = add(new THREE.TorusGeometry(.13, .04, 10, 24), M.chrome, s * (W / 2 + .06), Y1 + .25, 0); lug.rotation.y = Math.PI / 2; });
  body.rotation.set(.2, -.38, 0);

  // ---------- the strip of film ----------
  // One ribbon that stays put, with the film sliding along it. Frames live side by side in a canvas texture.
  const N = 6, P = 3.55, FW = 3.3, FH = 2.2, BAND = 3;
  const CELL = 682, PX = CELL / P, BH = Math.round(BAND * PX);
  const atlas = document.createElement('canvas'); atlas.width = CELL * N; atlas.height = BH;
  const filmTex = new THREE.CanvasTexture(atlas);
  filmTex.colorSpace = THREE.NoColorSpace; filmTex.wrapS = THREE.RepeatWrapping; filmTex.anisotropy = maxAniso;

  const data = JSON.parse(document.getElementById('filmcam-data').textContent || '[]');
  const soon = ['First look', 'Ceremony', 'Pre-wedding', 'Family photos', 'Reception', 'Last dance'];
  const items = Array.from({ length: N }, (_, i) => data.length ? data[i % data.length] : { cap: soon[i] });
  const loadImg = (src) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
  const paint = (imgs) => {
    const g = atlas.getContext('2d');
    g.clearRect(0, 0, atlas.width, BH);
    g.fillStyle = '#1c1a17'; g.fillRect(0, 0, atlas.width, BH);
    const fw = FW * PX, fh = FH * PX, fy = (BH - fh) / 2;
    items.forEach((it, k) => {
      const cx = (N - 1 - k) * CELL, fx = cx + (CELL - fw) / 2, im = imgs[k];
      if (im) {   // cover the frame, like object-fit
        const s = Math.max(fw / im.width, fh / im.height), sw = fw / s, sh = fh / s;
        g.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, fx, fy, fw, fh);
      } else {
        const gr = g.createLinearGradient(fx, fy, fx + fw, fy + fh);
        gr.addColorStop(0, '#e8dccb'); gr.addColorStop(.55, '#e2d3bd'); gr.addColorStop(1, '#d9c3a5');
        g.fillStyle = gr; g.fillRect(fx, fy, fw, fh);
        g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(27, 26, 23,.85)';
        g.font = '700 92px "Archivo", system-ui, sans-serif'; g.fillText(it.cap.split(' · ')[0], fx + fw / 2, fy + fh / 2 - 16);
        g.font = '500 24px "JetBrains Mono", monospace'; g.fillStyle = 'rgba(27, 26, 23,.6)'; g.fillText('PHOTO COMING SOON', fx + fw / 2, fy + fh / 2 + 52);
      }
      g.fillStyle = 'rgba(242,166,90,.95)'; g.font = '600 20px "JetBrains Mono", monospace'; g.textBaseline = 'middle'; g.textAlign = 'left';
      g.fillText('HO QUOC 400', cx + 60, 58);
      const fr = String(k + 1).padStart(2, '0'); g.textAlign = 'right'; g.fillText(`${fr} ▸ ${fr}A`, cx + CELL - 60, BH - 58);
    });
    // punch the sprocket holes
    g.globalCompositeOperation = 'destination-out';
    const step = CELL / 8;
    for (let x = 0; x < atlas.width; x += step) { [10, BH - 10 - 28].forEach((y) => { g.beginPath(); g.roundRect(x + step * .25, y, step * .5, 28, 6); g.fill(); }); }
    g.globalCompositeOperation = 'source-over';
    filmTex.needsUpdate = true;
  };
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  fontsReady.then(() => paint(items.map(() => null)));
  Promise.all([fontsReady, ...items.map((it) => it.src ? loadImg(it.src) : Promise.resolve(null))]).then(([, ...imgs]) => { if (imgs.some(Boolean)) paint(imgs); });

  const film = new THREE.ShaderMaterial({
    transparent: true, side: THREE.DoubleSide,
    uniforms: { t: { value: filmTex }, off: { value: 0 }, cur: { value: 0 }, dev: { value: 0 }, shot: { value: 0 }, P: { value: P }, N: { value: N }, L: { value: 1 }, fade: { value: 2 }, fw: { value: FW / P }, fh: { value: FH / BAND } },
    vertexShader: `attribute float arc; attribute float shade; varying float vS, vL; varying vec2 vUv;
      void main(){ vS = arc; vL = shade; vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: `uniform sampler2D t; uniform float off, cur, dev, shot, P, N, L, fade, fw, fh; varying float vS, vL; varying vec2 vUv;
      void main(){
        float a = vS - off;
        vec4 c = texture2D(t, vec2(a / (P * N), vUv.y));
        if (c.a < .5) discard;
        float di = mod(floor(a / P) - cur, N), fx = fract(a / P);
        float d = di < .5 ? dev : (di < min(shot, 4.) - .5 ? 1. : 0.);
        vec2 q = abs(vec2(fx, vUv.y) - .5) * 2.;
        vec3 col = c.rgb;
        if (q.x < fw && q.y < fh) {
          vec3 neg = (1. - c.rgb) * vec3(1., .6, .4) * .85 + vec3(.09, .025, 0.);
          col = mix(neg, c.rgb, smoothstep(0., 1., d));
        }
        gl_FragColor = vec4(col * vL, smoothstep(L, L - fade, vS));
      }`,
  });
  const strip = new THREE.Mesh(new THREE.BufferGeometry(), film);
  rig.add(strip);
  let S0 = 0;   // how far along the ribbon the newest frame sits
  const buildRibbon = (x0, x1, zAt, y, xFocus, fade) => {
    const seg = 300, pos = [], uv = [], arc = [], shade = [], idx = [];
    let s = 0, px = x0, pz = zAt(x0); S0 = 0; let found = false;
    for (let i = 0; i <= seg; i++) {
      const x = x0 + (x1 - x0) * i / seg, z = zAt(x);
      s += Math.hypot(x - px, z - pz); px = x; pz = z;
      if (!found && x >= xFocus) { S0 = s; found = true; }
      pos.push(x, y + BAND / 2, z, x, y - BAND / 2, z);
      uv.push(0, 1, 0, 0); arc.push(s, s);
      const l = .84 + .16 * Math.sin(x * 1.1 + .6) * .5 + .08; shade.push(l, l);
      if (i < seg) { const b = i * 2; idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); }
    }
    const g = strip.geometry; g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setAttribute('arc', new THREE.Float32BufferAttribute(arc, 1));
    g.setAttribute('shade', new THREE.Float32BufferAttribute(shade, 1));
    g.setIndex(idx); g.computeBoundingSphere();
    film.uniforms.L.value = s; film.uniforms.fade.value = fade;
  };
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  // ---------- sizing: wide, the strip runs out of the camera across the section; narrow, it sits under the camera ----------
  let k = -1, cx = 0;       // k: the newest exposed frame
  const offFor = (n) => S0 + (n + .5) * P;
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    cam.aspect = r.width / r.height; cam.updateProjectionMatrix();
    if (cam.aspect > 1.5) {
      body.position.set(-5, .05, 0);
      buildRibbon(-3.6, 5.6, (x) => -1.6 + 4.8 * smooth(-2.5, 3.5, x), -.15, 1.7, 2.4);
      cam.position.set(0, .15, 12.1); cx = 0;
    } else {
      body.position.set(0, 2, -.6);
      buildRibbon(-9, 9, (x) => .9 + .25 * Math.sin(x * .7), -2.35, 0, .01);
      cam.position.set(0, .15, 17); cx = 0;
    }
    film.uniforms.off.value = offFor(k);
  };
  resize(); addEventListener('resize', resize);

  const ptr = { x: 0, y: 0, sx: 0, sy: 0 };
  wrap.addEventListener('pointermove', (e) => { const r = wrap.getBoundingClientRect(); ptr.x = (e.clientX - r.left) / r.width * 2 - 1; ptr.y = (e.clientY - r.top) / r.height * 2 - 1; });
  wrap.addEventListener('pointerleave', () => { ptr.x = ptr.y = 0; });
  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(wrap);
  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    if (!visible) return;
    const t = clock.getElapsedTime();
    ptr.sx += (ptr.x - ptr.sx) * .06; ptr.sy += (ptr.y - ptr.sy) * .06;
    rig.rotation.y = ptr.sx * .1; rig.rotation.x = ptr.sy * .06;
    rig.position.y = Math.sin(t * .9) * .05;
    cam.lookAt(cx, cam.position.y, 0);
    renderer.render(scene, cam);
  })();

  // ---------- choreography: wind on, fire, develop ----------
  const u = film.uniforms;
  const bodyY = () => body.position.y;
  const shoot = () => {
    k += 1;
    u.cur.value = -1 - k; u.dev.value = 0; u.shot.value = k + 1;
    wrap.classList.add('is-printing');
    return gsap.timeline()
      .to(lever.rotation, { y: 2.2, duration: .5, ease: 'power2.inOut' }, 0)
      .to(u.off, { value: offFor(k), duration: .5, ease: 'power2.inOut' }, 0)
      .to(lever.rotation, { y: 0, duration: .3, ease: 'power2.in' }, .5)
      .to(button.position, { y: Y2 + .25, duration: .07, yoyo: true, repeat: 1 }, .95)
      .to(body.position, { y: bodyY() - .05, duration: .07, yoyo: true, repeat: 1 }, .97)
      .to(M.flash, { emissiveIntensity: 6, duration: .05 }, 1)
      .to(flashLight, { intensity: 220, duration: .05 }, 1)
      .add(() => wrap.classList.add('is-flash'), 1)
      .to(M.flash, { emissiveIntensity: 0, duration: .5 }, 1.1)
      .to(flashLight, { intensity: 0, duration: .5 }, 1.1)
      .add(() => wrap.classList.remove('is-flash'), 1.3)
      .to(u.dev, { value: 1, duration: 2.6, ease: 'power1.inOut' }, 1.2);
  };
  let busy = false;
  const go = () => { if (busy) return; busy = true; shoot().then(() => { busy = false; wrap.classList.remove('is-printing'); }); };
  ScrollTrigger.create({ trigger: wrap, start: 'top 65%', once: true, onEnter: () => fontsReady.then(go) });
  const again = wrap.querySelector('.feature__again');
  if (again) again.addEventListener('click', go);
}
