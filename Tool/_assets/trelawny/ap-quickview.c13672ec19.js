/* All Products quick view: click a product name, get a pop-up with the photo, the part
   number, the IMPA code, a link to its range page and Add to Quote.

   Same dialog markup and classes as tr-lightbox.js (tr-lightbox.css styles it), so it
   looks identical to the quick view on the range pages. Everything in the panel is read
   off the row itself; the only other input is AP_PHOTOS (assets/ap-photos.js).

   - The name stays plain text in the served HTML (crawlable, and no JS = no change);
     this script upgrades each name cell into a button at run time.
   - Add to Quote is PROXIED: it clicks the row's own .tr-add-mini, so quote-builder.js
     writes exactly the line the row button writes, and the two can never disagree.
   - No photo on file for a part number = a single-column panel with no picture, never a
     stand-in from another product. */
(function () {
  'use strict';
  var body = document.getElementById('ap-body');
  if (!body) return;
  var PHOTOS = window.AP_PHOTOS || {};
  var BASE = 'https://cdn.jsdelivr.net/gh/renemeisel1984-cmd/sepco-media@main/Tool/trelawny-pages/media/Product%20pictures/';
  function pic(f) { return BASE + encodeURIComponent(f); }
  function txt(n) { return n ? n.textContent.replace(/\s+/g, ' ').trim() : ''; }

  /* ---- upgrade the name cells ---- */
  Array.prototype.forEach.call(body.querySelectorAll('tr[data-p]'), function (tr) {
    var td = tr.cells[0];
    if (!td || td.querySelector('.ap-qv')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ap-qv';
    b.setAttribute('aria-haspopup', 'dialog');
    b.textContent = txt(td);
    td.textContent = '';
    td.appendChild(b);
  });

  /* ---- the dialog, built once ---- */
  var back = document.createElement('div');
  back.className = 'lb-back';
  back.hidden = true;
  back.innerHTML =
    '<div class="lb-modal" role="dialog" aria-modal="true" aria-labelledby="ap-qv-title">' +
      '<button type="button" class="lb-close" aria-label="Close">&times;</button>' +
      '<div class="lb-media"><div class="lb-big"></div></div>' +
      '<div class="lb-info"></div>' +
    '</div>';
  document.body.appendChild(back);
  var modal = back.querySelector('.lb-modal'),
      bigBox = back.querySelector('.lb-big'),
      info = back.querySelector('.lb-info'),
      closeB = back.querySelector('.lb-close'),
      opener = null, closeTimer = null, resetTimer = null;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function open(tr, from) {
    opener = from || null;
    var name = txt(tr.cells[0]),
        type = txt(tr.cells[1]),
        pn = tr.getAttribute('data-p'),
        impa = tr.cells[3] && !tr.cells[3].classList.contains('impa-empty') ? txt(tr.cells[3]) : '',
        rangeA = tr.querySelector('a.ap-range'),
        real = tr.querySelector('.tr-add-mini'),
        ph = PHOTOS[pn];

    /* photo, or none */
    bigBox.innerHTML = '';
    modal.classList.toggle('lb-nophoto', !ph);
    if (ph) {
      var big = document.createElement('img');
      /* a small picture is shown at 1:1 rather than blown up blurry */
      var cap = function () {
        big.style.maxWidth = big.naturalWidth && big.naturalWidth < 700 ? 'min(100%, ' + big.naturalWidth + 'px)' : '';
      };
      big.addEventListener('load', cap);
      big.alt = name;
      big.src = pic(ph[1] || ph[0]);
      if (big.complete) cap();
      bigBox.appendChild(big);
    }

    info.innerHTML = '';
    info.appendChild(el('p', 'lb-role', (rangeA ? txt(rangeA) : 'Trelawny') + (type ? ' - ' + type : '')));
    var h3 = el('h3', null, name);
    h3.id = 'ap-qv-title';
    info.appendChild(h3);

    var meta = el('div', 'lb-metabox');
    var p1 = el('p', 'lb-meta', 'Part No. ');
    p1.appendChild(el('b', null, pn));
    meta.appendChild(p1);
    if (impa) {
      var p2 = el('p', 'lb-meta', 'IMPA ');
      p2.appendChild(el('b', null, impa));
      meta.appendChild(p2);
    }
    info.appendChild(meta);

    var foot = el('div', 'lb-foot');
    if (real) {
      var proxy = el('button', 'lb-add', 'Add to Quote');
      proxy.type = 'button';
      proxy.addEventListener('click', function () {
        real.click();
        proxy.textContent = '✓ Added to your quote';
        proxy.classList.add('done');
        clearTimeout(resetTimer);
        resetTimer = setTimeout(function () {
          proxy.textContent = 'Add to Quote';
          proxy.classList.remove('done');
        }, 1600);
      });
      foot.appendChild(proxy);
    }
    if (rangeA) {
      var more = el('a', 'lb-more', 'Specs and details: ' + txt(rangeA) + ' →');
      more.href = rangeA.getAttribute('href');
      foot.appendChild(more);
    }
    info.appendChild(foot);
    show();
  }

  function show() {
    /* a teardown still pending from the last close would blank this panel */
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    back.hidden = false;
    document.body.classList.add('lb-open');
    requestAnimationFrame(function () { back.classList.add('on'); });
    closeB.focus();
  }
  function close() {
    back.classList.remove('on');
    document.body.classList.remove('lb-open');
    closeTimer = setTimeout(function () {
      closeTimer = null;
      back.hidden = true;
      info.innerHTML = '';
      bigBox.innerHTML = '';
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
    var f = modal.querySelectorAll('button, a[href]');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  body.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.ap-qv') : null;
    if (!b) return;
    open(b.closest('tr'), b);
  });
})();
