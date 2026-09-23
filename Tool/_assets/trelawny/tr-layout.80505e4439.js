/* ============================================================
   Trelawny catalogue layout pass (A + B, 23 Sep 2026)
   Runs AFTER the renderer (tr-catalog-engine.js, or needle-scalers'
   inline twin) and BEFORE tr-lightbox.js. It only re-arranges the
   rendered DOM; it never rebuilds a card, so every hook the rest of
   the page relies on survives:
     - the dropdown handler resolves sel.closest('.ns-card') and then
       queries .ns-pn-val / .ns-codes / .tr-add / .ns-thumb img INSIDE it
     - the lightbox wires '.ns-card', names it from 'h3,h4', and finds
       '.ns-ghead .section-label/.section-sub' by walking up from the card
     - the scroll-spy reads document.getElementById('g-*').offsetTop
   Per range (main-product cards only, never the accessories panel):
     1 card  -> A "spotlight": range header + card merge into one panel
     2+ cards -> B "list": framed range header + one aligned row per card
   ============================================================ */
(function(){
  var host = document.getElementById('ns-main');
  if(!host || host.getAttribute('data-layout')) return;
  host.setAttribute('data-layout', 'ab');

  var C = window.TR_CONFIG || {};
  var DATA = window.TR_CATALOG || [];
  var SPECS = C.specs || {};
  var specKey = C.specKey || function(){ return null; };
  var DEF_ROWS = [{k:'bpm',label:'Blows/min'},{k:'air',label:'Air consumption'},{k:'len',label:'Length'},{k:'wt',label:'Weight'},{k:'vib',label:'Vibration'}];
  /* tag classes that already carry their own colour in tr-catalog.css */
  var COLOURED = ['ex','needle','chisel','kit','lite','dust','air','blade','holder'];

  function kids(el, sel){ return Array.prototype.filter.call(el.children, function(c){ return c.matches(sel); }); }
  function mk(tag, cls){ var e=document.createElement(tag); if(cls) e.className=cls; return e; }
  function esc(s){ return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }

  /* the card's tag chips, minus the generic "Tool" chip that says nothing */
  function takeTags(card){
    var head = card.querySelector('.ns-card-head'), out = [];
    if(!head) return out;
    Array.prototype.slice.call(head.querySelectorAll('.ns-tag')).forEach(function(t){
      if(t.classList.contains('tool')) return;
      if(!COLOURED.some(function(c){ return t.classList.contains(c); })) t.classList.add('ns-tag-plain');
      out.push(t);
    });
    head.parentNode.removeChild(head);
    return out;
  }

  /* "12 models · 4 quick-pick cards" -> "12 models"; the badge leaves the H2 */
  function metaLine(ghead, keep){
    var ct = ghead.querySelector('h2 .ns-ct'); if(!ct) return;
    var n = parseInt(ct.textContent, 10);
    ct.parentNode.removeChild(ct);
    if(!keep || !n) return;
    var m = mk('div', 'ns-gmeta'); m.textContent = n + (n===1 ? ' model' : ' models');
    var h2 = ghead.querySelector('h2'); h2.parentNode.insertBefore(m, h2.nextSibling);
  }

  /* the id the scroll-spy and #g-* links target moves to the outer frame */
  function moveId(ghead, frame){ if(ghead.id){ frame.id = ghead.id; ghead.removeAttribute('id'); } }

  /* key-figure tiles for a single-model spotlight: "454 l/min at 5.9 bar (85 psi)"
     -> big "454 l/min", small "at 5.9 bar (85 psi)". Same values as the spec table. */
  function keyTiles(card, gid){
    if(card.querySelector('select.ns-model')) return '';
    var btn = card.querySelector('.tr-add'); if(!btn) return '';
    var pn = btn.getAttribute('data-id'), row = null;
    DATA.some(function(r){ if(r.p===pn){ row=r; return true; } return false; });
    if(!row) return '';
    var s = SPECS[specKey(row.n)]; if(!s) return '';
    var g = null; (C.groups||[]).some(function(x){ if(x.id===gid){ g=x; return true; } return false; });
    var rows = (g && g.specRows) || C.specRows || DEF_ROWS, tiles = [];
    rows.forEach(function(sr){
      var v = s[sr.k]; if(v==null || v==='-' || tiles.length>=4) return;
      v = String(v);
      var big = v.split(/\s+(?:at|-|–)\s+|\s*\(|,\s+/)[0];
      var rest = v.slice(big.length).replace(/^\s*[-–,]\s*/, '').trim();
      if(/^\([^()]*\)$/.test(rest)) rest = rest.slice(1, -1);
      tiles.push('<div class="ns-key"><b>'+esc(big)+'</b><span>'+esc(sr.label)+'</span>'+(rest?'<small>'+esc(rest)+'</small>':'')+'</div>');
    });
    return tiles.length>=2 ? '<div class="ns-spot-keys">'+tiles.join('')+'</div>' : '';
  }

  function datasheet(group){
    var a = null;
    Array.prototype.some.call(group.querySelectorAll('.ns-dl a[href]'), function(x){ if(/\.pdf(?:$|[?#])/i.test(x.getAttribute('href'))){ a=x; return true; } return false; });
    if(!a) return null;
    var l = mk('a', 'ns-spot-ds'); l.href = a.getAttribute('href'); l.target='_blank'; l.rel='noopener'; l.textContent='Datasheet (PDF)';
    return l;
  }

  /* ---------- A: spotlight ---------- */
  function spotlight(group, ghead, grid, card){
    var tags = takeTags(card);
    metaLine(ghead, false);
    var gimg = ghead.querySelector('.ns-ghead-img'); if(gimg) gimg.parentNode.removeChild(gimg);
    var body = card.querySelector('.ns-card-body');
    var thumb = body.querySelector('.ns-thumb');

    var media = mk('div', 'ns-spot-media');
    if(tags.length){ var tw = mk('div', 'ns-spot-tags'); tags.forEach(function(t){ tw.appendChild(t); }); media.appendChild(tw); }
    if(thumb){
      /* the card photo is sized for a 118 px box; the spotlight wants the large one */
      var im = thumb.querySelector('img'), big = im && im.getAttribute('data-large');
      if(im && big && im.getAttribute('src')) im.setAttribute('src', big);
      media.appendChild(thumb);
    } else if(gimg){ media.appendChild(gimg); }

    var side = mk('div', 'ns-spot-body');
    side.appendChild(ghead);
    var tiles = keyTiles(card, group.getAttribute('data-range'));
    if(tiles) side.insertAdjacentHTML('beforeend', tiles);

    var buy = mk('div', 'ns-spot-buy');
    var ids = mk('div', 'ns-spot-ids'), acts = mk('div', 'ns-spot-acts');
    Array.prototype.slice.call(body.children).forEach(function(el){
      if(el.matches('.ns-pn, .ns-codes')) ids.appendChild(el);
      else if(el.matches('.ns-foot, .tr-add')) acts.appendChild(el);
      else buy.appendChild(el);                       /* h3, .ns-one, .ns-choose */
    });
    var ds = datasheet(group); if(ds) acts.insertBefore(ds, acts.firstChild);
    buy.appendChild(ids); buy.appendChild(acts);
    side.appendChild(buy);

    body.parentNode.removeChild(body);
    card.appendChild(media); card.appendChild(side);
    card.classList.add('ns-spot');
    moveId(ghead, card);
    group.insertBefore(card, grid);
    grid.parentNode.removeChild(grid);
  }

  /* ---------- B: framed list ---------- */
  function list(group, ghead, grid, cards){
    metaLine(ghead, true);
    var frame = mk('div', 'ns-rng');
    moveId(ghead, frame);
    group.insertBefore(frame, ghead);
    frame.appendChild(ghead);
    frame.appendChild(grid);
    grid.classList.add('ns-list');
    cards.forEach(function(card){
      var tags = takeTags(card);
      var body = card.querySelector('.ns-card-body'); if(!body) return;
      var thumb = body.querySelector('.ns-thumb') || mk('div', 'ns-thumb ns-thumb-empty');
      var main = mk('div', 'ns-row-main'), ids = mk('div', 'ns-row-ids'), act = mk('div', 'ns-row-act');
      Array.prototype.slice.call(body.children).forEach(function(el){
        if(el===thumb) return;
        if(el.matches('.ns-pn, .ns-codes')) ids.appendChild(el);
        else if(el.matches('.ns-foot, .tr-add')) act.appendChild(el);
        else main.appendChild(el);
      });
      if(tags.length){
        var tw = mk('div', 'ns-row-tags'); tags.forEach(function(t){ tw.appendChild(t); });
        var h = main.querySelector('h3,h4');
        main.insertBefore(tw, h ? h.nextSibling : main.firstChild);
      }
      body.insertBefore(thumb, body.firstChild);
      body.appendChild(main); body.appendChild(ids); body.appendChild(act);
      card.classList.add('ns-row');
    });
  }

  Array.prototype.forEach.call(host.querySelectorAll('.ns-group'), function(group){
    var ghead = kids(group, '.ns-ghead')[0], grid = kids(group, '.ns-cards')[0];
    if(!ghead || !grid) return;
    var cards = kids(grid, '.ns-card');
    if(cards.length===1) spotlight(group, ghead, grid, cards[0]);
    else if(cards.length>1) list(group, ghead, grid, cards);
  });

  /* ---------- styles (self-contained: needle-scalers does not load tr-catalog.css) ---------- */
  var css =
  '.ns-gmeta{font-size:13px;font-weight:600;color:#6a6a73;margin:-6px 0 12px}'+
  '.ns-tag.ns-tag-plain{background:#3a3a42;color:#fff}'+
  /* A */
  '.ns-card.ns-spot{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);border-radius:18px;margin:48px 0 14px;overflow:hidden}'+
  '.ns-group:first-child>.ns-spot,.ns-group:first-child>.ns-rng{margin-top:8px}'+
  '.ns-spot-media{position:relative;display:flex;align-items:center;justify-content:center;padding:28px;background:#fff;border-right:1px solid #f0f0f3;min-width:0}'+
  '.ns-spot-media .ns-thumb{height:auto;min-height:300px;width:100%;border:0;margin:0;padding:0;background:transparent}'+
  '.ns-spot-media .ns-thumb img{max-height:420px;max-width:100%;width:auto;height:auto}'+
  '.ns-spot-media .ns-ghead-img{border:0;width:100%}'+
  '.ns-spot-tags{position:absolute;top:16px;left:16px;display:flex;gap:6px;flex-wrap:wrap;z-index:1}'+
  '.ns-spot-body{padding:32px 34px;display:flex;flex-direction:column;gap:18px;min-width:0}'+
  '.ns-spot .ns-ghead{display:block;margin:0}'+
  '.ns-spot .ns-ghead .section-title{font-size:clamp(26px,2.6vw,34px);line-height:1.12;margin:8px 0 12px}'+
  '.ns-spot .ns-ghead .section-sub{margin-bottom:0;font-size:15.5px;line-height:1.6}'+
  '.ns-spot-keys{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:10px}'+
  '.ns-key{background:#f6f6f8;border-radius:10px;padding:12px 13px 11px;min-width:0}'+
  '.ns-key b{display:block;font-size:19px;line-height:1.15;color:#1c1c22}'+
  '.ns-key span{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#6a6a73;margin-top:5px}'+
  '.ns-key small{display:block;font-size:12px;color:#6a6a73;margin-top:2px;line-height:1.35}'+
  '.ns-spot-buy{border:1px solid #e6e6ea;border-radius:12px;padding:16px 18px;display:flex;flex-direction:column;gap:8px}'+
  '.ns-spot-buy h3{font-size:16px;margin:0}'+
  '.ns-spot-buy .ns-choose{max-width:440px}'+
  '.ns-spot-ids{display:flex;flex-wrap:wrap;gap:4px 22px}'+
  '.ns-spot-acts{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:6px}'+
  '.ns-spot .ns-foot{margin:0}'+
  '.ns-spot .ns-foot .btn{width:auto;padding:12px 28px;font-size:15px}'+
  '.ns-spot-ds{display:inline-flex;align-items:center;font-size:14px;font-weight:700;color:#1c1c22;border:1.5px solid #d6d6dc;border-radius:8px;padding:10px 16px;text-decoration:none;background:#fff}'+
  '.ns-spot-ds:hover{border-color:var(--tr-red,#b21f24);color:var(--tr-red,#b21f24)}'+
  /* B */
  '.ns-rng{background:#fff;border:1px solid #e6e6ea;border-radius:18px;overflow:hidden;margin:48px 0 14px;box-shadow:0 1px 2px rgba(0,0,0,.04)}'+
  '.ns-rng>.ns-ghead{margin:0;padding:28px 30px}'+
  '.ns-rng>.ns-ghead .section-title{margin-bottom:10px}'+
  '.ns-rng>.ns-ghead .section-sub{margin-bottom:0}'+
  '.ns-rng>.ns-ghead .ns-ghead-img{border:0;padding:0}'+
  '.ns-rng>.ns-ghead .ns-ghead-img img{max-height:240px}'+
  '.ns-cards.ns-list{display:block;margin:0}'+
  '.ns-list>.ns-card{border:0;border-top:1px solid #eeeef1;border-radius:0;box-shadow:none;overflow:visible}'+
  '.ns-list>.ns-card:hover{background:#fbfbfc}'+
  '.ns-list .ns-card-body{display:grid;grid-template-columns:96px minmax(0,1.5fr) minmax(0,1fr) 168px;gap:8px 22px;align-items:center;padding:14px 30px}'+
  '.ns-list .ns-thumb{width:96px;height:72px;margin:0;padding:4px}'+
  '.ns-list .ns-thumb img{max-height:62px}'+
  '.ns-list .ns-thumb-empty{border-style:dashed;background:#fafafb}'+
  '.ns-row-main{display:flex;flex-direction:column;gap:6px;min-width:0}'+
  '.ns-row-main h3{font-size:15.5px}'+
  '.ns-row-main .ns-choose{max-width:420px}'+
  '.ns-row-tags{display:flex;gap:6px;flex-wrap:wrap}'+
  '.ns-row-ids{display:flex;flex-direction:column;gap:3px;min-width:0}'+
  '.ns-row-act .ns-foot,.ns-row-act{margin:0}'+
  '.ns-row-act .btn{width:100%}'+
  '@media(max-width:820px){'+
    '.ns-card.ns-spot{grid-template-columns:1fr}'+
    '.ns-spot-media{border-right:0;border-bottom:1px solid #f0f0f3;padding:22px}'+
    '.ns-spot-media .ns-thumb{min-height:200px}'+
    '.ns-spot-media .ns-thumb img{max-height:300px}'+
    '.ns-spot-body{padding:22px 20px}'+
    '.ns-rng>.ns-ghead{padding:22px 20px}'+
    '.ns-list .ns-card-body{grid-template-columns:72px minmax(0,1fr);padding:14px 20px;gap:8px 16px}'+
    '.ns-list .ns-thumb{width:72px;height:56px;align-self:start}'+
    '.ns-list .ns-thumb img{max-height:46px}'+
    '.ns-row-ids,.ns-row-act{grid-column:2}'+
  '}';
  var st = document.createElement('style'); st.id = 'tr-layout-css'; st.textContent = css;
  document.head.appendChild(st);
})();
