// Ho Quoc: a different scroll transition into each section.
// 01 light leak · 02 instant photo develops · 03 AF lock + flash
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { document.documentElement.classList.add('no-motion'); return; }
  const st = (el) => ({ trigger: el, start: 'top top', end: 'bottom bottom', scrub: .6 });
  const rnd = (a, b) => a + Math.random() * (b - a);

  // a handful of pieces thrown out from the middle (petals for weddings, confetti for events)
  const burst = (box, n, colors, petal) => {
    const bits = [];
    for (let i = 0; i < n; i++) {
      const b = document.createElement('i');
      const w = petal ? rnd(12, 22) : rnd(6, 12), h = petal ? w * .7 : rnd(10, 18);
      b.style.cssText = `--w:${w}px;--h:${h}px;--c:${colors[i % colors.length]};--br:${petal ? '0 100% 0 100%' : '1px'}`;
      const a = rnd(0, Math.PI * 2), r = rnd(.18, .48);
      b.dataset.x = Math.cos(a) * r * innerWidth; b.dataset.y = Math.sin(a) * r * innerHeight - innerHeight * .12; b.dataset.r = rnd(-360, 360);
      box.appendChild(b); bits.push(b);
    }
    return bits;
  };
  const throwBits = (tl, bits, at) => tl
    .fromTo(bits, { opacity: 0, x: 0, y: 0, rotate: 0, scale: .4 }, { opacity: 1, scale: 1, x: (i, b) => +b.dataset.x, y: (i, b) => +b.dataset.y, rotate: (i, b) => +b.dataset.r, ease: 'power3.out', duration: .2 }, at)
    .to(bits, { opacity: 0, y: (i, b) => +b.dataset.y + innerHeight * .25, ease: 'power1.in', duration: .18 }, at + .2);

  // 01 · a warm film light leak washes across, two rings slide together, petals get thrown
  document.querySelectorAll('.tx--leak').forEach((el) => {
    const q = (s) => el.querySelector(s);
    const loops = el.querySelectorAll('.rings circle');
    const petals = burst(q('.tx__petals'), 26, ['#fff', '#ead6b8', '#c99a6b', '#ffe7c2'], true);
    q('.tx__petals').classList.add('burst');
    const tl = gsap.timeline({ scrollTrigger: st(el) })
      .fromTo(q('.leak--a'), { xPercent: -40, scale: .4, opacity: 0 }, { xPercent: 90, scale: 1.6, opacity: 1, ease: 'none', duration: .7 }, 0)
      .fromTo(q('.leak--b'), { xPercent: 40, scale: .5, opacity: 0 }, { xPercent: -70, scale: 1.4, opacity: .9, ease: 'none', duration: .7 }, .08)
      .fromTo(q('.leak--c'), { scale: .2, opacity: 0 }, { scale: 2.2, opacity: 1, ease: 'power1.in', duration: .5 }, .25)
      .fromTo(loops, { strokeDasharray: 327, strokeDashoffset: 327 }, { strokeDashoffset: 0, ease: 'power2.out', duration: .3 }, .1)
      .fromTo(q('.ring-a'), { opacity: 0, x: -70 }, { opacity: 1, x: 0, ease: 'power2.out', duration: .32 }, .1)
      .fromTo(q('.ring-b'), { opacity: 0, x: 70 }, { opacity: 1, x: 0, ease: 'power2.out', duration: .32 }, .1)
      .to(q('.tx__wash'), { opacity: 1, ease: 'none', duration: .25 }, .45)
      .to(el.querySelectorAll('.leak'), { opacity: 0, duration: .25 }, .65)
      .fromTo(el.querySelectorAll('.tx__label > :not(.rings)'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .2, stagger: .02 }, .5)
      .to(q('.tx__label'), { opacity: 0, y: -40, duration: .15 }, .85);
    throwBits(tl, petals, .46);
  });

  // 02 · an instant photo develops in your hand, then grows until you're inside it
  document.querySelectorAll('.tx--instant').forEach((el) => {
    const q = (s) => el.querySelector(s);
    q('.tx__petals').classList.add('burst');
    const blossoms = burst(q('.tx__petals'), 30, ['#7d9a7f', '#8fae90', '#6b8a6f', '#a3baa0'], true);
    const tl = gsap.timeline({ scrollTrigger: st(el) })
      .fromTo(q('.instant'), { y: 120, rotate: -8, scale: .8 }, { y: 0, rotate: -3, scale: 1, ease: 'power2.out', duration: .25 }, 0)
      .fromTo(q('.instant__chem'), { opacity: 1 }, { opacity: 0, ease: 'none', duration: .35 }, .1)
      .to(q('.instant'), { rotate: 0, scale: 9, ease: 'power2.in', duration: .4 }, .45)
      .to(q('.instant__scene'), { opacity: 0, ease: 'none', duration: .14 }, .66)
      .fromTo(q('.tx__label'), { opacity: 0, scale: .9 }, { opacity: 1, scale: 1, duration: .15 }, .7)
      .to(q('.tx__label'), { opacity: 0, y: -40, duration: .12 }, .88);
    throwBits(tl, blossoms, .42);
  });

  // 03 · autofocus brackets close in, lock green, the flash fires and confetti goes up
  document.querySelectorAll('.tx--flash').forEach((el) => {
    const q = (s) => el.querySelector(s), lock = q('.af-lock');
    const box = q('.confetti'); box.classList.add('burst');
    const bits = burst(box, 44, ['#2b4c63', '#a8401f', '#f2b660', '#7fa3b9', '#fff', '#e9a27a']);
    const tl = gsap.timeline({ scrollTrigger: { ...st(el), onUpdate: (s) => lock.classList.toggle('is-locked', s.progress > .38) } })
      .fromTo(lock, { '--p': '6%' }, { '--p': '40%', ease: 'power2.inOut', duration: .38 }, 0)
      .to(lock, { opacity: 0, duration: .05 }, .44)
      .fromTo(q('.tx__flash'), { opacity: 0 }, { opacity: 1, duration: .04, ease: 'none' }, .44)
      .set(q('.tx__wash'), { opacity: 1 }, .48)
      .to(q('.tx__flash'), { opacity: 0, duration: .25, ease: 'power2.out' }, .48)
      .fromTo(q('.tx__label'), { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: .15 }, .5)
      .to(q('.tx__label'), { opacity: 0, y: -40, duration: .12 }, .88);
    throwBits(tl, bits, .47);
  });

  // ---------- weddings: the eucalyptus sprigs draw themselves in ----------
  document.querySelectorAll('.sprig').forEach((sv) => {
    const stem = sv.querySelector('.sprig__stem'), len = stem.getTotalLength();
    gsap.timeline({ scrollTrigger: { trigger: sv.closest('.set'), start: 'top 75%', once: true } })
      .fromTo(stem, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' })
      .fromTo(sv.querySelectorAll('use, .sprig__bud'), { opacity: 0 }, { opacity: 1, duration: .5, stagger: .12 }, .3);
  });

  // the instant camera in the header flashes and prints one photo
  const cam = document.querySelector('.polcam');
  if (cam) {
    const print = cam.querySelector('.polcam__print');
    gsap.timeline({ scrollTrigger: { trigger: '.set--ivory', start: 'top 70%', once: true } })
      .fromTo(cam.querySelector('.polcam__burst'), { opacity: 0, scale: .3 }, { opacity: 1, scale: 1, duration: .1 })
      .to(cam.querySelector('.polcam__burst'), { opacity: 0, scale: 1.5, duration: .6, ease: 'power2.out' })
      .to(cam, { keyframes: [{ y: -4 }, { y: 2 }, { y: 0 }], duration: .25 }, 0)
      .to(print, { y: '72%', duration: 1.4, ease: 'power2.out' }, .3)
      .to(print, { rotate: -6, duration: .8, ease: 'sine.inOut' }, 1.2)
      .to(print.querySelector('i'), { background: 'linear-gradient(150deg, #e8dccb, #ecd0b2 45%, #bfd3df)', duration: 2.4 }, .6);
  }

  ScrollTrigger.refresh();
})();
