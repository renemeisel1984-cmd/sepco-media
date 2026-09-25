/* tr-guide.js - the small interactive tools on the Trelawny guide pages.
   Each tool is its own IIFE and only wakes up if its markup is on the page.
   Every figure used here is one the page it runs on already publishes. */

/* ---- shared: trigger time T = 8 x (threshold / a)^2 hours, as the pages use ---- */
var TRG = (function () {
  function hours(a, thr) { return 8 * Math.pow(thr / a, 2); }
  function fmt(h) {
    var exact = h * 60;
    if (exact < 10 && exact !== Math.floor(exact)) return 'under ' + (Math.floor(exact) + 1) + ' min';
    var m = Math.round(exact);
    if (m >= 480) return 'not reached in 8 h';
    if (m < 60) return m + ' min';
    return Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + (m % 60 < 10 ? '0' : '') + (m % 60) + ' min' : '');
  }
  return { hours: hours, fmt: fmt };
})();

/* ---- deck output planner (deck-descaling-production-rate) ---- */
(function () {
  var root = document.querySelector('[data-g-tool="deck"]');
  if (!root) return;
  var TOOLS = {
    sf11: { n: 'SF11 deck hammer', rate: 30, rateTxt: 'up to 30 m²/h (Trelawny rated figure)', a: 5.76, aK: 8.06, air: '100 cfm free air at 90 psi, per machine (manual)', passes: false },
    tfp: { n: 'TFP200, corded, air or battery', rate: 25, rateTxt: '25 m²/h at 3 mm per pass (datasheet average)', a: 4.4, air: 'Air model: 165 cfm (78 l/s). Mains and battery models: no air', passes: true },
    tfpp: { n: 'TFP200, petrol', rate: 25, rateTxt: '25 m²/h at 3 mm per pass (datasheet average)', a: 6.9, air: 'No air (petrol engine)', passes: true },
    ppt: { n: 'PPT 4" air, C-flaps', rate: 4, rateTxt: '4 m²/h, the low end of Trelawny\'s 4-5 m²/h on flat steel', a: 3.1, air: '30 cfm (840 l/min)', passes: false },
    tri: { n: 'Trident Neptune', rate: 5, rateTxt: '5 m²/h (Trelawny average)', a: 8.7, air: 'Air model: 68 cfm (32.1 l/s). Electric models: no air', passes: false }
  };
  var SHIFT = 5; // realistic trigger time inside an 8 h shift, per the page
  var f = {
    tool: root.querySelector('#gd-tool'), area: root.querySelector('#gd-area'),
    passes: root.querySelector('#gd-passes'), pwrap: root.querySelector('#gd-passes-wrap'),
    k: root.querySelector('#gd-k'), kwrap: root.querySelector('#gd-k-wrap')
  };
  var o = {
    big: root.querySelector('#gd-days'), per: root.querySelector('#gd-per'), trig: root.querySelector('#gd-trig'),
    lim: root.querySelector('#gd-lim'), rate: root.querySelector('#gd-rate'), air: root.querySelector('#gd-air'),
    note: root.querySelector('#gd-note')
  };
  function basis() { var r = root.querySelector('input[name="gd-basis"]:checked'); return r ? r.value : 'real'; }
  function n1(x) { return (Math.round(x * 10) / 10).toLocaleString('en-GB'); }
  function n0(x) { return Math.round(x).toLocaleString('en-GB'); }
  function render() {
    var t = TOOLS[f.tool.value] || TOOLS.sf11;
    f.pwrap.hidden = !t.passes; f.kwrap.hidden = !t.aK;
    var a = (t.aK && f.k.checked) ? t.aK : t.a;
    var passes = (t.passes && f.passes.value === '2') ? 2 : 1;
    var area = Math.max(0, parseFloat(f.area.value) || 0);
    var eav = TRG.hours(a, 2.5), elv = TRG.hours(a, 5.0), b = basis(), trig, why;
    if (b === 'eav') { trig = Math.min(eav, SHIFT); why = eav > SHIFT ? 'The action value (' + TRG.fmt(eav) + ') is beyond what a shift holds, so about 5 h is counted.' : 'Kept below the action value (' + TRG.fmt(eav) + ').'; }
    else if (b === 'elv') { trig = Math.min(elv, 8); why = elv >= 8 ? 'The limit value is not reached in 8 h, so a full 8 h is counted: no one works like that.' : 'Run up to the limit value (' + TRG.fmt(elv) + '), which needs controls and health surveillance.'; }
    else { trig = Math.min(elv, SHIFT); why = elv < SHIFT ? 'Capped by the limit value (' + TRG.fmt(elv) + '), before the 5 h a shift allows.' : 'Capped at about 5 h of trigger time, what an 8 h shift allows once hoses, cutters and repositioning are counted.'; }
    var rate = t.rate / passes, per = rate * trig, days = per > 0 ? area / per : 0;
    o.big.innerHTML = n1(days) + '<small>operator-days</small>';
    o.per.textContent = n0(per) + ' m²';
    o.trig.textContent = TRG.fmt(trig).replace('not reached in 8 h', '8 h');
    o.lim.textContent = TRG.fmt(eav) + ' / ' + TRG.fmt(elv);
    o.rate.textContent = t.rateTxt + (passes === 2 ? ', halved for two passes' : '');
    o.air.textContent = t.air;
    o.note.innerHTML = '<strong>' + t.n + ', ' + a + ' m/s².</strong> ' + why + ' SepcoTech arithmetic on Trelawny\'s declared figures, for planning. It is not a risk assessment, and it assumes this is the operator\'s only vibrating tool that day.';
  }
  root.addEventListener('input', render); root.addEventListener('change', render);
  render();
})();

/* ---- MARPOL Annex V wash-water check (cargo-hold-cleaning-between-cargoes) ---- */
(function () {
  var root = document.querySelector('[data-g-tool="marpol"]');
  if (!root) return;
  var out = root.querySelector('.g-verdict');
  function val(n) { var r = root.querySelector('input[name="' + n + '"]:checked'); return r ? r.value : ''; }
  var V = {
    unknown: ['stop', 'Check the cargo declaration first', 'It states whether the residue is classed HME, harmful to the marine environment. That one answer decides whether you can wash on passage at all, so settle it before the hose comes out.'],
    hme: ['stop', 'Hold the water for a port reception facility', 'HME residues go to a reception facility, wherever the ship is. Recover as much as you can dry first: it is water you then do not have to hold.'],
    special: ['stop', 'Plan to hold the water, and check your procedures', 'Special areas, which include the Baltic and the North Sea, are far narrower than the 12 nm rule. Under normal circumstances, plan for retention and a reception facility, and confirm against your operator\'s own procedures.'],
    agents: ['stop', 'The cleaning agent decides it', 'Wash water with cleaning agents or additives may go over the side only if they are not HME either, with evidence on board, usually a statement from the supplier. Without that evidence, hold the water.'],
    ok: ['go', 'Discharge en route, 12 nm or more from land', 'Outside special areas, with non-HME residues, wash water may be discharged only while the ship is en route, as far from land as practicable and never less than 12 nautical miles from the nearest land or ice shelf.']
  };
  function render() {
    var h = val('gm-hme'), w = val('gm-where'), c = val('gm-agent'), k;
    if (!h || h === 'unknown') k = 'unknown'; else if (h === 'yes') k = 'hme';
    else if (w === 'special') k = 'special'; else if (c === 'noproof') k = 'agents'; else k = 'ok';
    var v = V[k];
    out.className = 'g-verdict ' + v[0];
    out.innerHTML = '<h3>' + v[1] + '</h3><p>' + v[2] + '</p>';
  }
  root.addEventListener('change', render); render();
})();

/* ---- ATEX marking decoder (hot-work-permit-zone-1-descaling) ---- */
(function () {
  var root = document.querySelector('[data-g-tool="exmark"]');
  if (!root) return;
  var out = root.querySelector('.g-mark-out'), btns = root.querySelectorAll('button[data-k]');
  var D = {
    II: ['II: equipment group', 'Surface industries, not mining.'],
    c2: ['2: equipment category', 'Category 2 is Gas Zone 1 and Dust Zone 21, where an explosive atmosphere is likely in normal operation, roughly 10 to 1000 hours a year. Category 2 equipment also covers the less demanding Zones 2 and 22.'],
    G: ['G / D: gas or dust', 'Separate certification for gas and for dust. Both matter, and plenty of equipment carries only one. Trelawny\'s Ex tools carry both lines.'],
    h: ['Ex h: protection type', 'The protection type for non-electrical equipment under ISO 80079-36 and -37. Older literature shows "c", constructional safety, under the withdrawn EN 13463-5. Same family, current marking.'],
    IIC: ['IIC / IIIC: gas and dust group', 'IIC is the demanding end of the gas groups, covering hydrogen and acetylene. IIIC is conductive dust, including metal dust. IIC does not mean acetylene-safe, see below.'],
    T4: ['T4 / T135°C: temperature class', 'Maximum surface temperature 135 °C.'],
    Gb: ['Gb / Db: equipment protection level', 'Protection level "high".']
  };
  function show(b) {
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', btns[i] === b ? 'true' : 'false');
    var d = D[b.getAttribute('data-k')];
    out.innerHTML = '<b>' + d[0] + '</b><p>' + d[1] + '</p>';
  }
  for (var i = 0; i < btns.length; i++) btns[i].addEventListener('click', function () { show(this); });
  show(btns[1]);
})();

/* ---- dust collector selector (dust-control-lead-paint) ---- */
(function () {
  var root = document.querySelector('[data-g-tool="dust"]');
  if (!root) return;
  var out = root.querySelector('.g-verdict');
  function val(n) { var r = root.querySelector('input[name="' + n + '"]:checked'); return r ? r.value : ''; }
  var V = {
    hz: ['go', 'KAV30 Dry Type H, pneumatic and ATEX', '303.10KAV30/DH. ATEX Gas Zone 1 / Dust Zone 21, 110 m³/h. Plan about 39 cfm of free air per operator station, about 90% of it for the collector. Fit a shroud to the scaler and use beryllium-copper needles.'],
    hn: ['go', 'A Type H electric collector', 'KV30 Dry Type H (303.22KV30/2DH) moves 295 m³/h, nearly three times the ATEX machine. It is Trelawny\'s range; we confirm availability and lead time on the quote. The A22 and A45 are Class M and do not cover leaded dust.'],
    nz: ['go', 'KAV30, pneumatic and ATEX', 'Category 2 for Gas Zone 1 and Dust Zone 21, with an earth-path continuity certificate. It moves 110 m³/h, so use it only where the space needs ATEX.'],
    nn: ['go', 'An electric collector: A22 or A45', 'For open, unclassified work on non-leaded coatings. Both are Class M machines. If the coating could be leaded, test it or treat it as leaded.']
  };
  function render() {
    var l = val('gx-lead'), z = val('gx-zone');
    var v = V[(l === 'no' ? 'n' : 'h') + (z === 'yes' ? 'z' : 'n')];
    out.className = 'g-verdict ' + v[0];
    out.innerHTML = '<h3>' + v[1] + '</h3><p>' + v[2] + '</p>';
  }
  root.addEventListener('change', render); render();
})();

/* ---- guides hub: filter cards by the job ---- */
(function () {
  var bar = document.querySelector('[data-g-filter]');
  if (!bar) return;
  var cards = document.querySelectorAll('[data-g-topics]'), btns = bar.querySelectorAll('button[data-t]'), live = document.getElementById('g-filter-status');
  bar.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button[data-t]') : null;
    if (!b) return;
    var t = b.getAttribute('data-t'), shown = 0;
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', btns[i] === b ? 'true' : 'false');
    for (var j = 0; j < cards.length; j++) {
      var on = !t || (' ' + cards[j].getAttribute('data-g-topics') + ' ').indexOf(' ' + t + ' ') > -1;
      cards[j].classList.toggle('hidden', !on); if (on) shown++;
    }
    if (live) live.textContent = shown + (shown === 1 ? ' guide' : ' guides') + ' shown';
  });
})();

/* ---- vibration comparison: draw the assessed figure as a bar beside the number ---- */
(function () {
  var tb = document.querySelector('table[data-g-vbars] tbody');
  if (!tb) return;
  var rows = tb.querySelectorAll('tr'), max = 45;
  for (var i = 0; i < rows.length; i++) {
    var a = parseFloat(rows[i].getAttribute('data-a')), c = rows[i].children[4];
    if (!c || isNaN(a)) continue;
    var cls = a <= 2.5 ? 'ok' : (a <= 5 ? 'mid' : 'bad');
    c.innerHTML = '<span class="g-bar ' + cls + '" style="--v:' + Math.min(1, a / max).toFixed(3) + '"><i aria-hidden="true"></i><b>' + c.innerHTML + '</b></span>';
  }
})();
