// Support contacts. Fill these in when ready; empty ones show "coming soon".
const CONTACT = {
  email: 'razvyn@cmdglas.com',
  discord: 'https://discord.gg/dkBvyyYNHj',
};

// Each product's help forum on the CMDGLAS Discord (invites never expire).
const DISCORD = {
  deck: { url: 'https://discord.gg/ZVmtnA2wcG', channel: 'command-deck-help' },
  kneeboard: { url: 'https://discord.gg/dBbec4vpXr', channel: 'kneeboard-help' },
  cursors: { url: 'https://discord.gg/DfAm9vAHYr', channel: 'cursor-pack-help' },
  license: { url: 'https://discord.gg/vFhsPFdAXW', channel: 'license-and-payment' },
};

const PRODUCTS = {
  deck: 'Command Deck',
  kneeboard: 'Kneeboard + Builder',
  cursors: 'Spectre Cursor Pack',
  license: 'License key or payment',
};
let chosen = null;

function emailLink() {
  const v = CONTACT.email;
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v || '')) return null;
  const subject = `[${chosen ? PRODUCTS[chosen] : 'CMDGLAS'}] Support request`;
  const body = 'Order email:\nProduct: ' + (chosen ? PRODUCTS[chosen] : '') + '\nWindows version:\nWhat happened:\nWhat I expected:\n\n(Do not include your license key.)';
  const a = document.createElement('a');
  a.href = `mailto:${v}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  a.textContent = v + (chosen ? ` (about ${PRODUCTS[chosen]})` : '');
  return a;
}

function renderContacts() {
  document.querySelectorAll('[data-contact]').forEach(el => {
    if (el.dataset.contact === 'email') { const a = emailLink(); if (a) el.replaceChildren(a); }
    else if (el.dataset.contact === 'discord') {
      const d = chosen && DISCORD[chosen], url = d ? d.url : CONTACT.discord;
      if (!/^https:\/\/(discord\.gg|discord\.com\/invite)\//i.test(url || '')) return;
      const a = document.createElement('a'); a.href = url; a.rel = 'noopener'; a.target = '_blank';
      a.textContent = d ? `Open #${d.channel} on the CMDGLAS Discord` : 'Join the CMDGLAS Discord';
      el.replaceChildren(a);
    }
  });
}

function pick(id, scroll) {
  chosen = PRODUCTS[id] ? id : null;
  document.querySelectorAll('[data-pick]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.pick === chosen)));
  document.querySelectorAll('[data-product]').forEach(d => { d.hidden = !!chosen && d.dataset.product !== chosen; });
  document.getElementById('contact-product').textContent = chosen ? PRODUCTS[chosen] : 'not chosen yet - pick one at the top of this page';
  document.getElementById('contact-channel').textContent = chosen && DISCORD[chosen] ? '#' + DISCORD[chosen].channel : 'the help forum for your product';
  document.getElementById('pick-note').textContent = chosen ? `Showing answers for ${PRODUCTS[chosen]}. Still stuck? Use Contact at the bottom.` : 'Pick one to see its answers and a pre-filled email.';
  renderContacts();
  if (chosen) history.replaceState(null, '', '#' + chosen);
  if (scroll) document.getElementById('using').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => pick(b.dataset.pick, true)));
// A link like /shop/support/#deck opens with that product chosen (for YouTube and the programs).
pick(location.hash.slice(1), false);
renderContacts();
