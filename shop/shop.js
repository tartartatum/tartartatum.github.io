// Checkout links. An empty link shows "Coming soon".
// 16 NOV 2026: all switched off - the products are still being set up, nothing is for sale yet.
const CHECKOUT = {
  deck: '',
  kneeboard: '',
  cursors: '',
  bundle: '',
  all: '',
  petals: '',
  halo: '',
};

document.querySelectorAll('[data-buy]').forEach(a => {
  const url = CHECKOUT[a.dataset.buy];
  if (/^https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+$/.test(url || '')) {
    a.href = url; a.rel = 'noopener'; a.target = '_blank';
  } else {
    a.textContent = 'Coming soon';
    a.classList.add('soon');
    a.removeAttribute('href');
    a.setAttribute('aria-disabled', 'true');
  }
});

// Command Deck picture roll: arrows, dots, arrow keys; the track itself scrolls by swipe or drag.
document.querySelectorAll('.roll').forEach(roll => {
  const track = roll.querySelector('.roll-track'), slides = [...track.querySelectorAll('.roll-slide')];
  const prev = roll.querySelector('.roll-prev'), next = roll.querySelector('.roll-next');
  const count = roll.querySelector('.roll-count'), dots = roll.querySelector('.roll-dots');
  const names = slides.map(s => s.querySelector('figcaption').textContent);
  const dotButtons = names.map((n, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', `Picture ${i + 1}: ${n}`); b.addEventListener('click', () => go(i)); dots.append(b); return b; });
  let current = 0;
  const go = i => { i = Math.max(0, Math.min(slides.length - 1, i)); track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); };
  const show = i => {
    current = i;
    count.textContent = `${i + 1} / ${slides.length} - ${names[i]}`;
    dotButtons.forEach((b, j) => b.setAttribute('aria-current', String(j === i)));
    prev.disabled = i === 0; next.disabled = i === slides.length - 1;
  };
  prev.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));
  track.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); } if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); } });
  let t; track.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(() => show(Math.round(track.scrollLeft / track.clientWidth)), 60); });
  show(0);
  // 22 NOV (Thomas: "i want the pages to scroll automatically through the deck colors"): every picture roll moves on by itself
  // every 4.5 s while it is on screen, back to the first picture after the last. It waits while the pointer is over it or it
  // has keyboard focus, waits 12 s after any click, swipe or key, and never moves for people who ask for reduced motion.
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && slides.length > 1) {
    let visible = false, hover = false, quietUntil = 0;
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: .5 }).observe(track);
    roll.addEventListener('pointerenter', () => { hover = true; }); roll.addEventListener('pointerleave', () => { hover = false; });
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(ev => roll.addEventListener(ev, () => { quietUntil = Date.now() + 12000; }, { passive: true }));
    setInterval(() => { if (visible && !hover && !roll.contains(document.activeElement) && Date.now() > quietUntil && !document.hidden) go(current === slides.length - 1 ? 0 : current + 1); }, 4500);
  }
});
