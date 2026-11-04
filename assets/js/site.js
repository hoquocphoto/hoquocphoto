// Nathan Bui — Photography: page behaviour (scroll, viewfinder HUD, AF cursor, reveals, albums, lightbox).
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

  // ---------- aperture breaks between galleries: the iris opens as you scroll through ----------
  if (reduce) root.classList.add('no-motion');
  else gsap.utils.toArray('.iris-break').forEach((el) => {
    const iris = el.querySelector('.iris'), label = el.querySelector('.iris-break__label');
    gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: .6 } })
      .fromTo(iris, { '--r': '0vmax', '--spin': '-70deg' }, { '--r': '100vmax', '--spin': '0deg', ease: 'power2.in', duration: 1 }, 0)
      .fromTo(label, { scale: .82 }, { scale: 1.06, ease: 'none', duration: 1 }, 0)
      .to(label, { autoAlpha: 0, y: -40, duration: .25 }, .78);
  });

  // ---------- section motifs ----------
  if (!reduce) {
    const sky = { trigger: '.set--scenery', start: 'top bottom', end: 'top -30%', scrub: true };
    gsap.fromTo('.m-sun', { y: 110 }, { y: -70, ease: 'none', scrollTrigger: sky });
    gsap.fromTo('.m-far', { y: 40 }, { y: -10, ease: 'none', scrollTrigger: sky });
    gsap.fromTo('.m-mid', { y: 24 }, { y: 0, ease: 'none', scrollTrigger: sky });
  }

  // ---------- each gallery reveals its photos differently ----------
  // scenery: exposes up from the horizon like a sunrise · people: racks into focus · events: pops with a flash
  const FX = {
    expose: {
      from: { clipPath: 'inset(100% 0% 0% 0%)', filter: 'brightness(.2) sepia(.9) saturate(1.5)', scale: 1.14 },
      play: (img) => gsap.timeline()
        .to(img, { clipPath: 'inset(0% 0% 0% 0%)', duration: .9, ease: 'power3.inOut' })
        .to(img, { filter: 'brightness(1) sepia(0) saturate(1)', scale: 1, duration: 1.6, ease: 'power2.out', clearProps: 'filter,transform' }, '-=.5'),
    },
    focus: {
      from: { filter: 'blur(18px)', scale: 1.08, opacity: 0 },
      play: (img) => gsap.to(img, { filter: 'blur(0px)', scale: 1, opacity: 1, duration: 1.3, ease: 'power3.out', clearProps: 'filter,transform' }),
    },
    // weddings: frames on the strip start as colour negatives and develop into the photo
    develop: {
      from: { filter: 'invert(1) sepia(.6) saturate(1.6) brightness(.85)', opacity: .9 },
      play: (img) => gsap.to(img, { filter: 'invert(0) sepia(0) saturate(1) brightness(1)', opacity: 1, duration: 1.8, ease: 'power2.inOut', clearProps: 'filter,opacity' }),
    },
    polaroid: { from: {}, play: () => {} },   // handled in hq.js (flash, develop, wiggle)
    flash: {
      from: { opacity: 0 },
      play: (img, fig) => gsap.timeline()
        .set(img, { opacity: 1, filter: 'brightness(1.9) contrast(.8)' })
        .fromTo(fig.querySelector('.flash'), { opacity: .95 }, { opacity: 0, duration: .75, ease: 'expo.out' }, 0)
        .to(img, { filter: 'brightness(1) contrast(1)', duration: 1.1, ease: 'power2.out', clearProps: 'filter' }, 0),
    },
  };
  const fxOf = (fig) => FX[fig.closest('.set').dataset.fx] || FX.focus;
  document.querySelectorAll('[data-fx="flash"] .ph:not(.ph--empty)').forEach((fig) => { const f = document.createElement('i'); f.className = 'flash'; fig.appendChild(f); });
  if (!reduce) {
    document.querySelectorAll('.ph:not(.ph--empty)').forEach((fig) => gsap.set(fig.querySelector('img'), fxOf(fig).from));
    ScrollTrigger.batch('.ph:not(.ph--empty)', {
      start: 'top 92%', once: true,
      onEnter: (batch) => batch.forEach((fig, i) => gsap.delayedCall(i * .09, () => fxOf(fig).play(fig.querySelector('img'), fig))),
    });
  }
  // recent-events ticker: duplicate the items so the loop is seamless
  const track = document.querySelector('.recent__track');
  if (track) [...track.children].forEach((n) => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); });
  gsap.utils.toArray('.set__head, .album, .tips, .set__cta, .offer__grid .card, .expect__step, .about__grid > *, .reach__card').forEach((el) => {
    gsap.from(el, { autoAlpha: 0, y: 40, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

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
    // lightbox
    const lb = document.querySelector('.lb');
    if (lb && typeof lb.showModal === 'function') {
      const links = [...document.querySelectorAll('.ph a')];
      const img = lb.querySelector('img'), cap = lb.querySelector('figcaption b'), exif = lb.querySelector('figcaption span');
      let list = links, i = 0;
      const show = (n) => {
        const items = list.filter((a) => !a.closest('[hidden]'));
        if (!items.length) return;
        i = (n + items.length) % items.length;
        const a = items[i];
        img.src = a.href; img.alt = a.dataset.cap; cap.textContent = a.dataset.cap; exif.textContent = a.dataset.exif;
        if (window.gsap) gsap.fromTo(img, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .55, ease: 'power3.inOut' });
      };
      const open = () => { lb.showModal(); NB.lenis && NB.lenis.stop(); };
      links.forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); list = links; lb.classList.remove('is-single'); show(list.filter((x) => !x.closest('[hidden]')).indexOf(a)); open(); }));
      NB.openList = (as, n) => { list = as; lb.classList.remove('is-single'); show(n); open(); };
      NB.openSingle = (href, c, x) => {
        const a = document.createElement('a'); a.href = href; a.dataset.cap = c; a.dataset.exif = x;
        list = [a]; lb.classList.add('is-single'); show(0); open();
      };
      lb.querySelector('.lb__prev').addEventListener('click', () => show(i - 1));
      lb.querySelector('.lb__next').addEventListener('click', () => show(i + 1));
      lb.querySelector('.lb__x').addEventListener('click', () => lb.close());
      lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
      lb.addEventListener('close', () => { if (!document.querySelector('dialog[open]')) NB.lenis && NB.lenis.start(); });
      lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') show(i - 1); if (e.key === 'ArrowRight') show(i + 1); });
    }
    // albums: a big cover per shoot; opening one shows every photo from it, and the
    // browser's back button closes it again (#album-<slug> in the address bar)
    const av = document.querySelector('.av'), albumJson = document.getElementById('album-data');
    if (av && albumJson && typeof av.showModal === 'function') {
      const albums = JSON.parse(albumJson.textContent);
      const grid = av.querySelector('.av__grid'), title = av.querySelector('.av__t');
      const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      let pushed = false, opener = null;
      const openAlbum = (slug, push) => {
        const a = albums[slug]; if (!a) return;
        const card = document.querySelector(`.album[data-album="${slug}"]`);
        const sec = card && card.closest('.set');
        av.style.setProperty('--av-accent', sec ? getComputedStyle(sec).getPropertyValue('--s-em').trim() : '');
        title.textContent = a.title + ' ';
        if (a.em) { const em = document.createElement('em'); em.textContent = a.em; title.append(em); }
        av.querySelector('.av__sub').textContent = a.sub;
        av.querySelector('.av__note').textContent = a.note || '';
        grid.innerHTML = a.photos.map(([src, full, w, h, cap, exif], i) =>
          `<a class="av__ph" href="${full}" data-cap="${esc(cap)}" data-exif="${esc(exif)}"><img src="${src}" width="${w}" height="${h}" alt="${esc(cap)}" loading="${i < 6 ? 'eager' : 'lazy'}" decoding="async"></a>`).join('');
        if (!av.open) { opener = card; av.showModal(); NB.lenis && NB.lenis.stop(); }
        av.scrollTop = 0;
        if (push) { history.pushState({ album: slug }, '', '#album-' + slug); pushed = true; }
      };
      document.querySelectorAll('.album').forEach((el) => el.addEventListener('click', (e) => { e.preventDefault(); openAlbum(el.dataset.album, true); }));
      grid.addEventListener('click', (e) => {
        const a = e.target.closest('.av__ph'); if (!a || !NB.openList) return;
        e.preventDefault();
        const all = [...grid.querySelectorAll('.av__ph')];
        NB.openList(all, all.indexOf(a));
      });
      av.querySelector('.av__back').addEventListener('click', () => av.close());
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
        else if (av.open) { pushed = false; av.close(); }
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
