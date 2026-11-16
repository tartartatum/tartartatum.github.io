// Checkout links. An empty link shows "Coming soon".
// 16 NOV 2026: all switched off - the products are still being set up, nothing is for sale yet.
const CHECKOUT = {
  deck: '',
  kneeboard: '',
  cursors: '',
  bundle: '',
  all: '',
  petals: '',
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
});
