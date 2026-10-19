/*!
 * Rainwater Tank Card for Home Assistant
 * https://github.com/DeveloperMateusz/rainwater-tank-card
 * MIT License. Bundled font: Manrope (SIL Open Font License 1.1).
 */
const RTC_VERSION = '1.0.0';
const RTC_TAG = 'rainwater-tank-card';

/* ===================== TRANSLATIONS ===================== */
const I18N = {
  en: {
    title: 'Rainwater', tank: 'Rainwater tank', sensor: 'Sensor', level: 'Level', volume: 'In tank', measurements: 'Measurements',
    last_measurement: 'Last reading', last_empty: 'Last emptied', full_prediction: 'Full tank', temperature: 'Module temp.', signal: 'Signal', battery: 'Module battery',
    today: 'Today', free: (f, c, u) => `Free ${f}${u}\u00a0\u00a0of ${c}${u}`, animations: 'Animations',
    chart: span => `Level (${span})`, days: d => `${d} ${d === 1 ? 'day' : 'days'}`, hours: h => `${h} h`,
    loading: 'Loading…', no_data: 'No history data',
    now: 'just now', min_ago: m => `${m} min ago`, h_ago: h => `${h} h ago`,
    rssi: ['Excellent', 'Very good', 'Good', 'Fair', 'Weak', 'Very weak', 'No signal'],
    bat: { high: 'High', middle: 'Medium', low: 'Low' },
    ed: {
      title: 'Title', show_title: 'Show header', icon: 'Icon', icon_color: 'Icon colour', level_entity: 'Water level entity (%)', capacity: 'Tank capacity',
      height_entity: 'Water height entity (optional)', unit_system: 'Units', auto: 'Automatic (from Home Assistant)', metric: 'Metric (L, m)', imperial: 'Imperial (gal, ft)',
      sec_anim: 'Animation', weather_entity: 'Weather entity (rain animation)', rain_entity: 'Rain sensor (rain animation)', pump_entity: 'Pump entity (pump animation only)',
      sec_chart: 'Chart and highlight', show_chart: 'Show chart', chart_hours: 'Chart range (hours)', highlight_threshold: 'Highlight daily rise from (%)',
      sec_names: 'Labels', sec_meas: 'Measurements', entity: 'Entity', name: 'Name',
      n_title: 'Header', n_tank: 'Tank section', n_sensor: 'Sensor section', n_level: 'Level tile', n_volume: 'Volume tile', n_chart: 'Chart', n_measurements: 'Measurements section',
    },
  },
  pl: {
    title: 'Deszczówka', tank: 'Zbiornik na deszczówkę', sensor: 'Czujnik', level: 'Poziom', volume: 'W zbiorniku', measurements: 'Pomiary',
    last_measurement: 'Ostatni pomiar', last_empty: 'Wypompowanie', full_prediction: 'Pełny zbiornik', temperature: 'Temp. modułu', signal: 'Zasięg modułu', battery: 'Bateria modułu',
    today: 'Dziś', free: (f, c, u) => `Wolne ${f}${u}\u00a0\u00a0z ${c}${u}`, animations: 'Animacje',
    chart: span => `Poziom (${span})`, days: d => `${d} ${d === 1 ? 'dzień' : 'dni'}`, hours: h => `${h} h`,
    loading: 'Ładowanie…', no_data: 'Brak danych historii',
    now: 'przed chwilą', min_ago: m => `${m} min temu`, h_ago: h => `${h} h temu`,
    rssi: ['Doskonały', 'Bardzo dobry', 'Dobry', 'Dostateczny', 'Słaby', 'Bardzo słaby', 'Praktycznie brak'],
    bat: { high: 'Wysoki', middle: 'Średni', low: 'Niski' },
    ed: {
      title: 'Tytuł', show_title: 'Pokaż nagłówek', icon: 'Ikona', icon_color: 'Kolor ikony', level_entity: 'Encja poziomu wody (%)', capacity: 'Pojemność zbiornika',
      height_entity: 'Encja wysokości wody (opcjonalnie)', unit_system: 'Jednostki', auto: 'Automatycznie (z Home Assistant)', metric: 'Metryczne (L, m)', imperial: 'Imperialne (gal, ft)',
      sec_anim: 'Animacje', weather_entity: 'Encja pogody (animacja deszczu)', rain_entity: 'Czujnik deszczu (animacja deszczu)', pump_entity: 'Encja pompy (tylko animacja pompy)',
      sec_chart: 'Wykres i podświetlenie', show_chart: 'Pokaż wykres', chart_hours: 'Zakres wykresu (godziny)', highlight_threshold: 'Podświetl dzienny przyrost od (%)',
      sec_names: 'Nazwy', sec_meas: 'Pomiary', entity: 'Encja', name: 'Nazwa',
      n_title: 'Nagłówek', n_tank: 'Sekcja zbiornika', n_sensor: 'Sekcja czujnika', n_level: 'Kafelek poziomu', n_volume: 'Kafelek objętości', n_chart: 'Wykres', n_measurements: 'Sekcja pomiarów',
    },
  },
};
const langOf = hass => (String(hass?.locale?.language || hass?.language || 'en').toLowerCase().startsWith('pl') ? 'pl' : 'en');

/* ===================== CONSTANTS AND HELPERS ===================== */
const RAIN = ['rainy', 'pouring', 'lightning-rainy', 'snowy-rainy', 'hail'];
const MEAS_KEYS = ['last_measurement', 'last_empty', 'full_prediction', 'temperature', 'signal', 'battery'];
const MEAS_ICON = { last_measurement: 'mdi:clock-outline', last_empty: 'mdi:storage-tank-outline', full_prediction: 'mdi:storage-tank-outline', temperature: 'mdi:thermometer', signal: 'mdi:signal', battery: '' };
const NAME_KEYS = ['tank', 'sensor', 'level', 'volume', 'chart', 'measurements'];
const CHART_COLOR = '#d4a882';
const LEN_TO_M = { mm: .001, cm: .01, m: 1, in: .0254, ft: .3048 };
const okv = v => v !== undefined && v !== null && !['unknown', 'unavailable', ''].includes(v);
const pad = x => String(x).padStart(2, '0');
const mkEl = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const setTxt = (el, v) => { if (el.textContent !== v) el.textContent = v; };
const setIcon = (el, v) => { if (el.icon !== v) el.icon = v; };
const hhmm = t => { const x = new Date(t); return `${pad(x.getHours())}:${pad(x.getMinutes())}`; };
const dLabel = t => { const x = new Date(t); return `${pad(x.getDate())}.${pad(x.getMonth() + 1)} ${hhmm(x)}`; };
const zDM = t => { const x = new Date(t); return `${pad(x.getDate())}.${pad(x.getMonth() + 1)}`; };

/* number formatting with the HA language decimal separator, no thousands grouping (as on the original dashboard) */
const nfCache = new Map();
const fmtN = (lang, v, d = 1) => {
  if (v == null || isNaN(v)) return '–';
  const k = lang + d; let f = nfCache.get(k);
  if (!f) nfCache.set(k, f = new Intl.NumberFormat(lang, { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: false }));
  return f.format(v);
};

/* ===================== FONT (once per page, document level: @font-face does not work inside shadow roots) ===================== */
const FONT_NAME = 'RTC Manrope';
function injectFont() {
  if (document.getElementById('rtc-font')) return;
  const st = document.createElement('style'); st.id = 'rtc-font';
  st.textContent = `@font-face{font-family:'${FONT_NAME}';font-style:normal;font-display:swap;font-weight:200 800;src:url(data:font/woff2;base64,${FONT_LATIN_EXT}) format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:'${FONT_NAME}';font-style:normal;font-display:swap;font-weight:200 800;src:url(data:font/woff2;base64,${FONT_LATIN}) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}`;
  document.head.append(st);
}

/* ===================== STYLES (one shared stylesheet for all card instances) ===================== */
const RTC_CSS = `
:host{--tp:#0e0c0a;--tf:#0c0a09;--tb:#221d18;--tbo:#4a4134;--line:var(--tb);--line2:var(--tbo);--cu:#b87333;--cu2:#d4a882;--tx:#fff;--mut:rgba(255,255,255,.6);
  --rtc-font:'${FONT_NAME}',Manrope,system-ui,-apple-system,"Segoe UI",sans-serif;display:block}
*{box-sizing:border-box;margin:0;padding:0}
ha-card{background:var(--tp);border:1px solid var(--line);border-radius:26px;overflow:hidden;color:var(--tx);font-family:var(--rtc-font);-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent;box-shadow:none}
header{display:flex;align-items:center;gap:10px;padding:16px 16px 8px 20px}
header[hidden]{display:none}
header>ha-icon{--mdc-icon-size:24px;color:var(--ic,#7AEBDD);display:flex}
h3{font-size:1.1rem;font-weight:800;flex:1;text-transform:uppercase;letter-spacing:.03em;line-height:1.3}
.body{padding:0 14px 18px}
header[hidden]+.body{padding-top:4px}
.grp[hidden]{display:none}
.grp h4,.tkh{font-size:1rem;color:#fff;font-weight:600;margin:22px 4px 10px;text-transform:uppercase;letter-spacing:.02em}
header:not([hidden])+.body>.grp:first-child h4{margin-top:10px}
.rows{display:grid;gap:8px}
.rows.g2{grid-template-columns:1fr 1fr}
/* ===== tank scene ===== */
.tank{display:block;width:100%;height:auto}
.tank text{font-family:var(--rtc-font);font-variant-numeric:tabular-nums}
.tank .ol{fill:#fff;stroke:#000;stroke-linejoin:round;paint-order:stroke fill}
.tank .tgl{cursor:pointer;outline:none}
.tank .tgl .tb{fill:#5a5650;transition:fill .2s}
.tank .tgl .tn{fill:#e8e6e1;transition:transform .2s}
.tank.force .tgl .tb{fill:#d4a882}
.tank.force .tgl .tn{fill:#fff;transform:translateX(13px)}
/* background: clouds, water on the roof */
.tank .drift{animation:tkdrift 80s ease-in-out infinite alternate}
@keyframes tkdrift{to{transform:translateX(-24px)}}
.tank .rw{fill:none;stroke-linecap:round;animation:tkrw var(--d) linear infinite}
@keyframes tkrw{to{stroke-dashoffset:-60}}
.tank .rs{transform-box:fill-box;transform-origin:center;animation:tkrs var(--d) ease-out infinite;opacity:0}
@keyframes tkrs{0%{transform:scale(.3);opacity:.7}50%,100%{transform:scale(1.5);opacity:0}}
.tank .rd{animation:tkrd var(--d) ease-in infinite;opacity:0}
@keyframes tkrd{0%{transform:translate(0,0) scale(.5);opacity:0}25%{transform:translate(0,0) scale(1);opacity:.9}100%{transform:translate(var(--dx),5.2px);opacity:0}}
/* water in the tank and in the pipe */
.tank .wa{animation:tkwa 5s linear infinite}
.tank .wb{animation:tkwa 8s linear infinite reverse}
@keyframes tkwa{to{transform:translateX(-40px)}}
.tank .ca{animation:tkca 7s ease-in-out infinite alternate}
@keyframes tkca{to{transform:translateX(26px)}}
.tank .pa{animation:tkpa .55s linear infinite}
.tank .pb{animation:tkpa .85s linear infinite}
@keyframes tkpa{from{transform:translateX(-16px)}to{transform:none}}
.tank .va{animation:tkva .42s linear infinite}
.tank .vb{animation:tkva .66s linear infinite}
.tank .vc{animation:tkva .3s linear infinite}
@keyframes tkva{from{transform:translateY(-16px)}to{transform:none}}
.tank .sl{fill:none;stroke:#B5D4F4;stroke-linecap:round;stroke-dasharray:5 9;animation:tksl var(--d,.5s) linear infinite}
@keyframes tksl{to{stroke-dashoffset:-28}}
.tank .jf{transform-box:fill-box;transform-origin:center;animation:tkjf .38s ease-in-out infinite alternate}
@keyframes tkjf{from{transform:scale(.6);opacity:.25}to{transform:scale(1.15);opacity:.75}}
.tank .jt{transform-box:fill-box;transform-origin:0 0;animation:tkjt .42s ease-in-out infinite alternate}
.tank .jt2{transform-box:fill-box;transform-origin:0 0;animation:tkjt .31s ease-in-out infinite alternate-reverse}
@keyframes tkjt{to{transform:scale(1.045,1.01)}}
.tank .sk{animation:tksk .34s linear infinite}
.tank .sk2{animation:tksk .52s linear infinite}
@keyframes tksk{from{transform:translateY(-40px)}to{transform:none}}
.tank .gw{transform-box:fill-box;transform-origin:50% 100%;animation:tkgw .6s ease-in-out infinite alternate}
@keyframes tkgw{to{transform:scaleY(1.25)}}
/* rain: three planes of short streaks, wind, varying intensity, splashes */
.tank .rnA{animation:tkrn .95s linear infinite}
.tank .rnB{animation:tkrn .62s linear infinite}
.tank .rnC{animation:tkrn .4s linear infinite}
@keyframes tkrn{from{transform:translate(6px,-76px)}to{transform:none}}
.tank .gust{animation:tkgust 8s ease-in-out infinite alternate}
@keyframes tkgust{0%{transform:translateX(0)}30%{transform:translateX(-4px)}55%{transform:translateX(1px)}80%{transform:translateX(-2px)}100%{transform:translateX(-5px)}}
.tank .rf1{animation:tkrf 3.7s ease-in-out infinite alternate}
.tank .rf2{animation:tkrf 5.3s ease-in-out infinite alternate-reverse}
@keyframes tkrf{from{opacity:.65}to{opacity:1}}
.tank .gs{transform-box:fill-box;transform-origin:center;animation:tkgs .7s ease-out infinite;opacity:0}
@keyframes tkgs{0%{transform:scale(.2);opacity:.6}60%,100%{transform:scale(1.6);opacity:0}}
/* jet hitting the water surface */
.tank .fo{transform-box:fill-box;transform-origin:center;animation:tkfo .5s ease-in-out infinite alternate}
@keyframes tkfo{from{transform:scale(.7);opacity:.35}to{transform:scale(1.15);opacity:.8}}
.tank .rr{transform-box:fill-box;transform-origin:center;animation:tkrr 1.2s ease-out infinite;opacity:0}
@keyframes tkrr{0%{transform:scale(.4);opacity:.85}100%{transform:scale(2.6);opacity:0}}
.tank .sd{animation:tksd var(--d,.8s) infinite;opacity:0}
@keyframes tksd{0%{transform:translate(0,0);opacity:0;animation-timing-function:cubic-bezier(.2,.7,.4,1)}12%{opacity:1}45%{transform:translate(calc(var(--dx) * .55),var(--dy));animation-timing-function:cubic-bezier(.6,0,.9,.5)}100%{transform:translate(var(--dx),3px);opacity:0}}
.tank .ab{animation:tkab var(--d,1.2s) ease-out infinite;opacity:0}
@keyframes tkab{0%{transform:translate(0,0);opacity:0}12%{opacity:.85}55%{transform:translate(var(--dx),var(--dy))}100%{transform:translate(calc(var(--dx) * 1.4),calc(var(--dy) * .3));opacity:0}}
.tank .bb{animation:tkbb 4.2s ease-in infinite;opacity:0}
@keyframes tkbb{0%{transform:translateY(0);opacity:0}15%{opacity:.7}100%{transform:translateY(-58px);opacity:0}}
.tank .mp{animation:tkmp var(--d,7s) ease-in-out infinite alternate}
@keyframes tkmp{to{transform:translate(var(--mx),var(--my))}}
/* pump */
.tank .hb{animation:tkhb var(--d) linear infinite;opacity:0}
@keyframes tkhb{0%{transform:translate(0,0);opacity:0}8%{opacity:.95}92%{opacity:.95}100%{transform:translate(var(--tx,0px),var(--ty,0px));opacity:0}}
.tank .hc{stroke:#0C447C;transition:stroke .4s}
.tank.pump .hc{stroke:#378ADD}
.tank.pump .pjg{animation:tkpj .09s linear infinite}
@keyframes tkpj{0%,100%{transform:translate(0,0)}25%{transform:translate(.35px,-.2px)}75%{transform:translate(-.35px,.2px)}}
.tank .fl{animation:tkfl 2.6s ease-in-out infinite alternate}
@keyframes tkfl{to{transform:translateY(1.4px) rotate(4deg)}}
.tank .ip{animation:tkip 1s ease-in infinite;opacity:0}
@keyframes tkip{0%{transform:translate(0,0);opacity:0}25%{opacity:.85}100%{transform:translate(var(--dx),var(--dy));opacity:0}}
/* states: R = rain/inflow, J = jet (hidden when the inlet is submerged), P = pump */
.tank:not(.live) .R,.tank.sub .J,.tank:not(.pump) .P{display:none}
.tank:not(.live) .scn *{animation-play-state:paused}
.tank.pump .P,.tank.pump .P *,.tank.pump .pjg{animation-play-state:running}
/* surface waves, caustics and rising bubbles always move, regardless of toggle, rain and pump */
.tank:not(.live) .scn :is(.wa,.wb,.ca,.bb){animation-play-state:running}
.tank .tgl:focus-visible .tb{stroke:#fff;stroke-width:1.5}
/* own compositing layer + containment: per-frame scene updates do not invalidate the rest of the card/dashboard */
.tkw{contain:layout style}
svg.tank{isolation:isolate;contain:paint;will-change:transform}
/* paused when the card is off-screen or the browser tab is hidden */
.tank.off .scn *,.tank.off .pjg{animation-play-state:paused!important}
@media (prefers-reduced-motion:reduce){.tank:not(.force) .scn *,.tank:not(.force) .pjg{animation-play-state:paused!important}}
/* sensor tiles below the tank */
.tkt{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.tkc{display:flex;flex-direction:column;border-radius:14px;border:1px solid var(--tb);background:var(--tf);overflow:hidden;min-width:0;padding-bottom:12px;transition:border-color .2s}
.tkc.on{border-color:var(--tbo);background:radial-gradient(120% 140% at 0% 30%,rgba(181,163,138,.2),var(--tp) 70%)}
.tkc .hd{display:flex;align-items:center;gap:8px;padding:12px 12px 0}
.tkc .hd ha-icon{--mdc-icon-size:20px;color:var(--cu2);display:flex}
.tkc .hd b{font-size:.8rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tkc .vl{padding:6px 12px 0;font-size:1.6rem;font-weight:700;line-height:1.1;font-variant-numeric:tabular-nums}
.tkc .vl small{font-size:.9rem;font-weight:600;color:var(--mut);margin-left:1px}
.tkc .fs{padding:3px 12px 0;font-size:.72rem;font-weight:600;color:rgba(255,255,255,.62);font-variant-numeric:tabular-nums;transition:color .2s}
.tkc .fs.up{color:var(--cu2)}
.tkc em{display:block;font-style:normal;padding:1px 12px 0;font-size:.66rem;color:rgba(255,255,255,.45);font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tkc.vol .vl span{font-variant-numeric:proportional-nums;letter-spacing:-.02em}
.tkc[hidden]{display:none}
.tkt.one{grid-template-columns:1fr}
/* chart */
.chart{padding:12px 10px 10px;border-radius:18px;background:var(--tf);border:1px solid var(--line)}
.chart[hidden]{display:none}
.ch-h{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:2px 8px;margin:0 4px 4px}
.ch-h b{font-size:.82rem;font-weight:600}
.ch-h small{margin-left:auto;text-align:right;font-size:.7rem;color:var(--mut);font-variant-numeric:tabular-nums}
.chart svg{width:100%;height:auto;display:block;overflow:visible;touch-action:pan-y;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}
.chart .ax{fill:rgba(255,255,255,.5);font-size:8.5px;font-family:var(--rtc-font);font-variant-numeric:tabular-nums}
.chart .gl{stroke:rgba(255,255,255,.07);stroke-width:1}
.chart .axl{stroke:rgba(255,255,255,.25);stroke-width:1}
.chart .cl{stroke:rgba(255,255,255,.45);stroke-width:1;stroke-dasharray:3 3}
.zr{margin-left:6px;height:22px;padding:0 8px;border-radius:8px;font:inherit;font-size:.66rem;font-weight:700;background:rgba(255,255,255,.06);border:1px solid var(--line);color:var(--cu2);cursor:pointer}
.zr[hidden]{display:none}
/* measurement tiles */
.ft{position:relative;display:flex;flex-direction:column;justify-content:center;min-width:0;overflow:hidden;border-radius:14px;border:1px solid var(--tb);background:var(--tf);padding:12px;text-align:left;transition:border-color .2s}
.ft[hidden]{display:none}
.ft .hd{display:flex;align-items:center;gap:10px;min-width:0}
.ft .hd>ha-icon{--mdc-icon-size:22px;width:22px;height:22px;flex:none;display:flex;color:var(--cu2);transition:color .2s}
.ft .hd>span{flex:1;min-width:0}
.ft b{display:block;font-size:.8rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ft .tx{display:block;font-size:.7rem;font-weight:600;margin-top:2px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-variant-numeric:tabular-nums;transition:color .2s}
.ft em{display:block;font-style:normal;font-size:.66rem;color:rgba(255,255,255,.45);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-variant-numeric:tabular-nums}
.ft em:empty{display:none}
.ft.bad{border-color:rgba(244,67,54,.6);background:radial-gradient(120% 140% at 0% 50%,rgba(244,67,54,.2),var(--tp) 70%)}
.ft.bad .hd>ha-icon{color:#f44336}.ft.bad .tx{color:#ff6b61}
.ft.wr b,.ft.wr .tx{white-space:normal;line-height:1.25}
`;
let sharedSheet = null;
function applyStyles(root) {
  if (root.adoptedStyleSheets !== undefined && typeof CSSStyleSheet === 'function' && 'replaceSync' in CSSStyleSheet.prototype) {
    if (!sharedSheet) { sharedSheet = new CSSStyleSheet(); sharedSheet.replaceSync(RTC_CSS); }
    root.adoptedStyleSheets = [sharedSheet];
  } else root.append(mkEl('style', null, RTC_CSS));
}

/* ===================== TANK SCENE (SVG) ===================== */
/* Static parts of the scene are pre-rendered into a few <image> layers: the browser rasterises them once and
   only re-composites them per frame, instead of re-drawing ~1000 static shapes on every animation frame. */
function bakeStatic(markup) {
  try {
    const NS = 'http://www.w3.org/2000/svg', doc = new DOMParser().parseFromString(markup.replace('<svg ', `<svg xmlns="${NS}" `), 'image/svg+xml');
    const root = doc.documentElement; if (root.nodeName !== 'svg' || doc.querySelector('parsererror')) return markup;
    const defs = root.querySelector('defs'), inner = root.querySelector('g.scn > g');
    if (!defs || !inner) return markup;
    const defsXml = new XMLSerializer().serializeToString(defs);
    const isStatic = el => el.nodeType === 1 && !el.hasAttribute('class') && !el.querySelector('[class]');
    const flush = run => {
      if (!run.length) return;
      const body = run.map(el => new XMLSerializer().serializeToString(el)).join('');
      const img = doc.createElementNS(NS, 'image');
      const src = `<svg xmlns="${NS}" viewBox="-36 -66 396 290" width="396" height="290">${defsXml}${body}</svg>`;
      img.setAttribute('href', 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(src));
      img.setAttribute('x', '-36'); img.setAttribute('y', '-66'); img.setAttribute('width', '396'); img.setAttribute('height', '290');
      img.setAttribute('preserveAspectRatio', 'none');
      run[0].before(img); run.forEach(el => el.remove()); run.length = 0;
    };
    let run = [];
    for (const el of [...inner.childNodes]) {
      if (el.nodeType !== 1) { if (run.length && !el.textContent.trim()) { el.remove(); } continue; }
      if (isStatic(el)) run.push(el); else flush(run);
    }
    flush(run);
    return new XMLSerializer().serializeToString(root).replace(` xmlns="${NS}"`, '');
  } catch (e) { return markup; }
}

/* Scene SVG is built once per page (fixed seed = identical look every time), then only cloned. */
const TANK_VB = '-36 -26 396 290';
let tankSvgCache = null;
function tankSvg() {
  if (tankSvgCache) return tankSvgCache;
  let sd = 11; const r = () => (sd = sd * 16807 % 2147483647) / 2147483647, f = v => v.toFixed(1);
  const inTank = (x, y) => x > 66 && x < 294 && y > 36 && y < 214, inFnd = (x, y) => x < -12 && y < 96, inPipe = (x, y) => (x > -20 && x < 10 && y < 112) || (y > 86 && y < 112 && x < 96);
  let soil = '', fnd = '', plas = '', conc = '', grav = '', grass = '', gspl = '', part = '', sedi = '';
  for (let i = 0; i < 280; i++) { const x = -40 + r() * 404, y = 42 + r() * 186; if (inTank(x, y) || inFnd(x, y) || inPipe(x, y)) continue; soil += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(.5 + r() * 1.2)}" fill="${r() > .5 ? '#854F0B' : '#BA7517'}" opacity=".4"/>`; }
  for (let i = 0; i < 52; i++) { const x = -40 + r() * 404, y = 46 + r() * 180; if (inTank(x, y) || inFnd(x, y) || inPipe(x, y)) continue; const rx = 1.2 + r() * 2.6; soil += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(rx * (.55 + r() * .25))}" fill="${r() > .5 ? '#5F5E5A' : '#888780'}" opacity=".55" transform="rotate(${(r() * 40 - 20).toFixed(0)} ${f(x)} ${f(y)})"/>`; }
  for (let i = 0; i < 40; i++) { const x = -40 + r() * 30, y = 39 + r() * 54; if (x > -16 && y < 84) continue; fnd += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(.3 + r() * .8)}" fill="${r() > .5 ? '#444441' : '#888780'}"/>`; }
  for (let i = 0; i < 120; i++) { const x = -40 + r() * 24, y = -50 + r() * 72; if (y < x - 9 || (x < -23 && y > -17 && y < 21)) continue; plas += `<circle cx="${f(x)}" cy="${f(y)}" r="${(.2 + r() * .35).toFixed(2)}"/>`; }
  for (let i = 0; i < 120; i++) { const t = r() < .18, x = t ? 150 + r() * 60 : 70 + r() * 220, y = t ? 40 + r() * 32 : 72 + r() * 140; if (!t && x > 76 && x < 284 && y > 78 && y < 206) continue; conc += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(.3 + r() * .9)}" fill="${['#5F5E5A', '#B4B2A9', '#444441', '#D3D1C7'][Math.floor(r() * 4)]}" opacity=".6"/>`; }
  for (let i = 0; i < 34; i++) grav += `<circle cx="${f(-15.5 + r() * 27)}" cy="${f(35.3 + r() * 4.4)}" r="${f(.6 + r() * .8)}" fill="${['#888780', '#B4B2A9', '#5F5E5A', '#D3D1C7'][Math.floor(r() * 4)]}"/>`;
  const blade = (x, hh, l, w) => { const cx = x + l * .25, cy = 40 - hh * .55; return `M${f(x)} 40.4Q${f(cx)} ${f(cy)} ${f(x + l)} ${f(40 - hh)}Q${f(cx + w * .7)} ${f(cy + .4)} ${f(x + w)} 40.4Z`; };
  for (const L of [{ c: '#173404', st: .9, h: [2.5, 5], w: [1, 1.5] }, { c: '#27500A', st: 1, h: [3.5, 7.5], w: [.9, 1.4] }, { c: '#3B6D11', st: 1.2, h: [4.5, 9.5], w: [.8, 1.3] }, { c: '#639922', st: 1.7, h: [5, 11], w: [.7, 1.1] }, { c: '#97C459', st: 5, h: [6, 12], w: [.5, .8] }]) {
    let d = ''; for (let x = 12; x <= 366; x += L.st * (.6 + r() * .8)) { if (x > 141 && x < 219) continue; const hh = L.h[0] + r() * (L.h[1] - L.h[0]); d += blade(x, hh, (r() - .5) * hh * .8, L.w[0] + r() * (L.w[1] - L.w[0])); }
    grass += `<path d="${d}" fill="${L.c}"/>`;
  }
  /* rain: short, almost vertical streaks in three depth planes (2 paths of different brightness each) */
  const rainL = (n, l0, l1) => { let d = ''; for (let i = 0; i < n; i++) { const x = -50 + r() * 450, y = -90 + r() * 76, len = l0 + r() * (l1 - l0), sl = .06 + r() * .04, seg = (X, Y) => `M${f(X)} ${f(Y)}l${f(-len * sl)} ${f(len)}`; d += seg(x, y) + seg(x - 6, y + 76) + seg(x - 12, y + 152); } return d; };
  const rA1 = rainL(110, 2, 4), rA2 = rainL(70, 2, 4), rB1 = rainL(80, 3.5, 6), rB2 = rainL(55, 3.5, 6), rC1 = rainL(40, 5.5, 9), rC2 = rainL(28, 5.5, 9);
  for (let i = 0; i < 34; i++) { let x = -12 + r() * 370; if (x > 142 && x < 218) x += 80; gspl += `<ellipse class="gs" cx="${f(x)}" cy="${f(35.2 + r() * .8)}" rx="${f(1 + r() * 1.4)}" ry=".5" style="animation-delay:-${(r() * 1.2).toFixed(2)}s;animation-duration:${(.4 + r() * .6).toFixed(2)}s"/>`; }
  for (let i = 0; i < 14; i++) part += `<circle class="mp" cx="${f(84 + r() * 190)}" cy="${f(146 + r() * 48)}" r="${(.3 + r() * .4).toFixed(2)}" style="--mx:${f(r() * 8 - 4)}px;--my:${f(r() * 6 - 3)}px;--d:${f(5 + r() * 5)}s;animation-delay:-${f(r() * 5)}s"/>`;
  for (let i = 0; i < 22; i++) { const x = 80 + r() * 200; if (x > 228 && x < 254) continue; const rx = .8 + r() * 1.6; sedi += `<ellipse cx="${f(x)}" cy="${f(203 + r() * 2.5)}" rx="${f(rx)}" ry="${f(rx * .6)}" fill="${r() > .5 ? '#633806' : '#854F0B'}" opacity=".6"/>`; }
  /* water running down the roof into the gutter: broken rivulets, splashes, drips */
  const ryf = x => x - 18.2; let roofw = '';
  [[-.4, '#9cc6ec', .75, .45, '3 9 2 10 4 2', 1.15], [0, '#c9dff2', .5, .38, '2 10 3 8 1 6', .85], [-.8, '#9cc6ec', .55, .3, '5 7 2 9 1 6', 1.5]].forEach(([o, c, w, op, da, d]) => { roofw += `<path class="rw" d="M-110 ${f(ryf(-110) + o)} L-13.4 ${f(ryf(-13.4) + o)}" stroke="${c}" stroke-width="${w}" stroke-opacity="${op}" stroke-dasharray="${da}" style="--d:${d}s;animation-delay:-${(r() * d).toFixed(2)}s"/>`; });
  for (let i = 0; i < 8; i++) { const x = -36 + r() * 22, y = ryf(x) - .6; roofw += `<ellipse class="rs" cx="${f(x)}" cy="${f(y)}" rx="${f(.8 + r() * .8)}" ry=".35" fill="none" stroke="#c9dff2" stroke-width=".35" transform="rotate(45 ${f(x)} ${f(y)})" style="--d:${(.6 + r() * .8).toFixed(2)}s;animation-delay:-${(r() * 1.2).toFixed(2)}s"/>`; }
  for (let i = 0; i < 3; i++) roofw += `<ellipse class="rd" cx="${f(-13.4 + r() * .8)}" cy="${f(-30.6 + r() * .4)}" rx="${f(.4 + r() * .2)}" ry="${f(.6 + r() * .3)}" fill="#9cc6ec" style="--d:${(.65 + r() * .55).toFixed(2)}s;--dx:${f(1 + r())}px;animation-delay:-${(r()).toFixed(2)}s"/>`;
  /* background: copper dusk, drawn in 400x160 panel coordinates (horizon y=131), shifted by translate(-36 -95) */
  let bg = '', bgw = '', bcl = '';
  { let s2 = 41; const q = () => (s2 = s2 * 16807 % 2147483647) / 2147483647, B = 131;
    const P = d => { bg += `<path d="${d}"/>`; }, E = (cx, cy, rx, ry) => { bg += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}"/>`; }, RC = (x, y, w, h) => { bg += `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"/>`; }, win = (x, y) => { bgw += `<rect x="${f(x)}" y="${f(y)}" width="2.8" height="3.4" rx=".3"/>`; };
    [[60, 50, 10], [190, 42, 13], [320, 54, 11], [420, 46, 9]].forEach(([x, y, sz]) => { let lit = '', dk = ''; for (let k = 0; k < 4; k++) { const cx = x + (k - 1.5) * sz * .95, cy = y + q() * 3, rx = sz * (1 + q() * .5), ry = sz * .45; lit += `<ellipse cx="${f(cx)}" cy="${f(cy + 2)}" rx="${f(rx)}" ry="${f(ry)}"/>`; dk += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}"/>`; } bcl += `<g fill="#8a5230" opacity=".16">${lit}</g><g fill="#1a181b" opacity=".72">${dk}</g>`; });
    const spruce = (x, h, w) => { const n = 5 + Math.floor(q() * 2); let L = [], R = []; for (let i = 0; i < n; i++) { const y = B - 2 - i * (h - 3) / n, wi = w * (1 - i / n) * (.85 + q() * .3); L.push(`${f(x - wi / 2)} ${f(y)}`, `${f(x - wi * .18)} ${f(y - (h / n) * .55)}`); R.unshift(`${f(x + wi * .18)} ${f(y - (h / n) * .55)}`, `${f(x + wi / 2 + q() * .6)} ${f(y)}`); } P(`M${f(x - .7)} ${B} V${B - 2} L${L.join(' L')} L${f(x)} ${f(B - h)} L${R.join(' L')} L${f(x + .7)} ${B - 2} V${B}Z`); };
    const pine = (x, h) => { const lean = (q() - .5) * 3; P(`M${f(x - .8)} ${B} L${f(x + lean - .5)} ${f(B - h + 4)} L${f(x + lean + .5)} ${f(B - h + 4)} L${f(x + .8)} ${B}Z`); const cx = x + lean, cy = B - h + 3; for (let i = 0; i < 5; i++) E(cx + (q() - .5) * 10, cy - q() * 4, 3 + q() * 3.5, 1.6 + q() * 1.4); P(`M${f(cx)} ${f(cy + 2)} L${f(cx - 4 - q() * 2)} ${f(cy - 1)} L${f(cx - 3)} ${f(cy - .4)}Z`); };
    const oak = (x, rr) => { P(`M${f(x - 1.8)} ${B} L${f(x - 1.1)} ${f(B - rr * .9)} L${f(x - rr * .6)} ${f(B - rr * 1.3)} L${f(x - .4)} ${f(B - rr * 1.05)} L${f(x + rr * .5)} ${f(B - rr * 1.35)} L${f(x + 1.1)} ${f(B - rr * .9)} L${f(x + 1.8)} ${B}Z`); const cy = B - rr * 1.55; for (let i = 0; i < 12; i++) { const a = q() * Math.PI * 2, d = q(); E(x + Math.cos(a) * rr * 1.25 * d, cy + Math.sin(a) * rr * .6 * d, rr * (.35 + q() * .3), rr * (.3 + q() * .25)); } };
    const beech = (x, rr) => { P(`M${f(x - 1)} ${B} L${f(x - .6)} ${f(B - rr * 1.1)} L${f(x + .6)} ${f(B - rr * 1.1)} L${f(x + 1)} ${B}Z`); const cy = B - rr * 2; for (let i = 0; i < 8; i++) { const a = q() * Math.PI * 2, d = q(); E(x + Math.cos(a) * rr * .6 * d, cy + Math.sin(a) * rr * 1.05 * d, rr * (.4 + q() * .25), rr * (.45 + q() * .3)); } };
    const poplar = (x, h) => { RC(x - .6, B - 6, 1.2, 6); for (let i = 0; i < 6; i++) { const y = B - 5 - i * (h - 6) / 6; E(x + (q() - .5) * 1.2, y - (h / 12), 2.4 * (1 - i / 9) + q() * .6, (h / 12) * 1.4); } };
    const gable = (x, w, h, rh, o = {}) => { const top = B - h, ax = x + w * (o.ap ?? .5); P(`M${f(x)} ${B} V${f(top)} L${f(x - 1)} ${f(top)} L${f(ax)} ${f(top - rh)} L${f(x + w + 1)} ${f(top)} L${f(x + w)} ${f(top)} V${B}Z`); if (o.chim) { const cx = x + w * o.chim, t = (cx < ax ? (cx - x) / (ax - x) : (x + w - cx) / (x + w - ax)); RC(cx, top - rh * t - 4.5, 2.6, 6); } (o.w || []).forEach(([fx, fy]) => win(x + w * fx, top + fy)); };
    spruce(6, 22, 10); beech(22, 8); spruce(32, 16, 8);
    gable(44, 26, 12, 10, { chim: .72, w: [[.22, 3.5]] }); P('M70 131 V122 L82 119 V131Z');
    oak(98, 11); pine(114, 30);
    gable(128, 18, 9, 12, { ap: .38, w: [[.55, 3]] }); RC(131, 116, 4, 3.5);
    spruce(154, 26, 11); spruce(163, 18, 8); poplar(175, 30);
    gable(186, 34, 13, 10, { chim: .3, w: [[.2, 3.5], [.62, 4]] }); P('M203 108 L208 104 L213 108 V111 H203Z'); win(206.5, 106.5);
    P('M220 131 V123 L228 119.5 L236 123 V131Z');
    oak(252, 12); pine(270, 27); beech(283, 7);
    gable(296, 22, 11, 8, { chim: .6, w: [[.4, 3]] }); P('M318 131 V124 H327 V131Z');
    spruce(338, 24, 10); pine(352, 22); oak(372, 9); spruce(390, 19, 8); spruce(404, 21, 9); beech(418, 8);
  }
  const wv = (y, a) => `M36 ${y} q10 ${a} 20 0${' t20 0'.repeat(14)} V230 H36Z`, pw = (y, a) => `M-60 ${y} q4 ${a} 8 0${' t8 0'.repeat(22)} V106 H-60Z`;
  const vf = (wall, edge, a) => `M${wall} 14 H${edge} q${a} 4 0 8${' t0 8'.repeat(12)} H${wall}Z`;
  const vC = `M-8.6 14 q.9 4 0 8${' t0 8'.repeat(12)} H-7.4 q-.9 -4 0 -8${' t0 -8'.repeat(12)}Z`;
  const strk = (pat, w) => { let o = ''; for (let y = 58; y <= 210; y += 40) for (const [x, dy, hh] of pat) o += `<rect x="${x}" y="${f(y + dy)}" width="${w}" height="${hh}" rx="${w / 2}"/>`; return o; };
  const sk1 = strk([[102.4, 2, 9], [104.6, 13, 7], [103.3, 24, 11], [105.6, 33, 5], [101.8, 30, 6]], .9), sk2 = strk([[103.6, 6, 14], [101.9, 20, 10], [105.2, 27, 12]], 1.4);
  const HOSE = 'M243.5 161 V87 Q243.5 82.5 239 82.5 H204 Q199.5 82.5 199.5 78 V61 Q199.5 56 204.5 56 H440';
  const JET = 'M93.5 98.6 C99.5 98.6 103.6 101.8 105.3 107.6 C106.7 113 107 124 107 132 V206 H101.4 V132 C101.4 127 101.1 117.6 100.2 112.2 C99.2 107.4 97.2 105.2 93.5 105.2Z';
  const WB = 'M-12.5 38 H-12 V88 C-12 95 -10.6 99.3 -8.6 99.6 H-6.6 C-5 99.3 -4.2 97.6 -4.2 94 V38 H-3.5 V93 C-3.5 96.6 -1.4 99.3 2 99.6 H94 V105 H-7 Q-12.5 105 -12.5 99.5 Z';
  const BORE = 'M-12.5 38 H-3.5 V93 H94 V105 H-7 Q-12.5 105 -12.5 99.5 Z';
  const hb = (cx, cy, r0, v, d, del) => `<circle class="hb" cx="${cx}" cy="${cy}" r="${r0}" style="${v};--d:${d}s;animation-delay:${del}s"/>`;
  return tankSvgCache = bakeStatic(`<svg class="tank" viewBox="${TANK_VB}" preserveAspectRatio="xMidYMid meet">
<defs>
<linearGradient id="tkskyg" gradientUnits="userSpaceOnUse" x1="0" y1="-66" x2="0" y2="36"><stop offset="0" stop-color="#121317"/><stop offset=".35" stop-color="#1b191c"/><stop offset=".58" stop-color="#2a1f1b"/><stop offset=".74" stop-color="#44291c"/><stop offset=".88" stop-color="#6a3a20"/><stop offset="1" stop-color="#8a4b26"/></linearGradient>
<clipPath id="tkfrm"><rect x="-36" y="-26" width="396" height="290" rx="18"/></clipPath>
<clipPath id="tksky"><rect x="-60" y="-90" width="480" height="126"/></clipPath>
<clipPath id="tkcav"><rect x="76" y="78" width="208" height="128"/></clipPath>
<clipPath id="tkbore"><path d="${BORE}"/></clipPath>
<clipPath id="tkwbody"><path d="${WB}"/></clipPath>
<clipPath id="tkvwin"><rect x="-12.5" y="38" width="9" height="62"/></clipPath>
<clipPath id="tkjet"><path d="${JET}"/></clipPath>
<clipPath id="tkjc"><rect class="tk-jc" x="80" y="90" width="40" height="49"/></clipPath>
</defs>
<g class="scn" clip-path="url(#tkfrm)" aria-hidden="true"><g transform="translate(0 40)">
<rect x="-80" y="-120" width="520" height="162" fill="url(#tkskyg)"/>
<g transform="translate(-36 -95)"><g class="drift">${bcl}</g><path d="M-60 132 V121 Q10 114 90 119 T240 116 T390 120 T470 118 V132Z" fill="#0f0e10"/><g fill="#0c0b0c">${bg}</g><g fill="#f0b45a" opacity=".5">${bgw}</g></g>
<g class="R" clip-path="url(#tksky)"><g class="gust" fill="none" stroke="#b9c7d3" stroke-linecap="butt">
<g class="rf2"><g class="rnA"><path d="${rA1}" stroke-width=".35" stroke-opacity=".14"/><path d="${rA2}" stroke-width=".35" stroke-opacity=".22"/></g></g>
<g class="rf1"><g class="rnB"><path d="${rB1}" stroke-width=".45" stroke-opacity=".17"/><path d="${rB2}" stroke-width=".45" stroke-opacity=".26"/></g></g>
<g class="rnC"><path d="${rC1}" stroke-width=".55" stroke-opacity=".18"/><path d="${rC2}" stroke-width=".55" stroke-opacity=".28"/></g>
</g></g>
<rect x="-80" y="40" width="520" height="260" fill="#2a1d0e"/>${soil}
<rect x="-80" y="38" width="64" height="46" fill="#5F5E5A"/><rect x="-80" y="84" width="72" height="10" fill="#5F5E5A"/><g opacity=".55">${fnd}</g>
<line x1="-15.6" y1="28" x2="-15.6" y2="84" stroke="#141210" stroke-width="1.3"/>
<polygon points="-16,-27 -100,-111 -100,24 -16,24" fill="#ecebe7"/><rect x="-19" y="-30" width="3" height="54" fill="#dcd9d2"/><g fill="#d2cfc8" opacity=".6">${plas}</g>
<rect x="-41" y="-16" width="17" height="35" fill="#2C2C2A"/><rect x="-39.6" y="-14.6" width="14.2" height="32.2" fill="#1c2630"/>
<line x1="-39.6" y1="2" x2="-25.4" y2="2" stroke="#2C2C2A"/><polygon points="-39.6,-14.6 -35,-14.6 -39.6,-4" fill="#fff" opacity=".07"/><polygon points="-33,-14.6 -30.6,-14.6 -39.6,6 -39.6,1" fill="#fff" opacity=".05"/>
<rect x="-42" y="19" width="19" height="1.4" fill="#3f3d3a"/><rect x="-100" y="22" width="84.4" height="18" fill="#3a3836"/><line x1="-100" y1="22" x2="-15.6" y2="22" stroke="#2C2C2A" stroke-width=".8"/>
<polygon points="-13,-31 -100,-118 -100,-111 -16,-27" fill="#2C2C2A"/><line x1="-13" y1="-31" x2="-100" y2="-118" stroke="#5F5E5A" stroke-width=".7"/>
<g class="R">${roofw}</g>
<path d="M-8 -21.5 V33" stroke="#3f3d3a" stroke-width="7.6"/><path d="M-10.2 -21.5 V33" stroke="#8a8781" stroke-width="1.4" opacity=".75"/><path d="M-5.6 -21.5 V33" stroke="#1d1b19" stroke-width="1.1" opacity=".9"/>
<rect x="-12.6" y="-22" width="9.2" height="2.2" rx=".6" fill="#2C2C2A"/>
<path d="M-14.6 -29.4 C-14.6 -21 -12 -20.6 -8 -20.6 C-4 -20.6 -1.6 -22.6 -1.6 -27.6" fill="none" stroke="#1a1816" stroke-width=".9"/>
<path d="M-13.8 -27 A5.8 5.8 0 0 0 -2.2 -27" fill="#211f1c" stroke="#4a4846" stroke-width="1.6"/>
<path class="R gw" d="M-12.4 -23.4 A5.8 5.8 0 0 0 -3.6 -23.4 Z" fill="#378ADD" opacity=".85"/>
<line x1="-13.8" y1="-27" x2="-14.4" y2="-30" stroke="#4a4846" stroke-width="1.2"/><circle cx="-1.9" cy="-27.6" r="1.2" fill="#5F5E5A" stroke="#4a4846" stroke-width=".5"/>
<rect x="-16" y="7" width="13.4" height="2.2" rx=".5" fill="#1a1816"/><rect x="-16" y="24" width="13.4" height="2.2" rx=".5" fill="#1a1816"/>
<rect x="-16" y="35" width="28" height="5" fill="#888780" opacity=".5"/>${grav}
<rect x="12" y="36" width="428" height="4" fill="#27500A" opacity=".75"/>${grass}
<g class="R" fill="none" stroke="#b9c7d3" stroke-width=".5">${gspl}</g>
<rect x="-14.5" y="30.5" width="13" height="8" rx="1.4" fill="#2C2C2A"/><rect x="-14.5" y="30.5" width="13" height="1.4" rx=".6" fill="#5F5E5A"/>
<rect x="70" y="72" width="220" height="140" rx="4" fill="#8a8781"/><rect x="150" y="40" width="60" height="38" fill="#8a8781"/>
<g stroke="#5F5E5A" stroke-width=".6" opacity=".7"><line x1="70" y1="110" x2="76" y2="110"/><line x1="70" y1="150" x2="76" y2="150"/><line x1="284" y1="110" x2="290" y2="110"/><line x1="284" y1="150" x2="290" y2="150"/><line x1="70" y1="190" x2="76" y2="190"/><line x1="284" y1="190" x2="290" y2="190"/></g>${conc}
<path d="M156 42 H204 V78 H284 V206 H76 V78 H156Z" fill="#110f0c"/>
<path d="M235.5 164 C233.6 158 233 152 233 146 V86 Q233 84.6 231.4 84.6 H206 Q202.6 84.6 202.6 81 V62 Q202.6 59 205.6 59 H440" fill="none" stroke="#141210" stroke-width="1.4"/>
<path d="${HOSE}" fill="none" stroke="#1a1816" stroke-width="4.6" stroke-linejoin="round"/><path class="hc" d="${HOSE}" fill="none" stroke-width="2.2" stroke-linejoin="round" opacity=".9"/>
<g class="P" fill="#E6F1FB">${hb(243.5, 161, .6, '--ty:-73px', .7, 0)}${hb(243.5, 161, .45, '--ty:-73px', .7, .2)}${hb(243.5, 161, .55, '--ty:-73px', .7, .41)}${hb(243.5, 161, .4, '--ty:-73px', .7, .57)}${hb(204.5, 56, .6, '--tx:156px', 1.5, 0)}${hb(204.5, 56, .45, '--tx:156px', 1.5, .27)}${hb(204.5, 56, .55, '--tx:156px', 1.5, .6)}${hb(204.5, 56, .4, '--tx:156px', 1.5, .86)}${hb(204.5, 56, .5, '--tx:156px', 1.5, 1.15)}</g>
<g fill="#E6F1FB" opacity=".9"><rect x="241.6" y="104" width="4.4" height="1.2" rx=".4"/><rect x="241.6" y="132" width="4.4" height="1.2" rx=".4"/></g>
<rect x="202.6" y="52.6" width="3.2" height="8.6" rx=".8" fill="#444441"/><rect x="208.6" y="52.6" width="3.2" height="8.6" rx=".8" fill="#444441"/>
<rect x="237.6" y="78" width="4" height="2" rx=".5" fill="#5F5E5A"/>
<circle cx="239.6" cy="81.6" r="1.6" fill="none" stroke="#B4B2A9" stroke-width=".9"/><line x1="239.6" y1="83.2" x2="239.6" y2="160.8" stroke="#B4B2A9" stroke-width=".8"/>
<g clip-path="url(#tkcav)">
<g class="tk-wg">
<g class="wb"><path d="${wv(79.5, 1.8)}" fill="#378ADD" opacity=".3"/></g>
<g class="wa"><path d="${wv(78, -2)}" fill="#378ADD" opacity=".5" stroke="#B5D4F4" stroke-width="1.4"/></g>
<rect x="70" y="110" width="220" height="120" fill="#185FA5" opacity=".22"/><rect x="70" y="150" width="220" height="80" fill="#0C447C" opacity=".2"/>
<g class="ca" fill="#B5D4F4" opacity=".09"><ellipse cx="120" cy="86" rx="22" ry="2.2"/><ellipse cx="190" cy="89" rx="30" ry="2"/><ellipse cx="250" cy="85" rx="18" ry="1.8"/></g>
<g class="R J">
<g fill="#E6F1FB"><circle class="ab" cx="104" cy="83" r="1.3" style="--dx:-4px;--dy:15px;--d:1.1s"/><circle class="ab" cx="104" cy="83" r="1" style="--dx:3px;--dy:19px;--d:1.3s;animation-delay:.3s"/><circle class="ab" cx="104" cy="83" r=".8" style="--dx:-1px;--dy:23px;--d:1.4s;animation-delay:.6s"/><circle class="ab" cx="104" cy="83" r="1.1" style="--dx:6px;--dy:12px;--d:1s;animation-delay:.15s"/><circle class="ab" cx="104" cy="83" r=".9" style="--dx:-7px;--dy:10px;--d:1.2s;animation-delay:.8s"/><circle class="ab" cx="104" cy="83" r="1.4" style="--dx:1px;--dy:16px;--d:1.25s;animation-delay:.45s"/></g>
<g fill="none" stroke="#B5D4F4" stroke-width="1.3"><ellipse class="rr" cx="104" cy="79" rx="8" ry="2"/><ellipse class="rr" cx="104" cy="79" rx="8" ry="2" style="animation-delay:.4s"/><ellipse class="rr" cx="104" cy="79" rx="8" ry="2" style="animation-delay:.8s"/></g>
<g fill="#E6F1FB"><ellipse class="fo" cx="104" cy="78.4" rx="5.5" ry="2.2"/><ellipse class="fo" cx="100.4" cy="78" rx="3" ry="1.6" style="animation-delay:.18s"/><ellipse class="fo" cx="108" cy="78.2" rx="3.4" ry="1.6" style="animation-delay:.33s"/></g>
<g fill="#B5D4F4"><circle class="sd" cx="104" cy="77" r="1.1" style="--dx:-9px;--dy:-9px;--d:.8s"/><circle class="sd" cx="104" cy="77" r=".9" style="--dx:-5px;--dy:-13px;--d:.7s;animation-delay:.25s"/><circle class="sd" cx="104" cy="77" r="1.2" style="--dx:7px;--dy:-10px;--d:.75s;animation-delay:.1s"/><circle class="sd" cx="104" cy="77" r="1" style="--dx:12px;--dy:-7px;--d:.85s;animation-delay:.45s"/><circle class="sd" cx="104" cy="77" r=".8" style="--dx:-12px;--dy:-5px;--d:.9s;animation-delay:.55s"/><circle class="sd" cx="104" cy="77" r=".9" style="--dx:4px;--dy:-14px;--d:.7s;animation-delay:.62s"/></g>
</g>
</g>
<g fill="#B5D4F4" opacity=".35">${part}</g>
<rect x="76" y="198" width="208" height="8" fill="#BA7517" opacity=".3"/>${sedi}
<path d="M234 166 C228 166 225 160 223.6 154.6" fill="none" stroke="#141210" stroke-width=".9"/>
<g class="fl" style="transform-box:fill-box;transform-origin:50% 0"><ellipse cx="223" cy="150" rx="3.1" ry="4.6" fill="#2C2C2A"/><ellipse cx="222" cy="148.6" rx=".9" ry="2.2" fill="#5F5E5A"/></g>
<g transform="translate(44 0)"><g class="pjg">
<path d="M192.6 163.6 q3 -6.4 6 0" fill="none" stroke="#B4B2A9" stroke-width="1.1"/><rect x="198.2" y="157.6" width="2.6" height="5" rx=".5" fill="#BA7517"/><rect x="197.8" y="159" width="3.4" height="1" rx=".3" fill="#D3D1C7"/>
<path d="M190 167 Q190 162.6 195.6 162.6 Q201.2 162.6 201.2 167 Z" fill="#C9930A"/><rect x="190.2" y="166.6" width="10.8" height="17.8" rx="1.6" fill="#EBB422"/>
<g stroke="#C9930A" stroke-width=".7" opacity=".8"><line x1="193.2" y1="168" x2="193.2" y2="183"/><line x1="195.6" y1="168" x2="195.6" y2="183"/><line x1="198" y1="168" x2="198" y2="183"/></g>
<rect x="191" y="167.4" width="1.4" height="16.2" rx=".7" fill="#F7DA7A" opacity=".75"/><rect x="190.2" y="172.6" width="10.8" height="2.8" fill="#2C2C2A" opacity=".85"/><rect x="189.4" y="184.2" width="12.4" height="5" rx="1" fill="#2C2C2A"/>
<g stroke="#5F5E5A" stroke-width=".6"><line x1="191.4" y1="185" x2="191.4" y2="188.4"/><line x1="193.4" y1="185" x2="193.4" y2="188.4"/><line x1="195.4" y1="185" x2="195.4" y2="188.4"/><line x1="197.4" y1="185" x2="197.4" y2="188.4"/><line x1="199.4" y1="185" x2="199.4" y2="188.4"/></g>
<rect x="189.4" y="157.6" width="12.4" height="31.6" rx="2" fill="#185FA5" opacity=".26"/>
</g></g>
<g class="P" fill="#B5D4F4"><circle class="ip" cx="230" cy="197" r=".9" style="--dx:8px;--dy:-6px"/><circle class="ip" cx="250" cy="198" r="1" style="--dx:-8px;--dy:-7px;animation-delay:.3s"/><circle class="ip" cx="240" cy="201" r=".8" style="--dx:0px;--dy:-9px;animation-delay:.55s"/><circle class="ip" cx="233" cy="192" r=".8" style="--dx:6px;--dy:-1px;animation-delay:.75s"/><circle class="ip" cx="247" cy="192" r=".9" style="--dx:-6px;--dy:-1px;animation-delay:.15s"/></g>
<g fill="#B5D4F4"><circle class="bb" cx="132" cy="198" r="1.6"/><circle class="bb" cx="152" cy="200" r="2" style="animation-delay:1.4s"/><circle class="bb" cx="262" cy="199" r="2.2" style="animation-delay:2.5s"/><circle class="bb" cx="274" cy="200" r="1.6" style="animation-delay:.7s"/></g>
<text class="ol tk-pt" x="180" y="181" text-anchor="middle" style="font-size:26px;font-weight:700;stroke-width:4px"></text>
</g>
<path d="M-16 38 H0 V90 H94 V108 H-6 Q-16 108 -16 98 Z" fill="#D85A30"/><path d="M-14.75 38 V98" stroke="#F0997B" stroke-width="2.5" opacity=".55"/><rect x="0" y="90" width="94" height="2.5" fill="#F0997B" opacity=".55"/>
<path d="${BORE}" fill="#4A1B0C" opacity=".75"/>
<g class="R" fill="#2E6FB1">
<g clip-path="url(#tkvwin)"><g class="vb"><path d="${vf(-14, -10.4, -1.4)}"/><path d="${vf(-2, -5.6, 1.4)}"/></g><g class="va"><path d="${vf(-14, -10.9, 1.2)}"/><path d="${vf(-2, -5.1, -1.2)}"/></g><g class="vc"><path d="${vC}"/></g></g>
<g clip-path="url(#tkbore)"><g class="pb"><path d="${pw(99.8, 1.1)}"/></g><g class="pa"><path d="${pw(99.2, -1.4)}" stroke="#B5D4F4" stroke-width=".7"/></g><path d="${WB}"/></g>
<g clip-path="url(#tkwbody)">
<path class="sl" d="M-11.6 62 V91 C-11.6 98 -8.6 101.6 -2 101.8 H48" stroke-width=".55" opacity=".4" style="--d:.55s"/>
<path class="sl" d="M-8 56 V95 C-8 100 -5 103 2 103.2 H52" stroke-width=".5" opacity=".3" style="--d:.42s;animation-delay:-.2s"/>
<path class="sl" d="M-4 60 V93 C-4 98 -1 100.6 6 100.7 H56" stroke-width=".55" opacity=".4" style="--d:.5s;animation-delay:-.1s"/>
<path class="sl" d="M-11 70 V94 C-11 100.6 -7 103.8 0 104 H44" stroke-width=".5" opacity=".25" style="--d:.65s;animation-delay:-.33s"/>
</g>
<g clip-path="url(#tkbore)" fill="#E6F1FB"><ellipse class="jf" cx="-7.6" cy="99.6" rx="1.3" ry=".42"/><ellipse class="jf" cx="1.6" cy="99.7" rx="1.2" ry=".42" style="animation-delay:.16s"/>${hb(-7, 101.6, .5, '--tx:44px;--ty:.4px', 1.2, 0)}${hb(-4, 102.6, .45, '--tx:42px;--ty:.2px', 1.1, .35)}${hb(-9, 103.4, .5, '--tx:48px;--ty:-.2px', 1.3, .6)}${hb(-1, 100.8, .4, '--tx:38px;--ty:.5px', 1, .82)}</g>
</g>
<ellipse cx="94" cy="99" rx="2.6" ry="9" fill="#D85A30"/><ellipse cx="94" cy="99" rx="1.6" ry="6" fill="#4A1B0C"/>
<g class="R J" clip-path="url(#tkjc)">
<g class="jt"><path d="${JET}" fill="#378ADD" opacity=".78"/></g>
<g clip-path="url(#tkjet)"><g class="sk2" fill="#185FA5" opacity=".45">${sk2}</g><g class="sk" fill="#E6F1FB" opacity=".7">${sk1}</g></g>
<g class="jt2"><path d="M93.5 98.6 C99.5 98.6 103.6 101.8 105.3 107.6 C106.7 113 107 124 107 132 V206" fill="none" stroke="#B5D4F4" stroke-width=".9" opacity=".9"/></g>
<path d="M93.5 105.2 C97.2 105.2 99.2 107.4 100.2 112.2 C101.1 117.6 101.4 127 101.4 132 V206" fill="none" stroke="#185FA5" stroke-width=".8" opacity=".8"/>
</g>
<rect x="143" y="35.4" width="74" height="6.6" rx="1" fill="#2C2C2A"/><rect x="146" y="36" width="68" height="5.6" rx="1.2" fill="#444441"/>
<g stroke="#2C2C2A" stroke-width=".9"><line x1="154" y1="37" x2="154" y2="40.6"/><line x1="162" y1="37" x2="162" y2="40.6"/><line x1="170" y1="37" x2="170" y2="40.6"/><line x1="178" y1="37" x2="178" y2="40.6"/><line x1="186" y1="37" x2="186" y2="40.6"/><line x1="194" y1="37" x2="194" y2="40.6"/><line x1="202" y1="37" x2="202" y2="40.6"/></g>
<line x1="146" y1="36.4" x2="214" y2="36.4" stroke="#5F5E5A" stroke-width=".6"/>
<g class="tk-mk"><line x1="290" y1="78" x2="296" y2="78" stroke="#85B7EB" stroke-width="1.5"/><rect x="296" y="68.5" width="56" height="19" rx="9.5" fill="#378ADD" opacity=".35"/><text class="ol tk-mt" x="324" y="82.2" text-anchor="middle" style="font-size:12.5px;font-weight:700;letter-spacing:.3px;stroke-width:1.6px"></text></g>
</g></g>
<rect aria-hidden="true" x="-35.4" y="-25.4" width="394.8" height="288.8" rx="17.6" fill="none" stroke="#b87333" stroke-opacity=".35" stroke-width="1.2"/>
<g class="tgl tk-sw" role="switch" tabindex="0"><rect x="314" y="-22" width="44" height="32" fill="transparent"/><rect class="tb" x="322" y="-15" width="30" height="17" rx="8.5"/><circle class="tn" cx="330.5" cy="-6.5" r="6.5"/></g>
</svg>`);
}

/* ===================== CHART (single series, pinch/drag/wheel zoom, long press = crosshair, double tap = reset) ===================== */
const Z_MIN = 5 * 60e3, ZD = 864e5, Z_RAW = 2 * 36e5;
const Z_STEPS = [1, 2, 5, 10, 15, 30, 60, 120, 180, 360, 720, 1440, 2880];
const zLb = (P, t) => { let lo = 0, hi = P.length; while (lo < hi) { const m = (lo + hi) >> 1; if (P[m][0] < t) lo = m + 1; else hi = m; } return lo; };
const zAt = (V, t) => { if (!V || !V.length) return null; if (t <= V[0][0]) return V[0][1]; const k = zLb(V, t); if (k >= V.length) return V[V.length - 1][1]; const a2 = V[k - 1], b2 = V[k]; return a2[1] + (b2[1] - a2[1]) * (t - a2[0]) / ((b2[0] - a2[0]) || 1); };
const zClamp = (mn, mx, edge) => (t0, span) => { const e = edge(); span = Math.min(mx, Math.max(mn, span)); t0 = Math.min(e - span, Math.max(e - mx, t0)); return { t0, t1: t0 + span }; };
const zRange = (t0, t1) => new Date(t0).toDateString() === new Date(t1).toDateString() ? `${dLabel(t0)}–${hhmm(t1)}` : `${dLabel(t0)} – ${dLabel(t1)}`;
function zTicks(t0, t1) {
  const sp = (t1 - t0) / 6e4, st = Z_STEPS.find(x => sp / x <= 5) || 2880, out = [], d = new Date(t0);
  if (st >= 1440) { d.setHours(0, 0, 0, 0); while (+d < t0) d.setDate(d.getDate() + 1); for (; +d <= t1; d.setDate(d.getDate() + st / 1440)) out.push([+d, zDM(d)]); return out; }
  d.setHours(0, Math.ceil((d.getHours() * 60 + d.getMinutes() + (d.getSeconds() || d.getMilliseconds() ? 1 : 0)) / st) * st, 0, 0);
  for (let t = +d; t <= t1; t += st * 6e4) { const x = new Date(t); out.push([t, st >= 60 && !x.getHours() && !x.getMinutes() ? zDM(t) : hhmm(t)]); }
  return out;
}
function niceTicks(mn, mx, cnt = 4) {
  const span = (mx - mn) || 1, raw = span / cnt, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
  const st = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
  const lo = Math.floor(mn / st) * st, hi = Math.ceil(mx / st) * st, t = [];
  for (let v = lo; v <= hi + st / 2; v += st) t.push(+v.toFixed(6));
  return { lo, hi: hi === lo ? lo + st : hi, t, st };
}
const linePath = P => P.map((q, j) => `${j ? 'L' : 'M'}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join('');
function smoothPath(P) {   // monotone curve: soft peaks without overshoot
  const n = P.length; if (n < 3) return linePath(P);
  const dx = [], m = [], tg = new Array(n);
  for (let i = 0; i < n - 1; i++) { dx[i] = P[i + 1][0] - P[i][0]; m[i] = dx[i] ? (P[i + 1][1] - P[i][1]) / dx[i] : 0; }
  tg[0] = m[0]; tg[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) tg[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  for (let i = 0; i < n - 1; i++) { if (!m[i]) { tg[i] = tg[i + 1] = 0; continue; } const al = tg[i] / m[i], be = tg[i + 1] / m[i], q = al * al + be * be; if (q > 9) { const k = 3 / Math.sqrt(q); tg[i] = k * al * m[i]; tg[i + 1] = k * be * m[i]; } }
  let s2 = `M${P[0][0].toFixed(1)},${P[0][1].toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) { const hh = dx[i] / 3; s2 += `C${(P[i][0] + hh).toFixed(1)},${(P[i][1] + tg[i] * hh).toFixed(1)} ${(P[i + 1][0] - hh).toFixed(1)},${(P[i + 1][1] - tg[i + 1] * hh).toFixed(1)} ${P[i + 1][0].toFixed(1)},${P[i + 1][1].toFixed(1)}`; }
  return s2;
}
const histPts = (res, id) => (res?.[id] || []).map(p => [(p.lu ?? p.lc) * 1000, parseFloat(String(p.s).replace(',', '.'))]).filter(p => !isNaN(p[1]));

/* shared gesture handling; o: { v(), span(s), set(t0, span), geo(), cross(clientX|null, geo), reset(), first(), end() } */
function zGest(el, o) {
  const ptr = new Map(); let g = null, lp = 0, tap0 = 0, used = false;
  const first = () => { if (!used) { used = true; o.first(); } };
  const L = [];
  const on = (type, fn, opt) => { el.addEventListener(type, fn, opt); L.push([type, fn, opt]); };
  on('pointerdown', e => {
    const v = o.v(); if (!v) return; first();
    try { el.setPointerCapture(e.pointerId); } catch (_) { /* pointer already released */ }
    ptr.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptr.size === 1) {
      g = { m: 'wait', x0: e.clientX, y0: e.clientY, v0: { ...v }, G: o.geo(), dbl: e.timeStamp - tap0 < 300 };
      clearTimeout(lp); lp = setTimeout(() => { if (g?.m === 'wait') { g.m = 'cross'; navigator.vibrate?.(8); o.cross(g.x0, g.G); } }, 350);
    } else if (ptr.size === 2) {
      clearTimeout(lp); if (g?.m === 'cross') o.cross(null);
      const [p1, p2] = [...ptr.values()], G = o.geo(), cx = (p1.x + p2.x) / 2;
      g = { m: 'pinch', d0: Math.max(24, Math.hypot(p1.x - p2.x, p1.y - p2.y)), v0: { ...v }, G, tc: v.t0 + (cx - G.l) / G.w * (v.t1 - v.t0) };
    }
  });
  on('pointermove', e => {
    const p = ptr.get(e.pointerId); if (!p || !g) return; p.x = e.clientX; p.y = e.clientY;
    if (g.m === 'pinch') {
      if (ptr.size < 2) return;
      const [p1, p2] = [...ptr.values()], dd = Math.max(24, Math.hypot(p1.x - p2.x, p1.y - p2.y)), cx = (p1.x + p2.x) / 2, span = o.span((g.v0.t1 - g.v0.t0) * g.d0 / dd);
      o.set(g.tc - (cx - g.G.l) / g.G.w * span, span); return;
    }
    if (g.m === 'wait') { if (Math.abs(e.clientX - g.x0) > 6) { clearTimeout(lp); g.m = 'pan'; } else if (Math.abs(e.clientY - g.y0) > 8) { clearTimeout(lp); g.m = 'none'; } }
    if (g.m === 'pan') { const sp = g.v0.t1 - g.v0.t0; o.set(g.v0.t0 - (e.clientX - g.x0) / g.G.w * sp, sp); }
    else if (g.m === 'cross') o.cross(e.clientX, g.G);
  });
  const up = e => {
    if (!ptr.has(e.pointerId)) return; ptr.delete(e.pointerId);
    if (g?.m === 'pinch') {
      if (ptr.size === 1) { const [p] = [...ptr.values()], v = o.v(); g = { m: 'pan', x0: p.x, y0: p.y, v0: { ...v }, G: o.geo() }; }
      else if (!ptr.size) { g = null; o.end(); }
      return;
    }
    clearTimeout(lp);
    if (g?.m === 'wait' && e.type === 'pointerup') { if (g.dbl) { tap0 = 0; o.reset(); } else tap0 = e.timeStamp; }
    else tap0 = 0;
    if (g?.m === 'cross') o.cross(null);
    else if (g?.m === 'pan') o.end();
    if (!ptr.size) g = null;
  };
  on('pointerup', up); on('pointercancel', up);
  on('gesturestart', e => e.preventDefault());   // iOS: pinch must not zoom the page
  on('wheel', e => {   // desktop: mouse wheel = zoom around the cursor
    const v = o.v(); if (!v) return; e.preventDefault(); first();
    const G = o.geo(), sp = v.t1 - v.t0, f = Math.min(1, Math.max(0, (e.clientX - G.l) / G.w)), span = o.span(sp * Math.exp(e.deltaY * .002));
    o.set(v.t0 + f * sp - f * span, span); o.end();
  }, { passive: false });
  return {
    busy: () => !!g && g.m !== 'none', crossing: () => g?.m === 'cross',
    stop() { clearTimeout(lp); g = null; ptr.clear(); },
    destroy() { this.stop(); for (const [t, fn, opt] of L) el.removeEventListener(t, fn, opt); L.length = 0; },
  };
}

let zUid = 0;
/* ctx: { hass(), id, hours, lang, t, visible(), cur() } */
function mkChart(ctx) {
  const zdf = ctx.hours * 36e5, zmn = Z_MIN, zmx = Math.max(zdf, ctx.hours >= 168 ? 10 * ZD : 7 * ZD), uid = 'rtczc' + (++zUid);
  const el = mkEl('div', 'chart', '<div class="ch-h"><b></b><button type="button" class="zr" hidden></button><small></small></div><svg viewBox="0 0 340 168"></svg>');
  const svg = el.querySelector('svg'), sm = el.querySelector('small'), zr = el.querySelector('.zr'), nm = el.querySelector('b');
  const W = 340, H = 168, L = 34, R = 8, T = 20, B = 20, PW = W - L - R, PH = H - T - B;
  const clamp = zClamp(zmn, zmx, Date.now), def = () => { const e = Date.now(); return { t0: e - zdf, t1: e }; };
  let v = null, anch = true, base = null, ext = null, raw = null, rawTok = 0, rawTo = 0, rq = 0, drawn = 0, S = null, X = null, lastCx = null, lastG = null, alive = true;
  let baseT = 0, baseP = null, extT = 0, extP = null;
  const t = () => ctx.t();
  const spanLbl = hrs => hrs >= 48 && hrs % 24 === 0 ? t().days(hrs / 24) : hrs >= 48 ? t().days(Math.round(hrs / 24)) : t().hours(hrs);
  const isDef = () => anch && Math.abs(v.t1 - v.t0 - zdf) < 60e3;
  const req = () => { if (!rq && alive) rq = requestAnimationFrame(render); };
  const set = (t0, sp) => { v = clamp(t0, sp); anch = v.t1 >= Date.now() - 2000; req(); };
  const hist = (start, end) => ctx.hass().callWS({ type: 'history/history_during_period', start_time: new Date(start).toISOString(), end_time: new Date(end).toISOString(), entity_ids: [ctx.id], minimal_response: true, no_attributes: true, significant_changes_only: false });
  async function series(start, end) {   // long-term statistics (5 min minimum, as on the original dashboard) with plain history as a fallback
    let st = null;
    try { st = await ctx.hass().callWS({ type: 'recorder/statistics_during_period', start_time: new Date(start).toISOString(), end_time: new Date(end).toISOString(), statistic_ids: [ctx.id], period: '5minute', types: ['min'] }); } catch (_) { st = null; }
    const rows = st?.[ctx.id];
    if (rows?.length) { const p = rows.map(r => [typeof r.start === 'number' ? r.start : Date.parse(r.start), r.min]).filter(q => q[1] != null && !isNaN(q[1])); if (p.length) return p; }
    const p = histPts(await hist(start, end), ctx.id);
    if (p.length) p.push([+end, p[p.length - 1][1]]);
    return p;
  }
  const loadBase = () => {
    if (baseP || Date.now() - baseT < 300000 || !ctx.visible()) return;
    const end = Date.now();
    baseP = series(end - zdf, end).then(p => { base = p; }, e => { console.warn(RTC_TAG, e); if (!base) base = []; })
      .finally(() => { baseT = Date.now(); baseP = null; if (!v) v = def(); req(); });
  };
  const loadExt = () => {   // longer range is fetched only after the first interaction with the chart
    if (extP || Date.now() - extT < 300000 || zmx <= zdf) return;
    const end = Date.now();
    extP = series(end - zmx, end).then(p => { ext = p; }, e => console.warn(RTC_TAG, e)).finally(() => { extT = Date.now(); extP = null; req(); });
  };
  const rawOk = () => raw && v.t1 - v.t0 <= Z_RAW && raw.from <= v.t0 && raw.to >= Math.min(v.t1, Date.now() - 120000);
  const after = () => {
    clearTimeout(rawTo); rawTo = setTimeout(() => {   // window <= 2 h: raw readings for the visible fragment only
      if (!alive || !v || v.t1 - v.t0 > Z_RAW || rawOk()) return;
      const sp = v.t1 - v.t0, f = Math.max(Date.now() - zmx, v.t0 - sp), to = Math.min(Date.now(), v.t1 + sp), tok = ++rawTok;
      hist(f, to).then(res => { if (tok !== rawTok || !alive) return; const p = histPts(res, ctx.id); raw = p.length ? { from: f, to, p } : null; req(); }, () => {});
    }, 250);
  };
  const fv = x => fmtN(ctx.lang(), x, 1) + '%';
  function show(tt) {
    if (!v || !S) return;
    const df = isDef(), val = zAt(S, tt ?? Math.min(v.t1, Date.now()));
    const head = tt != null ? dLabel(tt) : df ? spanLbl(ctx.hours) : zRange(v.t0, v.t1);
    setTxt(sm, tt != null ? `${head} · ${fv(val)}` : df ? fv(val) : head);
    if (zr.hidden !== df) zr.hidden = df;
  }
  function cross(cx, G) {
    if (cx == null) { lastCx = null; X?.cg.setAttribute('visibility', 'hidden'); show(null); return; }
    lastCx = cx; lastG = G; if (!X || !v) return;
    const tt = v.t0 + Math.min(1, Math.max(0, (cx - G.l) / G.w)) * (v.t1 - v.t0), px = X.xp(tt).toFixed(1), y = zAt(S, tt);
    X.cl.setAttribute('x1', px); X.cl.setAttribute('x2', px);
    X.cs.setAttribute('cx', px); X.cs.setAttribute('cy', y == null ? -99 : X.yp(y).toFixed(1));
    X.cg.setAttribute('visibility', 'visible'); show(tt);
  }
  function render() {
    rq = 0; if (!v || !alive) return; drawn = Date.now();
    if (anch && !G.busy()) { const sp = v.t1 - v.t0; v = { t0: drawn - sp, t1: drawn }; }   // "until now" view follows the clock
    const t0 = v.t0, t1 = v.t1, sp = t1 - t0;
    const P = rawOk() ? raw.p : (ext && (t0 < drawn - zdf - 60e3 || !base?.length) ? ext : base) || [];
    S = null;
    if (P.length) {
      let i = zLb(P, t0); if (i > 0) i--; let j = zLb(P, t1); if (j >= P.length) j = P.length - 1;
      let V = P.slice(i, j + 1);
      const cur = ctx.cur(); if (cur != null && t1 > drawn - 120000 && V.length && V[V.length - 1][0] < drawn - 60000) V.push([drawn, cur]);
      if (V.length > 240) {   // average down to ~200 points across the width (ends kept for line continuity)
        const bs = sp / 200, out = [V[0]]; let k = null, sx = 0, sy = 0, cn = 0;
        for (let q = 1; q < V.length - 1; q++) { const b2 = Math.floor((V[q][0] - t0) / bs); if (b2 !== k && cn) { out.push([sx / cn, sy / cn]); sx = sy = cn = 0; } k = b2; sx += V[q][0]; sy += V[q][1]; cn++; }
        if (cn) out.push([sx / cn, sy / cn]); out.push(V[V.length - 1]); V = out;
      }
      if (V.length) S = V;
    }
    if (!S) { setTxt(sm, base ? t().no_data : t().loading); if (svg.firstChild) svg.textContent = ''; X = null; return; }
    let mn = Infinity, mx = -Infinity; const ck = x => { if (x != null) { if (x < mn) mn = x; if (x > mx) mx = x; } };
    for (const q of S) if (q[0] >= t0 && q[0] <= t1) ck(q[1]);
    ck(zAt(S, t0)); ck(zAt(S, Math.min(t1, S[S.length - 1][0])));
    const Y = niceTicks(mn, mx, 4), xp = x => L + (x - t0) / sp * PW, yp = y => T + PH - (y - Y.lo) / (Y.hi - Y.lo) * PH;
    const tick = y0 => fmtN(ctx.lang(), y0, Y.st < 0.1 ? 2 : Y.st < 1 ? 1 : 0);
    let s3 = `<defs><clipPath id="${uid}"><rect x="${L}" y="${T - 4}" width="${PW}" height="${PH + 8}"/></clipPath></defs>`;
    Y.t.forEach(y0 => { const y = yp(y0).toFixed(1); s3 += `<line class="gl" x1="${L}" x2="${W - R}" y1="${y}" y2="${y}"/><text class="ax" x="${L - 5}" y="${(+y + 3).toFixed(1)}" text-anchor="end">${tick(y0)}</text>`; });
    zTicks(t0, t1).forEach(([tt, lab]) => { const x = xp(tt); if (x - L < 12 || W - R - x < 12) return; s3 += `<line class="gl" x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${T}" y2="${T + PH}"/><text class="ax" x="${x.toFixed(1)}" y="${H - 6}" text-anchor="middle">${lab}</text>`; });
    s3 += `<line class="axl" x1="${L}" x2="${L}" y1="${T}" y2="${T + PH}"/><line class="axl" x1="${L}" x2="${W - R}" y1="${T + PH}" y2="${T + PH}"/><text class="ax" x="2" y="9">%</text>`;
    const Q = S.map(q => [xp(q[0]), yp(q[1])]), path = smoothPath(Q);
    s3 += `<g clip-path="url(#${uid})"><path d="${path}L${Q[Q.length - 1][0].toFixed(1)},${T + PH}L${Q[0][0].toFixed(1)},${T + PH}Z" fill="${CHART_COLOR}" opacity=".13"/><path d="${path}" fill="none" stroke="${CHART_COLOR}" stroke-width="1.6" stroke-linejoin="round"/></g>`;
    s3 += `<g class="cross" visibility="hidden"><line class="cl" y1="${T}" y2="${T + PH}"/><circle r="2.8" fill="${CHART_COLOR}" stroke="#16130f" stroke-width="1"/></g><rect x="0" y="0" width="${W}" height="${H}" fill="transparent"/>`;
    svg.innerHTML = s3;
    const cg = svg.querySelector('.cross'); X = { cg, cl: cg.firstChild, cs: cg.lastChild, xp, yp };
    if (G.crossing() && lastCx != null) cross(lastCx, lastG); else show(null);
  }
  const geo = () => { const r = svg.getBoundingClientRect(); return { l: r.left + L / W * r.width, w: PW / W * r.width }; };
  const G = zGest(svg, { v: () => v, span: x => Math.min(zmx, Math.max(zmn, x)), set, geo, cross, first: loadExt, end: after,
    reset: () => { v = def(); anch = true; req(); after(); navigator.vibrate?.(8); } });
  const onReset = e => { e.stopPropagation(); v = def(); anch = true; req(); };
  zr.addEventListener('click', onReset);
  return { el,
    upd(name) {
      setTxt(nm, name); setTxt(zr, '↺ ' + spanLbl(ctx.hours));
      if (!v && !base) setTxt(sm, t().loading);
      loadBase();
      if (anch && v && !G.busy() && Date.now() - drawn > 30000) req();
    },
    destroy() { alive = false; G.destroy(); zr.removeEventListener('click', onReset); clearTimeout(rawTo); rawTok++; if (rq) cancelAnimationFrame(rq); rq = 0; raw = base = ext = S = X = null; },
  };
}

/* ===================== CARD ===================== */
class RainwaterTankCard extends HTMLElement {
  static getConfigElement() { return document.createElement(RTC_TAG + '-editor'); }
  static getStubConfig(hass) {
    const st = hass?.states || {}, pct = Object.keys(st).filter(id => id.startsWith('sensor.') && st[id].attributes?.unit_of_measurement === '%');
    const pick = pct.find(id => /tank|cistern|rain|water|level|zbiornik|deszcz|poziom/.test(id)) || pct.find(id => !/battery|bateri|humidity|wilgot/.test(id)) || pct[0] || '';
    return { level_entity: pick, capacity: 5000 };
  }
  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
    applyStyles(this._root);
    this._seen = new Map();
    this._vis = true; this._raf = 0; this._timer = 0; this._io = null; this._chart = null; this._day = { key: '', start: null, p: null };
    this._onVis = () => this._setVisible(this._ioVis);
    this._ioVis = true;
  }
  setConfig(c) {
    if (!c || typeof c !== 'object') throw new Error('Invalid configuration');
    if (!c.level_entity) throw new Error('Please set "level_entity" (water level in %).');
    const cap = Number(c.capacity);
    if (!(cap > 0)) throw new Error('Please set "capacity" (tank capacity, a number greater than 0).');
    this._cfg = {
      title: c.title, show_title: c.show_title !== false, icon: c.icon || 'mdi:storage-tank-outline', icon_color: c.icon_color || '#7AEBDD',
      level_entity: c.level_entity, height_entity: c.height_entity || '', capacity: cap, unit_system: c.unit_system || 'auto',
      weather_entity: c.weather_entity || '', rain_entity: c.rain_entity || '', pump_entity: c.pump_entity || '',
      show_chart: c.show_chart !== false, chart_hours: Math.max(1, Math.min(720, Number(c.chart_hours) || 168)),
      highlight_threshold: c.highlight_threshold == null || c.highlight_threshold === '' ? 3 : Number(c.highlight_threshold),
      names: { ...(c.names || {}) }, measurements: { ...(c.measurements || {}) },
    };
    this._built = false; this._seen.clear(); this._day = { key: '', start: null, p: null };
    if (this._hass) this._schedule(true);
  }
  set hass(hs) {
    this._hass = hs;
    if (!this._cfg) return;
    if (!this._built || this._lang !== langOf(hs) || this._changed()) this._schedule(true);
  }
  get hass() { return this._hass; }
  getCardSize() { return 14; }
  getGridOptions() { return { columns: 12, min_columns: 6 }; }

  connectedCallback() {
    injectFont();
    if ('IntersectionObserver' in window && !this._io) {
      this._io = new IntersectionObserver(es => { for (const e of es) { this._ioVis = e.isIntersecting; this._setVisible(this._ioVis); } }, { rootMargin: '100px' });
      this._io.observe(this);
    }
    document.addEventListener('visibilitychange', this._onVis);
    if (!this._timer) this._timer = setInterval(() => { if (this._vis) this._schedule(true); }, 30000);   // "x min ago" texts and chart time window
    if (this._cfg && this._hass) this._schedule(true);
  }
  disconnectedCallback() {
    this._io?.disconnect(); this._io = null;
    document.removeEventListener('visibilitychange', this._onVis);
    clearInterval(this._timer); this._timer = 0;
    if (this._raf) cancelAnimationFrame(this._raf); this._raf = 0;
    this._destroyView();
  }
  _setVisible(io) {
    const vis = io && !document.hidden;
    if (vis === this._vis) return;
    this._vis = vis;
    this._svg?.classList.toggle('off', !vis);
    if (vis) this._schedule(true);
  }
  _ids() {
    const c = this._cfg, ids = [c.level_entity, c.height_entity, c.weather_entity, c.rain_entity, c.pump_entity];
    for (const k of MEAS_KEYS) ids.push(c.measurements[k]?.entity);
    return ids.filter(Boolean);
  }
  _changed() {   // re-render only when one of the configured entities really changed
    const st = this._hass.states; let ch = false;
    for (const id of this._ids()) { const o = st[id]; if (this._seen.get(id) !== o) { this._seen.set(id, o); ch = true; } }
    return ch;
  }
  _schedule(force) {
    if (force) this._force = true;
    if (this._raf || !this.isConnected) return;
    this._raf = requestAnimationFrame(() => { this._raf = 0; this._render(); });
  }

  /* ----- state helpers ----- */
  _s(id) { return id ? this._hass.states[id]?.state : undefined; }
  _n(id, d = null) { const v = parseFloat(String(this._s(id)).replace(',', '.')); return isNaN(v) ? d : v; }
  _a(id, k) { return id ? this._hass.states[id]?.attributes?.[k] : undefined; }
  _t() { return I18N[this._lang]; }
  _ago(d) {
    const t = this._t(), m = Math.round((Date.now() - new Date(d)) / 6e4);
    if (isNaN(m)) return '—'; if (m < 1) return t.now; if (m < 60) return t.min_ago(m);
    const hh = Math.floor(m / 60); return hh < 24 ? t.h_ago(hh) : this._dt(d);
  }
  _dt(d) {
    d = new Date(d); if (isNaN(d)) return '—';
    if (this._lang === 'pl') return `${pad(d.getDate())}.${pad(d.getMonth() + 1)} ${hhmm(d)}`;
    return new Intl.DateTimeFormat(this._hass?.locale?.language || 'en', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(d);
  }
  _lc(id) { const e = id && this._hass.states[id]; return e ? this._ago(e.last_changed) : ''; }
  _imperial() {
    const u = this._cfg.unit_system; if (u === 'metric' || u === 'imperial') return u === 'imperial';
    const us = this._hass?.config?.unit_system; return us?.length === 'mi' || us?.volume === 'gal';
  }
  _heightM() {   // water height converted to metres (unit read from the entity, centimetres when missing)
    const id = this._cfg.height_entity, v = this._n(id); if (v == null) return null;
    return v * (LEN_TO_M[String(this._a(id, 'unit_of_measurement') || 'cm').toLowerCase()] ?? .01);
  }
  _fmtLen(m) { return m == null ? '–' : this._imperial() ? fmtN(this._lang, m / .3048, 2) + ' ft' : fmtN(this._lang, m, 2) + ' m'; }
  _name(k) { const v = this._cfg.names[k]; return v != null && v !== '' ? String(v) : null; }

  /* level change since local midnight, computed from history (no helper needed) */
  _dayDelta(cur) {
    const d = new Date(), key = d.toDateString(), day = this._day;
    if (day.key !== key && !day.p && this._vis) {
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()), id = this._cfg.level_entity;
      day.p = this._hass.callWS({ type: 'history/history_during_period', start_time: start.toISOString(), end_time: new Date().toISOString(), entity_ids: [id], minimal_response: true, no_attributes: true, significant_changes_only: false })
        .then(res => { const p = histPts(res, id); day.start = p.length ? p[0][1] : null; day.key = key; }, e => { console.warn(RTC_TAG, e); day.start = null; day.key = key; })
        .finally(() => { day.p = null; this._schedule(true); });
    }
    return day.key === key && day.start != null && cur != null ? cur - day.start : 0;   // no data = ±0
  }

  /* ----- DOM ----- */
  _destroyView() { this._chart?.destroy(); this._chart = null; if (this._sw) this._sw.removeEventListener('click', this._swTog); this._sw?.removeEventListener('keydown', this._swKey); this._sw = null; }
  _build() {
    this._destroyView();
    const c = this._cfg; this._lang = langOf(this._hass); const t = this._t();
    const old = this._root.querySelector('ha-card'); if (old) old.remove();
    const card = mkEl('ha-card');
    const tile = (cls, ic, unit) => `<div class="tkc ${cls}"><div class="hd"><ha-icon icon="${ic}"></ha-icon><b></b></div><div class="vl"><span>–</span><small>${unit}</small></div><div class="fs"></div><em></em></div>`;
    const vu = this._imperial() ? 'gal' : 'L';
    card.innerHTML = `<header><ha-icon></ha-icon><h3></h3></header><div class="body">
<section class="grp"><h4 class="h-tank"></h4><div class="rows rows-tank"><div class="tkw">${tankSvg()}<h4 class="tkh h-sensor"></h4><div class="tkt">${tile('lvl', 'mdi:water-percent', '%')}${tile('vol', 'mdi:storage-tank-outline', vu)}</div></div></div></section>
<section class="grp gm"><h4 class="h-meas"></h4><div class="rows g2 meas"></div></section></div>`;
    const q = s => card.querySelector(s);
    this._hd = q('header'); this._hIc = q('header>ha-icon'); this._hT = q('h3');
    this._svg = q('svg.tank'); const sq = s => this._svg.querySelector(s);
    this._wg = sq('.tk-wg'); this._mk = sq('.tk-mk'); this._pt = sq('.tk-pt'); this._mt = sq('.tk-mt'); this._jc = sq('.tk-jc');
    this._sw = sq('.tk-sw'); this._sw.setAttribute('aria-label', t.animations);
    this._mk.style.display = c.height_entity ? '' : 'none';
    this._svg.classList.toggle('off', !this._vis);
    this._tiles = [...card.querySelectorAll('.tkc')].map(el => ({ el, v: el.querySelector('.vl span'), b: el.querySelector('b'), em: el.querySelector('em'), fs: el.querySelector('.fs'), hi: false }));
    this._hTank = q('.h-tank'); this._hSensor = q('.h-sensor'); this._hMeas = q('.h-meas'); this._gm = q('.gm');
    /* force-animations toggle: remembered per device, as on the original dashboard */
    this._fkey = 'rainwater-tank-card:force:' + c.level_entity;
    try { this._forceOn = localStorage.getItem(this._fkey) === '1'; } catch (_) { this._forceOn = false; }
    this._swTog = () => { this._forceOn = !this._forceOn; try { localStorage.setItem(this._fkey, this._forceOn ? '1' : '0'); } catch (_) { /* storage blocked */ } navigator.vibrate?.(10); this._schedule(true); };
    this._swKey = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._swTog(); } };
    this._sw.addEventListener('click', this._swTog); this._sw.addEventListener('keydown', this._swKey);
    if (c.show_chart) {
      this._chart = mkChart({ hass: () => this._hass, id: c.level_entity, hours: c.chart_hours, lang: () => this._lang, t: () => this._t(), visible: () => this._vis, cur: () => this._n(c.level_entity) });
      q('.rows-tank').append(this._chart.el);
    }
    /* measurements: fixed set, each shown only when an entity is configured */
    const box = q('.meas'); this._rows = [];
    for (const k of MEAS_KEYS) {
      const m = c.measurements[k]; if (!m?.entity) continue;
      const el = mkEl('div', 'ft', '<div class="hd"><ha-icon></ha-icon><span><b></b><span class="tx"></span><em></em></span></div>');
      if (k === 'signal' || k === 'battery') el.classList.add('wr');
      box.append(el);
      this._rows.push({ k, id: m.entity, icon: m.icon, name: m.name, el, ic: el.querySelector('ha-icon'), b: el.querySelector('b'), tx: el.querySelector('.tx'), em: el.querySelector('em'), bad: false });
    }
    this._gm.hidden = !this._rows.length;
    this._root.append(card);
    this._k0 = ''; this._vbFix = false; this._built = true;
  }

  _render() {
    if (!this._cfg || !this._hass) return;
    if (!this._built || this._lang !== langOf(this._hass)) { this._build(); this._changed(); this._force = true; }
    if (!this._force) return;
    this._force = false;
    const c = this._cfg, t = this._t(), lang = this._lang, svg = this._svg;
    /* header and labels */
    const title = c.title != null && c.title !== '' ? String(c.title) : t.title;
    if (this._hd.hidden !== !c.show_title) this._hd.hidden = !c.show_title;
    setTxt(this._hT, title); setIcon(this._hIc, c.icon);
    if (this._hIc._c !== c.icon_color) { this._hIc._c = c.icon_color; this._hIc.style.setProperty('--ic', c.icon_color); }
    setTxt(this._hTank, this._name('tank') ?? t.tank); setTxt(this._hSensor, this._name('sensor') ?? t.sensor); setTxt(this._hMeas, this._name('measurements') ?? t.measurements);
    setTxt(this._tiles[0].b, this._name('level') ?? t.level); setTxt(this._tiles[1].b, this._name('volume') ?? t.volume);
    /* tank scene: the SVG is touched only when its state changes */
    if (!this._vbFix) { this._vbFix = true; requestAnimationFrame(() => { if (!svg.isConnected) return; svg.removeAttribute('viewBox'); void svg.getBoundingClientRect(); svg.setAttribute('viewBox', TANK_VB); }); }   // Safari: force rescale after insertion
    const pRaw = this._n(c.level_entity), p = Math.max(0, Math.min(100, pRaw ?? 0)), hm = this._heightM(), force = this._forceOn;
    const live = force || RAIN.includes(this._s(c.weather_entity)) || this._s(c.rain_entity) === 'on';
    const pump = force || ['on', 'open', 'running'].includes(this._s(c.pump_entity));
    const key = `${p}|${hm}|${live}|${pump}|${force}|${lang}|${this._imperial()}`;
    if (key !== this._k0) {
      this._k0 = key;
      const ty = (1 - p / 100) * 128, sy = 78 + ty, tr = `translate(0 ${ty.toFixed(1)})`;
      this._wg.setAttribute('transform', tr); this._mk.setAttribute('transform', tr);
      this._jc.setAttribute('height', Math.max(0, sy + 1 - 90).toFixed(1));   // the jet reaches exactly the water surface
      svg.classList.toggle('sub', sy <= 106);   // inlet under water: no jet
      svg.classList.toggle('live', live); svg.classList.toggle('pump', pump); svg.classList.toggle('force', force);
      this._sw.setAttribute('aria-checked', String(force));
      this._pt.textContent = Math.round(p) + '%'; this._pt.setAttribute('y', ((sy + 206) / 2 + 9).toFixed(1)); this._pt.style.display = p < 14 ? 'none' : '';
      this._mt.textContent = this._fmtLen(hm);
    }
    /* tiles */
    const thr = c.highlight_threshold, dp = this._dayDelta(pRaw), dr = Math.round(dp), hl = (tl, on) => { if (on !== tl.hi) { tl.hi = on; tl.el.classList.toggle('on', on); tl.fs.classList.toggle('up', on); } };
    const T0 = this._tiles[0];
    setTxt(T0.v, pRaw == null ? '–' : String(Math.round(pRaw)));
    setTxt(T0.em, c.height_entity ? `${this._fmtLen(hm)} · ${this._lc(c.level_entity)}` : this._lc(c.level_entity));
    setTxt(T0.fs, `${t.today} ${dr > 0 ? '+' + dr : dr < 0 ? dr : '±0'}%`);
    hl(T0, dr >= thr);
    const T1 = this._tiles[1], imp = this._imperial(), vu = imp ? 'gal' : 'L', cap = c.capacity, lit = x => String(Math.round(x));
    const l = pRaw == null ? null : p / 100 * cap, dl = imp ? Math.round(dp / 100 * cap) : Math.round(dp / 100 * cap / 10) * 10;
    setTxt(T1.v, l == null ? '–' : lit(l));
    setTxt(T1.fs, `${t.today} ${dl > 0 ? '+' + lit(dl) : dl < 0 ? '−' + lit(-dl) : '±0'} ${vu}`);
    setTxt(T1.em, l == null ? '–' : t.free(lit(cap - l), lit(cap), vu));
    hl(T1, dr >= thr);
    /* chart */
    if (this._chart) { const hrs = c.chart_hours; this._chart.upd(this._name('chart') ?? t.chart(hrs % 24 === 0 ? t.days(hrs / 24) : t.hours(hrs))); }
    /* measurements */
    for (const r of this._rows) {
      const st = this._s(r.id), ok = okv(st);
      let txt = '—', icon = r.icon || MEAS_ICON[r.k], sub = '', bad = false;
      if (r.k === 'temperature') txt = ok ? `${fmtN(lang, this._n(r.id), 1)} ${this._a(r.id, 'unit_of_measurement') || '°C'}` : '—';
      else if (r.k === 'signal') {
        const v = this._n(r.id);
        if (v != null) { const a = Math.abs(v), i = a <= 50 ? 0 : a <= 60 ? 1 : a <= 67 ? 2 : a <= 70 ? 3 : a <= 80 ? 4 : a <= 90 ? 5 : 6; txt = `${fmtN(lang, v, 0)} ${this._a(r.id, 'unit_of_measurement') || 'dBm'} · ${t.rssi[i]}`; bad = a > 80; }
      } else if (r.k === 'battery') {
        let b;
        if (['high', 'middle', 'low'].includes(st)) b = { txt: t.bat[st], v: { high: 100, middle: 50, low: 15 }[st], low: st !== 'high' };
        else { const v = this._n(r.id); b = v == null ? { txt: '—', v: 0, low: false } : { txt: Math.round(v) + '%', v, low: v < 20 }; }
        txt = b.txt; bad = b.low; 
        if (!r.icon) icon = b.v > 60 ? 'mdi:battery-high' : b.v > 25 ? 'mdi:battery-medium' : 'mdi:battery-low';
      } else if (ok) {   // timestamps: relative for past readings, absolute for the forecast
        const d = new Date(st);
        txt = isNaN(d) ? st : r.k === 'full_prediction' ? this._dt(d) : this._ago(d);
      }
      setTxt(r.b, r.name || t[r.k]); setTxt(r.tx, txt); setIcon(r.ic, icon);
      setTxt(r.em, sub);
      if (bad !== r.bad) { r.bad = bad; r.el.classList.toggle('bad', bad); }
    }
  }
}

/* ===================== VISUAL EDITOR ===================== */
class RainwaterTankCardEditor extends HTMLElement {
  setConfig(c) { this._cfg = { ...c }; this._render(); }
  set hass(hs) { this._hass = hs; if (this._form) this._form.hass = hs; else this._render(); }
  _schema() {
    const e = I18N[langOf(this._hass)].ed, num = (min, max, step) => ({ number: { min, max, step, mode: 'box' } });
    const ent = domain => ({ entity: { domain } });
    return [
      { name: 'level_entity', required: true, selector: ent(['sensor', 'input_number', 'number']) },
      { name: 'capacity', required: true, selector: num(1, 10000000, 1) },
      { name: 'height_entity', selector: ent(['sensor', 'input_number', 'number']) },
      { name: 'unit_system', selector: { select: { mode: 'dropdown', options: ['auto', 'metric', 'imperial'].map(v => ({ value: v, label: e[v] })) } } },
      { name: 'show_title', selector: { boolean: {} } },
      { name: 'title', selector: { text: {} } },
      { type: 'grid', name: '', flatten: true, schema: [{ name: 'icon', selector: { icon: {} } }, { name: 'icon_color', selector: { text: {} } }] },
      { type: 'expandable', name: '', flatten: true, title: e.sec_anim, schema: [
        { name: 'weather_entity', selector: ent(['weather']) },
        { name: 'rain_entity', selector: ent(['binary_sensor', 'input_boolean']) },
        { name: 'pump_entity', selector: ent(['switch', 'input_boolean', 'binary_sensor', 'fan', 'valve']) },
      ] },
      { type: 'expandable', name: '', flatten: true, title: e.sec_chart, schema: [
        { name: 'show_chart', selector: { boolean: {} } },
        { name: 'chart_hours', selector: num(1, 720, 1) },
        { name: 'highlight_threshold', selector: num(0, 100, 1) },
      ] },
      { type: 'expandable', name: 'names', title: e.sec_names, schema: NAME_KEYS.map(k => ({ name: k, selector: { text: {} } })) },
      { type: 'expandable', name: 'measurements', title: e.sec_meas, schema: MEAS_KEYS.map(k => ({ type: 'expandable', name: k, title: I18N[langOf(this._hass)][k], schema: [
        { name: 'entity', selector: ent(k === 'temperature' || k === 'signal' || k === 'battery' ? ['sensor'] : ['sensor', 'input_datetime']) },
        { name: 'name', selector: { text: {} } },
        { name: 'icon', selector: { icon: {} } },
      ] })) },
    ];
  }
  _render() {
    if (!this._hass || !this._cfg) return;
    const e = I18N[langOf(this._hass)].ed;
    if (!this._form) {
      this._form = document.createElement('ha-form');
      this._form.computeLabel = s => e[s.name] ?? (NAME_KEYS.includes(s.name) ? e['n_' + s.name] : undefined) ?? s.name;
      this._form.addEventListener('value-changed', ev => {
        ev.stopPropagation();
        const cfg = clean({ ...ev.detail.value });
        for (const [k, v] of Object.entries(EDITOR_DEFAULTS)) if (cfg[k] === v) delete cfg[k];   // keep the YAML short
        this._cfg = cfg;
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: cfg }, bubbles: true, composed: true }));
      });
      this.append(this._form);
    }
    this._form.hass = this._hass; this._form.schema = this._schema();
    this._form.data = { ...EDITOR_DEFAULTS, ...this._cfg };
  }
}
const EDITOR_DEFAULTS = { show_title: true, unit_system: 'auto', show_chart: true, chart_hours: 168, highlight_threshold: 3 };
/* drop empty values so the YAML stays short */
function clean(o) {
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (v && typeof v === 'object' && !Array.isArray(v)) { o[k] = clean({ ...v }); if (!Object.keys(o[k]).length) delete o[k]; }
    else if (v === '' || v === undefined || v === null) delete o[k];
  }
  return o;
}

/* Manrope (SIL OFL 1.1), latin + latin-ext subsets, woff2 */
const FONT_LATIN = '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';
const FONT_LATIN_EXT = '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';

/* ===================== REGISTRATION ===================== */
if (!customElements.get(RTC_TAG)) customElements.define(RTC_TAG, RainwaterTankCard);
if (!customElements.get(RTC_TAG + '-editor')) customElements.define(RTC_TAG + '-editor', RainwaterTankCardEditor);
window.customCards = window.customCards || [];
if (!window.customCards.some(x => x.type === RTC_TAG)) window.customCards.push({ type: RTC_TAG, name: 'Rainwater Tank Card', description: 'Animated rainwater tank with level, volume, history chart and sensor details.', preview: true, documentationURL: 'https://github.com/DeveloperMateusz/rainwater-tank-card' });
console.info(`%c RAINWATER-TANK-CARD %c v${RTC_VERSION} `, 'background:#b87333;color:#fff;font-weight:700', 'background:#0e0c0a;color:#d4a882');
