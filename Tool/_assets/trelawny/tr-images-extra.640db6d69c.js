/* Trelawny product photography added 13 Sep 2026.
   TR_IMAGES_EXTRA - part number -> card photo, for SKUs where a
   part-number-named original exists in the principal's own folder.
   TR_FAMILY_IMAGES - group id -> the range photo a main-product card
   falls back to when its own SKU has none.
   Both are additive: assets/tr-images.js is generated and untouched. */
window.TR_IMAGES_EXTRA = {
  "123.2100": "tr-pn-123-2100-600.avif",
  "136.3200": "tr-pn-136-3200-600.avif",
  "153.5300": "tr-pn-153-5300-600.avif",
  "159.5910": "tr-pn-159-5910-600.avif",
  "194.0405": "tr-pn-194-0405-600.avif",
  "196.2003": "tr-pn-196-2003-600.avif",
  "196.3105": "tr-pn-196-3105-600.avif",
  "196.5095": "tr-pn-196-5095-600.avif",
  "320.1020SS": "tr-pn-320-1020ss-600.avif",
  "320.1020ST": "tr-pn-320-1020st-600.avif",
  /* the g-trident range photo is the ELECTRIC machine; the air model gets its own (450 px, the only air shot on file) */
  "340.490/S": "tr-trident-neptune-air.avif",
  /* the g-tfs230 range photo is the MAINS machine (from ds-tfs230.pdf); the battery VM models get the VoltMax shot */
  "323.2510": "tr-tfs230-vm-01-600.avif",
  "323.2515": "tr-tfs230-vm-01-600.avif",
  /* TFP200 brush consumables: Trelawny's own product-name files, previously unmapped so the Brushes card opened blank (26 Sep 2026) */
  "320.9610": "Drum-Assembly-Crimped-Wire-Brush.avif",
  "320.9620": "Drum-Assembly-Twisted-Knot-Wire-Brush.avif",
  "320.9622": "Twisted-Knot-Wire-Brush-Refill-1.avif",
  "426.5351": "tr-pn-426-5351-600.avif",
  "446.1520": "tr-pn-446-1520-600.avif",
  "446.1540": "tr-pn-446-1540-600.avif",
  "446.3003": "tr-pn-446-3003-600.avif",
  "453.2110": "tr-pn-453-2110-600.avif",
};
window.TR_FAMILY_IMAGES = {
  "g-low": { card: "tr-vl-range-lineup-01-600.avif", big: "tr-vl-range-lineup-01.avif" },
  "g-std": { card: "tr-needle-scaler-01-600.avif", big: "tr-needle-scaler-01.avif" },
  "g-tvs": { card: "TVS Needle Scalers.avif", big: "TVS Needle Scalers.avif" },
  "g-kit": { card: "tr-scaler-kit-case-01-600.avif", big: "tr-scaler-kit-case-01.avif" },
  /* tr-long-reach-scaler-01/02/03 are NOT long-reach tools: they are the SF1 Vibro-Lo scaling hammer (same shot as tr-pn-196-5095). Use the page's own declared long-reach photo (26 Sep 2026). */
  "g-lr": { card: "Long Reach Needle & Chisel Scalers.webp", big: "Long Reach Needle & Chisel Scalers.webp" },
  "g-tfp200": { card: "tr-tfp200-03-600.avif", big: "tr-tfp200-03.avif" },
  "g-ppt": { card: "tr-ppt-rotopeen-drum-01-600.avif", big: "tr-ppt-rotopeen-drum-01.avif" },
  "g-trident": { card: "tr-trident-neptune-kit-01-600.avif", big: "tr-trident-neptune-kit-01.avif" },
  "g-tfs230": { card: "tr-tfs230-mains-01-600.avif", big: "tr-tfs230-mains-01.avif" },
  "g-lrs": { card: "tr-long-reach-scraper-01-600.avif", big: "tr-long-reach-scraper-01.avif" },
  "g-a22": { card: "A22 Dust Collector.avif", big: "A22 Dust Collector.avif" },
  "g-a45": { card: "A45 Dust Collector.avif", big: "A45 Dust Collector.avif" },
  "g-kav30": { card: "tr-kav30-vacuum-01-600.avif", big: "tr-kav30-vacuum-01.avif" },
  "g-atex-scalers": { card: "tr-atex-needle-scaler-02-600.avif", big: "tr-atex-needle-scaler-02.avif" },
  "g-atex-hammers": { card: "tr-atex-scabbling-hammer-01-600.avif", big: "tr-atex-scabbling-hammer-01.avif" },
  "g-atex-vac": { card: "tr-kav30-vacuum-01-600.avif", big: "tr-kav30-vacuum-01.avif" },
  "g-sf": { card: "tr-scaling-hammer-01-600.avif", big: "tr-scaling-hammer-01.avif" },
  "g-sf11": { card: "tr-sf11-deck-hammer-01-600.avif", big: "tr-sf11-deck-hammer-01.avif" },
  "g-ag": { card: "tr-angle-grinder-01-600.avif", big: "tr-angle-grinder-01.avif" },
};
/* merge the extras over the generated map, without replacing it */
(function(){ var m = window.TR_IMAGES = window.TR_IMAGES || {};
  var x = window.TR_IMAGES_EXTRA; for (var k in x) m[k] = x[k]; })();
