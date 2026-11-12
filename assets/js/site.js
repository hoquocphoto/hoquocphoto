// Ho Quoc — Photography: page behaviour (scroll, viewfinder HUD, AF cursor, reveals, albums, lightbox).
// The WebGL layer lives in scene.js; the two talk through window.NB.
(() => {
  const root = document.documentElement;
  const NB = window.NB || (window.NB = {});
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const webgl = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } })();
  if (!webgl || reduce || !hasGsap || /[?&]nogl/.test(location.search)) root.classList.add('no-gl');
  if (!hasGsap) { root.classList.remove('js'); wireBasics(); return; }

  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // ---------- smooth scroll ----------
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: .1, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  NB.lenis = lenis;
  const scrollToEl = (el, immediate) => lenis ? lenis.scrollTo(el, { immediate, offset: 0 }) : el.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' });

  // ---------- focal-plane shutter ----------
  const shutter = document.querySelector('.shutter');
  const [curtA, curtB] = shutter.querySelectorAll('i');
  NB.shutter = (mid) => gsap.timeline()
    .set(shutter, { autoAlpha: 1 })
    .fromTo(curtA, { yPercent: -100 }, { yPercent: 0, duration: .26, ease: 'power3.in' }, 0)
    .fromTo(curtB, { yPercent: 100 }, { yPercent: 0, duration: .26, ease: 'power3.in' }, 0)
    .add(() => mid && mid())
    .to(curtA, { yPercent: 100, duration: .42, ease: 'power3.out' }, '+=.06')
    .to(curtB, { yPercent: -100, duration: .42, ease: 'power3.out' }, '<.05')
    .set(shutter, { autoAlpha: 0 });

  // ---------- pinned hero (lens) and roll (film) ----------
  const gl = !root.classList.contains('no-gl');
  if (gl) {
    ScrollTrigger.create({ trigger: '.hero', pin: '.hero__pin', start: 'top top', end: '+=160%', onUpdate: (s) => { NB.heroP = s.progress; } });
    const copy = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=160%', scrub: true } });
    copy.to('.hero__copy', { autoAlpha: 0, y: -60, ease: 'none', duration: .3 }, 0)
      .to('.hero__scroll', { autoAlpha: 0, duration: .1 }, 0)
      .to('.hero__aperture', { autoAlpha: 0, duration: .12 }, .7);
    if (document.querySelector('.roll')) {
    ScrollTrigger.create({ trigger: '.roll', pin: '.roll__pin', start: 'top top', end: '+=520%', onUpdate: (s) => { NB.rollP = s.progress; } });
    gsap.from('.roll__ui > *', { autoAlpha: 0, y: 30, stagger: .1, scrollTrigger: { trigger: '.roll', start: 'top 40%', toggleActions: 'play none none reverse' } });
    gsap.to('.roll__ui', { autoAlpha: 0, scrollTrigger: { trigger: '.roll', start: 'top -60%', end: 'top -110%', scrub: true } });
    // the skip button pops in as the roll arrives, and Esc does the same thing
    gsap.from('.roll__skip', { autoAlpha: 0, scale: .6, y: -20, duration: .7, ease: 'back.out(2)', scrollTrigger: { trigger: '.roll', start: 'top 30%', toggleActions: 'play none none reverse' } });
    addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || document.querySelector('dialog[open]')) return;
      const r = document.querySelector('.roll').getBoundingClientRect();
      if (r.top < innerHeight * .5 && r.bottom > innerHeight * .5) document.querySelector('.roll__skip').click();
    });
    }
  }

  // ---------- intro: shutter opens once the lens has its first photos ----------
  let opened = false;
  NB.ready = () => {
    if (opened) return; opened = true; NB.opened = true;
    const tl = gsap.timeline();
    tl.to(curtA, { yPercent: -100, duration: .9, ease: 'expo.inOut' }, .1)
      .to(curtB, { yPercent: 100, duration: .9, ease: 'expo.inOut' }, .1)
      .set(shutter, { autoAlpha: 0 })
      .add(() => { shutter.classList.remove('is-loading'); NB.playIntro && NB.playIntro(); }, .2)
      .from('[data-intro]', { autoAlpha: 0, y: 40, duration: 1.1, ease: 'power3.out', stagger: .09 }, .75);
  };
  shutter.classList.add('is-loading');
  gsap.set([curtA, curtB], { yPercent: 0 }); gsap.set(shutter, { autoAlpha: 1 });
  if (!gl) setTimeout(NB.ready, 300);
  setTimeout(NB.ready, 4000);

  if (reduce) root.classList.add('no-motion');

  // ---------- section motifs ----------
  if (!reduce) {
    const sky = { trigger: '.set--scenery', start: 'top bottom', end: 'top -30%', scrub: true };
    gsap.fromTo('.m-sun', { y: 110 }, { y: -70, ease: 'none', scrollTrigger: sky });
    gsap.fromTo('.m-far', { y: 40 }, { y: -10, ease: 'none', scrollTrigger: sky });
    gsap.fromTo('.m-mid', { y: 24 }, { y: 0, ease: 'none', scrollTrigger: sky });
  }

  // ---------- one way in for every album: the cover racks into focus (weddings develop from the negative) ----------
  if (!reduce) {
    const NEG = { filter: 'invert(1) sepia(.6) saturate(1.6) brightness(.85)' }, SOFT = { filter: 'blur(16px)', scale: 1.08, opacity: 0 };
    document.querySelectorAll('.album').forEach((card) => {
      gsap.set([card.querySelector('.album__pile'), card.querySelector('.album__meta')], { autoAlpha: 0, y: 40 });
      gsap.set(card.querySelector('.album__cover img'), card.closest('.albums--neg') ? NEG : SOFT);
    });
    ScrollTrigger.batch('.album', {
      start: 'top 88%', once: true,
      onEnter: (batch) => batch.forEach((card, i) => {
        const neg = !!card.closest('.albums--neg');
        gsap.timeline({ delay: i * .12 })
          .to(card.querySelector('.album__pile'), { autoAlpha: 1, y: 0, duration: .9, ease: 'power3.out', clearProps: 'transform' }, 0)
          .to(card.querySelector('.album__cover img'), neg
            ? { filter: 'invert(0) sepia(0) saturate(1) brightness(1)', duration: 1.8, ease: 'power2.inOut', clearProps: 'filter' }
            : { filter: 'blur(0px)', scale: 1, opacity: 1, duration: 1.3, ease: 'power3.out', clearProps: 'filter,transform,opacity' }, .15)
          .to(card.querySelector('.album__meta'), { autoAlpha: 1, y: 0, duration: .8, ease: 'power3.out', clearProps: 'transform' }, .25);
      }),
    });
  }

  // ---------- section headings come up line by line; the other blocks fade up ----------
  if (!reduce && window.SplitText) gsap.utils.toArray('.set__t, .about__t, .offer__t, .expect__t, .book__t').forEach((h) => SplitText.create(h, {
    type: 'lines', mask: 'lines', autoSplit: true,
    onSplit: (s) => gsap.from(s.lines, { yPercent: 105, duration: 1, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 88%', once: true } }),
  }));
  if (!reduce) gsap.utils.toArray('.set__no, .set__side, .tips, .set__cta, .offer__grid .card, .expect__step, .about__photo, .reach__card').forEach((el) => {
    gsap.from(el, { autoAlpha: 0, y: 40, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  // recent-events ticker: duplicate the items so the loop is seamless
  const track = document.querySelector('.recent__track');
  if (track) [...track.children].forEach((n) => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); });

  // ---------- viewfinder HUD ----------
  const hud = { ss: q('[data-hud="ss"]'), f: q('[data-hud="f"]'), iso: q('[data-hud="iso"]'), mm: q('[data-hud="mm"]'), level: q('.hud__level i') };
  function q(s) { return document.querySelector(s); }
  const visible = new Set();
  const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)), { rootMargin: '-30% 0px -30% 0px' });
  document.querySelectorAll('.ph:not(.ph--empty), .album').forEach((f) => io.observe(f));
  let last = '';
  const setHud = (o) => {
    const key = o.f + o.ss + o.iso + o.mm + o.n; if (key === last) return; last = key;
    hud.ss.textContent = o.ss; hud.f.textContent = o.f; hud.iso.textContent = o.iso; hud.mm.textContent = o.mm;
  };
  const onPaper = () => document.querySelector('.paper').getBoundingClientRect().top < innerHeight * .5;
  gsap.ticker.add(() => {
    root.classList.toggle('on-paper', onPaper());
    if (NB.hudOverride && !onPaper()) setHud(NB.hudOverride);
    else {
      let best = null, bd = Infinity;
      visible.forEach((f) => { const r = f.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - innerHeight / 2); if (d < bd && !f.hidden) { bd = d; best = f; } });
      if (best) {
        const a = best.matches('a') ? best : best.querySelector('a');
        const [fs, ss, iso, mm] = (a.dataset.exif || '').split(' · ');
        if (mm) setHud({ f: fs.replace('f/', 'F'), ss, iso, mm });   // film scans have no exposure to show
      }
    }
    const v = lenis ? lenis.velocity : 0;
    hud.level.style.transform = `rotate(${clamp(v * .35, -14, 14)}deg)`;
  });

  // ---------- AF reticle cursor ----------
  const af = document.querySelector('.af');
  if (fine && !reduce) {
    root.classList.add('has-af');
    const label = af.querySelector('.af__label');
    const st = { x: innerWidth / 2, y: innerHeight / 2, w: 44, h: 44, tx: 0, ty: 0, tw: 44, th: 44 };
    let target = null, mx = st.x, my = st.y;
    addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    document.addEventListener('pointerover', (e) => {
      const a = e.target.closest('.ph a, .strip__frame, .album__cover, .av__ph');
      if (a !== target) {
        target = a; af.classList.toggle('is-locked', !!a);
        if (a && a.dataset.exif) label.textContent = a.dataset.exif; else label.textContent = '';
      }
      af.classList.toggle('is-link', !a && !!e.target.closest('a, button, .chip, input, select, textarea'));
    });
    gsap.ticker.add(() => {
      if (target && target.isConnected) {
        const r = target.getBoundingClientRect();
        st.tx = r.left - 6; st.ty = r.top - 6; st.tw = r.width + 12; st.th = r.height + 12;
      } else {
        const s = root.classList.contains('roll-hover') ? 70 : 44;
        st.tx = mx - s / 2; st.ty = my - s / 2; st.tw = s; st.th = s;
      }
      const k = target ? .22 : .35;
      st.x += (st.tx - st.x) * k; st.y += (st.ty - st.y) * k; st.w += (st.tw - st.w) * k; st.h += (st.th - st.h) * k;
      af.style.transform = `translate3d(${st.x}px, ${st.y}px, 0)`; af.style.width = st.w + 'px'; af.style.height = st.h + 'px';
    });
  }

  // ---------- nav jumps through the shutter ----------
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const el = document.querySelector(a.getAttribute('href')); if (!el) return;
    e.preventDefault();
    if (reduce) { scrollToEl(el, true); return; }
    NB.shutter(() => { scrollToEl(el, true); ScrollTrigger.update(); });
  }));

  wireBasics();

  function wireBasics() {
    const anim = hasGsap && !reduce;
    const onScreen = (r) => r && r.width > 0 && r.bottom > 0 && r.top < innerHeight;

    // lightbox: the photo grows out of the thumbnail you clicked and shrinks back into it.
    // It shows the thumbnail at once and swaps in the full-size file when that has loaded.
    // On a phone, swipe sideways for the next photo or down to close.
    const lb = document.querySelector('.lb');
    if (lb && typeof lb.showModal === 'function') {
      const links = [...document.querySelectorAll('.ph a')];
      const fig = lb.querySelector('.lb__fig'), img = fig.querySelector('img');
      const cap = fig.querySelector('figcaption b'), exif = fig.querySelector('figcaption span');
      const chrome = [...lb.querySelectorAll('button, figcaption')];
      const BG = 'rgba(12, 12, 11, .97)', CLEAR = 'rgba(12, 12, 11, 0)';
      let list = links, i = 0, cur = null, closing = false;
      const items = () => list.filter((a) => !a.closest('[hidden]'));
      const thumb = (a) => (a && a.isConnected && a.querySelector('img')) || null;
      const fit = (ratio) => {
        if (!ratio) { img.style.width = img.style.height = ''; return; }
        const w = Math.min(fig.clientWidth || innerWidth - 128, (innerHeight - 120) * ratio);
        img.style.width = w + 'px'; img.style.height = w / ratio + 'px';
      };
      const show = (n, dir) => {
        const all = items(); if (!all.length) return;
        i = (n + all.length) % all.length;
        const a = cur = all[i], t = thumb(a);
        const ratio = t ? (t.naturalWidth || +t.getAttribute('width')) / (t.naturalHeight || +t.getAttribute('height')) : 0;
        fit(ratio);
        img.src = t ? (t.currentSrc || t.src) : a.href;
        if (t) { const full = new Image(); full.onload = () => { if (cur === a) img.src = a.href; }; full.src = a.href; }
        img.alt = a.dataset.cap; cap.textContent = a.dataset.cap; exif.textContent = a.dataset.exif;
        if (anim && dir) gsap.fromTo(img, { x: dir * 48, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: .35, ease: 'power2.out' });
      };
      // the transform that puts the photo exactly over a rectangle on the page
      const over = (r) => {
        const y0 = gsap.getProperty(img, 'y'), x0 = gsap.getProperty(img, 'x');
        gsap.set(img, { x: 0, y: 0, scale: 1 });
        const b = img.getBoundingClientRect();
        gsap.set(img, { x: x0, y: y0 });
        return { x: r.left + r.width / 2 - (b.left + b.width / 2), y: r.top + r.height / 2 - (b.top + b.height / 2), scaleX: r.width / b.width, scaleY: r.height / b.height };
      };
      const open = (from) => {
        if (!lb.open) { lb.showModal(); NB.lenis && NB.lenis.stop(); }
        if (!anim) return;
        gsap.fromTo(lb, { backgroundColor: CLEAR }, { backgroundColor: BG, duration: .45, ease: 'power2.out' });
        gsap.fromTo(chrome, { autoAlpha: 0 }, { autoAlpha: 1, duration: .3, delay: .3 });
        const t = thumb(from), r = t && t.getBoundingClientRect();
        if (onScreen(r)) gsap.fromTo(img, { ...over(r), autoAlpha: 1 }, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: .6, ease: 'power3.inOut' });
        else gsap.fromTo(img, { autoAlpha: 0, scale: .96 }, { autoAlpha: 1, scale: 1, duration: .4, ease: 'power2.out' });
      };
      const close = () => {
        if (!lb.open || closing) return;
        if (!anim) { lb.close(); return; }
        closing = true;
        const t = thumb(cur), r = t && t.getBoundingClientRect();
        const tl = gsap.timeline({ onComplete: () => { lb.close(); gsap.set(img, { clearProps: 'transform,opacity,visibility' }); gsap.set(lb, { clearProps: 'backgroundColor' }); gsap.set(chrome, { clearProps: 'opacity,visibility' }); closing = false; } });
        tl.to(chrome, { autoAlpha: 0, duration: .15 }, 0).to(lb, { backgroundColor: CLEAR, duration: .45, ease: 'power2.in' }, 0);
        if (onScreen(r)) tl.to(img, { ...over(r), duration: .5, ease: 'power3.inOut' }, 0);
        else tl.to(img, { autoAlpha: 0, scale: .96, duration: .3 }, 0);
      };
      links.forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); list = links; lb.classList.remove('is-single'); show(items().indexOf(a)); open(a); }));
      NB.openList = (as, n) => { list = as; lb.classList.remove('is-single'); show(n); open(as[n]); };
      NB.openSingle = (href, c, x) => {
        const a = document.createElement('a'); a.href = href; a.dataset.cap = c; a.dataset.exif = x;
        list = [a]; lb.classList.add('is-single'); show(0); open(null);
      };
      lb.querySelector('.lb__prev').addEventListener('click', () => show(i - 1, -1));
      lb.querySelector('.lb__next').addEventListener('click', () => show(i + 1, 1));
      lb.querySelector('.lb__x').addEventListener('click', close);
      lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
      lb.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
      lb.addEventListener('close', () => { if (!document.querySelector('dialog[open]')) NB.lenis && NB.lenis.start(); });
      lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') show(i - 1, -1); if (e.key === 'ArrowRight') show(i + 1, 1); });
      addEventListener('resize', () => { if (lb.open && img.style.width) fit(parseFloat(img.style.width) / parseFloat(img.style.height)); });
      // swipe (touch and pen only; a mouse uses the arrows)
      let drag = null;
      if (hasGsap) {
      fig.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' && !closing) drag = { x: e.clientX, y: e.clientY, dx: 0, dy: 0 }; });
      fig.addEventListener('pointermove', (e) => {
        if (!drag) return;
        drag.dx = e.clientX - drag.x; drag.dy = e.clientY - drag.y;
        if (Math.abs(drag.dy) > Math.abs(drag.dx)) {
          const d = Math.max(0, drag.dy);
          gsap.set(img, { x: 0, y: d, scale: 1 - Math.min(d / 1800, .2) });
          gsap.set(lb, { backgroundColor: `rgba(12, 12, 11, ${.97 * (1 - Math.min(d / 420, .85))})` });
        } else gsap.set(img, { x: drag.dx * .6, y: 0 });
      });
      const release = () => {
        if (!drag) return;
        const { dx, dy } = drag; drag = null;
        if (dy > 110 && dy > Math.abs(dx)) { close(); return; }
        if (Math.abs(dx) > 60 && Math.abs(dx) > dy && !lb.classList.contains('is-single')) { show(dx < 0 ? i + 1 : i - 1, dx < 0 ? 1 : -1); gsap.set(lb, { backgroundColor: BG }); return; }
        gsap.to(img, { x: 0, y: 0, scale: 1, duration: .35, ease: 'power3.out' });
        gsap.to(lb, { backgroundColor: BG, duration: .3 });
      };
      fig.addEventListener('pointerup', release);
      fig.addEventListener('pointercancel', release);
      }
    }

    // albums: a big cover per shoot. Opening one grows the cover until it fills the screen and
    // the album appears behind it; closing shrinks it back onto the cover. The browser's back
    // button closes it too (#album-<slug> in the address bar).
    const av = document.querySelector('.av'), albumJson = document.getElementById('album-data');
    if (av && albumJson && typeof av.showModal === 'function') {
      const albums = JSON.parse(albumJson.textContent);
      const grid = av.querySelector('.av__grid'), title = av.querySelector('.av__t');
      const ghost = document.createElement('img');
      ghost.className = 'av__ghost'; ghost.alt = ''; ghost.setAttribute('aria-hidden', 'true'); av.appendChild(ghost);
      const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      let pushed = false, opener = null, closing = false;
      const coverOf = (card) => card && card.querySelector('.album__cover img');
      const box = (r) => ({ left: r.left, top: r.top, width: r.width, height: r.height });
      const clip = (r) => `inset(${Math.max(0, r.top)}px ${Math.max(0, innerWidth - r.right)}px ${Math.max(0, innerHeight - r.bottom)}px ${Math.max(0, r.left)}px round 2px)`;
      const FULL = 'inset(0px 0px 0px 0px round 0px)';
      const settle = () => gsap.from([...av.querySelectorAll('.av__head > *'), ...[...grid.children].slice(0, 12)],
        { autoAlpha: 0, y: 30, duration: .7, stagger: .05, ease: 'power3.out', clearProps: 'opacity,visibility,transform' });
      const grow = (card) => {
        const c = coverOf(card), r = c && c.getBoundingClientRect();
        if (!onScreen(r)) { gsap.from(av, { autoAlpha: 0, y: 28, duration: .4, ease: 'power2.out', clearProps: 'opacity,visibility,transform' }); settle(); return; }
        ghost.src = c.currentSrc || c.src;
        gsap.timeline()
          .fromTo(av, { clipPath: clip(r) }, { clipPath: FULL, duration: .75, ease: 'power3.inOut', clearProps: 'clipPath' }, 0)
          .fromTo(ghost, { autoAlpha: 1, ...box(r) }, { left: 0, top: 0, width: innerWidth, height: innerHeight, duration: .75, ease: 'power3.inOut' }, 0)
          .to(ghost, { autoAlpha: 0, duration: .45, ease: 'power1.out' }, .7)
          .add(settle, .62);
      };
      const shut = () => {
        if (!av.open || closing) return;
        const c = coverOf(opener), r = c && c.getBoundingClientRect();
        if (!anim) { av.close(); return; }
        closing = true;
        const done = () => { av.close(); gsap.set(av, { clearProps: 'opacity,visibility,clipPath' }); gsap.set(ghost, { clearProps: 'all' }); closing = false; };
        if (!onScreen(r)) { gsap.to(av, { autoAlpha: 0, duration: .3, onComplete: done }); return; }
        ghost.src = c.currentSrc || c.src;
        gsap.timeline({ onComplete: done })
          .fromTo(ghost, { autoAlpha: 0, left: 0, top: 0, width: innerWidth, height: innerHeight }, { autoAlpha: 1, duration: .25, ease: 'power1.in' }, 0)
          .to(ghost, { ...box(r), duration: .6, ease: 'power3.inOut' }, .22)
          .fromTo(av, { clipPath: FULL }, { clipPath: clip(r), duration: .6, ease: 'power3.inOut' }, .22);
      };
      const openAlbum = (slug, push, card) => {
        const a = albums[slug]; if (!a) return;
        card = card || document.querySelector(`.album[data-album="${slug}"]`);
        const sec = card && card.closest('.set');
        av.style.setProperty('--av-accent', sec ? getComputedStyle(sec).getPropertyValue('--s-em').trim() : '');
        title.textContent = a.title + ' ';
        if (a.em) { const em = document.createElement('em'); em.textContent = a.em; title.append(em); }
        av.querySelector('.av__sub').textContent = a.sub;
        av.querySelector('.av__note').textContent = a.note || '';
        grid.innerHTML = a.photos.map(([src, full, w, h, cap, exif], i) =>
          `<a class="av__ph" href="${full}" data-cap="${esc(cap)}" data-exif="${esc(exif)}"><img src="${src}" width="${w}" height="${h}" alt="${esc(cap)}" loading="${i < 6 ? 'eager' : 'lazy'}" decoding="async"></a>`).join('');
        const wasOpen = av.open;
        if (!wasOpen) { opener = card; av.showModal(); NB.lenis && NB.lenis.stop(); }
        av.scrollTop = 0;
        if (push) { history.pushState({ album: slug }, '', '#album-' + slug); pushed = true; }
        if (!wasOpen && anim) grow(push ? card : null);
      };
      document.querySelectorAll('.album').forEach((el) => el.addEventListener('click', (e) => { e.preventDefault(); openAlbum(el.dataset.album, true, el); }));
      grid.addEventListener('click', (e) => {
        const a = e.target.closest('.av__ph'); if (!a || !NB.openList) return;
        e.preventDefault();
        const all = [...grid.querySelectorAll('.av__ph')];
        NB.openList(all, all.indexOf(a));
      });
      av.querySelector('.av__back').addEventListener('click', shut);
      av.addEventListener('cancel', (e) => { e.preventDefault(); shut(); });
      // the booking link leaves the album for the contact section, so the album's history entry is replaced, not stepped back over
      av.querySelector('.av__book').addEventListener('click', () => { pushed = false; history.replaceState(null, '', location.pathname + location.search); av.close(); });
      av.addEventListener('close', () => {
        if (pushed) { pushed = false; history.back(); }
        else if (location.hash.startsWith('#album-')) history.replaceState(null, '', location.pathname + location.search);
        NB.lenis && NB.lenis.start();
        if (opener) opener.focus({ preventScroll: true });
      });
      addEventListener('popstate', () => {
        const m = location.hash.match(/^#album-(.+)$/);
        if (m && albums[m[1]]) openAlbum(m[1], false);
        else if (av.open) { pushed = false; shut(); }
      });
      const m = location.hash.match(/^#album-(.+)$/);
      if (m && albums[m[1]]) openAlbum(m[1], false);
    }
    // enquiry form: opens the visitor's email app with the details filled in
    const form = document.getElementById('enquiry');
    if (form) form.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form));
      const subject = `Photo enquiry: ${d.type}${d.date ? ' on ' + d.date : ''}`;
      const body = [`Hi Nathan,`, ``, `Shoot: ${d.type}`, `Date: ${d.date || 'flexible'}`, `Where: ${d.where || 'not sure yet'}`, ``, d.msg || '', ``, `${d.name}`, `${d.email}`, d.phone ? `${d.phone}` : ''].join('\n');
      window.location.href = `mailto:buithanhnhatstudent3@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
    document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  }
})();
