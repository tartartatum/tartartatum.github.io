/* Travel indicator, draft 5 (chat 2, 23 NOV). Pill, two ships next to each other.
   RAZ, typed in chat 2: "instead of the bending arrow use another method to indicate direction it's turning, it looks bad, find other samples.
   move the degree sweep readout away from the nose of the ship. don't make the ascend descent line so long. put it on the nose of the ship and start there.
   put the readout of the degrees for descent rate and climb rate in VSI style and put that number in line with the sideways view ship at the tail end in line."
   - climb / dive arrow: short, starts AT the nose; degree marks sit further out, away from the nose.
   - degrees readout: VSI style (up / down pointer + number in a box), left of the tail, level with the ship.
   - turn: three real-instrument samples (turnStyle): 'trend' = Garmin G1000 turn-rate trend bar with half / standard-rate marks,
     'coord' = turn coordinator wings with L / R standard-rate marks, 'chev' = chevrons beside the nose (like the speed chevrons).
   travelDial({fpa, accel, vs, turn, side64, top64, turnStyle}) -> SVG string (viewBox 760x220). Values from the bridge's snap.derived. */
(function(){
let UID = 0; // unique ids per drawn pill (the hologram layers reuse the content by id)
const TEAL_B = '#00f0ff', GRN = '#14ff63' /* olive tried 23 NOV, he: "no, that color is bad revert back to the way it was" */, AMB = '#ffae00', DIM = '#8c1024', TEAL = '#ff3550', NEU = '#ffe9ec'; // red holo deck face colors (23 NOV, RAZ: "fashion it after the current red new designs we have for the new edge deck face")
// deck key frame, same build as the ship status keys: 3D slab, dark honeycomb glass, neon outer rim + thin inner rim, "- - -" tab
const hot = (x, y, w, h, rx) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="url(#tdhot)"/>`;
let KX = 0, WO = false;
const ecl = (cx, cy, r = 9) => `<g class="ecl"><circle cx="${cx}" cy="${cy}" r="${r + 3}" fill="#ff1f3d" opacity=".16" style="filter:blur(3px)"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#000"/>
 <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#ff1f3d" stroke-width="${(r * .17).toFixed(2)}" style="filter:drop-shadow(0 0 ${(r * .25).toFixed(1)}px #ff1f3d)"/>
 <path d="M${(cx - r * .82).toFixed(2)} ${(cy + r * .1).toFixed(2)} A${(r * .86).toFixed(2)} ${(r * .86).toFixed(2)} 0 0 1 ${(cx - r * .1).toFixed(2)} ${(cy - r * .83).toFixed(2)}" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="${(r * .09).toFixed(2)}" stroke-linecap="round"/>
 <path d="M${cx} ${(cy - r * 1.55).toFixed(2)} L${(cx + r * .09).toFixed(2)} ${(cy - r * 1.06).toFixed(2)} L${(cx + r * .45).toFixed(2)} ${(cy - r).toFixed(2)} L${(cx + r * .09).toFixed(2)} ${(cy - r * .94).toFixed(2)} L${cx} ${(cy - r * .45).toFixed(2)} L${(cx - r * .09).toFixed(2)} ${(cy - r * .94).toFixed(2)} L${(cx - r * .45).toFixed(2)} ${(cy - r).toFixed(2)} L${(cx - r * .09).toFixed(2)} ${(cy - r * 1.06).toFixed(2)}Z" fill="#fff" style="filter:drop-shadow(0 0 ${(r * .3).toFixed(1)}px #ff1f3d)"/></g>`; // Low Signal clan eclipse (RAZ 23 NOV: "change that to the one you created for my clan symbol")
const eclT = (cx, cy, r, lw, d, bg) => { const g = r + 1, e = g + d, k = (r * .17).toFixed(2); // frame line tapers to the symbol's rim width over ~2 honeycombs (RAZ 23 NOV)
  const tr = s => `<polygon points="${cx - lw / 2},${cy + s * e} ${cx + lw / 2},${cy + s * e} ${cx + k / 2},${cy + s * g} ${cx - k / 2},${cy + s * g}" fill="#ff2a45" style="filter:drop-shadow(0 0 1.5px #ff1a38)"/>`; /* same red as the frame line */
  return `<rect x="${cx - lw * .8}" y="${cy - e}" width="${lw * 1.6}" height="${e * 2}" fill="${bg}"/>${tr(-1)}${tr(1)}${ecl(cx, cy, r)}`; };
function deckFrame(x, y, w, h, st, lit) { if (WO) return ''; const r = h / 2;
  /* READOUT STYLE (RAZ 23 NOV: "you already have a perect lcd type field going on inside the damage field under ship status. just remove the button pill outline but leave
     the little bright line to the left and right of each line"). Opt-in preview: window.TD_READOUT = true. Dark field with honeycomb behind the text (RAZ: "yes, the honeycomb the background of the lcd screen"), no outline, small radius,
     bright short line at the left and right ends, dashed line underneath (like the damage rows). Status color stays inside as a light wash. */
  if (typeof window === 'undefined' || window.TD_READOUT !== false) { /* ROLLED OUT 23 NOV (his yes): readout look is the default; window.TD_READOUT = false = old look */ const lh = Math.min(h * .5, 16), ly = y + (h - lh) / 2, gid = 'rdl' + (++KX);
    return `<g opacity="${lit ? 1 : .7}"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc2c8" stop-opacity="0"/><stop offset=".5" stop-color="#ffc2c8"/><stop offset="1" stop-color="#ffc2c8" stop-opacity="0"/></linearGradient></defs>
     <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="#0a0305" fill-opacity=".92"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${st}" fill-opacity="${lit ? .2 : .05}"/><pattern id="${gid}h" width="5.47" height="9.38" patternUnits="userSpaceOnUse" x="${x}" y="${y}"><path d="M2.73 0l2.73 1.56v3.13l-2.73 1.56-2.73-1.56V1.56z M2.73 6.25v3.13" fill="none" stroke="${st}" stroke-opacity=".14" stroke-width=".25"/></pattern><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="url(#${gid}h)"/>
     <line x1="${x + 6}" y1="${y + h + 1.5}" x2="${x + w - 6}" y2="${y + h + 1.5}" stroke="#ff5a6a" stroke-opacity=".35" stroke-width=".6" stroke-dasharray="2 2"/>
     <rect x="${x + 1.5}" y="${ly}" width="1.17" height="${lh}" rx=".6" fill="url(#${gid})" style="filter:drop-shadow(0 0 2px #ff1f3d)"/><rect x="${x + w - 2.67}" y="${ly}" width="1.17" height="${lh}" rx=".6" fill="url(#${gid})" style="filter:drop-shadow(0 0 2px #ff1f3d)"/></g>`; }
  return `<g opacity="${lit ? 1 : .62}"><rect x="${x}" y="${y + 4}" width="${w}" height="${h}" rx="${r}" fill="#ff1f3d" fill-opacity=".22"/>
   <rect x="${x}" y="${y + 2}" width="${w}" height="${h}" rx="${r}" fill="#0b0204" stroke="#ff1f3d" stroke-opacity=".35" stroke-width="1"/>
   <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="#070103"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${st}" fill-opacity="${lit ? .26 : .08}"/><pattern id="kx${++KX}" width="5.47" height="9.38" patternUnits="userSpaceOnUse" x="${x}" y="${y}"><path d="M2.73 0l2.73 1.56v3.13l-2.73 1.56-2.73-1.56V1.56z M2.73 6.25v3.13" fill="none" stroke="${st}" stroke-opacity=".3" stroke-width=".25"/></pattern><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#kx${KX})"/>
   <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="#ff1f3d" stroke-width="2.4" style="filter:drop-shadow(0 0 1.5px #ff1f3d) drop-shadow(0 0 3px rgba(255,31,61,.45))"/>
   ${[-6, 0, 6].map(o => `<rect x="${x + w / 2 + o - 2}" y="${y - 2.2}" width="4" height="2" rx="1" fill="#ff1f3d"/>`).join('')}
   ${[-28, 0, 28].map(g => { const ar = r - 6, t = g * Math.PI / 180;
      return `<circle cx="${(x + r - ar * Math.cos(t)).toFixed(2)}" cy="${(y + r + ar * Math.sin(t)).toFixed(2)}" r=".9" fill="#fff" opacity=".85"/><circle cx="${(x + w - r + ar * Math.cos(t)).toFixed(2)}" cy="${(y + r + ar * Math.sin(t)).toFixed(2)}" r=".9" fill="#fff" opacity=".85"/>`; }).join('')}</g>`; }
// text that may not cross the rim dots: if the estimated width is wider than the room, it is squeezed to fit exactly (textLength)
const DOT = 6, LIM = 14; // dots sit 6 in from the rim on the end curve; text keeps 14 clear of the key ends
function fitText(str, fs, room, ls) { const est = String(str).length * (fs * .72 + (ls || 0)); return est > room ? ` textLength="${room.toFixed(1)}" lengthAdjust="spacingAndGlyphs"` : ''; }
// ship picture measurements: aspect ratio + nose tip height (fraction) found from the left-most solid pixels; cached per picture
const SHIPI = {};
function shipInfo(href) { if (!href) return { ar: 5.19, ny: .5 }; if (SHIPI[href]) return SHIPI[href]; SHIPI[href] = { ar: 5.19, ny: .486 };
  try { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => { try { const c = document.createElement('canvas'), w = c.width = im.naturalWidth, h = c.height = im.naturalHeight, g = c.getContext('2d'); g.drawImage(im, 0, 0);
      const d = g.getImageData(0, 0, w, h).data; let col = -1, rows = [];
      for (let x = 0; x < w && col < 0; x++) { for (let y = 0; y < h; y++) if (d[(y * w + x) * 4 + 3] > 90) rows.push(y); if (rows.length) col = x; }
      SHIPI[href] = { ar: w / h, ny: rows.length ? (rows[0] + rows[rows.length - 1]) / 2 / h : .5, nx: col / w }; } catch (e) { } }; im.src = href; } catch (e) { }
  return SHIPI[href]; }
function travelDial({ fpa, accel, vs, turn, side64, top64, turnStyle, stopD, stopT, ralt, speed, safeV, harmV, wingDeg, thr, gear, boost, brake, warn, modes, gm, mouse, damage, shipUrl, lowAlt, units, wordsOnly, gWarn, gRed, suit }) {
  WO = !!wordsOnly;
  const W = 1000, H = 250, style = turnStyle || window.TURN_STYLE || 'trend';
  // --- left: side view (nose right). Nose at (nx, sy). ---
  const sx = 270, sy = 125, RR = 96, nx = sx + 60, F = (() => { const f = ((fpa % 360) + 540) % 360 - 180; return f === -180 ? 180 : f; })(), R = -F * Math.PI / 180, BLU = '#1e90ff', col = accel > 0.5 ? GRN : accel < -0.5 ? AMB : BLU, vcol = (((fpa % 360) + 540) % 360 - 180) < -1 ? AMB : GRN;
  let ticks = '';
  for (let d = 0; d < 360; d += 10) { // full ring of degree marks (space: the ship can turn all the way round); 0 = horizon ahead
    const a = -d * Math.PI / 180, big = d % 30 === 0, r1 = RR - (big ? 9 : 4);
    ticks += `<line x1="${sx + r1 * Math.cos(a)}" y1="${sy + r1 * Math.sin(a)}" x2="${sx + RR * Math.cos(a)}" y2="${sy + RR * Math.sin(a)}" stroke="${d === 0 || d === 180 ? TEAL : big ? '#d83a52' : '#a8283d'}" stroke-width="${big ? 2.5 : 1.4}"/>`;
  }
  // RAZ 23 NOV: "nose up is green nose down is orange, tail gets no color" (level = blue, his level rule). Data = climb / dive of the TRAVEL direction (derived.flight_path_angle_deg); the game sends no pitch. Speed change shows in the ACCEL notch
  const ncol = F > 1 ? GRN : F < -1 ? AMB : BLU;
  // the ship and its travel arrow are drawn level, then the whole group is turned by the angle
  const dmg = damage ? String(damage).toLowerCase() : null, pul = .5 + .5 * Math.sin(Date.now() / 2400 * 2 * Math.PI);
  const shipFx = dmg === 'shield' ? `grayscale(1) sepia(1) saturate(6) hue-rotate(165deg) brightness(${(1.1 + .35 * pul).toFixed(2)})`
    : dmg === 'hull' ? `grayscale(1) sepia(1) saturate(12) hue-rotate(-38deg) brightness(${(.8 + .3 * pul).toFixed(2)})`
    : dmg === 'component' ? `grayscale(1) sepia(1) saturate(6) hue-rotate(5deg) brightness(${(1.1 + .35 * pul).toFixed(2)})`
    : 'grayscale(1) brightness(1.75) contrast(1.15)';
  // RAZ (via chat 8): "it will read what ship the user is in so the image should change inside the travel one" + "the nose cone isn't perfectly
  // centered on the nose". shipUrl = the bridge's port-side picture of the current ship (nose LEFT in the file, mirrored here); without it the Galaxy.
  // The picture is measured once (aspect + height of the nose tip) so the tip sits exactly on the travel line and the cone starts at the tip.
  const shipHref = shipUrl || (side64 ? 'data:image/png;base64,' + side64 : ''), shI = shipInfo(shipHref), shH = Math.min(40, 120 / shI.ar);
  const shipRot = `<g transform="rotate(${-F} ${sx} ${sy})">
   <image href="${shipHref}" x="${sx - 60}" y="${(sy - shH * shI.ny).toFixed(2)}" width="120" height="${shH.toFixed(2)}" preserveAspectRatio="xMinYMid meet" transform="scale(-1 1) translate(${-2 * sx} 0)" style="filter:brightness(1.7)"/>
   <path d="M${nx} ${sy}L${nx + 17} ${sy - 3.2}A3.2 3.2 0 0 1 ${nx + 17} ${sy + 3.2}Z" fill="${ncol}"/></g>`;
  const travel = '';
  // VSI-style readout, left of the tail, level with the ship
  // RAZ 23 NOV: "size of the nose angle read out pill reduce" -> 88 x 30 (was 116 x 40), same place
  const up = F > 1, dn = F < -1, bx = 40, by = sy, txt = (Math.round(Math.abs(F) * 10) / 10).toFixed(1) + '°';
  const vst = up ? GRN : dn ? AMB : '#ff1f3d';
  const vsi = deckFrame(bx - 4, by - 16, 80, 32, vst, true) + /* 80 wide = fits 90.0° without squeezing (RAZ 23 NOV: "match the largest range of degree displayed without cutting the sides") */
   (up ? `<path d="M${bx + 6} ${by + 4.5}l6.5 -9l6.5 9z" fill="${vst}"/>` : dn ? `<path d="M${bx + 6} ${by - 4.5}l6.5 9l6.5 -9z" fill="${vst}"/>` : `<rect x="${bx + 5}" y="${by - 2}" width="14" height="4" rx="2" fill="${vst}"/>`) +
   `<text x="${bx + 67}" y="${by + 5.5}" text-anchor="end" style="font:800 15px Oxanium,Segoe UI,sans-serif;fill:${WO ? vst : '#fff'}">${txt}</text>`;
  // --- centre (RAZ: "make the center in between the two ships the stoppage ... in a fan, at the same time put the radar altimeter"):
  // fan = stopping distance at the current braking (log scale 10 m .. 10 km), radar altitude underneath.
  // RAZ: "i dislike the arch for stopping distance. those should both be straight lines with distance reading on top of stopping distance line
  // and radar altimeter needs a slider with the 0 ground and moving height indicator up and down with orange 10 feet above ground and red everything below that"
  const FT = units === 'ft', fmt = m => FT ? (m >= 1609 ? (m / 1609.344).toFixed(m >= 16093 ? 0 : 1) + ' mi' : Math.round(m * 3.28084).toLocaleString('en-US') + ' ft') : (m >= 1000 ? (m / 1000).toFixed(m >= 10000 ? 0 : 1) + ' km' : Math.round(m) + ' m');
  const tick = m => FT ? (m >= 1000 ? (m >= 10000 ? '33k' : '3.3k') : Math.round(m * 3.28084) + '') + 'ft' : (m >= 1000 ? m / 1000 + 'km' : m + 'm');
  // STOP line (horizontal, log scale 10 m .. 10 km), reading on top
  // bar color (RAZ: "red speed for we're going to die, yellow speed for this will damage components and green for good to go"):
  // by current speed against two limits the user sets (the game sends no crash-damage speeds).
  const sv = Math.abs(+speed || 0), sLim = safeV ?? 10, hLim = harmV ?? 40, bc = sv <= sLim ? GRN : sv <= hLim ? AMB : '#ff1f3d';
  const vx0 = 745, vtop = 70, vbot = 206, slowing = stopD != null && stopD > 0, f = slowing ? Math.max(0, Math.min(1, Math.log10(Math.max(10, stopD) / 10) / 3)) : 0, vy0 = vtop + f * (vbot - vtop);
  let stopG = `<line x1="${vx0}" y1="${vtop}" x2="${vx0}" y2="${vbot}" stroke="${DIM}" stroke-width="4" stroke-linecap="round"/>` +
   [0, 1, 2, 3].map(i => { const y = vtop + i * (vbot - vtop) / 3; return `<line x1="${vx0 - 9}" y1="${y}" x2="${vx0 - 3}" y2="${y}" stroke="${DIM}" stroke-width="2"/><text x="${vx0 - 12}" y="${y + 4}" text-anchor="end" class="dl" style="font-size:9px">${i ? tick([0, 100, 1000, 10000][i]) : '0'}</text>`; }).join('') +
   (slowing ? `<line x1="${vx0}" y1="${vtop}" x2="${vx0}" y2="${vy0}" stroke="${bc}" stroke-width="6" stroke-linecap="round"/><line x1="${vx0 - 11}" y1="${vy0}" x2="${vx0 + 11}" y2="${vy0}" stroke="#fff" stroke-width="3"/>` : '') +
   `<text x="${vx0}" y="${42}" text-anchor="middle" class="md" fill="${slowing ? '#fff' : NEU}">${slowing ? '≈ ' + fmt(stopD) : '—'}</text><text x="${vx0}" y="${57}" text-anchor="middle" class="dl" style="font-size:10px">STOP IN</text>` +
   /* SPEED readout under the stop meter, smaller and right under the line (he: "speed is riding on the pill outer line") (RAZ 23 NOV: "need a speed readout on the travel pill below the stopping distance meter. it should also say STOP IN instead of just stop"); color = the same speed limits as the bar */
   `<text x="${vx0}" y="${222}" text-anchor="middle" class="md" style="font-size:12px" fill="${speed == null ? NEU : bc}">${speed == null ? '—' : (FT ? Math.round(sv * 3.28084) + ' ft/s' : Math.round(sv) + ' m/s')}</text><text x="${vx0}" y="${234}" text-anchor="middle" class="dl" style="font-size:9px">SPEED</text>`;
  // RADAR ALT slider (vertical): 0 = ground at the bottom; red below 10 ft (3.05 m), orange line at 10 ft; marker moves with height
  const sx2 = 885, top = 70, bot = 206, FT10 = lowAlt != null && +lowAlt > 0 ? +lowAlt : 3.048 /* pilot low-level warning height, m (default 10 ft) */, maxA = 1000, hOf = m => bot - Math.log10(1 + Math.max(0, Math.min(maxA, m))) / Math.log10(1 + maxA) * (bot - top); // log scale: the ground end gets room
  const yO = hOf(FT10), ra = ralt != null ? +ralt : null, ym = ra != null ? hOf(ra) : null, rcol = ra == null ? NEU : ra < FT10 ? '#ff1f3d' : ra < FT10 * 3 ? AMB : '#fff';
  const altG = `<line x1="${sx2}" y1="${top}" x2="${sx2}" y2="${bot}" stroke="${DIM}" stroke-width="4" stroke-linecap="round"/>
   ${[10, 100, 1000].map(m => `<line x1="${sx2 - 9}" y1="${hOf(m)}" x2="${sx2 - 3}" y2="${hOf(m)}" stroke="${DIM}" stroke-width="2"/><text x="${sx2 + 12}" y="${hOf(m) + 4}" class="dl" style="font-size:10px">${tick(m)}</text>`).join('')}
   <line x1="${sx2}" y1="${yO}" x2="${sx2}" y2="${bot}" stroke="#ff1f3d" stroke-width="6" stroke-linecap="round"/>
   <line x1="${sx2 - 12}" y1="${yO}" x2="${sx2 + 12}" y2="${yO}" stroke="${AMB}" stroke-width="3"/>
   <line x1="${sx2 - 14}" y1="${bot + 4}" x2="${sx2 + 14}" y2="${bot + 4}" stroke="${NEU}" stroke-width="3"/><text x="${sx2 + 18}" y="${bot + 8}" class="dl" style="font-size:10px">0</text>
   ${ym != null ? `<path d="M${sx2 - 22} ${ym - 8}L${sx2 - 8} ${ym}L${sx2 - 22} ${ym + 8}Z" fill="${rcol}"/>` : ''}
   <text x="${sx2}" y="${42}" text-anchor="middle" class="md" fill="${rcol}">${ra != null ? (FT ? Math.round(ra * 3.28084).toLocaleString('en-US') + ' ft' : ra < 10 ? ra.toFixed(1) + ' m' : Math.round(ra) + ' m') : '—'}</text>
   <text x="${sx2}" y="${57}" text-anchor="middle" class="dl" style="font-size:10px">RADAR ALT</text>`;
  // GEAR next to RADAR ALT (RAZ 23 NOV: "1 next to radar alt"). Game value vehicle.state.flight.state.gear.
  // Three lights like an aircraft gear panel: DOWN = three green, MOVING = amber, UP = dark; no reading = dashes.
  const gx = 815, gs0 = gear == null ? null : String(gear).toUpperCase(), gs = gs0 === 'DEPLOYED' ? 'DOWN' : gs0 === 'RETRACTED' ? 'UP' : /DEPLOYING|RETRACTING|MOVING/.test(gs0 || '') ? 'MOVING' : gs0, gc = gs === 'DOWN' ? GRN : gs === 'MOVING' ? AMB : null;
  /* GEAR (RAZ 23 NOV): UP = 3 cells touching, dark. MOVING = amber, flashing, no cell outline; going UP (RETRACTING) the top cell bobs up and back,
     going DOWN (DEPLOYING / MOVING) the two bottom cells slide out diagonally and back, until it locks. DOWN = green, cells spread apart. */
  const gT = Date.now(), gOsc = (1 - Math.cos(gT / 700 * 2 * Math.PI)) / 2, gFl = .45 + .55 * (1 - Math.cos(gT / 500 * 2 * Math.PI)) / 2, gUp = gs0 === 'RETRACTING';
  /* RADIAL (RAZ 23 NOV: "no they move from their current position outwards at the same speed and distance"): all three cells move together, straight out
     from the cluster centre, same distance and speed, and back, while moving. DOWN = cells held at that outward spread. UP = touching. */
  const gU = [[812, 90], [805, 102], [819, 102]], gDir = [[0, -1], [-.868, .496], [.868, .496]], gDist = 6;
  const gK = gs === 'DOWN' ? 1 : gs === 'MOVING' ? (1 - Math.cos(gT / 1200 * 2 * Math.PI)) / 2 : 0;
  const gCells = gU.map((u, i) => [u[0] + gDir[i][0] * gDist * gK, u[1] + gDir[i][1] * gDist * gK]);
  // gear on the glass honeycomb (RAZ 23 NOV: "use the honeycomb for the gear indicator instead of the circles"): nose cell on top,
  // two main-gear cells below, on the glass's own cell grid (14 x 24, body moved down 46 -> rows at y 98 / 122)
  const gearG = `<text x="${gx + 4}" y="80" text-anchor="middle" class="dl" style="font-size:10px">GEAR</text>
   ${(() => { window.__gMc = gs === 'MOVING' ? (Math.floor(gT / 450) % 2 === 0 ? AMB : (gUp ? '#ff1f3d' : GRN)) : null; return ''; })()}<!-- MOVING color (RAZ 23 NOV): extending = orange <-> green, retracting = orange <-> red, swapping every 0.45 s --><g>${gCells.map(([x, y]) => `<path transform="translate(${x.toFixed(2)} ${y.toFixed(2)})" d="M7 0l7 4v8l-7 4-7-4V4z" fill="${window.__gMc || gc || '#22030a'}" fill-opacity="${gc ? .9 : .8}" stroke="${gs === 'MOVING' ? 'none' : gc ? '#fff' : DIM}" stroke-opacity="${gc ? .7 : 1}" stroke-width="1"/>`).join('')}</g>
   ${gs === 'MOVING' && Math.floor(gT / 250) % 2 === 0 ? gCells.slice(1).map(([x, y], j) => { const d = gDir[j + 1], sg = gUp ? -1 : 1 /* lower cells: in when closing, out when opening (as first approved) */, ux = d[0] * sg, uy = d[1] * sg, cx = x + 7 + ux * 3.2, cy = y + 8 + uy * 3.2, px = -uy, py = ux, s = 2.6;
     return `<polyline points="${(cx - ux * s * .55 + px * s).toFixed(2)},${(cy - uy * s * .55 + py * s).toFixed(2)} ${(cx + ux * s * .45).toFixed(2)},${(cy + uy * s * .45).toFixed(2)} ${(cx - ux * s * .55 - px * s).toFixed(2)},${(cy - uy * s * .55 - py * s).toFixed(2)}" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>`; }).join('') : ''}${gs === 'MOVING' && Math.floor(gT / 250) % 2 === 0 ? (() => { const [x, y] = gCells[0], cx = x + 7, cy = y + 8, up = gUp; /* top cell: arrow up = gear going up, arrow down = gear going down (RAZ 23 NOV) */
     const uy = up ? 1 : -1 /* flipped (RAZ 23 NOV: "flip those two chevrons" - "the ones you just put in" = the top-cell chevrons) */, c2 = cy + uy * 1.5, sz = 2.6; /* same chevron as the lower cells (RAZ: "not an actual arrow. the same chevron as the other two") */
     return `<polyline points="${(cx - sz).toFixed(2)},${(c2 - uy * sz * .55).toFixed(2)} ${cx},${(c2 + uy * sz * .45).toFixed(2)} ${(cx + sz).toFixed(2)},${(c2 - uy * sz * .55).toFixed(2)}" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>`; })() : ''}<!-- chevrons in the two main-gear cells point the way they travel: in (up-right / up-left) when closing, out (down-left / down-right) when opening; top cell only flashes (RAZ 23 NOV) -->
   <text x="${gx + 4}" y="138" text-anchor="middle" class="md" style="font-size:12px" fill="${gc || NEU}">${gs || '—'}</text>`;
  const b = boost || null, bres = b && b.reserves != null ? Math.max(0, Math.min(1, +b.reserves > 1 ? +b.reserves / 100 : +b.reserves)) : null,
    bon = !!(b && b.engaged), bcol = b && b.critical ? '#ff1f3d' : bon ? TEAL_B : NEU, nlit = bres == null ? 0 : Math.round(bres * 8);
  const boostG = `<text x="40" y="52" class="dl" style="font-size:10px;${bon ? 'fill:#fff' : ''}">BOOST</text>
   <text x="128" y="52" text-anchor="end" class="md" style="font-size:12px" fill="${bres == null ? NEU : bcol}">${bres == null ? '—' : Math.round(bres * 100) + '%'}</text>
   ${Array.from({ length: 8 }, (_, i) => `<rect x="${40 + i * 11}" y="60" width="9" height="10" rx="2" fill="${i < nlit ? (bon || (b && b.critical) ? bcol : '#a0142c') : '#22030a'}" stroke="${i < nlit && bon ? '#fff' : DIM}" stroke-width="1" ${i < nlit && bon ? `` : ''}/>${i < nlit ? hot(40 + i * 11, 60, 9, 10, 2) : ''}`).join('')}`;
  const bk = brake == null ? null : !!brake;
  const brakeG = `<rect x="40" y="180" width="88" height="10" rx="5" fill="${bk ? AMB : '#22030a'}" stroke="${bk ? '#fff' : DIM}" stroke-width="1" ${bk ? `` : ''}/>
   <text x="40" y="206" class="dl" style="font-size:10px;${bk ? 'fill:#fff' : ''}">BRAKE</text>
   <text x="128" y="206" text-anchor="end" class="md" style="font-size:12px" fill="${bk ? AMB : NEU}">${bk == null ? '—' : bk ? 'ON' : 'OFF'}</text>`;
  const fan = stopG + altG + gearG + boostG + brakeG;
  // --- middle: top view (nose up) + turn indicator ---
  const tx = 497, ty = 172, ny = ty - 58, dir = turn > 0.5 ? 1 : turn < -0.5 ? -1 : 0, rate = Math.abs(turn);
  let turnG = '';
  if (style === 'trend') { // Garmin G1000: bar along a strip above the nose; marks at half-standard (1.5°/s) and standard (3°/s) rate
    // RAZ 23 NOV: "rework the left right turn line ... remember when wings level it's blue. when nose not turning, blue"
    // turn-rate strip = red holo deck pip cells: 8 per side, 0.5 °/s each (full = 4 °/s); taller marks at 1.5 and 3 °/s (half / standard rate)
    const yb = 70, N = 8, P = 9.5, cw = 7, chh = 12, lit = dir ? Math.min(N, Math.ceil(rate / 0.5 - 0.001)) : 0, tcol = dir ? GRN : BLU;
    turnG = [-1, 1].map(d => Array.from({ length: N }, (_, i) => { const on = d === dir && i < lit, x = tx + d * (8 + i * P) - (d < 0 ? cw : 0);
      return `<rect x="${x}" y="${yb - chh / 2}" width="${cw}" height="${chh}" rx="2" fill="${on ? GRN : '#22030a'}" stroke="${on ? '#e8fff0' : DIM}" stroke-width="1" ${on ? `` : ''}/>${on ? hot(x, yb - chh / 2, cw, chh, 2) : ''}`; }).join('') +
      [3, 6].map(c => `<line x1="${tx + d * (8 + c * P - 1.25)}" y1="${yb - 13}" x2="${tx + d * (8 + c * P - 1.25)}" y2="${yb - 8}" stroke="${c === 6 ? '#fff' : NEU}" stroke-width="2"/>`).join('') +
      `<path d="M${tx + d * (8 + N * P + 3)} ${yb - 5}l${d * 6} 5l${-d * 6} 5" fill="none" stroke="${d === dir && rate > 4 ? GRN : DIM}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`).join('') +
      `<rect x="${tx - 2}" y="${yb - 10}" width="4" height="20" rx="2" fill="${tcol}"/>`;
    { const cy = 186, a = wingDeg != null ? wingDeg : Math.max(-30, Math.min(30, turn / 3 * 20)), n = ((a % 360) + 540) % 360 - 180, w = 34, lvl = Math.abs(n) < 1, c = lvl ? BLU : GRN;
      turnG += [-1, 1].map(d => { const m = 20 * Math.PI / 180; return `<line x1="${tx + d * 42 * Math.cos(m)}" y1="${cy + 42 * Math.sin(m)}" x2="${tx + d * 52 * Math.cos(m)}" y2="${cy + 52 * Math.sin(m)}" stroke="${NEU}" stroke-width="3"/><text x="${tx + d * 62}" y="${cy + 28}" text-anchor="middle" class="dl">${d < 0 ? 'L' : 'R'}</text>`; }).join('') +
        `<line x1="${tx - 54}" y1="${cy}" x2="${tx - 42}" y2="${cy}" stroke="${DIM}" stroke-width="3"/><line x1="${tx + 42}" y1="${cy}" x2="${tx + 54}" y2="${cy}" stroke="${DIM}" stroke-width="3"/>` +
        `<g transform="rotate(${a} ${tx} ${cy})"><line x1="${tx - w}" y1="${cy}" x2="${tx + w}" y2="${cy}" stroke="${c}" stroke-width="5" stroke-linecap="round"/><line x1="${tx}" y1="${cy}" x2="${tx}" y2="${cy - 11}" stroke="${c}" stroke-width="3" stroke-linecap="round"/></g>` +
      `<text x="${tx}" y="${cy - 50}" text-anchor="middle" class="md" fill="${c}">${lvl ? '0°' : (n < 0 ? 'L ' : 'R ') + Math.abs(Math.round(n)) + '°'}</text>` +
      `<text x="${tx}" y="${yb + 36}" text-anchor="middle" class="md" fill="${tcol}">${dir < 0 ? '◄ ' : ''}${(Math.round(rate * 10) / 10).toFixed(1)}°/s${dir > 0 ? ' ►' : ''}</text>`; }
  } else if (style === 'coord') { // turn coordinator: small wings that tilt; L / R marks = standard rate (3°/s)
    const cy = 42, a = Math.max(-30, Math.min(30, turn / 3 * 20)) * Math.PI / 180, w = 46;
    turnG = [-1, 1].map(d => { const m = d * 20 * Math.PI / 180; return `<line x1="${tx + 58 * Math.cos(m) * d}" y1="${cy + 58 * Math.sin(m)}" x2="${tx + 70 * Math.cos(m) * d}" y2="${cy + 70 * Math.sin(m)}" stroke="${NEU}" stroke-width="3"/><text x="${tx + d * 86}" y="${cy + 30}" text-anchor="middle" class="dl">${d < 0 ? 'L' : 'R'}</text>`; }).join('') +
      `<line x1="${tx - 70}" y1="${cy}" x2="${tx - 58}" y2="${cy}" stroke="${DIM}" stroke-width="3"/><line x1="${tx + 58}" y1="${cy}" x2="${tx + 70}" y2="${cy}" stroke="${DIM}" stroke-width="3"/>` +
      `<g transform="rotate(${a * 180 / Math.PI} ${tx} ${cy})"><line x1="${tx - w}" y1="${cy}" x2="${tx + w}" y2="${cy}" stroke="${dir ? GRN : NEU}" stroke-width="5" stroke-linecap="round"/><circle cx="${tx}" cy="${cy}" r="7" fill="${dir ? GRN : NEU}"/><line x1="${tx}" y1="${cy - 7}" x2="${tx}" y2="${cy - 16}" stroke="${dir ? GRN : NEU}" stroke-width="4"/></g>`;
  } else { // chevrons beside the nose: 1 / 2 / 3 lit = slow / standard / fast turn
    const n = !dir ? 0 : rate < 1.5 ? 1 : rate < 3.5 ? 2 : 3;
    turnG = [-1, 1].map(d => [0, 1, 2].map(i => { const on = dir === d && i < n, x = tx + d * (34 + i * 16), y = ny + 6;
      return `<path d="M${x - d * 6} ${y - 11}l${d * 10} 11l${-d * 10} 11" fill="none" stroke="${on ? GRN : DIM}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" ${on ? `` : ''}/>`; }).join('')).join('');
  }
  // --- right end: speed change chevrons (top) and climb / descend arrow (bottom) ---
  const cx0 = 0, cy0 = 0;
  const chev = Math.abs(accel) <= 0.5 ? `<rect x="${cx0 - 18}" y="${cy0 - 4}" width="36" height="8" rx="4" fill="${DIM}"/>` :
    [-13, 9].map(o => { const d = accel > 0 ? 1 : -1, c = accel > 0 ? GRN : AMB; return `<polygon points="${cx0 + o + d * 13},${cy0} ${cx0 + o - d * 9},${cy0 - 15} ${cx0 + o - d * 9},${cy0 + 15}" fill="${c}"/>`; }).join('');
  const vx = 0, vy = 0, u = vs > 0.5 ? -1 : vs < -0.5 ? 1 : 0, vc = vs > 0 ? GRN : AMB;
  const vert = !u ? `<rect x="${vx - 18}" y="${vy - 4}" width="36" height="8" rx="4" fill="${DIM}"/>` :
    `<polygon points="${vx},${vy + u * 20} ${vx - 16},${vy - u * 4} ${vx - 6},${vy - u * 4} ${vx - 6},${vy - u * 20} ${vx + 6},${vy - u * 20} ${vx + 6},${vy - u * 4} ${vx + 16},${vy - u * 4}" fill="${vc}"/>`;
  // --- outline (RAZ: "change the pill outline design ... different shape"): rounded slab with a notch on top, red holo deck build:
  // double neon rim, hex mesh, scan lines, edge tabs. Body coordinates = the old 1000 x 250 frame moved down 36.
  const OY = 54, HH = 308;
  const shape = i => { const x0 = 3 + i, x1 = W - 3 - i, yT = 4 + i, yB = HH - 3 - i, r = 44 - i;
    return `M${x0 + r} ${yT}H${x1 - r}A${r} ${r} 0 0 1 ${x1} ${yT + r}V${yB - r}A${r} ${r} 0 0 1 ${x1 - r} ${yB}H${x0 + r}A${r} ${r} 0 0 1 ${x0} ${yB - r}V${yT + r}A${r} ${r} 0 0 1 ${x0 + r} ${yT}Z`; };
  // techy divider (RAZ: "replace with something more techy the dividing lines or remove them"): dotted column, end caps, centre diamond
  const div = x => ecl(x, 125, 6); // divider = clan symbol only, no dotted line (RAZ 23 NOV)
  const tab = (x, y) => [-3.5, 0, 3.5].map(o => `<circle cx="${x + o}" cy="${y}" r=".62" fill="#ff6a7a" opacity=".85"/>`).join(''); // 3 small dots like the deck frames (was 3 white dashes)
  // notch (RAZ: "do both as you recommended"): ACCEL chevrons (speed change) | THR STICK bar -100..+100 (his Cyro thumbstick, read by chat 8's bridge;
  // in sticky / cruise mode the stick springs back to centre, so it reads 0 while the throttle setting stays) | V/S arrow
  const T0 = 500, TW = 52, tp = thr == null ? null : Math.max(-100, Math.min(100, +thr)), tc = tp == null ? NEU : Math.abs(tp) < 1 ? BLU : tp > 0 ? GRN : AMB, /* centre = blue (neutral), forward green, reverse amber (RAZ 23 NOV) */ txe = tp == null ? T0 : T0 + tp / 100 * TW;
  const thrG = `<text x="${T0 - TW - 10}" y="25" text-anchor="end" class="dl" style="font-size:9px">THR</text>
   <line x1="${T0 - TW}" y1="20" x2="${T0 + TW}" y2="20" stroke="${DIM}" stroke-width="5" stroke-linecap="round"/>
   ${[-1, -.5, .5, 1].map(k => `<line x1="${T0 + k * TW}" y1="${Math.abs(k) === 1 ? 13 : 15}" x2="${T0 + k * TW}" y2="${Math.abs(k) === 1 ? 27 : 25}" stroke="#ff5d70" stroke-opacity=".6" stroke-width="1.5"/>`).join('')}
   <line x1="${T0}" y1="11" x2="${T0}" y2="29" stroke="${tp == null ? '#fff' : tc}" stroke-width="2"/><!-- centre line: blue at 0, then the forward / reverse color (RAZ 23 NOV: "the center line should be blue, not white ... when the throttle does move the center line changes from blue to whatever color is forward and reverse") -->
   ${tp != null && Math.abs(tp) >= 1 ? `<line x1="${T0}" y1="20" x2="${txe}" y2="20" stroke="${tc}" stroke-width="5" stroke-linecap="butt"/><!-- butt ends: the fill starts exactly at the centre line, no bulge past it ("the line coming out of the center line shouldn't protrude") -->` : ''}
   ${tp != null ? `<circle cx="${txe}" cy="20" r="4.5" fill="${tc}" stroke="#0a0204" stroke-width="1"/><!-- dot takes the throttle color ("the dot at the end of the line should also change color") -->` : ''}
   <text x="${T0 + TW + 10}" y="25" class="md" style="font-size:12px" fill="${tc}">${tp == null ? '—' : (tp > 0 ? '+' : '') + Math.round(tp) + '%'}</text>`;
  // WARNING LIGHTS (RAZ 23 NOV: "warning light that illuminates on radar lock, one for taking fire (HIT) and one for missile alert ...
  // not visible the whole time, just when they are active. utilize the honeycomb mesh ... next to each other just below the top notch").
  // Each light = 3 cells of the glass's own honeycomb lit up (pattern grid 14 x 24, row at y 72). Game: vehicle annunciators radr / hit / misl
  // (states MINOR_* = amber, MAJOR_* = red, *_FLASHING = blinks). Meaning of 'radr' as radar lock is UNCONFIRMED until a live test (chat 8).
  const WS = warn || {}, blinkOn = Math.floor(Date.now() / 350) % 2 === 0;
  const lamp = (x0, key, label) => { const st = WS[key]; if (!st) return '';
    const S = String(st).toUpperCase(), major = /MAJOR/.test(S) || st === true, flash = /FLASH/.test(S);
    if (!major && !/MINOR/.test(S)) return ''; if (flash && !blinkOn) return '';
    const c = major ? '#d8243a' : '#d99a1a'; // toned down 23 NOV
    return `<g>${[0, 1, 2].map(i => `<path transform="translate(${x0 + i * 14} 72)" d="M7 0l7 4v8l-7 4-7-4V4z" fill="${c}" fill-opacity=".5" stroke="${c}" stroke-opacity=".8" stroke-width=".8"/>`).join('')}</g>
     <text x="${x0 + 21}" y="${83.5}" text-anchor="middle" style="font:800 8.5px Oxanium,Segoe UI,sans-serif;letter-spacing:.6px;fill:#fff;paint-order:stroke;stroke:rgba(40,0,6,.7);stroke-width:1.5px">${label}</text>`; };
  const warnG = lamp(420, 'lock', 'RADR') + lamp(476, 'hit', 'HIT') + lamp(532, 'prox', 'PROX');
  const mslS = String(WS.misl || '').toUpperCase(), mslOn = WS.misl === true || /MINOR|MAJOR/.test(mslS), mslPulse = window.TD_PULSE_ON || Math.floor(Date.now() / 500) % 2 === 0; // TD_PULSE_ON = still pictures only
  // deck-style keys: dark glass key, small "- - -" tab on top, name lights up (brighter glow) when on - same rule as the deck
  // mode keys built like the red deck's WARNING / SYSTEM keys (RAZ in chat 8: "on the travel deck make the coupled cruise and speed limiter
  // button look like the ones from the warning caution and system area of the lower deck"): fully rounded, neon outer rim + thin inner rim,
  // "- - -" tab on top, honeycomb glass inside, 3D slab under it, crisp white name. Color = state: green on, amber decoupled, red dim off.
  const key = (x, w, label, on, c) => { const st = c || (on ? GRN : '#ff1f3d'), lit = on || !!c;
    const ln = String(label).split(' '), two = ln.length === 2, fs = two ? 7.6 : 9;
    return deckFrame(x, 15, w, 28, st, lit) + ln.map((t, i) => `<text x="${x + w / 2}" y="${two ? 27 + i * 9 : 33.4}" text-anchor="middle"${fitText(t, fs, w - 10, 1)} style="font:800 ${fs}px Oxanium,Segoe UI,sans-serif;letter-spacing:1px;fill:${lit ? st : '#fff'};opacity:${lit ? 1 : .62}">${t}</text>`).join(''); };
  const M = modes || {}, cp = M.coupled == null ? null : !!M.coupled;
  const ms = mouse == null ? null : String(mouse).toUpperCase();
  const leftKeys = key(30, 44, 'CPLD', cp != null, cp === false ? AMB : null) + key(80, 56, 'CRUISE', !!M.cruise) + key(142, 56, 'SPEED LIMITER', !!M.spdlim); /* narrower 23 NOV (was 58 / 74 / 82) */ // VJOY / REL key removed (RAZ: "get rid of the vjoy rel tab button ... this is only telemetry")
  // G meter, right end of the band: current G, 9 cells (1 G each), G MAX = game's g_meter.max (peak reached OR ship limit - UNCONFIRMED, chat 8)
  const gc0 = gm && gm[0] != null ? +gm[0] : null, gpk = gm && gm[1] != null ? +gm[1] : null, gn = gc0 == null ? 0 : Math.max(0, Math.min(9, Math.round(gc0)));
  /* G danger zones as parameters (RAZ 23 NOV: "it should change the danger zones of the G meter dependent of the gear the user is wearing"); source of the suit value = chat 8, open. Defaults = the old fixed 6 / 8 */
  const GW = gWarn != null ? +gWarn : 6, GR = gRed != null ? +gRed : 8;
  const gcol = gc0 == null ? NEU : gc0 >= GR ? '#ff1a38' : gc0 >= GW ? AMB : '#ff3550';
  const gst = gc0 == null ? '#ff1f3d' : gc0 >= GR ? '#ff1f3d' : gc0 >= GW ? AMB : GRN;
  const gG = deckFrame(736, 15, 230, 28, gst, gc0 != null) +
   `<text x="751" y="33.5" style="font:800 10px Oxanium,Segoe UI,sans-serif;letter-spacing:1.4px;fill:${WO && gc0 != null ? gst : '#fff'}">G</text><text x="792" y="34.2" text-anchor="end" style="font:800 14px Oxanium,Segoe UI,sans-serif;fill:#fff">${gc0 == null ? '—' : gc0.toFixed(1)}</text>
   ${Array.from({ length: 9 }, (_, k) => { const cc = k + 1 >= GR ? '#ff1f3d' : k + 1 >= GW ? AMB : GRN /* cell k = (k+1) G; zones follow gWarn / gRed */; return `<rect x="${798 + k * 9.4}" y="23" width="7" height="12" rx="2" fill="${k < gn ? cc : '#22030a'}" stroke="${k < gn ? '#fff' : DIM}" stroke-opacity="${k < gn ? .7 : 1}" stroke-width=".8" ${k < gn ? `` : ''}/>${k < gn ? hot(798 + k * 9.4, 23, 7, 12, 2) : ''}`; }).join('')}
   ${suit && (suit.name || suit.gforce_resistance != null) ? `<text x="851" y="51" text-anchor="middle" class="dl" style="font-size:7px;letter-spacing:1.2px">${String(suit.name || 'SUIT').toUpperCase().replace(/ UNDERSUIT| FLIGHT SUIT/,'')}${suit.gforce_resistance != null ? '  ·  G RES ' + String(+suit.gforce_resistance) : ''}</text>` : ''}<!-- worn suit + its G resistance from the game files (RAZ 23 NOV: "yes add the suit line under the g meter"; chat 8 snap.suit) --><text x="886" y="33.5" style="font:800 9px Oxanium,Segoe UI,sans-serif;letter-spacing:1.2px;fill:#fff">G MAX</text><text x="948" y="34.2" text-anchor="end" style="font:800 12.5px Oxanium,Segoe UI,sans-serif;fill:#fff">${gpk == null ? '—' : gpk.toFixed(1)}</text>`;
  const bandSep = `<line x1="30" y1="54" x2="970" y2="54" stroke="#ff3550" stroke-width="2" stroke-dasharray="1.5 7" stroke-linecap="round" opacity=".8"/>
   <line x1="24" y1="48" x2="24" y2="60" stroke="#ff5d70" stroke-width="2"/><line x1="976" y1="48" x2="976" y2="60" stroke="#ff5d70" stroke-width="2"/>`;
  const notch = `${leftKeys}${gG}<g transform="translate(14 10)"><text x="315" y="25" text-anchor="middle" class="dl" style="font-size:9px">ACCEL</text><g transform="translate(360 20) scale(.62)">${chev}</g>
   ${thrG}
   <g transform="translate(645 20) scale(.62)">${vert}</g><text x="680" y="25" text-anchor="middle" class="dl" style="font-size:9px">VSI</text></g>`; /* VSI = vertical speed indicator (RAZ 23 NOV: "its a v/s/i vertical sincrate indicator") */
  // NO BLOOM ON INDICATORS (RAZ in chat 8: "remove the bloom from the indicators on the flight travel page"): glow halos removed from arrows, bars,
  // cells, lamps, gear, ship, nose line; key rims, the pill rim and the missile ring keep theirs.
  // HOLOGRAM GLASS (RAZ 23 NOV: "make it look like it's an actual holographic display ... make it 2.5 almost 3D", layout kept):
  // see-through glass slab with a thick lit edge, tilted back in perspective; symbology drawn as light: a projected shadow layer
  // below the glass, red / cyan color fringe, glow, glass sheen and scan lines on top.
  // 4K workover (RAZ via chat 8: "give the travel dial another 4k workover"): the hologram filter only makes the soft light
  // (shadow under the glass, color fringe, glow); the symbology itself is drawn again on top WITHOUT a filter, so it stays razor sharp
  // even with the 3D tilt (Chrome renders filtered content soft inside a 3D-transformed layer).
  const content = `${notch}
 <g transform="translate(0 ${OY})">
 
 ${ticks}
  ${shipRot.replace('style="filter:brightness(1.7)"', `style="filter:${shipFx}"`)}${vsi}
 ${div(383)}${div(611)}
 ${style === 'trend' ? '' : `<image href="data:image/png;base64,${top64}" x="${tx - 58}" y="${ty - 30}" width="116" height="60" transform="rotate(90 ${tx} ${ty})" style="filter:brightness(1.7)"/>`}
 ${turnG}${fan}
 </g>`;
  const hid = 'td' + (++UID);
  return `<svg viewBox="0 -4 ${W} ${HH + 14}" class="tdial" xmlns="http://www.w3.org/2000/svg" style="transform:perspective(var(--tdp,1500px)) rotateX(16deg);transform-origin:50% 70%;overflow:visible"><style>.tdial text{stroke:none}.tdial{shape-rendering:geometricPrecision;text-rendering:geometricPrecision}@font-face{font-family:Oxanium;src:url(Oxanium.ttf)}.tdial text{font-family:Oxanium,Segoe UI,sans-serif}.tdial .dl{fill:#ffd0d6;font-weight:700;font-size:13px;letter-spacing:1.5px}.tdial .big{font-weight:700;font-size:24px}.tdial .md{font-weight:700;font-size:16px;letter-spacing:.5px}</style>
 <defs><linearGradient id="tdbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060304"/><stop offset=".55" stop-color="#010001"/><stop offset="1" stop-color="#000"/></linearGradient>
  <linearGradient id="tdhot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".35" stop-color="#fff" stop-opacity=".25"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <pattern id="tdhex" width="9.95" height="17.06" patternUnits="userSpaceOnUse"><path d="M4.98 0l4.98 2.84v5.69l-4.98 2.84-4.98-2.84V2.84z M4.98 11.37v5.69" fill="none" stroke="#ff2a45" stroke-opacity=".08" stroke-width=".43"/></pattern>
  <pattern id="tdscan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#ffffff" opacity=".018"/><rect y="2" width="4" height="1" fill="#000" opacity=".1"/></pattern>
  <linearGradient id="${hid}edge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5d70" stop-opacity=".9"/><stop offset=".5" stop-color="#7a1424"/><stop offset="1" stop-color="#2c0812"/></linearGradient>
  <linearGradient id="${hid}sheen" x1="0" y1="0" x2="1" y2=".55"><stop offset="0" stop-color="#fff" stop-opacity="0.0315"/><stop offset=".22" stop-color="#fff" stop-opacity="0.0054"/><stop offset=".34" stop-color="#fff" stop-opacity="0.0"/><stop offset=".36" stop-color="#fff" stop-opacity="0.0383"/><stop offset=".43" stop-color="#fff" stop-opacity="0.009"/><stop offset=".47" stop-color="#fff" stop-opacity="0.027"/><stop offset=".5" stop-color="#fff" stop-opacity="0.0"/><stop offset="1" stop-color="#fff" stop-opacity="0.009"/></linearGradient>
  <linearGradient id="${hid}top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".05" stop-color="#fff" stop-opacity=".04"/><stop offset=".14" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <filter id="${hid}holo" x="-5%" y="-15%" width="110%" height="140%" color-interpolation-filters="sRGB">
   <feOffset in="SourceAlpha" dx="3" dy="8" result="po"/><feGaussianBlur in="po" stdDeviation="1" result="pb"/><feFlood flood-color="#5a0010" flood-opacity=".32"/><feComposite in2="pb" operator="in" result="proj"/>
   <feOffset in="SourceGraphic" dx="-0.25" result="c1"/><feColorMatrix in="c1" values="0 0 0 0 0  0 .7 0 0 .25  0 0 .9 0 .35  0 0 0 .08 0" result="cy"/>
   <feOffset in="SourceGraphic" dx="0.25" result="m1"/><feColorMatrix in="m1" values=".9 0 0 0 .3  0 0 0 0 0  0 0 .5 0 .1  0 0 0 .08 0" result="mg"/>
   <feGaussianBlur in="SourceGraphic" stdDeviation="1.3" result="gl"/><feComponentTransfer in="gl" result="gl"><feFuncA type="linear" slope=".75"/></feComponentTransfer>
   <feMerge><feMergeNode in="proj"/><feMergeNode in="cy"/><feMergeNode in="mg"/></feMerge></filter>
  <filter id="${hid}glow" x="-10%" y="-20%" width="120%" height="140%"><feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="${hid}proj" x="-10%" y="-20%" width="120%" height="140%"><feGaussianBlur stdDeviation="2.4"/><feColorMatrix values="0 0 0 0 .55  0 0 0 0 .02  0 0 0 0 .08  0 0 0 .75 0"/></filter>
  <filter id="${hid}cy"><feColorMatrix values="0 0 0 0 0  0 .7 0 0 .2  0 0 .9 0 .3  0 0 0 .32 0"/></filter>
  <filter id="${hid}mg"><feColorMatrix values=".9 0 0 0 .3  0 0 0 0 0  0 0 .5 0 .1  0 0 0 .32 0"/></filter>
  <clipPath id="${hid}clip"><path d="${shape(4)}"/></clipPath>
  <radialGradient id="tdglow" cx=".5" cy="0" r=".9"><stop offset="0" stop-color="#ff1a38" stop-opacity=".025"/><stop offset="1" stop-color="#ff1a38" stop-opacity="0"/></radialGradient></defs>
 <path d="${shape(0)}" transform="translate(0 9)" fill="#1a050a" stroke="url(#${hid}edge)" stroke-width="2" opacity=".95" style="filter:drop-shadow(0 10px 14px rgba(0,0,0,.75))"/>
 <path d="${shape(0)}" transform="translate(0 4.5)" fill="#3a0c16" opacity=".85"/>
 <path d="${shape(0)}" fill="url(#tdbg)" fill-opacity=".97"/>
 <path d="${shape(0)}" fill="none" stroke="#ff2a45" stroke-width="1.56" style="filter:drop-shadow(0 0 1.2px #ff1a38) drop-shadow(0 0 3px rgba(255,59,78,.3))"/><!-- same line as the ship status frame, scaled (RAZ 23 NOV: "follow the very top ship status ... page ... make it all look like it") -->
 ${WO ? '' : `<path d="${shape(0)}" fill="url(#tdhex)"/>`}<path d="${shape(0)}" fill="url(#tdglow)"/>
 ${warnG}
 ${mslOn && mslPulse ? `<path d="${shape(0)}" fill="none" stroke="#e0233a" stroke-opacity=".8" stroke-width="5" style="filter:drop-shadow(0 0 5px rgba(255,31,61,.7)) drop-shadow(0 0 12px rgba(255,31,61,.4))"/><path d="${shape(5)}" fill="none" stroke="#ff1f3d" stroke-opacity=".55" stroke-width="3"/>` : ''}
 ${window.TD_EDGE_SYMBOLS === false ? '' : eclT(3, (HH + 1) / 2, 6, 2, 16, "#050102") + eclT(W - 3, (HH + 1) / 2, 6, 2, 16, "#050102")}<!-- centred on the pill height (RAZ 23 NOV: "the clan symbol icon isnt centered vertically") -->
 <g filter="url(#${hid}holo)">${content}</g>
 ${content}
 <path d="${shape(0)}" fill="url(#tdscan)"/><path d="${shape(3)}" fill="url(#${hid}sheen)"/><path d="${shape(3)}" fill="url(#${hid}top)"/><path d="${shape(2.5)}" fill="none" stroke="url(#${hid}top)" stroke-width="1.5"/>
</svg>`;
}
window.travelDial8 = travelDial;
})();
