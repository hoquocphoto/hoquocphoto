// Nathan Bui — Photography: the WebGL layer.
// Scene 1 (hero): a camera lens whose aperture opens onto the photos; scrolling flies through it.
// Scene 2 (roll): a spiral of film under a darkroom safelight; frames develop from negative as they reach you.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildBody } from './camera-body.js?v=20261024a';

const NB = window.NB || (window.NB = {});
const root = document.documentElement;
if (!root.classList.contains('no-gl')) start();

function start() {
  const canvas = document.getElementById('gl');
  const data = JSON.parse(document.getElementById('scene-data').textContent);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    root.classList.add('no-gl');
    NB.ready && NB.ready();
    return;
  }
  const small = () => innerWidth < 760;
  renderer.setPixelRatio(Math.min(devicePixelRatio, small() ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const ease = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  // textures: raw colour in, raw colour out, so photos look exactly as edited
  const loader = new THREE.TextureLoader();
  const cache = new Map();
  const tex = (src) => {
    if (cache.has(src)) return cache.get(src);
    const p = new Promise((res) => loader.load(src, (t) => {
      t.colorSpace = THREE.NoColorSpace; t.anisotropy = maxAniso; t.generateMipmaps = true;
      t.minFilter = THREE.LinearMipmapLinearFilter; res(t);
    }, undefined, () => res(null)));
    cache.set(src, p);
    return p;
  };

  // ---------- canvas textures for the lens ----------
  function canvasTex(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.anisotropy = maxAniso; t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  const scaleTex = canvasTex(2048, 256, (g, w, h) => {
    g.fillStyle = '#0d0c0c'; g.fillRect(0, 0, w, h);
    const marks = ['∞', '10', '5', '3', '2', '1.5', '1.2', '1', '.8', '.6', '.5', 'm'];
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let i = 0; i < 2; i++) {
      const x0 = i * w / 2;
      marks.forEach((m, j) => {
        const x = x0 + 60 + j * (w / 2 - 120) / (marks.length - 1);
        g.fillStyle = j === 0 ? '#c9a43f' : '#efe2cf';
        g.font = '500 46px "JetBrains Mono", ui-monospace, monospace';
        g.fillText(m, x, 92);
        g.fillStyle = 'rgba(239,226,207,.75)'; g.fillRect(x - 1.5, 140, 3, 26);
      });
      for (let k = 0; k < 60; k++) { g.fillStyle = 'rgba(239,226,207,.35)'; g.fillRect(x0 + 40 + k * (w / 2 - 80) / 60, 170, 2, 12); }
    }
    g.fillStyle = '#c9a43f'; g.fillRect(0, 214, w, 3);
  });
  const frontTex = canvasTex(1024, 1024, (g, w) => {
    g.fillStyle = '#0b0a0a'; g.fillRect(0, 0, w, w);
    g.translate(w / 2, w / 2);
    const text = 'NATHAN BUI · PHOTOGRAPHY · SYDNEY · FUJINON XC 15–45mm 1:3.5–5.6 OIS · Ø52 · ';
    g.font = '500 30px "JetBrains Mono", ui-monospace, monospace';
    g.fillStyle = '#efe2cf';
    const r = w * 0.43, step = (Math.PI * 2) / text.length;
    for (let i = 0; i < text.length; i++) {
      g.save(); g.rotate(i * step - Math.PI / 2); g.translate(0, -r);
      g.fillStyle = text[i] === '·' ? '#c9a43f' : '#efe2cf';
      g.fillText(text[i], -9, 0); g.restore();
    }
  });
  const knurlTex = canvasTex(1024, 16, (g, w, h) => {
    for (let x = 0; x < w; x += 8) {
      const gr = g.createLinearGradient(x, 0, x + 8, 0);
      gr.addColorStop(0, '#000'); gr.addColorStop(.5, '#fff'); gr.addColorStop(1, '#000');
      g.fillStyle = gr; g.fillRect(x, 0, 8, h);
    }
  });
  knurlTex.colorSpace = THREE.NoColorSpace; knurlTex.wrapS = THREE.RepeatWrapping; knurlTex.repeat.set(3, 1);

  // ======================================================
  //  SCENE 1: the lens
  // ======================================================
  const hero = new THREE.Scene();
  hero.background = new THREE.Color(0x120607);
  hero.fog = new THREE.Fog(0x120607, 26, 60);
  const pmrem = new THREE.PMREMGenerator(renderer);
  hero.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const cam = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 0.05, 80);
  cam.position.set(0, 0, 16);

  const key = new THREE.DirectionalLight(0xfff1e0, 2.4); key.position.set(4, 6, 7); hero.add(key);
  const rim = new THREE.PointLight(0xc9a43f, 28, 20); rim.position.set(-4, 3, -3); hero.add(rim);
  const warm = new THREE.PointLight(0xb3262d, 30, 18); warm.position.set(4, -3, 2); hero.add(warm);

  const rig = new THREE.Group(); hero.add(rig);       // moves the lens around the screen
  const lens = new THREE.Group(); rig.add(lens);      // tilts with the pointer
  const mat = {
    barrel: new THREE.MeshStandardMaterial({ color: 0x121010, metalness: .65, roughness: .34 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x0b0a0a, metalness: .15, roughness: .72, bumpMap: knurlTex, bumpScale: 3 }),
    scale: new THREE.MeshStandardMaterial({ map: scaleTex, metalness: .45, roughness: .4 }),
    front: new THREE.MeshStandardMaterial({ map: frontTex, metalness: .35, roughness: .45 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xc9a43f, metalness: 1, roughness: .26 }),
    inner: new THREE.MeshStandardMaterial({ color: 0x050404, metalness: .2, roughness: .95, side: THREE.BackSide }),
  };
  const lathe = (pts, m) => {
    const mesh = new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 160), m);
    mesh.rotation.x = Math.PI / 2; lens.add(mesh); return mesh;
  };
  const tube = (r, len, z, m, seg = 160) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg, 1, true), m);
    mesh.rotation.x = Math.PI / 2; mesh.position.z = z; lens.add(mesh); return mesh;
  };
  // back mount and barrel
  lathe([[1.18, -2.7], [1.36, -2.7], [1.36, -2.52], [1.5, -2.46], [1.52, -1.62], [1.6, -1.6]], mat.barrel);
  tube(1.63, 1.1, -1.05, mat.rubber);                                     // knurled zoom ring
  lathe([[1.6, -0.5], [1.58, -0.47], [1.56, -0.44]], mat.barrel);
  const goldRing = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.02, 12, 220), mat.gold);
  goldRing.position.z = -0.46; lens.add(goldRing);
  const sc = tube(1.565, 0.9, 0.0, mat.scale); sc.rotation.y = Math.PI;   // distance scale
  lathe([[1.565, 0.45], [1.6, 0.5], [1.63, 0.86], [1.6, 0.98], [1.44, 1.0], [1.43, 0.99]], mat.barrel);
  const face = new THREE.Mesh(new THREE.RingGeometry(1.22, 1.44, 160), mat.front);
  face.position.z = 0.995; lens.add(face);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 12), mat.gold);
  dot.position.set(0, 1.62, 0.66); lens.add(dot);
  tube(1.22, 1.3, 0.34, mat.inner, 96);                                    // inside of the barrel

  // aperture: photo inside a 9-blade iris, drawn in one shader
  const iris = new THREE.ShaderMaterial({
    uniforms: {
      tA: { value: null }, tB: { value: null }, aspA: { value: 1.5 }, aspB: { value: 1.5 },
      mixT: { value: 0 }, ap: { value: 0.02 }, time: { value: 0 }, rot: { value: 0 }, zoom: { value: 1 }, ready: { value: 0 },
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: `
      uniform sampler2D tA, tB; uniform float aspA, aspB, mixT, ap, time, rot, zoom, ready; varying vec2 vUv;
      vec3 cover(sampler2D t, vec2 uv, float asp){
        vec2 s = asp > 1. ? vec2(1./asp, 1.) : vec2(1., asp);
        return texture2D(t, (uv - .5) * s / zoom + .5).rgb;
      }
      vec3 photo(vec2 uv){ return mix(cover(tA, uv, aspA), cover(tB, uv, aspB), mixT); }
      float hash(float n){ return fract(sin(n) * 43758.5453); }
      void main(){
        vec2 p = vUv * 2. - 1.; float r = length(p); float a = atan(p.y, p.x) + rot;
        const float N = 9.; float seg = 6.2831853 / N;
        float k = mod(a, seg) - seg * .5;
        float rr = mix(ap * cos(seg * .5) / cos(k), ap, .42);
        float edge = rr - r;
        float inside = smoothstep(-.005, .005, edge);
        vec2 dir = normalize(p + 1e-5) * .006 * r;
        vec3 ph = photo(vUv);
        ph.r = photo(vUv + dir).r; ph.b = photo(vUv - dir).b;
        ph *= 1. - .4 * smoothstep(.35, 1.05, r / max(ap, .001));
        ph *= ready;
        float as = a - r * 2.4; float id = floor(as / seg); float f = fract(as / seg);
        float shade = .05 + .035 * hash(id) + .06 * f;
        shade *= mix(.25, 1., smoothstep(0., .025, f));
        float sheen = pow(max(0., sin(a + 1.1 + time * .12)), 10.) * .5;
        vec3 blade = vec3(shade) + vec3(.79, .64, .25) * sheen * .25;
        blade += vec3(.79, .64, .25) * smoothstep(.04, 0., abs(edge)) * .28 * (1. - inside);
        vec3 col = mix(blade, ph, inside);
        col *= smoothstep(1.0, .95, r);
        gl_FragColor = vec4(col, 1.);
      }`,
    toneMapped: false,
  });
  const irisMesh = new THREE.Mesh(new THREE.CircleGeometry(1.22, 128), iris);
  irisMesh.position.z = -0.25; lens.add(irisMesh);

  // front element: thin, clear, with the purple-green sheen of a coated lens
  const glass = new THREE.Mesh(
    new THREE.SphereGeometry(2.6, 96, 24, 0, Math.PI * 2, 0, Math.asin(1.22 / 2.6)),
    new THREE.MeshPhysicalMaterial({
      color: 0x0a0a14, metalness: 0, roughness: .03, transparent: true, opacity: .3, depthWrite: false,
      clearcoat: 1, clearcoatRoughness: .02, iridescence: 1, iridescenceIOR: 1.7, iridescenceThicknessRange: [220, 820], envMapIntensity: 2.4,
    }));
  glass.rotation.x = Math.PI / 2; glass.position.z = 0.75 - 2.6 * Math.cos(Math.asin(1.22 / 2.6)); lens.add(glass);

  // the camera body the lens is mounted on
  lens.add(buildBody({ canvasTex, maxAniso }));

  // bokeh: soft out-of-focus discs drifting behind the lens
  function bokeh(count, spread, depth, palette) {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3), col = new Float32Array(count * 3), sz = new Float32Array(count), sd = new Float32Array(count);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - .5) * spread[0]; pos[i * 3 + 1] = (Math.random() - .5) * spread[1]; pos[i * 3 + 2] = depth[0] + Math.random() * (depth[1] - depth[0]);
      c.set(palette[i % palette.length]); col.set([c.r, c.g, c.b], i * 3);
      sz[i] = 40 + Math.random() * 160; sd[i] = Math.random() * 100;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setAttribute('size', new THREE.BufferAttribute(sz, 1));
    g.setAttribute('seed', new THREE.BufferAttribute(sd, 1));
    const m = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, px: { value: renderer.getPixelRatio() }, fade: { value: 1 } },
      vertexShader: `attribute float size, seed; attribute vec3 color; uniform float time, px; varying vec3 vC; varying float vA;
        void main(){ vec3 p = position; p.x += sin(time * .07 + seed) * .6; p.y += cos(time * .05 + seed * 1.3) * .5;
          vec4 mv = modelViewMatrix * vec4(p, 1.); gl_PointSize = size * px / -mv.z; gl_Position = projectionMatrix * mv;
          vC = color; vA = .25 + .35 * fract(seed * 7.13); }`,
      fragmentShader: `uniform float fade; varying vec3 vC; varying float vA;
        void main(){ vec2 c = gl_PointCoord * 2. - 1.; float d = length(c);
          float hex = max(abs(c.x) * .866 + abs(c.y) * .5, abs(c.y)); float s = mix(d, hex, .55);
          float a = smoothstep(1., .88, s) * (.45 + .55 * smoothstep(.55, .98, s));
          gl_FragColor = vec4(vC * a * vA * fade, 1.); }`,
      blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
    });
    return new THREE.Points(g, m);
  }
  const heroBokeh = bokeh(small() ? 70 : 140, [30, 18], [-22, -4], ['#c9a43f', '#e2c77a', '#b3262d', '#f6e3cb', '#7a2b30']);
  hero.add(heroBokeh);

  // hero slideshow behind the iris
  const heroFrames = data.hero;
  let slide = 0, slideT = 0, heroReady = false;
  Promise.all(heroFrames.slice(0, 2).map((f) => tex(f.src))).then(([a, b]) => {
    iris.uniforms.tA.value = a; iris.uniforms.aspA.value = heroFrames[0].w / heroFrames[0].h;
    iris.uniforms.tB.value = b; iris.uniforms.aspB.value = heroFrames[1].w / heroFrames[1].h;
    heroReady = true; NB.ready && NB.ready();
  });
  heroFrames.forEach((f) => tex(f.src));
  setTimeout(() => NB.ready && NB.ready(), 2500);
  function nextSlide() {
    const a = (slide + 1) % heroFrames.length, b = (slide + 2) % heroFrames.length;
    tex(heroFrames[a].src).then((t) => {
      iris.uniforms.tA.value = iris.uniforms.tB.value; iris.uniforms.aspA.value = iris.uniforms.aspB.value;
      iris.uniforms.mixT.value = 0;
      tex(heroFrames[b].src).then((t2) => { iris.uniforms.tB.value = t2; iris.uniforms.aspB.value = heroFrames[b].w / heroFrames[b].h; });
      slide = a;
    });
  }

  // ======================================================
  //  SCENE 2: the film roll
  // ======================================================
  const roll = new THREE.Scene();
  roll.background = new THREE.Color(0x0b0304);
  const cam2 = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.05, 80);

  // safelight glow behind everything
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: `uniform float time; varying vec2 vUv;
      void main(){ vec2 p = vUv - vec2(.5, .62); float d = length(p * vec2(1., 1.5));
        float g = exp(-d * d * 14.) * (.9 + .1 * sin(time * 1.7)); vec3 c = vec3(.42, .03, .035) * g + vec3(.025, .006, .008);
        gl_FragColor = vec4(c, 1.); }`,
    depthWrite: false,
  }));
  glow.position.z = -12; roll.add(glow);
  const rollBokeh = bokeh(small() ? 40 : 80, [26, 16], [-10, -2], ['#b3262d', '#7a1a1f', '#e2c77a']);
  roll.add(rollBokeh);

  const film = new THREE.Group(); roll.add(film);
  const R = 3.4, PITCH = 0.62, H = 1.0, GAP = 0.26, BAND = 1.42;
  const frames = data.roll;
  let s = 0;
  const layout = frames.map((f) => {
    const w = H * (f.w / f.h);
    const c = s + w / 2; s += w + GAP;
    return { ...f, w, a: c / R };
  });
  const yAt = (a) => -a * PITCH;
  const slope = Math.atan(PITCH / R);

  // film base with sprocket holes
  const sprocket = canvasTex(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#1a0b07'; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'destination-out';
    const hole = (x, y) => { g.beginPath(); g.roundRect(x, y, 44, 26, 6); g.fill(); };
    for (let i = 0; i < 4; i++) { hole(10 + i * 64, 8); hole(10 + i * 64, h - 34); }
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(226,150,70,.75)'; g.font = '600 15px "JetBrains Mono", monospace';
    g.fillText('NB 400', 20, 58); g.fillText('▸ 24', 170, 58);
  });
  sprocket.wrapS = THREE.RepeatWrapping;
  {
    const a0 = layout[0].a - 1.2, a1 = layout[layout.length - 1].a + 1.2, seg = 900;
    const pos = [], uv = [], idx = [];
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (a1 - a0) * (i / seg), x = Math.sin(a) * (R - 0.02), z = Math.cos(a) * (R - 0.02), y = yAt(a);
      pos.push(x, y + BAND / 2, z, x, y - BAND / 2, z);
      const u = (a - a0) * R / BAND; uv.push(u, 1, u, 0);
      if (i < seg) { const b = i * 2; idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    film.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: sprocket, transparent: true, alphaTest: .5, side: THREE.DoubleSide, toneMapped: false })));
  }

  const frameVert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`;
  const frameFrag = `
    uniform sampler2D t; uniform float dev, time, loaded, hover; varying vec2 vUv;
    float rand(vec2 c){ return fract(sin(dot(c, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec3 c = texture2D(t, vUv).rgb;
      vec3 neg = (1. - c) * vec3(1., .6, .4) * .85 + vec3(.09, .025, 0.);
      float d = smoothstep(0., 1., dev);
      vec3 col = mix(neg, c, d);
      col *= mix(.5, 1., d) + hover * .08;
      col = mix(col, col * vec3(1., .5, .45), (1. - d) * .55);
      col += (rand(vUv * vec2(800., 540.) + fract(time * 3.1)) - .5) * mix(.09, .03, d);
      vec2 e = smoothstep(0., .012, vUv) * smoothstep(0., .012, 1. - vUv);
      col *= mix(.15, 1., e.x * e.y);
      gl_FragColor = vec4(col * loaded, 1.);
    }`;
  const frameMeshes = layout.map((f, i) => {
    const m = new THREE.ShaderMaterial({
      uniforms: { t: { value: null }, dev: { value: 0 }, time: { value: 0 }, loaded: { value: 0 }, hover: { value: 0 } },
      vertexShader: frameVert, fragmentShader: frameFrag, toneMapped: false,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(f.w, H), m);
    mesh.position.set(Math.sin(f.a) * R, yAt(f.a), Math.cos(f.a) * R);
    mesh.rotation.set(0, f.a, -slope, 'YXZ');
    mesh.userData = { i, f };
    film.add(mesh);
    tex(f.src).then((t) => { m.uniforms.t.value = t; gsap.to(m.uniforms.loaded, { value: 1, duration: .8 }); });
    return mesh;
  });

  // ======================================================
  //  driving it: pointer, scroll, resize, render loop
  // ======================================================
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener('pointermove', (e) => { pointer.x = e.clientX / innerWidth * 2 - 1; pointer.y = e.clientY / innerHeight * 2 - 1; }, { passive: true });

  const heroEl = document.querySelector('.hero'), rollEl = document.querySelector('.roll');
  const apEl = document.querySelector('[data-aperture]');
  const ui = { no: rollEl.querySelector('[data-roll="no"]'), cap: rollEl.querySelector('[data-roll="cap"]'), exif: rollEl.querySelector('[data-roll="exif"]'), bar: rollEl.querySelector('[data-roll="bar"]') };
  const intro = { t: 0 };
  let introPlayed = false;
  NB.playIntro = () => { if (introPlayed) return; introPlayed = true; gsap.to(intro, { t: 1, duration: 2.6, ease: 'power3.inOut' }); };
  if (NB.opened) NB.playIntro();   // the page may have opened its shutter before this module finished loading

  const fstop = (ap) => 1.4 * Math.pow(2, (1 - clamp(ap)) * 4);
  const fmtF = (f) => (f >= 10 ? Math.round(f) : f.toFixed(1)).toString();
  const parseExif = (s) => { const [f, ss, iso, mm] = s.split(' · '); return { f: f.replace('f/', 'F'), ss, iso, mm }; };

  function resize() {
    renderer.setPixelRatio(Math.min(devicePixelRatio, small() ? 1.5 : 2));
    renderer.setSize(innerWidth, innerHeight, false);
    cam.aspect = cam2.aspect = innerWidth / innerHeight;
    cam.updateProjectionMatrix(); cam2.updateProjectionMatrix();
  }
  addEventListener('resize', resize);

  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let active = 'hero', current = -1, hovered = null;
  addEventListener('pointermove', (e) => {
    if (active !== 'roll') { hovered = null; return; }
    ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, cam2);
    const hit = ray.intersectObjects(frameMeshes)[0];
    hovered = hit ? hit.object : null;
    root.classList.toggle('roll-hover', !!hovered);
  }, { passive: true });
  addEventListener('click', (e) => {
    if (active !== 'roll' || !hovered || e.target.closest('a,button,nav')) return;
    const f = hovered.userData.f; NB.openSingle && NB.openSingle(f.full, f.cap, f.exif);
  });

  const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), .05), time = clock.elapsedTime;
    pointer.sx = lerp(pointer.sx, pointer.x, .05); pointer.sy = lerp(pointer.sy, pointer.y, .05);

    const hp = NB.heroP || 0, rp = NB.rollP || 0;
    const rollTop = rollEl.getBoundingClientRect().top, heroBottom = heroEl.getBoundingClientRect().bottom;
    const rollVisible = rollTop < innerHeight && rollEl.getBoundingClientRect().bottom > 0;
    const heroVisible = heroBottom > 0;
    active = rollVisible && rollTop < innerHeight * .5 ? 'roll' : heroVisible ? 'hero' : null;
    root.classList.toggle('gl-off', !active);
    let veil = 0;

    if (active === 'hero') {
      const it = intro.t, wide = innerWidth / innerHeight > 1.05;
      const e = ease(clamp(hp / .82));
      // slideshow
      slideT += dt;
      if (heroReady && slideT > 3.4) {
        const m = iris.uniforms.mixT; m.value = Math.min(1, m.value + dt * .9);
        if (m.value >= 1) { slideT = 0; nextSlide(); }
      }
      const ap = lerp(lerp(0.02, .6, it), .995, smooth(0, .6, hp));
      iris.uniforms.ap.value = ap; iris.uniforms.time.value = time; iris.uniforms.ready.value = heroReady ? 1 : 0;
      iris.uniforms.rot.value = (1 - ap) * 1.6;
      iris.uniforms.zoom.value = 1 + smooth(.7, 1, hp) * .35;
      // lens position: off to the side on wide screens, above the copy on tall ones
      rig.position.x = lerp(wide ? 2.75 : 0, 0, e);
      rig.position.y = lerp(wide ? .15 : 3.4, 0, e);
      lens.rotation.y = lerp(lerp(-2.4, -.62, it), 0, e) + pointer.sx * .3 * (1 - e);
      lens.rotation.x = lerp(lerp(.7, .32, it), 0, e) + pointer.sy * .2 * (1 - e);
      lens.rotation.z = (1 - it) * .4;
      lens.position.y = Math.sin(time * .8) * .05 * (1 - e);
      const z0 = wide ? 17.5 : 31;
      cam.position.z = lerp(lerp(34, z0, it), 2.45, e);
      cam.position.x = pointer.sx * .15 * (1 - e); cam.position.y = -pointer.sy * .1 * (1 - e);
      cam.lookAt(0, 0, 0);
      glass.material.opacity = .3 * (1 - smooth(.55, .8, hp));
      heroBokeh.material.uniforms.time.value = time;
      veil = smooth(.84, 1, hp);
      const f = fstop(ap);
      apEl.textContent = 'f/' + fmtF(f);
      NB.hudOverride = { f: 'F' + fmtF(f), ss: '1/250', iso: 'ISO 320', mm: Math.round(lerp(15, 45, e)) + 'mm', n: '000' };
      renderer.render(hero, cam);
    } else if (active === 'roll') {
      const n = layout.length - 1, c = clamp(rp) * n;
      const i0 = Math.floor(c), i1 = Math.min(n, i0 + 1), t = c - i0;
      const a = lerp(layout[i0].a, layout[i1].a, t);
      film.rotation.y = -a; film.position.y = -yAt(a);
      const aspect = innerWidth / innerHeight;
      const D = Math.max(4.9, 2.3 / (2 * Math.tan(THREE.MathUtils.degToRad(16)) * aspect));
      cam2.position.set(pointer.sx * .4, .55 - pointer.sy * .25, R + D);
      cam2.lookAt(0, -.15, R - 1.2);
      frameMeshes.forEach((m, i) => {
        const u = m.material.uniforms;
        u.dev.value = 1 - smooth(.25, 1.25, Math.abs(i - c));
        u.time.value = time; u.hover.value = lerp(u.hover.value, m === hovered ? 1 : 0, .15);
      });
      glow.material.uniforms.time.value = time; rollBokeh.material.uniforms.time.value = time;
      veil = 1 - smooth(innerHeight * .5, innerHeight * -.05, rollTop) ;
      const idx = Math.round(c);
      if (idx !== current) {
        current = idx; const f = layout[idx];
        ui.no.textContent = String(idx + 1).padStart(2, '0'); ui.cap.textContent = f.cap; ui.exif.textContent = f.exif;
      }
      ui.bar.style.transform = `scaleX(${clamp(rp)})`;
      const x = parseExif(layout[idx].exif);
      NB.hudOverride = { ...x, n: String(idx + 1).padStart(3, '0') };
      renderer.render(roll, cam2);
    } else {
      NB.hudOverride = null;
    }
    document.documentElement.style.setProperty('--veil', veil.toFixed(3));
  }
  frame();
}
