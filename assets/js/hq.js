// Ho Quoc: the chapter cards between sections, and the small touches inside each section.
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { document.documentElement.classList.add('no-motion'); return; }
  const st = (el) => ({ trigger: el, start: 'top top', end: 'bottom bottom', scrub: .6 });

  // chapter cards: the colour changes behind the number, then the title rises letter by letter and moves on
  const chars = (el) => window.SplitText ? SplitText.create(el, { type: 'chars', mask: 'chars' }).chars : [el];
  document.querySelectorAll('.tx').forEach((el) => {
    const q = (s) => el.querySelector(s);
    gsap.timeline({ scrollTrigger: st(el) })
      .to(q('.tx__wash'), { opacity: 1, ease: 'none', duration: .45 }, 0)
      .from(q('.tx__label span'), { opacity: 0, y: 20, duration: .12 }, .2)
      .from(chars(q('.tx__label b')), { yPercent: 110, duration: .25, stagger: .015, ease: 'power3.out' }, .22)
      .from(q('.tx__label small'), { opacity: 0, y: 16, duration: .12 }, .4)
      .to(q('.tx__label'), { opacity: 0, y: -40, duration: .15 }, .85);
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
