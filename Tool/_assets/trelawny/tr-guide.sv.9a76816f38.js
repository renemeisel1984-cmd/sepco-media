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
    if (m >= 480) return 'nås inte på 8 tim';
    if (m < 60) return m + ' min';
    return Math.floor(m / 60) + ' tim' + (m % 60 ? ' ' + (m % 60 < 10 ? '0' : '') + (m % 60) + ' min' : '');
  }
  return { hours: hours, fmt: fmt };
})();

/* ---- deck output planner (deck-descaling-production-rate) ---- */
(function () {
  var root = document.querySelector('[data-g-tool="deck"]');
  if (!root) return;
  var TOOLS = {
    sf11: { n: 'SF11 rosthammare för däck', rate: 30, rateTxt: 'upp till 30 m²/tim (TRELAWNYs angivna värde)', a: 5.76, aK: 8.06, air: '100 cfm fri luft vid 90 psi, per maskin (bruksanvisningen)', passes: false },
    tfp: { n: 'TFP200, sladd, tryckluft eller batteri', rate: 25, rateTxt: '25 m²/tim vid 3 mm per gång (medelvärde enligt databladet)', a: 4.4, air: 'Tryckluftsmodell: 165 cfm (78 l/s). Nät- och batterimodeller: ingen tryckluft', passes: true },
    tfpp: { n: 'TFP200, bensin', rate: 25, rateTxt: '25 m²/tim vid 3 mm per gång (medelvärde enligt databladet)', a: 6.9, air: 'Ingen tryckluft (bensinmotor)', passes: true },
    ppt: { n: 'PPT 4\u0022 tryckluft, C-flaps', rate: 4, rateTxt: 'ca 4 m²/tim, den nedre delen av TRELAWNYs 4-5 m²/tim på plant stål', a: 3.1, air: '30 cfm (840 l/min)', passes: false },
    tri: { n: 'Trident Neptune', rate: 5, rateTxt: '5 m²/tim (TRELAWNYs genomsnitt)', a: 8.7, air: 'Tryckluftsmodell: 68 cfm (32,1 l/s). Elmodeller: ingen tryckluft', passes: false }
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
  function n1(x) { return (Math.round(x * 10) / 10).toLocaleString('sv-SE'); }
  function n0(x) { return Math.round(x).toLocaleString('sv-SE'); }
  function render() {
    var t = TOOLS[f.tool.value] || TOOLS.sf11;
    f.pwrap.hidden = !t.passes; f.kwrap.hidden = !t.aK;
    var a = (t.aK && f.k.checked) ? t.aK : t.a;
    var passes = (t.passes && f.passes.value === '2') ? 2 : 1;
    var area = Math.max(0, parseFloat(f.area.value) || 0);
    var eav = TRG.hours(a, 2.5), elv = TRG.hours(a, 5.0), b = basis(), trig, why;
    if (b === 'eav') { trig = Math.min(eav, SHIFT); why = eav > SHIFT ? 'Insatsvärdet (' + TRG.fmt(eav) + ') ligger över vad ett skift rymmer, så ungefär 5 tim räknas.' : 'Hålls under insatsvärdet (' + TRG.fmt(eav) + ').'; }
    else if (b === 'elv') { trig = Math.min(elv, 8); why = elv >= 8 ? 'Gränsvärdet nås inte på 8 tim, så hela 8 tim räknas: ingen arbetar så.' : 'Körs upp till gränsvärdet (' + TRG.fmt(elv) + '), vilket kräver kontroller och hälsokontroll.'; }
    else { trig = Math.min(elv, SHIFT); why = elv < SHIFT ? 'Begränsat av gränsvärdet (' + TRG.fmt(elv) + '), före de 5 tim ett skift medger.' : 'Begränsat till ungefär 5 tim exponeringstid, det ett 8-timmarsskift rymmer när slangar, fräsar och omflyttning räknas in.'; }
    var rate = t.rate / passes, per = rate * trig, days = per > 0 ? area / per : 0;
    o.big.innerHTML = n1(days) + '<small>operatörsdagar</small>';
    o.per.textContent = n0(per) + ' m²';
    o.trig.textContent = TRG.fmt(trig).replace('nås inte på 8 tim', '8 tim');
    o.lim.textContent = TRG.fmt(eav) + ' / ' + TRG.fmt(elv);
    o.rate.textContent = t.rateTxt + (passes === 2 ? ', halverat vid två omgångar' : '');
    o.air.textContent = t.air;
    o.note.innerHTML = '<strong>' + t.n + ', ' + String(a).replace('.', ',') + ' m/s².</strong> ' + why + ' SepcoTech-beräkning på TRELAWNYs deklarerade värden, för planering. Det är inte en riskbedömning, och den förutsätter att detta är operatörens enda vibrerande verktyg den dagen.';
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
    unknown: ['stop', 'Kontrollera lastdeklarationen först', 'Där framgår om resten är klassad som HME, skadlig för den marina miljön. Det svaret avgör om du alls kan spola under gång, så reda ut det innan slangen tas fram.'],
    hme: ['stop', 'Behåll vattnet för en mottagningsanläggning i hamn', 'HME-rester går till en mottagningsanläggning, var fartyget än befinner sig. Ta upp så mycket du kan torrt först: det är vatten du då inte behöver ta hand om.'],
    special: ['stop', 'Planera för att behålla vattnet, och kontrollera dina rutiner', 'Särskilda områden, som omfattar Östersjön och Nordsjön, är mycket snävare än 12-sjömilsregeln. Under normala omständigheter bör du planera för kvarhållning och en mottagningsanläggning, och bekräfta mot redarens egna rutiner.'],
    agents: ['stop', 'Rengöringsmedlet avgör', 'Spolvatten med rengöringsmedel eller tillsatser får släppas överbord endast om de inte heller är HME, med underlag ombord, vanligen ett intyg från leverantören. Saknas underlaget ska vattnet behållas.'],
    ok: ['go', 'Släpp ut under gång, 12 sjömil eller mer från land', 'Utanför särskilda områden och med rester som inte är HME får spolvatten släppas ut endast medan fartyget är under gång, så långt från land som är praktiskt möjligt och aldrig närmare än 12 sjömil från närmaste land eller isbarriär.']
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
    II: ['II: utrustningsgrupp', 'Industrier ovan jord, inte gruvdrift.'],
    c2: ['2: utrustningskategori', 'Kategori 2 gäller gaszon 1 och dammzon 21, där en explosiv atmosfär sannolikt uppstår vid normal drift, ungefär 10 till 1 000 timmar per år. Utrustning i kategori 2 täcker också de mindre krävande zonerna 2 och 22.'],
    G: ['G / D: gas eller damm', 'Separat certifiering för gas och för damm. Båda är viktiga, och mycket utrustning har bara en av dem. TRELAWNYs Ex-verktyg har båda raderna.'],
    h: ['Ex h: skyddstyp', 'Skyddstypen för icke-elektrisk utrustning enligt ISO 80079-36 och -37. Äldre litteratur visar \u0022c\u0022, konstruktiv säkerhet, enligt den tillbakadragna EN 13463-5. Samma familj, aktuell märkning.'],
    IIC: ['IIC / IIIC: gas- och dammgrupp', 'IIC är den mest krävande änden av gasgrupperna och omfattar väte och acetylen. IIIC är ledande damm, inklusive metalldamm. IIC betyder inte att något är säkert för acetylen, se nedan.'],
    T4: ['T4 / T135°C: temperaturklass', 'Högsta yttemperatur 135 °C.'],
    Gb: ['Gb / Db: skyddsnivå för utrustning', 'Skyddsnivå \u0022hög\u0022.']
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
    hz: ['go', 'KAV30 torr typ H, tryckluftsdriven och ATEX', '303.10KAV30/DH. ATEX gaszon 1 / dammzon 21, 110 m³/tim. Räkna med ungefär 39 cfm fri luft per arbetsplats, varav omkring 90 % går till dammsugaren. Montera en huv på nålhammaren och använd nålar av berylliumkoppar.'],
    hn: ['go', 'En elektrisk dammsugare av typ H', 'KV30 torr typ H (303.22KV30/2DH) flyttar 295 m³/tim, nästan tre gånger så mycket som ATEX-maskinen. Den ingår i TRELAWNYs sortiment; vi bekräftar tillgång och leveranstid i offerten. A22 och A45 är klass M och täcker inte blyhaltigt damm.'],
    nz: ['go', 'KAV30, tryckluftsdriven och ATEX', 'Kategori 2 för gaszon 1 och dammzon 21, med intyg om kontinuitet i jordningsvägen. Den flyttar 110 m³/tim, så använd den bara där utrymmet kräver ATEX.'],
    nn: ['go', 'En elektrisk dammsugare: A22 eller A45', 'För öppet, oklassat arbete på beläggningar utan bly. Båda är maskiner i klass M. Om beläggningen kan innehålla bly, testa den eller behandla den som blyhaltig.']
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
    if (live) live.textContent = shown + (shown === 1 ? ' guide' : ' guider') + ' visas';
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
