// A Fujifilm X-T30 II-style body, modelled from primitives (no third-party model).
// Units match the lens in scene.js: 1 unit ≈ 19.5 mm. The lens mount sits at the origin, facing +z,
// so the returned group can be dropped straight into the lens group.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export function buildBody({ canvasTex, maxAniso }) {
  const body = new THREE.Group();

  const W = 6.3, D = 1.65, Y0 = -1.95, Y1 = 0.75, Y2 = 1.65;   // width, depth, bottom / plate seam / top
  const AX = 0.35, AY = -0.2;                                  // where the lens axis sits on the body
  const front = D / 2;

  // ---------- materials ----------
  const leatherTex = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) {
      const v = 90 + Math.random() * 90 | 0;
      g.fillStyle = `rgb(${v},${v},${v})`;
      g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 1.5 + Math.random() * 3, 0, 7); g.fill();
    }
  });
  leatherTex.colorSpace = THREE.NoColorSpace;
  leatherTex.wrapS = leatherTex.wrapT = THREE.RepeatWrapping; leatherTex.repeat.set(3, 2);
  const knurl = canvasTex(512, 16, (g, w, h) => {
    for (let x = 0; x < w; x += 6) { const gr = g.createLinearGradient(x, 0, x + 6, 0); gr.addColorStop(0, '#000'); gr.addColorStop(.5, '#fff'); gr.addColorStop(1, '#000'); g.fillStyle = gr; g.fillRect(x, 0, 6, h); }
  });
  knurl.colorSpace = THREE.NoColorSpace; knurl.wrapS = THREE.RepeatWrapping; knurl.repeat.set(2, 1);

  const m = {
    silver: new THREE.MeshStandardMaterial({ color: 0xcfcbc4, metalness: 1, roughness: .3 }),
    silverKnurl: new THREE.MeshStandardMaterial({ color: 0xcfcbc4, metalness: 1, roughness: .34, bumpMap: knurl, bumpScale: 2.5 }),
    leather: new THREE.MeshStandardMaterial({ color: 0x151313, metalness: .05, roughness: .82, bumpMap: leatherTex, bumpScale: 2.2 }),
    black: new THREE.MeshStandardMaterial({ color: 0x0d0c0c, metalness: .4, roughness: .45 }),
    screen: new THREE.MeshPhysicalMaterial({ color: 0x040507, metalness: 0, roughness: .08, clearcoat: 1, clearcoatRoughness: .03 }),
  };

  const add = (geo, mat, x = 0, y = 0, z = 0, parent = body) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); parent.add(o); return o; };

  // ---------- body shell: leatherette lower half, silver top plate ----------
  add(new RoundedBoxGeometry(W, Y1 - Y0, D, 5, .2), m.leather, 0, (Y0 + Y1) / 2, 0);
  add(new RoundedBoxGeometry(W + .02, Y2 - Y1, D + .03, 5, .18), m.silver, 0, (Y1 + Y2) / 2, 0);
  add(new RoundedBoxGeometry(W - .1, .05, D - .05, 2, .02), m.black, 0, Y1, 0);            // seam line

  // grip on the front, on the photographer's right
  add(new RoundedBoxGeometry(1.15, (Y1 - Y0) - .2, .42, 4, .18), m.leather, -W / 2 + .75, (Y0 + Y1) / 2 - .02, front + .16);

  // EVF hump above the mount
  {
    const s = new THREE.Shape();
    s.moveTo(-1.05, 0); s.lineTo(1.05, 0); s.lineTo(.62, .82); s.lineTo(-.62, .82); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 1.35, bevelEnabled: true, bevelThickness: .06, bevelSize: .06, bevelSegments: 3 });
    g.translate(0, 0, -1.35 / 2);
    add(g, m.silver, AX, Y2 - .02, -.08);
    add(new THREE.BoxGeometry(.95, .07, .8), m.black, AX, Y2 + .86, -.1);                   // hot shoe
    // name plate where the maker's logo would be
    const plate = canvasTex(512, 96, (g2, w, h) => {
      g2.fillStyle = '#cfcbc4'; g2.fillRect(0, 0, w, h);
      g2.fillStyle = '#1b1716'; g2.font = '600 46px "Be Vietnam Pro", system-ui, sans-serif'; g2.textAlign = 'center'; g2.textBaseline = 'middle';
      g2.fillText('NATHAN BUI', w / 2, h / 2 + 2);
    });
    add(new THREE.PlaneGeometry(1.25, .24), new THREE.MeshStandardMaterial({ map: plate, metalness: .8, roughness: .35 }), AX, Y2 + .34, -.08 + .68 + .061);
  }

  // ---------- dials ----------
  const dialText = (labels, accent) => canvasTex(512, 512, (g, w) => {
    g.fillStyle = '#bdb8b0'; g.fillRect(0, 0, w, w);
    g.translate(w / 2, w / 2);
    g.font = '600 38px "JetBrains Mono", ui-monospace, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    labels.forEach((t, i) => {
      g.save(); g.rotate((i / labels.length) * Math.PI * 2); g.translate(0, -w * .36);
      g.fillStyle = accent && accent.includes(t) ? '#b3262d' : '#1b1716'; g.fillText(t, 0, 0); g.restore();
    });
    g.beginPath(); g.arc(0, 0, w * .2, 0, 7); g.fillStyle = '#a9a39a'; g.fill();
  });
  function dial(x, z, r, h, labels, accent) {
    const grp = new THREE.Group(); grp.position.set(x, Y2, z); body.add(grp);
    add(new THREE.CylinderGeometry(r * .8, r * .8, .08, 48), m.black, 0, .04, 0, grp);     // collar
    const side = add(new THREE.CylinderGeometry(r, r, h, 72, 1, true), m.silverKnurl, 0, .08 + h / 2, 0, grp);
    const top = add(new THREE.CircleGeometry(r, 72), new THREE.MeshStandardMaterial({ map: dialText(labels, accent), metalness: .75, roughness: .32 }), 0, .08 + h + .001, 0, grp);
    top.rotation.x = -Math.PI / 2;
    return { grp, side, top };
  }
  dial(-1.7, -.05, .5, .3, ['A', '4000', '2000', '1000', '500', '250', '125', '60', '30', '15', '8', '4', '2', '1', 'T', 'B'], ['A']);
  dial(-2.62, -.42, .36, .26, ['0', '+1', '+2', '+3', 'C', '-3', '-2', '-1'], ['C']);
  dial(2.0, -.05, .46, .28, ['S', 'CL', 'CH', 'BKT', 'ADV', 'HDR', '▣', 'MV'], []);
  // shutter button with the on/off lever around it
  add(new THREE.CylinderGeometry(.3, .3, .07, 40), m.silver, -2.62, Y2 + .04, .38);
  add(new THREE.BoxGeometry(.2, .05, .16), m.silver, -2.92, Y2 + .04, .48);
  add(new THREE.CylinderGeometry(.15, .17, .14, 32), m.silver, -2.62, Y2 + .14, .38);
  add(new THREE.CylinderGeometry(.13, .13, .02, 32), m.black, -2.62, Y2 + .215, .38);

  // ---------- front details ----------
  add(new THREE.TorusGeometry(1.5, .09, 16, 120), m.silver, AX, AY, front + .02);         // lens mount ring
  add(new THREE.CylinderGeometry(.09, .09, .05, 24), m.black, AX - 1.95, AY + 1.25, front + .02).rotation.x = Math.PI / 2; // AF assist lamp
  add(new THREE.CylinderGeometry(.24, .24, .06, 40), m.silver, AX + 1.85, AY - .95, front + .03).rotation.x = Math.PI / 2;  // lens release
  // strap lugs
  [-1, 1].forEach((s) => { const lug = add(new THREE.TorusGeometry(.14, .045, 10, 24), m.silver, s * (W / 2 + .06), Y1 + .35, 0); lug.rotation.y = Math.PI / 2; });

  // ---------- back: tilting screen and a few buttons ----------
  add(new RoundedBoxGeometry(3.9, 2.45, .12, 3, .06), m.black, AX - .25, (Y0 + Y1) / 2 + .1, -front - .06);
  const lcd = add(new THREE.PlaneGeometry(3.6, 2.2), m.screen, AX - .25, (Y0 + Y1) / 2 + .1, -front - .125);
  lcd.rotation.y = Math.PI;
  [[-2.55, .2], [-2.55, -.45], [-2.0, -1.05], [-2.75, -1.05]].forEach(([x, y]) => { add(new THREE.CylinderGeometry(.12, .12, .08, 24), m.black, x, y, -front - .04).rotation.x = Math.PI / 2; });
  add(new RoundedBoxGeometry(.9, .55, .45, 3, .12), m.black, AX, Y2 + .28, -.98);         // eyecup

  // the body sits behind the lens: mount face at the lens's back (z = -2.7), lens axis at (AX, AY)
  body.position.set(-AX, -AY, -2.7 - front - .02);
  return body;
}
