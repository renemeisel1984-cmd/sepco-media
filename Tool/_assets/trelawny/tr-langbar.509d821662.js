/* SepcoTech x Trelawny - language bar + switcher memory (no redirect, no IP detection).
   Page sets  window.TR_LANGBAR = { on: 'en'|'da', href: '<other-language URL>' }  before loading this file.
   English page: if the browser language starts with "da" and the visitor has not chosen yet, show a small
   dismissible bar with a link to the Danish page. Dismissing it, or clicking English on a Danish page,
   records "en" and the bar never shows again. localStorage is optional (every access is try/catch). */
(function () {
  var C = window.TR_LANGBAR;
  if (!C) return;
  var KEY = 'sepcotech_lang_pref';
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function wire() {
    var sw = document.querySelector('.tr-lang a[hreflang]');
    if (sw) sw.addEventListener('click', function () { set(sw.getAttribute('hreflang') === 'da' ? 'da' : 'en'); });
    if (C.on !== 'en' || !C.href || get()) return;
    if (String(navigator.language || '').toLowerCase().indexOf('da') !== 0) return;
    var st = document.createElement('style');
    st.textContent = '.tr-langbar{position:fixed;left:16px;bottom:16px;z-index:2147483000;display:flex;align-items:center;gap:12px;max-width:calc(100vw - 32px);'
      + 'background:#1c1c22;color:#fff;border-radius:10px;padding:10px 12px 10px 16px;font:600 14px/1.3 Inter,system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.35)}'
      + '.tr-langbar a{color:#fff;background:var(--tr-red,#cf2e2e);border-radius:8px;padding:7px 14px;text-decoration:none;font-weight:700;white-space:nowrap}'
      + '.tr-langbar a:focus-visible,.tr-langbar button:focus-visible{outline:2px solid #fff;outline-offset:2px}'
      + '.tr-langbar button{background:none;border:0;color:#fff;font-size:22px;line-height:1;padding:4px 8px;cursor:pointer;border-radius:6px}';
    document.head.appendChild(st);
    var bar = document.createElement('div');
    bar.className = 'tr-langbar'; bar.lang = 'da'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-labelledby', 'tr-langbar-t');
    bar.innerHTML = '<span id="tr-langbar-t">Denne side findes på dansk</span>'
      + '<a href="' + C.href + '" hreflang="da">Dansk</a>'
      + '<button type="button" aria-label="Luk">×</button>';
    function close() { set('en'); if (bar.parentNode) bar.parentNode.removeChild(bar); }
    bar.querySelector('button').addEventListener('click', close);
    bar.querySelector('a').addEventListener('click', function () { set('da'); });
    bar.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    document.body.appendChild(bar);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire); else wire();
})();
