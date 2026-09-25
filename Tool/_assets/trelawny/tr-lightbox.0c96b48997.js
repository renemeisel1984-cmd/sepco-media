/* __LIGHTBOX__ - product quick-view, Trelawny (Tools).
   Ported from the QYSEA/CHASING superset engine; the differences are the
   quote key, the .ns-card adapter, and the two capabilities that card
   shape needs (`clone` and `mirrorSel`).
   ---------------------------------------------------------------------------
   Same contract as the Blue Robotics engine and a strict SUPERSET of it: the
   .prod-card adapter is carried unchanged, so if the two are ever merged this
   file is the one that survives.

   Two ways in, and the page decides which without editing this file:

   1. CURATED REGISTRY - optional. A photo carries data-lb="key" and a hidden
      <article class="lb-item" data-lb="key"> holds the panel:

        <img ... data-lb="q-camera">
        <div class="lb-data" hidden>
          <article class="lb-item" data-lb="q-camera"
                   data-large="images/..." data-large2="..." data-alt="...">
            <p class="lb-role">Cameras</p>
            <h3>Q-Camera</h3>
            <p class="lb-desc">...</p>
            <ul class="lb-specs"><li><b>100 m</b><span>depth rated</span></li></ul>
            <p class="lb-tip"><b>Tip</b> ...</p>
            <div class="lb-sku" data-pn="..." data-price="..." data-name="..."></div>
            <a class="lb-more" href="/qysea/accessories">Full specs -&gt;</a>
          </article>
        </div>

   2. AUTO MODE - what actually runs here. The QYSEA and CHASING pages already
      carry the product name, description and compatibility on the card, and
      __QB_PREFILL__ has already given most of those cards an Add to Quote.
      Hand-writing a registry entry per card would duplicate all of it and
      drift, so a card with no registry entry is read straight off the page
      through an ADAPTER that names where each piece lives.

   Adding the lightbox to a page with one of the known card shapes is therefore
   HTML-only. A new card shape is one row in ADAPTERS.

   A photo with neither a registry entry nor a recognised card is LEFT ALONE -
   that is how the heroes, the .ms-media editorial shots and the category tiles
   (whose click must navigate) stay untouched.

   Quote list: writes localStorage + a synthetic StorageEvent, which is what
   __QB_PREFILL__ already listens for. Where the card has its own quote button
   the dialog PROXIES it, so there is only ever one piece of quote logic. Where
   it has none, the dialog writes the item itself using __QB_PREFILL__'s own id
   scheme (slug of the name), so the same product reached from the card, the
   dialog or another page is one quote line, never two.

   Progressive enhancement: with JS off the photos stay photos and any registry
   stays hidden markup a crawler still reads. Nothing is authored twice.

   Paste INSIDE the page's existing last script block. A new script tag renders
   as an empty white frame in a Squarespace Code Block. */
(function () {
  'use strict';

  if (document.documentElement.classList.contains('lb-js')) return;

  /* Trelawny keeps its own quote list; quote-builder.js owns it and binds a
     DELEGATED listener on .tr-add, so the dialog never writes it directly -
     it proxies the card's own button and one piece of quote logic survives. */
  var QKEY = 'sepcotech_trelawny_quote_v1';

  /* -------------------------------------------------------------------------
     ADAPTERS - where each card shape keeps its parts.

       sel     the card
       img     the photo inside it that becomes the trigger
       name    headline           desc    one paragraph of body copy
       role    eyebrow found INSIDE the card
       roleUp  eyebrow found on an ANCESTOR (a category or section heading);
               the first ancestor that can answer wins
       chips   compatibility pills, cloned onto the panel
       list    an "in the box" list, cloned onto the panel
       btn     the card's own quote button, proxied when present
       borrow  controls MOVED into the dialog and returned on close
       quote   synthesise a quote button when the card has no btn
     ---------------------------------------------------------------------- */
  var ADAPTERS = [
    /* Trelawny catalogue card (tr-catalog-engine.js and needle-scalers' inline
       twin). The cards are BUILT BY SCRIPT, so this engine must run after the
       renderer - it is loaded last on the page, which is enough: both render
       synchronously at parse time.

       The dropdown is mirrored rather than borrowed, and .ns-pn / .ns-codes are
       cloned, because the page's own change handler resolves the card with
       sel.closest('.ns-card') and would see null if the select moved. */
    { sel: '.ns-card', img: '.ns-thumb img', name: 'h3,h4', desc: '.ns-one',
      rolePrev: '.ns-subhead', roleStop: '.ns-group', roleUp: '.ns-ghead .section-label',
      descUp: '.ns-ghead .section-sub',
      mirrorSel: 'select.ns-model', clone: ['.ns-pn', '.ns-codes'],
      btn: '.tr-add, .tr-add-mini' },

    /* Blue Robotics catalogue card - carried so this file is a superset */
    { sel: '.prod-card', img: '.prod-img img', name: '.prod-name', desc: '.prod-desc',
      role: '.prod-badge', borrow: ['.brv-pick', '.prod-price', '.brv-sku'],
      btn: '.prod-enquire' },

    /* QYSEA + CHASING accessory card (both accessories pages) */
    { sel: '.acc-card', img: '.acc-thumb img', name: '.acc-body h4', desc: '.acc-body p',
      roleUp: '.cat-hd h3, .cat-title h3',
      chips: '.acc-compat > *, .compat-row > *',
      btn: '.qbp-add', quote: true },

    /* FIFISH X1 NDT payload tool */
    { sel: '.ndt-tool', img: '.nt-img img', name: 'h4', desc: '.nt-body p',
      roleUp: '.sec-hd .lbl', btn: '.qbp-add', quote: true },

    /* factory package card ("Choose Your Package") */
    { sel: '#packages .feat-card-lt', img: 'img', name: 'h4', desc: 'p',
      role: '.tag', list: '.checks li', btn: '.qbp-add', quote: true }
  ];

  /* ---------------- shared quote list ---------------- */
  function readList() {
    try { return JSON.parse(localStorage.getItem(QKEY)) || []; } catch (e) { return []; }
  }
  function writeList(a) {
    try {
      localStorage.setItem(QKEY, JSON.stringify(a));
      window.dispatchEvent(new StorageEvent('storage', { key: QKEY }));
    } catch (e) {}
  }
  function inList(id) {
    return readList().some(function (i) { return i.id === id; });
  }
  /* __QB_PREFILL__'s own id scheme, so one product is one line wherever it is
     added from. Keep in step with slug() in that snippet. */
  function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '').slice(0, 60);
  }
  function addToQuote(id, name, price) {
    var list = readList(), found = null;
    list.forEach(function (i) { if (i.id === id) found = i; });
    if (found) found.qty = (found.qty || 1) + 1;
    else list.push({ id: id, name: name, price: price || '', qty: 1 });
    writeList(list);
  }
  function dropFromQuote(id) {
    writeList(readList().filter(function (i) { return i.id !== id; }));
  }

  /* ---------------- small helpers ---------------- */
  function txt(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }
  function one(root, sel) { return sel ? root.querySelector(sel) : null; }
  function all(root, sel) {
    return sel ? Array.prototype.slice.call(root.querySelectorAll(sel)) : [];
  }
  /* the nearest ancestor that can answer `sel` - how a card finds the heading
     of the category block it sits in without the block being named per page */
  /* A heading carries a count badge (".ns-ct") that belongs on the page, not
     in a role chip - "Vibro-Lo Scalers 12 models - 4 quick-pick cards" reads as
     nonsense above a product name. Clone, drop the badge, then take the text. */
  function headTxt(el) {
    if (!el) return '';
    var c = el.cloneNode(true);
    all(c, '.ns-ct').forEach(function (n) { n.remove(); });
    return txt(c);
  }
  /* the subhead that introduces THIS grid: walk up, and at each level look back
     through the previous siblings. Searching an ancestor's descendants instead
     would return the first subhead in the block ("Accessories & Spares") for a
     card that actually sits under "Consumables". */
  /* stop: never look back past this ancestor. Without it a main-product card in
     the SECOND range found the previous range's ".ns-subhead" ("Couplings,
     Adapters & Spares") and wore it as its eyebrow. */
  function prevFrom(card, sel, stop) {
    if (!sel) return null;
    var p = card;
    while (p && p.nodeType === 1 && p !== document.body) {
      if (stop && p.matches && p.matches(stop)) break;
      var s = p.previousElementSibling;
      while (s) {
        if (s.matches && s.matches(sel)) return s;
        var deep = s.querySelector && s.querySelector(sel);
        if (deep) return deep;
        s = s.previousElementSibling;
      }
      p = p.parentNode;
    }
    return null;
  }

  function upFrom(card, sel) {
    if (!sel) return null;
    var p = card.parentNode;
    while (p && p.nodeType === 1 && p !== document.body) {
      var hit = p.querySelector(sel);
      if (hit) return hit;
      p = p.parentNode;
    }
    return null;
  }

  /* ---------------- index any curated registry ---------------- */
  var reg = document.querySelector('.lb-data');
  var items = {};
  all(reg || document.createDocumentFragment(), '.lb-item[data-lb]').forEach(function (a) {
    /* the key comes off the DOM already entity-decoded on both sides, so
       plain slugs only: an entity-spelled key matches only some of the time */
    items[a.getAttribute('data-lb')] = a;
  });

  /* ---------------- the dialog, built once ---------------- */
  var back = document.createElement('div');
  back.className = 'lb-back';
  back.hidden = true;
  back.innerHTML =
    '<div class="lb-modal" role="dialog" aria-modal="true" aria-labelledby="lb-title">' +
      '<button type="button" class="lb-close" aria-label="Close">&times;</button>' +
      '<div class="lb-media"><div class="lb-big"></div><div class="lb-thumbs"></div></div>' +
      '<div class="lb-info"></div>' +
    '</div>';
  document.body.appendChild(back);

  var modal  = back.querySelector('.lb-modal'),
      bigBox = back.querySelector('.lb-big'),
      thumbs = back.querySelector('.lb-thumbs'),
      info   = back.querySelector('.lb-info'),
      closeB = back.querySelector('.lb-close'),
      opener = null;

  function paintPhotos(srcs, alt) {
    bigBox.innerHTML = '';
    thumbs.innerHTML = '';
    var big = document.createElement('img');
    /* Showing a small picture at 1:1 is honest; blowing it up to fill the
       frame just publishes a blurry one. */
    var cap = function () {
      big.style.maxWidth = big.naturalWidth && big.naturalWidth < 700
        ? 'min(100%, ' + big.naturalWidth + 'px)' : '';
    };
    big.addEventListener('load', cap);
    big.src = srcs[0];
    big.alt = alt;
    if (big.complete) cap();
    bigBox.appendChild(big);
    if (srcs.length < 2) return;
    srcs.forEach(function (s, i) {
      var t = document.createElement('button');
      t.type = 'button';
      t.className = 'lb-thumb';
      t.setAttribute('aria-current', i === 0 ? 'true' : 'false');
      t.setAttribute('aria-label', 'View ' + (i + 1) + ' of ' + srcs.length);
      t.innerHTML = '<img src="' + s + '" alt="">';
      t.addEventListener('click', function () {
        big.src = s;
        Array.prototype.forEach.call(thumbs.children, function (o) {
          o.setAttribute('aria-current', o === t ? 'true' : 'false');
        });
      });
      thumbs.appendChild(t);
    });
  }

  /* photo list for either mode: whatever the element declares, else the
     picture already on the page */
  function photosOf(el, photo) {
    var srcs = [];
    ['data-large', 'data-large2', 'data-large3', 'data-large4'].forEach(function (a) {
      if (el && el.getAttribute(a)) srcs.push(el.getAttribute(a));
    });
    if (photo) {
      ['data-large', 'data-large2', 'data-large3', 'data-large4'].forEach(function (a) {
        var v = photo.getAttribute(a);
        if (v && srcs.indexOf(v) < 0) srcs.push(v);
      });
      if (!srcs.length) srcs.push(photo.currentSrc || photo.src);
    }
    return srcs;
  }

  function show() {
    /* a teardown still pending from the last close would blank this panel
       200ms from now - cancel it before painting */
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    back.hidden = false;
    document.body.classList.add('lb-open');
    /* one frame later so the opacity transition actually runs */
    requestAnimationFrame(function () { back.classList.add('on'); });
    closeB.focus();
  }

  /* ---------------- curated mode ---------------- */
  function open(key, from, photo) {
    var art = items[key];
    if (!art) return;
    opener = from || null;
    returnAll();

    paintPhotos(photosOf(art, photo), art.getAttribute('data-alt') || (photo && photo.alt) || '');

    /* the registry entry IS the panel - cloned, never re-authored */
    info.innerHTML = '';
    var copy = art.cloneNode(true);
    copy.removeAttribute('data-lb');
    var h = copy.querySelector('h3');
    if (h) h.id = 'lb-title';

    /* everything from the SKU row down sits in a footer pinned to the bottom */
    var foot = document.createElement('div');
    foot.className = 'lb-foot';
    var sku = copy.querySelector('.lb-sku'), more = copy.querySelector('.lb-more');
    if (sku) { foot.appendChild(sku); foot.appendChild(buildAdd(sku)); }
    if (more) foot.appendChild(more);
    /* snapshot first: appendChild MOVES the node out of the live collection,
       so iterating .children directly silently drops every other child */
    Array.prototype.slice.call(copy.children).forEach(function (n) { info.appendChild(n); });
    if (foot.children.length) info.appendChild(foot);

    show();
  }

  function buildAdd(sku) {
    var id    = 'sku-' + sku.getAttribute('data-pn'),
        name  = sku.getAttribute('data-name'),
        price = '€' + Number(sku.getAttribute('data-price')).toLocaleString('en-GB'),
        btn   = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lb-add';
    /* fill the SKU row from the data, so a price is never typed twice */
    if (!sku.children.length) {
      sku.innerHTML =
        '<span class="lb-sku-t"><b>' + name + '</b><span>' + sku.getAttribute('data-pn') + '</span></span>' +
        '<span class="lb-sku-p">' + price + '</span>';
    }
    function paint() {
      var on = inList(id);
      btn.textContent = on ? '✓ In your quote - add another' : '+ Add to Quote';
      btn.classList.toggle('done', on);
    }
    btn.addEventListener('click', function () { addToQuote(id, name, price); paint(); });
    paint();
    return btn;
  }

  /* ---------------- auto mode: the product card IS the panel ---------------- */
  /* Borrowed nodes are MOVED from the card, not copied - a copy of a <select>
     would drift from the card's own selection and a copy of a wired button
     would run a second, unwired Add to Quote. Each leaves a placeholder behind
     so close() can put it back exactly where it was. */
  var borrowed = [];

  function borrow(node) {
    if (!node) return null;
    var slot = document.createComment('lb-slot');
    node.parentNode.insertBefore(slot, node);
    borrowed.push({ node: node, slot: slot });
    return node;
  }
  function returnAll() {
    borrowed.forEach(function (b) {
      if (b.slot.parentNode) b.slot.parentNode.replaceChild(b.node, b.slot);
    });
    borrowed = [];
  }

  function openCard(card, ad, from, photo) {
    opener = from || null;
    returnAll();                       /* never hold two cards' controls at once */

    paintPhotos(photosOf(card, photo), (photo && photo.alt) || '');

    info.innerHTML = '';
    var nameEl = one(card, ad.name),
        name   = txt(nameEl) || 'Product',
        role   = headTxt(one(card, ad.role)) ||
                 headTxt(prevFrom(card, ad.rolePrev, ad.roleStop)) ||
                 headTxt(upFrom(card, ad.roleUp));
    /* an eyebrow that just repeats the product name is noise */
    if (role && role.toLowerCase() === name.toLowerCase()) role = '';

    if (role) {
      var r = document.createElement('p');
      r.className = 'lb-role';
      r.textContent = role;
      info.appendChild(r);
    }
    var h3 = document.createElement('h3');
    h3.id = 'lb-title';
    h3.textContent = name;
    info.appendChild(h3);

    var descEl = one(card, ad.desc) || upFrom(card, ad.descUp);
    if (descEl && descEl !== nameEl) {
      var p = document.createElement('p');
      p.className = 'lb-desc';
      p.textContent = txt(descEl);
      info.appendChild(p);
    }

    /* inert card text (part number, IMPA codes) repeated in the panel, and
       re-read whenever the model changes */
    var metaBox = document.createElement('div');
    metaBox.className = 'lb-metabox';
    function syncMeta() {
      metaBox.innerHTML = '';
      (ad.clone || []).forEach(function (s) {
        var n = one(card, s);
        if (!n || !txt(n)) return;
        var d = document.createElement('p');
        d.className = 'lb-meta';
        d.innerHTML = n.innerHTML;
        metaBox.appendChild(d);
      });
    }

    /* The model dropdown is CLONED, never borrowed. The page's change handler
       does sel.closest('.ns-card'), which returns null the moment the real
       select sits inside the dialog - the same .closest() trap the quote
       buttons have. The clone drives the real one, so the card stays the
       single source of truth for the selection, the part number and the
       Add-to-Quote payload. */
    var realSel = one(card, ad.mirrorSel);
    if (realSel) {
      var pick = realSel.cloneNode(true);
      pick.className = 'lb-pick';
      pick.removeAttribute('id');
      pick.removeAttribute('aria-label');
      pick.setAttribute('aria-label', 'Choose a model');
      pick.value = realSel.value;
      pick.addEventListener('change', function () {
        realSel.value = pick.value;
        realSel.dispatchEvent(new Event('change', { bubbles: true }));
        /* the card has now re-rendered its own PN, codes, button and photo */
        var im2 = one(card, ad.img);
        if (im2) paintPhotos(photosOf(card, im2), im2.alt || '');
        syncMeta();
        if (info._mirror) info._mirror();
      });
      info.appendChild(pick);
    }
    syncMeta();
    if (metaBox.children.length || realSel) info.appendChild(metaBox);

    /* an "in the box" list the card already carries */
    var li = all(card, ad.list);
    if (li.length) {
      var ul = document.createElement('ul');
      ul.className = 'lb-list';
      li.forEach(function (n) {
        var x = document.createElement('li');
        x.textContent = txt(n);
        ul.appendChild(x);
      });
      info.appendChild(ul);
    }

    /* compatibility pills, cloned (not borrowed - they are inert markup and
       the card should keep showing them behind the dialog) */
    var chips = all(card, ad.chips);
    if (chips.length) {
      var box = document.createElement('div');
      box.className = 'lb-compat';
      box.innerHTML = '<span class="lb-compat-lab">Compatible with</span>';
      var row = document.createElement('div');
      row.className = 'lb-chips';
      chips.forEach(function (c) { row.appendChild(c.cloneNode(true)); });
      box.appendChild(row);
      info.appendChild(box);
    }

    var foot = document.createElement('div');
    foot.className = 'lb-foot lb-borrowed';

    /* controls whose STATE lives in the node itself are borrowed */
    (ad.borrow || []).forEach(function (sel) {
      var n = one(card, sel);
      if (n) foot.appendChild(borrow(n));
    });

    /* The card's own quote button is PROXIED, not moved. Its handler may
       resolve the card with .closest(), which returns null once the button
       sits inside the dialog. A proxy has no state of its own - it clicks the
       real button where it stands and then shows whatever label it now
       carries. Read lazily: __QB_PREFILL__ injects its button after this
       engine has already wired the photos. */
    var real = one(card, ad.btn);
    if (real) {
      var proxy = document.createElement('button');
      proxy.type = 'button';
      proxy.className = 'lb-add';
      var mirror = function () { proxy.textContent = txt(real) || 'Add to Quote'; };
      proxy.addEventListener('click', function () {
        real.click();
        setTimeout(mirror, 0);
      });
      mirror();
      foot.appendChild(proxy);
      info._mirror = mirror;
    } else if (ad.quote) {
      /* no button on the card: write the item ourselves, with the id
         __QB_PREFILL__ would have used, and toggle the way its buttons do */
      var id = slug(name);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lb-add';
      var paint = function () {
        var on = inList(id);
        btn.textContent = on ? '✓ In your quote' : 'Add to Quote';
        btn.classList.toggle('done', on);
      };
      btn.addEventListener('click', function () {
        if (inList(id)) dropFromQuote(id); else addToQuote(id, name, '');
        paint();
      });
      paint();
      foot.appendChild(btn);
      info._sync = paint;
    }
    if (foot.children.length) info.appendChild(foot);

    show();
  }

  var closeTimer = null;
  function close() {
    back.classList.remove('on');
    document.body.classList.remove('lb-open');
    closeTimer = setTimeout(function () {
      closeTimer = null;
      back.hidden = true;
      /* put the card's controls back only once the dialog is out of sight,
         so the customer never sees them jump */
      returnAll();
      info._mirror = null;
      info._sync = null;
      info.innerHTML = '';
    }, 200);
    if (opener && opener.focus) opener.focus();
    opener = null;
  }

  closeB.addEventListener('click', close);
  back.addEventListener('click', function (e) { if (e.target === back) close(); });
  document.addEventListener('keydown', function (e) {
    if (back.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    /* keep the tab ring inside the dialog while it is open */
    var f = modal.querySelectorAll('button, a[href], select, [tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------------- wire the photos ---------------- */
  var wired = 0;

  /* boxes the page already gives a photo - promote these instead of wrapping.
     .acc-thumb and .nt-img in particular are fixed-size flex boxes whose img
     is sized height:100%, and slipping a span between the two collapses the
     picture. */
  var OWNBOX = '.acc-thumb, .nt-img, .prod-img, .ms-media, .cs-hero-img, .cat-card-img, .acc-photo-box, .ns-thumb';

  function wire(im, label, run) {
    var shot = im.parentNode;
    if (shot.matches && shot.matches(OWNBOX)) {
      shot.classList.add('lb-shot', 'lb-own');
    } else if (!shot.classList.contains('lb-shot')) {
      var w = document.createElement('span');
      w.className = 'lb-shot';
      /* the card spaces the photo with a margin ON THE IMAGE; move it to the
         wrapper or the hover ring hangs below the picture by that much */
      var mb = getComputedStyle(im).marginBottom;
      if (mb && mb !== '0px') { w.style.marginBottom = mb; im.style.marginBottom = '0'; }
      shot.insertBefore(w, im);
      w.appendChild(im);
      shot = w;
    }
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lb-btn';
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-label', 'Quick view: ' + label);
    btn.addEventListener('click', function (ev) {
      /* a card that is itself a link must not navigate as well */
      ev.preventDefault();
      ev.stopPropagation();
      /* the BUTTON is what focus returns to on close, not the image */
      run(btn, im);
    });
    shot.appendChild(btn);
    wired++;
  }

  /* 1. photos with a curated registry entry */
  all(document, 'img[data-lb]').forEach(function (im) {
    var key = im.getAttribute('data-lb');
    if (!items[key]) return;                       /* a photo with no entry stays a photo */
    wire(im, im.alt || key, function (btn, photo) { open(key, btn, photo); });
  });

  /* 2. auto mode - every recognised card that has a picture and a name */
  ADAPTERS.forEach(function (ad) {
    all(document, ad.sel).forEach(function (card) {
      /* a card wrapped in a link is navigation: the category tiles and the
         range cards stand for a whole page, and their click must go there */
      if (card.closest('a')) return;
      var im = one(card, ad.img);
      if (!im || im.hasAttribute('data-lb') || im.closest('.lb-shot')) return;
      /* a photo-less placeholder: no src, kept in the layout by the renderer */
      if (!im.getAttribute('src') || im.style.visibility === 'hidden') return;
      var nm = one(card, ad.name);
      if (!nm || !txt(nm)) return;
      wire(im, txt(nm), function (btn, photo) { openCard(card, ad, btn, photo); });
    });
  });

  if (!wired) return;

  document.documentElement.classList.add('lb-js');

  /* keep the button honest if the customer changes the list elsewhere */
  window.addEventListener('storage', function (e) {
    if (e.key !== QKEY || back.hidden) return;
    if (info._mirror) { info._mirror(); return; }   /* proxy: re-read the card's button */
    if (info._sync) { info._sync(); return; }       /* synthesised button */
    var b = info.querySelector('.lb-add'), sku = info.querySelector('.lb-sku');
    if (!b || !sku) return;
    var on = inList('sku-' + sku.getAttribute('data-pn'));
    b.textContent = on ? '✓ In your quote - add another' : '+ Add to Quote';
    b.classList.toggle('done', on);
  });
})();
