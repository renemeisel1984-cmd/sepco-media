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
    if (m >= 480) return 'ikke nået på 8 t';
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
    sf11: { n: 'SF11 rustbanker til skibsdæk', rate: 30, rateTxt: 'op til 30 m²/h (Trelawnys angivne værdi)', a: 5.76, aK: 8.06, air: '100 cfm fri luft ved 90 psi, pr. maskine (manual)', passes: false },
    tfp: { n: 'TFP200, med ledning, trykluft eller batteri', rate: 25, rateTxt: '25 m²/h ved 3 mm pr. arbejdsgang (gennemsnit fra datablad)', a: 4.4, air: 'Trykluftmodel: 165 cfm (78 l/s). Net- og batterimodeller: ingen luft', passes: true },
    tfpp: { n: 'TFP200, benzin', rate: 25, rateTxt: '25 m²/h ved 3 mm pr. arbejdsgang (gennemsnit fra datablad)', a: 6.9, air: 'Ingen luft (benzinmotor)', passes: true },
    ppt: { n: 'PPT 4\u0022 trykluft, C-flapper', rate: 4, rateTxt: '4 m²/h, den lave ende af Trelawnys 4-5 m²/h på plant stål', a: 3.1, air: '30 cfm (840 l/min)', passes: false },
    tri: { n: 'Trident Neptune', rate: 5, rateTxt: '5 m²/h (Trelawnys gennemsnit)', a: 8.7, air: 'Trykluftmodel: 68 cfm (32.1 l/s). Elektriske modeller: ingen luft', passes: false }
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
  function n1(x) { return (Math.round(x * 10) / 10).toLocaleString('da-DK'); }
  function n0(x) { return Math.round(x).toLocaleString('da-DK'); }
  function render() {
    var t = TOOLS[f.tool.value] || TOOLS.sf11;
    f.pwrap.hidden = !t.passes; f.kwrap.hidden = !t.aK;
    var a = (t.aK && f.k.checked) ? t.aK : t.a;
    var passes = (t.passes && f.passes.value === '2') ? 2 : 1;
    var area = Math.max(0, parseFloat(f.area.value) || 0);
    var eav = TRG.hours(a, 2.5), elv = TRG.hours(a, 5.0), b = basis(), trig, why;
    if (b === 'eav') { trig = Math.min(eav, SHIFT); why = eav > SHIFT ? 'Aktionsværdien (' + TRG.fmt(eav) + ') ligger ud over, hvad en vagt rummer, så der regnes med ca. 5 t.' : 'Holdt under aktionsværdien (' + TRG.fmt(eav) + ').'; }
    else if (b === 'elv') { trig = Math.min(elv, 8); why = elv >= 8 ? 'Grænseværdien nås ikke på 8 t, så der regnes med hele 8 t: sådan arbejder ingen.' : 'Kørt op til grænseværdien (' + TRG.fmt(elv) + '), hvilket kræver kontrolforanstaltninger og sundhedsovervågning.'; }
    else { trig = Math.min(elv, SHIFT); why = elv < SHIFT ? 'Begrænset af grænseværdien (' + TRG.fmt(elv) + '), før de 5 t en vagt giver mulighed for.' : 'Begrænset til ca. 5 t brugstid, hvad en vagt på 8 t giver plads til, når slanger, fræsere og omplacering er regnet med.'; }
    var rate = t.rate / passes, per = rate * trig, days = per > 0 ? area / per : 0;
    o.big.innerHTML = n1(days) + '<small>operatørdage</small>';
    o.per.textContent = n0(per) + ' m²';
    o.trig.textContent = TRG.fmt(trig).replace('ikke nået på 8 t', '8 t');
    o.lim.textContent = TRG.fmt(eav) + ' / ' + TRG.fmt(elv);
    o.rate.textContent = t.rateTxt + (passes === 2 ? ', halveret ved to arbejdsgange' : '');
    o.air.textContent = t.air;
    o.note.innerHTML = '<strong>' + t.n + ', ' + a + ' m/s².</strong> ' + why + ' SepcoTech-regnestykke ud fra Trelawnys deklarerede tal, til planlægning. Det er ikke en risikovurdering, og det forudsætter, at dette er operatørens eneste vibrerende værktøj den dag.';
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
    unknown: ['stop', 'Tjek lastdeklarationen først', 'Den angiver, om resten er klassificeret som HME, skadelig for havmiljøet. Dette ene svar afgør, om du overhovedet må vaske undervejs, så afklar det, før slangen tages frem.'],
    hme: ['stop', 'Opbevar vandet til en modtagefacilitet i havn', 'HME-rester afleveres til en modtagefacilitet, uanset hvor skibet er. Opsaml så meget som muligt tørt først: det er vand, du så ikke skal opbevare.'],
    special: ['stop', 'Planlæg at opbevare vandet, og tjek dine procedurer', 'Særlige områder, som omfatter Østersøen og Nordsøen, er langt snævrere end 12 sm-reglen. Under normale omstændigheder skal du planlægge opbevaring og en modtagefacilitet og bekræfte det mod din operatørs egne procedurer.'],
    agents: ['stop', 'Rengøringsmidlet afgør det', 'Vaskevand med rengøringsmidler eller tilsætningsstoffer må kun ledes overbord, hvis de heller ikke er HME, med dokumentation om bord, normalt en erklæring fra leverandøren. Uden den dokumentation skal vandet opbevares.'],
    ok: ['go', 'Udledning undervejs, 12 sm eller mere fra land', 'Uden for særlige områder og med rester, der ikke er HME, må vaskevand kun udledes, mens skibet er undervejs, så langt fra land som muligt og aldrig mindre end 12 sømil fra nærmeste land eller iskant.']
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
    II: ['II: udstyrsgruppe', 'Overfladeindustrier, ikke minedrift.'],
    c2: ['2: udstyrskategori', 'Kategori 2 er gaszone 1 og støvzone 21, hvor en eksplosionsfarlig atmosfære er sandsynlig under normal drift, omkring 10 til 1000 timer om året. Udstyr i kategori 2 dækker også de mindre krævende zoner 2 og 22.'],
    G: ['G / D: gas eller støv', 'Separat certificering for gas og for støv. Begge dele tæller, og mange udstyrstyper har kun den ene. Trelawnys Ex-værktøj har begge linjer.'],
    h: ['Ex h: beskyttelsestype', 'Beskyttelsestypen for ikke-elektrisk udstyr efter ISO 80079-36 og -37. Ældre litteratur viser \u0022c\u0022, konstruktiv sikkerhed, efter den tilbagetrukne EN 13463-5. Samme familie, gældende mærkning.'],
    IIC: ['IIC / IIIC: gas- og støvgruppe', 'IIC er den mest krævende ende af gasgrupperne og dækker brint og acetylen. IIIC er ledende støv, herunder metalstøv. IIC betyder ikke, at udstyret er sikkert til acetylen, se nedenfor.'],
    T4: ['T4 / T135°C: temperaturklasse', 'Maksimal overfladetemperatur 135 °C.'],
    Gb: ['Gb / Db: udstyrets beskyttelsesniveau', 'Beskyttelsesniveau \u0022højt\u0022.']
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
    hz: ['go', 'KAV30 tør type H, pneumatisk og ATEX', '303.10KAV30/DH. ATEX gaszone 1 / støvzone 21, 110 m³/h. Regn med omkring 39 cfm fri luft pr. operatørplads, omkring 90% af det til støvsugeren. Monter en udsugningshætte på nålehammeren, og brug nåle i berylliumkobber.'],
    hn: ['go', 'En elektrisk type H-støvsuger', 'KV30 tør type H (303.22KV30/2DH) flytter 295 m³/h, næsten tre gange så meget som ATEX-maskinen. Den hører til Trelawnys program; tilgængelighed og leveringsbetingelser fremgår af tilbuddet. A22 og A45 er støvklasse M og dækker ikke blyholdigt støv.'],
    nz: ['go', 'KAV30, pneumatisk og ATEX', 'Kategori 2 til gaszone 1 og støvzone 21, med certifikat for kontinuitet i jordforbindelsen. Den flytter 110 m³/h, så brug den kun, hvor rummet kræver ATEX.'],
    nn: ['go', 'En elektrisk støvsuger: A22 eller A45', 'Til åbent, uklassificeret arbejde på blyfrie belægninger. Begge er maskiner i støvklasse M. Hvis belægningen kan være blyholdig, skal den testes eller behandles som blyholdig.']
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
    if (live) live.textContent = shown + (shown === 1 ? ' guide' : ' guider') + ' vist';
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
