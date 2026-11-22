// Ho Quoc: the illustrated Sydney map (Places on the home page, and Portraits). Each copy runs on its own.
// Hover (or tap, or focus) a spot: its little scene plays and a card lists the albums shot there.
// Picking an album opens it exactly as the gallery below does, by clicking that album's card.
document.querySelectorAll('[data-sydmap]').forEach((root) => {
  const json = root.querySelector('script[type="application/json"]');
  if (!json) return;
  const spots = JSON.parse(json.textContent);
  const stage = root.querySelector('.sydmap__stage');
  const plane = root.querySelector('.sydmap__plane');
  const pop = root.querySelector('.sydmap__pop');
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let current = null, hideTimer = 0;

  // the card sits beside the spot (so the spot's little scene stays in view), on whichever side has room
  const place = (key) => {
    const pin = root.querySelector(`.m-spot[data-spot="${key}"] .m-pin`);
    if (!pin) return;
    const s = stage.getBoundingClientRect(), p = pin.getBoundingClientRect();
    const x = p.left + p.width / 2 - s.left, y = p.top + p.height / 2 - s.top;
    const w = pop.offsetWidth, h = pop.offsetHeight, gap = 46;
    let left, top, side = '';
    if (s.width < w * 2 + 40) {                         // narrow screens: under the map's middle, no arrow
      left = (s.width - w) / 2; top = Math.min(y + 30, s.height - h - 8); side = 'is-under';
    } else if (x + gap + w < s.width - 8) { left = x + gap; }
    else { left = x - gap - w; side = 'is-left'; }
    if (side !== 'is-under') top = Math.max(8, Math.min(y - h / 2, s.height - h - 8));
    pop.style.left = left + 'px'; pop.style.top = top + 'px';
    pop.style.setProperty('--arrow', (y - top) + 'px');
    pop.classList.remove('is-left', 'is-under'); if (side) pop.classList.add(side);
  };

  const show = (key) => {
    clearTimeout(hideTimer);
    if (current === key) return;
    const d = spots[key]; if (!d) return;
    current = key;
    root.querySelectorAll('.m-spot, .mfx, .sydmap__chip').forEach((el) => el.classList.toggle('is-on', (el.dataset.spot || el.dataset.fx) === key));
    pop.innerHTML = `<p class="sydmap__pop-k">${esc(d.area)}</p><b class="sydmap__pop-t">${esc(d.name)}</b>
      <div class="sydmap__sets">${d.sets.map((a) => `<button type="button" class="sydmap__set" data-album="${esc(a.slug)}">
        <img src="${esc(a.src)}" alt="" loading="lazy" decoding="async"><span><b>${esc(a.title)} <em>${esc(a.em)}</em></b><small>${a.n} photos · open album</small></span></button>`).join('')}</div>`;
    pop.hidden = false;
    pop.classList.remove('is-in'); void pop.offsetWidth; pop.classList.add('is-in');
    place(key);
  };

  const hide = (now) => {
    clearTimeout(hideTimer);
    const go = () => {
      current = null; pop.hidden = true;
      root.querySelectorAll('.is-on').forEach((el) => el.classList.remove('is-on'));
    };
    if (now) go(); else hideTimer = setTimeout(go, 260);
  };

  root.querySelectorAll('.m-spot').forEach((el) => {
    const key = el.dataset.spot;
    if (fine) {
      el.addEventListener('mouseenter', () => show(key));
      el.addEventListener('mouseleave', () => hide());
    }
    el.addEventListener('click', (e) => { e.stopPropagation(); current === key && !fine ? hide(true) : show(key); });
    el.addEventListener('focus', () => show(key));
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(key); const b = pop.querySelector('button'); b && b.focus(); } });
  });
  root.querySelectorAll('.sydmap__chip').forEach((el) => {
    el.addEventListener('click', (e) => { e.stopPropagation(); show(el.dataset.spot); });
    if (fine) el.addEventListener('mouseenter', () => show(el.dataset.spot));
  });
  pop.addEventListener('mouseenter', () => clearTimeout(hideTimer));
  pop.addEventListener('mouseleave', () => fine && hide());
  pop.addEventListener('click', (e) => {
    e.stopPropagation();
    const b = e.target.closest('.sydmap__set'); if (!b) return;
    const card = document.querySelector(`.album[data-album="${b.dataset.album}"]`);
    if (card) card.click();
    else location.hash = 'album-' + b.dataset.album;
  });
  document.addEventListener('click', (e) => { if (current && !root.contains(e.target)) hide(true); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && current) hide(true); });
  addEventListener('resize', () => current && place(current));

  // a gentle tilt that follows the mouse, so the map feels like a model on the table
  if (fine && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let raf = 0;
    stage.addEventListener('mousemove', (e) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { plane.style.setProperty('--ry', (px * 6).toFixed(2) + 'deg'); plane.style.setProperty('--rx', (16 - py * 5).toFixed(2) + 'deg'); if (current) place(current); });
    });
    stage.addEventListener('mouseleave', () => { plane.style.removeProperty('--ry'); plane.style.removeProperty('--rx'); });
  }
});
