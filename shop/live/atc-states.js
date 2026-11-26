/* ATC KEY STATES (chat 2, 24 NOV). RAZ: "atc should change to contacting atc to landing assignment given displaying assigned hangar/airlock or pad".
   idle: ATC / TAP  ->  tap: CONTACTING / ATC (dark purple, until an answer or 60 s)  ->  answer: the assigned place (HANGAR 03 / PAD 07 / AIRLOCK 2)
   in big letters + LANDING ASSIGNED underneath (green). Data: window.LIVE.atc = {state:'contacting'|'assigned'|'none', area:'HANGAR 03'} from the
   telemetry bridge (chat 8 adds it; the game data has no ATC field today) or window.__atcDemo for previews. Key text only; layout untouched. */
(function () {
  let tapAt = 0;
  const key = () => [...document.querySelectorAll('.nb.k')].find(k => k.dataset.atc === '1' || (k.querySelector('.nt') && k.querySelector('.nt').textContent.trim() === 'ATC'));
  function state() {
    const LV = (typeof LIVE !== 'undefined') ? LIVE : null; /* the deck's LIVE is a top-level let: readable by name, not via window */
    const a = (window.__atcDemo || (LV && LV.atc)) || null;
    if (a && a.state === 'assigned' && a.area) return { s: 'assigned', area: String(a.area).toUpperCase() };
    if ((a && a.state === 'contacting') || (tapAt && Date.now() - tapAt < 60000)) return { s: 'contacting' };
    return { s: 'idle' };
  }
  let last = '';
  function paint() {
    const k = key(); if (!k) return; k.dataset.atc = '1';
    const nt = k.querySelector('.nt'), ns = k.querySelector('.ns'); if (!nt || !ns) return;
    const st = state(), sig = st.s + (st.area || '');
    if (st.s === 'assigned') tapAt = 0;
    if (k._pend) return;
    const applyAll = () => {
    const want = st.s === 'idle' ? [] : st.s === 'contacting' ? ['lit', 'atc-talk'] : ['lit', 'atc-reply']; /* reply = filled with the lit FLIGHT tab's RSI blue (CSS) */ /* 24 NOV: contacting is communication = deck blue too (RAZ: "communication is blue for my deck instead of pourple") */ /* 24 NOV: the assignment is ATC's reply, not a status -> deck blue, lit (RAZ: "atc reply comes back to blue. its not a status it's a reply") */
    ['ka', 'kg', 'kr', 'state', 'lit', 'kfl', 'dim', 'atc-reply', 'atc-talk'].forEach(c => { if (!want.includes(c)) k.classList.remove(c); }); want.forEach(c => k.classList.add(c)); /* the deck repaints keys every tick: re-apply */
    const txt = st.s === 'idle' ? ['ATC', 'TAP'] : st.s === 'contacting' ? ['STANDBY', 'ATC'] /* 24 NOV: his pick "standby" */ : [st.area, '']; /* 24 NOV: only the place (RAZ: "remove landing assigned word" / "just put the pad or whatever") */
    if (nt.textContent !== txt[0]) nt.textContent = txt[0]; const sub = txt[1] === 'LANDING ASSIGNED' ? 'LANDING<br>ASSIGNED' : txt[1]; if (ns.innerHTML !== sub) ns.innerHTML = sub; /* ASSIGNED under LANDING */
    };
    if (sig !== last && last !== '' && window.keyMorph) { last = sig; k._pend = true; keyMorph(k, () => { applyAll(); k._pend = false; }); return; } /* sand transition (24 NOV) */
    last = sig; applyAll();
  }
  document.addEventListener('pointerup', e => { const k = key(); if (k && k.contains(e.target) && state().s === 'idle') { tapAt = Date.now(); last = ''; paint(); } }, true);
  setInterval(paint, 150);
  window.__atcPaint = () => { last = ''; paint(); };
})();

/* GEAR UP = a status -> red (RAZ 24 NOV: "gear up is a status so it's red"). DOWN stays green, MOVING gunmetal. Re-applied every tick (the deck repaints). */
(function () {
  setInterval(() => {
    const g = [...document.querySelectorAll('.nb.k')].find(k => k.querySelector('.nt') && k.querySelector('.nt').textContent.trim() === 'GEAR'); if (!g) return;
    const w = g.querySelector('.stw'), up = !!w && w.textContent.trim() === 'UP';
    if (up) { g.classList.remove('kg', 'ka', 'gmov', 'gret'); ['state', 'kr', 'lit'].forEach(c => g.classList.add(c)); g.dataset.gup = '1'; }
    else if (g.dataset.gup === '1') { g.classList.remove('kr'); delete g.dataset.gup; }
  }, 150);
})();

/* FLIGHT READY goes dark once the ship's systems are on (RAZ 24 NOV: "show flight ready button extinguish dark after the system is on").
   Systems on = the game's power plants on (telemetry vehicle.state.power.powerplants, the same value the deck's POWER key uses). Off again = lit again. */
(function () {
  setInterval(() => {
    const k = [...document.querySelectorAll('.nb.k')].find(e => e.querySelector('.nt') && /FLIGHT\s*READY/.test(e.querySelector('.nt').textContent)); if (!k) return;
    const L = (typeof LIVE !== 'undefined') ? LIVE : null, on = !!(L && L.vehicle && L.vehicle.state && L.vehicle.state.power && L.vehicle.state.power.powerplants);
    k.classList.toggle('fr-off', on);
  }, 150);
})();

/* LIGHTS ON = the same solid RSI blue as the ATC reply (RAZ 24 NOV: "lights on changes to the same solid blue as hangar 3") */
(function () {
  setInterval(() => {
    const k = [...document.querySelectorAll('.nb.k')].find(e => e.querySelector('.nt') && e.querySelector('.nt').textContent.trim() === 'LIGHTS'); if (!k) return;
    const w = k.querySelector('.stw'); k.classList.toggle('blue-fill', !!w && w.textContent.trim() === 'ON');
  }, 150);
})();

/* FLAT TOP ROW (24 NOV, RAZ: "why can we not add 2 more flat bottons or three above the current round buttonds"): a row of flat keys
   (the left page-column look) in the empty band above the round keys, per page. COMBAT: the two that no longer fit in the round row.
   Design preview: shows and lights on tap; the key sending is wired with the deck's own key engine at install. */
(function () {
  const TOP = { FLIGHT: ['QUANTUM', 'CRUISE', '!HITS', 'DOCK', 'VTOL'], MINING: ['SCAN MODE', '!HITS', 'JETTISON CARGO'], COMBAT: ['MISSILE MODE', 'LAUNCH MISSILE', '!HITS', 'PREV PIN', 'NEXT PIN'], TURRET: ['PREV TURRET', 'NEXT TURRET', '!HITS', 'SPEED LIMITER', 'MOUSE MODE'] }; /* ESP = turret_esp_toggle (round row) */ /* HITS in the middle (RAZ 24 NOV) */ /* '!' = a live display, not a key */ /* 24 NOV: 4 equal keys (PREV / NEXT PIN = the game's cycle-pinned back / forward) */
  let row = null, shown = '';
  function mode() { const g = document.querySelector('.tab.left.on .gseg.on'); if (g) return g.textContent.trim(); /* grouped tab (COMBAT | TURRET, MINING | SALVAGE) */ const t = document.querySelector('.tab.left.on'); return t ? t.textContent.replace(/[^A-Z ]/g, '').trim() : ''; }
  const flatTick = () => {
    const area = document.getElementById('area'); if (!area) return;
    const m = mode(), keys = TOP[m] || [];
    if (m === shown && row && row.isConnected) return; shown = m;
    if (row) row.remove(); row = null; if (!keys.length) return;
    const real = k => !k.closest('.scanold,.oldlayer'); /* 25 NOV: never measure the page-change copies */ const round = [...document.querySelectorAll('#area .nb')].filter(k => { const r = k.getBoundingClientRect(); return real(k) && r.width > 0 && r.height > 90; }); /* every round key + the missile group */
    if (!round.length) { shown = ''; return; }
    const ar = area.getBoundingClientRect(), sc = ar.width / area.offsetWidth || 1;
    const xs = round.map(k => { const r = k.getBoundingClientRect(); return [(r.left - ar.left) / sc, (r.right - ar.left) / sc, (r.top - ar.top) / sc]; });
    const x0 = Math.min(...xs.map(a => a[0])), x1 = Math.max(...xs.map(a => a[1]));
    const ks0 = [...area.querySelectorAll('.nb.k')].filter(k => real(k) && k.getBoundingClientRect().width > 0 && k.getBoundingClientRect().height > 90), tops = ks0.map(k => Math.round(k.getBoundingClientRect().top)).sort((p, q) => p - q), mt = tops[0]; /* 25 NOV (RAZ: "quantum cruise all clear dock and vtol have moved below the gear through exit seat button"): the TOP round row, not the median (the median landed on the DECOUPLED row while a page change was still drawing) */
    const ks = ks0.filter(k => Math.abs(k.getBoundingClientRect().top - mt) < 30); /* the main round row only (not SHIP POWER at the bottom left) */
    const top = Math.min(...ks.map(k => (k.getBoundingClientRect().top - ar.top) / sc));  /* round keys' top (deck px) */
    /* span = the round keys left of the missile box (the box itself grows up to this row's top) */
    const mbox = [...area.querySelectorAll('.nb')].find(e => !e.classList.contains('k') && e.getBoundingClientRect().height > 150), bx = mbox ? mbox.getBoundingClientRect().left : Infinity;
    const bxr = mbox ? mbox.getBoundingClientRect().right : -Infinity; let left = ks.filter(k => { const r = k.getBoundingClientRect(); return r.right <= bx + 2 || r.left >= bxr - 2; }).filter(k => !(mbox && mbox.contains(k))); if (!left.length) left = ks; /* keys beside the box (either side) */
    const L0 = Math.min(...left.map(k => (k.getBoundingClientRect().left - ar.left) / sc)), L1 = Math.max(...left.map(k => (k.getBoundingClientRect().right - ar.left) / sc));
    row = document.createElement('div'); row.className = 'flatrow';
    row.style.cssText = `position:absolute;left:${L0}px;width:${L1 - L0}px;top:${top - 78}px;display:flex;gap:18px;z-index:20`;
    keys.forEach(n => { const b = document.createElement('div'); if (n[0] === '!') { b.className = 'flatk warnd'; b.dataset.warn = n.slice(1); b.textContent = 'ALL CLEAR'; } else { b.className = 'flatk'; b.dataset.mc = ''; b.textContent = n; b.onclick = () => { b.classList.add('on'); setTimeout(() => b.classList.remove('on'), 350); }; } row.appendChild(b); });
    area.appendChild(row);
    /* 24 NOV: the ARMED MISSILES box grows up so its top is even with the flat row's top (RAZ: "make the top of armed missiles even with the new button lines") */
    const lab = area.querySelector('.nt[data-lvl]');
    if (lab) { const lr = lab.getBoundingClientRect(), cx = lr.left + lr.width / 2;
      const box = [...area.children].find(e => { if (e === lab) return false; const r = e.getBoundingClientRect(); return e.classList.contains('nb') && !e.classList.contains('k') && r.left < cx && r.right > cx && r.height > 150; });
      const nt = top - 78, lt = parseFloat(lab.style.top);
      if (box && !box.dataset.grown) { const bt = parseFloat(box.style.top), bh = parseFloat(box.style.height); if (bt > nt) { box.style.top = nt + 'px'; box.style.height = (bh + (bt - nt)) + 'px'; box.dataset.grown = '1'; lab.style.top = (lt - (bt - nt)) + 'px'; } } }
  };
  setInterval(flatTick, 300);
  setInterval(() => { try { if (!row || !row.isConnected || document.querySelector('.scanold')) return; const area = document.getElementById('area'); if (!area) return; const ar = area.getBoundingClientRect(), sc = ar.width / area.offsetWidth || 1;
    const ks = [...area.querySelectorAll('.nb.k')].filter(k => !k.closest('.scanold,.oldlayer') && k.getBoundingClientRect().width > 0 && k.getBoundingClientRect().height > 90); if (!ks.length) return;
    const top = Math.min(...ks.map(k => (k.getBoundingClientRect().top - ar.top) / sc)); if (Math.abs(parseFloat(row.style.top) - (top - 78)) > 4) shown = ''; } catch (e) {} }, 200); /* 25 NOV: a row left in the wrong place by a page change is rebuilt within a second */ (window.__layoutHooks = window.__layoutHooks || []).push(() => { shown = ''; row = null; flatTick(); });
})();

/* ARMED + AVAILABLE missiles in the box header (RAZ 24 NOV: "show armed missile number and avaialbe missile on same space").
   The game telemetry has no missile count (weapons + countermeasures only), so both show "-" until chat 8 sources one (snap.missiles = {armed, available});
   previews may set window.__mslDemo. Never a made-up number in live use. */
(function () {
  setInterval(() => {
    const lab = document.querySelector('#area .nt[data-lvl]'); if (!lab || !/ARMED/.test(lab.dataset.lvl)) return;
    const LV = (typeof LIVE !== 'undefined') ? LIVE : null, M = window.__mslDemo || (LV && LV.missiles) || null;
    const a = M && M.armed != null ? M.armed : '–', v = M && M.available != null ? M.available : '–';
    const html = `<div class="mslcount"><span>ARMED <b>${a}</b></span><span>AVAILABLE <b>${v}</b></span></div>`; if (lab.innerHTML !== html) lab.innerHTML = html; /* replaces the 2-line ARMED MISSILES title in the same space */
    
  }, 300);
})();

/* HITS display (RAZ 24 NOV: "include the feedback button to hits etc"): the game's own warning lights, most urgent first:
   MISSILE (missile lock / launch) red flashing, HIT red, PROXIMITY amber; quiet = NO HITS dim. Previews may set window.__warnDemo = 'misl' | 'hit' | 'prox' | ''. */
(function () {
  const tail = v => String(v || '').split('_').pop().toUpperCase(), act = v => { const t = tail(v); return !!t && !['NOMINAL', 'OFF', 'UNSPECIFIED', 'FALSE'].includes(t); };
  setInterval(() => {
    /* 25 NOV RAZ: "the utility page doesn't have the alert notification all clear button of the flight page ... missile alerts etc and locks still need to show on every holo page be it the edge or onscreen":
       a page with no flat row (UTILITY, SALVAGE, FPS, TELEMETRY, MORE) gets the same ALL CLEAR display as a tab on the deck's top edge, centred */
    const dk = document.getElementById('deck'); let solo = document.getElementById('warnsolo'); const inRow = [...document.querySelectorAll('.flatrow:not(#warnsolo) .flatk.warnd')].some(e => e.offsetWidth && !e.closest('.scanold,.oldlayer'));
    const over = /moreopen|travelopen|cfgopen/.test(document.body.className), telem = /telemfloat/.test(document.body.className); /* 25 NOV RAZ: 'we don't need the all clear since we have that wide display box already' -> no ALL CLEAR over TELEMETRY */
    if (dk && !telem && (!inRow || over)) { if (!solo) { solo = document.createElement('div'); solo.id = 'warnsolo'; solo.className = 'flatrow'; solo.innerHTML = '<div class="flatk warnd">ALL CLEAR</div>'; dk.appendChild(solo); }
      const tf = document.getElementById('tfloat'), fps = !!document.querySelector('#area.offps-on'), mo = /moreopen/.test(document.body.className); /* a free band on each page: TELEMETRY = its top bar, FPS = above the panels, MORE = its header, others = the flat-row band */
      const [st, sh] = tf && /telemfloat/.test(document.body.className) ? [tf.offsetTop + 2, 30] : fps ? [12, 30] : mo ? [38, 42] : [44, 48];
      solo.style.cssText = `position:absolute;left:1150px;top:${st}px;width:260px;height:${sh}px;z-index:80;display:flex;visibility:visible!important;pointer-events:none`; } else if (solo) solo.style.display = 'none';
    const ds = [...document.querySelectorAll('.flatk.warnd')].filter(e => e.offsetWidth); if (!ds.length) return;
    const LV = (typeof LIVE !== 'undefined') ? LIVE : null, A = (LV && LV.vehicle && LV.vehicle.state && LV.vehicle.state.annunciators) || {};
    const demo = window.__warnDemo, m = demo != null ? demo === 'misl' : act(A.misl), h = demo != null ? demo === 'hit' : act(A.hit), p = demo != null ? demo === 'prox' : act(A.prox);
    /* quiet = the game's other warning lights (system faults), then the countermeasures left (RAZ 24 NOV: "it woudl be a waste for it to just say not hit") */
    const SYS = [['shld', 'SHIELDS'], ['pwr', 'POWER'], ['wpn', 'WEAPONS'], ['thr', 'THRUSTERS'], ['cool', 'COOLERS'], ['qdrv', 'QUANTUM'], ['radr', 'RADAR']];
    const major = v => /MAJOR/.test(String(v || '').toUpperCase()), f = demo != null ? null : SYS.find(([k]) => act(A[k]));
    const cm = (LV && LV.weapons && LV.weapons.countermeasures) || window.__cmDemo || [], cnt = ty => { const c = cm.find(x => String(x.type || '').toUpperCase().includes(ty)); return c ? c.amount : null; };
    const quiet = 'ALL CLEAR'; /* countermeasures moved under TURRET SPEED (stacked) */
    const [txt, cls] = m ? ['MISSILE', 'wr'] : h ? ['HIT', 'wr'] : p ? ['PROXIMITY', 'wa'] : f ? [f[1] + ' FAULT', major(A[f[0]]) ? 'wr' : 'wa'] : [quiet, ''];
    ds.forEach(d => { if (d.textContent !== txt) d.textContent = txt; d.classList.toggle('wr', cls === 'wr'); d.classList.toggle('wa', cls === 'wa'); d.classList.toggle('flash', m); });
  }, 200);
})();

/* level box side lights at the same height as the -/+ pills' side lights (RAZ 24 NOV: "the little lights in the turret speed and the lights inside the two pills are uneven") */
(function () {
  setInterval(() => {
    const box = [...document.querySelectorAll('#area .nb')].find(e => !e.classList.contains('k') && e.getBoundingClientRect().height > 150); if (!box) return;
    const br = box.getBoundingClientRect(), sc = br.height / box.offsetHeight || 1;
    const pill = [...document.querySelectorAll('#area .nb.k')].find(k => { const a = k.getBoundingClientRect(); return a.left >= br.left - 2 && a.right <= br.right + 2; }); if (!pill) return;
    const pl = pill.querySelector('.holo > i.lt'); if (!pl) return;
    const pr = pl.getBoundingClientRect(), mid = (pr.top + pr.height / 2 - br.top) / sc;
    box.querySelectorAll(':scope > .holo > i.lt, :scope > .holo > i.rt').forEach(i => { const h = i.offsetHeight, want = Math.round(mid - h / 2) + 'px'; if (i.style.top !== want) { i.style.setProperty('top', want, 'important'); i.style.setProperty('bottom', 'auto', 'important'); i.style.setProperty('transform', 'none', 'important'); } });
  }, 300);
})();

/* DECOY / NOISE stacked and centred under the TURRET SPEED title (RAZ 24 NOV) - the game's countermeasure counts */
(function () {
  setInterval(() => {
    const lab = document.querySelector('#area .nt[data-lvl="TURRET SPEED"]'); if (!lab) return;
    const LV = (typeof LIVE !== 'undefined') ? LIVE : null, cm = (LV && LV.weapons && LV.weapons.countermeasures) || window.__cmDemo || [];
    const cnt = ty => { const c = cm.find(x => String(x.type || '').toUpperCase().includes(ty)); return c && c.amount != null ? c.amount : '–'; };
    const html = `<div class="ttl">TURRET SPEED</div><div class="mslcount"><span>DECOY <b>${cnt('DECOY')}</b></span><span>NOISE <b>${cnt('NOISE')}</b></span></div>`;
    if (lab.innerHTML !== html) lab.innerHTML = html;
  }, 300);
})();

/* GYRO tap flips the deck's own ON / OFF (the game sends no gyro state) */
document.addEventListener('pointerup', e => { const k = e.target.closest && e.target.closest('.nb.k'); if (k && k.querySelector('.nt') && k.querySelector('.nt').textContent.trim() === 'GYRO') window.__gyroOn = !window.__gyroOn; }, true);

/* EDIT MODE (RAZ 24 NOV, choice 1): a small EDIT key switches the deck into edit mode. In edit mode nothing is sent to the game;
   LONG PRESS a key = next press type TAP -> HOLD -> TOGGLE -> DOUBLE TAP -> TAP (shown on the key at once, saved per page + key);
   short tap on a key = the edit window for that key. EDIT again = back to playing. */
(function () {
  const TYPES = ['TAP', 'HOLD', 'TOGGLE', 'DOUBLE TAP'], KEY = 'cmdglas-holo-press';
  let map = {}; try { map = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(map)); } catch (e) {} };
  const mode = () => { const g = document.querySelector('.tab.left.on .gseg.on'); if (g) return g.textContent.trim(); /* grouped tab (COMBAT | TURRET, MINING | SALVAGE) */ const t = document.querySelector('.tab.left.on'); return t ? t.textContent.replace(/[^A-Z ]/g, '').trim() : ''; };
  const name = k => { const n = k.querySelector('.nt'); return n ? n.textContent.trim() : (k.textContent || '').trim(); };
  const id = k => mode() + '|' + name(k);
  let editing = false, btn = null, pop = null;
  function keys() { return [...document.querySelectorAll('#area .nb.k, #area .flatk:not(.warnd)')].filter(k => k.getBoundingClientRect().width > 0); }
  function paint() {
    keys().forEach(k => {
      const t = map[id(k)]; if (!t) return;
      const ns = k.querySelector('.ns'); if (ns && !k.querySelector('.stw') && ns.textContent !== t) ns.textContent = t;
    });
    keys().forEach(k => { let b = k.querySelector(':scope > .ptype'); if (editing) { if (!b) { b = document.createElement('div'); b.className = 'ptype'; k.appendChild(b); } const t = map[id(k)] || ((k.querySelector('.ns') || {}).textContent || 'TAP').trim(); if (b.textContent !== t) b.textContent = t; } else if (b) b.remove(); });
  }
  function place() {
    const area = document.getElementById('area'); if (!area) return;
    if (!btn || !btn.isConnected) { btn = document.createElement('div'); btn.className = 'editk'; btn.innerHTML = '<span>⚙</span> EDIT'; area.appendChild(btn);
      btn.addEventListener('pointerup', e => { e.stopPropagation(); editing = !editing; document.getElementById('deck').classList.toggle('editing', editing); btn.classList.toggle('on', editing); btn.lastChild.textContent = editing ? ' DONE' : ' EDIT'; if (!editing && pop) pop.remove(); paint(); }, true); }
    const ej = [...document.querySelectorAll('.dz')].find(d => /EJECT/.test(d.textContent));
    if (ej) { const ar = area.getBoundingClientRect(), sc = ar.width / area.offsetWidth || 1, r = ej.getBoundingClientRect(); const want = `left:${(r.left - ar.left) / sc + (r.width / sc - 150) / 2}px;top:${(r.top - ar.top) / sc - 74}px`; if (btn.dataset.pos !== want) { btn.dataset.pos = want; btn.style.cssText = 'position:absolute;' + want + ';z-index:30'; } }
  }
  let t0 = 0, tk = null, timer = null, fired = false;
  addEventListener('pointerdown', e => { if (!editing) return; const k = e.target.closest && e.target.closest('#area .nb.k, #area .flatk:not(.warnd)'); if (!k) return; e.stopImmediatePropagation(); e.preventDefault(); tk = k; fired = false;
    timer = setTimeout(() => { fired = true; const cur = map[id(k)] || ((k.querySelector('.ns') || {}).textContent || 'TAP').trim(); const nx = TYPES[(TYPES.indexOf(cur) + 1) % TYPES.length]; map[id(k)] = nx; save(); paint(); k.animate([{ filter: 'brightness(2)' }, { filter: 'none' }], 400); }, 600); }, true);
  addEventListener('pointerup', e => { if (!editing || !tk) return; e.stopImmediatePropagation(); clearTimeout(timer); const k = tk; tk = null; if (fired) return;
    if (pop) pop.remove(); pop = document.createElement('div'); pop.className = 'editpop';
    pop.innerHTML = `<b>${name(k)}</b><div>PRESS TYPE: ${map[id(k)] || ((k.querySelector('.ns') || {}).textContent || 'TAP').trim()}</div><div class="h">Long press the key to change it. Key bind, label and color are set here in the full deck.</div><div class="x">CLOSE</div>`;
    document.getElementById('area').appendChild(pop); pop.querySelector('.x').addEventListener('pointerup', ev => { ev.stopPropagation(); pop.remove(); }, true); }, true);
  ['click', 'pointercancel'].forEach(ev => addEventListener(ev, e => { if (editing && e.target.closest && e.target.closest('#area .nb.k, #area .flatk')) { e.stopImmediatePropagation(); e.preventDefault(); } }, true));
  setInterval(() => { place(); paint(); }, 300);
})();

/* FPS PAGE = EQUIPMENT PANEL in the centre (RAZ 24 NOV: "one section in the center that holds those inventory pages just like they are in game and it gives
   the gamer the option to switch between utility and weapon or equipment page"). Same layout as the game's EQUIPMENT panel (his screenshots 24 NOV):
   WEAPONS tab = HAND, 1 PRIMARY, 2 SECONDARY, 3 SIDEARM (each with optic / barrel / underbarrel squares); TOOLS tab = HAND, 4 UTILITY, KNIFE, GADGET.
   Our own drawn holo icons (no game art: fan-kit rule). The other FPS keys move into two blocks left and right of the panel. Tap a slot = equip it. */
(function () {
  const F = '#9fd2ff';
  const ICON = {
    hand: '<path d="M42 30c-4-6-9-11-12-15-2-3 1-6 4-4l6 6V6c0-3 4-3 4 0v12V4c0-3 4-3 4 0v14V6c0-3 4-3 4 0v13V9c0-3 4-3 4 0v16c0 9-5 14-12 14h-2c-3 0-5-1-6-3z"/>',
    rifle: '<path d="M4 17h20l3-4h46l5 2h27v2h6v4h-6v2H79l-3 3h-9l-4 11h-9l3-11H48l-7 5H26l3-7h-9l-3 4H4z"/><path d="M62 9h14v4H62z"/>',
    smg: '<path d="M14 17h18l3-4h34l4 2h16v6h-8v2H70l-3 3h-8l-3 10h-8l3-10H44l-5 4H28l2-6h-8l-2 3h-6z"/><path d="M60 9h10v4H60z"/>',
    pistol: '<path d="M36 13h40l3 3v5H62l-2 3h-6l-6 14h-10l5-13-7-1z"/><path d="M50 9h8v4h-8z"/>',
    util: '<path d="M34 13h34l3 3v5H58l-2 3h-6l-6 13h-9l4-12-6-1z"/><path d="M16 22h12v14H16z"/><path d="M80 26v10M75 31h10" stroke="' + F + '" stroke-width="2.5" fill="none"/>',
    knife: '<path d="M18 24c10-6 24-7 36-6h4v6H40c-8 0-15 1-22 0z"/><path d="M58 15h5v14h-5zM63 19h24c2 0 3 2 3 3s-1 3-3 3H63z"/>',
    gadget: '<rect x="34" y="10" width="52" height="24" rx="6" fill="none" stroke="' + F + '" stroke-width="2.5"/><path d="M28 14v16M92 14v16" stroke="' + F + '" stroke-width="2.5"/><path d="M52 28l6-10 6 4 6-6" stroke="' + F + '" stroke-width="2.5" fill="none"/>',
    optic: '<rect x="10" y="12" width="30" height="10" rx="5"/><path d="M20 22v6h10v-6M6 14h4v6H6zM40 14h5v6h-5z"/>',
    barrel: '<path d="M6 14h10v-3h8v3h22v6H24v3h-8v-3H6z"/>',
    module: '<path d="M22 4h8v8h5l-9 8-9-8h5z"/><path d="M10 22h24l4 3h4v5h-4l-4 3H18l-3 6h-6l3-6h-2z"/>',
    canister: '<rect x="22" y="6" width="10" height="28" rx="3"/><rect x="23.5" y="2" width="7" height="5" rx="1"/>',
    mag: '<path d="M14 8h22l4 4v16l-4 4H14l-3-4V12z"/><path d="M18 14h14M18 20h14" stroke="#06192a" stroke-width="2"/>',
    bottle: '<path d="M23 3h8v5l4 5v19c0 2-1 3-3 3H22c-2 0-3-1-3-3V13l4-5z"/>',
    under: '<path d="M8 12h30v6H22l-2 3h-4l-2 8H8z"/><path d="M34 22l5 6M39 28h-5" stroke="' + F + '" stroke-width="2.5" fill="none"/>'
  };
  const IMG = ['hand', 'rifle', 'smg', 'pistol', 'optic', 'barrel', 'under', 'knife', 'gadget']; /* 24 NOV: the game's own slot symbols, cut from his screenshots (personal Holo only; never in sale files - fan-kit rule) */
  const svg = (k, w = 120, h = 40) => IMG.includes(k) ? `<img class="eqimg" src="fps-icons/${k}.png" alt="">` : `<svg viewBox="0 0 ${w} ${h}" fill="${F}">${ICON[k]}</svg>`;
  const TABS = {
    weapons: [['hand', '', 'DROP'], ['rifle', '1', 'PRIMARY', 1], ['smg', '2', 'SECONDARY', 1], ['pistol', '3', 'SIDEARM', 1]],
    tools: [['hand', '', 'DROP'], ['util', '4', 'UTILITY', 2], ['knife', '', 'KNIFE'], ['gadget', '', 'GADGET']]
  };
  /* INVENTORY tab (RAZ 24 NOV: "also note the other attachments in the top part"): the backpack grid above the game's EQUIPMENT panel - attachments, modules,
     med gun, refills, magazines, food / drink, with their counts. Sample items until a data source exists (the game data has no inventory). */
  const INV = [['module', '', 'MINING'], ['module', '', 'TRACTOR'], ['module', '', 'MEDICAL'], ['util', '', 'MED GUN'], ['canister', '2x', 'REFILL'], ['mag', '36x', 'MAGAZINE'],
    ['bottle', '12x', 'DRINK'], ['optic', '1', 'OPTIC'], ['barrel', '1', 'BARREL'], ['under', '1', 'UNDERBARREL']];
  /* quick action buttons under the tabs (RAZ 24 NOV: "add those buttons i asked for under the utility symbol for helmet off etc"): same symbols as the deck keys.
     HELMET and WEAPON swap on each tap (ON / OFF, LOWER / RAISE); the others are one-shot. */
  const AI = { /* 24 NOV v4: SOLID symbols like the game's weapon / tab icons beside them (RAZ: "they must match the weapons and everything ... and the weapon and utility symbol"); shapes from the approved Command Deck set */
    holster: '<text x="32" y="28" text-anchor="middle" font-family="Oxanium" font-weight="800" font-size="13" letter-spacing="1" fill="#d6ebff">HOLSTER</text><text x="32" y="44" text-anchor="middle" font-family="Oxanium" font-weight="800" font-size="13" letter-spacing="1" fill="#d6ebff">WEAPON</text>',
    holstered: '<text x="32" y="37" text-anchor="middle" font-family="Oxanium" font-weight="800" font-size="11" textLength="54" lengthAdjust="spacingAndGlyphs" fill="#ffffff">HOLSTERED</text>',
    firemode: '<path d="M27 20l5-9 5 9v30H27z" fill="#d6ebff"/><path d="M27 43h10" fill="none" stroke="#071a2c" stroke-width="2.6" stroke-linecap="round"/>',
    firemode2: '<path d="M19 20l5-9 5 9v30H19z M35 20l5-9 5 9v30H35z" fill="#d6ebff"/><path d="M19 43h10 M35 43h10" fill="none" stroke="#071a2c" stroke-width="2.6" stroke-linecap="round"/>',
    firemode3: '<path d="M11 20l5-9 5 9v30H11z M27 20l5-9 5 9v30H27z M43 20l5-9 5 9v30H43z" fill="#d6ebff"/><path d="M11 43h10 M27 43h10 M43 43h10" fill="none" stroke="#071a2c" stroke-width="2.6" stroke-linecap="round"/>',
    helmet: '<path d="M10 40C10 16 24 8 32 8s22 8 22 32l-4 10-10 6H24l-10-6z M15 30c1-10 9-15 17-15s16 5 17 15c0 6-5 9-17 9s-17-3-17-9z" fill="#d6ebff" fill-rule="evenodd"/><path d="M20 27c1-5 6-8 11-8" fill="none" stroke="#d6ebff" stroke-width="2" stroke-linecap="round" opacity=".65"/><path d="M26 47h12M28 51h8" fill="none" stroke="#071a2c" stroke-width="2.4" stroke-linecap="round"/>',
    helmetoff: '<g opacity=".45"><path d="M10 40C10 16 24 8 32 8s22 8 22 32l-4 10-10 6H24l-10-6z M15 30c1-10 9-15 17-15s16 5 17 15c0 6-5 9-17 9s-17-3-17-9z" fill="#d6ebff" fill-rule="evenodd"/><path d="M20 27c1-5 6-8 11-8" fill="none" stroke="#d6ebff" stroke-width="2" stroke-linecap="round" opacity=".65"/><path d="M26 47h12M28 51h8" fill="none" stroke="#071a2c" stroke-width="2.4" stroke-linecap="round"/></g><path d="M8 8l48 48" fill="none" stroke="#d6ebff" stroke-width="4.5" stroke-linecap="round"/>',
    repool: '<path d="M11 20l5-9 5 9v30H11z M27 20l5-9 5 9v30H27z M43 20l5-9 5 9v30H43z" fill="#d6ebff" fill-rule="evenodd"/><path d="M11 43h10 M27 43h10 M43 43h10" fill="none" stroke="#071a2c" stroke-width="2.6" stroke-linecap="round"/>',
    fist: '<path d="M15 27V15h8v12-17h8v17-16h8v16-10h8v23L35 53H23L11 40v-9z" fill="#d6ebff" fill-rule="evenodd"/><path d="M23 15v10 M31 11v14 M39 13v11" fill="none" stroke="#071a2c" stroke-width="2.6" stroke-linecap="round"/>',
    reload: '<path d="M47.6 23A18 18 0 1 0 48.9 38.2" fill="none" stroke="#d6ebff" stroke-width="4.5" stroke-linecap="round"/><path d="M49.5 28l-6.5 10.5h12z" fill="#d6ebff"/><image href="fps-icons/mag.png" x="19" y="19" width="26" height="26"/>',
    lower: '<image href="fps-icons/pistol.png" x="2" y="12" width="44" height="33"/><path d="M52 40v14M46 48l6 6 6-6" fill="none" stroke="#d6ebff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
    raise: '<image href="fps-icons/pistol.png" x="2" y="12" width="44" height="33"/><path d="M52 54V40M46 46l6-6 6 6" fill="none" stroke="#d6ebff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'
  };
  const ACTS = [['helmet', 'helmet', 'HELMET ON'], ['weapon', 'raise', 'RAISED'], ['reload', 'reload', 'RELOAD'], ['repool', 'repool', 'REPOOL'], ['fist', 'fist', 'FISTS'], ['holster', 'holster', ''], ['firemode', 'firemode2', 'FIRE MODE']] /* 24 NOV: plain switch - the game sends no fire mode, so no state is shown (RAZ: "if not just make dumb switch") */; /* 24 NOV: two more (RAZ: "we have room for two more buttons") */
  const SW = { helmet: [['helmet', 'HELMET ON'], ['helmetoff', 'HELMET OFF']], weapon: [['raise', 'RAISED'], ['lower', 'LOWERED']], holster: [['holster', ''], ['holstered', '']] } /* FIRE MODE: the same rounds as REPOOL - 1 / 2 / 3 standing = single / burst / auto (RAZ 24 NOV) */ /* 24 NOV: shows the current position (RAZ: "it should show as lowered or raised whichever position is reported") */, SWS = { helmet: 0, weapon: 0, firemode: 0, holster: 0 }; /* HOLSTER = words only (RAZ 24 NOV: "just use the word holster weapon and when holstered show holstered") */
  /* only the weapon in hand is lit, the rest dimmed (RAZ 24 NOV: "when fists aren't selected or whatever weapon isn't pulled stays dimmed out only the weapon the user selects or is picked up by telemetry is lit up").
     The game sends no FPS data yet, so the last slot tapped here is the one in hand; FISTS counts as a slot. The hand slot is now DROP (one-shot). */
  let SEL = 'FISTS';
  /* DROP fires only on a DOUBLE TAP or a LONG PRESS (RAZ 24 NOV: "double tap or long press"), so a stray touch never drops a weapon */
  function dropFire(s) { s.classList.add('on'); s.querySelector('.eql').textContent = 'DROPPED'; setTimeout(() => { s.classList.remove('on'); s.querySelector('.eql').textContent = 'DROP'; }, 700); }
  function hint(s) { const l = s.querySelector('.eql'); l.textContent = 'DOUBLE TAP OR HOLD TO DROP'; clearTimeout(s._ht); s._ht = setTimeout(() => { l.textContent = 'DROP'; }, 1400); }
  addEventListener('pointerdown', e => { const s = e.target.closest && e.target.closest('.eqslot[data-slot=DROP]'); if (!s) return; clearTimeout(s._lp); s._lp = setTimeout(() => { s._lt = 0; s._held = true; dropFire(s); }, 650); });
  addEventListener('pointerup', e => { document.querySelectorAll('.eqslot[data-slot=DROP]').forEach(s => { clearTimeout(s._lp); if (s._held) { s._held = false; s._lt = -1e9; } }); }, true);
  function mark() { if (!panel) return; panel.querySelectorAll('.eqslot').forEach(x => { const d = x.dataset.slot; if (d === 'DROP') return; x.classList.toggle('on', d === SEL); x.classList.toggle('dimq', d !== SEL); const row = x.parentElement; row.querySelectorAll('.eqa').forEach(a => a.classList.toggle('dimq', d !== SEL)); });
    const f = panel.querySelector('.eqb[data-act=fist]'); if (f) { f.classList.toggle('sel', SEL === 'FISTS'); f.classList.toggle('dimq', SEL !== 'FISTS'); } }
  function setSw(id, v) { if (!panel || !SW[id]) return; SWS[id] = v; const bt = panel.querySelector('.eqb[data-act=' + id + ']'); if (!bt) return; const [ic, lab] = SW[id][v]; bt.querySelector('svg').innerHTML = AI[ic]; bt.querySelector('span').textContent = lab; }
  let tab = 'weapons', panel = null;
  const mode = () => { const g = document.querySelector('.tab.left.on .gseg.on'); if (g) return g.textContent.trim(); /* grouped tab (COMBAT | TURRET, MINING | SALVAGE) */ const t = document.querySelector('.tab.left.on'); return t ? t.textContent.replace(/[^A-Z ]/g, '').trim() : ''; };
  function rows() {
    if (tab === 'inv') return `<div class="invgrid">${INV.map(([ic, n, lab]) => `<div class="invc">${svg(ic, ['optic','barrel','under','module','canister','mag','bottle'].includes(ic) ? 50 : 120, ['optic','barrel','under','module'].includes(ic) ? 34 : 40)}${n ? `<span class="invn">${n}</span>` : ''}<span class="eql">${lab}</span></div>`).join('')}</div>`;
    return TABS[tab].map(([ic, n, lab, att]) => `<div class="eqrow${att ? ' att' : ''}"><div class="eqslot" data-slot="${lab}">${svg(ic)}<span class="eql">${lab}</span>${n ? `<span class="eqn">${n}</span>` : ''}</div>` +
      (att === 2 ? `<div class="eqa eqmod">${svg('module', 50, 34)}</div>` : att ? `<div class="eqa">${svg('optic', 50, 34)}</div><div class="eqa">${svg('barrel', 50, 34)}</div><div class="eqa">${svg('under', 50, 34)}</div>` : '') + '</div>').join('');
  }
  function paint() { setTimeout(mark, 0); panel.querySelector('.eqtt').textContent = tab === 'inv' ? 'INVENTORY' : 'EQUIPMENT'; panel.querySelector('.eqbody').innerHTML = rows(); panel.querySelectorAll('.eqt').forEach(t => t.classList.toggle('on', t.dataset.t === tab)); }
  function build(area) {
    panel = document.createElement('div'); panel.className = 'eqpanel'; panel.dataset.mc = '';
    panel.style.cssText = 'position:absolute;left:877px;top:14px;width:630px;height:612px;z-index:25;transform:scale(1.13);transform-origin:0 0';
    panel.innerHTML = `<div class="eqtabs"><div class="eqt" data-t="weapons"><img class="eqimg" src="fps-icons/tabweapon.png" alt=""></div><div class="eqt" data-t="tools"><img class="eqimg" src="fps-icons/tabtools.png" alt=""></div></div>` +
      `<div class="eqacts">${ACTS.map(([id, ic, lab]) => `<div class="eqb" data-act="${id}" title="${lab}"><svg viewBox="0 0 64 64" class="eqbi">${AI[ic]}</svg><span>${lab}</span></div>`).join('')}</div>` +
      `<div class="eqside">${[['MOBIGLAS', /^MOBIGLAS/], ['RESPAWN', /^RESPAWN/], ['DROP ITEM', /^DROPITEM/]].map(([l]) => `<div class="eqb eqsk" data-side="${l}"><span>${l.replace(' ', '<br>')}</span></div>`).join('')}</div>` + `<div class="eqhead"><i></i><b class="eqtt">EQUIPMENT</b><i></i></div><div class="eqbody"></div>`;
    area.appendChild(panel);
    const realKey = l => [...document.querySelectorAll('#area .nb, #area .dz, #chrome .nb, #chrome .dz')].find(e => e.dataset.fpsHid && (e.textContent || '').replace(/\s+/g, '').startsWith(l.replace(' ', '')));
    panel.querySelectorAll('.eqsk').forEach(b => ['pointerdown', 'pointerup', 'pointercancel', 'pointerleave'].forEach(ev => b.addEventListener(ev, e => { e.stopPropagation(); const k = realKey(b.dataset.side); if (k) k.dispatchEvent(new PointerEvent(ev === 'pointerleave' ? 'pointercancel' : ev, { bubbles: true, pointerId: e.pointerId, isPrimary: true })); b.classList.toggle('on', ev === 'pointerdown'); })));
    panel.addEventListener('pointerup', e => { const bt = e.target.closest('.eqb'); if (bt) { const id = bt.dataset.act; if (id === 'fist') { SEL = 'FISTS'; mark(); return; } if (SW[id]) { SWS[id] = (SWS[id] + 1) % SW[id].length; if (id === 'holster' && SWS[id] === 1) { SEL = 'FISTS'; mark(); } const [ic, lab] = SW[id][SWS[id]]; bt.querySelector('svg').innerHTML = AI[ic]; bt.querySelector('span').textContent = lab; }
      bt.classList.add('on'); setTimeout(() => bt.classList.remove('on'), 300); bt.animate([{ opacity: .3, filter: 'blur(2px)' }, { opacity: 1, filter: 'blur(0)' }], 380); return; }
      const t = e.target.closest('.eqt'); if (t) { tab = t.dataset.t; paint(); return; } const s = e.target.closest('.eqslot'); if (s) { if (s.dataset.slot === 'DROP') { const now = Date.now(); if (now - (s._lt || 0) < 380) { dropFire(s); s._lt = 0; } else { s._lt = now; hint(s); } return; } SEL = s.dataset.slot; mark(); setSw('holster', 0); setSw('weapon', 0); } });
    paint();
  }
  /* move the left page column toward the panel on FPS, back home on every other page */
  function shiftLeftColumn(on) {
    const els = [...document.querySelectorAll('#chrome > *, #deck .editk')].filter(e => e.offsetWidth && (e.dataset.homeL || e.getBoundingClientRect().left < (document.getElementById('deck').getBoundingClientRect().left + document.getElementById('deck').getBoundingClientRect().width * .16)));
    els.forEach(e => { if (!e.dataset.homeL) e.dataset.homeL = e.style.left || getComputedStyle(e).left; const h = parseFloat(e.dataset.homeL) || 0, tw = (document.querySelector('.tab.left') || {}).offsetWidth || 220, dx = 905 - (77 + tw); const want = e.dataset.homeL; if (e.style.left !== want) e.style.left = want; e.style.visibility = on && !e.matches('.tab.left, .menuhandle') ? 'hidden' : ''; }); /* 25 NOV: the folded page key + its page list stay on FPS (the only way back) */ /* 24 NOV RAZ: "make that entire left side disappear when in fps mode" */
    /* v2: the page tabs spread over the same height as the pills (84 - 690), equal steps */
    [...document.querySelectorAll('.tab.left')].forEach((e, i, all) => { if (!e.dataset.homeT) e.dataset.homeT = e.style.top || getComputedStyle(e).top; const step = (606 - e.offsetHeight) / Math.max(1, all.length - 1);
      const want = e.dataset.homeT; if (e.style.top !== want) e.style.top = want; });
  }
  window.__shiftLeftColumn = shiftLeftColumn;
  function arrange(area) {
    const IN = /^(PRIMARY|SECONDARY|SIDEARM.*|UTILITYTOOL)$/; /* FPS key names below may now be FISTS / LOWER WEAPON */
    const ar = area.getBoundingClientRect(), sc = ar.width / area.offsetWidth || 1;
    const main = [...area.querySelectorAll('.nb.k')].filter(k => { const r = k.getBoundingClientRect(), x = (r.left - ar.left) / sc; return r.width > 0 && x > 300 && x < 1950; });
    const keep = [], W = 172, H = 104, Y = [44, 164, 284, 404, 524], XL = [560, 750], XR = [1590, 1780];
    main.forEach(k => { k.style.display = 'none'; });
    /* MOBIGLAS / RESPAWN (right) and DROP ITEM (left) re-form beside the panel (RAZ 24 NOV: "the buttons on left and right disappear in a flurry and reappear next to the center piece") */
    const byText = re => [...document.querySelectorAll('#area .nb, #area .dz, #chrome .tab, #chrome .nb, #chrome .dz')].find(e => re.test((e.textContent || '').replace(/\s+/g, '')));
    const put = (e, x, y) => { if (!e) return; e.style.left = x + 'px'; e.style.top = y + 'px'; e.style.right = 'auto'; };
    /* 24 NOV v2 (RAZ: "the bars on the far left need to come toward the main box and drop item needs to move to the left side with mobiglas toggle respawn"):
       MOBIGLAS / RESPAWN / DROP ITEM in one column just left of the panel, the page column moved in next to them. */
    const side = [byText(/^MOBIGLAS/), byText(/^RESPAWN/), byText(/^DROPITEM/)].filter(Boolean);
    side.forEach(e => { e.style.visibility = 'hidden'; e.dataset.fpsHid = '1'; }); /* 24 NOV RAZ: "reduce the size of the respawn drop item and mobiglas button to the same size as the little buttons" - small copies sit in the panel (eqside), taps go to the real keys */ /* v2: same top / bottom as the pills (84 - 690), same width + gap as the page column on the left */ /* 24 NOV symmetric: panel centred, side keys right, page column left, equal gaps */
    shiftLeftColumn(true);
    return;
    return; /* whole FPS page = the EQUIPMENT panel; MOBIGLAS / RESPAWN / DROP ITEM keep their places */
    const slots = []; [XL, XR].forEach(xs => Y.forEach(y => xs.forEach(x => slots.push([x, y]))));
    keep.slice(0, slots.length).forEach((k, i) => { const [x, y] = slots[i]; Object.assign(k.style, { left: x + 'px', top: y + 'px', width: W + 'px', height: H + 'px', borderRadius: '34px' }); k.classList.add('fpsk'); });
  }
  const fpsTick = () => {
    const area = document.getElementById('area'); if (!area) return;
    if (mode() !== 'FPS') { if (panel && panel.isConnected) panel.remove(); panel = null; shiftLeftColumn(false); document.querySelectorAll('[data-fps-hid]').forEach(e => { e.style.visibility = ''; delete e.dataset.fpsHid; }); return; }
    if (panel && panel.isConnected) return;
    if (!area.querySelectorAll('.nb.k').length) return;
    arrange(area); build(area);
  };
  setInterval(fpsTick, 300); (window.__layoutHooks = window.__layoutHooks || []).push(() => { panel = null; fpsTick(); });
})();

/* SWAPPING KEYS (RAZ 24 NOV: "lower raise weapon should replace each other not show both", "helmet on off"; "we are no longer limited by stream deck limits").
   ONE key per pair: it shows what the next tap does and swaps after each tap (name + symbol, with the deck's blur-in). The game sends no FPS state,
   so the deck tracks it itself; EDIT mode or one extra tap puts it right if it ever drifts. */
(function () {
  const PAIRS = {
    'LOWERWEAPON': { a: ['WEAPON', 'raise', 'RAISED'], b: ['WEAPON', 'lower', 'LOWERED'], key: 'wpnLow' },
    'HELMET': { a: ['HELMET', 'helmet', 'ON'], b: ['HELMET', 'helmetoff', 'OFF'], key: 'helmOff' }
  };
  const ST = { wpnLow: false, helmOff: false };
  const find = (k) => [...document.querySelectorAll('#area .nb.k')].find(e => e.dataset.pair === k);
  function tag() { document.querySelectorAll('#area .nb.k').forEach(k => { if (k.dataset.pair) return; const n = ((k.querySelector('.nt') || {}).textContent || '').replace(/\s+/g, '').trim(); if (PAIRS[n]) k.dataset.pair = n; }); }
  function apply(k, anim) {
    if (anim && window.keyMorph) { k._pend = true; keyMorph(k, () => { k._pend = false; apply(k, false); }); return; }
    if (k._pend) return;
    const P = PAIRS[k.dataset.pair]; if (!P) return; const on = ST[P.key], v = on ? P.b : P.a; /* 25 NOV: guard - only the FPS swap keys */
    const nt = k.querySelector('.nt'), ns = k.querySelector('.ns'), ic = k.querySelector('svg.ni');
    if (nt && nt.textContent !== v[0]) nt.textContent = v[0];
    if (ns) { const w = v[2] || 'TAP'; if (ns.textContent !== w) ns.textContent = w; }
    if (ic && ic.dataset.icon !== v[1] && typeof I !== 'undefined' && I[v[1]]) { ic.innerHTML = I[v[1]]; ic.dataset.icon = v[1]; }
  }
  document.addEventListener('pointerup', e => { const de = document.getElementById('deck'); if (de && de.classList.contains('editing')) return;
    const k = e.target.closest && e.target.closest('#area .nb.k[data-pair]'); if (!k) return; const P = PAIRS[k.dataset.pair]; if (!P) return; ST[P.key] = !ST[P.key]; apply(k, true); }, false);
  setInterval(() => { tag(); document.querySelectorAll('#area .nb.k[data-pair]').forEach(k => apply(k, false)); }, 150);
})();

/* FPS VITALS strip (RAZ 24 NOV: "check data for every fps telemetry we get. get rid of the huge drop button and replace with vitals etc, status info from telemetry for fps gameplay").
   Everything the game's telemetry sends for on foot (bridge snap.actor): health, oxygen, hunger, thirst, body temperature, heart rate,
   gravity, suit pressure, intoxication; outside temperature, radiation, breathable air; on foot / EVA / seated. Status colors only:
   green = fine, amber = watch it, red = act now. No data = dim dash. */
(function () {
  let SNAP = null;
  const fromDeck = () => (typeof LIVE !== 'undefined' && LIVE && LIVE.actor) ? LIVE : null; /* deck LIVE without actor data (demo / ship only) -> read the bridge */
  async function poll() { if (fromDeck()) return; try { SNAP = await (await fetch('data:application/json,null' /* SHOP COPY: never reads the owner's local bridge */, { cache: 'no-store' })).json(); } catch (e) { SNAP = null; } }
  setInterval(poll, 1000); poll();
  const pct = g => g && g.max ? Math.round(100 * g.current / g.max) : null;
  const lvl = (v, a, r, low = true) => v == null ? '' : low ? (v <= r ? 'vr' : v <= a ? 'va' : 'vg') : (v >= r ? 'vr' : v >= a ? 'va' : 'vg');
  function tiles(L) {
    const A = L && L.actor, V = A && A.vitals || {}, E = A && A.environment || {}, S = A && A.state || {};
    const hp = pct(V.health), o2 = pct(V.oxygen), food = pct(V.hunger), water = pct(V.thirst), bt = V.body_temperature && V.body_temperature.current;
    const hr = V.heart_rate, ext = E.external_temperature, rad = E.ambient_radiation_rate, air = E.breathable_atmosphere, g = V.gravity, pr = V.pressure, drunk = V.intoxication_level;
    const f = (v, d = 0, u = '') => v == null ? '–' : (+v).toFixed(d) + u;
    return [
      ['HEALTH', f(hp, 0, '%'), lvl(hp, 50, 25), hp],
      ['OXYGEN', f(o2, 0, '%'), lvl(o2, 30, 15), o2],
      ['FOOD', f(food, 0, '%'), lvl(food, 30, 10), food],
      ['WATER', f(water, 0, '%'), lvl(water, 30, 10), water],
      ['BODY', f(bt, 1, '°'), bt == null ? '' : (bt < 35 || bt > 38.5) ? (bt < 33 || bt > 40 ? 'vr' : 'va') : 'vg'],
      ['HEART', f(hr, 0, ' BPM'), lvl(hr, 120, 160, false)],
      ['OUTSIDE', f(ext, 0, '°'), ext == null ? '' : (ext < -20 || ext > 50) ? 'va' : 'vg'],
      ['RADIATION', rad == null ? '–' : rad > 0 ? f(rad, 1) : 'NONE', rad == null ? '' : rad > 0.5 ? 'vr' : rad > 0 ? 'va' : 'vg'],
      ['AIR', air == null ? '–' : air ? 'GOOD' : 'NO AIR', air == null ? '' : air ? 'vg' : 'va'],
      ['GRAVITY', f(g, 2, ' G'), ''],
      [S.locomotion === 'EVA' ? 'EVA' : S.locomotion === 'SEATED' ? 'SEATED' : 'ON FOOT', drunk ? 'DRUNK ' + drunk : (pr == null ? '–' : 'SUIT ' + f(pr, 1)), drunk ? 'va' : '']
    ];
  }
  setInterval(() => {
    document.querySelectorAll('.eqslot[data-slot=DROP]').forEach(s => {
      const row = s.parentElement; if (!row.classList.contains('vitrow')) { row.classList.add('vitrow'); row.innerHTML = '<div class="vit"></div>'; }
    });
    const L = fromDeck() || SNAP, html = window.__vitalsHTML ? window.__vitalsHTML(L) : tiles(L).map(([k, v, c, bar]) => `<div class="vt ${c}"><span class="vk">${k}</span><b>${v}</b>${bar != null ? `<i style="--p:${Math.max(0, Math.min(100, bar))}%"></i>` : ''}</div>`).join('');
    document.querySelectorAll('.vit').forEach(d => { if (d.innerHTML !== html) d.innerHTML = html; });
  }, 500);
})();

/* VITALS v2 - graphics (RAZ 24 NOV: "we can use attractive graphics, that looks too simple"): HEALTH + OXYGEN as glowing ring gauges, FOOD + WATER as
   liquid tanks, HEART as a live pulse trace beating at the real rate, BODY as a thermometer, surroundings as four symbol chips (outside temperature,
   radiation, air, gravity). Same telemetry as v1; status colors only (green fine, amber watch, red act). Replaces the v1 tile grid. */
(function () {
  const COL = { vg: '#14ff63', va: '#ffae00', vr: '#a00d22', '': '#3dabff' };
  const pct = g => g && g.max ? Math.max(0, Math.min(100, 100 * g.current / g.max)) : null;
  const lv = (v, a, r) => v == null ? '' : v <= r ? 'vr' : v <= a ? 'va' : 'vg';
  function ring(label, v, c) {
    const R = 34, L = 2 * Math.PI * R, off = v == null ? L : L * (1 - v / 100), col = COL[c];
    return `<div class="vring ${c}"><svg viewBox="0 0 90 90"><circle cx="45" cy="45" r="${R}" class="trk"/><circle cx="45" cy="45" r="${R}" class="arc" stroke="${col}"
      stroke-dasharray="${L}" stroke-dashoffset="${off}" style="filter:drop-shadow(0 0 5px ${col})"/>
      ${[...Array(24)].map((_, i) => { const a = i / 24 * 2 * Math.PI; return `<line x1="${45 + 41 * Math.sin(a)}" y1="${45 - 41 * Math.cos(a)}" x2="${45 + 44 * Math.sin(a)}" y2="${45 - 44 * Math.cos(a)}" class="tick"/>`; }).join('')}
      <text x="45" y="49" class="rv">${v == null ? '–' : Math.round(v)}</text><text x="45" y="62" class="ru">%</text></svg><span>${label}</span></div>`;
  }
  function tank(label, v, c, icon) {
    const col = COL[c], h = v == null ? 0 : v;
    return `<div class="vtank ${c}"><div class="tk"><div class="lq" style="height:${h}%;background:linear-gradient(180deg,${col},${col}55);box-shadow:0 0 10px ${col}"></div><div class="tkg"></div>
      <b>${v == null ? '–' : Math.round(v)}</b></div><span>${icon}${label}</span></div>`;
  }
  function heart(bpm, c) {
    const col = COL[c] || '#3dabff', p = 'M0 30 H30 L36 30 L40 18 L45 44 L50 8 L55 38 L60 30 H120 L126 30 L130 18 L135 44 L140 8 L145 38 L150 30 H240';
    const dur = bpm ? Math.max(.25, 60 / bpm) * 2 : 2;
    return `<div class="vheart ${c}"><svg viewBox="0 0 120 52" preserveAspectRatio="none"><g class="ecg" style="animation-duration:${dur}s"><path d="${p}" stroke="${col}" style="filter:drop-shadow(0 0 4px ${col})"/></g></svg>
      <div class="hv"><svg viewBox="0 0 24 22" class="hico" style="animation-duration:${dur / 2}s"><path d="M12 21C5 15 1 11 1 6.5A5.5 5.5 0 0 1 12 4a5.5 5.5 0 0 1 11 2.5C23 11 19 15 12 21z" fill="${col}"/></svg><b>${bpm == null ? '–' : Math.round(bpm)}</b><small>BPM</small></div></div>`;
  }
  function thermo(t, c) { /* v2 (RAZ 24 NOV: "the temperature gauge is too basic"): symbol box + a vertical column of the same level pills, normal band marked */
    const col = COL[c], n = t == null ? 0 : Math.max(1, Math.min(10, Math.round((t - 30) / 1.2)));
    const cells = [...Array(10)].map((_, k) => { const i = 9 - k, on = i < n, band = i >= 4 && i <= 7; return `<i class="${on ? 'on' : ''}${band ? ' band' : ''}" style="${on ? `--c:${col}` : ''}"></i>`; }).join('');
    return `<div class="vtherm2 ${c}"><div class="pic"><svg viewBox="0 0 24 24"><path d="M9 3a3 3 0 0 1 6 0v10.5a5 5 0 1 1-6 0z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="17" r="2.6" fill="currentColor"/><path d="M12 8v7" stroke="currentColor" stroke-width="2"/></svg></div>
      <b>${t == null ? '–' : t.toFixed(1)}<small>°C</small></b><div class="tcol">${cells}</div><span>BODY</span></div>`;
  }

  const IC = {
    temp: '<path d="M10 3a3 3 0 0 1 6 0v11a6 6 0 1 1-6 0z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="13" cy="19" r="3" fill="currentColor"/>',
    rad: '<circle cx="13" cy="13" r="2.6" fill="currentColor"/><path d="M13 13L7 3.5A11 11 0 0 1 19 3.5z M13 13l11 .5a11 11 0 0 1-6 9.8z M13 13L8 22.3A11 11 0 0 1 2 13.5z" fill="currentColor"/>',
    air: '<path d="M4 16a9 9 0 0 1 18 0v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" fill="currentColor"/><path d="M7 15a6 4.5 0 0 1 12 0v1H7z" fill="#071a2c"/><path d="M6.5 10.5a7 7 0 0 1 13 0" fill="none" stroke="currentColor" stroke-width="1.8" transform="translate(0 -5) rotate(-12 13 10)"/>', /* 24 NOV: helmet with open visor (his pick) */
    grav: '<circle cx="13" cy="5" r="3" fill="currentColor"/><path d="M13 10v13 M8 18l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'
  };
  const chip = (ic, v, c, k) => `<div class="vchip ${c}" title="${k}"><svg viewBox="0 0 26 26">${IC[ic]}</svg><b>${v}</b></div>`;
  const ICF = '<svg viewBox="0 0 20 20" class="ti"><path d="M4 2v7a3 3 0 0 0 6 0V2M7 2v16M14 2c3 2 3 7 0 8v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const ICW = '<svg viewBox="0 0 20 20" class="ti"><path d="M10 2C10 2 4 9 4 13a6 6 0 0 0 12 0c0-4-6-11-6-11z" fill="currentColor"/></svg>';
  /* level = the deck's power-bar pills (RAZ 24 NOV: "use the button pills to indicate level"): 10 pills, lit up to the level, status color */
  function pills(label, v, c, icon) {
    const n = v == null ? 0 : Math.round(v / 10), col = COL[c];
    return `<div class="vpill ${c}"><div class="pic">${icon}</div><div class="pr"><div class="ph"><span>${label}</span><b>${v == null ? '–' : Math.round(v)}<small>%</small></b></div>
      <div class="pc">${[...Array(10)].map((_, i) => `<i class="${i < n ? 'on' : ''}" style="${i < n ? `--c:${col}` : ''}"></i>`).join('')}</div></div></div>`;
  }
  const ICH = '<svg viewBox="0 0 24 24"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" fill="currentColor"/></svg>';
  const ICO = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.4"/><text x="12" y="16.5" text-anchor="middle" font-family="Oxanium" font-weight="800" font-size="10" fill="currentColor">O2</text></svg>';
  window.__vitalsHTML = function (L) {
    const A = L && L.actor, V = A && A.vitals || {}, E = A && A.environment || {}, S = A && A.state || {};
    const hp = pct(V.health), o2 = pct(V.oxygen), food = pct(V.hunger), water = pct(V.thirst), bt = V.body_temperature ? V.body_temperature.current : null;
    const ext = E.external_temperature, rad = E.ambient_radiation_rate, air = E.breathable_atmosphere, g = V.gravity, hr = V.heart_rate;
    const btc = bt == null ? '' : (bt < 33 || bt > 40) ? 'vr' : (bt < 35 || bt > 38.5) ? 'va' : 'vg';
    const hrc = hr == null ? '' : hr >= 160 ? 'vr' : hr >= 120 ? 'va' : 'vg';
    const loc = S.locomotion === 'EVA' ? 'EVA' : S.locomotion === 'SEATED' ? 'SEATED' : S.locomotion ? 'ON FOOT' : '–';
    return `<div class="vit2"><div class="vbars">${pills('HEALTH', hp, lv(hp, 50, 25), ICH)}${pills('OXYGEN', o2, lv(o2, 30, 15), ICO)}${pills('FOOD', food, lv(food, 30, 10), ICF)}${pills('WATER', water, lv(water, 30, 10), ICW)}</div>
      <div class="vmid">${pills('HEART', hr == null ? null : Math.max(0, Math.min(100, (hr - 40) / 1.4)), hrc, '<svg viewBox="0 0 24 22"><path d="M12 21C5 15 1 11 1 6.5A5.5 5.5 0 0 1 12 4a5.5 5.5 0 0 1 11 2.5C23 11 19 15 12 21z" fill="currentColor"/></svg>').replace(/<b>[^<]*<small>%<\/small><\/b>/, `<b>${hr == null ? '–' : Math.round(hr)}<small> BPM</small></b>`)}<div class="vchips">${chip('temp', ext == null ? '–' : Math.round(ext) + '°', ext == null ? '' : (ext < -20 || ext > 50) ? 'va' : 'vg', 'OUTSIDE')}
      ${chip('rad', rad == null ? '–' : rad > 0 ? rad.toFixed(1) : '0', rad == null ? '' : rad > .5 ? 'vr' : rad > 0 ? 'va' : 'vg', 'RADIATION')}
      ${chip('air', air == null ? '–' : air ? 'OK' : 'NONE', air == null ? '' : air ? 'vg' : 'va', 'AIR')}${chip('grav', g == null ? '–' : g.toFixed(2), '', 'GRAVITY')}</div>
      <div class="vloc">${loc}${V.intoxication_level ? ' · DRUNK ' + V.intoxication_level : ''}</div></div>${thermo(bt, btc)}</div>`;
  };
})();

/* EQUIPMENT lower section (RAZ 24 NOV): "squad and wallet and let the user configure and even have it dissolving and rotating through different pages of info.
   where currently the attachments are we can put things like medical device and gadget and flashlight and other useful fps things. then that entire lower
   section of 1 2 3 weapon rotates through squad member info, mission status, their ship status as they left it and or a feed that reports if it's taking fire."
   LEFT = an info pane that dissolves through pages: WEAPONS 1-2-3 / SQUAD / SHIPS / MISSION / FEED / WALLET. Tap a page = hold it (tap again = rotate on).
   Dots jump to a page. The gear picks the pages and the speed (saved). RIGHT = 3 x 3 quick FPS keys.
   Data: WALLET = live telemetry (uec_balance). SQUAD / SHIPS / FEED come from the crew link (chat 8 wiring); MISSION from the game log - SAMPLE until wired. */
(function () {
  const PAGES = ['WEAPONS', 'BODY', 'SQUAD', 'SHIPS', 'MISSION', 'FEED', 'WALLET']; /* BODY = his health on the body outline (RAZ 24 NOV) */
  let cfg = { on: PAGES.slice(), sec: 6 }; try { Object.assign(cfg, JSON.parse(localStorage.getItem('cmdglas-eq-rot') || '{}')); } catch (e) {}
  const save = () => { try { localStorage.setItem('cmdglas-eq-rot', JSON.stringify(cfg)); } catch (e) {} };
  let cur = 0, hold = false, last = 0, uec0 = null, wallet = null, LAST = null;
  const QUICK = [['MED GUN', 'img', 'medgun'], ['MEDPEN', 'svg', '<svg viewBox="0 0 64 40"><path d="M24 6l12-3 4 3v29q0 3-3 3H27q-3 0-3-3z" fill="#e8f4ff"/><path d="M25 9l14-3M25 13l14-3" stroke="#06121e" stroke-width="1.6"/><rect x="28" y="19" width="8" height="10" rx="1.5" fill="#06121e"/><rect x="40" y="13" width="3" height="16" rx="1" fill="#e8f4ff"/><path d="M27 35h10" stroke="#06121e" stroke-width="1.4"/></svg>'], ['GADGET', 'img', 'gadget'], ['FLASHLIGHT', 'svg', '<svg viewBox="0 0 64 40"><path d="M6 15h28l10-7h14v24H44l-10-7H6z" fill="#e8f4ff"/><path d="M12 18h16v4H12z" fill="#071a2c"/></svg>'], ['MULTITOOL', 'img', 'multitool'] /* 25 NOV RAZ: "why have you changed the symbology for multitool" - his picture (fps-icons/multitool.png, cut from his inventory shot) back; the drawn symbol of 24 NOV 23:06 removed */, ['KNIFE', 'img', 'knife'], ['WIPE<br>VISOR', 'svg', '<svg viewBox="0 0 64 40"><path d="M14 30V18Q14 4 32 4T50 18v12q0 4-4 4H18q-4 0-4-4z" fill="#e8f4ff"/><path d="M19 20Q19 10 32 10T45 20v6H19z" fill="#06121e"/><path d="M32 27L23 14" stroke="#e8f4ff" stroke-width="2.2" stroke-linecap="round"/><path d="M24 19Q28 13 34 13" fill="none" stroke="#e8f4ff" stroke-width="1.2" stroke-dasharray="2 2"/></svg>'], ['MOBIGLAS', 'svg', '<svg viewBox="0 0 64 40"><rect x="14" y="4" width="36" height="28" rx="5" fill="#e8f4ff"/><rect x="18" y="8" width="28" height="20" rx="3" fill="#071a2c"/><path d="M22 14h20M22 19h14M22 24h17" stroke="#e8f4ff" stroke-width="2.4" stroke-linecap="round"/><path d="M8 12h6v12H8z" fill="#e8f4ff"/></svg>'], ['INSPECT', 'svg', '<svg viewBox="0 0 64 40"><circle cx="27" cy="17" r="12" fill="none" stroke="#e8f4ff" stroke-width="5"/><path d="M36 26l12 10" stroke="#e8f4ff" stroke-width="7" stroke-linecap="round"/></svg>']]; /* 24 NOV: white symbols - med gun / medpen / multitool cut from his inventory shot (color taken out), the rest solid white */
  const SQ = []; /* 25 NOV RAZ: "only real stuff": filled by the crew link; until then NO DATA */ /* 25 NOV RAZ: "make your squad 4 players on the display in the equipment deck" */
  const SHIPS = [];
  const FEED = [];
  const lvlc = v => v <= 25 ? 'vr' : v <= 50 ? 'va' : 'vg';
  const COLS = { vg: '#14ff63', va: '#ffae00', vr: '#a00d22', '': '#3dabff' };
  const pills = (v, c) => `<div class="pc">${[...Array(10)].map((_, i) => `<i class="${i < Math.round(v / 10) ? 'on' : ''}" style="--c:${COLS[c]}"></i>`).join('')}</div>`;
  const sample = '';
  function page(name) {
    if (name === 'WEAPONS') return [['rifle', '1', 'PRIMARY'], ['smg', '2', 'SECONDARY'], ['pistol', '3', 'SIDEARM']].map(([ic, n, l]) =>
      `<div class="eqslot rw" data-slot="${l}"><img class="eqimg" src="fps-icons/${ic}.png" alt=""><span class="eql">${l}</span><span class="eqn">${n}</span></div>`).join('');
    if (name === 'SQUAD' && !SQ.length) return '<div class="rcard"><div class="rt"><b>NO DATA</b><span>waiting for game data</span></div></div>';
    if (name === 'SQUAD') return SQ.map(([n, h, s, d]) => `<div class="rcard ${d}"><div class="rt"><b>${n}</b><span class="${d ? 'vr' : ''}">${s}</span></div><div class="rp"><span>${h}%</span>${pills(h, d ? 'vr' : lvlc(h))}</div></div>`).join('') + sample;
    if (name === 'SHIPS' && !SHIPS.length) return '<div class="rcard"><div class="rt"><b>NO DATA</b><span>waiting for game data</span></div></div>';
    if (name === 'SHIPS') return SHIPS.map(([n, sh, st, loc, c]) => `<div class="rcard"><div class="rt"><b>${n}</b><span>${sh}</span></div><div class="rt"><span class="${c}">${st}</span><span>${loc}</span></div></div>`).join('') + sample;
    if (name === 'MISSION') return '<div class="rcard"><div class="rt"><b>NO DATA</b><span>waiting for game data</span></div></div>'; /* 25 NOV real data only: the game log mission feed is not wired yet */
    if (name === 'MISSION_SAMPLE') return `<div class="rcard"><div class="rt"><b>DELIVER CARGO</b><span class="vg">ACTIVE</span></div><div class="rt"><span>4 SCU MEDICAL SUPPLIES</span><span>→ AREA18</span></div></div>
      <div class="rcard"><div class="rt"><b>NEXT STEP</b><span>2 OF 3</span></div>${pills(66, '')}</div><div class="rcard"><div class="rt"><b>REWARD</b><span>18,500 aUEC</span></div></div>` + sample;
    if (name === 'FEED' && !FEED.length) return '<div class="rcard"><div class="rt"><b>NO DATA</b><span>waiting for game data</span></div></div>';
    if (name === 'FEED') return FEED.map(([t, w, e, c]) => `<div class="rfeed ${c}"><span>${t}</span><b>${w}</b><span class="${c}">${e}</span></div>`).join('') + sample;
    if (name === 'BODY') { const L = (typeof LIVE !== 'undefined' && LIVE && LIVE.actor) ? LIVE : LAST, V = L && L.actor && L.actor.vitals, hp = V && V.health && V.health.max ? Math.round(100 * V.health.current / V.health.max) : null;
      const I = (L && L.injuries && L.injuries.zones) || (L && L.injuries) || null, Z = { head: 'HEAD', chest: 'TORSO', l_arm: 'L ARM', r_arm: 'R ARM', l_leg: 'L LEG', r_leg: 'R LEG' }, TN = { 1: 'TIER 1', 2: 'TIER 2', 3: 'TIER 3' };
      const hurt = I ? Object.keys(Z).filter(z => [1, 2, 3].includes(I[z])) : [];
      const fig = window.xbody ? `${window.suitDefs ? window.suitDefs() : ''}<svg viewBox="-64 0 128 260" class="bfig">${window.xbody(0, 0, 260, hp != null && hp <= 0 ? 'dead' : 'ok', I || {})}</svg>` : '';
      return `<div class="rbody">${fig}<div class="binfo"><span>HEALTH</span><b class="${hp == null ? '' : hp <= 25 ? 'vr' : hp <= 50 ? 'va' : 'vg'}">${hp == null ? '–' : hp + '%'}</b>
        <span>INJURIES</span>${I ? (hurt.length ? hurt.map(z => `<em class="vr">${Z[z]} · ${TN[I[z]]}</em>`).join('') : '<em class="vg">NONE</em>') : '<em>NOT READ YET</em>'}</div></div>`; }
    if (name === 'WALLET') { const d = wallet != null && uec0 != null ? wallet - uec0 : null;
      return `<div class="rwal"><span>aUEC BALANCE</span><b>${wallet == null ? '–' : wallet.toLocaleString('en-US')}</b><span class="${d > 0 ? 'vg' : d < 0 ? 'va' : ''}">THIS SESSION ${d == null ? '–' : (d >= 0 ? '+' : '') + d.toLocaleString('en-US')}</span><div class="qk wsend" data-q="MOBIGLAS"><span>SEND aUEC · OPEN MOBIGLAS</span></div></div>`; /* the game has no key that opens the transfer screen directly: this opens mobiGlas (then Finance / Transfer) */ }
    return '';
  }
  async function poll() { try { const L = (typeof LIVE !== 'undefined' && LIVE && LIVE.actor) ? LIVE : await (await fetch('data:application/json,null' /* SHOP COPY: never reads the owner's local bridge */, { cache: 'no-store' })).json();
    LAST = L; const u = L && L.actor && L.actor.state && L.actor.state.uec_balance; if (u != null) { wallet = +u; if (uec0 == null) uec0 = wallet; } } catch (e) {} }
  setInterval(poll, 2000); poll();
  function build(body) {
    body.querySelectorAll('.eqrow.att').forEach(r => r.remove());
    const low = document.createElement('div'); low.className = 'eqlow';
    low.innerHTML = `<div class="rot"><div class="rhead"><b class="rname"></b><span class="rdots"></span></div><div class="rpage"></div><div class="rcfg"></div></div>
      <div class="quick">${QUICK.map(([l, k, ic]) => `<div class="qk" data-q="${l.replace('<br>', ' ')}">${k === 'img' && ic ? `<img class="eqimg" src="fps-icons/${ic}.png" alt="">` : k === 'svg' ? ic : ''}<span>${l}</span></div>`).join('')}</div>`;
    body.appendChild(low);
    /* 25 NOV RAZ: "utility carrie page is still too small font size on fps page": the 9 quick keys' names 10.5 -> 14 px; a name wider than its key
       (FLASHLIGHT, MULTITOOL, MOBIGLAS) is narrowed to fit instead of cut, so every name stays the same height */
    low.querySelectorAll('.qk span').forEach(sp => { sp.style.setProperty('font-size', '14px', 'important'); sp.style.setProperty('letter-spacing', '.3px', 'important'); sp.style.setProperty('display', 'inline-block');
      const fit = () => { const k = sp.closest('.qk'), room = (k ? k.clientWidth : 72) - 6; sp.style.transform = ''; const w = sp.scrollWidth; if (w > room && room > 0) { sp.style.transform = `scaleX(${(room / w).toFixed(3)})`; sp.style.transformOrigin = '50% 50%'; } };
      fit(); setTimeout(fit, 400); });
    low.addEventListener('pointerup', e => {
      /* 24 NOV: the page picker moved to the TOC (RAZ: all settings are done in the TOC) */
      const ck = e.target.closest('.rcfg [data-p]'); if (ck) { const p = ck.dataset.p; cfg.on = cfg.on.includes(p) ? cfg.on.filter(x => x !== p) : PAGES.filter(x => cfg.on.includes(x) || x === p); if (!cfg.on.length) cfg.on = ['WEAPONS']; save(); drawCfg(low); return; }
      const sp = e.target.closest('.rcfg [data-s]'); if (sp) { cfg.sec = +sp.dataset.s; save(); drawCfg(low); return; }
      const dot = e.target.closest('.rdots i'); if (dot) { cur = +dot.dataset.i; show(low, true); return; }
      const q = e.target.closest('.qk'); if (q) { q.classList.add('on'); setTimeout(() => q.classList.remove('on'), 300); return; }
      if (e.target.closest('.rpage') && !e.target.closest('.eqslot')) { hold = !hold; low.querySelector('.rot').classList.toggle('held', hold); }
    });
    cur = 0; show(low, false);
  }
  function drawCfg(low) { low.querySelector('.rcfg').innerHTML = `<b>PAGES</b>${PAGES.map(p => `<span data-p="${p}" class="${cfg.on.includes(p) ? 'on' : ''}">${p}</span>`).join('')}<b>EVERY</b>${[4, 6, 10].map(s => `<span data-s="${s}" class="${cfg.sec === s ? 'on' : ''}">${s} S</span>`).join('')}`; }
  function show(low, anim) {
    const list = cfg.on.length ? cfg.on : ['WEAPONS']; cur = ((cur % list.length) + list.length) % list.length; const name = list[cur];
    const pg = low.querySelector('.rpage'), selNow = (document.querySelector('.eqslot.on') || {}).dataset;
    low.querySelector('.rname').textContent = name;
    low.querySelector('.rdots').innerHTML = list.map((p, i) => `<i data-i="${i}" class="${i === cur ? 'on' : ''}"></i>`).join('');
    const put = () => { pg.innerHTML = page(name); pg.className = 'rpage p-' + name.toLowerCase();
      if (name === 'WEAPONS') { const s = (selNow && selNow.slot) || null; pg.querySelectorAll('.eqslot').forEach(x => { x.classList.toggle('on', x.dataset.slot === s); x.classList.toggle('dimq', x.dataset.slot !== s); }); } };
    /* section change (RAZ 24 NOV: "a quick flurry or the same as the change on the flight page, show me both"): ?rtr=flurry = quick swirl of sand, ?rtr=deck = the deck's own page change type */
    const RTR = new URLSearchParams(location.search).get('rtr') || cfg.tr || 'deck'; /* default = the deck's own particle transition (RAZ: "the actual tiny particle dissolving animation") */
    pg.dataset.mc = '';
    if (anim && window.keyMorph && typeof TRT !== 'undefined') keyMorph(pg, put, { type: RTR === 'deck' ? TRT : 'swirl' });
    else if (anim) { pg.classList.add('out'); setTimeout(() => { put(); pg.classList.remove('out'); }, 380); } else put();
    last = Date.now();
  }
  setInterval(() => {
    const body = document.querySelector('.eqpanel .eqbody'); if (!body) return;
    if (document.querySelector('#area.offps-on')) return; /* 25 NOV (RAZ: "the weapon loadout area of the fps deck page flashes and warps"): the hidden narrow panel under the Edge FPS page must not rotate (each rotation ran a full page transition) */
    const att = body.querySelector('.eqrow.att'), low = body.querySelector('.eqlow');
    if (att && !low) build(body);
    const lw = body.querySelector('.eqlow'); if (!lw) return;
    if (!hold && Date.now() - last > cfg.sec * 1000) { cur++; show(lw, true); }
    if ((cfg.on[cur % cfg.on.length] || '') === 'WALLET') { const b = lw.querySelector('.rwal b'); if (b && wallet != null && b.textContent === '–') show(lw, false); }
  }, 250);
})();

/* SETTINGS LIVE IN THE TOC (RAZ 24 NOV: "that edit button belongs into the toc and out of there. There should be a huge warning caution in fat letters that says
   all settings are adjusted in the TOC for all components"). No EDIT key and no settings screen on the Holo: a long press on any key, or anything that would open the
   deck's own settings, shows the CAUTION card instead. */
(function () {
  let card = null, hide = null;
  function caution() {
    const deck = document.getElementById('deck'); if (!deck) return;
    if (!card || !card.isConnected) { card = document.createElement('div'); card.className = 'tocwarn';
      card.innerHTML = '<div class="tw-in"><div class="tw-ic">!</div><div><b>CAUTION</b><strong>ALL SETTINGS ARE ADJUSTED IN THE TOC</strong><span>FOR ALL COMPONENTS · OPEN THE CmdGlas TOC ON YOUR PC</span><em>THE TOC IS ITS OWN WINDOW, SO YOU SEE EVERY CHANGE HAPPEN LIVE ON THE HOLO WHILE YOU ADJUST IT · NO HOPPING BETWEEN MENUS AND BACK TO THE PICTURE</em></div></div>'; deck.appendChild(card); }
    card.classList.add('on'); clearTimeout(hide); hide = setTimeout(() => card.classList.remove('on'), 3200);
  }
  window.__tocCaution = caution;
  let lp = null;
  addEventListener('pointerdown', e => { const k = e.target.closest && e.target.closest('#deck .nb.k, #deck .flatk, #deck .tab'); if (!k) return; if (/HOLD/.test(((k.querySelector('.ns') || {}).textContent || ''))) return; /* HOLD keys (EXIT SEAT, RESPAWN...) are meant to be held */ clearTimeout(lp); lp = setTimeout(caution, 1100); }, true);
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => addEventListener(ev, () => clearTimeout(lp), true));
  new MutationObserver(() => { if (document.body.classList.contains('cfgopen')) { document.body.classList.remove('cfgopen'); caution(); } }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();

/* TELEMETRY FLOAT v2 (chat 2, 24 NOV). RAZ: "we'll just do the telemetry page like the fps page and disappear everything around the telemetry pages so user can
   place them wherever they want without blocking most of their screen" + "show the actual pills with mock telemetry inputs" + "i want the user to be able to drag
   it anywhere on screen and remove the outside line, entire outside pill line. i just want one area where the user can switch between all the different
   telemetry pages like the small pill one or just the combat telemetry" + "user can of course also set transparency in the toc".
   The TELEMETRY tab opens ONE floating area, no outline. A thin strip on top: grip (drag), the page names (tap = switch), ‹ DECK. Pages: FULL (the iPad board),
   TRAVEL (the travel pill), COMBAT (combat telemetry), SHIP STATUS, SERVER STATUS. Each page is cut to its own content, so the area is only as big as the page.
   Transparency + start page come from the TOC (key cmdglas-telem-float: {opacity, page}); ?topa= and ?tpage= for tests. Position and page are remembered.
   No live reading yet -> mock values (?mock=0 = try the live bridge). */
(function () {
  const Q2 = new URLSearchParams(location.search);
  const INT = /\/telemetry\//.test(location.pathname); /* installed in My Own Tablet/telemetry (lock 374): pages sit beside the deck, live data by default */
  const MOCK = Q2.get('mock') != null ? Q2.get('mock') !== '0' : !INT;
  const PRE = INT ? '' : '../';
  const ST = MOCK ? 'stream=http://127.0.0.1:9/none' : '';
  const u = (f, q) => f + (q ? (f.includes('?') ? '&' : '?') + q : '');
  /* the PC Holo FLIGHT / SYSTEMS pages load the telemetry page with ?holo=1 (its Holo-only top row: LAST ACTION, LOCK caution pill, CPLD / ESP / G-SAFE fields, no
     FULL SCREEN; rings on one line). The design copy previews the test page _holo-tablet.html. */
  const SHOPD = /\/shop\/live\//.test(location.pathname); /* SHOP DEMO (chat 2, 25 NOV): the shop copy uses telemetry-demo.html beside it */ const HTAB = (INT ? 'telemetry-holo.html' : SHOPD ? 'telemetry-demo.html' : '_holo-tablet.html') + '?holo=1'; /* the Holo's OWN copy (telemetry-holo.html + travel-dial-holo.js): the iPad's telemetry-tablet.html stays untouched */
  /* [name, src, native w, native h, crop x0, y0, x1, y1, scale] */
  const EDGE = Q2.get('edge') != null, HOLO = (window !== window.top && !EDGE) || Q2.get('pcholo') != null; /* 25 NOV: the Edge now runs inside chat 3's iCUE widget frame, so ?edge=1 decides, not the top window */
  const PAGES = EDGE || HOLO ? [
    /* 25 NOV, RAZ: "on this page i only want the ... top row with boost to radar altimiter to include accel vsi and the g meter and the lower half wfould go onto
       it's owsn page ... the top half should be containedd in a holodisplay like pill that the user can expand and make bigger or smaller to his/her liking. the
       bottom area just need s a honeycomb backround and seperated from the top" -> FLIGHT = the top row in a resizable holo pill; SYSTEMS = the lower half, honeycomb. */
    /* RAZ (25 NOV, via chat 3): "this is only for the on pc holo. not the ipad holo" -> the split only inside the PC Holo window (the deck is framed there);
       opened on its own (iPad, Edge, a browser) the deck keeps the one FULL page. ?pcholo=1 shows the split for tests. */
    /* RAZ 25 NOV: "i also want the top telemetry part built and sent to the edge deck only the top part" -> on the Edge (?edge=1) the FLIGHT top part only, no SYSTEMS, drawn larger (the Edge has the room) */
    /* RAZ 25 NOV: "install the two pages that show the solo top and solo bottom part ... into my Holo. currently the holo still has the full page and all options up
       top to select. it's only two \"pages\" top and bottom seperateed" -> the Holo shows ONLY FLIGHT (top) + SYSTEMS (bottom); the Edge ONLY FLIGHT. */
    EDGE ? ['FLIGHT', u((SHOPD ? '' : PRE) + HTAB + '&wide=1', ST), 1180, 800, 10, 8, 1170, 338, 1.3, 'pill'] /* 25 NOV: Edge wide layout, the full width of the page */ : ['FLIGHT', u((SHOPD ? '' : PRE) + HTAB + '&wide=1', ST), 1180, 800, 10, 8, 1170, 338, .89, 'pill'] /* 25 NOV RAZ: 'same build for the desktop holo but in desktop style no pill' */,
    ...(EDGE ? [] : [['SYSTEMS', u((SHOPD ? '' : PRE) + HTAB, ST), 1180, 800, 46, 336, 1116, 756, .89, 'hex']])] : [
    ['FULL', u(PRE + 'telemetry-tablet.html', ST), 1180, 800, 56, 20, 1106, 760, .89],
    ['TRAVEL', u(PRE + 'travel-edge-current.html', ST), 1600, 900, 266, 44, 1484, 720, .72],
    ['COMBAT', u(PRE + 'combat-hud.html', ST), 1600, 900, 24, 37, 767, 435, 1.15],
    ['SHIP STATUS', INT ? 'ship-status-deck.html' : 'http://127.0.0.1:8530/deck-build/ship-status-deck.html', 2560, 720, 0, 0, 2560, 720, .5],
    ['SERVER STATUS', INT ? 'server-status-deck.html' : 'http://127.0.0.1:8530/deck-build/server-status-deck.html', 2560, 720, 0, 0, 2560, 720, .5]
  ];
  let set = { opacity: 1, page: 'FULL' }; try { Object.assign(set, JSON.parse(localStorage.getItem('cmdglas-telem-float') || '{}')); } catch (e) {}
  if (Q2.get('topa')) set.opacity = +Q2.get('topa'); if (Q2.get('tpage')) set.page = Q2.get('tpage');
  let mem = { x: null, y: 10, page: null }; try { Object.assign(mem, JSON.parse(localStorage.getItem('cmdglas-telem-pos') || '{}')); } catch (e) {}
  const save = () => { try { localStorage.setItem('cmdglas-telem-pos', JSON.stringify(mem)); } catch (e) {} };
  const BAR = 34;
  const P = () => PAGES.find(p => p[0] === (mem.page || set.page)) || PAGES[0];
  const Z = p => p[9] === 'pill' ? Math.max(.6, Math.min(EDGE ? 3 : 2.2, (mem.zoom || {})[p[0]] || 1)) : 1;
  /* 25 NOV RAZ: "telemetry page on deck holo still shows red graphics and text and it opens the telemetry page at a too small of a scale" + "i like the way you have the dark honeycomb on the even darker honeycomb ... replace all edge deck holo pages with that design": on the Edge the page opens filling the deck (centred, inside the outer frame) every time, on the deck's darker honeycomb, in a dark-honeycomb pill like the key groups */
  const edgeFit = p => Math.min((2512 - 60) / ((p[6] - p[4]) * p[8]), (720 - 28 - BAR - 20) / ((p[7] - p[5]) * p[8])); /* user size of the holo pill (corner grip), remembered */
  const K = p => p[8] * Z(p);
  const size = p => ({ w: (p[6] - p[4]) * K(p), h: (p[7] - p[5]) * K(p) });
  const deckEl = () => document.getElementById('deck');
  function place(f) { const s = size(P()); if (mem.x == null) mem.x = (2560 - s.w) / 2; mem.x = Math.max(0, Math.min(2560 - s.w, mem.x)); mem.y = Math.max(0, Math.min(720 - s.h - BAR, mem.y)); f.style.left = mem.x + 'px'; f.style.top = mem.y + 'px'; }
  function load(f) {
    const p = P(), s = size(p), win = f.querySelector('.tfwin'), ifr = f.querySelector('iframe');
    f.style.width = Math.max(s.w, 520) + 'px'; win.style.width = s.w + 'px'; win.style.height = s.h + 'px'; f.dataset.kind = p[9] || '';
    Object.assign(ifr.style, { width: p[2] + 'px', height: p[3] + 'px', transform: `translate(${-p[4] * K(p)}px,${-p[5] * K(p)}px) scale(${K(p)})` });
    if (ifr.dataset.src !== p[1]) { ifr.dataset.src = p[1]; ifr.src = p[1]; }
    f.querySelectorAll('.tftab').forEach(t => t.classList.toggle('on', t.dataset.p === p[0]));
    win.style.opacity = Math.max(.15, Math.min(1, set.opacity)); place(f);
    /* 25 NOV RAZ: "i just want the whole thing to be the dark blue": on the Edge the page is ONE dark-blue honeycomb pill (the key groups' own look) filling the deck frame, top to bottom, the readings centred in it */
    if (f._edgeFull) { const H = 720 - 14 - BAR - 14; f.style.left = '24px'; f.style.top = '12px'; f.style.width = '2512px'; f.style.borderRadius = '34px'; win.style.width = '2512px'; win.style.height = H + 'px';
      const gq = document.querySelector('#deck > .edgegrp'), gc = gq ? getComputedStyle(gq) : null; if (gc) ['background-image', 'background-color', 'background-size', 'background-position', 'background-repeat'].forEach(k => f.style.setProperty(k, gc.getPropertyValue(k), 'important'));
      ['background', 'box-shadow', 'border'].forEach(k => win.style.setProperty(k, k === 'border' ? '0' : 'none', 'important'));
      ifr.style.marginLeft = Math.max(0, (2512 - s.w) / 2) + 'px'; ifr.style.marginTop = Math.max(0, (H - s.h) / 2) + 'px'; ifr.style.clipPath = 'inset(0 0 ' + Math.max(0, p[3] - p[7] - 4) + 'px 0)'; }
  }
  function open() {
    let f = document.getElementById('tfloat');
    if (!f) {
      f = document.createElement('div'); f.id = 'tfloat';
      f.innerHTML = `<div class="tfbar"><span class="tfgrip" title="drag">⋮⋮</span>${PAGES.map(p => `<span class="tftab" data-p="${p[0]}">${p[0]}</span>`).join('')}` +
        `${MOCK ? '<em>MOCK DATA</em>' : ''}<span class="tfback">DECK</span></div><div class="tfwin"><iframe title="telemetry"></iframe><span class="tfsize" title="drag to resize"></span></div>`;
      deckEl().appendChild(f);
      const ifr = f.querySelector('iframe');
      ifr.addEventListener('load', () => { try { const d = ifr.contentDocument, st = d.createElement('style'); st.textContent = '#tbpair{display:none!important}html,body{background:transparent!important}::-webkit-scrollbar{display:none}' + (HOLO ? 'body::before,body::after{display:none!important}.cut{background:none!important}svg.tdial path[fill^="url(#tdbg"],svg.tdial path[fill^="url(#tdhex"],svg.tdial path[fill^="url(#tdglow"],svg.tdial path[fill="url(#tdscan)"]{fill-opacity:0!important}' : ''); d.head.appendChild(st); } catch (e) {} });
      f.querySelector('.tfback').addEventListener('pointerup', e => { e.stopPropagation(); close(); });
      f.querySelectorAll('.tftab').forEach(t => t.addEventListener('pointerup', e => { e.stopPropagation(); if (drag && drag.moved) return; mem.page = t.dataset.p; save(); load(f);
        f.querySelector('.tfwin').animate([{ opacity: 0, filter: 'blur(5px)' }, { opacity: Math.max(.15, Math.min(1, set.opacity)), filter: 'blur(0)' }], { duration: 380 }); }));
      const bar = f.querySelector('.tfbar'); let drag = null;
      bar.addEventListener('pointerdown', e => { if (e.target.closest('.tfback')) return; const sc = deckEl().getBoundingClientRect().width / 2560 || 1; drag = { sx: e.clientX, sy: e.clientY, x: mem.x, y: mem.y, sc, moved: false }; bar.setPointerCapture(e.pointerId); });
      bar.addEventListener('pointermove', e => { if (!drag) return; const dx = (e.clientX - drag.sx) / drag.sc, dy = (e.clientY - drag.sy) / drag.sc; if (Math.abs(dx) + Math.abs(dy) > 6) { drag.moved = true; f.classList.add('drag'); } if (!drag.moved) return; mem.x = drag.x + dx; mem.y = drag.y + dy; place(f); });
      bar.addEventListener('pointerup', () => { if (!drag) return; const m = drag.moved; f.classList.remove('drag'); if (m) save(); setTimeout(() => { drag = null; }, 0); });
      /* corner grip: drag out = bigger, drag in = smaller (60 % - 220 %), kept on screen */
      const grip = f.querySelector('.tfsize'); let rz = null;
      grip.addEventListener('pointerdown', e => { e.stopPropagation(); const p = P(); rz = { sx: e.clientX, w0: (p[6] - p[4]) * K(p), z0: Z(p), sc: deckEl().getBoundingClientRect().width / 2560 || 1 }; grip.setPointerCapture(e.pointerId); f.classList.add('sizing'); });
      grip.addEventListener('pointermove', e => { if (!rz) return; const p = P(), base = (p[6] - p[4]) * p[8], hb = (p[7] - p[5]) * p[8];
        let z = rz.z0 * (rz.w0 + (e.clientX - rz.sx) / rz.sc) / rz.w0; z = Math.max(.6, Math.min(2.2, (2560 - mem.x) / base, (720 - BAR - mem.y) / hb, z));
        mem.zoom = Object.assign({}, mem.zoom, { [p[0]]: +z.toFixed(3) }); load(f); });
      grip.addEventListener('pointerup', e => { e.stopPropagation(); if (!rz) return; rz = null; f.classList.remove('sizing'); save(); });
      addEventListener('storage', e => { if (e.key === 'cmdglas-telem-float') { try { Object.assign(set, JSON.parse(e.newValue)); } catch (x) {} load(f); } });
    }
    if (!f.querySelector('.tfref')) { if (HOLO && !document.getElementById('tf-holo-small')) { const hs2 = document.createElement('style'); hs2.id = 'tf-holo-small'; hs2.textContent = '#tfloat .tftab,#tfloat .tfback{font-size:7px!important;letter-spacing:1.8px!important}#tfloat .tfgrip{font-size:8px}'; document.head.appendChild(hs2); } /* 25 NOV RAZ: 'FLIGHT SYSTEMS and DECK are too large, they should be 1/2 their size in font' (desktop Holo) */ /* 25 NOV RAZ: the desktop Holo bar matches the Edge deck version (refresh right of DECK, light under DECK) */ /* 25 NOV RAZ: 'smaller, next to the FLIGHT button, I said higher up' + 'get rid of the chevron next to DECK and put the same light that you have under FLIGHT under it' */
      const fl = f.querySelector('.tftab'), r = document.createElement('span'); r.className = 'tfref'; r.title = 'Refresh'; r.innerHTML = '<svg viewBox="0 0 16 16" width="13" height="13" style="display:block"><path d="M13.1 6.4A5.4 5.4 0 1 1 8 2.6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><path d="M7.4 0.3L11.4 2.8L7.4 5.3Z" fill="#fff"/></svg>';
      r.style.cssText = 'cursor:pointer;padding:4px 6px;opacity:.9;display:inline-flex;align-items:center'; r.addEventListener('pointerup', e => { e.stopPropagation(); try { const w = f.querySelector('iframe').contentWindow; if (w && typeof w.doRefresh === 'function') w.doRefresh(); } catch (x) {} });
      const bk = f.querySelector('.tfback'); if (bk) bk.after(r); else if (fl) fl.after(r); /* 25 NOV RAZ: 'put the refresh symbol to the right of the DECK word, mirror the left FLIGHT and lines' -> DECK mirrors FLIGHT, the symbol sits where the grip lines sit on the left */ r.style.padding = '0 6px'; r.style.marginLeft = '4px';
      if (!document.getElementById('tf-deck-light')) { const st = document.createElement('style'); st.id = 'tf-deck-light'; st.textContent = '#tfloat .tfback{position:relative}#tfloat .tfback::after{content:"";position:absolute;left:50%;bottom:0;width:30px;height:2px;transform:translateX(-50%);border-radius:2px;background:linear-gradient(90deg,transparent,#3dabff 30%,#fff 50%,#3dabff 70%,transparent);box-shadow:0 0 8px #1f9eff}'; document.head.appendChild(st); } }
    if (EDGE && !HOLO) { f._edgeFull = true; const p = P(); mem.zoom = Object.assign({}, mem.zoom, { [p[0]]: +edgeFit(p).toFixed(3) }); mem.x = null; const hh = size(p).h; mem.y = Math.max(0, (720 - BAR - hh) / 2 - 6);
      const g = document.querySelector('#deck > .edgegrp'), win = f.querySelector('.tfwin'); if (g && win) { const c = getComputedStyle(g); ['backgroundImage', 'backgroundColor', 'backgroundSize', 'backgroundPosition', 'backgroundRepeat', 'border', 'borderRadius', 'boxShadow'].forEach(k => win.style[k] = c[k]); }
      /* 25 NOV RAZ: 'the telemetry page now has the black backing on the honeycomb backdrop ... fix it': the page inside is see-through on the Edge, the pill's dark honeycomb shows behind the readings */
      const ifr = f.querySelector('iframe'); if (ifr && !ifr.dataset.see) { ifr.dataset.see = '1'; ifr.style.background = 'transparent'; ifr.setAttribute('allowtransparency', 'true'); const see = () => { try { const d = ifr.contentDocument; if (d && d.head && !d.getElementById('edge-see')) { const x = d.createElement('style'); x.id = 'edge-see'; x.textContent = 'html,body{background:transparent!important}.cut{background:transparent!important}.tdial path[fill="url(#tdbg)"],.tdial path[fill="url(#tdhexb)"],.tdial path[fill="url(#tdglow)"]{display:none!important}'; d.head.appendChild(x); } } catch (e) {} }; ifr.addEventListener('load', see); see(); setTimeout(see, 600); }
      if (!document.getElementById('edge-telem-hex')) { const es = document.createElement('style'); es.id = 'edge-telem-hex'; es.textContent = 'html.edge-pill body.telemfloat #deck{background:rgb(1,3,4)!important}html.edge-pill body.telemfloat #deck>.edgepill:not(#tfloat),html.edge-pill body.telemfloat #deck>.edgehex:not(#tfloat){visibility:visible!important}'; document.head.appendChild(es); } }
    load(f); document.body.classList.add('telemfloat');
    f.animate([{ opacity: 0, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 420 });
  }
  function close() { const f = document.getElementById('tfloat'); document.body.classList.remove('telemfloat'); if (f) f.remove(); }
  /* 25 NOV RAZ: "the telemtry page in the onscreen holo deck isn't suppose to have a background. it's seethrough from the gitgo": on the PC Holo the TELEMETRY
     pages (FLIGHT + SYSTEMS) have no backing at all: no honeycomb window, no dark pill fill inside the page (the readings, rings and keys stay). Edge / iPad unchanged. */
  if (HOLO) { const hs = document.createElement('style'); hs.textContent = '#deck #tfloat[data-kind] .tfwin,#deck #tfloat .tfwin{background:none!important;box-shadow:none!important;border:0!important}'; document.head.appendChild(hs); }
  window.__telemFloat = { open, close, pages: PAGES };
  if (typeof openTelem === 'function') { openTelem = function () { document.body.classList.remove('cfgopen', 'moreopen', 'travelopen', 'telemopen'); open(); }; }
  /* 25 NOV RAZ: "i sleceted the travel button on the flight page and it openbed a old telemetry style we had before this current top telemetry page": the TRAVEL key
     (MORE header) and ?travel=1 now open the CURRENT telemetry page, the same as TELEMETRY in the page menu; the old travel sheet is no longer reachable. */
  if (typeof openTravel === 'function') { openTravel = function () { document.body.classList.remove('cfgopen', 'moreopen', 'travelopen', 'telemopen'); open(); }; }
  document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.telebtn'); if (t) { e.stopImmediatePropagation(); e.preventDefault(); open(); } }, true);
  document.addEventListener('pointerup', e => { if (!document.body.classList.contains('telemfloat')) return; if (e.target.closest && e.target.closest('#tfloat')) return; close(); });
  if (Q2.get('telem') != null) setTimeout(open, 400);
})();

/* BOTTOM KEY PAGES v2 (chat 2, 24 NOV late). RAZ: "the animations are busted during transitions ... barcode like appearances. only each button gets the cloud"
   + "mfd needs select mfd 1 2 or 3, pitch ladder what? lock? please go through all this and ask yourself is this a condition or action" + "i dislike the powers
   on the bottom, it takes away half from the aesthetic" + "shields should be under combat as well".
   - The power bars are gone on FLIGHT, COMBAT and TURRET. The space under the key row holds ONE row of 8 keys that pages through key sets.
   - The 8 buttons never move or rebuild. On a page change only each button's label turns to sand and back (the deck's own transition, like a page change).
   - Every key says what it is: ON / OFF (lit / dark) when the game reports the state, TOGGLE when it is an on/off the game does not report, TAP for a
     one-shot action, HOLD for hold keys, CYCLE for keys that step through modes. MFD 1 / 2 / 3 = which screen the view keys go to (lit = selected).
   - All actions are his own bound actions in actionmaps.xml (checked 24 NOV). data-act = what the key sends (wiring: chat 3 / chat 8).
   - Settings (rotate or stay, which pages, seconds) only in the TOC: key cmdglas-bottom-pages {rotate, sec, FLIGHT:[pages], COMBAT:[...], TURRET:[...]}. */
(function () {
  const L = k => () => (typeof ifcs === 'function' && typeof hasV === 'function' && typeof LIVEON !== 'undefined' && LIVEON && hasV()) ? (ifcs(k) ? 'ON' : 'OFF') : null;
  const W = k => () => (typeof wset === 'function' && typeof hasW === 'function' && typeof LIVEON !== 'undefined' && LIVEON && hasW()) ? (wset(k) ? 'ON' : 'OFF') : null;
  /* [label, action, kind, live] kind: tog = on/off, tap, hold, cyc = steps through modes, mfd = screen select */
  const MFDSEL = [['MFD 1', 'v_mfd_soft_select_mfd_1_short', 'mfd'], ['MFD 2', 'v_mfd_soft_select_mfd_2_short', 'mfd'], ['MFD 3', 'v_mfd_soft_select_mfd_3_short', 'mfd']];
  const TARGETING = [['NEXT HOSTILE', 'v_target_cycle_hostile_fwd', 'tap'], ['PREV HOSTILE', 'v_target_cycle_hostile_back', 'tap'], ['NEXT ATTACKER', 'v_target_cycle_attacker_fwd', 'tap'], ['NEXT FRIENDLY', 'v_target_cycle_friendly_fwd', 'tap'],
    ['TARGET UNDER RETICLE', 'v_target_under_reticle', 'tap'], ['NEXT SUB-TARGET', 'v_target_cycle_subitem_fwd', 'tap'], ['PREV SUB-TARGET', 'v_target_cycle_subitem_back', 'tap'], ['RESET TARGETS', 'v_target_cycle_all_reset', 'tap']];
  const WEAPONS = [['AIM MODE', 'v_weapon_aim_type_cycle', 'cyc'], ['STAGGERED FIRE', 'v_weapon_staggered_fire_toggle', 'tog'], ['PRECISION LINE', 'v_weapon_pip_prec_line_toggle', 'tog', W('precision_lines')], ['LEAD / LAG PIP', 'v_weapon_pip_toggle_lead_lag', 'tog'],
    ['CONVERGENCE +', 'v_weapon_convergence_distance_rel_increase', 'tap'], ['CONVERGENCE −', 'v_weapon_convergence_distance_rel_decrease', 'tap'], ['NEXT GROUP', 'v_weapon_preset_next', 'tap'], ['PREV GROUP', 'v_weapon_preset_prev', 'tap']];
  const SETS = {
    FLIGHT: {
      IFCS: [['COUPLED', 'v_ifcs_vector_decoupling_toggle', 'tog', L('ifcs_coupled')], ['G-SAFE', 'v_ifcs_toggle_gforce_safety', 'tog', L('ifcs_g_safe')], ['ESP', 'v_ifcs_toggle_esp', 'tog', L('ifcs_esp')], ['PRECISION MODE', 'v_auto_precision_mode_toggle', 'tog'],
        ['PROXIMITY ASSIST', 'v_ifcs_proximity_assist_toggle', 'tog'], ['GRAVITY COMP', 'v_ifcs_gravity_compensation_toggle', 'tog'], ['STABILITY', 'v_ifcs_stability_toggle', 'tog'], ['AUTOLAND', 'v_autoland', 'hold']],
      ENGINEERING: [['ENGINES MAX', 'v_engineering_assignment_engine_max', 'tap'], ['ENGINES MIN', 'v_engineering_assignment_engine_min', 'tap'], ['SHIELDS MAX', 'v_engineering_assignment_shields_max', 'tap'], ['SHIELDS MIN', 'v_engineering_assignment_shields_min', 'tap'],
        ['WEAPONS MAX', 'v_engineering_assignment_weapons_max', 'tap'], ['WEAPONS MIN', 'v_engineering_assignment_weapons_min', 'tap'], ['RESET POWER', 'v_engineering_assignment_reset', 'tap'], ['COOLERS UP', 'v_cooler_throttle_up', 'tap']],
      SHIP: [['OPEN ALL DOORS', 'v_open_all_doors', 'tap'], ['CLOSE ALL DOORS', 'v_close_all_doors', 'tap'], ['DOOR LOCKS', 'v_toggle_all_doorlocks', 'tog'], ['PORT LOCKS', 'v_toggle_all_portlocks', 'tog'],
        ['CABIN LIGHTS', 'v_toggle_cabin_lights', 'tog'], ['RUNNING LIGHTS', 'v_toggle_running_lights', 'tog'], ['HORN', 'v_horn', 'hold'], ['ATC LOADING AREA', 'v_atc_loading_area_request', 'tap']],
      MFD: MFDSEL.concat([['COMMS', 'v_mfd_select_view_comms_short', 'tap'], ['POWER', 'v_mfd_select_view_resource_network_short', 'tap'], ['IFCS', 'v_mfd_select_view_ifcs_short', 'tap'], ['SELF STATUS', 'v_mfd_select_view_self_status_short', 'tap'], ['TARGET STATUS', 'v_mfd_select_view_target_status_short', 'tap']]),
      'MFD 2': MFDSEL.concat([['CONFIG', 'v_mfd_select_view_configuration_short', 'tap'], ['DIAGNOSTICS', 'v_mfd_select_view_diagnostics_short', 'tap'], ['SCANNING', 'v_mfd_select_view_scanning_short', 'tap'], ['CAST LEFT', 'v_mfd_soft_select_cast_left_short', 'tap'], ['CAST RIGHT', 'v_mfd_soft_select_cast_right_short', 'tap']]),
      VIEW: [['LOOK BEHIND', 'v_view_look_behind', 'hold'], ['CAMERA VIEW', 'v_view_cycle_fwd', 'cyc'], ['ZOOM IN', 'v_view_zoom_in', 'tap'], ['ZOOM OUT', 'v_view_zoom_out', 'tap'],
        ['ADVANCED HUD', 'v_flight_advanced_hud_toggle', 'tog', L('advanced_hud_enabled_scm')], ['PITCH LADDER STYLE', 'v_cycle_pitch_ladder_mode', 'cyc'], ['SCOREBOARD', 'v_hud_open_scoreboard', 'hold'], ['WIPE VISOR', 'visor_wipe', 'tap']],
      TRIM: [['TRIM SET', 'v_strafe_trim_set_short', 'tap'], ['TRIM 50%', 'v_strafe_trim_set_50_short', 'tap'], ['TRIM 100%', 'v_strafe_trim_set_100_short', 'tap'], ['TRIM RESET', 'v_strafe_trim_reset_short', 'tap'],
        ['LOCK PITCH / YAW', 'v_lock_rotation', 'tog'], ['THROTTLE MODE', 'v_ifcs_throttle_swap_mode', 'cyc'], ['RESET G MAX', 'v_ifcs_reset_gmeter_max', 'tap'], ['LIMITER ON / OFF', 'v_ifcs_speed_limiter_toggle', 'tog', L('ifcs_speed_limiter')]]
    },
    COMBAT: {
      SHIELDS: [['SHIELD FRONT', 'v_shield_raise_level_forward', 'tap'], ['SHIELD BACK', 'v_shield_raise_level_back', 'tap'], ['SHIELD LEFT', 'v_shield_raise_level_left', 'tap'], ['SHIELD RIGHT', 'v_shield_raise_level_right', 'tap'],
        ['SHIELD TOP', 'v_shield_raise_level_up', 'tap'], ['SHIELD BOTTOM', 'v_shield_raise_level_down', 'tap'], ['SHIELD RESET', 'v_shield_reset_level', 'tap'], ['SHIELDS MAX POWER', 'v_engineering_assignment_shields_max', 'tap']],
      WEAPONS: WEAPONS,
      MISSILES: [['NEXT MISSILE TYPE', 'v_weapon_cycle_missile_fwd', 'tap'], ['PREV MISSILE TYPE', 'v_weapon_cycle_missile_back', 'tap'], ['MORE MISSILES', 'v_weapon_increase_max_missiles', 'tap'], ['FEWER MISSILES', 'v_weapon_decrease_max_missiles', 'tap'],
        ['RESET MISSILE COUNT', 'v_weapon_reset_max_missiles', 'tap'], ['BOMB RANGE +', 'v_weapon_bombing_hud_range_increase', 'tap'], ['BOMB RANGE −', 'v_weapon_bombing_hud_range_decrease', 'tap'], ['IMPACT POINT', 'v_weapon_bombing_toggle_desired_impact_point', 'tog']],
      DEFENCE: [['LAUNCH DECOY', 'v_weapon_countermeasure_decoy_launch', 'tap'], ['LAUNCH NOISE', 'v_weapon_countermeasure_noise_launch', 'tap'], ['PANIC DECOY', 'v_weapon_countermeasure_decoy_launch_panic', 'tap'], ['DECOY BURST +', 'v_weapon_countermeasure_decoy_burst_increase', 'tap'],
        ['DECOY BURST −', 'v_weapon_countermeasure_decoy_burst_decrease', 'tap'], ['ENGINES MAX', 'v_engineering_assignment_engine_max', 'tap'], ['WEAPONS MAX', 'v_engineering_assignment_weapons_max', 'tap'], ['RESET POWER', 'v_engineering_assignment_reset', 'tap']],
      TARGETING: TARGETING
    },
    TURRET: { TARGETING: TARGETING, WEAPONS: WEAPONS },
    UTILITY: { GENERAL: [['HUD INTERACT', 'v_hud_interact_toggle', 'tog'], ['MOUSE CURSOR', 'v_toggle_cursor_input', 'tog'], ['SCOREBOARD', 'v_hud_open_scoreboard', 'hold'], ['WIPE VISOR', 'visor_wipe', 'tap'],
      ['LOOK BEHIND', 'v_view_look_behind', 'hold'], ['ZOOM IN', 'v_view_zoom_in', 'tap'], ['ZOOM OUT', 'v_view_zoom_out', 'tap'], ['ADVANCED HUD', 'v_flight_advanced_hud_toggle', 'tog', L('advanced_hud_enabled_scm')]] },
    MINING: { SCAN: [['SCAN PING', 'v_scanning_trigger_scan', 'tap'], ['SCAN FOCUS +', 'v_inc_scan_focus_level', 'tap'], ['SCAN FOCUS −', 'v_dec_scan_focus_level', 'tap'], ['PERMANENT MODIFIER', 'v_mining_use_permanent_modifier', 'tap']] },
    SALVAGE: { TOOLS: [['SPACING AXIS', 'v_salvage_toggle_beam_spacing_axis', 'cyc'], ['GIMBAL MODE', 'v_salvage_toggle_gimbal_mode', 'tog'], ['MODIFIER LEFT', 'v_salvage_cycle_modifiers_left', 'cyc'], ['MODIFIER RIGHT', 'v_salvage_cycle_modifiers_right', 'cyc'],
      ['MODIFIER FOCUSED', 'v_salvage_cycle_modifiers_focused', 'cyc'], ['MODIFIER STRUCTURAL', 'v_salvage_cycle_modifiers_structural', 'cyc'], ['TRACTOR CLOSER', 'tractor_beam_vehicle_decrease_distance', 'tap'], ['TRACTOR FARTHER', 'tractor_beam_vehicle_increase_distance', 'tap']] }
  }; /* MINING / SALVAGE: their laser / beam power bar is gone too (the level box above sets it); MINING has 4 keys, centred at the same key size */
  const SUB = { tap: 'TAP', hold: 'HOLD', cyc: 'CYCLE', tog: 'TOGGLE', mfd: 'SCREEN' };
  /* OPPOSITES (RAZ 24 NOV late: "show me opposites of buttons like ports locked, doors locked etc"): an on/off key shows the state it is in, and turns to
     the opposite words (through the sand) when pressed - like RAISED / LOWERED on the FPS page. Live from telemetry where the game reports it (door locks,
     coupled, G-safe, ESP, advanced HUD, limiter, precision line); the others remember the last press. Lit = the first word set, dark = the second. */
  const doorLocked = () => { try { if (!(LIVEON && hasV())) return null; const s = doorL(); return s ? (/^LOCKED/.test(s) ? 'ON' : 'OFF') : null; } catch (e) { return null; } };
  const PAIR = {
    'COUPLED': ['COUPLED', 'DECOUPLED'], 'G-SAFE': ['G-SAFE ON', 'G-SAFE OFF'], 'ESP': ['ESP ON', 'ESP OFF'], 'PRECISION MODE': ['PRECISION ON', 'PRECISION OFF'],
    'PROXIMITY ASSIST': ['PROXIMITY ON', 'PROXIMITY OFF'], 'GRAVITY COMP': ['GRAV COMP ON', 'GRAV COMP OFF'], 'STABILITY': ['STABILITY ON', 'STABILITY OFF'],
    'DOOR LOCKS': ['DOORS LOCKED', 'DOORS UNLOCKED', doorLocked], 'PORT LOCKS': ['PORTS LOCKED', 'PORTS UNLOCKED'], 'CABIN LIGHTS': ['CABIN LIGHTS ON', 'CABIN LIGHTS OFF'],
    'RUNNING LIGHTS': ['RUNNING LIGHTS ON', 'RUNNING LIGHTS OFF'], 'ADVANCED HUD': ['ADV HUD ON', 'ADV HUD OFF'], 'LOCK PITCH / YAW': ['PITCH / YAW LOCKED', 'PITCH / YAW FREE'],
    'LIMITER ON / OFF': ['LIMITER ON', 'LIMITER OFF'], 'STAGGERED FIRE': ['STAGGERED ON', 'STAGGERED OFF'], 'PRECISION LINE': ['PRECISION LINE ON', 'PRECISION LINE OFF'],
    'LEAD / LAG PIP': ['LEAD PIP', 'LAG PIP'], 'HUD INTERACT': ['HUD INTERACT ON', 'HUD INTERACT OFF'], 'MOUSE CURSOR': ['CURSOR ON', 'CURSOR OFF'], 'IMPACT POINT': ['IMPACT POINT ON', 'IMPACT POINT OFF'], 'GIMBAL MODE': ['GIMBALS FREE', 'GIMBALS FIXED']
  };
  let MEM = {}; try { MEM = JSON.parse(localStorage.getItem('cmdglas-tog-mem') || '{}'); } catch (e) {}
  const Q3 = new URLSearchParams(location.search);
  let cfg = { rotate: false, sec: 10 }; try { Object.assign(cfg, JSON.parse(localStorage.getItem('cmdglas-bottom-pages') || '{}')); } catch (e) {}
  if (Q3.get('fbrot')) cfg.rotate = Q3.get('fbrot') !== '0'; if (Q3.get('fbsec')) cfg.sec = +Q3.get('fbsec');
  let mfdSel = 1; try { mfdSel = +localStorage.getItem('cmdglas-mfd-sel') || 1; } catch (e) {}
  const cur = {}; let last = Date.now(), host = null, hostMode = '';
  const curMode = () => { try { return mode; } catch (e) { return ''; } };
  const list = m => { const all = Object.keys(SETS[m] || {}); const pick = cfg[m] && cfg[m].filter(n => all.includes(n)); return pick && pick.length ? pick : all; };
  let X = 402, WD = 1648; const Y = 384, KH = 170, G = 26; /* X / WD = the key block above (SPEED LIMITER box left edge to EXIT SEAT right edge), measured at build */
  function stateOf(d) { if (d[2] === 'mfd') return +d[0].slice(-1) === mfdSel ? 'ON' : 'OFF'; const P = PAIR[d[0]]; const v = d[3] ? d[3]() : (P && P[2] ? P[2]() : null); if (v) return v; return P ? (MEM[d[1]] ? 'ON' : 'OFF') : null; }
  function fill(k, d) {
    const P = PAIR[d[0]]; k.dataset.act = d[1]; k.dataset.kind = d[2]; k.dataset.opp = P ? d[0] : '';
    const s = stateOf(d), km = (window.__keyModes || {})[hostMode + '|' + d[0]]; { const lab = P ? (s === 'ON' ? P[0] : P[1]) : d[0], el = k.querySelector('.bpl'); el.innerHTML = typeof st === 'function' ? st(lab) : lab; el.dataset.l = lab; } /* 25 NOV: words on their own lines like the deck's keys, so the sand draws them where they sit (no spill across keys) */ k.querySelector('.bps').textContent = P ? (km || SUB[d[2]]) : (s || km || SUB[d[2]]); k.classList.toggle('lit', s === 'ON'); k.classList.toggle('bpoff', s === 'OFF'); k._st = s;
  }
  function power(hide) { const A = document.getElementById('area'); if (!A) return; [...A.children].forEach(e => { if (e.id !== 'fbhost' && e.querySelector('[data-num]') && parseFloat(e.style.top) >= 380) e.style.display = hide ? 'none' : ''; }); }
  function show(anim) {
    if (!host || !host.isConnected) return; const m = hostMode, Ls = list(m); cur[m] = ((cur[m] || 0) % Ls.length + Ls.length) % Ls.length; const name = Ls[cur[m]], defs = SETS[m][name];
    const keys = [...host.querySelectorAll('.bpk')];
    const strip = () => { host.querySelector('.fbdots').innerHTML = Ls.length > 1 ? Ls.map((n, i) => `<i data-i="${i}" class="${i === cur[m] ? 'on' : ''}"><b>${n}</b></i>`).join('') : ''; };
    if (anim && typeof keyMorph === 'function') { const o = { ks: 1 }; keys.forEach((k, i) => keyMorph(k, () => fill(k, defs[i]), o)); strip(); }
    else { keys.forEach((k, i) => fill(k, defs[i])); strip(); }
    last = Date.now();
  }
  function build(m) {
    const area = document.getElementById('area'); if (!area) return;
    const bx = window.__mainBox && window.__mainBox(); if (bx) { X = bx.l; WD = bx.r - bx.l; } const KW = (WD - 7 * G) / 8, NK = (SETS[m][list(m)[0]] || []).length, x0 = (WD - (NK * KW + (NK - 1) * G)) / 2; /* 24 NOV: "why is coupled not aligned with speed limiter" - the row spans the block exactly */
    host = document.createElement('div'); host.id = 'fbhost'; hostMode = m;
    host.style.cssText = `position:absolute;left:${X}px;top:${Y}px;width:${WD}px;height:300px;z-index:6;pointer-events:none`;
    /* 25 NOV RAZ: "on the utility page edge deck ... even out the top and bottom row": UTILITY has 9 keys on top, so the bottom row takes the top keys' size + gap and sits centred under them */
    let uW = KW, uH = KH, uG = G, ux0 = x0; if (m === 'UTILITY') { const tk = [...area.children].filter(e => e.classList && e.classList.contains('nb') && !e.classList.contains('dz') && e.offsetWidth && parseFloat(e.style.top) < 380 && parseFloat(e.style.left) >= X - 2); if (tk.length > 1) { tk.sort((p, q) => parseFloat(p.style.left) - parseFloat(q.style.left)); uW = parseFloat(tk[0].style.width); uH = parseFloat(tk[0].style.height); uG = parseFloat(tk[1].style.left) - parseFloat(tk[0].style.left) - uW; ux0 = (WD - (NK * uW + (NK - 1) * uG)) / 2; } }
    host.innerHTML = [...Array(NK)].map((_, i) => `<div class="nb k bpk" style="left:${ux0 + i * (uW + uG)}px;top:14px;width:${uW}px;height:${uH}px;border-radius:26px;pointer-events:auto">` +
      `<div data-mc style="display:flex;flex-direction:column;align-items:center;gap:10px"><div class="kplate nt bpl" style="font-size:22px;line-height:1.1;text-align:center"></div><div class="kplate ns bps" style="font-size:14px"></div></div></div>`).join('') + '<div class="fbdots"></div>';
    area.appendChild(host); if (typeof holoize === 'function') holoize(host);
    power(true);
    const dots = host.querySelector('.fbdots'); let lp = null;
    dots.addEventListener('pointerdown', () => { lp = setTimeout(() => { lp = 'done'; if (window.__tocCaution) window.__tocCaution(); }, 1100); });
    dots.addEventListener('pointerup', e => { if (lp === 'done') { lp = null; return; } clearTimeout(lp); lp = null; const d = e.target.closest('i'); if (!d) return; cur[hostMode] = +d.dataset.i; show(true); });
    host.addEventListener('pointerup', e => { const k = e.target.closest('.bpk'); if (!k) return; last = Date.now();
      if (k.dataset.opp) { const Ls = list(hostMode), d = SETS[hostMode][Ls[cur[hostMode] || 0]].find(x => x[0] === k.dataset.opp); const P = PAIR[k.dataset.opp];
        if (d && !(d[3] && d[3]()) && !(P[2] && P[2]())) { MEM[d[1]] = !MEM[d[1]]; try { localStorage.setItem('cmdglas-tog-mem', JSON.stringify(MEM)); } catch (x) {} if (typeof keyMorph === 'function') keyMorph(k, () => fill(k, d)); else fill(k, d); } }
      if (k.dataset.kind === 'mfd') { mfdSel = +(k.querySelector('.bpl').dataset.l || k.querySelector('.bpl').textContent).slice(-1); try { localStorage.setItem('cmdglas-mfd-sel', mfdSel); } catch (x) {} }
      window.dispatchEvent(new CustomEvent('cmdglas-action', { detail: { action: k.dataset.act } })); });
    show(false);
  }
  const tick = () => {
    const m = curMode();
    if (!SETS[m]) { if (host && host.isConnected) host.remove(); host = null; if (m === 'UTILITY') power(true); return; } /* 24 NOV: no power bars on UTILITY either */
    if (!host || !host.isConnected || hostMode !== m) { if (host && host.isConnected) host.remove(); build(m); return; }
    /* live states: a key whose state changed morphs like every other deck key */
    const Ls = list(m), defs = SETS[m][Ls[cur[m] || 0]];
    host.querySelectorAll('.bpk').forEach((k, i) => { const d = defs[i]; if (!d) return; const s = stateOf(d); if (s !== k._st) { if (typeof keyMorph === 'function') keyMorph(k, () => fill(k, d)); else fill(k, d); } });
    let b = false; try { b = busy; } catch (e) {}
    if (cfg.rotate && Ls.length > 1 && Date.now() - last > cfg.sec * 1000 && !b) { cur[m] = (cur[m] || 0) + 1; show(true); }
  };
  addEventListener('storage', e => { if (e.key === 'cmdglas-bottom-pages') { try { cfg = Object.assign({ rotate: false, sec: 10 }, JSON.parse(e.newValue)); } catch (x) {} if (host) show(true); } });
  setInterval(tick, 400); (window.__layoutHooks = window.__layoutHooks || []).push(() => { host = null; tick(); });
  window.__flightBottom = { sets: SETS, get cfg() { return cfg; }, go: n => { const Ls = list(hostMode), i = Ls.indexOf(n); if (i >= 0) { cur[hostMode] = i; show(true); } } };
})();

/* MENU HIDES + EJECT CLOSER (chat 2, 24 NOV late). RAZ: "make the menu block on the far left, flight through ship power, disappear when not clicked on.
   also the eject and self destruct buttons are too far away".
   - The page column (FLIGHT ... MORE + SHIP POWER) is hidden. One glass key in its place shows the page you are on; tap it = the column appears, pick a
     page (or leave it 5 s) = it hides again.
   - EJECT and SELF DESTRUCT sit 40 px right of the last key on every page (they were about 115 px away). */
(function () {
  let openT = null;
  const groupName = () => { const t = document.querySelector('#chrome .tab.left.on'); if (!t) return ''; const g = t.querySelector('.gseg.on'); if (!g) return t.textContent.replace(/[^A-Z ]/g, '').trim(); const s = g.textContent.trim(); return s === 'COMBAT' ? 'COMBAT' : s === 'TURRET' ? 'COMBAT · TURRET' : 'INDUSTRIAL · ' + s; };
  function handle() {
    const ch = document.getElementById('chrome'); if (!ch) return null;
    let h = ch.querySelector('.menuhandle');
    if (!h) { h = document.createElement('div'); h.className = 'tab left on menuhandle'; h.style.cssText = 'left:77px;top:40px;width:220px;height:62px'; ch.appendChild(h);
      if (typeof holoize === 'function') holoize(ch);
      h.addEventListener('click', e => { e.stopPropagation(); open(); }); }
    const n = groupName(); if (h._n !== n) { h._n = n; let b = h.querySelector('.mhl'); if (!b) { b = document.createElement('b'); b.className = 'mhl'; h.appendChild(b); } b.innerHTML = '<i class="mhi"></i><span>' + n.replace(' · ', '<br>') + '</span>'; }
    return h;
  }
  function open() { document.body.classList.add('menuopen'); arm(); }
  function close() { document.body.classList.remove('menuopen'); clearTimeout(openT); }
  function arm() { clearTimeout(openT); openT = setTimeout(close, 5000); }
  document.addEventListener('pointerdown', e => { if (!document.body.classList.contains('menuopen')) return; const t = e.target.closest && e.target.closest('#chrome .tab.left, #chrome .gseg, #plant'); if (t) { setTimeout(close, 900); return; } if (!(e.target.closest && e.target.closest('.menuhandle'))) close(); }, true);
  /* 24 NOV late: "the far right two buttons throw the whole thing off" - mirror: page key + SHIP POWER on the left, EJECT + SELF DESTRUCT on the right,
     same size, same 40 px gap to the key block, the whole group centred on the Holo. */
  function mainBox() {
    const A = document.getElementById('area'); if (!A) return null; let l = 1e9, r = 0;
    [...A.children].forEach(e => { if (e.id === 'fbhost' || e.id === 'plant' || e.classList.contains('dz') || e.classList.contains('frame') || !e.offsetWidth || !e.classList.contains('nb')) return;
      const y = e.offsetTop; if (y < 100 || y > 380) return; l = Math.min(l, e.offsetLeft); r = Math.max(r, e.offsetLeft + e.offsetWidth); });
    return r > l ? { l, r } : null;
  }
  window.__mainBox = mainBox; window.__atcSides = sides; /* 25 NOV: run on a page redraw too (see spread observer) */
  function sides() {
    const A = document.getElementById('area'), C = document.getElementById('chrome'); if (!A) return;
    let m = ''; try { m = mode; } catch (e) {}
    if (m === 'FPS') { A.style.transform = ''; if (C) C.style.transform = ''; return; }
    const box0 = mainBox(); if (!box0) return; const box = Object.assign({}, box0, { l: Math.min(box0.l, 406), r: Math.max(box0.r, 2046) }); /* 25 NOV (RAZ: "it shifts right and left"): one frame for every page (the widest: UTILITY / TELEMETRY / MORE), so FLIGHT, SHIP POWER, EJECT and SELF DESTRUCT keep one place */
    const dz = [...A.querySelectorAll('.dz')].filter(e => /EJECT|SELF/.test(e.textContent)).sort((a, b) => a.offsetTop - b.offsetTop); if (dz.length < 2) return;
    const Wd = dz[0].offsetWidth, Hd = dz[0].offsetHeight, GAP = 40;
    dz.forEach(e => { const w = (box.r + GAP) + 'px'; if (e.style.left !== w) e.style.left = w; });
    const fr = [...A.children].find(e => /redzone/.test(e.className)); if (fr) fr.style.display = 'none';
    let lx = box.l - GAP - Wd; const h = C && C.querySelector('.menuhandle'), pl = document.getElementById('plant');
    [[h, dz[0]], [pl, dz[1]]].forEach(([e, ref]) => { if (!e) return; Object.assign(e.style, { left: lx + 'px', top: ref.offsetTop + 'px', width: Wd + 'px', height: Hd + 'px', borderRadius: getComputedStyle(ref).borderRadius }); });
    if (C) { const tw = (C.querySelector('.tab.left:not(.menuhandle)') || {}).offsetWidth || 220; C.style.setProperty('--mx', Math.round(lx + (Wd - tw) / 2 - 77) + 'px'); } /* the column opens in the left slot, not over it */
    const cx = Math.round(1280 - (box.l + box.r) / 2) + 'px'; [A, C].forEach(e => { if (e && e.style.transform !== `translateX(${cx})`) e.style.transform = `translateX(${cx})`; });
  }
  const tick = () => {
    let m = ''; try { m = mode; } catch (e) {}
    if (m !== tick.m) { if (tick.m !== undefined && document.body.classList.contains('menuopen')) setTimeout(close, 900); tick.m = m; } /* a page picked = the column hides */
    document.body.classList.add('menuhid'); /* 25 NOV: the folded page menu on every page, FPS included */
    handle(); /* 25 NOV fix (RAZ: "I select another page, fps page is half missing and I have no access to the top left menu button"): the page key stays on FPS too - it is the only way back to the other pages */
    sides();
  };
  setInterval(tick, 400); (window.__layoutHooks = window.__layoutHooks || []).push(() => setTimeout(tick, 0));
})();

/* KEY BEHAVIOUR (chat 2, 24 NOV late). RAZ: "make sure all buttons have the buttons to adjust tap hold or toggle, i don't see that button".
   The choice lives in the TOC (all settings are adjusted in the TOC): every key on every page gets TAP / HOLD / TOGGLE / DOUBLE TAP.
   The Holo writes its full key list for the TOC (cmdglas-key-list) and reads the choices (cmdglas-key-modes {"PAGE|KEY": "HOLD"}); the word under each key
   name shows the choice at once. Keys that show a live state (GEAR DOWN, DOORS CLOSED, ON / OFF) keep showing the state; the choice is still kept.
   Sending the key the chosen way = wiring (chat 3 / chat 8). */
(function () {
  const MW = ['TAP', 'HOLD', 'TOGGLE', 'DOUBLE TAP'];
  const read = () => { try { return JSON.parse(localStorage.getItem('cmdglas-key-modes') || '{}'); } catch (e) { return {}; } };
  window.__keyModes = read();
  const clean = s => String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const base = {}; /* the deck's own word per key, kept so a removed choice goes back to it */
  function apply() {
    let M; try { M = MODES; } catch (e) { return; }
    Object.keys(M).forEach(m => (M[m].keys || []).forEach((k, i) => { const id = m + '|' + clean(k[1]); if (!(id in base)) base[id] = k[2]; const c = window.__keyModes[id]; if (MW.includes(base[id]) || base[id] === '') k[2] = c || base[id]; }));
  }
  function publish() {
    let M; try { M = MODES; } catch (e) { return; }
    const list = {};
    Object.keys(M).forEach(m => { list[m] = (M[m].keys || []).map(k => [clean(k[1]), MW.includes(base[m + '|' + clean(k[1])]) ? base[m + '|' + clean(k[1])] : (k[3] ? 'TOGGLE' : 'TAP')]).filter(k => k[0]); });
    const S = window.__flightBottom && window.__flightBottom.sets;
    if (S) Object.keys(S).forEach(m => Object.keys(S[m]).forEach(pg => S[m][pg].forEach(d => { const nm = d[0]; (list[m] = list[m] || []); if (!list[m].some(x => x[0] === nm)) list[m].push([nm, { tap: 'TAP', hold: 'HOLD', tog: 'TOGGLE', cyc: 'TAP', mfd: 'TAP' }[d[2]] || 'TAP', pg]); })));
    try { localStorage.setItem('cmdglas-key-list', JSON.stringify(list)); } catch (e) {}
  }
  apply(); setTimeout(() => { apply(); publish(); }, 1500);
  addEventListener('storage', e => { if (e.key !== 'cmdglas-key-modes') return; window.__keyModes = read(); apply(); try { if (typeof layout === 'function') layout(); if (typeof paintStates === 'function') paintStates(); } catch (x) {} });
})();

/* PIN 1 / 2 / 3 (chat 2, 25 NOV). RAZ: "once the target is pinned it'll be double tap or hold to unpin depending on user setup".
   The game sends NO target or pin data (chat 8 field list, LIVE 4.10), so the deck remembers its own pins: a tap pins (key lights, word PINNED);
   while pinned a tap does nothing, so a stray touch never unpins. Unpin = HOLD 0.6 s (default) or DOUBLE TAP, the TOC setting cmdglas-unpin ("HOLD" | "DOUBLE TAP").
   CLEAR ALL PINS empties all three. Pins are not saved: a new game session starts with none. Sending the key itself = wiring (chat 3 / chat 8). */
(function () {
  const pins = { 1: false, 2: false, 3: false }; let last = { n: 0, t: 0 }, hold = null;
  const how = () => { try { return localStorage.getItem('cmdglas-unpin') === 'DOUBLE TAP' ? 'DOUBLE TAP' : 'HOLD'; } catch (e) { return 'HOLD'; } };
  const nm = k => ((k.querySelector('.nt') || {}).innerHTML || '').replace(/<br[^>]*>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); /* words sit on their own lines (<br>) */
  const pinOf = k => { const m = /^PIN ([123])$/.exec(nm(k)); return m ? +m[1] : 0; };
  function paint() {
    document.querySelectorAll('#deck .nb.k').forEach(k => { const n = pinOf(k); if (!n) return; const on = pins[n], s = k.querySelector('.ns'); k.classList.toggle('pinned', on);
      if (s && !k._hint) { const w = on ? 'PINNED' : ((window.__keyModes || {})['COMBAT|PIN ' + n] || 'TAP'); if (s.textContent !== w) s.textContent = w; } });
  }
  function hint(k) { const s = k.querySelector('.ns'); if (!s) return; k._hint = 1; s.textContent = how() === 'HOLD' ? 'HOLD TO UNPIN' : 'DOUBLE TAP TO UNPIN'; clearTimeout(k._ht); k._ht = setTimeout(() => { k._hint = 0; paint(); }, 1400); }
  function unpin(n, k) { pins[n] = false; k._hint = 0; clearTimeout(k._ht); paint(); }
  document.addEventListener('pointerdown', e => { const k = e.target.closest && e.target.closest('#deck .nb.k'); if (!k) return; const n = pinOf(k);
    if (!n) { if (nm(k) === 'CLEAR ALL PINS') { pins[1] = pins[2] = pins[3] = false; paint(); } return; }
    if (pins[n] && how() === 'HOLD') { clearTimeout(hold); hold = setTimeout(() => { hold = null; unpin(n, k); k._held = 1; }, 600); } }, true);
  const up = e => { const k = e.target.closest && e.target.closest('#deck .nb.k'); const n = k ? pinOf(k) : 0; if (hold) { clearTimeout(hold); hold = null; }
    if (!n) return; if (k._held) { k._held = 0; return; } const now = Date.now();
    if (!pins[n]) { pins[n] = true; last = { n, t: now }; paint(); return; }
    if (how() === 'DOUBLE TAP' && last.n === n && now - last.t < 380) { last = { n: 0, t: 0 }; unpin(n, k); return; }
    last = { n, t: now }; hint(k); };
  document.addEventListener('pointerup', up, true); document.addEventListener('pointercancel', () => { if (hold) { clearTimeout(hold); hold = null; } }, true);
  setInterval(paint, 400); window.__pins = pins;
})();

/* STREAM DECK BACK / NEXT (chat 2, 25 NOV; MASTER's ask, host part by chat 3 lock 399): the Holo page posts {type:'cmdglas-deck-step', dir:-1|1} into this
   deck. One step = the next / previous key page of the current mode (IFCS -> ENGINEERING -> ... on FLIGHT, SHIELDS -> WEAPONS -> ... on COMBAT), exactly like
   tapping the page names, with the same transition; wraps round. Only in the PC Holo (framed, not the Edge); ignored while a menu or sheet is open. */
(function () {
  const Q = new URLSearchParams(location.search);
  if (window === window.top || Q.get('edge') === '1') return;
  addEventListener('message', e => {
    const d = e.data; if (!d || d.type !== 'cmdglas-deck-step' || (d.dir !== 1 && d.dir !== -1)) return;
    if (/\b(menuopen|moreopen|telemfloat|telemopen|travelopen|cfgopen)\b/.test(document.body.className)) return;
    const dots = [...document.querySelectorAll('#fbhost .fbdots i')]; if (dots.length < 2) return;
    const i = dots.findIndex(x => x.classList.contains('on')), j = ((i < 0 ? 0 : i) + d.dir + dots.length) % dots.length;
    dots[j].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); dots[j].dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
  });
})();

/* HOLO FPS SHAPE (chat 2, 25 NOV). RAZ: "fps page transformation is still wrong on the onscreen holo display. it still cuts of most of the fps page and it has
   buttons out in the middle of nowhere and it's missing the buttons". Chat 3 read his Holo: on FPS the window shape had ONE box. The Holo builds its window shape
   from the boxes of #area's children; the EQUIPMENT panel's own box is smaller than what it draws (the MOBIGLAS / RESPAWN / DROP ITEM column and the key
   column sit outside it), so those parts fell outside the shape. Fix: a clear, click-through box (#fpsShape) in #area that always covers everything the panel
   draws, so the shape includes all of it. Also: choosing another page from the menu closes an open TELEMETRY float, so it can't stay over the FPS page. */
(function () {
  let pad = null, lastMode = '';
  const curMode = () => { try { return mode; } catch (e) { return ''; } };
  setInterval(() => {
    const m = curMode();
    if (m !== lastMode) { if (lastMode && document.body.classList.contains('telemfloat') && window.__telemFloat) window.__telemFloat.close(); lastMode = m; }
    const area = document.getElementById('area'), panel = document.querySelector('#area .eqpanel');
    if (!area || !panel || !panel.isConnected) { if (pad && pad.isConnected) pad.remove(); pad = null; return; }
    const ar = area.getBoundingClientRect(), s = (ar.width / (area.offsetWidth || 1)) || 1; let L = 1e9, T = 1e9, R = -1e9, Bm = -1e9;
    [panel, ...panel.querySelectorAll('*')].forEach(e => { const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return; L = Math.min(L, r.left); T = Math.min(T, r.top); R = Math.max(R, r.right); Bm = Math.max(Bm, r.bottom); });
    if (!(R > L)) return;
    if (!pad || !pad.isConnected) { pad = document.createElement('div'); pad.id = 'fpsShape'; pad.style.cssText = 'position:absolute;pointer-events:none;background:transparent;z-index:0'; area.appendChild(pad); }
    const st = { left: ((L - ar.left) / s - 6).toFixed(0) + 'px', top: ((T - ar.top) / s - 6).toFixed(0) + 'px', width: ((R - L) / s + 12).toFixed(0) + 'px', height: ((Bm - T) / s + 12).toFixed(0) + 'px' };
    for (const k in st) if (pad.style[k] !== st[k]) pad.style[k] = st[k];
  }, 700);
})();

/* EDGE MORE > ON FOOT PAGE 1 (chat 2, 25 NOV). Personal Edge only (?edge=1, top window, never ?shop): FPS stays out of sale builds until after Squadron 42.
   RAZ 25 NOV: "insert the on foot telemetry page we created into the first fps page that opens under more ... this is for the deck edge only" +
   "instead of having rotating window spread those out across the edge page to permanently show" + "far left team status then the ship status as last reported
   then the utility page ... put the utility carried page next to the weapon loadout page" + his sketch (Edge ON FOOT page 20261125):
   LEFT = display-only panel (TEAM + SHIP STATUS) over a display bar (UTILITY: what is carried / what to buy), CENTRE = WEAPON PICKER (weapon loadout + utility
   carried beside it), RIGHT = regular-size keys. "the weapon loadout switches to the equipment loadout that shows multitool upon double tap or long press or
   1 small motif matching dot ... to press to change that content". The old ON FOOT key pages follow as pages 2+ (no key lost). */
(function () {
  const Q = new URLSearchParams(location.search);
  if (Q.get('edge') !== '1' || Q.has('shop')) return; /* also inside chat 3's iCUE widget frame */
  const IMG = n => `<img class="eqimg" src="fps-icons/${n}.png" alt="">`;
  const COLS = { vg: '#14ff63', va: '#ffae00', vr: '#a00d22', '': '#3dabff' };
  const lvlc = v => v <= 25 ? 'vr' : v <= 50 ? 'va' : 'vg';
  const pills = (v, c) => `<div class="ofpc">${[...Array(10)].map((_, i) => `<i class="${i < Math.round(v / 10) ? 'on' : ''}" style="--c:${COLS[c]}"></i>`).join('')}</div>`;
  /* SAMPLE until the crew link (chat 8) sends team + ship data */
  const TEAM = []; /* 25 NOV real data only: filled by the crew link when it sends team data; until then NO DATA */
  const SHIP = null; /* real data only: no ship report yet -> NO DATA */
  const UTIL = [['medpen', 'MEDPEN', null, null], ['mag', 'MAGAZINE', null, null], ['canister', 'O2 REFILL', null, null], ['medgun', 'MED GUN AMMO', null, null]]; /* real data only: counts come from the game when it sends them */ /* name, have, want: have < want = BUY */
  const WEAP = [['rifle', '1', 'PRIMARY', '—'], ['smg', '2', 'SECONDARY', '—'], ['pistol', '3', 'SIDEARM', '—']]; /* real data only: weapon names come from the game */
  const CARRY = [['medgun', 'MED GUN'], ['medpen', 'MEDPEN'], ['gadget', 'GADGET'], ['multitool', 'MULTITOOL'], ['knife', 'KNIFE'], ['FL', 'FLASHLIGHT']];
  const EQUIP = [['multitool', '4', 'MULTITOOL', '—'], ['knife', '', 'KNIFE', ''], ['gadget', '', 'GADGET', '']];
  const MODS = [['MINING', 0], ['TRACTOR', 0], ['MEDICAL', 0], ['SALVAGE', 0]];
  const FL = '<svg viewBox="0 0 64 40"><path d="M6 15h28l10-7h14v24H44l-10-7H6z" fill="#e8f4ff"/><path d="M12 18h16v4H12z" fill="#071a2c"/></svg>';
  const can = '<svg viewBox="0 0 40 40"><rect x="15" y="7" width="10" height="28" rx="3" fill="#e8f4ff"/><rect x="16.5" y="3" width="7" height="5" rx="1" fill="#e8f4ff"/></svg>';
  const ico = n => n === 'FL' ? FL : n === 'canister' ? can : IMG(n);
  /* regular-size keys on the right = the loadout screen's action keys (same symbols as the EQUIPMENT panel), bigger */
  const KEYS = [['HELMET ON', 'HELMET OFF'], ['RAISED', 'LOWERED'], ['RELOAD'], ['FIRE MODE'], ['HOLSTER WEAPON', 'HOLSTERED'], ['FISTS'], ['DROP ITEM'], ['STORE ALL'], ['EXIT SEAT'], ['OPEN INVENTORY'], ['OPEN MOBIGLAS'], ['OPEN STARMAP'], ['OPEN CONTRACTS'], ['OPEN COMMS'], ['OPEN CHAT'], ['INTERACT WHEEL']]; /* RAZ: "add open inventory, open mobi" + suggested opens (his to swap) */ /* 25 NOV RAZ: "add drop item, store all commodityies and ... exit seat" (Edge FPS page; the MORE sheet keeps its 6) */
  const KS = KEYS.map(() => 0);
  let pick = 'weapons', sel = 'PRIMARY'; /* the slot in hand is lit, the rest dimmed (RAZ 24 NOV); the game sends no FPS state yet, so the last slot tapped here */

  const css = document.createElement('style');
  css.textContent = `
:is(#more,#offps) .ofnd{flex:1;display:grid;place-items:center;min-height:120px;font:500 18px Oxanium,'Segoe UI',sans-serif;letter-spacing:5px;color:rgba(214,235,255,.45)}
:is(#more,#offps) .ofp{position:absolute;z-index:3;border-radius:34px;border:2px solid rgba(53,168,255,.85);background:linear-gradient(180deg,rgba(4,12,22,.82),rgba(0,3,7,.9));
  box-shadow:0 0 4px #1f9eff,0 0 16px rgba(31,158,255,.25),inset 0 0 18px rgba(31,158,255,.12);font-family:Oxanium,'Segoe UI',sans-serif;color:#d6ebff;box-sizing:border-box}
:is(#more,#offps) .ofp h4{margin:0;font:500 17px/1 Oxanium,'Segoe UI',sans-serif;letter-spacing:5px;color:#eaf5ff;text-shadow:0 0 6px #1f9eff;display:flex;align-items:center;gap:12px}
:is(#more,#offps) .ofp h4::before,:is(#more,#offps) .ofp h4::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(61,171,255,.8),transparent)}
:is(#more,#offps) .ofp em.smp{position:absolute;right:26px;bottom:10px;font:500 10px/1 Oxanium;letter-spacing:2px;color:rgba(214,235,255,.45);font-style:normal}
:is(#more,#offps) .ofcols{display:grid;grid-template-columns:1fr 1fr;gap:22px;height:100%;padding:18px 26px 26px}
:is(#more,#offps) .ofcol{display:flex;flex-direction:column;gap:10px;min-height:0}
:is(#more,#offps) .ofcard{flex:1;border-radius:14px;border:1.5px solid rgba(53,168,255,.35);background:rgba(0,4,8,.7);padding:6px 12px;display:flex;flex-direction:column;justify-content:center;gap:5px}
:is(#more,#offps) .ofcard.down{border-color:#a00d22;animation:ofblink .8s steps(1) infinite}@keyframes ofblink{50%{border-color:rgba(53,168,255,.35)}}
:is(#more,#offps) .ofrt{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:13px;letter-spacing:1px;white-space:nowrap}
:is(#more,#offps) .ofrt b{font-size:17px;font-weight:600;letter-spacing:2px;color:#fff}
:is(#more,#offps) .vr{color:#ff3048}:is(#more,#offps) .va{color:#ffae00}:is(#more,#offps) .vg{color:#14ff63}
:is(#more,#offps) .ofpc{display:flex;gap:3px;flex:1}:is(#more,#offps) .ofpc i{flex:1;height:9px;border-radius:5px;background:rgba(53,168,255,.14)}:is(#more,#offps) .ofpc i.on{background:var(--c);box-shadow:0 0 5px var(--c)}
:is(#more,#offps) .ofrp{display:flex;align-items:center;gap:10px;font-size:13px}:is(#more,#offps) .ofrp span{width:44px;text-align:right}
:is(#more,#offps) .ofship b.big{font-size:24px;letter-spacing:4px;color:#fff;font-weight:600}
:is(#more,#offps) .ofutil{display:flex;flex-direction:column;height:100%;padding:16px 26px 20px;gap:12px}
:is(#more,#offps) .ofurow{flex:1;display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
:is(#more,#offps) .ofu{border-radius:14px;border:1.5px solid rgba(53,168,255,.35);background:rgba(0,4,8,.7);display:grid;grid-template-columns:52px 1fr;align-items:center;padding:4px 10px;gap:6px}
:is(#more,#offps) .ofu img,:is(#more,#offps) .ofu svg{max-width:46px;max-height:40px;filter:drop-shadow(0 0 4px rgba(31,158,255,.85))}
:is(#more,#offps) .ofu div{display:flex;flex-direction:column;gap:3px;font-size:11px;letter-spacing:1px}:is(#more,#offps) .ofu b{font-size:22px;color:#fff;font-weight:600}
:is(#more,#offps) .ofu.buy{border-color:rgba(255,174,0,.7)}
:is(#more,#offps) .ofpick{display:flex;flex-direction:column;padding:16px 24px 18px;gap:12px;touch-action:none}
:is(#more,#offps) .ofpg{flex:1;display:grid;grid-template-columns:1.35fr 1fr;gap:20px;min-height:0}
:is(#more,#offps) .ofpg .ofcol h5{margin:0 0 2px;font:500 14px/1 Oxanium;letter-spacing:3px;color:rgba(214,235,255,.75);text-align:center}
:is(#more,#offps) .ofslot{flex:1;position:relative;border-radius:16px;border:2px solid #35a8ff;background:rgba(8,20,32,.7);display:grid;place-items:center;cursor:pointer;box-shadow:inset 0 0 12px rgba(31,158,255,.15);overflow:hidden}
:is(#more,#offps) .ofslot img.eqimg{max-width:62%;max-height:58%;filter:drop-shadow(0 0 5px rgba(31,158,255,.9))}
:is(#more,#offps) .ofslot .l{position:absolute;left:14px;bottom:8px;font-size:15px;letter-spacing:2px;color:#fff}
:is(#more,#offps) .ofslot .n{position:absolute;right:14px;top:8px;font-size:20px;font-weight:600;color:#fff;text-shadow:0 0 6px #1f9eff}
:is(#more,#offps) .ofslot .w{position:absolute;left:14px;top:9px;font-size:13px;letter-spacing:1.5px;color:rgba(214,235,255,.7)}
:is(#more,#offps) .ofslot.dim{opacity:.5;filter:saturate(.5)}:is(#more,#offps) .ofslot.on{border-color:#9fd2ff;box-shadow:0 0 10px #1f9eff,inset 0 0 18px rgba(31,158,255,.35)}
:is(#more,#offps) .ofgrid{flex:1;display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:1fr;gap:10px;min-height:0}
:is(#more,#offps) .ofgrid .ofslot img.eqimg,:is(#more,#offps) .ofgrid .ofslot svg{max-width:58%;max-height:46%}:is(#more,#offps) .ofgrid .ofslot .l{left:0;right:0;text-align:center;font-size:13px;letter-spacing:1px}
:is(#more,#offps) .ofgrid .ofslot{place-items:start center;padding-top:16%}
:is(#more,#offps) .ofmod{flex:1;border-radius:14px;border:1.5px solid rgba(53,168,255,.35);display:flex;align-items:center;justify-content:center;font-size:13px;letter-spacing:2px}:is(#more,#offps) .ofmod.on{border-color:#35a8ff;color:#fff;box-shadow:0 0 8px rgba(31,158,255,.5)}
:is(#more,#offps) .ofdotrow{display:flex;justify-content:center;align-items:center;gap:14px;font-size:13px;letter-spacing:2px;color:rgba(214,235,255,.7);height:28px}
:is(#more,#offps) .ofdot{width:26px;height:26px;display:grid;place-items:center;cursor:pointer}
:is(#more,#offps) .ofdot i{width:13px;height:13px;transform:rotate(45deg);border:1.5px solid #3dabff;background:rgba(53,168,255,.25);box-shadow:0 0 6px #1f9eff;transition:background .2s}
:is(#more,#offps) .ofdot.eq i{background:#3dabff}
:is(#more,#offps) .ofph{display:flex;align-items:center;justify-content:space-between;padding:12px 40px 0;font:500 17px/1 Oxanium,'Segoe UI',sans-serif;letter-spacing:4px;color:#eaf5ff;text-shadow:0 0 6px #1f9eff}
:is(#more,#offps) .ofph span{flex:1;text-align:center}
:is(#more,#offps) .ofpk{z-index:4}:is(#more,#offps) .ofpki{display:flex;align-items:center;justify-content:center;gap:16px;height:100%;padding:0 18px;box-sizing:border-box}
:is(#more,#offps) .ofpk.wide img.eqimg{max-width:46%;max-height:64%;filter:drop-shadow(0 0 5px rgba(31,158,255,.9))}
:is(#more,#offps) .ofpk.wide .ofpkt{display:flex;flex-direction:column;align-items:flex-start;gap:6px}
:is(#more,#offps) .ofpk.wide .nt{font-size:23px!important;letter-spacing:1.5px;text-align:left;white-space:nowrap}:is(#more,#offps) .ofpk.wide .ns{font-size:17px!important;letter-spacing:2px}
:is(#more,#offps) .ofpk.small .ofpki{flex-direction:column;gap:10px;padding:0 8px}
:is(#more,#offps) .ofpk.small img.eqimg,:is(#more,#offps) .ofpk.small svg{max-width:58%;max-height:40%;filter:drop-shadow(0 0 5px rgba(31,158,255,.9))}
:is(#more,#offps) .ofpk.small .nt{font-size:22px!important;letter-spacing:1px;text-align:center;line-height:1.05!important}:is(#more,#offps) .ofpk.small .ns{font-size:15px!important}
:is(#more,#offps) .ofph .ofdot{flex:0 0 auto}
:is(#more,#offps) .ofk{position:absolute;z-index:3;border-radius:40px}
:is(#more,#offps) .ofk .ofki{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;height:100%}
:is(#more,#offps) .ofk svg{width:86px;height:86px;filter:drop-shadow(0 0 4px rgba(31,158,255,.85))}
:is(#more,#offps) .ofk .nt{font-size:20px!important;letter-spacing:2px;text-align:center;line-height:1.1!important}
:is(#more,#offps) .ofk.sel{box-shadow:0 0 12px #1f9eff}
:is(#more,#offps) .ofk.dimq{opacity:.55}
:is(#more,#offps) .ofk{border-radius:30px}
/* 25 NOV fix (RAZ: "all the on foot interior pills are missformed ... knife gadget and multitool are all misplaced"): every icon sits in the same fixed box, so the
   pictures and labels line up in every key; one key shape (30 px rounding) everywhere; the headings get a clear band above the keys */
:is(#more,#offps) .ofpk{border-radius:30px!important;overflow:hidden}
:is(#more,#offps) .ofpk.small .ofpki{display:grid!important;grid-template-rows:72px 30px;place-items:center;align-content:center;gap:10px!important;padding:0 10px!important}
:is(#more,#offps) .ofpk.small img.eqimg,:is(#more,#offps) .ofpk.small .ofpki>svg{width:72px!important;height:72px!important;max-width:none!important;max-height:none!important;object-fit:contain}
:is(#more,#offps) .ofpk.small .nt{font-size:20px!important;line-height:30px!important;white-space:nowrap}
:is(#more,#offps) .ofpk.wide .ofpki{display:grid!important;grid-template-columns:130px 1fr;align-items:center;justify-items:start;gap:16px!important;padding:0 20px!important}
:is(#more,#offps) .ofpk.wide .nt{font-size:20px!important;white-space:nowrap}:is(#more,#offps) .ofpk.wide .ns{font-size:15px!important}
:is(#more,#offps) .ofpk.wide img.eqimg{width:130px!important;height:84px!important;max-width:none!important;max-height:none!important;object-fit:contain;justify-self:center}
:is(#more,#offps) .ofph{position:relative;z-index:5;min-height:30px;align-items:center}
`;
  document.head.appendChild(css);

  /* symbols: the same solid holo symbols as the EQUIPMENT panel's action keys (atc-states.js AI set) */
  const S_NEW = {
    'DROP ITEM': '<path d="M14 20h36v30q0 4-4 4H18q-4 0-4-4z" fill="#d6ebff"/><path d="M32 6v24M22 21l10 10 10-10" fill="none" stroke="#071a2c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 6v24M22 21l10 10 10-10" fill="none" stroke="#d6ebff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
    'STORE ALL': '<rect x="8" y="34" width="22" height="18" rx="3" fill="#d6ebff"/><rect x="34" y="34" width="22" height="18" rx="3" fill="#d6ebff"/><rect x="21" y="12" width="22" height="18" rx="3" fill="#d6ebff"/><path d="M8 41h22M34 41h22M21 19h22" stroke="#071a2c" stroke-width="2"/>',
    'OPEN INVENTORY': '<path d="M20 14q0-8 12-8t12 8v4H20z" fill="none" stroke="#d6ebff" stroke-width="4"/><rect x="12" y="18" width="40" height="38" rx="8" fill="#d6ebff"/><rect x="20" y="34" width="24" height="12" rx="3" fill="#071a2c"/>',
    'OPEN MOBIGLAS': '<rect x="10" y="16" width="44" height="32" rx="6" fill="#d6ebff"/><rect x="16" y="22" width="32" height="20" rx="3" fill="#071a2c"/><path d="M20 28h16M20 34h24" stroke="#d6ebff" stroke-width="2.5"/><path d="M24 48v8M40 48v8" stroke="#d6ebff" stroke-width="4"/>',
    'OPEN STARMAP': '<circle cx="32" cy="32" r="10" fill="#d6ebff"/><ellipse cx="32" cy="32" rx="26" ry="10" fill="none" stroke="#d6ebff" stroke-width="3" transform="rotate(-20 32 32)"/><circle cx="55" cy="24" r="4" fill="#d6ebff"/>',
    'OPEN CONTRACTS': '<rect x="14" y="10" width="36" height="46" rx="5" fill="#d6ebff"/><rect x="24" y="6" width="16" height="8" rx="2" fill="#d6ebff"/><path d="M21 26h22M21 34h22M21 42h14" stroke="#071a2c" stroke-width="3"/>',
    'OPEN COMMS': '<path d="M32 30v26" stroke="#d6ebff" stroke-width="4"/><circle cx="32" cy="26" r="5" fill="#d6ebff"/><path d="M20 14q-8 12 0 24M44 14q8 12 0 24M13 8q-13 18 0 36M51 8q13 18 0 36" fill="none" stroke="#d6ebff" stroke-width="3" stroke-linecap="round"/>',
    'OPEN CHAT': '<path d="M8 14q0-6 6-6h36q6 0 6 6v24q0 6-6 6H26l-12 10V44h0q-6 0-6-6z" fill="#d6ebff"/><path d="M18 22h28M18 30h20" stroke="#071a2c" stroke-width="3"/>',
    'INTERACT WHEEL': '<circle cx="32" cy="32" r="24" fill="none" stroke="#d6ebff" stroke-width="8" stroke-dasharray="30 8"/><circle cx="32" cy="32" r="7" fill="#d6ebff"/>',
    'EXIT SEAT': '<path d="M14 8h14q4 0 4 4v22h12q4 0 4 4v18H40V42H24q-6 0-8-6z" fill="#d6ebff"/><path d="M44 12h12M50 6l6 6-6 6" fill="none" stroke="#d6ebff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' };
  const S = {
    'HELMET ON': '<path d="M10 40C10 16 24 8 32 8s22 8 22 32l-4 10-10 6H24l-10-6z M15 30c1-10 9-15 17-15s16 5 17 15c0 6-5 9-17 9s-17-3-17-9z" fill="#d6ebff" fill-rule="evenodd"/><path d="M26 47h12M28 51h8" fill="none" stroke="#071a2c" stroke-width="2.4" stroke-linecap="round"/>',
    'HELMET OFF': '<g opacity=".45"><path d="M10 40C10 16 24 8 32 8s22 8 22 32l-4 10-10 6H24l-10-6z M15 30c1-10 9-15 17-15s16 5 17 15c0 6-5 9-17 9s-17-3-17-9z" fill="#d6ebff" fill-rule="evenodd"/></g><path d="M8 8l48 48" fill="none" stroke="#d6ebff" stroke-width="4.5" stroke-linecap="round"/>',
    'RAISED': '<image href="fps-icons/pistol.png" x="2" y="12" width="44" height="33"/><path d="M52 54V40M46 46l6-6 6 6" fill="none" stroke="#d6ebff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
    'LOWERED': '<image href="fps-icons/pistol.png" x="2" y="12" width="44" height="33"/><path d="M52 40v14M46 48l6 6 6-6" fill="none" stroke="#d6ebff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
    'RELOAD': '<path d="M47.6 23A18 18 0 1 0 48.9 38.2" fill="none" stroke="#d6ebff" stroke-width="4.5" stroke-linecap="round"/><path d="M49.5 28l-6.5 10.5h12z" fill="#d6ebff"/><image href="fps-icons/mag.png" x="19" y="19" width="26" height="26"/>',
    'FIRE MODE': '<path d="M19 20l5-9 5 9v30H19z M35 20l5-9 5 9v30H35z" fill="#d6ebff"/><path d="M19 43h10 M35 43h10" fill="none" stroke="#071a2c" stroke-width="2.6" stroke-linecap="round"/>',
    'HOLSTER WEAPON': '', 'HOLSTERED': '',
    'FISTS': '<path d="M15 27V15h8v12-17h8v17-16h8v16-10h8v23L35 53H23L11 40v-9z" fill="#d6ebff" fill-rule="evenodd"/><path d="M23 15v10 M31 11v14 M39 13v11" fill="none" stroke="#071a2c" stroke-width="2.6" stroke-linecap="round"/>'
  };

  function teamHTML() { if (!TEAM.length) return '<div class="ofnd">NO DATA</div>'; return TEAM.map(([n, h, s, d]) => `<div class="ofcard ${d}"><div class="ofrt"><b>${n}</b><span class="${d ? 'vr' : ''}">${s}</span></div><div class="ofrp">${pills(h, d ? 'vr' : lvlc(h))}<span>${h}%</span></div></div>`).join(''); }
  function shipHTML() { if (!SHIP) return '<div class="ofnd">NO DATA</div>'; return `<div class="ofcard ofship" style="flex:1.3"><div class="ofrt"><b class="big">${SHIP.name}</b><span class="vg">${SHIP.where}</span></div><div class="ofrt"><span>${SHIP.when}</span></div></div>` +
    SHIP.rows.map(([l, v]) => `<div class="ofcard"><div class="ofrp"><span style="width:84px;text-align:left;letter-spacing:1.5px">${l}</span>${pills(v, lvlc(v))}<span>${v}%</span></div></div>`).join(''); }
  function utilHTML() { return `<h4>UTILITY · CARRIED / TO BUY</h4><div class="ofurow">${UTIL.map(([ic, l, have, want]) => have == null ? `<div class="ofu">${ico(ic)}<div><span>${l}</span><b>—</b><span>NO DATA</span></div></div>` : `<div class="ofu ${have < want ? 'buy' : ''}">${ico(ic)}<div><span>${l}</span><b class="${have === 0 ? 'vr' : have < want ? 'va' : 'vg'}">${have}<small style="font-size:13px;color:#9fbfdc"> / ${want}</small></b><span class="${have < want ? 'va' : 'vg'}">${have < want ? 'BUY ' + (want - have) : 'FULL'}</span></div></div>`).join('')}</div>`; }
  /* 25 NOV RAZ: "those are buttons to be pressed inside weaopn loadout and utilty carried. design theose like buttons and give some space in between the buttons.
     also the utility carried pill design is undesireable" + "the font on the ultity carried is too small": every slot is now a real deck key (same glass key as the
     rest of the deck, the deck's own spacing), placed inside the picker frame; the grid boxes are gone; labels 22-27 px. */
  function pickHTML() {
    return `<div class="ofph"><span>${pick === 'weapons' ? 'WEAPON LOADOUT' : 'EQUIPMENT LOADOUT'}</span><div class="ofdot ${pick === 'weapons' ? '' : 'eq'}" title="switch weapon / equipment loadout"><i></i></div><span>${pick === 'weapons' ? 'UTILITY CARRIED' : 'MULTITOOL MODULES'}</span></div><em class="smp">DOUBLE TAP OR HOLD = SWITCH</em>`;
  }
  function slotKeys(CX) {
    const L = [], ROW = GEO.ROW, LX = CX + 24, LW = GEO.LW, RX = [CX + GEO.RX[0], CX + GEO.RX[1]], RW = GEO.RW, H = GEO.H; /* inside the picker panel (ends 670) */ /* 25 NOV fix (RAZ: "no space betwen buttons ... wepona loadout and utilty carieed is coverd by a pill outline"): even 24 / 20 px gaps, keys start below the headings */
    const key = (x, y, w, slot, inner, cls) => L.push(`<div class="nb k ofpk ${cls || ''}${sel === slot ? ' lit' : ''}" data-slot="${slot}" style="left:${x}px;top:${y}px;width:${w}px;height:${H}px;border-radius:30px"><div data-mc class="ofpki">${inner}</div></div>`);
    if (pick === 'weapons') {
      WEAP.forEach(([ic, n, l, w], r) => key(LX, ROW[r], LW, l, `${IMG(ic)}<div class="ofpkt"><div class="nt">${n} · ${l}</div><div class="ns">${w}</div></div>`, 'wide'));
      CARRY.forEach(([ic, l], i) => key(RX[i % 2], ROW[(i / 2) | 0], RW, l, `${ico(ic)}<div class="nt">${l}</div>`, 'small'));
    } else {
      EQUIP.forEach(([ic, n, l, w], r) => key(LX, ROW[r], LW, l, `${IMG(ic)}<div class="ofpkt"><div class="nt">${n ? n + ' · ' : ''}${l}</div>${w ? `<div class="ns">${w}</div>` : ''}</div>`, 'wide'));
      MODS.forEach(([l, on], i) => L.push(`<div class="nb k ofpk small${on ? ' lit' : ''}" data-mod="${l}" style="left:${RX[i % 2]}px;top:${ROW[(i / 2) | 0]}px;width:${RW}px;height:${H}px;border-radius:40px"><div data-mc class="ofpki"><div class="nt">${l}</div><div class="ns">MODULE</div></div></div>`));
    }
    return L.join('');
  }
  function keyHTML(i, x, y) {
    const lab = KEYS[i][KS[i]], s = S[lab] || S_NEW[lab];
    return `<div class="nb k ofk${KEYS[i][0] === 'FISTS' && sel === 'FISTS' ? ' sel' : ''}" data-ofk="${i}" style="left:${x}px;top:${y}px;width:${GEO.KW}px;height:${GEO.KH}px;border-radius:30px"><div data-mc class="ofki">${s ? `<svg viewBox="0 0 64 64">${s}</svg>` : ''}<div class="nt">${lab.replace(' ', '<br>')}</div></div></div>`;
  }
  let CXg = 0, HOST = null, GEO = { ROW: [162, 330, 498], LW: 380, RX: [428, 648], RW: 200, H: 154, KW: 255, KH: 178, KY: [100, 296, 492] };
  const redraw = () => { if (HOST && HOST.id === 'offps') drawFps(true); else renderMore(); };
  function flip() { pick = pick === 'weapons' ? 'equipment' : 'weapons'; const m = HOST || document.getElementById('more'), p = m && m.querySelector('.ofpick'); if (!p) return;
    p.innerHTML = pickHTML(); putSlots(m, true); }
  function putSlots(m, anim) { m.querySelectorAll('.ofpk').forEach(k => k.remove()); const box = document.createElement('div'); box.innerHTML = slotKeys(CXg);
    const ks = [...box.children]; ks.forEach(k => m.appendChild(k)); if (typeof holoize === 'function') holoize(m);
    if (anim) ks.forEach(k => k.animate([{ opacity: 0, filter: 'blur(4px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 360 })); wireSlots(m); }
  function wireSlots(m) { m.querySelectorAll('.ofpk').forEach(k => { let lp = null, held = false;
      k.addEventListener('pointerdown', () => { held = false; clearTimeout(lp); lp = setTimeout(() => { held = true; flip(); }, 600); });
      k.addEventListener('pointercancel', () => clearTimeout(lp)); k.addEventListener('pointerleave', () => clearTimeout(lp));
      k.addEventListener('pointerup', () => { clearTimeout(lp); if (held) return; const now = Date.now(); if (now - (window.__ofLT || 0) < 380) { window.__ofLT = 0; flip(); return; } window.__ofLT = now;
        const slot = k.dataset.slot; if (!slot) return; setTimeout(() => { if (window.__ofLT && Date.now() - window.__ofLT >= 380) { sel = slot; m.querySelectorAll('.ofpk[data-slot]').forEach(x => x.classList.toggle('lit', x.dataset.slot === sel)); m.querySelectorAll('.ofk').forEach(x => x.classList.toggle('sel', KEYS[+x.dataset.ofk][0] === 'FISTS' && sel === 'FISTS')); } }, 400); }); }); }
  function draw(m) {
    HOST = m;
    m.querySelectorAll('.nb.k:not(.mk), .mousek').forEach(k => k.remove());
    /* 25 NOV (RAZ: "you're not using all space of the edge vertically or horizontally"): the Edge FPS page uses the full deck inside the pills;
       MORE > ON FOOT keeps the approved sheet layout */
    const FP = m.id === 'offps'; GEO = FP ? { ROW: [104, 296, 488], LW: 440, RX: [484, 736], RW: 236, H: 172, KW: 142, KH: 148, KY: [40, 204, 368, 532], KC: 4 } : { ROW: [162, 330, 498], LW: 380, RX: [428, 648], RW: 200, H: 154, KW: 255, KH: 178, KY: [100, 296, 492] };
    const X0 = FP ? 50 : 360, Y0 = FP ? 96 : 100, PY0 = FP ? 40 : Y0, Y1 = FP ? 680 : 670, LW = FP ? 680 : 700, TH = FP ? 374 : 384, UT = FP ? 490 : Y0 + 404, CX = X0 + LW + (FP ? 44 : 30), KX = FP ? [1880, 2038, 2196, 2354] : [1992, 2271], CW = KX[0] - (FP ? 44 : 30) - CX; /* Edge FPS: 4 x 4 keys on the right (RAZ: "make it column of 4 and rows of 4 in the far right area"), 16 px gaps */
    let h = `<div class="ofp" style="left:${X0}px;top:${Y0}px;width:${LW}px;height:${TH}px"><div class="ofcols"><div class="ofcol"><h4>TEAM</h4>${teamHTML()}</div><div class="ofcol"><h4>SHIP STATUS</h4>${shipHTML()}</div></div></div>`;
    h += `<div class="ofp" style="left:${X0}px;top:${UT}px;width:${LW}px;height:${Y1 - UT}px"><div class="ofutil">${utilHTML()}</div></div>`;
    h += `<div class="ofp ofpick" style="left:${CX}px;top:${PY0}px;width:${CW}px;height:${Y1 - PY0}px">${pickHTML()}</div>`;
    const NC = GEO.KC || 2; KEYS.slice(0, NC * GEO.KY.length).forEach((_, i) => { h += keyHTML(i, KX[i % NC], GEO.KY[(i / NC) | 0]); }); /* 3 rows of 178, 18 px gaps, ending at 670 */ /* 24 px gaps, 3 equal rows */
    const box = document.createElement('div'); box.className = 'ofroot'; box.innerHTML = h; [...box.children].forEach(c => m.appendChild(c));
    if (typeof holoize === 'function') holoize(m);
    m.querySelectorAll('.ofk').forEach(k => k.onclick = () => { const i = +k.dataset.ofk; if (KEYS[i].length > 1) KS[i] = (KS[i] + 1) % KEYS[i].length;
      if (KEYS[i][0] === 'FISTS' || (KEYS[i][0] === 'HOLSTER WEAPON' && KS[i] === 1)) sel = 'FISTS';
      if (KEYS[i][0] === 'HOLSTER WEAPON' || KEYS[i][0] === 'RAISED') { /* drawn again with the new label */ }
      redraw(); });
    CXg = CX; putSlots(m, false);
    m.querySelector('.ofpick').addEventListener('pointerup', e => { if (e.target.closest('.ofdot')) flip(); });
  }
  /* EDGE FPS PAGE (chat 2, 25 NOV 15:04, RAZ pick 3 "Also use this layout for the deck's FPS page"): on the personal Edge the FPS mode page shows this
     spread-out layout instead of the narrow EQUIPMENT panel. The PC Holo keeps the narrow version (RAZ: "the holo fps page stays the narrow abbreviated version").
     The FPS menu key stays where it is on the left. */
  const fst = document.createElement('style');
  fst.textContent = '#area.offps-on > .eqpanel,#area.offps-on > .nb.k:not(.sm){display:none!important}#offps{position:absolute;left:0;top:0;width:2560px;height:720px;z-index:24;pointer-events:none}#offps > *{pointer-events:auto}';
  document.head.appendChild(fst);
  /* 25 NOV fix (RAZ: "the edge deck fps page far left field is still off center and the edge fps button sits and i currently don't have a way to exit the fps page ...
     on the team pill line"): 1 the deck's frame layer lay over the "FPS" page key, so taps never reached it -> the key (and the page column it opens) sit above it;
     2 the left column (TEAM / SHIP STATUS + UTILITY) is centred in its pill; 3 the FPS key sits centred above the TEAM panel with a clear gap, never on its line. */
  const fxs = document.createElement('style'); /* RAZ: "the fps button the edge is simply too large" */
  fxs.textContent = 'body.edgefps #offps .ofk svg{width:58px!important;height:58px!important}body.edgefps #offps .ofk .nt{font-size:16px!important;letter-spacing:1.5px!important}body.edgefps #offps .ofk .ofki{gap:8px!important}body.edgefps #deck #chrome .menuhandle{width:200px!important;height:46px!important;min-height:0!important;border-radius:23px!important}body.edgefps #deck #chrome .menuhandle .mhl{font-size:19px!important;gap:9px!important}body.edgefps #deck #chrome .menuhandle .mhi{width:14px!important;height:11px!important}html.edge-pill #chrome .menuhandle,html.edge-pill #chrome .tab.left{position:absolute;z-index:40!important}html.edge-pill #chrome .frame,html.edge-pill #area.offps-on > .frame{pointer-events:none}';
  document.head.appendChild(fxs);
  /* safety (chat 3): a page change that throws leaves busy = true and every tab tap is ignored; after 4 s stuck it is released */
  { let since = 0; setInterval(() => { try { if (busy) { since = since || Date.now(); if (Date.now() - since > 4000 && !document.querySelector('.scanold')) { busy = false; since = 0; } } else since = 0; } catch (e) {} }, 500); }
  function alignFps() { const c = document.getElementById('offps'), A = document.getElementById('area'); if (!c || !A) return;
    const as = A.getBoundingClientRect().width / 2560 || 1, pills = [...document.querySelectorAll('#deck .edgegrp')].map(e => e.getBoundingClientRect()).sort((a, b) => a.left - b.left);
    const L = [...c.querySelectorAll(':scope > .ofp:not(.ofpick)')]; if (!pills.length || !L.length) return;
    const pl = pills[0], lr = L.map(e => e.getBoundingClientRect()), l0 = Math.min(...lr.map(r => r.left)), r0 = Math.max(...lr.map(r => r.right));
    /* the left column is centred in its pill by the Edge layout (key-morph groups); here only the FPS key is placed */
    const h = document.querySelector('#chrome .menuhandle'); if (h && h.offsetWidth) { const hb = h.getBoundingClientRect(), lrn = L.map(e => e.getBoundingClientRect()), cx = (Math.min(...lrn.map(r => r.left)) + Math.max(...lrn.map(r => r.right))) / 2 /* centred over the TEAM / UTILITY column */, t0 = Math.min(...L.map(e => e.getBoundingClientRect().top));
      const want = cx - hb.width / 2, top = t0 - hb.height - 14 * as, cur = parseFloat(h.style.translate) || 0; const ddx = (want - hb.left) / as, ddy = (top - hb.top) / as;
      if (Math.abs(ddx) > 1 || Math.abs(ddy) > 1) { const tr = (h.style.translate || '0px 0px').split(' ').map(v => parseFloat(v) || 0); h.style.translate = (tr[0] + ddx).toFixed(1) + 'px ' + ((tr[1] || 0) + ddy).toFixed(1) + 'px'; h.dataset.fpsMoved = '1'; } } }
  setInterval(() => { try { if (document.getElementById('area')?.classList.contains('offps-on')) alignFps(); else { const h = document.querySelector('#chrome .menuhandle'); if (h && h.dataset.fpsMoved) { h.style.translate = ''; delete h.dataset.fpsMoved; } } } catch (e) {} }, 300);
  function drawFps(force) { const area = document.getElementById('area'); if (!area) return; let c = document.getElementById('offps');
    if (!c) { c = document.createElement('div'); c.id = 'offps'; area.appendChild(c); force = true; }
    area.classList.add('offps-on'); document.body.classList.add('edgefps'); HOST = c; if (!force) return; c.innerHTML = ''; draw(c); }
  setInterval(() => { const area = document.getElementById('area'), eq = area && area.querySelector(':scope > .eqpanel');
    if (eq && !document.body.classList.contains('moreopen')) drawFps(false);
    else if (area && !eq) { area.classList.remove('offps-on'); document.body.classList.remove('edgefps'); const c = document.getElementById('offps'); if (c) c.remove(); if (HOST && HOST.id === 'offps') HOST = null; } }, 150);
  function header(m, pg, total) {
    const lab = [...m.querySelectorAll('.hd.ns')].find(e => /PAGE/.test(e.textContent)); if (lab) lab.textContent = `PAGE ${pg + 1} / ${total}`;
    m.querySelectorAll('[data-mv]').forEach(t => t.onclick = () => { morePage = Math.max(0, Math.min(total - 1, morePage + +t.dataset.mv)); renderMore(); });
  }
  function install() {
    if (typeof renderMore !== 'function' || typeof moreKeys !== 'function' || renderMore.__onfoot) return false;
    const orig = renderMore;
    const wrap = function () {
      const foot = (window.MORE_AREAS || []).findIndex(a => a.title === 'ON FOOT');
      if (moreArea !== foot) return orig();
      const total = Math.max(1, Math.ceil(moreKeys(moreArea).length / 24)) + 1, pg = Math.max(0, Math.min(total - 1, morePage));
      const m = document.getElementById('more');
      if (pg === 0) { morePage = 0; orig(); morePage = 0; draw(m); } else { morePage = pg - 1; orig(); morePage = pg; }
      header(m, pg, total);
    };
    wrap.__onfoot = 1; renderMore = wrap;
    if (document.body.classList.contains('moreopen')) renderMore();
    return true;
  }
  if (!install()) { const t = setInterval(() => { if (install()) clearInterval(t); }, 200); }
})();

/* EDGE FILL (chat 2, 25 NOV). Edge only (?edge=1). RAZ (typed in chat 3): "cureently the edge holo deck looks empty with too mujch empty space how can we add
   more to the page maybe some useful telemetry information between teh fhilght ship pwer button and the center page underneath the coupled gsafe etc row also looks
   empty. fix the writing of ifcs engineering etc to make it look lemore etc from the other d'eck page".
   1. LEFT gap between FLIGHT and SHIP POWER = FUEL (hydrogen + quantum, pills). RIGHT gap between EJECT and SELF DESTRUCT = SPEED + G (mirror, symmetric page).
   2. Under the lower key row (FLIGHT: COUPLED ... AUTOLAND; also COMBAT / TURRET / MINING / SALVAGE) = one telemetry line: ALT, RADAR ALT, V/S, BOOST, AIR, POWER groups, WARNINGS.
   3. The key-page names (IFCS ENGINEERING SHIP MFD MFD 2 VIEW TRIM) in the fine sheet-heading lettering (as MORE / ON FOOT) with its glint line.
   Live game values only; with no telemetry it shows SAMPLE numbers (marked), with telemetry but a missing value it shows –. Read-only, nothing is sent. */
(function () {
  const Q = new URLSearchParams(location.search);
  const EDGE = Q.get('edge') === '1';
  /* 25 NOV RAZ (chat 3): "add all the little info to the holo hud": FUEL, SPEED + G and the telemetry line also on the desktop Holo deck (framed, no ?edge=1).
     The Edge-only parts stay Edge-only: lower key row shape, side keys spread, page-name lettering. Never in shop builds. */
  if (!(EDGE || window !== window.top || Q.has('pcholo'))) return; /* SHOP COPY 25 NOV RAZ: the shop Edge demo shows the same telemetry row as the page pictures (was off with ?shop) */
  const css = document.createElement('style');
  css.textContent = `
html.edge-pill #deck #fbhost .fbdots i b{white-space:nowrap!important;font-weight:400!important;font-size:22px!important;letter-spacing:5px!important;color:rgba(214,235,255,.78)!important;text-shadow:0 0 1px rgba(255,255,255,.5),0 0 6px rgba(31,158,255,.7)!important}
html.edge-pill #deck #fbhost .fbdots i.on b{color:#fff!important;text-shadow:0 0 1px rgba(255,255,255,.55),0 0 6px rgba(31,158,255,.85)!important}
html.edge-pill #deck #fbhost .fbdots i.on::after{left:6px!important;transform:none!important;width:38px!important;bottom:-8px!important;background:linear-gradient(90deg,#3dabff,#fff 45%,#3dabff 75%,transparent)!important}
/* 25 NOV his yes + "move the bottom button row up a littel bit and make them the same shape as the top button row directly above mthem so the altitute radar alt etc have room to breathe" */
html.edge-pill #deck #fbhost .bpk{top:-12px!important;border-radius:70px!important}html.edge-pill #deck #fbhost .bpk>.holo{border-radius:70px!important}
body.menuopen #deck .efx.lft,body.moreopen #deck .efx,body.telemfloat #deck .efx,body.telemopen #deck .efx,body.travelopen #deck .efx,body.cfgopen #deck .efx{display:none!important} /* hidden while a sheet (MORE, TELEMETRY, TRAVEL) is open over the deck */
#deck .efx{position:absolute;z-index:7;pointer-events:none;font-family:Oxanium,'Segoe UI',sans-serif;color:#d6ebff}
#deck .efx .h{position:relative;font-weight:400;font-size:24px;letter-spacing:5px;color:#fff;text-shadow:0 0 1px rgba(255,255,255,.55),0 0 6px rgba(31,158,255,.7);text-align:center}
#deck .efx .h::after{content:"";position:absolute;left:50%;bottom:-7px;width:38px;height:2px;margin-left:-19px;border-radius:2px;background:linear-gradient(90deg,transparent,#3dabff,#fff 50%,#3dabff,transparent);box-shadow:0 0 6px #1f9eff}
#deck .efx .r{display:flex;align-items:center;gap:10px;font-size:23px;letter-spacing:2px}
#deck .efx .r>span:first-child{width:48px;color:rgba(214,235,255,.75)}#deck .efx .r>span:last-child{width:68px;text-align:right;color:#fff}
#deck .efx .pc{display:flex;gap:3px;flex:1}#deck .efx .pc i{flex:1;height:15px;border-radius:6px;background:rgba(53,168,255,.14)}#deck .efx .pc i.on{background:var(--c);box-shadow:0 0 5px var(--c)}
#deck .efx .big{display:flex;align-items:baseline;justify-content:center;gap:8px}#deck .efx .big b{font-size:56px;font-weight:500;letter-spacing:2px;color:#fff;text-shadow:0 0 8px rgba(31,158,255,.8)}
#deck .efx .big span{font-size:20px;letter-spacing:2px;color:rgba(214,235,255,.75)}
#deck .efx .smp{position:absolute;right:0;bottom:-18px;font-size:12px;letter-spacing:2px;color:rgba(214,235,255,.4)}
#deck .efx.side{display:flex;flex-direction:column;justify-content:center;gap:14px}
#deck .efx.strip{display:flex;align-items:center;justify-content:space-between;gap:0}
#deck .efx.strip .c{flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;position:relative}
#deck .efx.strip .c+.c::before{content:"";position:absolute;left:0;top:4px;bottom:4px;width:1px;background:linear-gradient(180deg,transparent,rgba(61,171,255,.75),transparent)}
#deck .efx.strip .c span{font-size:16px;letter-spacing:3px;color:rgba(214,235,255,.72)}#deck .efx.strip .c b{font-size:26px;font-weight:500;letter-spacing:1.5px;color:#fff}
#deck .efx.strip .pw{display:flex;gap:6px}#deck .efx.strip .pw em{font-style:normal;font-size:15px;letter-spacing:1px;padding:3px 7px;border-radius:9px;border:1px solid rgba(53,168,255,.4);color:rgba(214,235,255,.45)}
#deck .efx.strip .pw em.on{border-color:#14ff63;color:#14ff63;box-shadow:0 0 5px rgba(20,255,99,.45)}
#deck .efx .vg{color:#14ff63!important}#deck .efx .va{color:#ffae00!important}#deck .efx .vr{color:#ff3048!important}
`;
  /* the desktop Holo has less room between its side keys than the Edge (no spread there): the side blocks get a compact size */
  if (!EDGE) css.textContent += '#deck .efx.side{gap:7px}#deck .efx.side .h{font-size:16px}#deck .efx.side .h::after{bottom:-5px}#deck .efx.side .r{font-size:16px}#deck .efx .pc i{height:10px}#deck .efx .big b{font-size:36px}#deck .efx .big span{font-size:15px}#deck .efx.side .smp{display:none}';
  document.head.appendChild(css);
  const SAMPLE = { h2: 64, qt: 47, speed: 214, g: 1.2, alt: 1840, ralt: 312, vs: -4.2, boost: 78, air: 0.82, pwr: { ENG: 1, SHLD: 1, WPN: 1, COOL: 1, LIFE: 1 }, warn: 0 };
  const COLS = { vg: '#14ff63', va: '#ffae00', vr: '#a00d22' };
  const lvl = v => v <= 25 ? 'vr' : v <= 50 ? 'va' : 'vg';
  const pills = v => `<div class="pc">${[...Array(10)].map((_, i) => `<i class="${v != null && i < Math.round(v / 10) ? 'on' : ''}" style="--c:${COLS[lvl(v || 0)]}"></i>`).join('')}</div>`;
  const live = () => { try { return LIVEON && LIVE ? LIVE : null; } catch (e) { return null; } };
  const get = (L, ...paths) => { for (const p of paths) { const v = p.split('.').reduce((o, k) => o == null ? o : o[k], L); if (v != null) return v; } return null; };
  const pct = v => v == null ? null : (+v <= 1.0001 ? +v * 100 : +v); /* fuel scale unconfirmed (0-1 or %) */
  function vals() {
    const L = live(); if (!L) return { pwr: {} }; /* 25 NOV RAZ: "only real stuff": no game data = every value –, no SAMPLE numbers (the shop does not load this module) */
    const I = 'vehicle.state.flight.instruments.', P = 'vehicle.state.power.', d = L.derived || {};
    const g = get(L, I + 'g_meter', I + 'g'); const gv = g == null ? null : typeof g === 'object' ? (g.current != null ? +g.current : g.value != null ? +g.value : null) : +g;
    const b = get(L, I + 'boost'); const bres = b && typeof b === 'object' ? (b.reserves != null ? pct(b.reserves) : null) : null;
    const ann = get(L, 'vehicle.state.annunciators'); const warn = ann && typeof ann === 'object' ? Object.values(ann).filter(x => /MINOR|MAJOR/.test(String(x))).length : null;
    const pb = k => { const v = get(L, P + k[0], P + k[1]); return v == null ? null : v ? 1 : 0; };
    return { sample: false, h2: pct(get(L, I + 'hydrogen_fuel', I + 'hydrogenFuel')), qt: pct(get(L, I + 'quantum_fuel', I + 'quantumFuel')),
      speed: d.speed != null ? +d.speed : get(L, I + 'speed'), g: gv, alt: get(L, I + 'altitude'), ralt: get(L, I + 'radar_altitude', I + 'radarAltitude'),
      vs: d.vertical_speed != null ? +d.vertical_speed : get(L, I + 'vertical_speed', I + 'verticalSpeed'), boost: bres, air: get(L, I + 'atmo_density', I + 'atmoDensity'),
      pwr: { ENG: pb(['engines', 'engines']), SHLD: pb(['shield_generators', 'shieldGenerators']), WPN: pb(['weapons', 'weapons']), COOL: pb(['coolers', 'coolers']), LIFE: pb(['life_support', 'lifeSupport']) }, warn };
  }
  const n0 = v => v == null || isNaN(v) ? '–' : Math.round(+v).toLocaleString('en-US');
  const n1 = v => v == null || isNaN(v) ? '–' : (+v).toFixed(1);
  function mode_() { const t = document.querySelector('.tab.left.on'); return t ? t.textContent.replace(/[^A-Z ]/g, '').trim() : ''; }
  const curMode = () => { try { return mode; } catch (e) { return mode_(); } }; /* the deck's own page name (global let) */
  let L = null, R = null, S = null;
  function box(cls) { const e = document.createElement('div'); e.className = 'efx ' + cls; (document.getElementById('area') || document.getElementById('deck')).appendChild(e); return e; } /* inside #area: the Holo window's shape is built from #area's parts */
  function setBox(e, x, y, w, h) { const A = e.parentElement, deck = document.getElementById('deck'); if (!A || !deck) return; let ax = 0, ay = 0, k = 1;
    if (A !== deck) { const dr = deck.getBoundingClientRect(), sc = dr.width / 2560 || 1, ar = A.getBoundingClientRect(); k = (ar.width / sc) / (A.offsetWidth || 1) || 1; ax = (ar.left - dr.left) / sc; ay = (ar.top - dr.top) / sc; }
    const st = { left: ((x - ax) / k).toFixed(1) + 'px', top: ((y - ay) / k).toFixed(1) + 'px', width: (w / k).toFixed(1) + 'px', height: (h / k).toFixed(1) + 'px', display: '' };
    for (const n in st) if (e.style[n] !== st[n]) e.style[n] = st[n]; }
  function where(re, sel) { const deck = document.getElementById('deck'), dr = deck.getBoundingClientRect(), sc = dr.width / 2560;
    const e = [...document.querySelectorAll(sel || '#chrome .nb, #chrome .dz, #area .nb, #area .dz')].find(k => k.offsetWidth && getComputedStyle(k).visibility !== 'hidden' && re.test((k.textContent || '').replace(/\s+/g, '')));
    if (!e) return null; const r = e.getBoundingClientRect(); return { l: (r.left - dr.left) / sc, t: (r.top - dr.top) / sc, w: r.width / sc, h: r.height / sc }; }
  function place() {
    const up = where(/./, '#chrome .tab.menuhandle'), pw = where(/^SHIPPOWER/), ej = where(/^EJECT/), sd = where(/^SELFDESTRUCT/);
    if (up && pw) { const t = up.t + up.h + 14, h = pw.t - 14 - t; if (!L || !L.isConnected) { L = box('side'); L.classList.add('lft'); } /* 25 NOV RAZ: "when i select flight on the edge deck the menu list once again displays on top of the readings": FUEL hides while the page menu is open */ setBox(L, up.l + 20, t, up.w - 40, h); } else if (L) L.style.display = 'none';
    if (ej && sd) { const t = ej.t + ej.h + 14, h = sd.t - 14 - t; if (!R || !R.isConnected) R = box('side'); setBox(R, ej.l + 20, t, ej.w - 40, h); } else if (R) R.style.display = 'none';
    const fb = document.getElementById('fbhost'), m = curMode();
    if (fb && m) { /* every page with the key row under the main keys (FLIGHT, COMBAT, TURRET, MINING, SALVAGE) */ const k = [...fb.querySelectorAll('.bpk')], d = fb.querySelector('.fbdots'); const deck = document.getElementById('deck').getBoundingClientRect(), sc = deck.width / 2560;
      if (k.length && d) { const a = k[0].getBoundingClientRect(), z = k[k.length - 1].getBoundingClientRect(), dd = d.getBoundingClientRect();
        const bx = window.__mainBox && window.__mainBox(), x = bx ? bx.l : (a.left - deck.left) / sc, w = bx ? bx.r - bx.l : (z.right - a.left) / sc; /* full width of the key block, also when a page has only 4 keys */ const t = (a.bottom - deck.top) / sc + 10, h = (dd.top - deck.top) / sc - 8 - t;
        if (!S || !S.isConnected) S = box('strip'); setBox(S, x, t, w, Math.max(40, h)); } }
    else if (S) S.style.display = 'none';
  }
  function paint() {
    const v = vals(), smp = v.sample ? '' : '';
    const put = (e, h) => { if (e && e._h !== h) { e._h = h; e.innerHTML = h; } };
    if (L) put(L, `<div class="h">FUEL</div><div class="r"><span>H2</span>${pills(v.h2)}<span class="${v.h2 == null ? '' : lvl(v.h2)}">${v.h2 == null ? '–' : Math.round(v.h2) + '%'}</span></div><div class="r"><span>QT</span>${pills(v.qt)}<span class="${v.qt == null ? '' : lvl(v.qt)}">${v.qt == null ? '–' : Math.round(v.qt) + '%'}</span></div>${smp}`);
    if (R) put(R, `<div class="h">SPEED</div><div class="big"><b>${n0(v.speed)}</b><span>M/S</span><span style="margin-left:14px">G</span><b style="font-size:37px">${n1(v.g)}</b></div>${smp}`);
    if (S) { const pw = Object.entries(v.pwr).filter(([, x]) => x != null || v.sample);
      put(S, [['ALTITUDE', n0(v.alt) + ' M'], ['RADAR ALT', n0(v.ralt) + ' M'], ['VERT SPEED', (v.vs > 0 ? '+' : '') + n1(v.vs) + ' M/S'], ['BOOST', v.boost == null ? '–' : `<b class="${lvl(v.boost)}">${Math.round(v.boost)}%</b>`], ['AIR', v.air == null ? '–' : (+v.air).toFixed(2)]]
        .map(([l, x]) => `<div class="c"><span>${l}</span>${/^<b/.test(x) ? x : `<b>${x}</b>`}</div>`).join('') +
        `<div class="c" style="flex:2"><span>POWER</span><div class="pw">${pw.length ? pw.map(([k, x]) => `<em class="${x ? 'on' : ''}">${k}</em>`).join('') : '<b>–</b>'}</div></div>` +
        `<div class="c"><span>WARNINGS</span><b class="${v.warn ? 'va' : v.warn === 0 ? 'vg' : ''}">${v.warn == null ? '–' : v.warn ? v.warn : 'NONE'}</b></div>` + smp); }
  }
  /* 25 NOV RAZ: "spread out the flight and ship power and eject sand self desturc t button equidisntanct from the terlemtry data": the two keys of each side group
     move to the top and bottom of their group (same margin), so the FUEL / SPEED block sits exactly between them */
  function spread() { const deck = document.getElementById('deck'); if (!deck) return; const dr = deck.getBoundingClientRect(), sc = dr.width / 2560, M = 22;
    const grp = [...document.querySelectorAll('#deck .edgegrp')].map(g => { const r = g.getBoundingClientRect(); return { l: (r.left - dr.left) / sc, r: (r.right - dr.left) / sc, t: (r.top - dr.top) / sc, b: (r.bottom - dr.top) / sc }; });
    const pick = (sel, re) => [...document.querySelectorAll(sel)].find(k => k.offsetWidth && getComputedStyle(k).visibility !== 'hidden' && (!re || re.test((k.textContent || '').replace(/\s+/g, ''))));
    /* 25 NOV fix (RAZ: "the flight button is bouncint up and down"): the deck's own layout puts the page key and SHIP POWER at EJECT's / SELF DESTRUCT's offsetTop,
     so only EJECT and SELF DESTRUCT are moved here; the left keys follow them (moving all four made the two fight). Measured from offsets, not the drawn box. */
    [[pick('#area .dz, #chrome .dz', /^EJECT/), -1], [pick('#area .dz, #chrome .dz', /^SELFDESTRUCT/), 1]].forEach(([e, dir]) => { if (!e || !e.offsetParent) return;
      const op = e.offsetParent, opr = op.getBoundingClientRect(), k = (opr.width / sc) / (op.offsetWidth || 1) || 1, r = e.getBoundingClientRect(), cx = (r.left + r.width / 2 - dr.left) / sc, g = grp.find(g => cx > g.l && cx < g.r); if (!g) return;
      const m0 = parseFloat(e.style.marginTop) || 0, t0 = (opr.top - dr.top) / sc + (e.offsetTop - m0) * k, h = e.offsetHeight * k, want = dir < 0 ? g.t + M : g.b - M - h, m = Math.round((want - t0) / k);
      if (Math.abs(m - m0) > 1) e.style.marginTop = m + 'px';
      /* the page key / SHIP POWER copy this key's offsetTop; the FPS code puts the page key back to its saved home top every 0.3 s - keep that home equal, or the two take turns (the bounce) */
      const twin = dir < 0 ? document.querySelector('#chrome .tab.menuhandle') : null, home = e.offsetTop + 'px'; if (twin && twin.dataset.homeT !== home) twin.dataset.homeT = home; }); }
  setInterval(() => { place(); paint(); }, 500); setInterval(spread, 100); { let mo = null; const hook = () => { const A = document.getElementById('area'); if (!A || mo) return; mo = new MutationObserver(() => { try { if (window.__atcSides) window.__atcSides(); spread(); } catch (e) {} }); mo.observe(A, { childList: true }); }; hook(); setInterval(hook, 1000); } /* + at once when the page redraws (runs before the screen is painted) */ /* 25 NOV (RAZ: "the deck contents still shifts and flashes when selecting different pages"): a page change draws EJECT / SELF DESTRUCT without their spacing; placed again within 0.1 s instead of up to 0.5 s */
})();

/* HOLO FPS PAGE TIDY (chat 2, 25 NOV; RAZ's screenshot via chat 3: "fps button in onscreen fps equipment page is still too far to the left" + the right key column
   off the grid, a lone dash, the wallet gap). PC Holo only (not the Edge FPS page): 1 the FPS page key sits right next to the EQUIPMENT panel, top-aligned;
   2 the weapon / tools tabs and every action key go into one even 3 x 4 grid of the same size as the 3 x 3 quick keys; 3 an empty location line is hidden;
   4 the WALLET page starts at the top under its header. */
(function () {
  if (new URLSearchParams(location.search).get('edge') === '1') return;
  const st = document.createElement('style');
  st.textContent = '#area .eqpanel .eqgrid{position:absolute;display:grid;grid-template-columns:repeat(3,81px);grid-auto-rows:118px;column-gap:8px;row-gap:7px;z-index:3}'
    + '#area:has(> .eqpanel) > .frame{pointer-events:none}#chrome .menuhandle{z-index:40}'
    + '#area .eqpanel .eqgrid>*{position:static!important;width:81px!important;height:118px!important;margin:0!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:6px!important;box-sizing:border-box!important}'
    + '#area .eqpanel .eqgrid>* svg,#area .eqpanel .eqgrid>* img{max-width:46px!important;max-height:40px!important}'
    + '#area .eqpanel .eqgrid>* span{font-size:12px!important;line-height:1.15!important;text-align:center!important;white-space:normal!important}'
    + '#area .eqpanel .eqtabs.eqgone,#area .eqpanel .eqacts.eqgone,#area .eqpanel .eqside.eqgone{display:none!important}'
    + '#area .eqpanel .vloc.vempty{visibility:hidden}'
    + '#area .eqpanel .rpage.p-wallet .rbody{justify-content:flex-start!important;align-content:flex-start!important;gap:14px!important;padding-top:10px!important}';
  document.head.appendChild(st);
  function tidy() {
    const p = document.querySelector('#area .eqpanel'); if (!p || !p.offsetWidth) return;
    const loc = p.querySelector('.vloc'); if (loc) loc.classList.toggle('vempty', /^[\s–—-]*$/.test(loc.textContent));
    const q = p.querySelector('.quick'), sc = (p.getBoundingClientRect().width / (p.offsetWidth || 1)) || 1;
    let g = p.querySelector(':scope > .eqgrid');
    if (!g) { const src = [p.querySelector('.eqtabs'), p.querySelector('.eqacts'), p.querySelector('.eqside')].filter(Boolean); if (!src.length || !q) return;
      const ref = q.querySelector('.qk'); g = document.createElement('div'); g.className = 'eqgrid'; p.appendChild(g);
      src.forEach(c => { [...c.children].forEach(k => { if (ref && !c.classList.contains('eqtabs')) { const cs = getComputedStyle(ref); ['background', 'border', 'border-radius', 'box-shadow'].forEach(x => k.style.setProperty(x, cs.getPropertyValue(x), 'important')); } g.appendChild(k); }); c.classList.add('eqgone'); }); }
    const body = p.querySelector('.eqbody');
    if (!p.dataset.tidyW) { /* measured once, before anything is moved: the body keeps its own width, the panel widens for the grid */
      body.style.setProperty('width', body.offsetWidth + 'px', 'important'); body.style.setProperty('flex', 'none', 'important'); p.dataset.tidyW = '1'; }
    /* the grid sits right of the quick keys, rows aligned with the quick keys' grid */
    const qr = q.getBoundingClientRect(), pr = p.getBoundingClientRect(), br = body.getBoundingClientRect();
    const left = (qr.right - pr.left) / sc + 16, rows = Math.ceil(g.children.length / 3), gh = rows * 118 + (rows - 1) * 7, bottom = (qr.bottom - pr.top) / sc, top = Math.max((br.top - pr.top) / sc, bottom - gh);
    g.style.left = left.toFixed(0) + 'px'; g.style.top = top.toFixed(0) + 'px';
    const need = Math.round(left + 3 * 81 + 16 + 16); if (!p.dataset.tidyPW) { p.dataset.tidyPW = need; } const pw = +p.dataset.tidyPW; if (Math.abs(p.offsetWidth - pw) > 2) p.style.setProperty('width', pw + 'px', 'important');
    const hd = p.querySelector('.eqhead'); if (hd) hd.style.setProperty('width', (pw - 40) + 'px', 'important');
    /* the FPS page key right next to the panel */
    const mh = document.querySelector('#chrome .menuhandle'); if (mh && mh.offsetWidth) { const hb = mh.getBoundingClientRect(), A = document.getElementById('area'), as = (A.getBoundingClientRect().width / 2560) || 1;
      const want = pr.left - hb.width - 16 * as, top2 = pr.top; const tr = (mh.style.translate || '0px 0px').split(' ').map(v => parseFloat(v) || 0); const dx = (want - hb.left) / as, dy = (top2 - hb.top) / as;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) { mh.style.translate = (tr[0] + dx).toFixed(1) + 'px ' + ((tr[1] || 0) + dy).toFixed(1) + 'px'; mh.dataset.holoFps = '1'; } }
  }
  setInterval(() => { try { const on = !!document.querySelector('#area .eqpanel'); if (on) tidy(); else { const h = document.querySelector('#chrome .menuhandle'); if (h && h.dataset.holoFps) { h.style.translate = ''; delete h.dataset.holoFps; } } } catch (e) {} }, 400);
})();

/* SPEED LIMITER ON / OFF (RAZ 25 NOV: "we don't have a speed limiter on or off button so the outside pill of the +- tab is a button surface that sets
   speed limiter to on or off ... that goes for flight only"). FLIGHT page only: a tap on the SPEED LIMITER box (not on - / + inside) toggles the limiter.
   Lit = ON, dark = OFF (his rule), from the game's real state (flight.settings.ifcs_speed_limiter.active) whenever telemetry is on; without game data the
   box shows the last tap. Game action: v_ifcs_speed_limiter_toggle (sent through the deck's key engine like the other deck keys). */
(function () {
  let mem = false, box = null;
  const pageNow = () => { const t = document.querySelector('.tab.left.on'); return t ? t.textContent.replace(/[^A-Z ]/g, '').trim() : ''; };
  const live = () => { try { if (typeof hasV === 'function' && !hasV()) return null; if (typeof VSt !== 'function') return null; const v = VSt('flight.settings.ifcs_speed_limiter.active'); return v == null ? null : !!v; } catch (e) { return null; } };
  const find = () => { if (pageNow() !== 'FLIGHT') return null; const lab = document.querySelector('#area .nt[data-lvl="SPEED LIMITER"]'); if (!lab || !lab.offsetWidth) return null;
    const lb = lab.getBoundingClientRect(), cx = lb.left + lb.width / 2;
    return [...document.querySelectorAll('#area .nb:not(.k)')].find(e => !e.closest('.scanold,.oldlayer') && (b => b.left < cx && b.right > cx && b.height > 150)(e.getBoundingClientRect())) || null; };
  const paint = () => { const b = find(); if (box && box !== b) box.classList.remove('lit', 'sl-on', 'sl-off'); box = b; if (!b) return;
    const v = live(), on = v == null ? mem : v; if (v != null) mem = v;
    b.classList.toggle('lit', on); b.classList.toggle('sl-on', on); b.classList.toggle('sl-off', !on); b.dataset.act = 'v_ifcs_speed_limiter_toggle'; b.style.cursor = 'pointer';
    b.title = 'Speed limiter ' + (on ? 'ON' : 'OFF') + (v == null ? ' (last tap, no game data)' : '');
    /* 25 NOV RAZ: 'you still haven't installed the speed limiter on off label on the flight page. it's also a button': the box title says ON / OFF under SPEED LIMITER */
    /* 'no it switches remember it's a changing face': the title itself changes face (deck sand change), same size: SPEED LIMITER ON / SPEED LIMITER OFF */
    const lab = document.querySelector('#area .nt[data-lvl="SPEED LIMITER"]'), h = 'SPEED LIMITER<br>' + (on ? 'ON' : 'OFF');
    if (lab && lab.innerHTML !== h) { const first = !lab.dataset.slf; lab.dataset.slf = '1'; if (!first && typeof keyMorph === 'function') keyMorph(b, () => { lab.innerHTML = h; }); else lab.innerHTML = h; } };
  addEventListener('pointerup', e => { const b = find(); if (!b || !b.contains(e.target) || e.target.closest('.nb.k')) return;
    mem = !mem; b.classList.add('pressed'); setTimeout(() => b.classList.remove('pressed'), 180);
    try { dispatchEvent(new CustomEvent('cmdglas-action', { detail: { act: 'v_ifcs_speed_limiter_toggle', kind: 'tog', label: 'SPEED LIMITER' } })); } catch (x) {}
    paint(); }, true);
  setInterval(paint, 300);
})();
