// Checkout links. An empty link shows "Coming soon".
const CHECKOUT = {
  deck: 'https://buy.stripe.com/9B63cvaED7c3cbLchtgQE00',
  kneeboard: 'https://buy.stripe.com/6oUfZh9Az2VN0t35T5gQE01',
  cursors: 'https://buy.stripe.com/aFa4gzcMLdAr2Bb95hgQE06',   // $1.99 (was $6.99 link 00w6oHh312VN1x72GTgQE02)
  bundle: 'https://buy.stripe.com/28EcN5143gMDejT5T5gQE0a',   // $25.00 (was $20.00 link fZu14ncMLdArb7H81dgQE08, $24.99 link 4gM6oH3cbeEvejTchtgQE03)
  all: 'https://buy.stripe.com/bJe9ATdQPeEvb7H1CPgQE09',   // $30.00 (was $25.00 link 8x2cN59Az1RJejTgxJgQE07, $29.99 link 5kQ00j3cbeEva3D3KXgQE04)
  petals: 'https://buy.stripe.com/3cIdR99Az7c3b7H6X9gQE05',   // Speech Petal $2.99, not in any bundle
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
