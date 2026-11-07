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
    if (m >= 480) return 'nås ikke på 8 t';
    if (m < 60) return m + ' min';
    return Math.floor(m / 60) + ' t' + (m % 60 ? ' ' + (m % 60 < 10 ? '0' : '') + (m % 60) + ' min' : '');
  }
  return { hours: hours, fmt: fmt };
})();

/* ---- deck output planner (deck-descaling-production-rate) ---- */
(function () {
  var root = document.querySelector('[data-g-tool="deck"]');
  if (!root) return;
  var TOOLS = {
    sf11: { n: 'SF11 rustbankemaskin for dekk', rate: 30, rateTxt: 'opptil 30 m²/t (TRELAWNYs oppgitte verdi)', a: 5.76, aK: 8.06, air: '100 cfm fri luft ved 90 psi, per maskin (bruksanvisningen)', passes: false },
    tfp: { n: 'TFP200, ledning, trykkluft eller batteri', rate: 25, rateTxt: '25 m²/t ved 3 mm per arbeidsgang (gjennomsnitt etter databladet)', a: 4.4, air: 'Trykkluftmodell: 165 cfm (78 l/s). Nett- og batterimodeller: ingen trykkluft', passes: true },
    tfpp: { n: 'TFP200, bensin', rate: 25, rateTxt: '25 m²/t ved 3 mm per arbeidsgang (gjennomsnitt etter databladet)', a: 6.9, air: 'Ingen trykkluft (bensinmotor)', passes: true },
    ppt: { n: 'PPT 4\u0022 trykkluft, C-flaps', rate: 4, rateTxt: 'ca. 4 m²/t, nedre del av TRELAWNYs 4–5 m²/t på flatt stål', a: 3.1, air: '30 cfm (840 l/min)', passes: false },
    tri: { n: 'Trident Neptune', rate: 5, rateTxt: '5 m²/t (TRELAWNYs gjennomsnitt)', a: 8.7, air: 'Trykkluftmodell: 68 cfm (32,1 l/s). Elektriske modeller: ingen trykkluft', passes: false }
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
  function n1(x) { return (Math.round(x * 10) / 10).toLocaleString('nb-NO'); }
  function n0(x) { return Math.round(x).toLocaleString('nb-NO'); }
  function render() {
    var t = TOOLS[f.tool.value] || TOOLS.sf11;
    f.pwrap.hidden = !t.passes; f.kwrap.hidden = !t.aK;
    var a = (t.aK && f.k.checked) ? t.aK : t.a;
    var passes = (t.passes && f.passes.value === '2') ? 2 : 1;
    var area = Math.max(0, parseFloat(f.area.value) || 0);
    var eav = TRG.hours(a, 2.5), elv = TRG.hours(a, 5.0), b = basis(), trig, why;
    if (b === 'eav') { trig = Math.min(eav, SHIFT); why = eav > SHIFT ? 'Tiltaksverdien (' + TRG.fmt(eav) + ') ligger utenfor det et skift rommer, så omtrent 5 t regnes med.' : 'Holdes under tiltaksverdien (' + TRG.fmt(eav) + ').'; }
    else if (b === 'elv') { trig = Math.min(elv, 8); why = elv >= 8 ? 'Grenseverdien nås ikke på 8 t, så hele 8 t regnes med, selv om ingen jobber så lenge i praksis.' : 'Kjøres opp til grenseverdien (' + TRG.fmt(elv) + '), noe som krever tiltak og helseovervåking.'; }
    else { trig = Math.min(elv, SHIFT); why = elv < SHIFT ? 'Begrenset av grenseverdien (' + TRG.fmt(elv) + '), før de 5 t et skift tillater.' : 'Begrenset til omtrent 5 t brukstid, det et 8-timers skift rommer når slanger, fresere og omplassering regnes med.'; }
    var rate = t.rate / passes, per = rate * trig, days = per > 0 ? area / per : 0;
    o.big.innerHTML = n1(days) + '<small>operatørdager</small>';
    o.per.textContent = n0(per) + ' m²';
    o.trig.textContent = TRG.fmt(trig).replace('nås ikke på 8 t', '8 t');
    o.lim.textContent = TRG.fmt(eav) + ' / ' + TRG.fmt(elv);
    o.rate.textContent = t.rateTxt + (passes === 2 ? ', halvert ved to arbeidsganger' : '');
    o.air.textContent = t.air;
    o.note.innerHTML = '<strong>' + t.n + ', ' + String(a).replace('.', ',') + ' m/s².</strong> ' + why + ' SepcoTechs regnestykke ut fra TRELAWNYs deklarerte verdier, for planlegging. Det er ikke en risikovurdering, og det forutsetter at dette er operatørens eneste vibrerende verktøy den dagen.';
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
    unknown: ['stop', 'Sjekk lastdeklarasjonen først', 'Den viser om lasterestene er klassifisert som HME, skadelige for det marine miljøet. Det svaret avgjør om du i det hele tatt kan spyle under fart, så få det avklart før slangen tas frem.'],
    hme: ['stop', 'Behold vannet for et mottaksanlegg i havn', 'HME-rester skal til et mottaksanlegg, uansett hvor skipet er. Ta opp mest mulig tørt først: da blir det mindre vann å holde tilbake.'],
    special: ['stop', 'Planlegg å beholde vannet, og sjekk rutinene dine', 'Spesielle områder, som omfatter Østersjøen og Nordsjøen, har langt strengere vilkår enn regelen om 12 nautiske mil. Planlegg i utgangspunktet for å holde vannet tilbake og levere det til et mottaksanlegg, og avstem mot rederiets egne rutiner.'],
    agents: ['stop', 'Rengjøringsmiddelet avgjør', 'Vaskevann med rengjøringsmidler eller tilsetninger kan slippes ut bare hvis heller ikke de er HME, med dokumentasjon om bord, vanligvis en erklæring fra leverandøren. Uten slik dokumentasjon skal vannet holdes tilbake.'],
    ok: ['go', 'Slipp ut under fart, 12 nautiske mil eller mer fra land', 'Utenfor spesielle områder og med rester som ikke er HME kan vaskevann slippes ut bare mens skipet er under fart, så langt fra land som mulig og aldri nærmere enn 12 nautiske mil fra nærmeste land eller isbrem.']
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
    II: ['II: utstyrsgruppe', 'Alle virksomheter unntatt gruver.'],
    c2: ['2: utstyrskategori', 'Kategori 2 gjelder gassone 1 og støvsone 21, der en eksplosiv atmosfære sannsynligvis oppstår ved normal drift, omtrent 10 til 1 000 timer i året. Utstyr i kategori 2 dekker også de mindre krevende sonene 2 og 22.'],
    G: ['G / D: gass eller støv', 'Egen sertifisering for gass og for støv. Begge er viktige, og mye utstyr har bare én av dem. TRELAWNYs Ex-verktøy har begge linjene.'],
    h: ['Ex h: beskyttelsestype', 'Beskyttelsestypen for ikke-elektrisk utstyr etter ISO 80079-36 og -37. Eldre litteratur viser \u0022c\u0022, konstruktiv sikkerhet, etter den tilbaketrukne EN 13463-5. Samme familie, gjeldende merking.'],
    IIC: ['IIC / IIIC: gass- og støvgruppe', 'IIC er den mest krevende enden av gassgruppene og omfatter hydrogen og acetylen. IIIC er ledende støv, inkludert metallstøv. IIC betyr ikke at noe er sikkert for acetylen, se nedenfor.'],
    T4: ['T4 / T135°C: temperaturklasse', 'Høyeste overflatetemperatur 135 °C.'],
    Gb: ['Gb / Db: beskyttelsesnivå for utstyr', 'Beskyttelsesnivå \u0022høy\u0022.']
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
    hz: ['go', 'KAV30 tørr type H, trykkluftdrevet og ATEX', '303.10KAV30/DH. ATEX gassone 1 og støvsone 21, 110 m³/t. Regn med omtrent 39 cfm fri luft per arbeidsplass, hvorav omtrent 90 % går til støvsugeren. Monter en avsugshette på nålepikken og bruk nåler av berylliumkobber.'],
    hn: ['go', 'En elektrisk støvsuger av type H', 'KV30 tørr type H (303.22KV30/2DH) flytter 295 m³/t, nesten tre ganger så mye som ATEX-maskinen. Den inngår i TRELAWNYs sortiment; vi bekrefter tilgjengelighet og leveringstid i tilbudet. A22 og A45 er klasse M og holder ikke for blyholdig støv.'],
    nz: ['go', 'KAV30, trykkluftdrevet og ATEX', 'Kategori 2 for gassone 1 og støvsone 21, med sertifikat for jordkontinuitet. Den flytter 110 m³/t, så bruk den bare der rommet krever ATEX.'],
    nn: ['go', 'En elektrisk støvsuger: A22 eller A45', 'For åpent, uklassifisert arbeid på belegg uten bly. Begge er maskiner i klasse M. Hvis belegget kan inneholde bly, test det eller behandle det som blyholdig.']
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
    if (live) live.textContent = shown + (shown === 1 ? ' guide' : ' guider') + ' vises';
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
