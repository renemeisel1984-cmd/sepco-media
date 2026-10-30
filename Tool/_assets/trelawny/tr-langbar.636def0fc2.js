/* SepcoTech x Trelawny - language chooser, language bar and switcher memory (no redirect, no IP detection).
   Page sets  window.TR_LANGBAR = { on: 'en'|'da'|'sv'|'no', urls: { en: '<url>', da: '<url>', sv: '<url>', no: '<url>' } }  before loading this file
   (urls = the same page in each language = its hreflang alternates).
   1. LANGUAGE CHOOSER (every page): a compact button (globe + EN / DA / SV / NO) at the top right of the page content, in the breadcrumb strip under
      the site header. It opens a short list of the language names in their own language; the current one is marked; each option goes to the
      same page in that language. Button with aria-expanded; the list closes on Escape, on an outside click / tap and when focus leaves it.
      Picking a language remembers it and removes the suggestion bar. No redirect.
   2. SUGGESTION BAR (English pages only): if the browser language starts with "da" -> Danish, "sv" -> Swedish, "nb" / "nn" / "no" -> Norwegian,
      the visitor has not chosen yet, and that page exists in that language, show ONE small dismissible bar with a link to it. Dismissing it,
      or choosing any language (chooser, rail switcher, bar link), records the choice and the bar never shows again. localStorage is optional
      (every access is try/catch). Older pages set { on: 'en', href: '<Danish url>' }: still understood. */
(function () {
  var C = window.TR_LANGBAR;
  if (!C) return;
  var KEY = 'sepcotech_lang_pref';
  var TXT = {"da": {"bar": "Denne side findes p\u00e5 dansk", "close": "Luk", "link": "Dansk"}, "no": {"bar": "Denne siden finnes p\u00e5 norsk", "close": "Lukk", "link": "Norsk"}, "sv": {"bar": "Den h\u00e4r sidan finns p\u00e5 svenska", "close": "St\u00e4ng", "link": "Svenska"}};
  var NAMES = { en: 'English', da: 'Dansk', sv: 'Svenska', no: 'Norsk' };
  var CODES = { en: 'EN', da: 'DA', sv: 'SV', no: 'NO' };
  var LBL = { en: 'Language', da: 'Sprog', sv: 'Spr\u00e5k', no: 'Spr\u00e5k' };
  var ORDER = ['en', 'da', 'sv', 'no'];
  var barEl = null;
  var memPref = null;      /* storage blocked (Tracking Prevention, file://): the choice is kept for this page only */
  function get() { try { var v = localStorage.getItem(KEY); return v === null ? memPref : v; } catch (e) { return memPref; } }
  function set(v) { memPref = v; try { localStorage.setItem(KEY, v); } catch (e) {} }
  function pick() {
    var l = String(navigator.language || '').toLowerCase();
    if (l.indexOf('da') === 0) return 'da';
    if (l.indexOf('sv') === 0) return 'sv';
    if (l.indexOf('nb') === 0 || l.indexOf('nn') === 0 || l.indexOf('no') === 0) return 'no';
    return null;
  }
  function chosen(l) {            // a language was picked in the chooser: remember it, drop the suggestion bar
    set(l);
    if (barEl && barEl.parentNode) barEl.parentNode.removeChild(barEl);
    barEl = null;
  }
  function chooser(urls) {
    var cur = C.on || 'en';
    if (!NAMES[cur]) return;
    /* the page already carries the chooser as static HTML (<details>, works without this script): this script upgrades it, same place, same look */
    var stat = document.querySelector('.tr-langch-static');
    if (stat) { if (stat.parentNode) stat.parentNode.removeChild(stat); }
    else if (document.querySelector('.tr-langch')) return;
    var langs = ORDER.filter(function (l) { return l === cur || urls[l]; });
    if (langs.length < 2) return;
    var host = document.querySelector('.th-bc-in'), fb = false;
    if (!host) { host = document.querySelector('.sd-page'); fb = true; }
    if (!host) return;
    if (!document.getElementById('tr-langch-css')) {       /* the static page already has this style block */
      var st = document.createElement('style');
      st.id = 'tr-langch-css';
      st.textContent = ".tr-langch-host{position:relative;padding-right:84px;min-height:34px}.tr-langch-host.tr-langch-fbhost{padding-right:0;min-height:0}.tr-langch{position:absolute;right:0;top:50%;transform:translateY(-50%);z-index:300;font:600 13px/1.2 Inter,system-ui,-apple-system,Segoe UI,sans-serif;text-transform:none;letter-spacing:normal}.tr-langch.tr-langch-fb{right:16px;top:10px;transform:none}.tr-langch .tr-langch-btn{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 10px;margin:0;background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.4);border-radius:8px;font:inherit;font-weight:700;letter-spacing:.05em;cursor:pointer;-webkit-appearance:none;appearance:none;box-sizing:border-box}.tr-langch .tr-langch-btn:hover,.tr-langch .tr-langch-btn[aria-expanded=\"true\"],.tr-langch[open]>.tr-langch-btn{background:rgba(255,255,255,.18)}.tr-langch .tr-langch-btn:focus-visible{outline:2px solid #fff;outline-offset:2px}.tr-langch .tr-langch-btn svg{width:16px;height:16px;flex:none;display:block}.tr-langch summary.tr-langch-btn{list-style:none}.tr-langch summary.tr-langch-btn::-webkit-details-marker{display:none}.tr-langch summary.tr-langch-btn::marker{content:\"\"}.tr-langch-static{display:block}.tr-langch .tr-langch-menu{position:absolute;right:0;top:calc(100% + 8px);min-width:160px;margin:0;padding:6px;list-style:none;background:#fff;color:#1c1c22;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.3);border:1px solid rgba(0,0,0,.08)}.tr-langch .tr-langch-menu[hidden]{display:none}.tr-langch .tr-langch-menu li{margin:0;padding:0;list-style:none}.tr-langch .tr-langch-menu a{display:flex;align-items:center;justify-content:space-between;gap:14px;min-height:44px;padding:0 12px;border-radius:8px;color:#1c1c22;background:transparent;text-decoration:none;font-size:15px;font-weight:600;white-space:nowrap}.tr-langch .tr-langch-menu a:hover{background:#f0f0f4;color:#1c1c22}.tr-langch .tr-langch-menu a:focus-visible{outline:2px solid var(--tr-red,#cf2e2e);outline-offset:-2px}.tr-langch .tr-langch-menu a[aria-current=\"true\"]{font-weight:800}.tr-langch .tr-langch-tick{color:var(--tr-red,#cf2e2e);font-weight:800;visibility:hidden}.tr-langch .tr-langch-menu a[aria-current=\"true\"] .tr-langch-tick{visibility:visible}@media(max-width:620px){.tr-langch-host{padding-right:76px}.tr-langch .tr-langch-btn{padding:0 9px}}@media print{.tr-langch{display:none}}";
      document.head.appendChild(st);
    }
    var box = document.createElement('div');
    box.className = 'tr-langch' + (fb ? ' tr-langch-fb' : '');
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'tr-langch-btn'; btn.id = 'tr-langch-btn';
    btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'tr-langch-menu');
    btn.setAttribute('aria-label', LBL[cur] + ': ' + NAMES[cur]);
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'
      + '<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19"/><path d="M12 2.5c2.6 2.7 4 5.9 4 9.5s-1.4 6.8-4 9.5c-2.6-2.7-4-5.9-4-9.5s1.4-6.8 4-9.5z"/></svg>'
      + '<span class="tr-langch-code" aria-hidden="true">' + CODES[cur] + '</span>';
    var ul = document.createElement('ul');
    ul.className = 'tr-langch-menu'; ul.id = 'tr-langch-menu'; ul.hidden = true;
    langs.forEach(function (l) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = urls[l] || (location.pathname + location.search); a.setAttribute('hreflang', l); a.lang = l;
      a.appendChild(document.createTextNode(NAMES[l]));
      var tk = document.createElement('span'); tk.className = 'tr-langch-tick'; tk.setAttribute('aria-hidden', 'true'); tk.textContent = '\u2713';
      a.appendChild(tk);
      if (l === cur) a.setAttribute('aria-current', 'true');
      a.addEventListener('click', function () { chosen(l); });
      li.appendChild(a); ul.appendChild(li);
    });
    box.appendChild(btn); box.appendChild(ul);
    if (host.className.indexOf('tr-langch-host') < 0) host.className += ' tr-langch-host' + (fb ? ' tr-langch-fbhost' : '');
    host.appendChild(box);
    function links() { return [].slice.call(ul.querySelectorAll('a')); }
    function isOpen() { return !ul.hidden; }
    function open(focusFirst) {
      ul.hidden = false; btn.setAttribute('aria-expanded', 'true');
      if (focusFirst) { var cu = ul.querySelector('a[aria-current]') || links()[0]; if (cu) cu.focus(); }
    }
    function close(back) {
      if (!isOpen()) return;
      ul.hidden = true; btn.setAttribute('aria-expanded', 'false');
      if (back) btn.focus();
    }
    btn.addEventListener('click', function () { if (isOpen()) close(false); else open(false); });
    box.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k === 'Escape' || k === 'Esc') { if (isOpen()) { close(true); e.stopPropagation(); } return; }
      if (k === 'ArrowDown' || k === 'ArrowUp' || k === 'Home' || k === 'End') {
        var L = links(), i = L.indexOf(document.activeElement);
        if (!isOpen()) { if (k === 'ArrowDown' || k === 'ArrowUp') { e.preventDefault(); open(true); } return; }
        e.preventDefault();
        var n = k === 'Home' ? 0 : k === 'End' ? L.length - 1 : k === 'ArrowDown' ? (i + 1) % L.length : (i < 0 ? L.length - 1 : (i - 1 + L.length) % L.length);
        L[n].focus();
      }
    });
    document.addEventListener('click', function (e) { if (isOpen() && !box.contains(e.target)) close(false); });
    document.addEventListener('keydown', function (e) { if ((e.key === 'Escape' || e.key === 'Esc') && isOpen()) close(true); });
    box.addEventListener('focusout', function () {
      setTimeout(function () { if (isOpen() && !box.contains(document.activeElement)) close(false); }, 0);
    });
  }
  function wire() {
    var urls = C.urls || (C.href ? { da: C.href } : {});
    var sws = document.querySelectorAll('.tr-lang a[hreflang]');
    for (var i = 0; i < sws.length; i++) (function (a) {
      a.addEventListener('click', function () { set(a.getAttribute('hreflang')); });
    })(sws[i]);
    try { chooser(urls); } catch (e) {}
    if (C.on !== 'en' || get()) return;
    var want = pick();
    if (!want || !urls[want] || !TXT[want]) return;
    var t = TXT[want];
    var st = document.createElement('style');
    st.textContent = '.tr-langbar{position:fixed;left:16px;bottom:16px;z-index:2147483000;display:flex;align-items:center;gap:12px;max-width:calc(100vw - 32px);'
      + 'background:#1c1c22;color:#fff;border-radius:10px;padding:10px 12px 10px 16px;font:600 14px/1.3 Inter,system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.35)}'
      + '.tr-langbar a{color:#fff;background:var(--tr-red,#cf2e2e);border-radius:8px;padding:7px 14px;text-decoration:none;font-weight:700;white-space:nowrap}'
      + '.tr-langbar a:focus-visible,.tr-langbar button:focus-visible{outline:2px solid #fff;outline-offset:2px}'
      + '.tr-langbar button{background:none;border:0;color:#fff;font-size:22px;line-height:1;padding:4px 8px;cursor:pointer;border-radius:6px}';
    document.head.appendChild(st);
    var bar = document.createElement('div');
    bar.className = 'tr-langbar'; bar.lang = want; bar.setAttribute('role', 'region'); bar.setAttribute('aria-labelledby', 'tr-langbar-t');
    var s = document.createElement('span'); s.id = 'tr-langbar-t'; s.textContent = t.bar;
    var a = document.createElement('a'); a.href = urls[want]; a.setAttribute('hreflang', want); a.textContent = t.link;
    var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', t.close); b.textContent = '\u00d7';
    bar.appendChild(s); bar.appendChild(a); bar.appendChild(b);
    function close() { set('en'); if (bar.parentNode) bar.parentNode.removeChild(bar); barEl = null; }
    b.addEventListener('click', close);
    a.addEventListener('click', function () { set(want); });
    bar.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    document.body.appendChild(bar);
    barEl = bar;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire); else wire();
})();
