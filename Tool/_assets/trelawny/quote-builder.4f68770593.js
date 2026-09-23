/* ============================================================
   SEPCOTECH × TRELAWNY  -  QUOTE BUILDER ENGINE
   ------------------------------------------------------------
   Cross-page cart that lets a customer add tools + consumables
   across any category page and submit them as ONE quote request.

   HOW TO TRIGGER AN ADD (no inline JS needed):
   Add the class "tr-add" (or "tr-add-mini" for consumables) to a
   button and supply data attributes:

     <button class="tr-add"
             data-id="VL203"
             data-name="VL203 Low-Vibration Needle Scaler"
             data-type="tool"
             data-cat="Needle Scalers"
             data-impa="">Add to Quote</button>

   data-type = "tool" | "consumable"   (controls the icon only)
   data-cat  = category label shown in the quote (optional)
   data-impa = IMPA code if known (optional, included in the email)

   The cart persists in localStorage under one key, so items added
   on the Needle Scalers page are still there on the Dust Control
   page and in the final quote form.
   ============================================================ */
(function () {
  'use strict';
  var KEY = 'sepcotech_trelawny_quote_v1';

  /* ---------- storage ---------- */
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function save(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
    render();
  }

  /* ---------- mutations ---------- */
  function add(item) {
    var items = load();
    var ex = items.filter(function (i) { return i.id === item.id; })[0];
    if (ex) { ex.qty += 1; }
    else { items.push({ id: item.id, name: item.name, type: item.type || 'tool', cat: item.cat || '', impa: item.impa || '', qty: 1 }); }
    save(items);
    toast(item.name + ' added to your quote');
  }
  function remove(id) {
    save(load().filter(function (i) { return i.id !== id; }));
  }
  function setQty(id, delta) {
    var items = load();
    items.forEach(function (i) { if (i.id === id) { i.qty = Math.max(1, i.qty + delta); } });
    save(items);
  }
  function clear() { save([]); }

  /* ---------- DOM refs (built on init) ---------- */
  var fab, drawer, overlay, body, foot, formItemsBox, hiddenField, toastEl, navBadge;

  function totalCount() {
    return load().reduce(function (s, i) { return s + i.qty; }, 0);
  }

  /* ---------- rendering ---------- */
  function render() {
    var items = load();
    var count = totalCount();

    /* FAB badge */
    if (fab) {
      fab.classList.toggle('empty', count === 0);
      var c = fab.querySelector('.qb-fab-count');
      if (c) c.textContent = count;
    }

    /* Nav "Request a Quote" badge (synced count, visible before scrolling) */
    if (navBadge) {
      navBadge.textContent = count;
      navBadge.classList.toggle('empty', count === 0);
    }

    /* Drawer list */
    if (body) {
      if (!items.length) {
        body.innerHTML =
          '<div class="qb-empty"><div class="qb-empty-icon">🧰</div>' +
          '<p>Your quote list is empty.<br>Browse the tool ranges and press <strong>"Add to Quote"</strong> on any tool or consumable.</p></div>';
      } else {
        body.innerHTML = items.map(function (i) {
          var icon = i.type === 'consumable' ? '🔩' : '🛠️';
          var meta = [i.cat, i.impa ? 'IMPA ' + i.impa : ''].filter(Boolean).join(' · ');
          return '<div class="qb-item">' +
            '<div class="qb-item-icon ' + (i.type === 'consumable' ? 'consumable' : '') + '">' + icon + '</div>' +
            '<div class="qb-item-info"><b>' + esc(i.name) + '</b>' +
            (meta ? '<div class="qb-item-meta">' + esc(meta) + '</div>' : '') +
            '<div class="qb-qty">' +
            '<button data-dec="' + esc(i.id) + '" aria-label="Decrease">−</button>' +
            '<span>' + i.qty + '</span>' +
            '<button data-inc="' + esc(i.id) + '" aria-label="Increase">+</button>' +
            '</div>' +
            '<button class="qb-item-remove" data-rm="' + esc(i.id) + '">Remove</button>' +
            '</div></div>';
        }).join('');
      }
    }

    /* Drawer footer summary */
    if (foot) {
      foot.querySelector('.qb-line-count').textContent = items.length + (items.length === 1 ? ' line' : ' lines');
      foot.querySelector('.qb-unit-count').textContent = count + (count === 1 ? ' item' : ' items');
    }

    /* Quote form item preview (only present on pages with the form) */
    if (formItemsBox) {
      if (!items.length) {
        formItemsBox.innerHTML = '<div class="qb-form-empty">No tools selected yet - add items from any range, then they appear here automatically.</div>';
      } else {
        formItemsBox.innerHTML =
          '<div class="qb-form-items-head"><span>Selected items</span><span>' + count + ' total</span></div>' +
          items.map(function (i) {
            return '<div class="qb-form-item">' +
              '<span class="qb-fi-name"><strong>' + esc(i.name) + '</strong>' +
              (i.cat ? ' <span style="color:#83838d">- ' + esc(i.cat) + '</span>' : '') + '</span>' +
              '<span class="qb-fi-ctrl">' +
                '<span class="qb-fi-qty">' +
                  '<button type="button" data-dec="' + esc(i.id) + '" aria-label="Decrease quantity">−</button>' +
                  '<span>' + i.qty + '</span>' +
                  '<button type="button" data-inc="' + esc(i.id) + '" aria-label="Increase quantity">+</button>' +
                '</span>' +
                '<button type="button" class="qb-fi-rm" data-rm="' + esc(i.id) + '" aria-label="Remove ' + esc(i.name) + '">×</button>' +
              '</span></div>';
          }).join('');
      }
    }

    /* Hidden Web3Forms field - structured plain-text list */
    if (hiddenField) hiddenField.value = buildList(items);
  }

  function buildList(items) {
    if (!items.length) return 'No items selected.';
    var lines = items.map(function (i, n) {
      return (n + 1) + '. ' + i.name +
        (i.cat ? '  [' + i.cat + ']' : '') +
        (i.impa ? '  (IMPA ' + i.impa + ')' : '') +
        '  - Qty: ' + i.qty;
    });
    return 'REQUESTED ITEMS (' + totalCount() + ' total):\n' + lines.join('\n');
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- drawer open/close ---------- */
  function openDrawer() { if (drawer) { drawer.classList.add('open'); overlay.classList.add('open'); } }
  function closeDrawer() { if (drawer) { drawer.classList.remove('open'); overlay.classList.remove('open'); } }

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = '✓ ' + msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }

  /* ---------- build the floating UI once ---------- */
  function buildUI() {
    /* FAB */
    fab = document.createElement('button');
    fab.className = 'qb-fab empty';
    fab.setAttribute('aria-label', 'Open quote list');
    fab.innerHTML = '🧰 <span>My Quote</span> <span class="qb-fab-count">0</span>';
    fab.addEventListener('click', openDrawer);

    /* Overlay */
    overlay = document.createElement('div');
    overlay.className = 'qb-overlay';
    overlay.addEventListener('click', closeDrawer);

    /* Drawer */
    drawer = document.createElement('aside');
    drawer.className = 'qb-drawer';
    drawer.setAttribute('aria-label', 'Quote list');
    drawer.innerHTML =
      '<div class="qb-drawer-head" style="justify-content:space-between"><h3>🧰 Your Quote List</h3>' +
      '<button class="qb-close" aria-label="Close">×</button></div>' +
      '<div class="qb-drawer-body"></div>' +
      '<div class="qb-drawer-foot">' +
      '<div class="qb-summary"><span class="qb-line-count">0 lines</span><span class="qb-unit-count">0 items</span></div>' +
      '<a href="#quote" class="btn btn-primary btn-block qb-go">Request Quote for These Items →</a>' +
      '<button class="qb-clear">Clear list</button>' +
      '</div>';

    /* Toast */
    toastEl = document.createElement('div');
    toastEl.className = 'qb-toast';

    /* Nav badge - appended to the "Request a Quote" nav button on every page,
       so the running count is visible even before scrolling into the catalog.
       Clicking still follows the nav-cta's #quote anchor. */
    var cta = document.querySelector('.sd-side .nav-cta');
    if (cta) {
      navBadge = document.createElement('span');
      navBadge.className = 'qb-nav-badge empty';
      navBadge.setAttribute('aria-hidden', 'true');
      cta.appendChild(navBadge);
    }

    document.body.appendChild(fab);
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
    document.body.appendChild(toastEl);

    body = drawer.querySelector('.qb-drawer-body');
    foot = drawer.querySelector('.qb-drawer-foot');

    drawer.querySelector('.qb-close').addEventListener('click', closeDrawer);
    drawer.querySelector('.qb-clear').addEventListener('click', function () {
      if (confirm('Remove all items from your quote list?')) clear();
    });
    drawer.querySelector('.qb-go').addEventListener('click', function (e) {
      var target = document.getElementById('quote');
      closeDrawer();
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
      /* if no #quote on this page, the href falls through to navigate */
    });

    /* delegated qty / remove inside drawer */
    body.addEventListener('click', function (e) {
      var t = e.target;
      if (t.dataset.inc) setQty(t.dataset.inc, +1);
      else if (t.dataset.dec) setQty(t.dataset.dec, -1);
      else if (t.dataset.rm) remove(t.dataset.rm);
    });
  }

  /* ---------- delegated "Add to Quote" buttons ---------- */
  function bindAddButtons() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.tr-add, .tr-add-mini');
      if (!btn) return;
      e.preventDefault();
      add({
        id: btn.dataset.id,
        name: btn.dataset.name,
        type: btn.dataset.type || 'tool',
        cat: btn.dataset.cat || '',
        impa: btn.dataset.impa || ''
      });
      /* brief visual confirm on the button itself */
      var original = btn.textContent;
      btn.classList.add('added');
      btn.textContent = '✓ Added';
      setTimeout(function () { btn.classList.remove('added'); btn.textContent = original; }, 1400);
    });
  }

  /* ---------- quote form wiring ---------- */
  /* "How ordering works" strip, shown above the quote form on every page.
     Copy is intentionally generic (no invented lead times or ports). Phone is the SepcoTech line. */
  function injectOrderStrip(form) {
    var wrap = form.closest('.tr-form-wrap');
    var anchor = wrap || form;
    if (!anchor.parentNode || anchor.parentNode.querySelector('.ns-order')) return;
    /* per-page copy: set window.TR_ORDER = { item:'deck scalers' } for a tailored step 1,
       or { steps:[{t,d},{t,d},{t,d}] } to fully override. Falls back to generic. */
    var cfg = window.TR_ORDER || (window.TR_CONFIG && window.TR_CONFIG.order) || {};
    var item = cfg.item || 'tools';
    var steps = cfg.steps || [
      { t: 'Build your list', d: 'Add the ' + item + ', spares and consumables you need - they collect into one quote.' },
      { t: 'We quote fast', d: 'Send it over and we reply with pricing and availability - typically within one business day.' },
      { t: 'We ship to your port', d: 'Tell us the vessel and delivery port and we arrange dispatch, mixed orders welcome.' }
    ];
    /* No phone line: the site carries no phone numbers (house content rule). */
    var el = document.createElement('div');
    el.className = 'ns-order';
    el.innerHTML =
      '<div class="ns-order-steps">' +
        steps.map(function (s, i) {
          return '<div class="ns-order-step"><span class="ns-order-n">' + (i + 1) + '</span><b>' + esc(s.t) + '</b><span>' + esc(s.d) + '</span></div>';
        }).join('') +
      '</div>';
    anchor.parentNode.insertBefore(el, anchor);
    /* the strip's default styling assumes a dark quote section; on a light section
       (e.g. the index page) switch text to dark so it stays readable */
    if (sectionLuminance(anchor.parentNode) > 140) el.className += ' ns-order-light';
  }

  /* luminance of the nearest ancestor with a non-transparent background (255 = assume light) */
  function sectionLuminance(node) {
    while (node && node.nodeType === 1) {
      var bg = getComputedStyle(node).backgroundColor || '';
      var m = bg.match(/^rgba?\(([\d.,\s]+)\)/);
      if (m) {
        var p = m[1].split(',').map(function (x) { return parseFloat(x); });
        var a = p.length > 3 ? p[3] : 1;
        if (a > 0.1) return 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2];
      }
      node = node.parentElement;
    }
    return 255;
  }

  function bindForm() {
    var form = document.getElementById('qb-quote-form');
    if (!form) return;
    /* "How ordering works" strip removed at RM's request (23 Sep 2026); injectOrderStrip kept unused */
    formItemsBox = document.getElementById('qb-form-items');
    hiddenField = form.querySelector('input[name="selected_products"]');

    /* let buyers edit quantities / remove items straight from the form preview
       (buttons are type="button" so they never submit the form) */
    if (formItemsBox) {
      formItemsBox.addEventListener('click', function (e) {
        var t = e.target.closest('button');
        if (!t) return;
        if (t.dataset.inc) setQty(t.dataset.inc, +1);
        else if (t.dataset.dec) setQty(t.dataset.dec, -1);
        else if (t.dataset.rm) remove(t.dataset.rm);
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      /* fold the item list into the message body too, so it is unmissable in the email */
      var msgField = form.querySelector('textarea[name="message"]');
      var list = buildList(load());
      var fd = new FormData(form);
      if (msgField) {
        fd.set('message', (msgField.value ? msgField.value + '\n\n' : '') + '----------\n' + list);
      }
      var btn = form.querySelector('[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd })
        .then(function (r) { return r.json(); })
        .then(function (json) {
          if (json.success) {
            var wrap = form.closest('.tr-form-wrap') || form.parentElement;
            var ok = document.getElementById('qb-success');
            form.style.display = 'none';
            if (ok) ok.style.display = 'block';
            clear();
          } else {
            if (btn) { btn.disabled = false; btn.textContent = 'Send Quote Request →'; }
            alert('Something went wrong - please try again or email us directly.');
          }
        })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.textContent = 'Send Quote Request →'; }
          alert('Something went wrong - please try again or email us directly.');
        });
    });
  }

  /* ---------- init ---------- */
  function init() {
    buildUI();
    bindAddButtons();
    bindForm();
    render();
    /* keep in sync if the user has two tabs open */
    window.addEventListener('storage', function (e) { if (e.key === KEY) render(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* ============================================================
   NAV OVERFLOW  -  "More ▾" dropdown
   ------------------------------------------------------------
   The top category bar (.tr-nav-cats) holds 13+ links. On narrow
   viewports they used to be clipped / hidden behind a scrollbar.
   This measures the bar and moves whatever doesn't fit into a
   "More ▾" dropdown at the end, re-running on resize. The link for
   the current page is always kept visible in the bar.
   Progressive enhancement: if this never runs, the original
   overflow-x:auto scroll behaviour still works.
   ============================================================ */
(function () {
  'use strict';

  function initNav() {
    var cats = document.querySelector('.tr-nav-cats');
    if (!cats) return;

    var anchors = Array.prototype.slice.call(cats.querySelectorAll('.tr-nav-cat'));
    if (anchors.length < 2) return;

    /* let the dropdown escape the bar's clip and stop the scroll fallback */
    cats.style.overflow = 'visible';

    /* build the More control once */
    var wrap = document.createElement('div');
    wrap.className = 'tr-nav-more';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tr-nav-more-btn';
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = 'More <span class="tr-nav-more-caret" aria-hidden="true">▾</span>';
    var menu = document.createElement('div');
    menu.className = 'tr-nav-more-menu';
    wrap.appendChild(btn);
    wrap.appendChild(menu);
    cats.appendChild(wrap);

    var active = anchors.filter(function (a) { return a.classList.contains('active'); })[0];

    function insertInOrder(parent, a, boundary) {
      var idx = anchors.indexOf(a);
      var ref = boundary || null;
      for (var i = 0; i < anchors.length; i++) {
        var b = anchors[i];
        if (anchors.indexOf(b) > idx && b.parentNode === parent && b !== boundary) { ref = b; break; }
      }
      parent.insertBefore(a, ref);
    }

    function fits() { return cats.scrollWidth <= cats.clientWidth + 1; }

    function layout() {
      /* 1. reset: all anchors back in the bar (original order), menu empty */
      anchors.forEach(function (a) { cats.insertBefore(a, wrap); });
      menu.innerHTML = '';
      wrap.style.display = 'none';
      wrap.classList.remove('show-as-active');

      /* 2. everything fits? no More needed */
      if (fits()) return;

      /* 3. reveal More, then push trailing items into the menu until it fits */
      wrap.style.display = '';
      for (var i = anchors.length - 1; i >= 0 && !fits(); i--) {
        if (anchors[i] === active) continue; /* keep current page visible */
        menu.insertBefore(anchors[i], menu.firstChild);
      }

      /* 4. if the active link itself was pushed off earlier passes, pull it back
            and drop the last remaining visible item instead */
      if (active && menu.contains(active)) {
        insertInOrder(cats, active, wrap);
        while (!fits()) {
          var vis = anchors.filter(function (a) { return a.parentNode === cats && a !== active; });
          if (!vis.length) break;
          menu.insertBefore(vis[vis.length - 1], menu.firstChild);
        }
      }

      /* keep the menu contents in original category order */
      anchors.forEach(function (a) { if (a.parentNode === menu) menu.appendChild(a); });

      /* mark More as active when it hides the current page */
      if (active && menu.contains(active)) wrap.classList.add('show-as-active');
    }

    /* open / close */
    function close() { wrap.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = wrap.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    /* run now + on resize (debounced) */
    var t;
    function schedule() { clearTimeout(t); t = setTimeout(layout, 120); }
    layout();
    window.addEventListener('resize', schedule);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initNav);
  else initNav();
})();
