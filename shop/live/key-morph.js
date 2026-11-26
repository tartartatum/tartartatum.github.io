/* KEY MORPH (chat 2, 24 NOV). RAZ: "continue working until the transitions are done correctly with the particle sandstorm from the transformation types 3 we have".
   Until now only a PAGE change ran the sand transition; a key that changed state (GEAR UP -> DOWN, ATC STANDBY -> HANGAR 03, LIGHTS ON, HELMET OFF ...) just swapped.
   keyMorph(list) runs the deck's OWN transition (the chosen type: sweep / swirl / grow, same sample + pair + trTick machinery as a page change) on only the keys
   that change, all in one go. Changes asked for within 80 ms are batched. While a transition runs, new changes wait for it.
   Also: layout hooks, so the flat rows and the FPS panel are built inside the page change and fly in with the sand like every other key. */
(function () {
  if (typeof sample !== 'function' || typeof pair !== 'function') return;
  const Q = []; let timer = null, running = false;
  window.keyMorph = function (k, mutate, opt) { if (!k || !k.isConnected) { mutate(); return; } if (running || busy) { mutate(); return; } /* 24 NOV RAZ: "the gear up and down must display as soon as it switches ... without holdup from the transformations" - never wait behind another transition, show it now */
    Q.push([k, mutate, opt || {}]); if (!timer) timer = setTimeout(flush, 30); };
  const KS = 2.5; /* key morphs run 2.5x the page-change speed */
  const _tt = trTick; trTick = function (now) { return _tt(TR && TR.ks ? TR.t0 + (now - TR.t0) * TR.ks : now); }; /* clock x KS only for key morphs; page changes keep their speed */
  async function flush() {
    timer = null; if (running || busy || !LOOK.scan) { Q.splice(0).forEach(([, m]) => m()); return; }
    const jobs = Q.splice(0); if (!jobs.length) return;
    running = true; busy = true;
    try {
      const keys = [...new Set(jobs.map(j => j[0]))].filter(k => k.isConnected);
      const mcsOf = ks => ks.flatMap(k => [...k.querySelectorAll('[data-mc]')].concat(k.matches('[data-mc]') ? [k] : []));
      const O = await sample({ querySelectorAll: () => mcsOf(keys) });
      const old = document.createElement('div'); old.className = 'oldlayer';
      keys.forEach(k => { const c = k.cloneNode(true), r = rel(k), ow = k.offsetWidth || r.w, oh = k.offsetHeight || r.h; Object.assign(c.style, { position: 'absolute', left: r.x + 'px', top: r.y + 'px', width: ow + 'px', height: oh + 'px', margin: '0', right: 'auto', bottom: 'auto', transformOrigin: '0 0', transform: `scale(${r.w / ow})` }); old.appendChild(c); }); /* clone sits exactly where the original is, scaled panels too */
      deck.insertBefore(old, fx);
      jobs.forEach(([, m]) => { try { m(); } catch (e) {} });
      const type = (jobs[0][2] && jobs[0][2].type) || TRT, newMC = mcsOf(keys);
      newMC.forEach(e => { if (type !== 'sweep') e.style.opacity = 0; else e.style.clipPath = 'inset(-20px 100% -20px -20px)'; });
      const N = await sample({ querySelectorAll: () => newMC });
      TR = { type, old, p1: Math.random() * 6.28, p2: Math.random() * 6.28, p3: Math.random() * 100,
        oldMC: [...old.querySelectorAll('[data-mc]')].map(e => ({ e, r: rel(e) })), newMC: newMC.map(e => ({ e, r: rel(e) })) };
      TR.parts = pair(O, N, type); if (jobs[0][2] && jobs[0][2].straight) TR.parts.forEach(q => { q.sw = 0; }); TR.parts.forEach(q => { const c = q.o || q.n; q.t0 = type !== 'sweep' ? (c.x / 2560) * .25 + q.jit * .08 : tRel(c.x, c.y); });
      glimMask([old]); TR.t0 = performance.now(); TR.ks = (jobs[0][2] && jobs[0][2].ks) || KS; /* section swaps pass ks:1 = same speed as a page change */ loop(trTick);
      const wait = () => new Promise(r => { const t = () => (TR ? setTimeout(t, 60) : r()); t(); });
      await wait();
    } catch (e) { busy = false; }
    running = false; if (Q.length) timer = setTimeout(flush, 30);
  }
  /* state keys: paintStates changes now morph (the first paint after a page build stays instant) */
  const _paint = paintStates;
  paintStates = function () {
    document.querySelectorAll('[data-sk]').forEach(k => {
      const id = k.dataset.sk, v = skVal(id), t = skTone(id), sv = v + '|' + t + '|' + (id === 'GEAR' && v === 'MOVING' ? gearS() : '');
      if (k._sv === sv) return;
      const first = k._sv === undefined;
      const apply = () => { k._sv = sv; k.classList.remove('kg', 'ka', 'kr', 'kfl', 'gdep', 'gret'); if (t) t.split(' ').forEach(c => k.classList.add(c)); k.classList.toggle('lit', !!t); if (id === 'GEAR') gearCells(k, v); k.querySelectorAll('.stw').forEach(e => e.textContent = v); };
      if (first || busy || id === 'GEAR') apply(); else { k._sv = sv; keyMorph(k, apply); } /* GEAR: shown the instant the telemetry switches (its own cell animation plays) */
    });
  };
  /* a page change always wins over a key morph that is still running */
  const _switch = switchMode;
  switchMode = async function (m) { if (running && TR) { finishTR(); } if (running) busy = false; return _switch.apply(this, arguments); };
  /* layout hooks: flat rows + FPS panel built inside the page change */
  window.__layoutHooks = window.__layoutHooks || [];
  const _layout = layout;
  layout = function () { _layout.apply(this, arguments); window.__layoutHooks.forEach(h => { try { h(); } catch (e) {} }); };
})();
/* SAND ON OBJECTS ONLY (chat 2, 24 NOV late). RAZ: "only put the sand animation over each object on screen not in any empty spaces".
   The sweep used to throw its star shower over the full 720 px height at the front line and slide a light band over the whole deck. Now the shower is born
   only inside the keys / readouts that are changing (their own boxes), drifts only a little, and the full-height band is off. */
(function () {
  if (typeof showerEmit !== 'function') return;
  showerEmit = function (front, dt) {
    if (!TR) return;
    const rs = (TR.oldMC || []).concat(TR.newMC || []).map(o => o.r).filter(r => r && r.w > 0 && r.x <= front && r.x + r.w >= front - 170);
    if (!rs.length) return;
    const area = rs.reduce((s, r) => s + r.h, 0), n = Math.round(1300 * dt / GLS * Math.min(1.5, area / 720));
    for (let k = 0; k < n && SHOWER.length < 3500; k++) {
      const r = rs[(Math.random() * rs.length) | 0], x = front - Math.pow(Math.random(), 1.6) * 170; if (x < r.x || x > r.x + r.w) continue;
      const w = Math.random();
      SHOWER.push({ x, y: r.y + Math.random() * r.h, vx: -45 * (.9 + .2 * w), vy: -10 * (.9 + .2 * w), r: w < .8 ? .7 + Math.random() * .6 : 1.3 + Math.random() * .7,
        a: .6 + Math.random() * .4, m: w < .45 ? 1 : (w < .9 ? 0 : 2), age: 0, life: .35 + Math.random() * .4 });
    }
    if (!showerOn && SHOWER.length) { showerOn = true; loop(showerTick); }
  };
  const v = document.getElementById('veil'); if (v) v.style.display = 'none';
})();
/* SCANNER + SAND INSIDE THE KEY (chat 2, 25 NOV). RAZ (typed in chat 4): "only the interior of the buttons should change via the particle effect. currently all sorts
   of odd twisting and warping going on. if the inside of the pill changes only the inside of the pill changes, the rest stays still. also when the layout of the deck
   changes, even just one button, the top to bottom scanner animation reveals the next layout."
   1. A key that changes state (LIGHTS ON, ATC HANGAR 03, a toggle on the bottom row): the sand falls in and builds out INSIDE the key (type 'grow'), never the curling
      wind ('swirl' twisted the sand across the key). The frame, rim and glow are not part of the effect (.oldlayer only carries the key's words), so they stay still.
   2. Any change of layout (a page tab, a bottom page SHIELDS -> WEAPONS, a telemetry page): a scanner line runs top to bottom; above the line the new layout is shown,
      below it the old one, frames and all. Nothing flies, nothing twists. The line spans only the width of the keys. */
(function () {
  if (typeof switchMode !== 'function' || typeof rel !== 'function') return;
  const DUR = Math.max(200, Math.min(8000, +new URLSearchParams(location.search).get('scanms') || 1150)); /* full deck height, ms (?scanms= slows it down for checking frame by frame) */
  const line = document.createElement('div'); line.className = 'scanline'; line.setAttribute('aria-hidden', 'true');
  line.style.cssText = 'position:absolute;left:0;top:0;width:0;height:3px;z-index:9;pointer-events:none;opacity:0;border-radius:2px;' +
    'background:linear-gradient(90deg,transparent,#3dabff 5%,#eaf5ff 50%,#3dabff 95%,transparent);box-shadow:0 0 8px #1f9eff,0 0 20px rgba(31,158,255,.55)';
  line.innerHTML = '<i style="position:absolute;left:4%;right:4%;bottom:3px;height:38px;background:linear-gradient(180deg,transparent,rgba(31,158,255,.13));border-radius:2px"></i>';
  deck.appendChild(line);
  { const st = document.createElement('style'); st.textContent = '.scanold,.scanold *{animation-play-state:paused!important;transition:none!important}'; document.head.appendChild(st); }
  /* HOLO LITE (25 NOV, RAZ after locks 386-388: "it's a laggy stuttering mess ... most of the writing is fuzzy").
     - The will-change hint on #area / #chrome (added for the comet) is gone: inside the Holo the deck is scaled, and a promoted layer gets drawn once and then
       stretched = fuzzy writing.
     - Inside the Holo (the deck page is framed) the always-running decoration stops: the shimmer sweep and the bottom pulse on every key (2 x 29 animations) and
       the mode key glow. On a see-through window every animated frame makes Windows redraw the whole window, so the deck now redraws only when something
       changes. Status animations (gear moving, warning flashes, the comet, the letter scramble) stay. The XENEON EDGE page (not framed) keeps the full look. */
  if (window !== window.top && new URLSearchParams(location.search).get('edge') !== '1') { /* 25 NOV: the Edge in chat 3's iCUE widget frame keeps the full Edge look */ document.documentElement.classList.add('in-holo'); const s2 = document.createElement('style');
    s2.textContent = 'html.in-holo .holo .sc,html.in-holo .holo .bb,html.in-holo #deck .dz,html.in-holo #deck .dz::before,html.in-holo #deck .dz::after,html.in-holo #deck .dz *,html.in-holo #deck .cdt{animation:none!important}'
      /* 25 NOV RAZ: "the button eject has an odd background glow and I can still see the black box cutoff on the left of the button, it looks like it's sitting
         in a black box with the corners cut off". On the see-through Holo the big side keys' black 18 px drop shadow showed as a dark box, and their 30-50 px outer
         halos as a glow around it. Inside the Holo they keep their face, outline and navy 3D base only; 25 NOV later (MASTER, his "odd background glow"): the blue edge glow is off too. */
      + 'html.in-holo #deck .dz{box-shadow:rgb(12,35,58) 0 4.5px 0 0,rgb(5,15,26) 0 9px 0 0,rgb(18,60,94) 0 9px 0 2px,rgba(31,158,255,.12) 0 0 40px 0 inset!important}'
      + 'html.in-holo #deck .dz::before{box-shadow:none!important}'; document.head.appendChild(s2); } /* smooth (25 NOV): the old page under the line is a still picture, not a second animated deck */
  /* SAND FALL (25 NOV) RAZ: "pages that spawn behind, if they aren't exactly like the page they replace, need the complete sand page transformation via top to
     bottom sand fall". At the scanner line every key / readout it crosses sheds metallic sand that falls down inside that same object (never into empty space). */
  const sc = document.createElement('canvas'); sc.width = 2560; sc.height = 720; sc.className = 'sandfall'; sc.setAttribute('aria-hidden', 'true');
  sc.style.cssText = 'position:absolute;left:0;top:0;width:2560px;height:720px;z-index:9;pointer-events:none'; deck.appendChild(sc);
  const sg = sc.getContext('2d'); let GR = [], sandOn = false, sandLast = 0, OB = [];
  const SOLIDS = '.nb,.dz,.flatk,.qk,.eqb,.eqt,.eqslot,.tab,.bp,[data-mc]';
  function objRects(roots) { const out = []; roots.forEach(r => r && r.querySelectorAll(SOLIDS).forEach(e => { if (e.parentElement && e.parentElement.closest('.nb,.dz,.flatk,.qk,.eqb,.eqt,.eqslot,.tab,.bp')) return; const q = rel(e); if (q.w > 6 && q.h > 6) out.push(q); })); return out; }
  /* COMET SCANNER (25 NOV) RAZ: "make the scanner line individual particles that trail behind the scanner animation. currently it's stuttery and the particles
     burn out all at once. as the scanner moves down it looks like a comet that releases little particles". The line is no longer a solid bar: its head is a dense
     band of bright particles, and every particle it sheds hangs back, drifts a little and fades on its OWN timer (0.4-1.6 s), so the trail thins out gradually.
     Particles only on keys / readouts, never in empty space. */
  function sandEmit(Y, dt, vLine) { for (const o of OB) { if (Y < o.y - 1 || Y > o.y + o.h + 1) continue;
      const nh = Math.min(70, Math.round(o.w * dt * 5)), nt = Math.min(30, Math.round(o.w * dt * 1.8));
      for (let i = 0; i < nh && GR.length < 6000; i++) { const w = Math.random(); /* head: bright, short-lived, rides just behind the line */
        GR.push({ x: o.x + Math.random() * o.w, y: Y + (Math.random() - .5) * 3, vx: (Math.random() - .5) * 14, vy: vLine * (.15 + Math.random() * .2), o, a: .8 + Math.random() * .2, s: w < .7 ? 1 : 2, l: 0, L: .12 + Math.random() * .22, c: w < .6 ? '#ffffff' : '#bfe3ff', h: 1 }); }
      for (let i = 0; i < nt && GR.length < 6000; i++) { const w = Math.random(); /* trail: released particles, each with its own life */
        GR.push({ x: o.x + Math.random() * o.w, y: Y - Math.random() * 3, vx: (Math.random() - .5) * 10, vy: -(4 + Math.random() * 22), o, a: .45 + Math.random() * .45, s: w < .85 ? 1 : 2, l: 0, L: .4 + Math.pow(Math.random(), 1.4) * 1.2, c: w < .45 ? '#eaf5ff' : (w < .8 ? '#9fb4c8' : '#3dabff'), h: 0 }); } } }
  function sandTick(now) { const dt = Math.min(.034, (now - (sandLast || now)) / 1000); sandLast = now; sg.clearRect(0, 0, 2560, 720);
    let n = 0;
    for (const p of GR) { p.l += dt; if (p.l > p.L) continue; p.vx *= (1 - 1.5 * dt); p.vy *= (1 - (p.h ? 3 : 1.2) * dt); p.x += p.vx * dt; p.y += p.vy * dt; const o = p.o;
      if (p.y < o.y || p.y > o.y + o.h - 1 || p.x < o.x || p.x > o.x + o.w - 1) continue;
      const f = p.l / p.L; sg.globalAlpha = p.a * (p.h ? (1 - f) : Math.pow(1 - f, 1.6) * Math.min(1, p.l * 12)); sg.fillStyle = p.c; sg.fillRect(p.x | 0, p.y | 0, p.s, p.s);
      if (p.s > 1 && f < .5) { sg.fillStyle = '#fff'; sg.fillRect(p.x | 0, p.y | 0, 1, 1); } GR[n++] = p; }
    GR.length = n; sg.globalAlpha = 1; if (GR.length || sandOn) requestAnimationFrame(sandTick); else sandLast = 0; }
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const objs = root => [...root.querySelectorAll('.nb,.dz,.tab,[data-mc]')].filter(e => e.offsetWidth).map(rel).filter(r => r.w > 2 && r.h > 2);
  function span(rs, fb) { if (!rs.length) return fb; const x0 = Math.min(...rs.map(r => r.x)), x1 = Math.max(...rs.map(r => r.x + r.w)), y0 = Math.min(...rs.map(r => r.y)), y1 = Math.max(...rs.map(r => r.y + r.h)); return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; }
  /* clip from rects measured ONCE per sweep (re-measuring every frame forced a re-layout per layer per frame = the stutter) */
  function clipC(el, g, Y, keepTop) { const cut = Math.max(0, Math.min(g.h, Y - g.y)) * g.s;
    if (keepTop) el.style.clipPath = cut <= 0 ? 'inset(0 0 100% 0)' : `inset(-40px -40px calc(100% - ${cut.toFixed(1)}px) -40px)`;
    else el.style.clipPath = `inset(${cut.toFixed(1)}px -40px -40px -40px)`; }
  const geo = el => { const r = rel(el); return { y: r.y, h: r.h || 1, s: (el.offsetHeight || r.h || 1) / (r.h || 1) }; };
  function clip(el, Y, keepTop) { clipC(el, geo(el), Y, keepTop); }
  const easeS = t => -(Math.cos(Math.PI * t) - 1) / 2; /* smooth start and stop, no jumps */
  function run(pairs, box, dur) {
    return new Promise(res => {
      OB = objRects(pairs.flatMap(p => [p.real, p.clone])); const G = pairs.map(p => ({ p, gr: geo(p.real), gc: geo(p.clone) }));
      sandOn = true; if (!sandLast) requestAnimationFrame(sandTick); let lastT = performance.now(), lastY = box.y - 6;
      const t0 = performance.now(); line.style.opacity = '0'; /* the comet's head is particles now; the solid bar stays hidden */
      /* whole-page sweeps: the browser's own animation engine moves the reveal (no per-frame style writes = no repaint stalls); particles follow the same curve */
      let done = false;
      const full = G.every(g => Math.abs(g.gr.y) < 2 && Math.abs(g.gr.h - 720) < 3 && Math.abs(g.gc.y) < 2) && typeof Element.prototype.animate === 'function', EZ = 'cubic-bezier(0.37, 0, 0.63, 1)', anims = [];
      if (full) { G.forEach(({ p }) => { p.real.style.clipPath = ''; p.clone.style.clipPath = '';
        anims.push(p.real.animate([{ clipPath: 'inset(-40px -40px 100% -40px)' }, { clipPath: 'inset(-40px -40px 0% -40px)' }], { duration: dur, easing: EZ, fill: 'forwards' }));
        anims.push(p.clone.animate([{ clipPath: 'inset(0% -40px -40px -40px)' }, { clipPath: 'inset(100% -40px -40px -40px)' }], { duration: dur, easing: EZ, fill: 'forwards' })); }); }
      const step = now => { const t = Math.min(1, (now - t0) / dur), Y = full ? 720 * easeS(t) : box.y - 6 + (box.h + 12) * easeS(t), dt = Math.min(.034, (now - lastT) / 1000);
        const vLine = dt > 0 ? (Y - lastY) / dt : 0;
        for (let yy = lastY + 2; yy < Y; yy += 2) sandEmit(yy, dt * 2 / Math.max(2, Y - lastY), vLine); /* fill the rows between frames so the trail has no gaps */
        sandEmit(Y, dt, vLine); lastT = now; lastY = Y;
        if (!full) G.forEach(({ p, gr, gc }) => { clipC(p.real, gr, Y, true); clipC(p.clone, gc, Y, false); });
        if (done) return; if (t < 1) requestAnimationFrame(step); else { done = true; anims.forEach(a => { try { a.cancel(); } catch (e) {} }); pairs.forEach(p => { p.clone.remove(); p.real.style.clipPath = ''; }); sandOn = false; res(); } };
      requestAnimationFrame(step);
      /* watchdog (25 NOV): when the window is hidden the browser stops animation frames, and a sweep could be left half done with its old-page copy on screen.
         Whatever happens, the sweep is finished DUR + 1.5 s after it started. */
      setTimeout(() => { if (done) return; done = true; anims.forEach(a => { try { a.cancel(); } catch (e) {} }); pairs.forEach(p => { p.clone.remove(); p.real.style.clipPath = ''; }); sandOn = false; GR.length = 0; res(); }, dur + 1500);
    });
  }
  /* GPU SCANNER (25 NOV) RAZ: "the holo needs smoothing out, the sand-fall scanner animation looks the worst". MASTER: GPU-friendly only (transform and opacity),
     no per-frame filter / clip / layout changes, no large canvas redraws, inside the keys.
     - Each key (and each loose readout) fades old -> new at the moment the line reaches it: one CSS opacity transition per key with a delay by its height.
       The browser runs them itself; no script runs per frame.
     - The line + its particle trail is ONE strip drawn once (particles dense at the line, thinning out behind it) and moved down by transform only.
     - The strip sits in a layer masked to the keys' rounded shapes (old and new), so sparks never show in empty space. */
  const sfx = document.createElement('div'); sfx.className = 'scanfx'; sfx.setAttribute('aria-hidden', 'true');
  sfx.style.cssText = 'position:absolute;left:0;top:0;width:2560px;height:720px;z-index:9;pointer-events:none;display:none;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-size:2560px 720px;mask-size:2560px 720px';
  const beam = document.createElement('div'); beam.style.cssText = 'position:absolute;left:0;top:-72px;width:2560px;height:72px;will-change:transform';
  { const c = document.createElement('canvas'); c.width = 2560; c.height = 72; const g = c.getContext('2d');
    for (let i = 0; i < 9000; i++) { const f = Math.pow(Math.random(), .5), y = 68 - (1 - f) * 66, x = Math.random() * 2560, w = Math.random(), a = (.15 + .85 * f * f) * (.5 + Math.random() * .5);
      g.fillStyle = w < .55 ? `rgba(234,245,255,${a.toFixed(2)})` : (w < .85 ? `rgba(165,185,205,${a.toFixed(2)})` : `rgba(61,171,255,${a.toFixed(2)})`); const s = w > .9 ? 2 : 1; g.fillRect(x | 0, y | 0, s, s); }
    for (let x = 0; x < 2560; x++) { if (Math.random() < .8) { g.fillStyle = `rgba(255,255,255,${(.6 + Math.random() * .4).toFixed(2)})`; g.fillRect(x, 69 + ((Math.random() * 2) | 0), 1, 1); } }
    const gr = g.createLinearGradient(0, 66, 0, 72); gr.addColorStop(0, 'rgba(31,158,255,0)'); gr.addColorStop(.6, 'rgba(61,171,255,.35)'); gr.addColorStop(1, 'rgba(31,158,255,0)'); g.fillStyle = gr; g.fillRect(0, 66, 2560, 6);
    beam.style.background = `url(${c.toDataURL()}) 0 0/2560px 72px no-repeat`; }
  sfx.appendChild(beam); deck.appendChild(sfx);
  const CANDS = '.nb,.dz,.flatk,.qk,.eqb,.eqt,.eqslot,.tab,.bp,[data-mc]';
  function cands(root) { return [...root.querySelectorAll(CANDS)].filter(e => { if (!e.offsetWidth || e.closest('.oldlayer')) return false; for (let p = e.parentElement; p && p !== root; p = p.parentElement) if (p.matches(CANDS)) return false; return true; }); }
  async function runSweep(pairs, dur) {
    const olds = pairs.flatMap(p => cands(p.clone)), news = pairs.flatMap(p => cands(p.real)), F = 190, shapes = [], prev = new Map();
    const plan = (els, show) => els.forEach(e => { const r = rel(e); if (r.w > 2 && r.h > 2) shapes.push(r); prev.set(e, [e.style.opacity, e.style.transition]);
      e.__swd = Math.round(Math.max(0, Math.min(1, (r.y + r.h * .5) / 720)) * (dur - F)); e.__sws = show; e.style.transition = 'none'; e.style.opacity = show ? '0' : '1'; });
    plan(olds, false); plan(news, true);
    pairs.forEach(p => { p.real.style.clipPath = ''; p.clone.style.clipPath = ''; });
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='2560' height='720'><g fill='#fff'>${shapes.map(r => `<rect x='${(r.x - 2).toFixed(0)}' y='${(r.y - 2).toFixed(0)}' width='${(r.w + 4).toFixed(0)}' height='${(r.h + 4).toFixed(0)}' rx='${Math.min(26, r.h / 2, r.w / 2).toFixed(0)}'/>`).join('')}</g></svg>`;
    const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`; sfx.style.webkitMaskImage = url; sfx.style.maskImage = url;
    void deck.offsetWidth; /* one style flush, then the browser animates */
    [...olds, ...news].forEach(e => { e.style.transition = `opacity ${F}ms ease-out ${e.__swd}ms`; e.style.opacity = e.__sws ? '1' : '0'; });
    sfx.style.display = 'block'; let an = null; try { an = beam.animate([{ transform: 'translateY(0px)' }, { transform: 'translateY(800px)' }], { duration: dur, easing: 'linear' }); } catch (e) {}
    await new Promise(r => setTimeout(r, dur + 80));
    try { an && an.cancel(); } catch (e) {} sfx.style.display = 'none';
    news.forEach(e => { const pv = prev.get(e) || ['', '']; e.style.opacity = pv[0]; e.style.transition = pv[1]; delete e.__swd; delete e.__sws; });
    pairs.forEach(p => p.clone.remove());
  }
  function cloneOf(el, layer) { const c = el.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.classList.add('scanold'); c.style.pointerEvents = 'none';
    if (!layer) { c.removeAttribute('id'); Object.assign(c.style, { position: 'absolute', left: el.offsetLeft + 'px', top: el.offsetTop + 'px', width: el.offsetWidth + 'px', height: el.offsetHeight + 'px', margin: '0', zIndex: '5' }); }
    el.after(c); return c; } /* a whole layer keeps its id so its own CSS still applies; it sits after the real one, so getElementById and the deck's own area / chrome stay the real ones */
  /* 2. page change + 3. page swaps (bottom key pages, telemetry pages). 25 NOV RAZ: "there should be no button shifting on screen if the next page is different
     even in the most minute way as far as the button layout is concerned, the top down sand fall changes the entire page".
     Rule: the new page is built hidden, the deck's own centring settles, then the button LAYOUT (every button's place and size) is compared with the old one.
     - Different in any way -> the WHOLE page changes with the top-down sand fall (old page below the line, new page above it). No key ever moves on screen.
     - Exactly the same layout -> only the words inside the keys change, with the sand inside each key (frames still). */
  /* LETTER SCRAMBLE (25 NOV) RAZ: "the interior change should just be the letter scramble. the only time you get the sand effect is during button changes on
     pages". When only the words in a key change (a state, or a page with the same button layout), the new words scramble in: every letter cycles through
     random glyphs and locks in from left to right in about 0.4 s. No sand, frames never move. */
  const GLY = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&+=<>/';
  const textsOf = k => { const tw = document.createTreeWalker(k, NodeFilter.SHOW_TEXT), out = []; let n;
    while ((n = tw.nextNode())) { if (!n.nodeValue.trim() || (n.parentElement && n.parentElement.closest('svg,style,script'))) continue; out.push(n); } return out; };
  function scramble(k, before) { /* before = the key's words before the change (in order): only words that changed scramble */
    if (!k || !k.isConnected) return; let nodes = textsOf(k);
    if (before) { const b = before.map(s => s.trim()); nodes = nodes.filter((nd, i) => b[i] !== nd.nodeValue.trim()); }
    if (!nodes.length) return;
    const total = nodes.reduce((s, x) => s + x.nodeValue.length, 0), D = Math.min(650, 280 + total * 12), t0 = performance.now(), id = {};
    const jobs = nodes.map((nd, j) => { const fin = nd.nodeValue; nd.__scr = id; return { nd, fin, last: null, thr: [...fin].map((c, i) => .15 + .7 * (i / Math.max(1, fin.length - 1)) * .85 + Math.random() * .12) }; });
    const step = now => { const p = Math.min(1, (now - t0) / D); let alive = false;
      for (const j of jobs) { if (j.nd.__scr !== id || !j.nd.isConnected) continue; if (j.last !== null && j.nd.nodeValue !== j.last) { j.nd.__scr = null; continue; } /* someone else changed it: leave it */
        const s = p >= 1 ? j.fin : [...j.fin].map((c, i) => (c === ' ' || p > j.thr[i]) ? c : GLY[(Math.random() * GLY.length) | 0]).join('');
        if (s !== j.nd.nodeValue) j.nd.nodeValue = s; j.last = s; if (p < 1) alive = true; else j.nd.__scr = null; }
      if (alive) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  window.__scramble = scramble;
  /* RETREAT + POP (25 NOV) RAZ (typed in chat 3): "the buttons are supposed to have the ... effect for the keys, currently it's something else ... should look like
     the switch on the right ... see how it retreats back into the button then pops back out during the change ... I don't like how mine shows characters in the
     middle of the switchover". So no letter scramble: the key's words shrink back into the key and fade (0.11 s), the new words pop back out with a small bounce
     (0.2 s). Scale and opacity only, the frame never moves. */
  const mcOf = k => k && (k.querySelector('[data-mc]') || (k.matches && k.matches('[data-mc]') ? k : null));
  function pop(k) { const m = mcOf(k); if (!m || typeof m.animate !== 'function') return;
    try { m.animate([{ transform: 'scale(.15)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: .7 }, { transform: 'scale(1)', opacity: 1 }], { duration: 200, easing: 'cubic-bezier(.2,.7,.3,1)' }); } catch (e) {} }
  function retreatPop(k, mutate) { const m = mcOf(k);
    if (!m || typeof m.animate !== 'function' || k.__rp || document.hidden) { try { mutate(); } catch (e) {} if (m && !document.hidden) pop(k); return; }
    k.__rp = 1; let a = null; try { a = m.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.15)', opacity: 0 }], { duration: 110, easing: 'ease-in', fill: 'forwards' }); } catch (e) {}
    const go = () => { if (!k.__rp) return; k.__rp = 0; try { mutate(); } catch (e) {} try { a && a.cancel(); } catch (e) {} pop(k); };
    if (a) a.onfinish = go; setTimeout(go, 160); /* the timer finishes it even when no frames come */ }
  window.__retreatPop = retreatPop;
  const SOL = '.nb,.dz,.flatk,.qk,.eqb,.eqt,.eqslot,.tab,.bp';
  const solidsOf = r => [...r.querySelectorAll(SOL)].filter(e => !(e.parentElement && e.parentElement.closest(SOL)) && !e.closest('.oldlayer'));
  function sig(roots) { return roots.map(r => { const R = r.getBoundingClientRect(); return solidsOf(r).map(e => { const b = e.getBoundingClientRect(), v = e.offsetWidth && getComputedStyle(e).visibility !== 'hidden';
    return v ? [b.left - R.left, b.top - R.top, b.width, b.height].map(Math.round).join(',') : '-'; }).join(';'); }).join('|'); }
  const settle = () => new Promise(r => { let ok = false; const fin = () => { if (!ok) { ok = true; r(); } }; setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(fin)), 0); setTimeout(fin, 150); }); /* 25 NOV: never wait on animation frames alone - a hidden Holo window gets none, which left the old page on screen and the deck stuck */
  const mcsOf = ks => ks.flatMap(k => [...k.querySelectorAll('[data-mc]')].concat(k.matches('[data-mc]') ? [k] : []));
  async function inKey(oldKs, newKs) { /* the deck's own 'grow' sand, only inside these keys; frames are never part of it */
    const O = await sample({ querySelectorAll: () => mcsOf(oldKs) });
    const old = document.createElement('div'); old.className = 'oldlayer';
    oldKs.forEach(k => { const c = k.cloneNode(true), r = rel(k), ow = k.offsetWidth || r.w, oh = k.offsetHeight || r.h; c.classList.remove('scanold');
      Object.assign(c.style, { position: 'absolute', left: r.x + 'px', top: r.y + 'px', width: ow + 'px', height: oh + 'px', margin: '0', right: 'auto', bottom: 'auto', transformOrigin: '0 0', transform: `scale(${r.w / ow})`, clipPath: '' }); old.appendChild(c); });
    return { O, old };
  }
  async function playInKey(O, old, newKs, whole) { /* 25 NOV: particles fly STRAIGHT from the old letters to the new ones (type swirl with no curl) */
    deck.insertBefore(old, fx); const newMC = mcsOf(newKs); newMC.forEach(e => e.style.opacity = 0);
    const N = await sample({ querySelectorAll: () => newMC });
    TR = { type: 'swirl', old, p1: Math.random() * 6.28, p2: Math.random() * 6.28, p3: Math.random() * 100, oldMC: [...old.querySelectorAll('[data-mc]')].map(e => ({ e, r: rel(e) })), newMC: newMC.map(e => ({ e, r: rel(e) })) };
    TR.parts = pair(O, N, 'swirl'); TR.parts.forEach(q => { q.sw = 0; const c = q.o || q.n; q.t0 = (c.x / 2560) * .25 + q.jit * .08; });
    glimMask(whole ? [old, area, chrome] : [old]); TR.t0 = performance.now(); TR.ks = whole ? 1.2 : 2; loop(trTick);
    await new Promise(r => { const w = () => (TR ? setTimeout(w, 60) : r()); w(); });
  }
  /* change(mutate, changedKeys): changedKeys = the keys whose words change (null = whole page) */
  function sweepClean() { document.querySelectorAll('.scanold').forEach(e => e.remove()); [area, chrome].forEach(el => { el.style.clipPath = ''; try { el.getAnimations().forEach(a => a.cancel()); } catch (e) {} }); }
  /* cleaner (25 NOV, chat 3 found 2 old-page copies left in his live Holo = the big MOBIGLAS / RESPAWN keys on the FPS page): every 2 s, when no change is running,
     any leftover copy is removed and the real page is fully shown again */
  let staleSeen = 0;
  setInterval(() => { if (sandOn || !document.querySelector('.scanold')) { staleSeen = 0; return; } if (!busy || ++staleSeen >= 2) { sweepClean(); busy = false; staleSeen = 0; } }, 2000); /* a copy that outlives its sweep by 4 s is removed and the deck unblocked */
  async function change(mutate, changed) {
    sweepClean();
    const roots = [area, chrome], sigA = sig(roots);
    const pairs = roots.map(el => ({ real: el, clone: cloneOf(el, true) }));
    pairs.forEach(p => { p.tr = p.real.style.transition; p.real.style.transition = 'none'; clip(p.real, -999, true); });
    const solA = solidsOf(area).concat(solidsOf(chrome));
    try { mutate(); } catch (e) {}
    await settle();
    const sigB = sig(roots), restore = () => pairs.forEach(p => { p.clone.remove(); p.real.style.clipPath = ''; p.real.style.transition = p.tr || ''; });
    if (sigA === sigB) { /* same layout: only the words change -> letter scramble inside those keys */
      const solB = solidsOf(area).concat(solidsOf(chrome)), cA = solidsOf(pairs[0].clone).concat(solidsOf(pairs[1].clone));
      let idx = changed ? changed.map(k => solB.indexOf(k)).filter(i => i >= 0) : solB.map((k, i) => i);
      idx = idx.filter(i => cA[i] && (cA[i].textContent || '').replace(/\s+/g, ' ') !== (solB[i].textContent || '').replace(/\s+/g, ' '));
      if (!idx.length) { restore(); return; }
      { const { O, old } = await inKey(idx.map(i => cA[i]), idx.map(i => solB[i])); restore(); await playInKey(O, old, idx.map(i => solB[i])); } return; /* 25 NOV RAZ: "the text dissolves into little particles and the particles write the new words" */
    }
    const box = span(objs(pairs[0].clone).concat(objs(pairs[1].clone), objs(area), objs(chrome)), { x: 0, y: 0, w: 2560, h: 720 });
    /* 25 NOV RAZ: "the button swap animation on the desktop holo is incorrect, it's a wipe animation now ... the text dissolves into little particles and the
       particles write the new words": no wipe. The old page's words dissolve into particles that fly to and write the new page's words. */
    try { const oA = solidsOf(pairs[0].clone).concat(solidsOf(pairs[1].clone)), nA = solidsOf(area).concat(solidsOf(chrome));
      const { O, old } = await inKey(oA, nA); restore(); await playInKey(O, old, nA, true); } catch (e) { restore(); }
  }
  switchMode = async function (m) {
    if (m === mode || busy) return; if (TR) finishTR(); busy = true;
    const go = () => { chrome.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.m === m)); mode = m; layout(); };
    if (!LOOK.scan) { go(); busy = false; return; }
    try { await change(go, null); } catch (e) {} finally { if (!sandOn) sweepClean(); }
    busy = false; try { if (typeof paintStates === 'function') paintStates(); } catch (e) {}
  };
  /* 1 + page swaps of keys */
  const _km = window.keyMorph; let SQ = [], st = null;
  window.keyMorph = function (k, mutate, opt) { opt = opt || {};
    if (!(opt.ks === 1 || opt.type)) { if (!k || !k.isConnected) { try { mutate(); } catch (e) {} return; } return _km(k, mutate, { type: 'swirl', straight: 1 }); } /* 25 NOV: particles write the new words */ /* a state change: the words retreat into the key and pop back out */ /* a state change: letter scramble inside the key, no sand */
    if (!k || !k.isConnected || !LOOK.scan || busy) { mutate(); return; }
    SQ.push([k, mutate]); if (!st) st = setTimeout(flushScan, 20);
  };
  async function flushScan() {
    st = null; const jobs = SQ.splice(0).filter(j => j[0].isConnected); if (!jobs.length) return;
    if (busy) { jobs.forEach(([, m]) => { try { m(); } catch (e) {} }); return; } busy = true;
    try { await change(() => jobs.forEach(([, m]) => { try { m(); } catch (e) {} }), [...new Set(jobs.map(j => j[0]))]); } catch (e) {} finally { if (!sandOn) sweepClean(); }
    busy = false;
  }
})();
/* HIDDEN DUST STOP (chat 2, 25 NOV; Holo CPU still 269 % of a core after Holo lite). The background "space dust" loop redrew 1,600 specks on a 2560 x 720 canvas
   30 times a second and kept the frame clock running at every screen refresh, but hd-float.css hides that canvas (display:none), so it drew for nothing.
   Now it only runs while its canvas is actually shown; otherwise it looks again once a second. */
(function () {
  if (typeof dustTick !== 'function' || typeof loop !== 'function') return;
  const dc = document.getElementById('dust'), _dt = dustTick;
  dustTick = function (t) { if (!dc || getComputedStyle(dc).display === 'none' || document.hidden) { setTimeout(() => loop(dustTick), 1000); return; } return _dt(t); };
})();
/* NO SELF-RUNNING DEMO ON HIS DECK (chat 2, 25 NOV). Without live game data the deck started a sales demo that switched pages by itself every 4.5 s. His Holo and
   Edge load ?full=1 without demo=0, so with the game / telemetry helper off the deck kept flipping pages, each with a sand fall: CPU and "the transitions are all
   wrong". On ?full=1 pages the demo now only runs when asked for with ?demo=1 (film / shop pages pass their own settings). */
(function () {
  const q = new URLSearchParams(location.search);
  if (q.has('full') && q.get('demo') !== '1') { try { if (typeof DEMO_T !== 'undefined' && DEMO_T) { clearInterval(DEMO_T); DEMO_T = 0; } } catch (e) {} }
})();
/* EDGE PILL (chat 2, 25 NOV). RAZ: "use the current holo programming layout and just copy and paste it into the pill with the clan symbol around it ... that's the
   only addition, a pill around the damn thing that makes it look like a raised hologram". ?edge=1 (the XENEON EDGE kiosk): the Holo deck exactly as it is, but the
   few hd-float.css rules that took the original deck's outer pill, its raised slab and the clan symbol away are removed again. The group panels, key rims and the
   background glitter stay off, as on the Holo. */
(function () {
  if (new URLSearchParams(location.search).get('edge') !== '1') return;
  const DROP = [/^html, ?body, ?#wrap, ?#deck$/, /^#deck#deck$/, /^#deck#deck::before, ?#deck#deck::after$/, /^svg\.eclfedge/, /^#deck#deck svg\.eclfedge$/, /^\.ecl, ?g\.ecl/];
  let tries = 0;
  const fix = () => { const sh = [...document.styleSheets].find(s => /hd-float\.css/.test(s.href || ''));
    if (!sh) { if (++tries < 50) setTimeout(fix, 100); return; }
    let rules; try { rules = sh.cssRules; } catch (e) { return; }
    for (let i = rules.length - 1; i >= 0; i--) { const r = rules[i], s = (r.selectorText || '').trim();
      if (DROP.some(rx => rx.test(s))) { sh.deleteRule(i); continue; }
    } /* key rims and slabs stay hidden as on the Holo (they drew ghost outlines of the hidden menu) */
    document.documentElement.classList.add('edge-pill');
    /* the pill edge = a raised hologram: RSI-blue edge line, soft glow, a dark base under it like the keys' 3D base */
    const st = document.createElement('style');
    /* 25 NOV RAZ: "the clan symbol ... needs to be on the outer pill line and the outer pill line must look like it's a raised hologram". On the Edge the screen IS
       the deck (2560 x 720), so a line outside the deck would be off screen: the pill is its own line 12 px inside the edge - bright RSI-blue edge, soft glow out
       and in, light top bevel, dark bottom bevel, a faint second line inside it and a dark base under it, so it reads as a raised hologram. */
    const pill = document.createElement('div'); pill.className = 'edgepill'; pill.setAttribute('aria-hidden', 'true'); document.getElementById('deck').appendChild(pill);
    /* EDGE v2 (25 NOV) RAZ: "that looks out of scale for the size of the pill, the outline looks cheap ... make the deck fit the entire display so make the
       interior larger ... give the entire deck a darker than everything else fine honeycomb".
       - background: the whole deck is a fine honeycomb on near-black, darker than every key
       - pill: one crisp 1.5 px RSI-blue line with a thin inner line 6 px inside it, light concentrated along the top edge (a lit upper bevel) and a dark lower
         bevel, small soft glow only - a precise raised frame instead of a thick glowing tube */
    /* 25 NOV, RAZ: "contain honeycomb to inside display are only" -> the page outside the pill is plain near-black; the honeycomb is its own layer with the pill's exact shape, under the pill */
    const hex = document.createElement('div'); hex.className = 'edgehex'; hex.setAttribute('aria-hidden', 'true'); document.getElementById('deck').appendChild(hex);
    st.textContent = 'html.edge-pill #deck#deck{box-shadow:none!important;background:#010304!important}'
      /* 25 NOV, RAZ: "all those more pills are missaligned inside the bounds of the deck as well as the big buttons throughtout all those pages. make it symmetrical
         and fit inside the edge deck as it is displayed": the MORE sheet (content x 24-2528, y 18-708) is scaled as one piece into the pill with equal margins
         (x 93-2467, y 32-686), so the area tabs, the key grid and the top keys sit inside the pill line, centred */
      + 'html.edge-pill #more{transform-origin:0 0!important;transform:translate(70.2px,14.9px) scale(.948)!important}'
      /* + "you can't see the individual pill outlines becuase the pills are too loargde": each key shrinks in its own cell (same grid), so every outline stands
         clear with an even gap; the area tabs a little too */
      + 'html.edge-pill #more .nb.k:not(.mk){scale:.84}html.edge-pill #more .tab[data-ma]{scale:.9}'
      /* + "now incerease the size of the font inside those buttons to something more comfortalbe": key names 21 -> 27 px, small lines 13.5 -> 16 px, area tabs 16 -> 19 px */
      + 'html.edge-pill #more .nb.k:not(.mk) .nt{font-size:27px!important;line-height:1.08!important}html.edge-pill #more .nb.k:not(.mk) .ns{font-size:16px!important}html.edge-pill #more .tab[data-ma]{font-size:19px!important}'
      + 'html.edge-pill .edgehex{position:absolute;left:22px;top:10px;right:22px;bottom:12px;z-index:1;pointer-events:none;border-radius:34px;background:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2714%27 height=%2724%27%3E%3Cpath d=%27M7 0l7 4v8l-7 4-7-4V4z M7 16v8%27 fill=%27none%27 stroke=%27%2360b5ff%27 stroke-opacity=%27.13%27 stroke-width=%27.6%27/%3E%3C/svg%3E") 0 0/14px 24px repeat}'
      + 'html.edge-pill .edgepill{position:absolute;left:22px;top:10px;right:22px;bottom:12px;z-index:2;pointer-events:none;border-radius:30px;border:1.5px solid rgba(61,171,255,.9);'
      + 'box-shadow:0 0 8px rgba(31,158,255,.35),inset 0 1.5px 0 rgba(234,245,255,.55),inset 0 -2px 0 rgba(5,15,26,.95),inset 0 0 18px rgba(31,158,255,.10)}'
      /* 25 NOV later, RAZ: "the entire background of the edge holodeck needs the honeycomb background look ... blue and barely visible like on the buttons on the flight page": the deck background = the keys' own honeycomb (14 x 24, #60b5ff at 13 %). */
      /* EDGE v5 (25 NOV) RAZ: "the new pill outlines look too cheap ... the inner pills actually are simply dividers of the 3 sections ... make them look [like]
         the holo button inner pills" -> each divider = the keys' fine inner rim: a thin glowing line, faint inner glow, the small bright side glints the keys have; no
         fill, no base (they only divide). The OUTERMOST pill gets the keys' own raised look (copied from a key below). */
      + 'html.edge-pill .edgegrp{position:absolute;z-index:2;pointer-events:none;border-radius:30px;border:1px solid rgba(61,171,255,.55);background:transparent;box-shadow:0 0 6px rgba(31,158,255,.22),inset 0 0 12px rgba(31,158,255,.10),inset 0 0 0 4px rgba(0,0,0,.0)}'
      + 'html.edge-pill .edgegrp::before,html.edge-pill .edgegrp::after{content:"";position:absolute;top:50%;width:3px;height:34px;margin-top:-17px;border-radius:2px;background:linear-gradient(180deg,transparent,#eaf5ff 30%,#eaf5ff 70%,transparent);box-shadow:0 0 6px #1f9eff,0 0 2px #fff}'
      + 'html.edge-pill .edgegrp::before{left:-2px}html.edge-pill .edgegrp::after{right:-2px}'
      + 'html.edge-pill #deck svg.eclf.edge{visibility:hidden!important}'
      + 'html.edge-pill #deck svg.eclf-ring{position:absolute;z-index:8;pointer-events:none;visibility:visible!important;display:block!important;filter:drop-shadow(0 0 3px #1f9eff)}';
    document.head.appendChild(st);
    /* the clan rings sit on the pill's left and right edges (the original's right ring sat on a group panel the Holo layout no longer has) */
    const ring = () => { const src = [...document.querySelectorAll('#deck svg.eclf.edge')].find(s => s.getBoundingClientRect().width > 0); if (!src) return false;
      document.querySelectorAll('#deck svg.eclf-ring').forEach(e => e.remove());
      const r = rel(src), deckEl = document.getElementById('deck');
      [0, 1].forEach(side => { const c = src.cloneNode(true); c.setAttribute('class', 'eclf-ring'); c.removeAttribute('style');
        c.querySelectorAll(':scope > rect, :scope > polygon, :scope > line').forEach(e => e.remove()); /* RAZ: "there's a white line connected to the clan symbol" - only the ring stays */
        Object.assign(c.style, { left: ((side ? 2560 - 22.75 : 22.75) - r.w / 2) + 'px', top: (359 - r.h / 2) + 'px', /* centred ON the pill line (x 13 / 2547, the middle of its 2 px edge) */ width: r.w + 'px', height: r.h + 'px', transform: side ? 'scaleX(-1)' : 'none' });
        deckEl.appendChild(c); }); return true; };
    /* interior fills the display: the keys of each page are measured (with no extra scale), then scaled up around the screen centre and centred inside the pill */
    const SOLS = '.nb,.dz,.flatk,.qk,.eqb,.eqt,.eqslot,.tab,.bp,.fbdots';
    const grow = () => { const A = document.getElementById('area'), C = document.getElementById('chrome'); if (!A || !C) return;
      [A, C].forEach(e => { e.style.scale = ''; e.style.translate = ''; });
      const rs = [A, C].flatMap(root => [...root.querySelectorAll(SOLS)].filter(e => e.offsetWidth && getComputedStyle(e).visibility !== 'hidden' && +getComputedStyle(e).opacity > .05 && !e.closest('.scanold')).map(rel)).filter(r => r.w > 4 && r.h > 4);
      if (!rs.length) return; const x0 = Math.min(...rs.map(r => r.x)), x1 = Math.max(...rs.map(r => r.x + r.w)), y0 = Math.min(...rs.map(r => r.y)), y1 = Math.max(...rs.map(r => r.y + r.h));
      const s = Math.max(1, Math.min((2560 - 2 * 80) / (x1 - x0), (720 - 2 * 46) / (y1 - y0), 1.45)), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      [A, C].forEach(e => { e.style.transformOrigin = '1280px 360px'; e.style.scale = String(s.toFixed(4)); e.style.translate = `${(-(cx - 1280) * s).toFixed(1)}px ${(-(cy - 360) * s).toFixed(1)}px`; });
      groups(); matchHandle(); raiseOuter(); };
    const raiseOuter = () => { const pill = document.querySelector('#deck .edgepill'), key = [...document.querySelectorAll('#area .nb.k')].find(e => e.offsetWidth && !e.closest('.scanold')); if (!pill || !key) return;
      const cs = getComputedStyle(key); ['background', 'border', 'box-shadow'].forEach(k => pill.style.setProperty(k, cs.getPropertyValue(k), 'important')); pill.style.setProperty('border-radius', '34px', 'important');
      if (!pill.querySelector(':scope > .holo') && key.querySelector(':scope > .holo')) pill.insertBefore(key.querySelector(':scope > .holo').cloneNode(true), pill.firstChild); }; /* the outer pill = a key's raised glass (DECOUPLED, G-SAFE ...) */
    /* EDGE v4 (25 NOV) RAZ: "the flight pill isn't the same as the rest of the pills and is missing its bottom pill edge graphic and the honeycomb in it is
       different". The FLIGHT key is the folded page-menu handle, drawn with its own plain gradient. On the Edge it takes the big keys' own look: the same
       glass layers (honeycomb), edge and 3D base, copied from SHIP POWER. */
    const matchHandle = () => { const h = document.querySelector('#chrome .menuhandle'), dz = [...document.querySelectorAll('#deck .dz')].find(e => e.offsetWidth && !e.closest('.scanold'));
      if (!h || !dz) return; const cs = getComputedStyle(dz);
      if (!h.querySelector(':scope > .holo') && dz.querySelector(':scope > .holo')) { const hl = dz.querySelector(':scope > .holo').cloneNode(true); h.insertBefore(hl, h.firstChild); }
      ['background', 'border', 'border-radius', 'box-shadow'].forEach(k => h.style.setProperty(k, cs.getPropertyValue(k), 'important')); h.style.setProperty('overflow', 'visible', 'important'); };
    /* EDGE v3 (25 NOV) RAZ: "put flight ship power into their own raised pill and do the same with eject and self destruct to fill the empty space. do the same on
       the remaining buttons and move it away from the speed limiter and hold exit seat button symmetry". The keys split into three groups by the two widest gaps
       (left column, middle, right column); each gets its own raised pill reaching the full height inside the outer pill, with equal room on both sides. */
    const groups = () => { const deckEl = document.getElementById('deck'), A = document.getElementById('area'), C = document.getElementById('chrome');
      document.querySelectorAll('[data-edgedx]').forEach(e => { e.style.translate = ''; delete e.dataset.edgedx; });
      const els = [A, C].flatMap(root => [...root.querySelectorAll(SOLS)].filter(e => e.offsetWidth && getComputedStyle(e).visibility !== 'hidden' && +getComputedStyle(e).opacity > .05 && !e.closest('.scanold') && !(e.matches('.tab.left:not(.menuhandle)') && !document.body.classList.contains('menuopen')))).map(e => Object.assign(rel(e), { e })).filter(r => r.w > 4 && r.h > 4).sort((a, b) => a.x - b.x), rs = els; /* the folded page menu is not a group */
      deckEl.querySelectorAll('.edgegrp').forEach(e => e.remove()); if (rs.length < 3) return;
      const gaps = []; let right = rs[0].x + rs[0].w; for (let i = 1; i < rs.length; i++) { if (rs[i].x > right) gaps.push({ i, g: rs[i].x - right, at: right }); right = Math.max(right, rs[i].x + rs[i].w); }
      const cut = gaps.sort((a, b) => b.g - a.g).slice(0, 2).sort((a, b) => a.i - b.i).map(g => g.i); if (cut.length < 2) return;
      const sets = [rs.slice(0, cut[0]), rs.slice(cut[0], cut[1]), rs.slice(cut[1])];
      const top = 26, bottom = 720 - 28;
      const B = sets.map((S, n) => ({ x0: Math.min(...S.map(r => r.x)), x1: Math.max(...S.map(r => r.x + r.w)), pad: n === 1 ? 30 : 22 }));
      for (let n = 0; n < 2; n++) { const gap = B[n + 1].x0 - B[n].x1, room = (gap - 16) / 2; if (B[n].pad > room) B[n].pad = Math.max(8, room); if (B[n + 1].pad > room) B[n + 1].pad = Math.max(8, room); } /* at least 16 px between pills */
      B[1].pad = 34; /* the middle pill keeps the same 34 px of room left of SPEED LIMITER and right of EXIT SEAT (his symmetry); the side pills take what is left */
      /* the two side pills reach out to the outer pill and their keys sit in the middle of them (fills the empty room left and right) */
      const sc = parseFloat(A.style.scale) || 1, L0 = 40, R1 = 2520, lpR = B[1].x0 - B[1].pad - 16, rpL = B[1].x1 + B[1].pad + 16;
      [[0, L0, lpR], [2, rpL, R1]].forEach(([n, a, b]) => { const want = (a + b) / 2, have = (B[n].x0 + B[n].x1) / 2, dx = want - have;
        sets[n].forEach(r => { r.e.style.translate = `${(dx / sc).toFixed(1)}px 0px`; r.e.dataset.edgedx = '1'; });
        const w = B[n].x1 - B[n].x0; B[n].x0 = a + 0; B[n].x1 = b; B[n].pad = 0; void w; });
      B.forEach(b => { const d = document.createElement('div'); d.className = 'edgegrp'; Object.assign(d.style, { left: (b.x0 - b.pad) + 'px', top: top + 'px', width: (b.x1 - b.x0 + 2 * b.pad) + 'px', height: (bottom - top) + 'px' }); deckEl.appendChild(d); }); };
    (window.__layoutHooks = window.__layoutHooks || []).push(() => setTimeout(grow, 60)); setTimeout(grow, 400); setInterval(() => { if (!document.querySelector('.scanold')) grow(); }, 2000);
    let n = 0; const tryRing = () => { if (!ring() && ++n < 30) setTimeout(tryRing, 200); };
    if (new URLSearchParams(location.search).get('rings') !== '0') setTimeout(tryRing, 300); /* ?rings=0 = sale pictures: no clan symbol (sale products in RSI blue, no clan dots) */ };
  fix();
})();
/* FULL FIT (chat 2, 25 NOV). The deck page shrank itself to min(width/2620, (height-90)/780) to leave room for the old design-switcher bar under it. On the Edge
   that left the deck at about 80 % with a black border, and inside the Holo frame (2560 x 720) it drew the deck at 0.8 = soft text even with the 1:1 Holo window.
   On ?full=1 pages (Holo, Edge, shop) the deck now fills its window exactly: scale = min(width/2560, height/720), centred (1.0 on the Edge and in the Holo). */
(function () {
  const q = new URLSearchParams(location.search); if (!q.has('full') || q.get('shot') === '1' || typeof fit !== 'function') return; /* Holo AND Edge fill their window (the Holo has drawn at 1.0 since 3bdc8df4 and stays so - chat 3, 25 NOV); the Edge-v2 look itself is Edge-only */
  const deckEl = document.getElementById('deck'); if (!deckEl) return;
  const f2 = () => { const s = Math.min(innerWidth / 2560, innerHeight / 720); deckEl.style.position = 'absolute'; deckEl.style.left = '50%'; deckEl.style.top = '50%'; deckEl.style.transform = `translate(-50%,-50%) scale(${s})`; };
  try { fit = f2; } catch (e) {} f2(); addEventListener('resize', () => setTimeout(f2, 0));
  /* the page's original resize handler still calls the old fit(): whenever anything rewrites the deck's transform, the full fit is put back */
  let busyFit = false; try { new MutationObserver(() => { if (busyFit) return; const want = `translate(-50%, -50%) scale(${Math.min(innerWidth / 2560, innerHeight / 720)})`;
    if (deckEl.style.transform.replace(/\s+/g, '') !== want.replace(/\s+/g, '')) { busyFit = true; f2(); busyFit = false; } }).observe(deckEl, { attributes: true, attributeFilter: ['style'] }); } catch (e) {}
  setTimeout(f2, 300); setTimeout(f2, 1500);
})();
/* NO TEXT SELECTION (chat 2, 25 NOV). RAZ: "the buttons of my on screen holo deck have dark boxes behind them" = a text selection on FLIGHT, SPEED LIMITER,
   QUANTUM, CRUISE (a drag across the keys highlighted their words). Words on the deck can no longer be selected, and any selection is cleared. */
(function () { const st = document.createElement('style'); st.textContent = 'html,body,#deck,#deck *{-webkit-user-select:none!important;user-select:none!important;-webkit-touch-callout:none}#deck ::selection{background:transparent}';
  document.head.appendChild(st); const clr = () => { try { const s = getSelection(); if (s && s.rangeCount) s.removeAllRanges(); } catch (e) {} }; clr(); document.addEventListener('selectionchange', () => { if (String(getSelection() || '').length) clr(); }); })();
/* FOLDED MENU STAYS HIDDEN (chat 2, 25 NOV): the folded page menu hid itself with a 0.3 s fade; a window that gets no frames for a while (hidden Holo, a
   busy start) left it half faded = a ghost menu behind FLIGHT. Folded = hidden outright; opening the menu works as before. */
(function () { const st = document.createElement('style'); st.textContent = 'body.menuhid:not(.menuopen) #deck #chrome .tab.left:not(.menuhandle){opacity:0!important;transition:none!important}'
  /* 25 NOV RAZ: "the menu button returns on top of the underlying menu button. so one needs to be gone before the other one appears. never have one pill appear on
     top of another without a transition": opening, the page key fades out in 0.18 s and only then (0.2 s delay) the page list fades in; closing, the list is gone at
     once and the key fades back in after it. */
    + '#deck #chrome .menuhandle{transition:opacity .18s ease .2s!important}body.menuopen #deck #chrome .menuhandle{transition:opacity .18s ease 0s!important}'
    + 'body.menuhid.menuopen #deck #chrome .tab.left:not(.menuhandle){transition:opacity .2s ease .2s,transform .2s ease .2s!important}';
  document.head.appendChild(st); })();
