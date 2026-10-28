// Ho Quoc: a different scroll transition into each section.
// 01 light leak · 02 instant photo develops · 03 AF lock + flash · 04 letterbox with REC timecode
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { document.documentElement.classList.add('no-motion'); return; }
  const st = (el) => ({ trigger: el, start: 'top top', end: 'bottom bottom', scrub: .6 });

  // 01 · a warm film light leak washes across, then settles into blush
  document.querySelectorAll('.tx--leak').forEach((el) => {
    const q = (s) => el.querySelector(s);
    gsap.timeline({ scrollTrigger: st(el) })
      .fromTo(q('.leak--a'), { xPercent: -40, scale: .4, opacity: 0 }, { xPercent: 90, scale: 1.6, opacity: 1, ease: 'none', duration: .7 }, 0)
      .fromTo(q('.leak--b'), { xPercent: 40, scale: .5, opacity: 0 }, { xPercent: -70, scale: 1.4, opacity: .9, ease: 'none', duration: .7 }, .08)
      .fromTo(q('.leak--c'), { scale: .2, opacity: 0 }, { scale: 2.2, opacity: 1, ease: 'power1.in', duration: .5 }, .25)
      .to(q('.tx__wash'), { opacity: 1, ease: 'none', duration: .25 }, .45)
      .to(el.querySelectorAll('.leak'), { opacity: 0, duration: .25 }, .65)
      .fromTo(q('.tx__label'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .2 }, .55)
      .to(q('.tx__label'), { opacity: 0, y: -40, duration: .15 }, .85);
  });

  // 02 · an instant photo develops in your hand, then grows until you're inside it
  document.querySelectorAll('.tx--instant').forEach((el) => {
    const q = (s) => el.querySelector(s);
    gsap.timeline({ scrollTrigger: st(el) })
      .fromTo(q('.instant'), { y: 120, rotate: -8, scale: .8 }, { y: 0, rotate: -3, scale: 1, ease: 'power2.out', duration: .25 }, 0)
      .fromTo(q('.instant__chem'), { opacity: 1 }, { opacity: 0, ease: 'none', duration: .35 }, .1)
      .to(q('.instant'), { rotate: 0, scale: 9, ease: 'power2.in', duration: .4 }, .45)
      .fromTo(q('.tx__label'), { opacity: 0, scale: .9 }, { opacity: 1, scale: 1, duration: .15 }, .7)
      .to(q('.tx__label'), { opacity: 0, y: -40, duration: .12 }, .88);
  });

  // 03 · autofocus brackets close in, lock green, then the flash fires
  document.querySelectorAll('.tx--flash').forEach((el) => {
    const q = (s) => el.querySelector(s), lock = q('.af-lock');
    gsap.timeline({ scrollTrigger: { ...st(el), onUpdate: (s) => lock.classList.toggle('is-locked', s.progress > .38) } })
      .fromTo(lock, { '--p': '6%' }, { '--p': '40%', ease: 'power2.inOut', duration: .38 }, 0)
      .to(lock, { opacity: 0, duration: .05 }, .44)
      .fromTo(q('.tx__flash'), { opacity: 0 }, { opacity: 1, duration: .04, ease: 'none' }, .44)
      .set(q('.tx__wash'), { opacity: 1 }, .48)
      .to(q('.tx__flash'), { opacity: 0, duration: .25, ease: 'power2.out' }, .48)
      .fromTo(q('.tx__label'), { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: .15 }, .5)
      .to(q('.tx__label'), { opacity: 0, y: -40, duration: .12 }, .88);
  });

  // 04 · letterbox bars close to black, a REC timecode runs, then they open widescreen
  document.querySelectorAll('.tx--cinema').forEach((el) => {
    const q = (s) => el.querySelector(s), tc = q('[data-tc]');
    const fmt = (p) => { const f = Math.floor(p * 24 * 9); const s = Math.floor(f / 24); return `00:00:${String(s).padStart(2, '0')}:${String(f % 24).padStart(2, '0')}`; };
    gsap.timeline({ scrollTrigger: { ...st(el), onUpdate: (s) => { tc.textContent = fmt(s.progress); } } })
      .to([q('.bar--top'), q('.bar--bot')], { height: '50.5vh', ease: 'power2.in', duration: .35 }, 0)
      .to(q('.rec'), { opacity: 1, duration: .08 }, .2)
      .set(q('.tx__wash'), { opacity: 1 }, .36)
      .to([q('.bar--top'), q('.bar--bot')], { height: '12vh', ease: 'power2.out', duration: .3 }, .42)
      .fromTo(q('.tx__label'), { opacity: 0, letterSpacing: '.3em' }, { opacity: 1, letterSpacing: '0em', duration: .2 }, .5)
      .to([q('.tx__label'), q('.rec')], { opacity: 0, duration: .12 }, .88);
  });

  ScrollTrigger.refresh();
})();
