// Ho Quoc: a 3D instant camera that prints the featured portrait.
// Modelled from primitives (no third-party model). Scroll it into view: flash, the print slides out of
// the slot under the lens, lifts in front of the camera and develops while it gets a shake.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const wrap = document.querySelector('.feature');
const canvas = wrap && wrap.querySelector('.feature__gl');
const root = document.documentElement;
if (canvas && !root.classList.contains('no-gl') && window.gsap) start();
else if (wrap) wrap.classList.add('feature--static');

function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { wrap.classList.add('feature--static'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.localClippingEnabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  cam.position.set(0, 0.6, 17);
  scene.add(new THREE.HemisphereLight(0xfff6ea, 0xd9c8b8, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 1.8); key.position.set(-4, 6, 8); scene.add(key);
  const flashLight = new THREE.PointLight(0xffffff, 0, 30); flashLight.position.set(-1, 1.2, 5); scene.add(flashLight);

  // ---------- the camera ----------
  const rig = new THREE.Group(); scene.add(rig);
  const body = new THREE.Group(); rig.add(body);
  const M = {
    shell: new THREE.MeshPhysicalMaterial({ color: 0xf3eee4, roughness: .42, clearcoat: .35, clearcoatRoughness: .4 }),
    black: new THREE.MeshStandardMaterial({ color: 0x1c1b1f, roughness: .55, metalness: .1 }),
    gloss: new THREE.MeshPhysicalMaterial({ color: 0x111114, roughness: .15, clearcoat: 1 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x0c0c14, roughness: .03, clearcoat: 1, iridescence: 1, iridescenceIOR: 1.6, iridescenceThicknessRange: [200, 700] }),
    silver: new THREE.MeshStandardMaterial({ color: 0xcfcac2, metalness: 1, roughness: .3 }),
    red: new THREE.MeshPhysicalMaterial({ color: 0xc8352f, roughness: .35, clearcoat: .6 }),
    flash: new THREE.MeshStandardMaterial({ color: 0xf6f3ee, emissive: 0xffffff, emissiveIntensity: 0, roughness: .2 }),
  };
  const W = 4.6, FRONT = 1.75;
  // side profile: a box with the classic sloped top, extruded across the width
  {
    const s = new THREE.Shape();
    s.moveTo(-1.6, -1.65); s.lineTo(FRONT, -1.65); s.lineTo(FRONT, 0.15); s.lineTo(0.55, 1.55); s.lineTo(-1.6, 1.55); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: W, bevelEnabled: true, bevelThickness: .16, bevelSize: .16, bevelSegments: 5, curveSegments: 12 });
    g.rotateY(-Math.PI / 2); g.translate(W / 2, 0, 0);
    body.add(new THREE.Mesh(g, M.shell));
  }
  const add = (geo, mat, x, y, z, parent = body) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const fz = FRONT + .17;
  add(new RoundedBoxGeometry(W - .2, 1.62, .1, 3, .05), M.black, 0, -0.72, fz);              // black front panel
  // lens
  add(new THREE.CylinderGeometry(.86, .9, .26, 64), M.gloss, -0.35, -0.55, fz + .1).rotation.x = Math.PI / 2;
  add(new THREE.TorusGeometry(.78, .05, 12, 64), M.silver, -0.35, -0.55, fz + .24);
  add(new THREE.CylinderGeometry(.6, .6, .1, 64), M.black, -0.35, -0.55, fz + .26).rotation.x = Math.PI / 2;
  const lensGlass = add(new THREE.SphereGeometry(.56, 48, 16, 0, Math.PI * 2, 0, .55), M.glass, -0.35, -0.55, fz + .05);
  lensGlass.rotation.x = Math.PI / 2;
  // stripe in his palette, running down the front
  ['#c8352f', '#e9a27a', '#d9b58a', '#7fa3b9'].forEach((c, i) => add(new THREE.BoxGeometry(.13, 1.5, .03), new THREE.MeshStandardMaterial({ color: c, roughness: .4 }), 1.05 + i * .15, -0.72, fz + .06));
  // shutter button and the eject slot under the lens
  add(new THREE.CylinderGeometry(.2, .2, .16, 32), M.red, 1.85, 0.0, fz - .02).rotation.x = Math.PI / 2;
  const SLOT_Y = -1.42;
  add(new THREE.BoxGeometry(3.5, .1, .06), new THREE.MeshBasicMaterial({ color: 0x050505 }), 0, SLOT_Y, fz + .07);
  // flash window and viewfinder on the sloped top
  const slope = Math.atan2(1.55 - 0.15, FRONT - 0.55);
  const onSlope = (geo, mat, x, t) => { const m = add(geo, mat, x, 0.15 + (1.4) * t + Math.cos(slope) * .17, FRONT - 1.2 * t + Math.sin(slope) * .17); m.rotation.x = -(Math.PI / 2 - slope); return m; };
  const flashWin = onSlope(new RoundedBoxGeometry(1.5, .62, .08, 3, .06), M.flash, -1.15, .45);
  onSlope(new RoundedBoxGeometry(.7, .5, .08, 3, .06), M.gloss, 1.45, .55);
  onSlope(new THREE.BoxGeometry(1.2, .05, .02), new THREE.MeshStandardMaterial({ color: 0xbdb6aa }), 0.25, .4);
  // name plate on the front
  {
    const c = document.createElement('canvas'); c.width = 512; c.height = 96; const g = c.getContext('2d');
    g.fillStyle = '#1c1b1f'; g.fillRect(0, 0, 512, 96); g.fillStyle = '#f3eee4'; g.font = '600 50px "DM Sans", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('HO QUOC · instant', 256, 50);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    add(new THREE.PlaneGeometry(1.7, .32), new THREE.MeshBasicMaterial({ map: t }), -0.35, 0.02, fz + .06);
  }
  body.rotation.set(.12, -.42, 0);
  body.position.set(-1.1, .55, 0);

  // ---------- the print ----------
  const PW = 3.0, PH = 3.62, IMG = 2.62;
  const printGroup = new THREE.Group(); body.add(printGroup);   // starts inside the camera
  const clip = new THREE.Plane(new THREE.Vector3(0, -1, 0), SLOT_Y);     // hides the part still inside the camera
  const card = new THREE.Mesh(new RoundedBoxGeometry(PW, PH, .03, 2, .02), new THREE.MeshStandardMaterial({ color: 0xfffdf9, roughness: .6, clippingPlanes: [clip] }));
  printGroup.add(card);
  const photo = new THREE.ShaderMaterial({
    uniforms: { t: { value: null }, dev: { value: 0 }, asp: { value: 1 } },
    vertexShader: `varying vec2 vUv; varying vec3 vW; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform sampler2D t; uniform float dev, asp, slotY; varying vec2 vUv; varying vec3 vW;
      void main(){
        vec2 uv = vUv; vec2 s = asp > 1. ? vec2(1./asp, 1.) : vec2(1., asp); uv = (uv - .5) * s + .5;
        vec3 c = texture2D(t, uv).rgb;
        vec3 chem = mix(vec3(.16,.15,.13), vec3(.36,.33,.28), smoothstep(.9, .0, length(vUv - vec2(.42,.6))));
        float d = smoothstep(0., 1., dev);
        vec3 col = mix(chem, c, d);
        col = mix(col, col * vec3(1.05, .98, .9) + .03, .25 * (1. - d));
        if (vW.y > slotY) discard;
        gl_FragColor = vec4(col, 1.);
      }`,
  });
  photo.uniforms.slotY = { value: 99 };
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(IMG, IMG), photo);
  pic.position.set(0, PH / 2 - .19 - IMG / 2, .02);
  printGroup.add(pic);
  // handwritten caption on the chin
  const capCanvas = document.createElement('canvas'); capCanvas.width = 1024; capCanvas.height = 200;
  const capTex = new THREE.CanvasTexture(capCanvas); capTex.colorSpace = THREE.SRGBColorSpace;
  const cap = new THREE.Mesh(new THREE.PlaneGeometry(PW - .3, (PW - .3) * .195), new THREE.MeshBasicMaterial({ map: capTex, transparent: true }));
  cap.position.set(0, -PH / 2 + .38, .021); printGroup.add(cap);
  const writeCap = (txt) => {
    const g = capCanvas.getContext('2d'); g.clearRect(0, 0, 1024, 200);
    g.fillStyle = '#2a2522'; g.font = '600 96px Caveat, cursive'; g.textBaseline = 'middle'; g.fillText(txt, 30, 104); capTex.needsUpdate = true;
  };

  // ---------- photos to print ----------
  const data = JSON.parse(document.getElementById('feature-data').textContent || '[]');
  const loader = new THREE.TextureLoader();
  const placeholder = (label) => {
    const c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 1024, 1024); gr.addColorStop(0, '#f6dcd6'); gr.addColorStop(.45, '#ecd0b2'); gr.addColorStop(1, '#bfd3df');
    g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
    g.fillStyle = 'rgba(42,37,34,.85)'; g.font = '600 120px Caveat, cursive'; g.textAlign = 'center'; g.fillText(label, 512, 500);
    g.font = '500 34px "JetBrains Mono", monospace'; g.fillStyle = 'rgba(42,37,34,.55)'; g.fillText('PHOTO COMING SOON', 512, 600);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; return t;
  };
  const items = data.length ? data : [{ cap: 'Graduation · Sydney' }, { cap: 'Concept · golden hour' }, { cap: 'Daily portrait' }];
  let idx = 0;
  const setPhoto = (it) => new Promise((res) => {
    writeCap(it.cap.split(' · ')[0].toLowerCase() + ' ♡');
    if (!it.src) { photo.uniforms.t.value = placeholder(it.cap.split(' · ')[0]); photo.uniforms.asp.value = 1; return res(); }
    loader.load(it.src, (t) => { t.colorSpace = THREE.NoColorSpace; photo.uniforms.t.value = t; photo.uniforms.asp.value = it.w / it.h; res(); }, undefined, () => res());
  });

  // ---------- choreography ----------
  const OUT_Y = SLOT_Y - PH / 2 - .02;           // print fully out, hanging below the slot
  const inside = SLOT_Y + PH / 2 + .05;          // print hidden inside the body
  const shoot = () => {
    const it = items[idx % items.length]; idx++;
    wrap.classList.add('is-printing');
    return setPhoto(it).then(() => {
      const z0 = fz + .12;
      photo.uniforms.dev.value = 0; card.material.clippingPlanes = [clip]; clipping = true;
      body.add(printGroup);
      printGroup.position.set(-0.35, inside, z0); printGroup.rotation.set(0, 0, 0); printGroup.scale.setScalar(1);
      const tl = gsap.timeline({ onComplete: () => wrap.classList.remove('is-printing') });
      // press and flash
      tl.to(body.position, { y: -.08, duration: .08, yoyo: true, repeat: 1 }, 0)
        .to(M.flash, { emissiveIntensity: 6, duration: .05 }, .1)
        .to(flashLight, { intensity: 220, duration: .05 }, .1)
        .add(() => wrap.classList.add('is-flash'), .1)
        .to(M.flash, { emissiveIntensity: 0, duration: .5 }, .2)
        .to(flashLight, { intensity: 0, duration: .5 }, .2)
        .add(() => wrap.classList.remove('is-flash'), .4)
        // the motor pushes the print out of the slot, in little steps
        .to(printGroup.position, { y: OUT_Y, duration: 1.8, ease: 'steps(14)' }, .55)
        // it lifts free and comes forward, in front of the camera
        .add(() => { card.material.clippingPlanes = []; clipping = false; photo.uniforms.slotY.value = 99; rig.attach(printGroup); }, 2.4)
        .to(printGroup.position, { x: 1.85, y: -.75, z: 4.2, duration: 1.1, ease: 'power3.inOut' }, 2.42)
        .to(printGroup.rotation, { x: -.06, y: -.22, z: -.09, duration: 1.1, ease: 'power3.inOut' }, 2.42)
        .to(printGroup.scale, { x: .9, y: .9, z: .9, duration: 1.1, ease: 'power3.inOut' }, 2.42)
        // shake it while it develops
        .to(printGroup.rotation, { keyframes: [{ z: .02 }, { z: -.2 }, { z: -.02 }, { z: -.14 }, { z: -.07 }, { z: -.09 }], duration: 1.3, ease: 'sine.inOut' }, 3.5)
        .to(photo.uniforms.dev, { value: 1, duration: 3, ease: 'power1.inOut' }, 3.3);
      return tl;
    });
  };

  // ---------- sizing, pointer, render loop ----------
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    cam.aspect = r.width / r.height; cam.updateProjectionMatrix();
    cam.position.z = cam.aspect < .9 ? 21 : 17;
  };
  resize(); addEventListener('resize', resize);
  const ptr = { x: 0, y: 0, sx: 0, sy: 0 };
  wrap.addEventListener('pointermove', (e) => { const r = wrap.getBoundingClientRect(); ptr.x = (e.clientX - r.left) / r.width * 2 - 1; ptr.y = (e.clientY - r.top) / r.height * 2 - 1; });
  wrap.addEventListener('pointerleave', () => { ptr.x = ptr.y = 0; });
  let visible = false, clipping = false;
  const slotW = new THREE.Vector3();
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(wrap);
  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    if (!visible) return;
    const t = clock.getElapsedTime();
    ptr.sx += (ptr.x - ptr.sx) * .06; ptr.sy += (ptr.y - ptr.sy) * .06;
    rig.rotation.y = ptr.sx * .25; rig.rotation.x = ptr.sy * .12;
    rig.position.y = Math.sin(t * .9) * .06;
    if (clipping) { rig.updateMatrixWorld(); slotW.set(0, SLOT_Y, fz + .07); body.localToWorld(slotW); clip.constant = slotW.y; photo.uniforms.slotY.value = slotW.y; }
    renderer.render(scene, cam);
  })();

  // first print when the section scrolls in; "Take another" prints the next one
  let busy = false;
  // shoot() resolves when the print has finished developing (a GSAP timeline is thenable)
  const go = () => { if (busy) return; busy = true; shoot().then(() => { busy = false; wrap.classList.remove('is-printing'); }); };
  setPhoto(items[0]).then(() => { printGroup.position.set(-0.35, inside, fz + .12); card.material.clippingPlanes = [clip]; clipping = true; });
  ScrollTrigger.create({ trigger: wrap, start: 'top 65%', once: true, onEnter: () => (document.fonts ? document.fonts.ready : Promise.resolve()).then(go) });
  const again = wrap.querySelector('.feature__again');
  if (again) again.addEventListener('click', go);
}
