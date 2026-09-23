/* ============================================================
   Trelawny catalog render engine (shared across redesigned pages)
   Driven by:
     window.TR_CATALOG  - array of {s:sourcePage, c:category, n:name, p:partNo}
     window.TR_IMAGES   - { partNo: imageFile }  (assets/tr-images.js)
     window.TR_CONFIG   - per-page config (see fields consumed below)
   Renders into #ns-main and #ns-counts.
   ============================================================ */
(function(){
  var DATA = window.TR_CATALOG || [];
  var C = window.TR_CONFIG || {};
  var MAINCAT = C.mainCat || 'Main Product';
  var CARDCAT = C.cardCat || 'Trelawny';
  var ACCCAT  = C.accCat  || (CARDCAT+' Accessories');
  var CONSCAT = C.consCat || (CARDCAT+' Consumables');

  function esc(s){ return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function uniqByPN(rows){ var seen={},out=[]; rows.forEach(function(r){ if(!seen[r.p]){ seen[r.p]=1; out.push(r);} }); return out; }
  function modelLabel(name){ return name.replace(/\s*(Needle|Chisel)\s+Scaler$/i,'').trim() || name; }
  function sizeLabel(name){ var m=name.match(/(\d+\s*ft(?:\s+LITE)?)/i); return m?m[1].replace(/\s+/g,'').replace(/ft/i,'ft').replace(/(LITE)/i,' LITE'):name; }
  function kitLabel(name){ var m=name.match(/^VL\w+/i), mdl=m?m[0]:''; return /Premium/i.test(name)?(mdl+' Premium Case'):(mdl+' Kit'); }
  function modelNum(r){ var s=String(r.n); var m=s.match(/VL(\d+)/i); if(m) return +m[1]; var f=s.match(/(\d+)\s*ft/i); if(f) return +f[1]+(/LITE/i.test(s)?0.5:0); var d=s.match(/^(\d+)/); if(d) return +d[1]; return 9999; }
  function tagChip(t){ var L={ex:'ATEX / Ex',needle:'Needle',chisel:'Chisel',kit:'Kit',lite:'LITE',scaler:'Scaler',dust:'Dust Control',air:'Air-Line',blade:'Blade',holder:'Holder',cutter:'Cutter Head',piston:'Piston',head:'Head',tool:'Tool'}; return '<span class="ns-tag '+t+'">'+(L[t]||t)+'</span>'; }
  function consLabel(name){ return name.replace(/ Needles?$/i,'').replace(/^Spark Resistant /i,'').replace(/ for Long Reach$/i,'').replace(/ Replacement$/i,'').replace(/ Taper Fit Cutter Head$/i,'').trim() || name; }
  function accLabel(name){ return name.replace(/\s*Service Kit(?: for)?\s*/i,' ').replace(/\s*Attachment Kit\s*/i,' ').replace(/\s*Scaler\s*/i,' ').replace(/\s+/g,' ').trim() || name; }
  function dustLabel(name){ return name.replace(/TVS Vacuum(?: Shroud)?(?: to fit)?\s*/i,'').replace(/\s*Needle Scalers?/i,'').trim() || name; }

  /* photos: authoritative part-number map first, then family keyword */
  function imgFile(name, pn){
    var byPN = (window.TR_IMAGES||{})[pn]; if(byPN) return byPN;
    var n=name;
    if(/Beryllium/i.test(n)) return 'Spark-Resistant-Beryllium-Copper.avif';
    if(/Stainless/i.test(n)) return 'Stainless-Steel-Needles.avif';
    if(/Chisel Tip/i.test(n)) return 'Chisel-Tip-Needle.avif';
    if(/Flat Tip/i.test(n)) return 'Flat-Tip-Needle.avif';
    if(/Pointed Tip/i.test(n)) return 'Pointed-Tip-Needles.avif';
    if(/Attachment Kit/i.test(n)) return 'Chisel-Attachment-Kit.avif';
    if(/Service Kit/i.test(n)) return /Chisel/i.test(n) ? 'Chisel-Scaler-Service-Kit.avif' : 'Needle-Scaler-Service-Kit.avif';
    if(/Vacuum|Shroud|Cuff/i.test(n)) return 'TVS-Vacuum.avif';
    if(/Lubricator Assembly/i.test(n)) return 'Quarter-BSP-Inline-Lubricator-Assembly.avif';
    if(/Lubricator/i.test(n)) return 'Quarter-BSP-Inline-Lubricator.avif';
    if(/Whip Check/i.test(n)) return 'Whip-Check.avif';
    if(/Whip Hose/i.test(n)) return 'Whip-Hose.avif';
    return null;
  }
  function imgSrc(name, pn){ var f=imgFile(name, pn); return f ? picSrc(f) : ''; }
  function picSrc(f){ return 'https://cdn.jsdelivr.net/gh/renemeisel1984-cmd/sepco-media@main/Tool/trelawny-pages/media/Product%20pictures/'+encodeURIComponent(f); }

  /* ---- photos on MAIN-PRODUCT cards -------------------------------------
     Consumable cards have always shown a per-SKU thumbnail. Main products had
     none at all, so there was nothing to enlarge. A main card now falls back to
     its GROUP's range photo, which is correct by construction; a per-SKU photo
     still wins when one exists. curFam is set once per group before its cards
     render - rendering is synchronous, so a module-level value is safe. */
  var FAMIMG = window.TR_FAMILY_IMAGES || {};
  var curFam = null;
  /* the 1200px companion of a 600px card photo, for the quick-view dialog */
  function bigOf(file){
    if(!file) return '';
    if(/-600\.avif$/i.test(file)) return picSrc(file.replace(/-600\.avif$/i, '.avif'));
    return picSrc(file);
  }
  /* {card,big} for a SKU on a main-product card */
  function toolImg(name, pn){
    var own = imgFile(name, pn);
    if(own) return { card: picSrc(own), big: bigOf(own) };
    if(curFam) return { card: picSrc(curFam.card), big: bigOf(curFam.big) };
    return null;
  }
  function thumbHtml(title, im){
    if(!im) return '';
    /* the range photo travels WITH the card: when the customer picks a model
       that has no photo of its own, the card falls back to it rather than
       blanking out. curFam is long stale by the time a change event fires. */
    var fb = curFam ? (' data-fb="'+picSrc(curFam.card)+'" data-fb-large="'+bigOf(curFam.big)+'"') : '';
    return '<div class="ns-thumb"><img alt="'+esc(title)+'" src="'+im.card+'"'+
      (im.big ? ' data-large="'+im.big+'"' : '')+fb+
      ' loading="lazy" onerror="this.style.visibility=\'hidden\'"></div>';
  }

  /* IMPA codes */
  var CODES = window.TR_CODES || {};
  function codesInner(pn){
    var c=CODES[pn]; if(!c) return '';
    var out=[];
    if(c.impa) out.push('IMPA <b>'+esc(c.impa)+'</b>');
    return out.join(' &middot; ');
  }
  var DESC = window.TR_DESC || {};
  function descLabel(name, pn, labelFn){ return (DESC[pn]&&DESC[pn].label) || labelFn(name); }
  function descInner(pn){ var d=DESC[pn]; return (d&&d.use) ? 'Best for: '+esc(d.use) : ''; }
  function nameWithMeta(nm,pn){ var c=CODES[pn]||{}; return nm+' (PN '+pn+(c.impa?' · IMPA '+c.impa:'')+')'; }

  /* ---- specs ---- */
  var SPECS = C.specs || {};
  var specKey = C.specKey || function(){ return null; };
  var specModelLabel = C.specModelLabel || function(name){ return modelLabel(name); };
  var SPECROWS = C.specRows || [
    {k:'bpm', label:'Blows/min'},
    {k:'air', label:'Air consumption'},
    {k:'len', label:'Length'},
    {k:'wt', label:'Weight'},
    {k:'vib', label:'Vibration'}
  ];
  var SPECCONST = C.specConst || [];   // e.g. [{label:'Air pressure',value:'6.2 bar (90 psi)'}]

  function specCompareTable(models, specRows, specConst){
    specRows = specRows || SPECROWS; specConst = specConst || SPECCONST;
    var withData=[], noData=[];
    models.forEach(function(m){ var s=SPECS[specKey(m.name)]; if(s){withData.push({label:m.label,s:s});} else {noData.push(m.label);} });
    var note = noData.length ? '<div class="ns-cmp-note">'+noData.join(', ')+' - key figures available on request.</div>' : '';
    if(!withData.length){
      var basic = specConst.map(function(c){return '<tr><td class="ns-cmp-lbl">'+c.label+'</td><td>'+esc(c.value)+'</td></tr>';}).join('');
      return '<div class="ns-cmpwrap"><table class="ns-cmp"><tbody>'+(basic||'<tr><td class="ns-cmp-lbl">Specifications</td><td>Available on request</td></tr>')+'</tbody></table></div>'+note;
    }
    var rows=[];
    specRows.forEach(function(sr){ if(withData.some(function(d){return d.s[sr.k]!=null;})) rows.push(sr); });
    var head='<tr><th>Specification</th>'+withData.map(function(d){return '<th>'+esc(d.label)+'</th>';}).join('')+'</tr>';
    var bodyRows='';
    // constant rows first (air pressure/inlet), then data rows
    specConst.forEach(function(c){ bodyRows += '<tr><td class="ns-cmp-lbl">'+c.label+'</td>'+withData.map(function(){return '<td>'+esc(c.value)+'</td>';}).join('')+'</tr>'; });
    rows.forEach(function(sr){
      bodyRows += '<tr><td class="ns-cmp-lbl">'+sr.label+'</td>'+withData.map(function(d){return '<td>'+esc(d.s[sr.k]!=null?d.s[sr.k]:'-')+'</td>';}).join('')+'</tr>';
    });
    return '<div class="ns-cmpwrap"><table class="ns-cmp"><thead>'+head+'</thead><tbody>'+bodyRows+'</tbody></table></div>'+note;
  }

  /* ---- accordions ---- */
  var GROUP_APPS = C.apps || [];
  var GROUP_FEATS = C.feats || {};
  function groupInfo(g, rows){
    var seen={}, models=[];
    rows.forEach(function(r){ var lbl=specModelLabel(r.n); if(!seen[lbl]){ seen[lbl]=1; models.push({label:lbl, name:r.n}); } });
    models.sort(function(a,b){ return modelNum({n:a.name})-modelNum({n:b.name}); });
    var specCmp = specCompareTable(models, g.specRows, g.specConst);
    var appsArr = g.apps || GROUP_APPS;
    var featsArr = g.feats || GROUP_FEATS[g.id] || [];
    var apps='<ul class="ns-applist">'+appsArr.map(function(t){return '<li>'+t+'</li>';}).join('')+'</ul>';
    var feats='<ul class="ns-applist">'+featsArr.map(function(t){return '<li>'+t+'</li>';}).join('')+'</ul>';
    var dls='<ul class="ns-dl">'+
      (g.ds?'<li><a href="'+esc(g.ds)+'" target="_blank" rel="noopener">Datasheet (PDF)</a></li>':'')+
      '<li><a href="#'+g.id+'-rel" onclick="var d=document.getElementById(\''+g.id+'-rel\');if(d)d.open=true">Accessories &amp; consumables</a></li>'+
      '<li class="ns-dl-note">Operation &amp; maintenance manuals available on request</li>'+
      '</ul>';
    return '<div class="ns-info">'+
      '<details class="ns-acc-item"><summary>Key specifications</summary><div class="ns-acc-body">'+specCmp+'</div></details>'+
      (appsArr.length?'<details class="ns-acc-item"><summary>Applications</summary><div class="ns-acc-body">'+apps+'</div></details>':'')+
      (featsArr.length?'<details class="ns-acc-item"><summary>Features</summary><div class="ns-acc-body">'+feats+'</div></details>':'')+
      '<details class="ns-acc-item"><summary>Downloads</summary><div class="ns-acc-body">'+dls+'</div></details>'+
      '</div>';
  }

  /* ---- cards ---- */
  function variantCard(title, tags, variants, cat, labelFn, type, ds){
    labelFn = labelFn || modelLabel; type = type || 'tool';
    variants = variants.slice().sort(function(a,b){ return modelNum(a)-modelNum(b); });
    var first = variants[0];
    var head = '<div class="ns-card-head">'+tags.map(tagChip).join('')+'</div>';
    var foot = function(pn,nm){ return '<div class="ns-foot"><button class="btn btn-primary btn-sm tr-add" data-id="'+esc(pn)+'" data-name="'+esc(nameWithMeta(nm,pn))+'" data-impa="'+esc((CODES[pn]||{}).impa||'')+'" data-type="'+type+'" data-cat="'+cat+'">Add to Quote</button></div>'; };
    var firstImg = imgSrc(first.n, first.p);
    var thumb;
    if(type==='consumable'){
      thumb = variants.some(function(v){return imgFile(v.n,v.p);})
        ? '<div class="ns-thumb"><img alt="'+esc(title)+'"'+(firstImg?(' src="'+firstImg+'"'):' style="visibility:hidden"')+
          (firstImg?(' data-large="'+bigOf(imgFile(first.n,first.p))+'"'):'')+
          ' loading="lazy" onerror="this.style.visibility=\'hidden\'"></div>' : '';
    } else {
      thumb = thumbHtml(title, toolImg(first.n, first.p));
    }
    if(variants.length===1){
      return '<div class="ns-card">'+head+'<div class="ns-card-body">'+thumb+
        '<h3>'+title+'</h3>'+
        '<div class="ns-one">'+esc(descLabel(first.n, first.p, labelFn))+'</div>'+
        '<div class="ns-pn">Part No. <b>'+esc(first.p)+'</b></div>'+
        '<div class="ns-codes">'+codesInner(first.p)+'</div>'+foot(first.p, first.n)+'</div></div>';
    }
    var opts = variants.map(function(v,i){
      return '<option value="'+i+'" data-pn="'+esc(v.p)+'" data-name="'+esc(v.n)+'"'+(i===0?' selected':'')+'>'+esc(descLabel(v.n, v.p, labelFn))+' - '+esc(v.p)+'</option>';
    }).join('');
    return '<div class="ns-card ns-vcard">'+head+'<div class="ns-card-body">'+thumb+
        '<h3>'+title+'</h3>'+
        '<label class="ns-choose">'+(type==='consumable'?'Option':'Model')+
          '<select class="ns-model" aria-label="Choose '+esc(title)+'">'+opts+'</select></label>'+
        '<div class="ns-pn">Part No. <b class="ns-pn-val">'+esc(first.p)+'</b></div>'+
        '<div class="ns-codes">'+codesInner(first.p)+'</div>'+
        foot(first.p, first.n)+'</div></div>';
  }
  /* one clean card for a single product (no dropdown) - used by H.each */
  function plainCard(title, tags, r, cat, type){
    type = type || 'tool';
    var head = '<div class="ns-card-head">'+tags.map(tagChip).join('')+'</div>';
    var img = imgSrc(r.n, r.p);
    var thumb = (type==='consumable')
      ? (imgFile(r.n,r.p) ? '<div class="ns-thumb"><img alt="'+esc(title)+'" src="'+img+'" data-large="'+bigOf(imgFile(r.n,r.p))+'" loading="lazy" onerror="this.style.visibility=\'hidden\'"></div>' : '')
      : thumbHtml(title, toolImg(r.n, r.p));
    return '<div class="ns-card">'+head+'<div class="ns-card-body">'+thumb+
      '<h3>'+esc(title)+'</h3>'+
      '<div class="ns-pn">Part No. <b>'+esc(r.p)+'</b></div>'+
      '<div class="ns-codes">'+codesInner(r.p)+'</div>'+
      '<div class="ns-foot"><button class="btn btn-primary btn-sm tr-add" data-id="'+esc(r.p)+'" data-name="'+esc(nameWithMeta(r.n,r.p))+'" data-impa="'+esc((CODES[r.p]||{}).impa||'')+'" data-type="'+type+'" data-cat="'+esc(cat)+'">Add to Quote</button></div>'+
      '</div></div>';
  }
  function familyCards(rows, families, type, cat){
    var buckets = families.map(function(){ return []; }), other=[];
    rows.forEach(function(r){ var placed=false; for(var i=0;i<families.length;i++){ if(families[i].test(r.n)){ buckets[i].push(r); placed=true; break; } } if(!placed) other.push(r); });
    var out=[];
    families.forEach(function(f,i){ if(buckets[i].length) out.push(variantCard(f.title, f.tags, buckets[i], cat, f.labelFn||consLabel, type)); });
    if(other.length) out.push(variantCard('Other '+(type==='consumable'?'Items':'Accessories'), ['tool'], other, cat, consLabel, type));
    return out;
  }
  var ACC_FAMILIES = C.accFamilies || [];
  var CONS_FAMILIES = C.consFamilies || [];

  /* keep card PN/Add button + thumbnail in sync with dropdown */
  document.addEventListener('change', function(e){
    var sel = e.target.closest && e.target.closest('select.ns-model'); if(!sel) return;
    var opt = sel.options[sel.selectedIndex];
    var card = sel.closest('.ns-card');
    var pn = opt.getAttribute('data-pn'), nm = opt.getAttribute('data-name');
    var lbl = card.querySelector('.ns-pn-val'); if(lbl) lbl.textContent = pn;
    var cl = card.querySelector('.ns-codes'); if(cl) cl.innerHTML = codesInner(pn);
    var btn = card.querySelector('.tr-add, .tr-add-mini');
    if(btn){ btn.setAttribute('data-id', pn); btn.setAttribute('data-name', nameWithMeta(nm,pn)); btn.setAttribute('data-impa', (CODES[pn]||{}).impa||''); }
    var thumbImg = card.querySelector('.ns-thumb img');
    if(thumbImg){
      var f = imgFile(nm, pn);
      var src = f ? picSrc(f) : (thumbImg.getAttribute('data-fb') || '');
      var big = f ? bigOf(f) : (thumbImg.getAttribute('data-fb-large') || '');
      if(src){
        thumbImg.src = src;
        if(big) thumbImg.setAttribute('data-large', big); else thumbImg.removeAttribute('data-large');
        thumbImg.style.visibility='visible';
      } else { thumbImg.style.visibility='hidden'; }
    }
  });

  function tagsFor(name){
    if(/(?:^|[^A-Za-z])Ex(?:[^A-Za-z]|$)/.test(name) || /-Ex/.test(name)) return '<span class="ns-tag ex">ATEX / Ex</span>';
    return '<span class="ns-tag tool">Tool</span>';
  }

  /* ---- main render ---- */
  var mainHost = document.getElementById('ns-main');
  var totalMain = 0;
  (C.groups||[]).forEach(function(g){
    /* the range photo this group's main-product cards fall back to */
    curFam = FAMIMG[g.id] || (g.imgFile ? { card: g.imgFile, big: g.imgFile } : null);
    var sm = Array.isArray(g.src) ? function(s){return g.src.indexOf(s)>=0;} : function(s){return s===g.src;};
    var rows = uniqByPN(DATA.filter(function(r){ return r.c===MAINCAT && sm(r.s); }));
    totalMain += rows.length;
    var H = { mk:function(title,tags,vs,labelFn){ return variantCard(title,tags,vs,CARDCAT,labelFn,'tool',g.ds); },
      each:function(rows2,tags,titleFn){ return rows2.map(function(r){ var t=(typeof tags==='function')?tags(r):(tags||['tool']); return plainCard(titleFn?titleFn(r):r.n, t, r, CARDCAT, 'tool'); }); },
      variantCard:variantCard, modelLabel:modelLabel, sizeLabel:sizeLabel, kitLabel:kitLabel, cat:CARDCAT, ds:g.ds };
    var cards = g.variants ? g.variants(rows, g.ds, H).filter(Boolean) : null;
    var badge = rows.length+' models';
    if(cards){ badge = rows.length+' models · '+cards.length+' quick-pick cards'; }
    /* header photo: the re-sourced range shot when there is one, else the
       file the page has always declared */
    var headFile = (FAMIMG[g.id] && FAMIMG[g.id].big) || g.imgFile;
    var imgHtml = headFile ? '<div class="ns-ghead-img"><img src="'+picSrc(headFile)+'" alt="'+g.title+'" loading="lazy" onerror="var w=this.closest(\'.ns-ghead-img\'); if(w) w.style.display=\'none\'"></div>' : '';
    var html = '<div class="ns-ghead" id="'+g.id+'">'+
      '<div class="ns-ghead-text">'+
        '<span class="section-label">'+g.label+'</span>'+
        '<h2 class="section-title" style="text-align:left">'+g.title+' <span class="ns-ct" style="font-size:13px;vertical-align:middle">'+badge+'</span></h2>'+
        '<p class="section-sub" style="margin-left:0;text-align:left;max-width:820px">'+g.blurb+'</p>'+
      '</div>'+imgHtml+'</div>';
    html += '<div class="ns-cards">';
    if(cards){ html += cards.join(''); }
    else { rows.forEach(function(r){
      html += '<div class="ns-card"><div class="ns-card-head">'+tagsFor(r.n)+'</div><div class="ns-card-body">'+
        '<h3>'+esc(r.n)+'</h3><div class="ns-pn">Part No. <b>'+esc(r.p)+'</b></div>'+
        '<button class="btn btn-primary btn-sm tr-add" data-id="'+esc(r.p)+'" data-name="'+esc(r.n+' (PN '+r.p+')')+'" data-type="tool" data-cat="'+CARDCAT+'">Add to Quote</button></div></div>';
    }); }
    html += '</div>';
    html += groupInfo(g, rows);

    var accG = uniqByPN(DATA.filter(function(r){ return r.c==='Accessory' && sm(r.s); }));
    var consG = uniqByPN(DATA.filter(function(r){ return r.c==='Consumable' && sm(r.s); }));
    var accCards = familyCards(accG, ACC_FAMILIES, 'consumable', ACCCAT);
    var consCards = familyCards(consG, CONS_FAMILIES, 'consumable', CONSCAT);
    var relCount = accG.length + consG.length;
    if(relCount){
      html += '<details class="ns-related" id="'+g.id+'-rel"><summary><span class="ns-rel-t">Accessories &amp; consumables for this range</span> <span class="ns-ct">'+relCount+' SKUs</span></summary><div class="ns-related-body">';
      if(accCards.length){ html += '<div class="ns-subhead">'+(C.accSubhead||'Accessories &amp; Spares')+' <span class="ns-ct">'+accG.length+'</span></div><div class="ns-cards ns-cards-sm">'+accCards.join('')+'</div>'; }
      if(consCards.length){ html += '<div class="ns-subhead">'+(C.consSubhead||'Consumables')+' <span class="ns-ct">'+consG.length+'</span></div><div class="ns-cards ns-cards-sm">'+consCards.join('')+'</div>'; }
      html += '</div></details>';
    }
    if(mainHost) mainHost.insertAdjacentHTML('beforeend', '<div class="ns-group" data-range="'+g.id+'">'+html+'</div>');
  });

  /* ============================================================
     Shared enhancements: SKU-count band, Tool Selector CTA,
     in-page search + range chips, and safe image enlargement.
     ============================================================ */
  function uniqPN(cat){ var s={}; DATA.forEach(function(r){ if(r.p && (!cat||r.c===cat)) s[r.p]=1; }); return Object.keys(s).length; }
  var groupsCfg = C.groups || [];

  if(mainHost){
    var grand = uniqPN(null), models = uniqPN(MAINCAT), acc = uniqPN('Accessory'), cons = uniqPN('Consumable');

    /* count band - unique part numbers per category; only worth showing for a real range */
    var counts = document.getElementById('ns-counts');
    if(grand >= 3){
      if(!counts){ counts = document.createElement('div'); counts.id='ns-counts'; mainHost.parentNode.insertBefore(counts, mainHost); }
      counts.className = 'ns-summary';
      var stat = function(n,l){ return '<div class="ns-stat"><b>'+n+'</b><span>'+l+'</span></div>'; };
      var band = '';
      if(acc||cons) band += stat(grand, C.countLabel || 'SKUs in this range');
      band += stat(models, C.modelsLabel || 'Models');
      if(acc) band += stat(acc, 'Accessories &amp; spares');
      if(cons) band += stat(cons, 'Consumables');
      counts.innerHTML = band;
    } else if(counts){ counts.remove(); }

    /* Tool Selector callout - secondary CTA, deliberately not the red Add-to-Quote colour */
    if(grand >= 3 && !mainHost.parentNode.querySelector('.ns-selector-cta')){
      var cta = document.createElement('div');
      cta.className = 'ns-selector-cta';
      cta.innerHTML = '<div class="ns-sel-txt"><b>Not sure which tool fits your job?</b>'+
        '<span>Answer a few quick questions and we\'ll point you to the right tool for the access, dust and ATEX needs of the job.</span></div>'+
        '<a href="tool-selector.html" class="ns-sel-btn">Use the 2-minute Tool Selector →</a>';
      /* after the cards, not above them: the picker is what people came for */
      mainHost.parentNode.insertBefore(cta, mainHost.nextSibling);
    }

    /* in-page search + range chips - only when there are 2+ groups to filter between */
    var groupEls = Array.prototype.slice.call(mainHost.querySelectorAll('.ns-group'));
    if(groupsCfg.length >= 2 && groupEls.length >= 2){
      var chipLabel = function(g){ var s = g.chip || String(g.label||g.title||'').split('·')[0].replace(/[™®]/g,'').trim(); return s.length>26 ? s.slice(0,24)+'…' : s; };
      var bar = document.createElement('div'); bar.className='ns-filter';
      var chips = '<button type="button" class="ns-chip active" data-range="all" aria-pressed="true">All</button>';
      groupsCfg.forEach(function(g){ if(groupEls.some(function(e){return e.getAttribute('data-range')===g.id;})) chips += '<button type="button" class="ns-chip" data-range="'+g.id+'" aria-pressed="false">'+esc(chipLabel(g))+'</button>'; });
      bar.innerHTML =
        '<div class="ns-filter-search"><label for="ns-search" class="ns-vh">Search this range</label>'+
        '<span class="ns-search-ico" aria-hidden="true">&#128269;</span>'+
        '<input type="search" id="ns-search" placeholder="Search this range - name or part number…" autocomplete="off" spellcheck="false"></div>'+
        '<div class="ns-chips" role="group" aria-label="Filter by type">'+chips+'</div>';
      mainHost.parentNode.insertBefore(bar, mainHost);
      var noRes = document.createElement('div'); noRes.className='ns-noresults'; noRes.hidden=true;
      noRes.textContent='No matches - try a model or part number, or clear the filters.';
      mainHost.parentNode.insertBefore(noRes, mainHost.nextSibling);
      var input = bar.querySelector('#ns-search');
      var chipEls = Array.prototype.slice.call(bar.querySelectorAll('.ns-chip'));
      var activeRange='all';
      var loosen = function(s){ return s.replace(/[-_/.\s]+/g,''); };
      var applyFilter = function(){
        var q = loosen((input.value||'').trim().toLowerCase()), anyVis=false;
        groupEls.forEach(function(gEl){
          var gid=gEl.getAttribute('data-range');
          if(activeRange!=='all' && activeRange!==gid){ gEl.style.display='none'; return; }
          var mm=0, rm=0;
          Array.prototype.forEach.call(gEl.querySelectorAll('.ns-card'),function(card){
            var ok = !q || loosen(card.textContent.toLowerCase()).indexOf(q)>-1;
            card.style.display = ok?'':'none';
            if(ok){ if(card.closest('.ns-related')) rm++; else mm++; }
          });
          if(q && (mm+rm)===0){ gEl.style.display='none'; return; }
          gEl.style.display=''; anyVis=true;
          var rel=gEl.querySelector('.ns-related'); if(rel && q){ rel.open = rm>0; }
        });
        noRes.hidden = anyVis;
      };
      input.addEventListener('input', applyFilter);
      chipEls.forEach(function(chip){ chip.addEventListener('click', function(){
        activeRange = chip.getAttribute('data-range');
        chipEls.forEach(function(c){ var on=c===chip; c.classList.toggle('active',on); c.setAttribute('aria-pressed', on?'true':'false'); });
        applyFilter();
      }); });
    }

    /* enlarge group product renders: crop baked-in top/bottom whitespace ONLY when the
       image is square-ish and has verified whitespace top & bottom (never clips long tools) */
    Array.prototype.forEach.call(mainHost.querySelectorAll('.ns-ghead-img'), function(box){
      var img = box.querySelector('img'); if(!img) return;
      function analyze(){
        var W=img.naturalWidth, H=img.naturalHeight; if(!W||!H) return;
        var ar=W/H; if(ar<0.9||ar>1.1) return;
        try{
          var s=180, cv=document.createElement('canvas'); cv.width=s; cv.height=s;
          var cx=cv.getContext('2d'); cx.drawImage(img,0,0,s,s);
          var d=cx.getImageData(0,0,s,s).data, minY=s,maxY=0,minX=s,maxX=0,found=false;
          for(var yy=0;yy<s;yy++){ for(var xx=0;xx<s;xx++){ var i=(yy*s+xx)*4;
            if(d[i+3]>25 && !(d[i]>243&&d[i+1]>243&&d[i+2]>243)){ found=true; if(yy<minY)minY=yy; if(yy>maxY)maxY=yy; if(xx<minX)minX=xx; if(xx>maxX)maxX=xx; } } }
          if(!found) return;
          var top=minY/s, bot=(s-1-maxY)/s, cw=(maxX-minX)/s;
          if(top>=0.18 && bot>=0.18 && cw>=0.78) box.classList.add('ns-fit-cover');
        }catch(e){}
      }
      if(img.complete && img.naturalWidth) analyze(); else img.addEventListener('load', analyze);
    });
  }
})();
