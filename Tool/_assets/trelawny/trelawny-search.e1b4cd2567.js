/* ============================================================
   Trelawny product search  —  SepcoTech
   Injects a nav search button + overlay panel. Type a product
   name, model (TFP200, VL203, SF11…) or an IMPA code to jump
   straight to the product. Self-contained, no dependencies.
   ============================================================ */
(function(){
  // n=name, m=model/part, c=category, u=url(#anchor), i=IMPA code, t=tag
  var DATA = [
    // --- Needle Scalers ---
    {n:"Low-Vibration Pistol-Grip Needle Scaler", m:"VL203", c:"Needle Scalers", u:"needle-scalers.html#low-vibration", t:"Low HAVS"},
    {n:"Low-Vibration In-Line Needle Scaler", m:"VL223", c:"Needle Scalers", u:"needle-scalers.html#low-vibration", t:"Low HAVS"},
    {n:"Heavy-Duty Low-Vibration Needle Scaler", m:"VL303", c:"Needle Scalers", u:"needle-scalers.html#low-vibration", t:"Low HAVS"},
    {n:"Standard Pistol-Grip Needle Scaler", m:"2BPG", c:"Needle Scalers", u:"needle-scalers.html#standard"},
    {n:"Standard Barrel-Grip Needle Scaler", m:"2B", c:"Needle Scalers", u:"needle-scalers.html#standard"},
    {n:"Standard In-Line Needle Scaler", m:"1B", c:"Needle Scalers", u:"needle-scalers.html#standard"},
    {n:"TVS Needle Scaler", m:"TVS · VL203", c:"Needle Scalers", u:"needle-scalers.html#tvs", t:"Lowest HAVS"},
    {n:"Needle / Chisel Scaler Kit", m:"Cased kit", c:"Needle Scalers", u:"needle-scalers.html#kits"},
    {n:"Long-Reach Needle / Chisel Scaler", m:"Long reach", c:"Needle Scalers", u:"needle-scalers.html#long-reach"},
    {n:"Long-Reach Needle / Chisel Scaler Kit", m:"Long reach · cased", c:"Needle Scalers", u:"needle-scalers.html#long-reach-kits"},
    // --- Scaling Hammers ---
    {n:"SF Scaling Hammer", m:"SF1 · SF3 · VLSF1-EX · SF3-EX · single and triple head", c:"Scaling Hammers", u:"scaling-hammers.html#products", i:"59.03.84"},
    // --- Deck Hammers ---
    {n:"SF11 Deck Hammer", m:"SF11 · 159.5910", c:"Deck Hammers", u:"deck-hammers.html#products"},
    {n:"SF11EX Deck Hammer", m:"SF11EX · 159.5930", c:"Deck Hammers", u:"deck-hammers.html#products", t:"ATEX"},
    // --- Deck Scalers ---
    {n:"TFP200 Deck Scaler", m:"TFP200 · 200 mm", c:"Deck Scalers", u:"deck-scalers.html#products"},
    {n:"PPT Handheld Deck Scaler", m:"PPT", c:"Deck Scalers", u:"deck-scalers.html#products"},
    {n:"Trident / Neptune Deck Scaler", m:"Trident · Neptune", c:"Deck Scalers", u:"deck-scalers.html#products"},
    // --- Surface Strippers ---
    {n:"Long-Reach Scraper / Chisel Scaler", m:"LR stripper", c:"Surface Strippers", u:"surface-strippers.html#products"},
    {n:"TFS230 Floor Stripper", m:"TFS230 · TFS230-VM battery · 230 mm", c:"Surface Strippers", u:"surface-strippers.html#products"},
    // --- Dust Control ---
    {n:"A22 Dust Collector", m:"A22", c:"Dust Control", u:"dust-control.html#products"},
    {n:"A45 Dust Collector", m:"A45 · 540 m³/h", c:"Dust Control", u:"dust-control.html#products"},
    {n:"KAV30 ATEX Pneumatic Vacuum", m:"KAV30 · 30 L", c:"Dust Control", u:"dust-control.html#products", t:"ATEX"},
    // --- Angle Grinders ---
    {n:"Pneumatic Angle Grinder", m:"5\" 170.4045 · 7\" 170.4071", c:"Angle Grinders", u:"angle-grinders.html#products"},
    // --- Hold Cleaning ---
    {n:"Hydraflex Hold Cleaning Gun", m:"342.HY50 · air-assisted water jet · 30 m reach", c:"Hold Cleaning", u:"hold-cleaning.html#products", i:"59.07.42"},
    {n:"Trident Neptune Flexible-Drive Descaler", m:"340.490/S air · 340.TN/S/110 · 340.TN/S/220", c:"Hold Cleaning", u:"hold-cleaning.html#g-trident", i:"59.12.81"},
    // --- IMPA-coded consumables ---
    {n:"3 mm Pointed Needles (x100)", m:"453.3110", c:"Needle Scaler Consumables", u:"needle-scalers.html#products", i:"59.04.88"},
    {n:"3 mm Flat Needles (x100)", m:"453.1110", c:"Needle Scaler Consumables", u:"needle-scalers.html#products", i:"59.04.89"},
    {n:"3 mm Chisel Needles (x100)", m:"453.2110", c:"Needle Scaler Consumables", u:"needle-scalers.html#products", i:"59.04.87"},
    {n:"TVS Vacuum Shroud (VL203/223)", m:"418.2003", c:"Needle Scaler Consumables", u:"needle-scalers.html#tvs", i:"59.25.06"},
    {n:"Flat Chisel", m:"704.1101", c:"Needle Scaler Consumables", u:"needle-scalers.html#products", i:"59.05.91"},
    {n:"Point Chisel", m:"704.1105", c:"Needle Scaler Consumables", u:"needle-scalers.html#products", i:"59.05.94"},
    {n:"TCT Cutters — 5 tips", m:"320.5500", c:"Deck Scaler Consumables", u:"deck-scalers.html#products", i:"59.22.41"},
    {n:"Star Cutters", m:"320.3658", c:"Deck Scaler Consumables", u:"deck-scalers.html#products", i:"59.22.42"},
    {n:"Heavy-Duty Scaling Head", m:"340.550", c:"Hold Cleaning Consumables", u:"hold-cleaning.html#products", i:"59.12.75"},
    {n:"Cutter Head", m:"340.581", c:"Hold Cleaning Consumables", u:"hold-cleaning.html#products", i:"59.12.86"},
    {n:"Flexible Drive Shaft", m:"340.285", c:"Hold Cleaning Consumables", u:"hold-cleaning.html#products", i:"59.12.99"},
    {n:"Power Brush", m:"340.160", c:"Hold Cleaning Consumables", u:"hold-cleaning.html#products", i:"59.12.93"},
    {n:"Long-Reach Chisel", m:"705.1101", c:"Surface Stripper Consumables", u:"surface-strippers.html#products", i:"59.25.21"},
    {n:"Long-Reach Blade", m:"431.3904", c:"Surface Stripper Consumables", u:"surface-strippers.html#products", i:"59.25.25"},
    // --- Resource / guide ---
    {n:"HAV Syndrome Prevention & Vibro-Lo™ Guide", m:"HAVS · low-vibration · Vibro-Lo", c:"Resource & guidance", u:"hav-prevention.html", t:"Guide"},
    // --- New pages: product + hubs ---
    {n:"PPT Peening Preparation Tool", m:"194.0205 · SSPC-SP11 · shot-blast alternative", c:"Surface Prep", u:"ppt-peening-tool.html", i:"59.22.51", t:"Blast alternative"},
    {n:"ATEX Hazardous-Area Tools", m:"Gas Zone 1 · Dust Zone 21 · ATEX Category 2 · VL-Ex · SF-Ex · KAV30", c:"Resource & guidance", u:"atex-tools.html", t:"Guide"},
    {n:"Hot Work Permits & Zone 1 Descaling", m:"ATEX Category 2 · 1999/92/EC · acetylene · beryllium copper", c:"Resource & guidance", u:"hot-work-permit-zone-1-descaling.html", t:"Guide"},
    {n:"Tool Selector — How to Choose the Right Tool", m:"buyer's guide · selection", c:"Resource & guidance", u:"tool-selector.html", t:"Guide"},
    {n:"Dust Control for Needle Scaling Lead Paint", m:"H class · EN 60335-2-69 · lead · silica · LEV", c:"Resource & guidance", u:"dust-control-lead-paint.html", t:"Guide"},
    {n:"Preparing Steel to Bare Metal Without Blasting", m:"SSPC-SP 11 · anchor profile · rotopeen vs bristle vs needle", c:"Resource & guidance", u:"prepare-steel-without-blasting.html", t:"Guide"},
    {n:"Water Blasting vs Mechanical Scaling", m:"UHP jetting · flash rust · MARPOL · cost per m²", c:"Resource & guidance", u:"blasting-vs-scaling.html", t:"Guide"},
    {n:"Deck Descaling Production Rate", m:"m² per shift · A(8) trigger time · compressor sizing", c:"Resource & guidance", u:"deck-descaling-production-rate.html", t:"Guide"},
    {n:"Cleaning a Cargo Hold Between Cargoes", m:"hold wash-down · jet reach · MARPOL Annex V · HME residues", c:"Resource & guidance", u:"cargo-hold-cleaning-between-cargoes.html", t:"Guide"},
    {n:"How Long Can You Safely Use a Needle Scaler?", m:"trigger time · A(8) action value · H1 vs H2 grip · 3BPG vs VL303", c:"Resource & guidance", u:"needle-scaler-vibration-exposure.html", t:"Guide"},
    {n:"Scaling Hammer or Needle Scaler?", m:"SF1 · SF3 · VL303 · welds vs open plate · two-hand vibration", c:"Resource & guidance", u:"scaling-hammer-vs-needle-scaler.html", t:"Guide"},
    {n:"Stripping Floor Coverings Before a Refit", m:"vinyl · lino · carpet tile · TFS230 vs long-reach · trigger time · asbestos", c:"Resource & guidance", u:"strip-floor-coverings-before-refit.html", t:"Guide"}
  ];

  function esc(s){ return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function low(s){ return (s||"").toLowerCase(); }
  function digits(s){ return (s||"").replace(/\D/g,""); }

  function loosen(s){ return s.replace(/[-_/.]/g," ").replace(/\s+/g," ").trim(); }
  function matches(it, q){
    var nq = low(q);
    var hay = low(it.n + " " + (it.m||"") + " " + it.c + " " + (it.i||""));
    // match either the raw query or a punctuation-loosened form, so "low vibration"
    // matches "low-vibration" and "vibro lo" matches "vibro-lo"
    if(nq && (hay.indexOf(nq) > -1 || loosen(hay).indexOf(loosen(nq)) > -1)) return true;
    // numeric IMPA code search only when the query is digits + separators
    // (so model names like "kav30" / "a45" / "sf11" match on text, not stray digits)
    if(/^[\d.\-\s]+$/.test(q)){
      var dq = digits(q);
      if(dq.length >= 2 && (digits(it.i).indexOf(dq) > -1 || digits(it.m).indexOf(dq) > -1)) return true;
    }
    return false;
  }

  function build(){
    if(document.querySelector(".tr-search-btn")) return;
    var nav = document.querySelector(".sd-side-in");
    if(!nav) return;

    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "tr-search-btn"; btn.setAttribute("aria-label","Search products");
    btn.innerHTML = '<span class="tr-search-ico">&#128269;</span><span class="tr-search-label">Search products</span><span class="tr-search-hint">/</span>';
    var cta = nav.querySelector(".nav-cta");
    if(cta){ nav.insertBefore(btn, cta); } else { nav.appendChild(btn); }

    var ov = document.createElement("div"); ov.className = "tr-search-overlay";
    ov.innerHTML =
      '<div class="tr-search-panel" role="dialog" aria-label="Product search">' +
        '<div class="tr-search-inputwrap"><span class="tr-search-ico">&#128269;</span>' +
        '<input type="text" class="tr-search-input" placeholder="Search by product, model or IMPA code — e.g. TFP200, VL203, 59.04.88" autocomplete="off" spellcheck="false">' +
        '<span class="tr-search-esc">ESC</span></div>' +
        '<div class="tr-search-results"></div>' +
        '<div class="tr-search-foot"><span><kbd>&#8593;</kbd> <kbd>&#8595;</kbd> navigate</span><span><kbd>&#8629;</kbd> open</span><span>' + DATA.length + ' products &amp; consumables indexed</span></div>' +
      '</div>';
    document.body.appendChild(ov);

    var input = ov.querySelector(".tr-search-input");
    var results = ov.querySelector(".tr-search-results");
    var sel = -1, current = [];

    function render(q){
      current = q ? DATA.filter(function(it){ return matches(it,q); }).slice(0,12) : DATA.slice(0,8);
      if(!current.length){
        results.innerHTML = '<div class="tr-search-empty">No products match &ldquo;' + esc(q) + '&rdquo;. Try a model (TFP200, VL203, SF11), an IMPA code.</div>';
        sel = -1; return;
      }
      sel = 0;
      results.innerHTML = current.map(function(it, idx){
        var tag = it.t ? '<span class="tr-search-result-tag">' + esc(it.t) + '</span>' : "";
        var impa = [it.i ? 'IMPA ' + esc(it.i) : '']
          .filter(Boolean).map(function(c){ return '<span class="tr-search-result-impa">' + c + '</span>'; }).join("");
        var meta = [it.m, it.c].filter(Boolean).join(" · ");
        return '<a class="tr-search-result' + (idx===0?" sel":"") + '" href="' + it.u + '">' +
          '<span class="tr-search-result-main"><span class="tr-search-result-name">' + esc(it.n) + '</span>' +
          '<span class="tr-search-result-meta">' + esc(meta) + '</span></span>' + impa + tag + '</a>';
      }).join("");
    }

    function setSel(i){
      var nodes = results.querySelectorAll(".tr-search-result");
      if(!nodes.length) return;
      sel = (i + nodes.length) % nodes.length;
      for(var k=0;k<nodes.length;k++){ nodes[k].classList.toggle("sel", k===sel); }
      nodes[sel].scrollIntoView({block:"nearest"});
    }
    function go(){ if(current[sel]){ location.href = current[sel].u; } }

    function open(){ ov.classList.add("open"); input.value=""; render(""); setTimeout(function(){ input.focus(); }, 30); document.documentElement.style.overflow="hidden"; }
    function close(){ ov.classList.remove("open"); document.documentElement.style.overflow=""; }

    btn.addEventListener("click", open);
    ov.querySelector(".tr-search-esc").addEventListener("click", close);
    ov.addEventListener("click", function(e){ if(e.target===ov){ close(); } });
    input.addEventListener("input", function(){ render(input.value.trim()); });
    input.addEventListener("keydown", function(e){
      if(e.key==="ArrowDown"){ e.preventDefault(); setSel(sel+1); }
      else if(e.key==="ArrowUp"){ e.preventDefault(); setSel(sel-1); }
      else if(e.key==="Enter"){ e.preventDefault(); go(); }
      else if(e.key==="Escape"){ close(); }
    });
    document.addEventListener("keydown", function(e){
      var tag = (e.target && e.target.tagName) || "";
      if(e.key==="/" && !/INPUT|TEXTAREA|SELECT/.test(tag) && !ov.classList.contains("open")){ e.preventDefault(); open(); }
      else if(e.key==="Escape" && ov.classList.contains("open")){ close(); }
    });
  }

  if(document.readyState !== "loading"){ build(); } else { document.addEventListener("DOMContentLoaded", build); }
})();
