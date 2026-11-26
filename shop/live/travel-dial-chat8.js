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
const ecl = (cx, cy, r = 9) => typeof window !== 'undefined' && window.TD_TABLET ? '' /* no clan symbols on the tablet (23 NOV) */ /* tablet: same crisp symbol everywhere (23 NOV: "the two center page clan icons need the same upgrade") */ : `<g class="ecl"><circle cx="${cx}" cy="${cy}" r="${r + 3}" fill="#ff1f3d" opacity=".16" style="filter:blur(3px)"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#000"/>
 <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#ff1f3d" stroke-width="${(r * .17).toFixed(2)}" style="filter:drop-shadow(0 0 ${(r * .25).toFixed(1)}px #ff1f3d)"/>
 <path d="M${(cx - r * .82).toFixed(2)} ${(cy + r * .1).toFixed(2)} A${(r * .86).toFixed(2)} ${(r * .86).toFixed(2)} 0 0 1 ${(cx - r * .1).toFixed(2)} ${(cy - r * .83).toFixed(2)}" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="${(r * .09).toFixed(2)}" stroke-linecap="round"/>
 <path d="M${cx} ${(cy - r * 1.55).toFixed(2)} L${(cx + r * .09).toFixed(2)} ${(cy - r * 1.06).toFixed(2)} L${(cx + r * .45).toFixed(2)} ${(cy - r).toFixed(2)} L${(cx + r * .09).toFixed(2)} ${(cy - r * .94).toFixed(2)} L${cx} ${(cy - r * .45).toFixed(2)} L${(cx - r * .09).toFixed(2)} ${(cy - r * .94).toFixed(2)} L${(cx - r * .45).toFixed(2)} ${(cy - r).toFixed(2)} L${(cx - r * .09).toFixed(2)} ${(cy - r * 1.06).toFixed(2)}Z" fill="#fff" style="filter:drop-shadow(0 0 ${(r * .3).toFixed(1)}px #ff1f3d)"/></g>`; // Low Signal clan eclipse (RAZ 23 NOV: "change that to the one you created for my clan symbol")
/* CLAN SYMBOL, TABLET (23 NOV: "the clan icon circle needs some love"): bigger, no blur - solid corona rings, black disc, double rim, highlight arc, sharp star */
const eclTab = (cx, cy, r) => { const f = n => n.toFixed(2);
  return `<g class="ecl"><circle cx="${cx}" cy="${cy}" r="${f(r * 1.55)}" fill="#ff1f3d" opacity=".07"/><circle cx="${cx}" cy="${cy}" r="${f(r * 1.3)}" fill="#ff1f3d" opacity=".12"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#030001"/><circle cx="${cx}" cy="${cy}" r="${f(r - r * .09)}" fill="none" stroke="#ff2a45" stroke-width="${f(r * .18)}"/>
  <circle cx="${cx}" cy="${cy}" r="${f(r - r * .3)}" fill="none" stroke="#ff8f9b" stroke-opacity=".55" stroke-width="${f(r * .05)}"/>
  ${(() => { /* highlight = a crescent that tapers to points at both ends (23 NOV: "the white line in the clan icon shouldn't be square and just a line") */ const ro = r * .78, P = a => [cx + ro * Math.cos(a), cy - ro * Math.sin(a)], [x1, y1] = P(Math.PI * 1.12), [x2, y2] = P(Math.PI * .55);
    return `<path d="M${f(x1)} ${f(y1)} A${f(ro)} ${f(ro)} 0 0 1 ${f(x2)} ${f(y2)} A${f(ro * 1.45)} ${f(ro * 1.45)} 0 0 0 ${f(x1)} ${f(y1)}Z" fill="#fff" fill-opacity=".92"/>`; })()}
  <path d="M${cx} ${f(cy - r * 1.62)} L${f(cx + r * .1)} ${f(cy - r * 1.08)} L${f(cx + r * .5)} ${f(cy - r)} L${f(cx + r * .1)} ${f(cy - r * .92)} L${cx} ${f(cy - r * .42)} L${f(cx - r * .1)} ${f(cy - r * .92)} L${f(cx - r * .5)} ${f(cy - r)} L${f(cx - r * .1)} ${f(cy - r * 1.08)}Z" fill="#fff" stroke="#ff2a45" stroke-width="${f(r * .04)}"/></g>`; };
const eclT = (cx, cy, r, lw, d, bg) => { if (typeof window !== 'undefined' && window.TD_TABLET) return ''; const g = r + 1, e = g + d, k = (r * .17).toFixed(2); // frame line tapers to the symbol's rim width over ~2 honeycombs (RAZ 23 NOV)
  const tr = s => `<polygon points="${cx - lw / 2},${cy + s * e} ${cx + lw / 2},${cy + s * e} ${cx + k / 2},${cy + s * g} ${cx - k / 2},${cy + s * g}" fill="#ff2a45" style="filter:drop-shadow(0 0 1.5px #ff1a38)"/>`; /* same red as the frame line */
  return `<rect x="${cx - lw * .8}" y="${cy - e}" width="${lw * 1.6}" height="${e * 2}" fill="${bg}"/>${tr(-1)}${tr(1)}${typeof window !== 'undefined' && window.TD_TABLET ? eclTab(cx, cy, r) : ecl(cx, cy, r)}`; };
function deckFrame(x, y, w, h, st, lit) { if (WO) return ''; const r = h / 2;
  /* READOUT STYLE (RAZ 23 NOV: "you already have a perect lcd type field going on inside the damage field under ship status. just remove the button pill outline but leave
     the little bright line to the left and right of each line"). Opt-in preview: window.TD_READOUT = true. Dark field with honeycomb behind the text (RAZ: "yes, the honeycomb the background of the lcd screen"), no outline, small radius,
     bright short line at the left and right ends, dashed line underneath (like the damage rows). Status color stays inside as a light wash. */
  if (typeof window !== 'undefined' && window.TD_TABLET) { /* TABLET field (square always - 23 NOV: "you made all the buttons round stop it") (23 NOV: "get rid of the fuzzy nature" + "give me something better than those added vertical lines"):
     solid color field, faint outline, bright HUD corner brackets in the status color */
    const bc = lit ? st : '#b9b9c2', bo = lit ? 1 : .6, /* off = neutral graphite (23 NOV: "i dislike the color of the gear up field") */ L = Math.min(7, w * .18, h * .32), BRX = window.TD_BR === 'x', q = (ax, ay, dx, dy) => BRX
      ? `<path d="M${ax - dx * L * .45} ${ay}H${ax + dx * L}M${ax} ${ay - dy * L * .45}V${ay + dy * L}" fill="none" stroke="${bc}" stroke-opacity="${bo}" stroke-width="1.3" stroke-linecap="square"/>` /* option X: the lines run out through the corner point */
      : `<path d="M${ax + dx * L} ${ay}H${ax}V${ay + dy * L}" fill="none" stroke="${bc}" stroke-opacity="${bo}" stroke-width="1.3" stroke-linecap="square"/>`;
    /* fill stays inside the line (23 NOV: "pull back the filling ... they are on the outside of the pill line") */ const I = 1.65;
    const SLAB = ({ [GRN]: '#0f6a32', [AMB]: '#7a5200', '#ff1f3d': '#7a0d1e', '#1e90ff': '#12428f' })[st] || (lit ? st : '#34333b'); /* RAISED KEYS (RAZ 24 NOV: "the buttons should look like they are raised off the deck" + "i need the buttons to be the raised buttons"): dark shadow + a colored slab edge under every key, like REFRESH / FULL SCREEN */
    return `<g><rect x="${x + I}" y="${y + I + 3.2}" width="${w - 2 * I}" height="${h - 2 * I}" rx="5" fill="#000" opacity=".8"/><rect x="${x + I}" y="${y + I + 2.2}" width="${w - 2 * I}" height="${h - 2 * I}" rx="5" fill="${SLAB}" opacity="${lit ? .95 : .9}"/><rect x="${x + I}" y="${y + I}" width="${w - 2 * I}" height="${h - 2 * I}" rx="5" fill="${lit ? ({ [GRN]: '#0a3f1d', [AMB]: '#4a3000', '#ff1f3d': '#4a0812', '#1e90ff': '#0a2c63' })[st] || '#0c0406' : '#0b0a0d'}"/>${lit && !({ [GRN]: 1, [AMB]: 1, '#ff1f3d': 1, '#1e90ff': 1 })[st] ? `<rect x="${x + I}" y="${y + I}" width="${w - 2 * I}" height="${h - 2 * I}" rx="5" fill="${st}" fill-opacity=".3"/>` : ''}<!-- solid deep tones, no see-through wash (23 NOV: "the blue is too water colory") -->${window.TD_FINISH === 'shiny' ? '' : (() => { const hid2 = 'th' + Math.round(x) + '_' + Math.round(y); return `<pattern id="${hid2}" width="5.47" height="9.38" patternUnits="userSpaceOnUse" x="${x}" y="${y}"><path d="M2.73 0l2.73 1.56v3.13l-2.73 1.56-2.73-1.56V1.56z M2.73 6.25v3.13" fill="none" stroke="${lit ? '#fff' : st}" stroke-opacity="${lit ? .2 : .18}" stroke-width=".5"/></pattern><rect x="${x + I}" y="${y + I}" width="${w - 2 * I}" height="${h - 2 * I}" rx="5" fill="url(#${hid2})"/>`; })()}<!-- honeycomb in MATTE too (23 NOV) -->
     ${window.TD_FINISH === 'shiny' ? '' : `<rect x="${x + I + .6}" y="${y + I + .6}" width="${w - 2 * I - 1.2}" height="${(h - 2 * I) * .46}" rx="4.4" fill="#fff" opacity="${lit ? .1 : .06}"/><rect x="${x + I + 2.5}" y="${y + I + .7}" width="${w - 2 * I - 5}" height="1" rx=".5" fill="#fff" opacity="${lit ? .75 : .4}"/>`}<!-- raised: lighter top half + bright top edge (24 NOV) -->
     <!-- smooth: no edge lines -->
     ${window.TD_FINISH === 'shiny' ? (() => { const gid = 'tg' + Math.round(x) + '_' + Math.round(y), c = !lit && (THEMES[+window.TD_THEME || 1] || {}).deep ? themeSvg('#b9b9c2') /* DEEP SPACE: off keys neutral blue-grey, not rose (23 NOV: "those buttons almost look pink") */ : themeSvg(st); /* theme / user color first, so the deep glass fill follows DEEP SPACE etc. (23 NOV) */ /* fixed id per key: iPad Safari does not re-link a pattern whose id changes (23 NOV: "still doesn't have a honeycomb") */ /* GLASS = the red deck key's material, square (23 NOV: "just the shine and gleam and fidelity") */
       const [ch, cs] = hsl3(c), deep = hex(ch, Math.min(1, cs * (+window.TD_SAT || 1)), ((THEMES[+window.TD_THEME || 1] || {}).deep) || .3); /* lit = a deep, saturated version of the color, solid: white words read clearly (23 NOV: "unable to read buttons ... completely washed out") */
       return `<rect x="${x + I}" y="${y + I}" width="${w - 2 * I}" height="${h - 2 * I}" rx="5" fill="${lit ? deep : c}" opacity="${lit ? 1 : .08}"/>` /* color strength follows the SATURATION slider */ /* stronger color for the iPad screen (23 NOV: "too light ... not enough color saturation") */ /* lit body glows in its own color (23 NOV: "dull and not shiny") */
        + `<pattern id="${gid}" width="5.47" height="9.38" patternUnits="userSpaceOnUse" x="${x}" y="${y}"><path d="M2.73 0l2.73 1.56v3.13l-2.73 1.56-2.73-1.56V1.56z M2.73 6.25v3.13" fill="none" stroke="${lit ? '#fff' : c}" stroke-opacity="${lit ? .22 : .2}" stroke-width=".5"/></pattern><rect x="${x + I}" y="${y + I}" width="${w - 2 * I}" height="${h - 2 * I}" rx="5" fill="url(#${gid})"/>`
        + `<rect x="${x + I}" y="${y + I}" width="${w - 2 * I}" height="${h - 2 * I}" rx="5" fill="url(#tdglassR)" opacity="${lit ? .9 : .5}"/>`
        
        + `<rect x="${x + I + .6}" y="${y + I + .6}" width="${w - 2 * I - 1.2}" height="${(h - 2 * I) * .5}" rx="4.4" fill="url(#tdglass)" opacity="${lit ? .55 : .5}"/><rect x="${x + I + 1.2}" y="${y + I + 1.2}" width="${w - 2 * I - 2.4}" height="${(h - 2 * I) * .2}" rx="4" fill="#fff" opacity="${lit ? .1 : .06}"/>`
        + `<rect x="${x + I + 2}" y="${y + I + .7}" width="${w - 2 * I - 4}" height="1.1" rx=".55" fill="#fff" opacity="${lit ? .95 : .5}"/>`
        + `<rect x="${x + I + 3}" y="${y + h - I - 5.5}" width="${w - 2 * I - 6}" height="1.6" rx=".8" fill="#fff" opacity="${lit ? .14 : .06}"/>` /* soft lower reflection (23 NOV: "more shine") */
        + `<rect x="${x + I + 3}" y="${y + h - I - 2.4}" width="${w - 2 * I - 6}" height="2.4" rx="1.2" fill="#000" opacity=".4"/>`; })() : ''} /* light sweep removed (23 NOV: "no to the sweep of glass, it's distracting") */<!-- SHINY finish: gloss band + top glint (23 NOV: "options to turn them matte or shiny") -->
     </g>`; } /* no corner brackets (23 NOV) */
  if (typeof window === 'undefined' || window.TD_READOUT !== false) { /* ROLLED OUT 23 NOV (his yes): readout look is the default; window.TD_READOUT = false = old look */ const lh = Math.min(h * .5, 16), ly = y + (h - lh) / 2, gid = 'rdl' + (++KX);
    return `<g opacity="${lit ? 1 : .7}"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc2c8" stop-opacity="0"/><stop offset=".5" stop-color="#ffc2c8"/><stop offset="1" stop-color="#ffc2c8" stop-opacity="0"/></linearGradient></defs>
     <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="#0a0305" fill-opacity=".92"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${st}" fill-opacity="${lit ? (window.TD_TABLET ? .34 : .2) : .05}"/><pattern id="${gid}h" width="5.47" height="9.38" patternUnits="userSpaceOnUse" x="${x}" y="${y}"><path d="M2.73 0l2.73 1.56v3.13l-2.73 1.56-2.73-1.56V1.56z M2.73 6.25v3.13" fill="none" stroke="${st}" stroke-opacity=".14" stroke-width=".25"/></pattern><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="url(#${gid}h)"/>
     <line x1="${x + 6}" y1="${y + h + 1.5}" x2="${x + w - 6}" y2="${y + h + 1.5}" stroke="#ff5a6a" stroke-opacity=".35" stroke-width=".6" stroke-dasharray="2 2"/>
     <rect x="${x + 1.5}" y="${ly}" width="1.17" height="${lh}" rx=".6" fill="url(#${gid})" style="filter:drop-shadow(0 0 2px #ff1f3d)"/><rect x="${x + w - 2.67}" y="${ly}" width="1.17" height="${lh}" rx=".6" fill="url(#${gid})" style="filter:drop-shadow(0 0 2px #ff1f3d)"/></g>`; }
  return `<g opacity="${lit ? 1 : .62}"><rect x="${x}" y="${y + 4}" width="${w}" height="${h}" rx="${r}" fill="#ff1f3d" fill-opacity=".22"/>
   <rect x="${x}" y="${y + 2}" width="${w}" height="${h}" rx="${r}" fill="#0b0204" stroke="#ff1f3d" stroke-opacity=".35" stroke-width="1"/>
   <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="#070103"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${st}" fill-opacity="${lit ? .26 : .08}"/><pattern id="kx${++KX}" width="5.47" height="9.38" patternUnits="userSpaceOnUse" x="${x}" y="${y}"><path d="M2.73 0l2.73 1.56v3.13l-2.73 1.56-2.73-1.56V1.56z M2.73 6.25v3.13" fill="none" stroke="${st}" stroke-opacity=".3" stroke-width=".25"/></pattern><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#kx${KX})"/>
   <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="#ff1f3d" stroke-width="2.4" style="filter:drop-shadow(0 0 1.5px #ff1f3d) drop-shadow(0 0 3px rgba(255,31,61,.45))"/>
   ${[-6, 0, 6].map(o => `<rect x="${x + w / 2 + o - 2}" y="${y - 2.2}" width="4" height="2" rx="1" fill="#ff1f3d"/>`).join('')}
   ${typeof window !== 'undefined' && window.TD_TABLET ? `<rect x="${x + 2}" y="${y + 1.5}" width="${w - 4}" height="${h * .46}" rx="${Math.max(1, r - 2)}" fill="url(#tdglass)"/>` : ''}<!-- GLASS on the tablet = the red deck's glass key (23 NOV: "make it look like the one we have on the deck red, the nice button glassy look") -->
   ${[-28, 0, 28].map(g => { const ar = r - 6, t = g * Math.PI / 180;
      return `<circle cx="${(x + r - ar * Math.cos(t)).toFixed(2)}" cy="${(y + r + ar * Math.sin(t)).toFixed(2)}" r=".9" fill="#fff" opacity=".85"/><circle cx="${(x + w - r + ar * Math.cos(t)).toFixed(2)}" cy="${(y + r + ar * Math.sin(t)).toFixed(2)}" r=".9" fill="#fff" opacity=".85"/>`; }).join('')}</g>`; }
// text that may not cross the rim dots: if the estimated width is wider than the room, it is squeezed to fit exactly (textLength)
const DOT = 6, LIM = 14; // dots sit 6 in from the rim on the end curve; text keeps 14 clear of the key ends
/* COLOR THEMES (23 NOV: "we need 10 different color combinations"): window.TD_THEME = 1..10. Re-colors the pill's own frame family (reds) and
   label family (pinks); the status colors (green / amber / warning red #ff1f3d / blue) keep their meaning. 1 = the red holo deck as built. */
const THEMES = [null,
 { name: 'RED HOLO', f: null, l: null },
 { name: 'S.C. BLUE', f: [205, 1], l: [200, .6] },
 { name: 'CYAN / WHITE', f: [186, 1], l: [186, .15] },
 { name: 'GOLD / AMBER', f: [42, 1], l: [38, .7] },
 { name: 'EMERALD / MINT', f: [150, .9], l: [150, .5] },
 { name: 'VIOLET / LAVENDER', f: [268, .9], l: [265, .55] },
 { name: 'MAGENTA / PINK', f: [312, 1], l: [318, .6] },
 { name: 'STEEL / WHITE', f: [215, .12], l: [210, .05] },
 { name: 'ORANGE / SAND', f: [24, 1], l: [32, .45] },
 { name: 'BLUE / ORANGE', f: [210, 1], l: [30, .85] },
 /* 11 DEEP SPACE (RAZ 23 NOV: "get rid of the green and blue color scheme and create something less bright ... more coolspace colors maybe some pruple and blue dark stuff"):
    every group recolored, darker: frame deep violet, labels pale periwinkle, ON = dark steel blue, LEVEL = purple, caution = deep amber, warning = crimson */
 { name: 'DEEP SPACE', f: [228, .9, -1], l: [228, .22], ok: [222, .95, -1], info: [262, .85, -1], caution: [36, .9, -1], warning: [350, .9, -1], off: [228, .45, -1], deep: .2, act: [.22, .3] },
 /* 12 RSI BLUE (RAZ 24 NOV 12:47: "use colors that blend well with rsi blue ... green indicates all good ... orange/red/yellow are caution lights ... change the buttons to be
    simply a different shade of blue ... it should be glanceable"). RSI blue #1090ef (RSI site cross-brand-less.css v9.623.0), deep #064a7c, pale #c4d7e6.
    Frame + labels + INFO/LEVEL + OFF = shades of RSI blue / navy. ON keys = lit RSI blue (onc, see ONC()). ok (green), caution (amber), warning (red) NOT mapped:
    they keep their original status colors and appear only where something is good / iffy / bad. */
 { name: 'RSI BLUE', f: [206, .9], l: [206, .45], info: [206, .88], off: [212, 6, -1], deep: .24, act: [.3, .42], onc: '#1090ef', rsi: true }];
/* ON-STATE color (preset 12 only): a key that is simply ON (gear down, lights, power, modes ...) is lit RSI blue, not green. Presets 1-11: GRN as before. */
const ONC = () => ((typeof window !== 'undefined' && THEMES[+window.TD_THEME || 1]) || {}).onc || GRN;
const RSIT = () => typeof window !== 'undefined' && !!(THEMES[+window.TD_THEME || 1] || {}).rsi; /* 24 NOV 13:05 "make my iPad match" (Edge sale pages): in preset 12 normal steps are blue, doors open amber, PC load under 75 % blue */
const MVC = () => RSIT() ? ONC() : AMB;
/* DIRECTION colors (forward / backward / nose up / down / turn / wings): his picks green forward, orange backward (24 NOV 11:51) are kept by default.
   Preset 12 + ?dirs=blue (window.TD_DIRBLUE) = all-blue variant for his choice: forward bright blue, backward pale ice blue. */
const DIRB = () => typeof window !== 'undefined' && !!window.TD_DIRBLUE && !!(THEMES[+window.TD_THEME || 1] || {}).rsi;
const DIRC = c => !DIRB() ? c : c === GRN ? '#7fd0ff' : c === AMB ? '#c4d7e6' : c;
 /* 23 NOV, his words: "can't read some of the buttons. and those buttons almost look pink just a hari darker pelase": purple moved off pink (272 -> 262), raised keys darker (act), off labels lighter */
 /* 23 NOV later, his words: "deep blue and deep purple" + "not the cartoon type either but the cool scify look": frame deep blue, ON = deep blue, LEVEL = deep purple, all darker; lit glass fill darker (deep .2) */
const FRAMEC = new Set(['#ff2a45', '#ff5d70', '#ff3550', '#d83a52', '#a8283d', '#8c1024', '#ff6a7a', '#5a1a24', '#3a1016', '#6a2430', '#4a141c', '#2a0c12', '#22030a', '#1a050a', '#3a0c16', '#7a1424', '#2c0812', '#ff1a38', '#12060a', '#140709', '#0d0507', '#110508']);
const LABELC = new Set(['#ff8f9b', '#ffd0d6', '#ffe6e9', '#ffc2c8', '#ff9aa6', '#ffd6db', '#c9b3b7', '#b8a4a8', '#8f7a7e', '#ffe9ec']);
function hsl(hex) { const n = parseInt(hex.slice(1), 16), r = (n >> 16) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0; return [s, l]; }
function hex(h, s, l) { const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)); return '#' + [f(0), f(8), f(4)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join(''); }
/* USER COLORS (23 NOV: "give the user free control over colors of all components and lights ... warning lights and caution pink and purple ... the choice of
   light and dark of each color"). window.TD_COLORS = { frame, labels, ok, caution, warning, info, off: { h, s, shade: -1 | 0 | 1 } }. Each group = every shade of that
   color in the drawing; the hue is swapped, the brightness kept (shade -1 darker, +1 lighter). Missing group = keep the theme / original. */
const GROUPS = { ok: ['#14ff63', '#0a3f1d', '#e8fff0'], caution: ['#ffae00', '#4a3000', '#d99a1a', '#ffc14d', '#b07a10'],
  warning: ['#ff1f3d', '#4a0812', '#ff7f8f', '#d8243a', '#e0233a'], info: ['#1e90ff', '#0a2c63', '#a6d4ff', '#4aa8ff', '#1e6fd0', '#1e5fae', '#061a33'],
  off: ['#0b0a0d', '#b9b9c2'] };
function hsl3(hex) { const n = parseInt(hex.slice(1), 16), r = (n >> 16) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  let h = 0; if (d) { h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; } return [h, d ? d / (1 - Math.abs(2 * l - 1)) : 0, l]; }
function themeSvg(svg) { if (typeof window === 'undefined' || !(window.TD_TABLET || window.TD_THEMEALL)) return svg; /* TD_THEMEALL (24 NOV): non-tablet pages (Edge travel) may opt in to the color sets */
  /* SATURATION (23 NOV: "settings needs saturation slider ... not the bloom cheap stuff but real color saturation"): every color value in the drawing gets its saturation scaled */
  const SAT = +window.TD_SAT || 1; if (SAT !== 1) svg = svg.replace(/#[0-9a-fA-F]{6}\b/g, c => { const [h, s0, l] = hsl3(c.toLowerCase()); return s0 < .02 ? c : hex(h, Math.min(1, s0 * SAT), l); });
  const T = THEMES[+window.TD_THEME || 1] || THEMES[1], U = window.TD_COLORS || {}, map = {};
  const put = (list, c) => list.forEach(x => { map[x] = c; });
  put([...FRAMEC], U.frame || (T.f && { h: T.f[0], s: T.f[1], shade: T.f[2] || 0 })); put([...LABELC], U.labels || (T.l && { h: T.l[0], s: T.l[1], shade: T.l[2] || 0 }));
  for (const g in GROUPS) put(GROUPS[g], U[g] || (T[g] && { h: T[g][0], s: T[g][1], shade: T[g][2] || 0 }) || null);
  return svg.replace(/#[0-9a-fA-F]{6}\b/g, c => { const lc = c.toLowerCase(), u = map[lc]; if (!u) return c; let [s0, l0] = hsl(lc);
    const sh = +u.shade || 0, l = sh < 0 ? l0 * .7 : sh > 0 ? l0 + (1 - l0) * .35 : l0; return hex(u.h, Math.min(1, s0 * (u.s == null ? 1 : u.s)), Math.max(0, Math.min(1, l))); }); }
/* ACTION BUTTON (tablet, 23 NOV: "refresh and fullscreen are real buttons so they should look like buttons not like display fields"):
   raised key - shadow under it, solid face with a lighter top half, a bright top edge, outline; clearly different from the flat display fields */
function actBtn(x, y, w, h, label, c, go) { const ln = String(label).split('|'), fs = ln.length === 2 ? 7.6 : 8.8, [hh, ss] = hsl3(themeSvg(c).slice(0, 7)), AL = ((THEMES[+window.TD_THEME || 1] || {}).act) || [.34, .46], face = hex(hh, Math.min(1, ss * (+window.TD_SAT || 1)), AL[0]), top = hex(hh, Math.min(1, ss * (+window.TD_SAT || 1)), AL[1]);
  return `<g data-go="${go}" style="cursor:pointer"><rect x="${x}" y="${y + 2.6}" width="${w}" height="${h}" rx="6" fill="#000" opacity=".7"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${face}"/>
   <rect x="${x + .8}" y="${y + .8}" width="${w - 1.6}" height="${h * .48}" rx="5.4" fill="${top}"/><rect x="${x + 3}" y="${y + 1}" width="${w - 6}" height="1" rx=".5" fill="#fff" opacity=".7"/>
   <rect x="${x + .5}" y="${y + .5}" width="${w - 1}" height="${h - 1}" rx="5.6" fill="none" stroke="${top}" stroke-width="1"/>
   ${ln.map((t, i) => `<text x="${x + w / 2}" y="${ln.length === 2 ? y + h / 2 - 1 + i * 8.6 : y + h / 2 + 3.2}" text-anchor="middle" style="font:800 ${fs}px Oxanium,Segoe UI,sans-serif;letter-spacing:.6px;fill:#fff">${t}</text>`).join('')}</g>`; }
/* ARROW / POINTER FAMILY (23 NOV: "make the up and down arrow for the VSI look different and the accel and decel as well ... keep the triangle marker concept but improve it,
   space-like"). One shape for every arrow and pointer; window.TD_ARROW 1-4: 1 solid triangle (old), 2 notched delta, 3 faceted two-tone, 4 open caret with an inner caret.
   head(x, y, angleDeg, length, halfWidth, color): tip at (x, y), pointing along the angle. */
function head(x, y, ang, L, H, c) { const v = +(typeof window !== 'undefined' && window.TD_ARROW) || 3 /* his pick 23 NOV: faceted two-tone */, f = n => (+n).toFixed(2), g = inner => `<g transform="translate(${f(x)} ${f(y)}) rotate(${ang})">${inner}</g>`;
  if (v === 1) return g(`<path d="M0 0L${-L} ${-H}L${-L} ${H}Z" fill="${c}"/>`);
  if (v === 3) { let lt = '#ffffff'; try { const [hh, ss, ll] = hsl3(c.length === 4 ? '#ffffff' : c); lt = hex(hh, ss, Math.min(.93, ll + .24)); } catch (e) {}
    return g(`<path d="M0 0L${-L} ${-H}L${f(-L * .55)} 0Z" fill="${lt}"/><path d="M0 0L${f(-L * .55)} 0L${-L} ${H}Z" fill="${c}"/><path d="M0 0L${-L} ${-H}" stroke="#fff" stroke-opacity=".6" stroke-width=".6"/>`); }
  if (v === 4) return g(`<path d="M${-L} ${-H}L0 0L${-L} ${H}" fill="none" stroke="${c}" stroke-width="${f(Math.max(1.8, H * .3))}" stroke-linejoin="miter"/><path d="M${f(-L * 1.05)} ${f(-H * .5)}L${f(-L * .45)} 0L${f(-L * 1.05)} ${f(H * .5)}" fill="none" stroke="${c}" stroke-opacity=".55" stroke-width="${f(Math.max(1.2, H * .18))}"/>`);
  return g(`<path d="M0 0L${-L} ${-H}L${f(-L * .62)} 0L${-L} ${H}Z" fill="${c}"/>`); }
function fitText(str, fs, room, ls) { const est = String(str).length * (fs * .72 + (ls || 0)); return est > room ? ` textLength="${room.toFixed(1)}" lengthAdjust="${typeof window !== 'undefined' && window.TD_TABLET && est < room * 1.12 ? 'spacing' : 'spacingAndGlyphs'}"` : ''; }
// ship picture measurements: aspect ratio + nose tip height (fraction) found from the left-most solid pixels; cached per picture
const SHIPI = {};
function shipInfo(href) { if (!href) return { ar: 5.19, ny: .5 }; if (SHIPI[href]) return SHIPI[href]; SHIPI[href] = { ar: 5.19, ny: .486 };
  try { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => { try { const c = document.createElement('canvas'), w = c.width = im.naturalWidth, h = c.height = im.naturalHeight, g = c.getContext('2d'); g.drawImage(im, 0, 0);
      const d = g.getImageData(0, 0, w, h).data;
      /* NOSE POINT (24 NOV, RAZ: "the arrowq on the tip of the spaceshiop must be cetnered directly on the nose ... every ship needs checked" + "right now it's otoo high"):
         per column the longest solid run; nose = first column whose run is >= 10% of the tallest column (pointed prows like the Galaxy), unless that lands on a gun /
         spike more than 5% away from the hull centre - then the first column >= 22% (main hull). y = middle of the run over the next 1.5% of the width. Checked on 10 ships. */
      const R = new Array(w); let mx = 0;
      for (let x = 0; x < w; x++) { let best = 0, bs = 0, be = 0, st = -1; for (let y = 0; y <= h; y++) { const on = y < h && d[(y * w + x) * 4 + 3] > 90; if (on && st < 0) st = y; if (!on && st >= 0) { if (y - st > best) { best = y - st; bs = st; be = y - 1; } st = -1; } } R[x] = [best, bs, be]; if (best > mx) mx = best; }
      const at = t => { let c = 0; while (c < w - 1 && R[c][0] < t * mx) c++; const n = Math.max(2, Math.round(w * .015)); let sy = 0, k = 0; for (let x = c; x < Math.min(w, c + n); x++) { sy += (R[x][1] + R[x][2]) / 2; k++; } return [c / w, sy / k / h]; };
      const p10 = at(.1), p22 = at(.22), P = Math.abs(p10[1] - p22[1]) < .05 ? p10 : p22;
      SHIPI[href] = { ar: w / h, ny: P[1], nx: P[0] }; } catch (e) { } }; im.src = href; } catch (e) { }
  return SHIPI[href]; }
/* 360 TRAVEL RING (RAZ 24 NOV 12:20, his pick: "1 Good, put it on the iPad" = arrow360-combined.html + arrow360-animation.html):
   outer arcs around the ship's 360 ring: GREEN front = forward, ORANGE rear = backward, BLUE top / bottom = up / down, arcs grow with speed;
   one chevron outside the ring at the travel angle; violet side chevrons = left / right drift (screen marker); curved arrow over the top = turning;
   NO words on the ring; one row of SYMBOLS + numbers under it, names only on hover (<title>). Only drawn when the page passes `ring` (iPad page).
   Data (chat 8, 24 NOV): speed + up/down speed REAL; forward vs backward not confirmed yet -> GREY until known; turn rate CALCULATED;
   drift = snap.marker read from screen, missing / stale -> drift chevrons dim, never invented. Nose angle / pitch / roll are not in the game data. */
const RC = { grn: '#27e07a', org: '#ff8a1e', blu: '#3d9bff', gry: '#8b8590', drf: '#b49cff', trn: '#cfd6ff', off: '#2a3260' };
/* ALL-BLUE ring variant (preset 12 + ?dirs=blue, for his choice 24 NOV): forward bright sky blue, backward pale ice blue, up/down blue as he picked, drift/turn ice instead of lavender */
const RCB = { grn: '#7fd0ff', org: '#c4d7e6', blu: '#3d9bff', gry: '#8b8590', drf: '#e8f4ff', trn: '#c4d7e6', off: '#123a5c' };
/* BOOST SYMBOL - ONE function so chat 2 can swap it after RAZ picks a new one (24 NOV: the lightning bolt "electricity circle" was rejected).
   Placeholder = plain double chevron ">>". (x, y) = centre, size = full width in drawing units, on = boost engaged. */
function boostIcon(x, y, size, on) { const k = (size / 22).toFixed(3), c = on ? '#ffd24a' : '#5a6290';
  return `<g transform="translate(${x} ${y}) scale(${k})"><path d="M-9 -8L-1 0L-9 8M1 -8L9 0L1 8" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g>`; }
function ring360(cx, cy, RR, s) {
  if (!s) return '';
  const f = n => (+n).toFixed(2), rad = d => d * Math.PI / 180, P = (a, r) => [cx + r * Math.cos(rad(a)), cy - r * Math.sin(rad(a))]; /* 0 = nose (right), 90 = up */
  const RA = RR + 5, RCH = RR + 15, RT = RR + 30, C = DIRB() ? RCB : RC, esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const arc = (mid, half, r, col, w, op, dash) => { const [x1, y1] = P(mid - half, r), [x2, y2] = P(mid + half, r);
    return `<path d="M${f(x1)} ${f(y1)} A${r} ${r} 0 0 0 ${f(x2)} ${f(y2)}" fill="none" stroke="${col}" stroke-width="${f(w)}" stroke-linecap="round" opacity="${f(op)}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`; };
  const amt = v => Math.pow(Math.min(1, Math.abs(v) / 220), .6); /* 0..1 of a 220 m/s full arc */
  const lit = (mid, v, col) => { if (Math.abs(v) < 1) return ''; const k = amt(v); return arc(mid, 10 + 50 * k, RA, col, 2.4 + 2.6 * k, .5 + .5 * k); };
  const chev = (a, col, tip) => { const [x, y] = P(a, RCH); return `<g><title>${esc(tip)}</title><g transform="translate(${f(x)} ${f(y)}) rotate(${f(-a)}) scale(.8)"><path d="M-8 -11L7 0L-8 11L-3 0Z" fill="${col}" stroke="#fff" stroke-opacity=".5" stroke-width=".8" stroke-linejoin="round"/></g></g>`; };
  const pair = (col, tip) => `<g><title>${esc(tip)}</title><path transform="translate(${cx} ${cy + 52})" d="M-6 -7L-14 0L-6 7Z M6 -7L14 0L6 7Z" fill="${col}"/></g>`;
  const dr = s.drift || { seen: false }, drift = side => { /* lower corner chevrons, outside the ring */
    const x = cx + (side === 'L' ? -128 : 128), y = cy + 70, on = !!(dr.seen && dr.side === side), col = on ? C.drf : C.off, dir = side === 'L' ? -1 : 1,
      st = on ? `fill="${col}" stroke="#fff" stroke-opacity=".5" stroke-width=".8"` : `fill="none" stroke="${col}" stroke-width="1.3" stroke-dasharray="3 2"`;
    return `<g><title>${esc(`Drift ${side === 'L' ? 'left' : 'right'}${on ? ' ' + (dr.pct || 0) + ' %' : dr.seen ? ' (off)' : ' (no marker data' + (dr.why ? ': ' + dr.why : '') + ')'} · READ FROM SCREEN`)}</title><rect x="${x - 20}" y="${y - 14}" width="40" height="28" fill="transparent"/>` +
      `<g transform="translate(${x} ${y}) scale(${dir * .8} .8)"><path d="M-9 -10L4 0L-9 10L-4 0Z" ${st}/><path d="M3 -10L16 0L3 10L8 0Z" ${st}/></g></g>`; };
  const t = s.turn, hasT = t != null && Math.abs(t) >= .5, tcol = hasT ? C.trn : t == null ? C.gry : C.off;
  let g = arc(90, 22, RT, tcol, hasT ? 2.6 : 1.6, hasT ? 1 : .55, hasT ? '' : '3 3');
  if (hasT) { const end = t > 0 ? 68 : 112, [x, y] = P(end, RT); g += `<g transform="translate(${f(x)} ${f(y)}) rotate(${t > 0 ? 22 : 158})"><path d="M8 0L-6 -6L-6 6Z" fill="${C.trn}"/></g>`; }
  g = `<g><title>${esc(hasT ? `Turning ${t > 0 ? 'right' : 'left'} ${Math.abs(t).toFixed(1)}°/s` : t == null ? 'Turn rate: no value' : 'Not turning')} · CALCULATED, unconfirmed</title><rect x="${cx - 52}" y="${cy - RT - 8}" width="104" height="22" fill="transparent"/>${g}</g>`;
  g = `<g class="ring360">${g}<circle cx="${cx}" cy="${cy}" r="${RA}" fill="none" stroke="${C.off}" stroke-width="1.2" opacity=".7"/>`;
  const spd = Math.abs(+s.spd || 0), a = s.ang, moving = !s.nodata && a != null && spd >= 1;
  const h = moving && !s.sideOnly ? spd * Math.cos(rad(a)) : 0, v = moving ? spd * Math.sin(rad(a)) : 0;
  if (!moving) g += `<circle cx="${cx}" cy="${cy}" r="${RA}" fill="none" stroke="${C.gry}" stroke-width="2" stroke-dasharray="4 6" opacity=".7"><title>${s.nodata ? 'No flight data' : 'No direction (nearly stopped)'}</title></circle>`;
  else {
    if (s.back == null && Math.abs(h) >= 1) g += lit(0, h, C.gry) + lit(180, h, C.gry); /* forward or backward not known yet: both ends grey */
    else g += lit(h >= 0 ? 0 : 180, h, h >= 0 ? C.grn : C.org);
    g += lit(v >= 0 ? 90 : 270, v, C.blu);
    if (s.sideOnly) g += `<g><title>Sideways movement (screen marker)</title><path transform="translate(${cx} ${cy + 52})" d="M-6 -7L-14 0L-6 7Z M6 -7L14 0L6 7Z" fill="${C.drf}"/></g>`;
    else if (s.back == null && Math.abs(h) > Math.abs(v)) g += pair(C.gry, 'Forward or backward not known yet (waits on in-game test)');
    else if (s.back == null) g += chev(v >= 0 ? 90 : 270, C.blu, v >= 0 ? 'Travel: up' : 'Travel: down'); /* up / down known, front / back not: straight up / down only */
    else g += chev(a, Math.abs(v) > Math.abs(h) ? C.blu : h >= 0 ? C.grn : C.org, `Travel angle ${Math.round(a)}°`);
  }
  g += drift('L') + drift('R') + `</g>`;
  /* SYMBOL ROW under the ring: symbols + numbers only, a tile only when that value has data (RAZ 24 NOV: "nothing written all should be symbols") */
  const TW = 40, TH = 20, GAP = 4, tiles = [], ico = (d, k = .46) => d.replace(/^/, `<g transform="scale(${k})">`) + '</g>';
  const tile = (icon, num, col, name, src, off) => tiles.push({ icon, num: String(num), col, tip: name + ' · ' + src, off });
  { const unk = s.back == null && Math.abs(h) >= 1, fw = h > -1, col = Math.abs(h) < 1 || unk ? C.gry : fw ? C.grn : C.org;
    tile(unk ? `<path d="M3 -8L11 0L3 8Z M-3 -8L-11 0L-3 8Z" fill="${col}"/>` : `<path d="M-7 -10L8 0L-7 10L-2 0Z" fill="${col}"${fw ? '' : ' transform="scale(-1 1)"'}/>`, s.nodata ? '-' : Math.round(Math.abs(h)), col,
      s.nodata ? 'No flight data' : unk ? 'Forward / back speed m/s, direction unknown' : fw ? 'Forward speed m/s' : 'Backward speed m/s', 'speed REAL · forward / back waits on in-game test'); }
  { const lvl = Math.abs(v) < 1, up = v > 0, col = lvl ? C.trn : C.blu;
    tile(lvl ? `<path d="M-10 0H10" stroke="${col}" stroke-width="3" stroke-linecap="round"/><circle r="3" fill="${col}"/>` : `<path d="M0 -11L8 -2H3V11H-3V-2H-8Z" fill="${col}"${up ? '' : ' transform="scale(1 -1)"'}/>`, s.nodata ? '-' : Math.round(Math.abs(v)), col,
      s.nodata ? 'No flight data' : lvl ? 'Level, no up / down speed' : up ? 'Up speed m/s (world)' : 'Down speed m/s (world)', 'REAL · vertical speed'); }
  if (dr.seen) { const sd = dr.side, col = sd ? C.drf : C.trn;
    tile(sd ? `<g${sd === 'L' ? ' transform="scale(-1 1)"' : ''}><path d="M-11 -9L-1 0L-11 9L-7 0Z M0 -9L10 0L0 9L4 0Z" fill="${col}"/></g>` : `<path d="M-4 -8L-11 0L-4 8 M4 -8L11 0L4 8" fill="none" stroke="${col}" stroke-width="2.4" stroke-linejoin="round" opacity=".7"/>`,
      sd ? (dr.pct || 0) : 0, col, sd ? `Drifting ${sd === 'L' ? 'left' : 'right'}, marker offset %` : 'No side drift', 'READ FROM SCREEN · marker'); }
  if (t != null) { const on = Math.abs(t) >= .5, col = on ? C.trn : C.gry;
    tile(`<g${on && t < 0 ? ' transform="scale(-1 1)"' : ''}><path d="M-9 5A10 10 0 0 1 8 -1" fill="none" stroke="${col}" stroke-width="2.6" stroke-linecap="round"/>${on ? `<path d="M12 -4L10 6L3 0Z" fill="${col}"/>` : ''}</g>`,
      Math.abs(t) >= 10 ? Math.round(Math.abs(t)) : Math.abs(t).toFixed(1), col, on ? `Turning ${t > 0 ? 'right' : 'left'} °/s` : 'Not turning', 'CALCULATED · unconfirmed (nose or travel heading)'); }
  if (s.g != null) tile(`<circle r="10.5" fill="none" stroke="${C.trn}" stroke-width="1.6"/><text y="5.2" text-anchor="middle" style="font:700 15px Oxanium,Segoe UI,sans-serif;fill:${C.trn}">G</text>`, (+s.g).toFixed(1), C.trn, 'G load', 'REAL · amount only');
  if (s.boost != null) tiles.push({ raw: boostIcon(0, 0, 11, !!s.boost), num: s.boost ? '●' : '○', col: s.boost ? '#ffd24a' : '#5a6290', tip: (s.boost ? 'Boost on' : 'Boost off') + ' · REAL', off: !s.boost });
  const ty = cy + RR + 27, x0 = cx - (tiles.length * TW + (tiles.length - 1) * GAP) / 2;
  g += `<g class="ring360-row">` + tiles.map((T, i) => { const x = x0 + i * (TW + GAP);
    return `<g${T.off ? ' opacity=".4"' : ''}><title>${esc(T.tip)}</title><rect x="${f(x)}" y="${ty}" width="${TW}" height="${TH}" rx="8" fill="#12060a" stroke="#5a1a24" stroke-width="1.2"/>` +
      `<g transform="translate(${f(x + 11)} ${ty + TH / 2})">${T.raw || ico(T.icon)}</g>` +
      `<text x="${f(x + TW - 5)}" y="${ty + TH / 2 + 3.6}" text-anchor="end" style="font:600 10px Oxanium,Segoe UI,sans-serif;fill:${T.col}">${esc(T.num)}</text></g>`; }).join('') + `</g>`;
  return g; }
/* 10 m STEP SWITCH, opt-in (24 NOV, RAZ: "teh combat hud must show what it looks like with it going below 100 meters how it changes to increments of 10m").
   window.TD_ZOOM10 = true: under 100 m the RADAR ALT and STOP IN tapes become 0-100 m with a mark every 10 m (numbers every 20 m); they go back to the
   normal log scale only above 110 m (no flicker at 100 m); the two scales slide + cross-fade in 300 ms; a small magnifier symbol shows while zoomed.
   window.TD_CLOCK = optional function returning ms (sample pages run the fade on their own clock). Flag off = the 23 NOV instant switch at 100 m, unchanged. */
const Z10 = { alt: { on: false, z: 0, t: null }, stop: { on: false, z: 0, t: null } };
function zoom10(k, v) { const S = Z10[k], now = typeof window.TD_CLOCK === 'function' ? +window.TD_CLOCK() : performance.now();
  S.on = v == null ? false : S.on ? v < 110 : v < 100; const tg = S.on ? 1 : 0, dt = S.t == null ? 1e9 : Math.abs(now - S.t); S.t = now;
  S.z = S.z < tg ? Math.min(tg, S.z + dt / 300) : Math.max(tg, S.z - dt / 300); return S.z * S.z * (3 - 2 * S.z); }
const magGlass = (x, y, o) => o < .02 ? '' : `<g opacity="${o.toFixed(2)}"><circle cx="${x}" cy="${y}" r="4.8" fill="none" stroke="#ffd0d6" stroke-width="1.7"/><line x1="${x + 3.5}" y1="${y + 3.5}" x2="${x + 7.6}" y2="${y + 7.6}" stroke="#ffd0d6" stroke-width="2.2" stroke-linecap="round"/></g>`;
window.TD_Z10 = Z10; /* state, read by sample pages */
function travelDial({ bkb, gv, fpa, accel, vs, turn, side64, top64, turnStyle, stopD, stopT, ralt, speed, safeV, harmV, wingDeg, thr, gear, boost, brake, warn, modes, gm, mouse, damage, shipUrl, lowAlt, units, wordsOnly, gWarn, gRed, suit, all, ring }) {
  WO = !!wordsOnly;
  const W = 1000, H = 250, style = turnStyle || window.TURN_STYLE || 'trend';
  // --- left: side view (nose right). Nose at (nx, sy). ---
  const sx = 270, sy = 125, RR = 96, TBS = typeof window !== 'undefined' && window.TD_TABLET, SHW = TBS ? 156 : 120 /* 24 NOV 128 -> 156 (his words: "i need a clarer, larger ship"); sharpened 1024 px art */ /* tablet: ship bigger again, tail out toward the ring, nose where it was (23 NOV: "make the ship bigger ... the butt closer to the outside and the nose the same") */, nx = sx + SHW / 2 /* centred: nose as close to the ring as the tail (23 NOV) */, F = (() => { const f = ((fpa % 360) + 540) % 360 - 180; return f === -180 ? 180 : f; })(), R = -F * Math.PI / 180, BLU = '#1e90ff', col = DIRC(accel > 0.5 ? GRN : accel < -0.5 ? AMB : BLU), vcol = DIRC((((fpa % 360) + 540) % 360 - 180) < -1 ? AMB : GRN);
  /* nose level + wings level = the whole 360 ring turns blue (23 NOV: "wings level nose level makes the entire red circle of the 360 go blue") */
  const WLV = Math.abs(wingDeg != null ? wingDeg : turn / 3 * 20) < 1, ALLV = Math.abs(F) <= 1; /* nose level alone turns the 360 ring blue (23 NOV: "the 360 ring ... does not turn all blue every time it hits it") - the wing ring follows the wings */
  let ticks = '';
  for (let d = 0; d < 360; d += 10) { // full ring of degree marks (space: the ship can turn all the way round); 0 = horizon ahead
    const a = -d * Math.PI / 180, big = d % 30 === 0, r1 = RR - (big ? 9 : 4);
    ticks += `<line x1="${sx + r1 * Math.cos(a)}" y1="${sy + r1 * Math.sin(a)}" x2="${sx + RR * Math.cos(a)}" y2="${sy + RR * Math.sin(a)}" stroke="${ALLV ? (big || d === 0 || d === 180 ? '#4aa8ff' : '#1e6fd0') : d === 0 || d === 180 ? TEAL : big ? '#d83a52' : '#a8283d'}" stroke-width="${big ? 2.5 : 1.4}"/>`;
  }
  // RAZ 23 NOV: "nose up is green nose down is orange, tail gets no color" (level = blue, his level rule). Data = climb / dive of the TRAVEL direction (derived.flight_path_angle_deg); the game sends no pitch. Speed change shows in the ACCEL notch
  const ncol = DIRC(F > 1 ? GRN : F < -1 ? AMB : BLU);
  // the ship and its travel arrow are drawn level, then the whole group is turned by the angle
  const dmg = damage ? String(damage).toLowerCase() : (() => { /* DAMAGE FLASH from the real warning lights (24 NOV, RAZ: "the ship flashes with blue or red or white depending on what's taking damage").
     ESTIMATED (chat 8: the exact light triggers are a live-test item): HIT lit + a system light (PWR THR COOL QDRV WPN RADR) = component (RED); HIT lit + SHLD lit = hull, shields down (WHITE); HIT lit alone = shield took it (BLUE). Game 4.9 hit colors: blue shield, white hull, red component. */
    const AN = all && all.ann; if (!AN) return null; const on = v => /MINOR|MAJOR/.test(String(v || '')); if (!on(AN.hit)) return null;
    return ['pwr', 'thr', 'cool', 'qdrv', 'wpn', 'radr'].some(k => on(AN[k])) ? 'component' : on(AN.shld) ? 'hull' : 'shield'; })(), pul = .5 + .5 * Math.sin(Date.now() / 2400 * 2 * Math.PI);
  const shipFx = dmg === 'shield' ? `grayscale(1) sepia(1) saturate(6) hue-rotate(165deg) brightness(${(1.1 + .35 * pul).toFixed(2)})`
    : dmg === 'hull' ? `grayscale(1) brightness(${(1.25 + .6 * pul).toFixed(2)}) contrast(1.1) drop-shadow(0 0 ${(2 + 4 * pul).toFixed(1)}px #ffffff)` /* WHITE = hull (game color) */
    : dmg === 'component' ? `grayscale(1) sepia(1) saturate(12) hue-rotate(-38deg) brightness(${(.9 + .35 * pul).toFixed(2)}) drop-shadow(0 0 ${(2 + 4 * pul).toFixed(1)}px #ff1f3d)` /* RED = component (game color) */
    : (typeof window !== 'undefined' && window.TD_TABLET ? 'grayscale(1) brightness(1.05) contrast(1.2)' /* tablet: keep the hull detail (23 NOV: "the galaxy needs more detail"; later "low detail mushy stamp": no double brightening, sharpened 1024 px art) */ : 'grayscale(1) brightness(1.75) contrast(1.15)');
  // RAZ (via chat 8): "it will read what ship the user is in so the image should change inside the travel one" + "the nose cone isn't perfectly
  // centered on the nose". shipUrl = the bridge's port-side picture of the current ship (nose LEFT in the file, mirrored here); without it the Galaxy.
  // The picture is measured once (aspect + height of the nose tip) so the tip sits exactly on the travel line and the cone starts at the tip.
  const shipHref = shipUrl || (side64 ? 'data:image/png;base64,' + side64 : ''), shI = shipInfo(shipHref), shH = Math.min(40 * SHW / 120, SHW / shI.ar);
  const shipRot = `<g transform="rotate(${-F} ${sx} ${sy})">
   <image href="${shipHref}" x="${(2 * sx - nx - (shI.nx || 0) * Math.min(SHW, shH * shI.ar)).toFixed(2)}" y="${(sy - shH * shI.ny).toFixed(2)}" width="${SHW}" height="${shH.toFixed(2)}" preserveAspectRatio="xMinYMid meet" transform="scale(-1 1) translate(${-2 * sx} 0)" style="filter:brightness(1.7)"/>
   ${(() => { /* NOSE MARKER - samples (23 NOV: "make the nose cone of the ship in the nose up down meter different ... show me samples"); window.TD_NOSE 1-5, 1 = current */
     const v = +(typeof window !== 'undefined' && window.TD_NOSE) || 3 /* his pick 23 NOV: needle to the ring */, c = ncol, re = sx + RR - 4;
     if (v === 2) return `<path d="M${nx + 4} ${sy - 7}L${nx + 16} ${sy}L${nx + 4} ${sy + 7}" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`; /* open chevron */
     if (v === 3) return `<line x1="${nx}" y1="${sy}" x2="${re - 8}" y2="${sy}" stroke="${c}" stroke-width="1.6" stroke-dasharray="4 3"/><path d="M${re - 10} ${sy - 5}L${re}  ${sy}L${re - 10} ${sy + 5}Z" fill="${c}"/>`; /* needle to the ring */
     if (v === 4) return `<path d="M${nx + 2} ${sy - 6}L${nx + 10} ${sy}L${nx + 2} ${sy + 6}M${nx + 10} ${sy - 6}L${nx + 18} ${sy}L${nx + 10} ${sy + 6}" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`; /* double chevron */
     if (v === 5) return `<line x1="${nx}" y1="${sy}" x2="${re - 7}" y2="${sy}" stroke="${c}" stroke-opacity=".5" stroke-width="1.2"/><path d="M${re} ${sy - 7}L${re + 7} ${sy}L${re} ${sy + 7}L${re - 7} ${sy}Z" fill="${c}" stroke="#fff" stroke-width=".8"/>`; /* diamond on the ring */
     return `<path d="M${nx} ${sy}L${nx + 17} ${sy - 3.2}A3.2 3.2 0 0 1 ${nx + 17} ${sy + 3.2}Z" fill="${c}"/>`; })()}</g>`;
  const travel = '';
  // VSI-style readout, left of the tail, level with the ship
  // RAZ 23 NOV: "size of the nose angle read out pill reduce" -> 88 x 30 (was 116 x 40), same place
  const up = F > 1, dn = F < -1, TBL = true, bx = sx - 36, by = sy - 50, /* inside the ring on every pill (23 NOV: "move the angle into the 360 rotating field just like on tablet") */ /* tablet: inside the circle above the hull (23 NOV: "i want that degree readout inside the 360 circle above the hull") */ txt = (Math.round(Math.abs(F) * 10) / 10).toFixed(1) + '°';
  const vst = DIRC(up ? GRN : dn ? AMB : BLU); /* level = blue (his level rule) */
  const vsi = /* NO BOX (RAZ 24 NOV ~13:30: "remove the square around the nose altitute indicator and leave just the triangular direction marker and degree readout"); was deckFrame(bx - 4, by - 16, 80, 32, vst, true) */ '' + /* 80 wide = fits 90.0° without squeezing (RAZ 23 NOV: "match the largest range of degree displayed without cutting the sides") */
   (up ? `<path d="M${bx + 6} ${by + 4.5}l6.5 -9l6.5 9z" fill="${vst}"/>` : dn ? `<path d="M${bx + 6} ${by - 4.5}l6.5 9l6.5 -9z" fill="${vst}"/>` : `<rect x="${bx + 5}" y="${by - 2}" width="14" height="4" rx="2" fill="${vst}"/>`) +
   `<text x="${bx + 67}" y="${by + 5.5}" text-anchor="end" style="font:800 15px Oxanium,Segoe UI,sans-serif;fill:${WO ? vst : '#fff'};paint-order:stroke;stroke:#000;stroke-width:3px;stroke-opacity:.75">${txt}</text>`; /* dark outline keeps it readable without the box */
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
  const vx0 = 745, vtop = 70, vbot = 206, slowing = stopD != null && stopD > 0, Z10S = typeof window !== 'undefined' && !!window.TD_ZOOM10, zS = Z10S ? zoom10('stop', slowing ? +stopD : null) : 0, ZOOM = slowing && stopD < 100, /* under 100 m the bar zooms to 0-100 m, marks every 10 m (23 NOV) */ fLg = d => Math.max(0, Math.min(1, Math.log10(Math.max(10, d) / 10) / 3)), fZ = d => fLg(d) + (Math.min(1, d / 100) - fLg(d)) * zS, f = !slowing ? 0 : Z10S ? fZ(stopD) : ZOOM ? stopD / 100 : Math.max(0, Math.min(1, Math.log10(Math.max(10, stopD) / 10) / 3)), vy0 = vtop + f * (vbot - vtop);
  let stopG = `<line x1="${vx0}" y1="${vtop}" x2="${vx0}" y2="${vbot}" stroke="${DIM}" stroke-width="4" stroke-linecap="round"/>` +
   (Z10S ? (zS < .98 ? `<g opacity="${(1 - zS).toFixed(2)}">${[0, 100, 1000, 10000].map(d => { const y = vtop + fZ(d) * (vbot - vtop); return `<line x1="${vx0 - 9}" y1="${y.toFixed(1)}" x2="${vx0 - 3}" y2="${y.toFixed(1)}" stroke="${DIM}" stroke-width="2"/><text x="${vx0 - 12}" y="${(y + 4).toFixed(1)}" text-anchor="end" class="dl" style="font-size:9px">${d ? tick(d) : '0'}</text>`; }).join('')}</g>` : '') +
     (zS > .02 ? `<g opacity="${zS.toFixed(2)}">${Array.from({ length: 11 }, (_, i) => { const y = vtop + fZ(i * 10) * (vbot - vtop); return `<line x1="${vx0 - (i % 5 ? 6 : 9)}" y1="${y.toFixed(1)}" x2="${vx0 - 3}" y2="${y.toFixed(1)}" stroke="${DIM}" stroke-width="${i % 5 ? 1.4 : 2}"/>${i % 2 ? '' : `<text x="${vx0 - 12}" y="${(y + 3.5).toFixed(1)}" text-anchor="end" class="dl" style="font-size:9px">${i ? tick(i * 10) : '0'}</text>`}`; }).join('')}</g>` : '') + magGlass(vx0 - 42, 36, zS)
   : ZOOM ? Array.from({ length: 11 }, (_, i) => { const y = vtop + i * (vbot - vtop) / 10; return `<line x1="${vx0 - (i % 5 ? 6 : 9)}" y1="${y}" x2="${vx0 - 3}" y2="${y}" stroke="${DIM}" stroke-width="${i % 5 ? 1.4 : 2}"/>${i % 2 === 0 || i === 9 ? '' : ''}<text x="${vx0 - 12}" y="${y + 3.5}" text-anchor="end" class="dl" style="font-size:8px">${i ? tick(i * 10) : '0'}</text>`; }).join('')
     : [0, 1, 2, 3].map(i => { const y = vtop + i * (vbot - vtop) / 3; return `<line x1="${vx0 - 9}" y1="${y}" x2="${vx0 - 3}" y2="${y}" stroke="${DIM}" stroke-width="2"/><text x="${vx0 - 12}" y="${y + 4}" text-anchor="end" class="dl" style="font-size:9px">${i ? tick([0, 100, 1000, 10000][i]) : '0'}</text>`; }).join('')) +
   (slowing ? `<line x1="${vx0}" y1="${vtop}" x2="${vx0}" y2="${vy0}" stroke="${bc}" stroke-width="6" stroke-linecap="round"/>${head(vx0 + 8, vy0, 180, 14, 8, '#ffffff')}` : '') + /* triangle pointer = the radar altimeter's, mirrored (23 NOV: "mirror the triangle slider from the radar altimeter on the stop line") */
   `<text x="${vx0}" y="${42}" text-anchor="middle" class="md" fill="${slowing ? '#fff' : NEU}">${slowing ? '≈ ' + fmt(stopD) : '—'}</text><text x="${vx0}" y="${57}" text-anchor="middle" class="dl" style="font-size:10px">STOP IN</text>` +
   /* SPEED readout under the stop meter, smaller and right under the line (he: "speed is riding on the pill outer line") (RAZ 23 NOV: "need a speed readout on the travel pill below the stopping distance meter. it should also say STOP IN instead of just stop"); color = the same speed limits as the bar */
   `<text x="${vx0}" y="${222}" text-anchor="middle" class="md" style="font-size:12px" fill="${speed == null ? NEU : bc}">${speed == null ? '—' : (FT ? Math.round(sv * 3.28084) + ' ft/s' : Math.round(sv) + ' m/s')}</text><text x="${vx0}" y="${234}" text-anchor="middle" class="dl" style="font-size:9px">SPEED</text>`;
  // RADAR ALT slider (vertical): 0 = ground at the bottom; red below 10 ft (3.05 m), orange line at 10 ft; marker moves with height
  const sx2 = 925 /* pushed right, scale on line with the right edge (23 NOV) */, top = 70, bot = 206, FT10 = lowAlt != null && +lowAlt > 0 ? +lowAlt : 3.048 /* pilot low-level warning height, m (default 10 ft) */, maxA = 1000, Z10A = typeof window !== 'undefined' && !!window.TD_ZOOM10, zA = Z10A ? zoom10('alt', ralt != null ? +ralt : null) : 0, AZ = Z10A ? zA > .5 : ralt != null && +ralt < 100 /* under 100 m: zoom to 0-100 m, marks every 10 m, like STOP IN (23 NOV) */, hLn = m => bot - Math.max(0, Math.min(100, m)) / 100 * (bot - top), hLg = m => bot - Math.log10(1 + Math.max(0, Math.min(maxA, m))) / Math.log10(1 + maxA) * (bot - top), hOf = m => Z10A ? hLg(m) + (hLn(m) - hLg(m)) * zA : AZ ? bot - Math.max(0, Math.min(100, m)) / 100 * (bot - top) : bot - Math.log10(1 + Math.max(0, Math.min(maxA, m))) / Math.log10(1 + maxA) * (bot - top); // log scale: the ground end gets room
  const yO = hOf(FT10), ra = ralt != null ? +ralt : null, ym = ra != null ? hOf(ra) : null, rcol = ra == null ? NEU : ra < FT10 ? '#ff1f3d' : ra < FT10 * 3 ? AMB : '#fff';
  const altG = `<line x1="${sx2}" y1="${top}" x2="${sx2}" y2="${bot}" stroke="${DIM}" stroke-width="4" stroke-linecap="round"/>
   ${Z10A ? (zA < .98 ? `<g opacity="${(1 - zA).toFixed(2)}">${[10, 100, 1000].map(m => `<line x1="${sx2 - 9}" y1="${hOf(m).toFixed(1)}" x2="${sx2 - 3}" y2="${hOf(m).toFixed(1)}" stroke="${DIM}" stroke-width="2"/><text x="${sx2 + 12}" y="${(hOf(m) + 4).toFixed(1)}" class="dl" style="font-size:10px">${tick(m)}</text>`).join('')}</g>` : '') +
     (zA > .02 ? `<g opacity="${zA.toFixed(2)}">${[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(m => `<line x1="${sx2 - (m % 50 ? 6 : 9)}" y1="${hOf(m).toFixed(1)}" x2="${sx2 - 3}" y2="${hOf(m).toFixed(1)}" stroke="${DIM}" stroke-width="${m % 50 ? 1.4 : 2}"/>${m % 20 ? '' : `<text x="${sx2 + 12}" y="${(hOf(m) + 3.5).toFixed(1)}" class="dl" style="font-size:9px">${tick(m)}</text>`}`).join('')}</g>` : '') + magGlass(sx2 + 42, 36, zA)
   : (AZ ? [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] : [10, 100, 1000]).map(m => `<line x1="${sx2 - (AZ && m % 50 ? 6 : 9)}" y1="${hOf(m)}" x2="${sx2 - 3}" y2="${hOf(m)}" stroke="${DIM}" stroke-width="${AZ && m % 50 ? 1.4 : 2}"/><text x="${sx2 + 12}" y="${hOf(m) + (AZ ? 3.5 : 4)}" class="dl" style="font-size:${AZ ? 8 : 10}px">${tick(m)}</text>`).join('')}
   <line x1="${sx2}" y1="${yO}" x2="${sx2}" y2="${bot}" stroke="#ff1f3d" stroke-width="6" stroke-linecap="round"/>
   <line x1="${sx2 - 12}" y1="${yO}" x2="${sx2 + 12}" y2="${yO}" stroke="${AMB}" stroke-width="3"/>
   <line x1="${sx2 - 14}" y1="${bot + 4}" x2="${sx2 + 14}" y2="${bot + 4}" stroke="${NEU}" stroke-width="3"/><text x="${sx2 + 18}" y="${bot + 8}" class="dl" style="font-size:10px">0</text>
   ${ym != null ? `${head(sx2 - 8, ym, 0, 14, 8, rcol === '#fff' ? '#ffffff' : rcol)}` : ''}
   <text x="${sx2}" y="${42}" text-anchor="middle" class="md" fill="${rcol}">${ra != null ? (FT ? Math.round(ra * 3.28084).toLocaleString('en-US') + ' ft' : ra < 10 ? ra.toFixed(1) + ' m' : Math.round(ra) + ' m') : '—'}</text>
   <text x="${sx2}" y="${57}" text-anchor="middle" class="dl" style="font-size:10px">RADAR ALT</text>`;
  // GEAR next to RADAR ALT (RAZ 23 NOV: "1 next to radar alt"). Game value vehicle.state.flight.state.gear.
  // Three lights like an aircraft gear panel: DOWN = three green, MOVING = amber, UP = dark; no reading = dashes.
  const gx = 815, gs0 = gear == null ? null : String(gear).toUpperCase(), gs = gs0 === 'DEPLOYED' ? 'DOWN' : gs0 === 'RETRACTED' ? 'UP' : /DEPLOYING|RETRACTING|MOVING/.test(gs0 || '') ? 'MOVING' : gs0, gc = gs === 'DOWN' ? ONC() : gs === 'MOVING' ? MVC() : null;
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
  const gearG = `<g transform="translate(-735 68)"><!-- GEAR on the left between BOOST and BRAKE (23 NOV swap) --><!-- centred on the height of the STOP IN / RADAR ALT bars (23 NOV) --><text x="${gx + 4}" y="80" text-anchor="middle" class="dl" style="font-size:10px">GEAR</text>
   ${(() => { window.__gMc = gs === 'MOVING' ? (RSIT() ? ONC() : Math.floor(gT / 450) % 2 === 0 ? AMB : (gUp ? '#ff1f3d' : ONC())) : null; return ''; })()}<!-- MOVING color (RAZ 23 NOV): extending = orange <-> green, retracting = orange <-> red, swapping every 0.45 s --><g>${gCells.map(([x, y]) => `<path transform="translate(${x.toFixed(2)} ${y.toFixed(2)})" d="M7 0l7 4v8l-7 4-7-4V4z" fill="${window.__gMc || gc || '#22030a'}" fill-opacity="${gc ? .9 : .8}" stroke="${gs === 'MOVING' ? 'none' : gc ? '#fff' : DIM}" stroke-opacity="${gc ? .7 : 1}" stroke-width="1"/>`).join('')}</g>
   ${gs === 'MOVING' && Math.floor(gT / 250) % 2 === 0 ? gCells.slice(1).map(([x, y], j) => { const d = gDir[j + 1], sg = gUp ? -1 : 1 /* lower cells: in when closing, out when opening (as first approved) */, ux = d[0] * sg, uy = d[1] * sg, cx = x + 7 + ux * 3.2, cy = y + 8 + uy * 3.2, px = -uy, py = ux, s = 2.6;
     return `<polyline points="${(cx - ux * s * .55 + px * s).toFixed(2)},${(cy - uy * s * .55 + py * s).toFixed(2)} ${(cx + ux * s * .45).toFixed(2)},${(cy + uy * s * .45).toFixed(2)} ${(cx - ux * s * .55 - px * s).toFixed(2)},${(cy - uy * s * .55 - py * s).toFixed(2)}" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>`; }).join('') : ''}${gs === 'MOVING' && Math.floor(gT / 250) % 2 === 0 ? (() => { const [x, y] = gCells[0], cx = x + 7, cy = y + 8, up = gUp; /* top cell: arrow up = gear going up, arrow down = gear going down (RAZ 23 NOV) */
     const uy = up ? 1 : -1 /* flipped (RAZ 23 NOV: "flip those two chevrons" - "the ones you just put in" = the top-cell chevrons) */, c2 = cy + uy * 1.5, sz = 2.6; /* same chevron as the lower cells (RAZ: "not an actual arrow. the same chevron as the other two") */
     return `<polyline points="${(cx - sz).toFixed(2)},${(c2 - uy * sz * .55).toFixed(2)} ${cx},${(c2 + uy * sz * .45).toFixed(2)} ${(cx + sz).toFixed(2)},${(c2 - uy * sz * .55).toFixed(2)}" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>`; })() : ''}<!-- chevrons in the two main-gear cells point the way they travel: in (up-right / up-left) when closing, out (down-left / down-right) when opening; top cell only flashes (RAZ 23 NOV) -->
   <text x="${gx + 4}" y="138" text-anchor="middle" class="md" style="font-size:12px" fill="${gc || NEU}">${gs || '—'}</text></g>`;
  const b = boost || null, bres = b && b.reserves != null ? Math.max(0, Math.min(1, +b.reserves > 1 ? +b.reserves / 100 : +b.reserves)) : null,
    bon = !!(b && b.engaged), bcol = b && b.critical ? '#ff1f3d' : '#1e90ff' /* boost = blue (23 NOV) */, nlit = bres == null ? 0 : Math.round(bres * 8);
  const boostG = `<text x="40" y="52" class="dl" style="font-size:10px;${bon ? 'fill:#fff' : ''}">BOOST</text>
   <text x="128" y="52" text-anchor="end" class="md" style="font-size:12px" fill="${bres == null ? NEU : bcol}">${bres == null ? '—' : Math.round(bres * 100) + '%'}</text>
   ${Array.from({ length: 8 }, (_, i) => `<rect x="${40 + i * 11}" y="60" width="9" height="10" rx="2" fill="${i < nlit ? (bon || (b && b.critical) ? bcol : '#155fae') : '#22030a'}" stroke="${i < nlit && bon ? '#fff' : DIM}" stroke-width="1" ${i < nlit && bon ? `` : ''}/>${i < nlit ? hot(40 + i * 11, 60, 9, 10, 2) : ''}`).join('')}`;
  const bk = brake == null ? null : !!brake, BKC = ONC() === GRN ? '#ff1f3d' : ONC(); /* preset 12: brake ON is a state = lit blue, not red (24 NOV color rule) */
  const brakeG = `<rect x="40" y="82" width="88" height="10" rx="5" fill="${bk ? BKC : '#22030a'}" stroke="${bk ? '#fff' : DIM}" stroke-width="1" ${bk ? `` : ''}/>
   <text x="40" y="106" class="dl" style="font-size:10px;${bk ? 'fill:#fff' : ''}">BRAKE</text>
   <text x="128" y="106" text-anchor="end" class="md" style="font-size:${bk == null ? 8 : 12}px" fill="${bk ? BKC : NEU}">${bk == null ? 'NO DATA' : bk ? 'ON' : 'OFF'}</text>
   <text x="40" y="121" class="dl" style="font-size:8px;letter-spacing:.4px">BRAKE BOOSTS</text><text x="128" y="121" text-anchor="end" class="md" style="font-size:10px" fill="${bkb == null ? NEU : bkb ? ONC() : NEU}">${bkb == null ? '—' : bkb ? 'ON' : 'OFF'}</text>`; /* BRAKE up under BOOST + the game setting "space brake engages boost" (23 NOV) */
  /* G MOVEMENT HELPER (23 NOV: "where's my g-meter movement helper"): which way the load pushes you, CALCULATED from the helper's motion values (speed change +
     turn rate x speed) - the game sends no G direction. Down = pushed back into the seat (speeding up), up = thrown forward (braking), left / right = thrown out of the turn. */
  const gHelp = (() => { const cx = 842, cy = 138, Rg = 28, /* between THR and RADAR ALT (23 NOV: "switch gear and the fwd back up down graphic") */ gl = (+accel || 0) / 9.81, gs = (+speed || 0) * (+turn || 0) * Math.PI / 180 / 9.81, sc = v => Math.max(-1, Math.min(1, v / 3));
    /* size = the game's own G value (g_meter current); direction = calculated from speed change + turn (23 NOV: "there's a g-force telemetry displayed on the HUD ... it just needs to be extrapolated") */
    const gGame = gm && gm[0] != null ? Math.max(0, +gm[0] - 1) : null, cm = Math.hypot(gl, gs), ux = cm > .02 ? -gs / cm : 0, uy = cm > .02 ? gl / cm : 0, mag = gGame != null ? gGame : cm;
    const dx = ux * Math.min(1, mag / 4) * (Rg - 5), dy = uy * Math.min(1, mag / 4) * (Rg - 5), gc = mag < 1.5 ? GRN : mag < 3 ? AMB : '#ff1f3d', none = speed == null;
    return `<circle cx="${cx}" cy="${cy}" r="${Rg}" fill="#070203" stroke="#ff2a45" stroke-opacity=".55" stroke-width="1"/><circle cx="${cx}" cy="${cy}" r="${Rg / 2}" fill="none" stroke="#ff2a45" stroke-opacity=".25" stroke-width=".7"/><!-- RING + GLOW PIP (24 NOV, his pick on the Work Gallery: "G dot 1 ring + glow pip") -->${[-1, 1].flatMap(d => [`<line x1="${cx + d * Rg}" y1="${cy}" x2="${cx + d * (Rg - 5)}" y2="${cy}" stroke="#ff5d70" stroke-width="1.6"/>`, `<line x1="${cx}" y1="${cy + d * Rg}" x2="${cx}" y2="${cy + d * (Rg - 5)}" stroke="#ff5d70" stroke-width="1.6"/>`]).join('')}
     <line x1="${cx - Rg}" y1="${cy}" x2="${cx + Rg}" y2="${cy}" stroke="#ff2a45" stroke-opacity=".35" stroke-width=".7"/><line x1="${cx}" y1="${cy - Rg}" x2="${cx}" y2="${cy + Rg}" stroke="#ff2a45" stroke-opacity=".35" stroke-width=".7"/>
     <text x="${cx}" y="${cy - Rg - 4}" text-anchor="middle" class="dl" style="font-size:7px">FWD</text><text x="${cx}" y="${cy + Rg + 9}" text-anchor="middle" class="dl" style="font-size:7px">BACK</text>
     <text x="${cx - Rg - 4}" y="${cy + 2.5}" text-anchor="end" class="dl" style="font-size:7px">L</text><text x="${cx + Rg + 4}" y="${cy + 2.5}" class="dl" style="font-size:7px">R</text>
     ${none ? '' : `<line x1="${cx}" y1="${cy}" x2="${(cx + dx).toFixed(1)}" y2="${(cy + dy).toFixed(1)}" stroke="${gc}" stroke-width="2" stroke-linecap="round"/><circle cx="${(cx + dx).toFixed(1)}" cy="${(cy + dy).toFixed(1)}" r="8" fill="${gc}" opacity=".28"/><circle cx="${(cx + dx).toFixed(1)}" cy="${(cy + dy).toFixed(1)}" r="4.6" fill="${gc}" stroke="#fff" stroke-width=".8" style="filter:drop-shadow(0 0 3px ${gc})"/>`}
     <text x="${cx}" y="${cy + Rg + 19}" text-anchor="middle" class="dl" style="font-size:6.4px;opacity:.85">G PUSH · CALC</text><!-- 24 NOV, his question "the forward etc actually shows direction of travel correct, not the g forcesw": it is the G push (speed change + turn), NOT travel - labelled so -->
     ${(() => { /* UP / DOWN G bar (23 NOV: "what about up and down?"): from the change of vertical speed (calculated), + = pushed down into the seat */ const bx2 = cx + Rg + 16, top = cy - Rg, bh = Rg * 2, v = gv == null ? null : Math.max(-1, Math.min(1, gv / 3)), vc = v == null ? DIM : Math.abs(gv) < 1.5 ? GRN : Math.abs(gv) < 3 ? AMB : '#ff1f3d';
       return `<rect x="${bx2 - 2.5}" y="${top}" width="5" height="${bh}" rx="2.5" fill="#22030a" stroke="${DIM}" stroke-width=".8"/><line x1="${bx2 - 5}" y1="${cy}" x2="${bx2 + 5}" y2="${cy}" stroke="#ff2a45" stroke-opacity=".5" stroke-width=".8"/>`
        + (v == null ? '' : `<rect x="${bx2 - 2.5}" y="${v < 0 ? cy + v * Rg : cy}" width="5" height="${Math.abs(v) * Rg}" fill="${vc}"/>${head(bx2 + 5, cy + v * Rg, 180, 9, 5, '#ffffff')}`)
        + `<text x="${bx2}" y="${top - 4}" text-anchor="middle" class="dl" style="font-size:7px">UP</text><text x="${bx2}" y="${top + bh + 9}" text-anchor="middle" class="dl" style="font-size:7px">DN</text>`; })()}`; })();
  /* VERTICAL THROTTLE (23 NOV: "the throttle bar should be vertical as well"): same height as STOP IN / RADAR ALT, centre = 0 (blue),
     forward fills up in green, reverse fills down in amber; the dot takes the color; value under it */
  const thrV = (() => { const tp = thr == null ? null : Math.max(-100, Math.min(100, +thr)), tc = DIRC(tp == null ? NEU : Math.abs(tp) < 1 ? '#1e90ff' : tp > 0 ? GRN : AMB), x = 790 /* between STOP IN and RADAR ALT (23 NOV: "place throttle in between stopping distance and radar altimeter") */, t0 = 70, b0 = 206, mid = (t0 + b0) / 2, half = (b0 - t0) / 2, ty = tp == null ? mid : mid - tp / 100 * half;
    return `<text x="${x}" y="57" text-anchor="middle" class="dl" style="font-size:10px">THR</text>
     <line x1="${x}" y1="${t0}" x2="${x}" y2="${b0}" stroke="${DIM}" stroke-width="4" stroke-linecap="round"/>
     ${[-1, -.5, .5, 1].map(k => `<line x1="${x - 7}" y1="${mid - k * half}" x2="${x - 3}" y2="${mid - k * half}" stroke="#ff5d70" stroke-opacity=".6" stroke-width="1.5"/>`).join('')}
     <line x1="${x - 9}" y1="${mid}" x2="${x + 9}" y2="${mid}" stroke="${tp == null ? '#fff' : tc}" stroke-width="2"/>
     ${tp != null && Math.abs(tp) >= 1 ? `<line x1="${x}" y1="${mid}" x2="${x}" y2="${ty}" stroke="${tc}" stroke-width="6" stroke-linecap="butt"/>` : ''}
     ${tp != null ? `${head(x - 7, ty, 0, 13, 7, '#ffffff')}` : ''}<!-- triangle pointer like STOP IN / RADAR ALT (23 NOV: "remove the circle") -->
     <text x="${x + 4}" y="234" text-anchor="middle" class="md" style="font-size:11px" fill="${tc}">${tp == null ? '—' : (tp > 0 ? '+' : '') + Math.round(tp) + '%'}</text>`; })();
  const fan = stopG + altG + gearG + boostG + brakeG + (typeof window !== 'undefined' && window.TD_NOG ? '' : gHelp) + thrV; /* TD_NOG = draw without the G helper (combat overlay draws it as its own piece) */
  // --- middle: top view (nose up) + turn indicator ---
  const tx = 497, ty = 172, ny = ty - 58, dir = turn > 0.5 ? 1 : turn < -0.5 ? -1 : 0, rate = Math.abs(turn);
  let turnG = '';
  if (style === 'trend') { // Garmin G1000: bar along a strip above the nose; marks at half-standard (1.5°/s) and standard (3°/s) rate
    // RAZ 23 NOV: "rework the left right turn line ... remember when wings level it's blue. when nose not turning, blue"
    // turn-rate strip = red holo deck pip cells: 8 per side, 0.5 °/s each (full = 4 °/s); taller marks at 1.5 and 3 °/s (half / standard rate)
    const yb = 70, N = 8, P = 9.5, cw = 7, chh = 12, lit = dir ? Math.min(N, Math.ceil(rate / 0.5 - 0.001)) : 0, tcol = dir ? DIRC(GRN) : BLU;
    turnG = [-1, 1].map(d => Array.from({ length: N }, (_, i) => { const on = d === dir && i < lit, x = tx + d * (8 + i * P) - (d < 0 ? cw : 0);
      return `<rect x="${x}" y="${yb - chh / 2}" width="${cw}" height="${chh}" rx="2" fill="${on ? DIRC(GRN) : WLV ? '#061a33' : '#22030a'}" stroke="${on ? '#e8fff0' : WLV ? '#1e5fae' : DIM}" stroke-width="1" ${on ? `` : ''}/>${on ? hot(x, yb - chh / 2, cw, chh, 2) : ''}`; }).join('') +
      [3, 6].map(c => `<line x1="${tx + d * (8 + c * P - 1.25)}" y1="${yb - 13}" x2="${tx + d * (8 + c * P - 1.25)}" y2="${yb - 8}" stroke="${c === 6 ? '#fff' : NEU}" stroke-width="2"/>`).join('') +
      `<path d="M${tx + d * (8 + N * P + 3)} ${yb - 5}l${d * 6} 5l${-d * 6} 5" fill="none" stroke="${d === dir && rate > 4 ? DIRC(GRN) : WLV ? '#1e5fae' : DIM}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`).join('') +
      `<rect x="${tx - 2}" y="${yb - 10}" width="4" height="20" rx="2" fill="${tcol}"/>`;
    { const cy = 178 /* ring up a hair (23 NOV) */, a = wingDeg != null ? wingDeg : Math.max(-45, Math.min(45, turn / 3 * 20)), n = ((a % 360) + 540) % 360 - 180, w = 34 /* wings clear of the ring (23 NOV) */, lvl = Math.abs(n) < 1, c = lvl ? BLU : DIRC(GRN);
      const MK = lvl ? BLU : NEU, LV = lvl ? BLU : DIM; /* marks + level lines blue when wings level (23 NOV) */
      /* 180 ring over the top of the wings, same build as the ship's 360 ring (23 NOV: "the left right wing top sides needs a 180 ring as well") */
      { const R2 = (typeof window !== 'undefined' && window.TD_WINGIMG && (window.TD_WINGFX || 'horizon') === 'horizon') ? 53 : 48 /* 24 NOV: bigger ring + ship for option 4 */; for (let d = 0; d < 360; d += 10) { const an = Math.PI + d * Math.PI / 180, big = d % 30 === 0 /* top + bottom 180 (23 NOV: "do the same compass 180 on the bottom") */, r1 = R2 - (big ? 8 : 4);
        turnG += `<line x1="${(tx + r1 * Math.cos(an)).toFixed(2)}" y1="${(cy + r1 * Math.sin(an)).toFixed(2)}" x2="${(tx + R2 * Math.cos(an)).toFixed(2)}" y2="${(cy + R2 * Math.sin(an)).toFixed(2)}" stroke="${lvl ? (big ? '#4aa8ff' : '#1e6fd0') : (d === 90 || d === 270 ? TEAL : big ? '#d83a52' : '#a8283d')}" stroke-width="${big ? 2.3 : 1.3}"/>`; } }
      turnG += [-1, 1].map(d => `<text x="${tx + d * 62}" y="${cy + 28}" text-anchor="middle" class="dl" style="fill:${lvl ? BLU : '#ffd0d6'}">${d < 0 ? 'L' : 'R'}</text>`).join('') + /* L HIGH / R HIGH removed (23 NOV: "remove that L HIGH and R HIGH") */
        `<line x1="${tx - 54}" y1="${cy}" x2="${tx - 42}" y2="${cy}" stroke="${LV}" stroke-width="3"/><line x1="${tx + 42}" y1="${cy}" x2="${tx + 54}" y2="${cy}" stroke="${LV}" stroke-width="3"/>` +
        (typeof window !== 'undefined' && (() => { /* REAL REAR PHOTO per ship (RAZ 24 NOV: "i want real ship photo"): window.TD_WINGREAR = list of slugs in ship-rear/ (FleetYards rear views); match the live ship name; no name = the example ship (TD_WINGIMG) */
      if (all && all.shipRear) { window.__tdWingNow = all.shipRear; return true; } /* live: the bridge's rear photo for this ship wins (chat 8 snap.ship.rear) */
      const L = window.TD_WINGREAR, nm = all && all.shipName ? String(all.shipName).toLowerCase().replace(/[^a-z0-9]/g, '') : '';
      if (L && nm) { let best = null; L.forEach(sl => { const mdl = sl.replace(/^[a-z]+-/, '').replace(/[^a-z0-9]/g, ''); if (mdl && nm.includes(mdl) && (!best || mdl.length > best[1])) best = [sl, mdl.length]; }); window.__tdWingNow = best ? 'ship-rear/' + best[0] + '.webp' : null; }
      else window.__tdWingNow = window.TD_WINGIMG || null; return !!window.__tdWingNow; })() /* real picture only for the ship it shows (24 NOV demo: Prowler must not show the Galaxy); other ships = drawn shape until their own rear picture exists */ ? (() => { /* WING ANGLE from the REAL SHIP picture (24 NOV rebuild, his words: "none of tyhe turn rate wing angle will do rebuild"); window.TD_WINGFX:
      photo = real pixels grey / holo = real pixels tinted deep blue with a glow / edge = line drawing traced from the real pixels (MFD hologram) / horizon = photo over a level horizon */
     const WIMG = window.__tdWingNow || window.TD_WINGIMG, fx = window.TD_WINGFX || 'horizon' /* option 4 = default (RAZ 24 NOV: "4 ... wing angle rebuild, real ship") */, SW = fx === 'horizon' ? 94 : 80, SH = SW / 3, img = (f, extra = '') => `<image href="${WIMG}" x="${tx - SW / 2}" y="${cy - SH / 2}" width="${SW}" height="${SH}" preserveAspectRatio="xMidYMid meet" style="${f}"${extra}/>`;
     const fid = 'wfx' + Math.round(tx);
     const defs = false ? `<defs><filter id="${fid}" x="-10%" y="-10%" width="120%" height="120%"><feColorMatrix type="saturate" values="0"/><feConvolveMatrix order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" preserveAlpha="true"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .65  0 0 0 0 1  2.6 2.6 2.6 0 -.15"/><feGaussianBlur stdDeviation=".25"/></filter></defs>` : '';
     const ship = fx === 'holo' ? img('filter:grayscale(1) brightness(.95) sepia(1) hue-rotate(185deg) saturate(5) contrast(1.15) drop-shadow(0 0 2.5px #3d6bff) drop-shadow(0 0 6px rgba(61,107,255,.6))')
       : fx === 'edge' ? `<g opacity=".16">${img('filter:grayscale(1) brightness(.6) sepia(1) hue-rotate(185deg) saturate(3)')}</g><image href="${String(window.TD_WINGIMG).replace(/\.webp$/, '-lines.webp')}" x="${tx - 40}" y="${cy - 13.3}" width="80" height="26.6" preserveAspectRatio="xMidYMid meet" style="filter:drop-shadow(0 0 2px #3d6bff)"/>` /* lines traced from the real picture ahead of time (ship-front/<ship>-lines.webp) */
       : img(dmg ? 'filter:' + shipFx : fx === 'horizon' ? 'filter:grayscale(1) brightness(1.2) contrast(1.18) drop-shadow(0 1.2px 1.5px rgba(0,0,0,.85))' : 'filter:grayscale(1) brightness(1.15) contrast(1.15)');
     const HR = 44; /* horizon disc radius: inside the big ring marks (53 - 8) */
     const hz = fx === 'horizon' ? `<defs><clipPath id="${fid}c"><circle cx="${tx}" cy="${cy}" r="${HR}"/></clipPath>` +
       `<linearGradient id="${fid}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#030a1f"/><stop offset=".55" stop-color="#0c2458"/><stop offset=".92" stop-color="#2a5fb8"/><stop offset="1" stop-color="#6f9cf0"/></linearGradient>` +
       `<linearGradient id="${fid}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2468"/><stop offset=".12" stop-color="#24154a"/><stop offset=".6" stop-color="#120a2a"/><stop offset="1" stop-color="#06030f"/></linearGradient>` +
       `<radialGradient id="${fid}v" cx=".5" cy=".5" r=".5"><stop offset=".72" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>` +
       `<filter id="${fid}h" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="1.2"/></filter></defs>` +
       `<g clip-path="url(#${fid}c)"><rect x="${tx - HR}" y="${cy - HR}" width="${HR * 2}" height="${HR}" fill="url(#${fid}s)"/><rect x="${tx - HR}" y="${cy}" width="${HR * 2}" height="${HR}" fill="url(#${fid}g)"/>` +
       [-20, -10, 10, 20].map(p => `<line x1="${tx - (Math.abs(p) === 10 ? 9 : 14)}" y1="${cy + p * 1.3}" x2="${tx + (Math.abs(p) === 10 ? 9 : 14)}" y2="${cy + p * 1.3}" stroke="${p < 0 ? '#7fa6ff' : '#9a7fe0'}" stroke-opacity=".35" stroke-width=".6"/>`).join('') /* faint 10 / 20 deg marks above and below, level with the horizon */ +
       `<line x1="${tx - HR}" y1="${cy}" x2="${tx + HR}" y2="${cy}" stroke="#9fc0ff" stroke-width="3" opacity=".55" filter="url(#${fid}h)"/><line x1="${tx - HR}" y1="${cy}" x2="${tx + HR}" y2="${cy}" stroke="#dfe9ff" stroke-width=".9"/>` +
       `<circle cx="${tx}" cy="${cy}" r="${HR}" fill="url(#${fid}v)"/></g><circle cx="${tx}" cy="${cy}" r="${HR}" fill="none" stroke="#3d5fb0" stroke-opacity=".6" stroke-width=".8"/>` : ''; /* 24 NOV refine: shaded sky (dark space above, lit band at the horizon), shaded ground, glowing horizon line, edge shade */
     const RV = /ship-rear\/|\/rear\//.test(String(WIMG)); /* REAR VIEW (RAZ 24 NOV: "I said from the rear. its currently the front of the ship showing"): seen from behind, a right bank dips the RIGHT side of the picture, so the turn is the mirror of the head-on picture */
     const dl = dmg ? `<text x="${tx}" y="${cy + 38}" text-anchor="middle" style="font:700 6.5px Oxanium,Segoe UI,sans-serif;letter-spacing:1px;fill:${dmg === 'shield' ? '#7fb8ff' : dmg === 'hull' ? '#ffffff' : '#ff5a6a'}">${dmg === 'shield' ? 'SHIELD HIT' : dmg === 'hull' ? 'HULL HIT' : 'COMPONENT HIT'} · EST</text>` : '';
     const NOSHIP = !!(all && all.src && /LIVE/.test(String(all.src)) && !all.shipName && !all.shipRear); /* chat 8, 24 NOV: live data but no ship (game off / on foot): the example Galaxy must never look like his current ship -> dimmed + NO SHIP */
     const ns = NOSHIP ? `<text x="${tx}" y="${cy + 38}" text-anchor="middle" style="font:700 6.5px Oxanium,Segoe UI,sans-serif;letter-spacing:1.2px;fill:#b0727b">NO SHIP</text>` : '';
     return defs + hz + `<g transform="rotate(${RV ? a : -a} ${tx} ${cy})"${NOSHIP ? ' opacity=".28"' : ''}>${ship}</g>` + (NOSHIP ? ns : dl); })() /* REAL SHIP head-on (FleetYards front view, real pixels) banks with the wing angle - 24 NOV, his words: "i asked for a new rear view of the ship currently showing wing angle" */ :
        `<g transform="rotate(${-a} ${tx} ${cy})">${/* tilt flipped (23 NOV: "make the nose turn left while the wings turn right so it is not confusing") */''}${/* SPACESHIP REAR VIEW (23 NOV: "no that's a prop plane"): angular hull, swept wings with canted tips, twin fins, two engine glows; banks with the turn */''}
    <path d="M${tx - 9} ${cy - 2}L${tx - w + 3} ${cy + 1}L${tx - w} ${cy + 6}L${tx - w + 6} ${cy + 4.5}L${tx - 8} ${cy + 4}Z" fill="${c}" fill-opacity=".85" stroke="#fff" stroke-opacity=".5" stroke-width=".6"/>
    <path d="M${tx + 9} ${cy - 2}L${tx + w - 3} ${cy + 1}L${tx + w} ${cy + 6}L${tx + w - 6} ${cy + 4.5}L${tx + 8} ${cy + 4}Z" fill="${c}" fill-opacity=".85" stroke="#fff" stroke-opacity=".5" stroke-width=".6"/>
    <path d="M${tx - 6.5} ${cy - 4}L${tx - 11.5} ${cy - 17}L${tx - 3} ${cy - 5}Z" fill="${c}" fill-opacity=".8" stroke="#fff" stroke-opacity=".45" stroke-width=".5"/>
    <path d="M${tx + 6.5} ${cy - 4}L${tx + 11.5} ${cy - 17}L${tx + 3} ${cy - 5}Z" fill="${c}" fill-opacity=".8" stroke="#fff" stroke-opacity=".45" stroke-width=".5"/>
    <path d="M${tx - 14} ${cy + 1}C${tx - 14} ${cy - 5} ${tx - 7} ${cy - 8} ${tx} ${cy - 8}C${tx + 7} ${cy - 8} ${tx + 14} ${cy - 5} ${tx + 14} ${cy + 1}C${tx + 14} ${cy + 5} ${tx + 7} ${cy + 6.5} ${tx} ${cy + 6.5}C${tx - 7} ${cy + 6.5} ${tx - 14} ${cy + 5} ${tx - 14} ${cy + 1}Z" fill="#070203" stroke="${c}" stroke-width="1.8"/><!-- smooth hull, no line, no exhausts (23 NOV) --></g>`) +
      `<text x="${tx}" y="${cy + 68}" text-anchor="middle" class="md" fill="${c}">${lvl ? '0°' : (n < 0 ? 'L ' : 'R ') + Math.abs(Math.round(n)) + '°'}</text>` +
      (() => { /* CALLSIGN + SHIP MODEL above the turn strip (RAZ 23 NOV: "the ship name and callsign will be displayed above the nose turn rate indicator. let the user enter
         his callsign/ship name and actual name of ship perseus or m50"). window.TD_IDENT = { '<ship>': { cs, model }, _: { cs } }: his entry wins, model falls back to the live ship name */
        if (typeof window === 'undefined' || !window.TD_IDENT_SHOW) return ''; /* off until RAZ says yes to the picture (?ident=1 = preview) */ const ID = window.TD_IDENT || {}, sn = all && all.shipName ? String(all.shipName) : '', e = ID[sn || '_'] || {}, cs = (e.cs || (ID._ && ID._.cs) || '').trim(),
          md = (e.model || sn.replace(/_/g, ' ')).trim().toUpperCase(), esc = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
        if (!cs && !md) return '';
        return `${cs ? `<text x="${tx}" y="${yb - 30}" text-anchor="middle" style="font:800 13px Oxanium,Segoe UI,sans-serif;letter-spacing:3px;fill:#fff"${fitText(cs.toUpperCase(), 13, 190, 3)}>${esc(cs.toUpperCase())}</text>` : ''}`
          + `${md ? `<text x="${tx}" y="${yb - (cs ? 17 : 22)}" text-anchor="middle" style="font:700 9px Oxanium,Segoe UI,sans-serif;letter-spacing:2.5px;fill:${NEU};opacity:.85"${fitText(md, 9, 190, 2.5)}>${esc(md)}</text>` : ''}`; })() +
      `<text x="${tx}" y="${yb + 36}" text-anchor="middle" class="md" fill="${tcol}">${dir < 0 ? '◄ ' : ''}${(Math.round(rate * 10) / 10).toFixed(1)}°/s${dir > 0 ? ' ►' : ''}</text>`; }
  } else if (style === 'coord') { // turn coordinator: small wings that tilt; L / R marks = standard rate (3°/s)
    const cy = 42, a = Math.max(-30, Math.min(30, turn / 3 * 20)) * Math.PI / 180, w = 46;
    turnG = [-1, 1].map(d => { const m = d * 20 * Math.PI / 180; return `<line x1="${tx + 58 * Math.cos(m) * d}" y1="${cy + 58 * Math.sin(m)}" x2="${tx + 70 * Math.cos(m) * d}" y2="${cy + 70 * Math.sin(m)}" stroke="${NEU}" stroke-width="3"/><text x="${tx + d * 86}" y="${cy + 30}" text-anchor="middle" class="dl">${d < 0 ? 'L' : 'R'}</text>`; }).join('') +
      `<line x1="${tx - 70}" y1="${cy}" x2="${tx - 58}" y2="${cy}" stroke="${DIM}" stroke-width="3"/><line x1="${tx + 58}" y1="${cy}" x2="${tx + 70}" y2="${cy}" stroke="${DIM}" stroke-width="3"/>` +
      `<g transform="rotate(${a * 180 / Math.PI} ${tx} ${cy})"><line x1="${tx - w}" y1="${cy}" x2="${tx + w}" y2="${cy}" stroke="${dir ? DIRC(GRN) : NEU}" stroke-width="5" stroke-linecap="round"/><circle cx="${tx}" cy="${cy}" r="7" fill="${dir ? DIRC(GRN) : NEU}"/><line x1="${tx}" y1="${cy - 7}" x2="${tx}" y2="${cy - 16}" stroke="${dir ? DIRC(GRN) : NEU}" stroke-width="4"/></g>`;
  } else { // chevrons beside the nose: 1 / 2 / 3 lit = slow / standard / fast turn
    const n = !dir ? 0 : rate < 1.5 ? 1 : rate < 3.5 ? 2 : 3;
    turnG = [-1, 1].map(d => [0, 1, 2].map(i => { const on = dir === d && i < n, x = tx + d * (34 + i * 16), y = ny + 6;
      return `<path d="M${x - d * 6} ${y - 11}l${d * 10} 11l${-d * 10} 11" fill="none" stroke="${on ? DIRC(GRN) : DIM}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" ${on ? `` : ''}/>`; }).join('')).join('');
  }
  // --- right end: speed change chevrons (top) and climb / descend arrow (bottom) ---
  const cx0 = 0, cy0 = 0;
  const chev = Math.abs(accel) <= 0.5 ? `<rect x="${cx0 - 18}" y="${cy0 - 4}" width="36" height="8" rx="4" fill="${DIM}"/>` :
    [-13, 9].map(o => { const d = accel > 0 ? 1 : -1, c = DIRC(accel > 0 ? GRN : AMB); return head(cx0 + o + d * 13, cy0, d > 0 ? 0 : 180, 22, 15, c); }).join('');
  const vx = 0, vy = 0, u = vs > 0.5 ? -1 : vs < -0.5 ? 1 : 0, vc = DIRC(vs > 0 ? GRN : AMB);
  const vert = !u ? `<rect x="${vx - 18}" y="${vy - 4}" width="36" height="8" rx="4" fill="${DIM}"/>` :
    `<rect x="${vx - 4}" y="${Math.min(vy - u * 2, vy - u * 20)}" width="8" height="18" rx="2" fill="${vc}" opacity=".85"/>` + head(vx, vy + u * 20, u < 0 ? -90 : 90, 22, 15, vc);
  // --- outline (RAZ: "change the pill outline design ... different shape"): rounded slab with a notch on top, red holo deck build:
  // double neon rim, hex mesh, scan lines, edge tabs. Body coordinates = the old 1000 x 250 frame moved down 36.
  const OY = 54, HH = window.TD_TABLET ? (all && all.comps && all.comps.length > 6 ? 716 : 670) : 308; /* tablet one page: the pill runs the full tablet height */
  const shape = i => { const x0 = 3 + i, x1 = W - 3 - i, yT = 4 + i, yB = HH - 3 - i, r = 44 - i;
    return `M${x0 + r} ${yT}H${x1 - r}A${r} ${r} 0 0 1 ${x1} ${yT + r}V${yB - r}A${r} ${r} 0 0 1 ${x1 - r} ${yB}H${x0 + r}A${r} ${r} 0 0 1 ${x0} ${yB - r}V${yT + r}A${r} ${r} 0 0 1 ${x0 + r} ${yT}Z`; };
  // techy divider (RAZ: "replace with something more techy the dividing lines or remove them"): dotted column, end caps, centre diamond
  const div = x => ecl(x, 125, 6); // divider = clan symbol only, no dotted line (RAZ 23 NOV)
  const tab = (x, y) => [-3.5, 0, 3.5].map(o => `<circle cx="${x + o}" cy="${y}" r=".62" fill="#ff6a7a" opacity=".85"/>`).join(''); // 3 small dots like the deck frames (was 3 white dashes)
  // notch (RAZ: "do both as you recommended"): ACCEL chevrons (speed change) | THR STICK bar -100..+100 (his Cyro thumbstick, read by chat 8's bridge;
  // in sticky / cruise mode the stick springs back to centre, so it reads 0 while the throttle setting stays) | V/S arrow
  const T0 = 500, TW = 52, tp = thr == null ? null : Math.max(-100, Math.min(100, +thr)), tc = DIRC(tp == null ? NEU : Math.abs(tp) < 1 ? BLU : tp > 0 ? GRN : AMB), /* centre = blue (neutral), forward green, reverse amber (RAZ 23 NOV) */ txe = tp == null ? T0 : T0 + tp / 100 * TW;
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
  const key = (x, w, label, on, c) => { const st = c || (on ? ONC() : '#ff1f3d'), lit = on || !!c;
    const ln = String(label).split(' '), two = ln.length === 2, fs = two ? 8.2 : 9.6; /* 24 NOV: CPLD / SPEED LIMITER readable (his words: "i cant read cpld and speed limiter") */
    return deckFrame(x, 15, w, 28, st, lit) + ln.map((t, i) => `<text x="${x + w / 2}" y="${two ? 27 + i * 9 : 33.4}" text-anchor="middle"${fitText(t, fs, w - 10, 1)} style="font:800 ${fs}px Oxanium,Segoe UI,sans-serif;letter-spacing:1px;fill:#fff;opacity:${lit ? 1 : .8}${lit ? `;filter:drop-shadow(0 0 1.2px ${st})` : ''}">${t}</text>`).join(''); }; /* lit words white-hot with a tight glow, never the key's own color (they vanished on the lit key) */
  const M = modes || {}, cp = M.coupled == null ? null : !!M.coupled;
  const ms = mouse == null ? null : String(mouse).toUpperCase();
  const leftKeys = key(30, 44, 'CPLD', cp != null, cp === false ? AMB : null) + key(80, 56, 'CRUISE', !!M.cruise) + `<g data-key="spdlim:${M.spdlim ? 1 : 0}" style="cursor:pointer">${key(142, 56, 'SPEED LIMITER', !!M.spdlim)}</g>` + (typeof window !== 'undefined' && window.TD_TABLET ? `${actBtn(206, 15, 46, 28, 'REFRESH', '#1e90ff', 'refresh')}${actBtn(256, 15, 46, 28, all && all.fs ? 'EXIT|FULL' : 'FULL|SCREEN', '#1e90ff', 'fs')}` : '') /* small REFRESH / FULL SCREEN keys next to SPEED LIMITER (23 NOV) */; /* narrower 23 NOV (was 58 / 74 / 82) */ // VJOY / REL key removed (RAZ: "get rid of the vjoy rel tab button ... this is only telemetry")
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
  const notch = `${leftKeys}${gG}<g transform="translate(14 10)"><text x="438" y="25" text-anchor="middle" class="dl" style="font-size:9px">${accel < -0.5 ? 'DECEL' : 'ACCEL'}</text><!-- DECEL while slowing --><g transform="translate(472 20) scale(.62) rotate(-90)">${chev}</g><!-- up = speeding up, down = slowing; next to the VSI arrow (23 NOV: "accel and decel should also be upwards and downwards but closer to the vsi arrow") -->
   <!-- THR moved to a vertical bar (23 NOV) -->
   <g transform="translate(504 20) scale(.62)">${vert}</g><text x="536" y="25" text-anchor="middle" class="dl" style="font-size:9px">VSI</text><!-- ACCEL + VSI centred on the page (23 NOV) --></g>`; /* VSI = vertical speed indicator (RAZ 23 NOV: "its a v/s/i vertical sincrate indicator") */
  // NO BLOOM ON INDICATORS (RAZ in chat 8: "remove the bloom from the indicators on the flight travel page"): glow halos removed from arrows, bars,
  // cells, lamps, gear, ship, nose line; key rims, the pill rim and the missile ring keep theirs.
  // HOLOGRAM GLASS (RAZ 23 NOV: "make it look like it's an actual holographic display ... make it 2.5 almost 3D", layout kept):
  // see-through glass slab with a thick lit edge, tilted back in perspective; symbology drawn as light: a projected shadow layer
  // below the glass, red / cyan color fringe, glow, glass sheen and scan lines on top.
  // 4K workover (RAZ via chat 8: "give the travel dial another 4k workover"): the hologram filter only makes the soft light
  // (shadow under the glass, color fringe, glow); the symbology itself is drawn again on top WITHOUT a filter, so it stays razor sharp
  // even with the 3D tilt (Chrome renders filtered content soft inside a 3D-transformed layer).
  /* TABLET ONE PAGE (chat 2, 23 NOV). RAZ: "only one pill per page and rebuild it so we use one page for everything ... add additional buttons to it
     not those huge buttons ... the top left cpld button? that's how big all buttons on the page should be and text fields".
     window.TD_TABLET = true: the same pill grows to the tablet height (HH 712) and every key / field below the instruments is CPLD size (h 28-30, 9 px words).
     Values come in as 'all' (the tablet page maps the live snapshot; NO DATA when the game does not send it). Keys with data-go open the detail pages. */
  const tabletPanel = A => { if (!A) return ''; const R = '#ff1f3d', B = '#1e90ff';
    /* long words get a slightly smaller font instead of squeezed letters (23 NOV: "the font of newdawn and the rest of the buttons") */
    const TXT = c => window.TD_FINISH === 'shiny' ? '#ffffff' /* GLASS: white words on the strong color */ : (({ '#1e90ff': '#a6d4ff', '#ff1f3d': '#ff7f8f' })[c] || c); /* brighter words on the solid tones */
    const FF = (t, fs, room, ls) => { const est = String(t).length * (fs * .7 + (ls || 0)); return est > room ? Math.max(5.6, +(fs * room / est).toFixed(2)) : fs; };
    const hd = (x, y, t) => `<text x="${x}" y="${y}" class="dl" style="font-size:8.5px;letter-spacing:2px;fill:#ff8f9b">${t}</text><circle cx="${x + String(t).length * 7.1 + 6}" cy="${y - 3}" r="1.6" fill="#ff6a7a"/>`;
    const KH = 38, VH = 42; /* bigger keys 23 NOV (was 28 / 30): "just a bit too small. there's room" */
    const k1 = (x, y, w, lab, c, lit, go, ky) => { const ln = String(lab).split('|'), two = ln.length === 2, fs = two ? 8.8 : (String(lab).length > 6 && w < 70 ? 9.4 : 10.6);
      return `<g${go != null ? ` data-go="${go}" style="cursor:pointer"` : ''}${ky ? ` data-key="${ky}" style="cursor:pointer"` : ''}>${deckFrame(x, y, w, KH, c || R, lit)}${ln.map((t, i) => `<text x="${x + w / 2}" y="${two ? y + 16.5 + i * 10.5 : y + KH / 2 + 3.8}" text-anchor="middle" style="font:800 ${FF(t, fs, w - 16, .5)}px Oxanium,Segoe UI,sans-serif;letter-spacing:.5px;fill:${lit ? TXT(c || R) : '#fff'};opacity:${lit ? 1 : .88}">${t}</text>`).join('')}</g>`; };
    const kv = (x, y, w, lab, val, c, lit, ky, fsL, fsV) => { const v = val == null ? 'NO DATA' : String(val);
      return `<g${ky ? ` data-key="${ky}" style="cursor:pointer"` : ''}>${deckFrame(x, y, w, VH, c || R, lit)}<text x="${x + w / 2}" y="${y + 15}" text-anchor="middle" style="font:700 ${fsL || FF(lab, 9.4, w - 12, .8)}px Oxanium,Segoe UI,sans-serif;letter-spacing:.8px;fill:#ffe6e9;opacity:1">${lab}</text>
       <text x="${x + w / 2}" y="${y + VH - 10}" text-anchor="middle" style="font:800 ${fsV || FF(v, val == null ? 8.2 : 11.6, w - 12, .6)}px Oxanium,Segoe UI,sans-serif;letter-spacing:.6px;fill:${lit ? TXT(c || R) : '#fff'};opacity:${lit || val == null ? 1 : .88}">${v}</text></g>`; };
    const annC = v => { v = String(v || ''); return /MAJOR/.test(v) ? [R, true] : /MINOR/.test(v) ? [AMB, true] : (!v || /OFF|UNSPEC/.test(v)) ? [R, false] : [GRN, true]; };
    const onOff = (b, onC) => b == null ? [R, false] : b ? [onC || ONC(), true] : [R, false]; /* ON = state: lit blue in preset 12 */
    let g = '', X0 = 30, P = 72; // P = key pitch (w 66 + 6)
    // ---- band 1: SHIP | FUEL + COUNTERMEASURES | WARNING
    let y = 326, SP = 82; g += hd(X0, y - 10, 'SHIP'); /* 9 ship keys (23 NOV: lamp + light amplification added) */
    const gc = A.gear === 'DOWN' ? [ONC(), true] : A.gear === 'MOVING' ? [MVC(), true] : [R, false];
    g += kv(X0, y, 76, 'GEAR', A.gear, ...gc, 'gear'); /* data-key = pressable: the tablet page sends his keybind (keys wired 23 NOV) */
    g += kv(X0 + SP, y, 76, 'DOORS', A.doors, ...(A.doors == null ? [R, false] : A.doors === 'OPEN' ? [RSIT() ? AMB : R, true] : [ONC(), true]), 'doors');
    g += kv(X0 + 2 * SP, y, 76, 'DOOR LOCK', A.locked == null ? null : A.locked ? 'LOCKED' : 'UNLOCKED', ...(A.locked == null ? [R, false] : A.locked ? [ONC(), true] : [RSIT() ? AMB : R, true]), 'doorlock');
    g += kv(X0 + 3 * SP, y, 76, 'LIGHTS', A.lights == null ? null : A.lights ? 'ON' : 'OFF', ...onOff(A.lights), 'lights');
    g += kv(X0 + 4 * SP, y, 76, 'GIMBALS', A.gimb == null ? null : A.gimb ? 'LOCKED' : 'FREE', ...onOff(A.gimb), 'gimb');
    /* CONFIG + VTOL (RAZ 23 NOV: "yes add the config and vtol keys"): game flight state 'transformation' (expand / fold, e.g. Corsair wings, Hull C) and 'vtol',
       same 4 states as the gear. Not yet seen live (chat 8 field list): NO DATA until a ship sends them. */
    const mv = (v, on, off) => v === 'DEPLOYED' ? [on, ONC(), true] : v === 'DEPLOYING' || v === 'RETRACTING' ? ['MOVING', MVC(), true] : v === 'RETRACTED' ? [off, R, false] : [null, R, false];
    { const [t, c, l] = mv(A.config, 'OUT', 'IN'); g += kv(X0 + 5 * SP, y, 76, 'CONFIG', t, c, l); }
    { const [t, c, l] = mv(A.vtol, 'ON', 'OFF'); g += kv(X0 + 6 * SP, y, 76, 'VTOL', t, c, l, 'vtol'); }
    /* LIGHT AMP = the game's light amplification (see in the dark), flight setting flight_light_amplification; 23 NOV: "lamp on off as well. the see in the dark help" */
    g += kv(X0 + 7 * SP, y, 76, 'LAMP', A.lamp == null ? null : A.lamp ? 'ON' : 'OFF', ...onOff(A.lamp), 'lightamp');
    const X1 = 392, F0 = 690; g += hd(F0, y - 10, 'FUEL · COUNTERMEASURES');
    (A.fuel || [null, null]).forEach((p, i) => { g += kv(F0 + i * 70, y, 66, i ? 'QUANTUM' : 'HYDROGEN', p == null ? null : p + '%', p == null ? R : p < 20 ? R : p < 40 ? AMB : GRN, p != null); });
    ['DECOY', 'NOISE'].forEach((n, i) => { const c = A.cm ? A.cm[n] : null; g += kv(F0 + (2 + i) * 70, y, 66, n, c, c == null ? R : c === 0 ? R : c < 5 ? AMB : GRN, c != null); });
    const X2 = 690;
    // ---- band 2: POWER (9) | WARNING LIGHTS (10) | WEAPONS (8)
    y = 398; g += hd(X0, y - 10, 'POWER');
    [['POWER PLANTS', 'PWR|PLANTS'], ['ENGINES', 'ENGINES'], ['WEAPONS', 'WEAPONS'], ['COOLERS', 'COOLERS'], ['LIFE SUPPORT', 'LIFE|SUPPORT'], ['GRAVITY', 'GRAVITY'], ['SENSORS', 'SENSORS'], ['SHIELD GEN', 'SHIELD|GEN'], ['SHIELD EMIT', 'SHIELD|EMIT']]
      .forEach(([k, l], i) => { const v = A.power ? A.power[k] : null; g += k1(X0 + (i % 5) * P, y + Math.floor(i / 5) * 44, 66, l, v == null ? R : ONC(), !!v, null, ['POWER PLANTS', 'ENGINES', 'WEAPONS', 'SHIELD GEN', 'SHIELD EMIT'].includes(k) ? 'pwr:' + k : null); });
    /* CAUTION & WARNING - Apollo command module style (RAZ 23 NOV: "apollo command module but stylized better"): one bezel, a tight grid of
       engraved tiles that stay DARK while all is well and light up amber (caution) or red (warning); MASTER CAUTION / MASTER WARNING tile spans two cells.
       Game: vehicle.state.annunciators (MINOR_* amber, MAJOR_* red, *_FLASHING blinks). */
    g += hd(X1, y - 10, 'CAUTION & WARNING');
    /* CAUTION & WARNING - three looks to compare (23 NOV: "i dislike the caned corners that screams AI made it ... the caution warning in the center is still bad").
       window.TD_CW = 'a' glass annunciator grid | 'b' side-bar tiles | 'c' message list (modern jet style). No cut corners. Dark while all is well. */
    { const V = (typeof window !== 'undefined' && window.TD_CW) || 'b', /* his pick 23 NOV: side bar tiles, centred words, a light band on both sides */ BX = X1, BY = y - 2, BW = 282, BH = 86, f = n => n.toFixed(2);
      const AN = A.ann || {}, anyMaj = Object.values(AN).some(v => /MAJOR/.test(v)), anyMin = Object.values(AN).some(v => /MINOR/.test(v));
      const st = v => { v = String(v || ''); if (/MAJOR/.test(v)) return [R, true, 2]; if (/MINOR/.test(v)) return [AMB, true, 1]; return [null, false, 0]; }; /* tiles solid when on (23 NOV) */
      const LIST = [['HIT', 'HIT'], ['MISL', 'MISSILE'], ['PWR', 'POWER'], ['WPN', 'WEAPONS'], ['THR', 'THRUSTERS'], ['SHLD', 'SHIELDS'], ['COOL', 'COOLING'], ['QDRV', 'QUANTUM'], ['RADR', 'RADAR'], ['PROX', 'PROXIMITY']];
      const mst = anyMaj ? [R, blinkOn || !!window.TD_PULSE_ON] : anyMin ? [AMB, blinkOn || !!window.TD_PULSE_ON] : [null, false] /* master flashes until RESET is pressed (23 NOV) */, mlab = anyMaj ? 'MASTER WARNING' : 'MASTER CAUTION';
      const txt = (x, yy, t, fs, fill, anchor, room) => `<text x="${x}" y="${yy}" text-anchor="${anchor || 'middle'}" style="font:800 ${FF(t, fs, room || 999, .5)}px Oxanium,Segoe UI,sans-serif;letter-spacing:.5px;fill:${fill}">${t}</text>`;
      g += `<rect x="${BX}" y="${BY}" width="${BW}" height="${BH}" rx="3" fill="#070103" stroke="#ff2a45" stroke-opacity=".5" stroke-width=".9"/>`;
      if (V === 'c') { /* C - MESSAGE LIST: master bar on top, then only the active messages, warnings first (how modern jets show it) */
        const mh = 22; g += `<rect x="${BX + 4}" y="${BY + 4}" width="${BW - 8}" height="${mh}" rx="2" fill="${mst[1] ? mst[0] : '#0e1a10'}" stroke="${mst[1] ? '#fff' : '#1f6b35'}" stroke-opacity="${mst[1] ? .6 : .8}" stroke-width=".8"/>`
          + txt(BX + BW / 2, BY + 4 + mh / 2 + 3.6, mst[0] ? mlab : 'ALL SYSTEMS NORMAL', 10.4, mst[1] ? '#1a0306' : mst[0] ? '#ffd6db' : GRN);
        const act = LIST.map(([k, l]) => [l, st(AN[k.toLowerCase()])]).filter(x => x[1][2]).sort((a, b) => b[1][2] - a[1][2]);
        if (!act.length) g += txt(BX + BW / 2, BY + 4 + mh + 32, 'NO CAUTIONS', 9, '#6d5559');
        act.slice(0, 10).forEach(([l, [c, on]], i) => { const col = i % 2, row = Math.floor(i / 2), x = BX + 8 + col * (BW - 16) / 2, yy = BY + mh + 18 + row * 11.5;
          g += `<rect x="${x}" y="${yy - 7}" width="3" height="8" fill="${c}" opacity="${on ? 1 : .35}"/>` + txt(x + 8, yy, l, 9, c, 'start') .replace(`fill:${c}`, `fill:${c};opacity:${on ? 1 : .35}`); });
      } else { const pad = 4, gap = V === 'a' ? 1 : 3, rh = (BH - 2 * pad - 2 * gap) / 3, cw = (BW - 2 * pad - 3 * gap) / 4;
        const tile = (cx, cy, n, lab, sv) => { const x = BX + pad + cx * (cw + gap), yy = BY + pad + cy * (rh + gap), w = cw * n + gap * (n - 1), [c, on] = sv, ln = String(lab).split('|');
          if (V === 'a') /* A - GLASS ANNUNCIATOR: one glass plate divided into square cells; a lit cell fills with its color */
            return `<rect x="${x}" y="${yy}" width="${w}" height="${rh}" fill="${on ? c : '#110508'}"/>${on ? `<rect x="${x}" y="${yy}" width="${w}" height="${rh * .45}" fill="#fff" opacity=".16"/>` : ''}`
              + ln.map((t, k) => txt(x + w / 2, yy + rh / 2 + (ln.length === 2 ? (k ? 7.6 : -1.4) : 3.2), t, 8.4, on ? '#1a0306' : '#b9a3a7', 'middle', w - 8)).join('');
          /* B - SIDE BAR: dark tile with a color bar on the left edge; lit = bar + words in the color and a light wash */
          return `<rect x="${x}" y="${yy}" width="${w}" height="${rh}" rx="1.5" fill="#0d0507" stroke="${on ? c : '#3a1016'}" stroke-opacity="${on ? .8 : 1}" stroke-width=".7"/>${on ? `<rect x="${x}" y="${yy}" width="${w}" height="${rh}" rx="1.5" fill="${c}" opacity=".2"/>` : ''}${window.TD_FINISH === 'shiny' ? `<rect x="${x + .8}" y="${yy + .8}" width="${w - 1.6}" height="${rh * .45}" rx="1" fill="url(#tdglass)" opacity="${on ? 1 : .5}"/>` : ''}<rect x="${x + 1.5}" y="${yy + 2.5}" width="3" height="${rh - 5}" rx="1" fill="${on ? c : '#3a1016'}"/><rect x="${x + w - 4.5}" y="${yy + 2.5}" width="3" height="${rh - 5}" rx="1" fill="${on ? c : '#3a1016'}"/>`
            + ln.map((t, k) => txt(x + w / 2, yy + rh / 2 + (ln.length === 2 ? (k ? 7.6 : -1.4) : 3.2), t, 8.4, on ? (c === R ? '#ff8f9b' : c) : '#c9b3b7' /* off tile words lighter (23 NOV: "can't read some of the buttons") */, 'middle', w - 14)).join(''); };
        if (V === 'a') g += `<rect x="${BX + pad - 1}" y="${BY + pad - 1}" width="${BW - 2 * pad + 2}" height="${BH - 2 * pad + 2}" fill="#2a0c12"/>`; /* the 1 px gaps read as engraved lines */
        g += `<g data-go="mreset" style="cursor:pointer">` + tile(0, 0, 2, 'MASTER CAUTION|RESET', mst) + `</g>`; /* MASTER CAUTION RESET (23 NOV): tap = acknowledge every lit warning until it changes or comes back */
        LIST.forEach(([k, l], i) => { const p = i < 2 ? [2 + i, 0] : [(i - 2) % 4, 1 + Math.floor((i - 2) / 4)]; g += tile(p[0], p[1], 1, l, st(AN[k.toLowerCase()])); }); } }
    g += hd(X2, y - 10, 'WEAPONS');
    for (let i = 0; i < 8; i++) { const w = A.wpn ? A.wpn[i] : undefined, [t, c, lit] = A.wpn == null ? [null, R, false] : !w ? ['EMPTY', R, false] : !w.is_powered ? ['NO POWER', R, true] : w.ready_to_fire ? ['READY', GRN, true] : ['CHARGING', MVC(), true];
      g += kv(X2 + (i % 4) * 70, y + Math.floor(i / 4) * 44, 66, 'WPN ' + (i + 1), t, c, lit); }
    // ---- band 3: SERVER | YOUR PC | PAGES
    y = 510; g += hd(X0, y - 10, 'SERVER');
    g += kv(X0, y, 96, 'CONNECTED FOR', A.conn, B, A.conn != null);
    g += kv(X0 + 102, y, 96, 'SERVER CHANGES', A.changes, B, A.changes != null);
    g += kv(X0 + 204, y, 96, 'STATE', A.sstate ? String(A.sstate).toUpperCase() : null, B, !!A.sstate);
    g += hd(X1, y - 10, 'YOUR PC');
    const pcC = v => v == null ? [R, false] : v >= 90 ? [R, true] : v >= 75 ? [AMB, true] : [RSIT() ? ONC() : GRN, true];
    const pc = A.pc || {};
    g += kv(X1, y, 66, 'CPU', pc.cpu == null ? null : Math.round(pc.cpu) + '%', ...pcC(pc.cpu));
    g += kv(X1 + P, y, 66, 'GPU', pc.gpu == null ? null : Math.round(pc.gpu) + '%', ...pcC(pc.gpu));
    g += kv(X1 + 2 * P, y, 66, 'MEMORY', pc.ram == null ? null : Math.round(pc.ram) + '%', ...pcC(pc.ram));
    g += kv(X1 + 3 * P, y, 66, 'GAME FPS', pc.fps == null ? (pc.fpsNote || null) : Math.round(pc.fps), pc.fps == null ? R : B, pc.fps != null);
    g += hd(X2, y - 10, 'PAGES');
    g += actBtn(X2, y + 2, 52, 36, 'SHIP|STATUS', B, 1) + actBtn(X2 + 56, y + 2, 52, 36, 'SERVER|STATUS', B, 2) + actBtn(X2 + 112, y + 2, 52, 36, 'COLORS', B, 'col') + actBtn(X2 + 168, y + 2, 52, 36, A.fs ? 'EXIT|FULL' : 'FULL|SCREEN', B, 'fs') + actBtn(X2 + 224, y + 2, 52, 36, A.paired ? 'PAIRED' : 'PAIR|iPAD', A.paired ? GRN : AMB, 'pair'); /* action buttons (raised) */ /* PAIR key always in the pill (23 NOV: "we are not entering addresses over and over with a touch keyboard") */
    if (A.src) g += `<text x="${X2 + 276}" y="${y - 10}" text-anchor="end" class="dl" style="font-size:8px;letter-spacing:1.5px;fill:${A.src === 'LIVE GAME DATA' ? GRN : AMB}">${A.src}</text>`; /* data source inside the pill (no top bar in full screen) */
    // ---- band 4: COMPONENTS of the ship you sit in (stock loadout)
    y = 582; g += hd(X0, y - 10, 'COMPONENTS' + (A.shipName ? '  ·  ' + String(A.shipName).toUpperCase() + ' STOCK' : ''));
    const CL = A.comps || []; if (!CL.length) g += `<text x="${X0}" y="${y + 18}" class="dl" style="font-size:8px;opacity:.7">NO SHIP DATA</text>`;
    const NC = CL.length > 6 ? Math.ceil(Math.min(CL.length, 24) / 2) : Math.max(CL.length, 1), CP = Math.min(130, 940 / NC), CX0 = X0 + (940 - (NC * CP - 5)) / 2; /* normal-size keys, centred, not stretched across the pill (24 NOV: "no need to use the entire space for all buttons by stretching them out too wide") */ /* 2 rows: names stay readable */
    /* one size for every component name and one for every label (23 NOV: "the font for the components still looks bad on iPad") */
    const labOf = c => c.lab + (c.grade ? '  ·  GRADE ' + c.grade : ''), cFsL = Math.min(9.2, ...CL.map(c => FF(labOf(c), 9.2, CP - 17, .8))), cFsV = Math.min(11, ...CL.map(c => FF(c.item || 'STOCK', 11, CP - 17, .6))); CL.slice(0, 24).forEach((c, i) => { const v = c.grp && A.power ? A.power[c.grp] : null; g += kv(CX0 + (i % NC) * CP, y + Math.floor(i / NC) * 46, CP - 5, labOf(c), c.item || 'STOCK', c.grp ? (v ? ONC() : R) : B, c.grp ? !!v : true, null, cFsL, cFsV); });
    return g; };
  const content = `${notch}
 <g transform="translate(0 ${OY})">
 
 ${ticks}
 ${ring ? ring360(sx, sy, RR, ring) : ''}<!-- 360 travel ring, iPad page only (24 NOV, his pick 1) -->
  ${vsi}${shipRot.replace('style="filter:brightness(1.7)"', `style="filter:${shipFx}"`)}<!-- every pill: readout under the ship, the ship stays in front as it swings past (23 NOV) -->
 ${div(383)}${div(611)}
 ${style === 'trend' ? '' : `<image href="data:image/png;base64,${top64}" x="${tx - 58}" y="${ty - 30}" width="116" height="60" transform="rotate(90 ${tx} ${ty})" style="filter:brightness(1.7)"/>`}
 ${turnG}${fan}
 </g>`;
  const hid = 'td' + (++UID), TABG = window.TD_TABLET ? tabletPanel(all) : '';
  /* TABLET CRISP (RAZ 23 NOV on the iPad: "washed out and fuzzy still"): no blurred holo copy under the readings, no glow shadows, no scan lines / sheen over the glass */
  const TB = !!window.TD_TABLET, crisp = t => TB ? t.replace(/font:800 /g, 'font:600 ').replace(/font:700 /g, 'font:500 ').replace(/font-weight:\s*800/g, 'font-weight:600').replace(/filter:\s*(?:drop-shadow\((?:[^()]|\([^()]*\))*\)\s*)+;?/g, '').replace(/filter:blur\([^)]*\);?/g, '').replace(/ filter="url\(#[^"]*\)"/g, '') : t;
  return themeSvg(`<svg viewBox="0 -4 ${W} ${HH + 14}" class="tdial" xmlns="http://www.w3.org/2000/svg" style="${window.TD_TABLET ? '' : 'transform:perspective(var(--tdp,1500px)) rotateX(16deg);transform-origin:50% 70%;'}overflow:visible"><style>.tdial text{stroke:none}${window.TD_TABLET ? '.tdial{shape-rendering:crispEdges;text-rendering:optimizeLegibility}.tdial .dl,.tdial .md,.tdial .big{font-weight:500!important}.tdial path,.tdial circle,.tdial polygon{shape-rendering:geometricPrecision}' : '.tdial{shape-rendering:geometricPrecision;text-rendering:geometricPrecision}'}@font-face{font-family:Oxanium;src:url(Oxanium.ttf)}.tdial text{font-family:Oxanium,Segoe UI,sans-serif}.tdial .dl{fill:#ffd0d6;font-weight:700;font-size:13px;letter-spacing:1.5px}.tdial .big{font-weight:700;font-size:24px}.tdial .md{font-weight:700;font-size:16px;letter-spacing:.5px}</style>
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
  <linearGradient id="tdsweep" x1="0" y1="0" x2="1" y2=".35"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".38"/><stop offset=".58" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0"/><animateTransform attributeName="gradientTransform" type="translate" values="-1.2 0;1.2 0;1.2 0" keyTimes="0;.55;1" dur="4.5s" repeatCount="indefinite"/></linearGradient><!-- LIGHT SWEEP like the deck keys (23 NOV: "doesn't have the illusion of the shine") -->
  <radialGradient id="tdglassR" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></radialGradient><linearGradient id="tdglass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".5" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><!-- GLASS finish (23 NOV: "matte or shiny ... like glass") -->
  <radialGradient id="tdglow" cx=".5" cy="0" r=".9"><stop offset="0" stop-color="#ff1a38" stop-opacity=".025"/><stop offset="1" stop-color="#ff1a38" stop-opacity="0"/></radialGradient></defs>
 ${TB ? '' : `<path d="${shape(0)}" transform="translate(0 9)" fill="#1a050a" stroke="url(#${hid}edge)" stroke-width="2" opacity=".95" style="filter:drop-shadow(0 10px 14px rgba(0,0,0,.75))"/>`}
 ${TB ? '' : `<path d="${shape(0)}" transform="translate(0 4.5)" fill="#3a0c16" opacity=".85"/>`}
 <path d="${shape(0)}" fill="url(#tdbg)" fill-opacity=".97"/>
 ${TB ? '' : `<path d="${shape(0)}" fill="none" stroke="#ff2a45" stroke-width="1.56" style="filter:drop-shadow(0 0 1.2px #ff1a38) drop-shadow(0 0 3px rgba(255,59,78,.3))"/>`}<!-- no pill frame on the tablet (23 NOV: "remove the pill and the clan symbols from the tablet version only") --><!-- same line as the ship status frame, scaled (RAZ 23 NOV: "follow the very top ship status ... page ... make it all look like it") -->
 ${WO || window.TD_TABLET ? '' : `<path d="${shape(0)}" fill="url(#tdhex)"/>`}<path d="${shape(0)}" fill="url(#tdglow)"/>
 ${warnG}
 ${mslOn && mslPulse ? `<path d="${shape(0)}" fill="none" stroke="#e0233a" stroke-opacity=".8" stroke-width="5" style="filter:drop-shadow(0 0 5px rgba(255,31,61,.7)) drop-shadow(0 0 12px rgba(255,31,61,.4))"/><path d="${shape(5)}" fill="none" stroke="#ff1f3d" stroke-opacity=".55" stroke-width="3"/>` : ''}
 ${window.TD_EDGE_SYMBOLS === false ? '' : eclT(3, (HH + 1) / 2, 6, 2, 16, "#050102") + eclT(W - 3, (HH + 1) / 2, 6, 2, 16, "#050102")}<!-- centred on the pill height (RAZ 23 NOV: "the clan symbol icon isnt centered vertically") -->
 ${TB ? '' : `<g filter="url(#${hid}holo)">${content}${TABG}</g>`}
 ${TB ? '' : `<path d="${shape(0)}" fill="url(#tdscan)"/><path d="${shape(3)}" fill="url(#${hid}sheen)"/><path d="${shape(3)}" fill="url(#${hid}top)"/>`}${TB ? '' : `<path d="${shape(2.5)}" fill="none" stroke="url(#${hid}top)" stroke-width="1.5"/>`}
 ${crisp(content + TABG)}<!-- readings drawn ON TOP of the glass, scan lines and sheen, so the colors stay full strength (RAZ 23 NOV: "the colors are washed out ... looks like pastels not the good colors") -->
</svg>`);
}
window.travelDial8 = travelDial;
window.TD_THEMES = THEMES;
window.ring360 = ring360; /* 24 NOV: the Combat HUD draws the 360 travel ring as its own piece */
})();

