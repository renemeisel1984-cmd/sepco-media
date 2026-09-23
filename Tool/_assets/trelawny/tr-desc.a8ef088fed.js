/* Trelawny descriptive labels for SKUs the workbook flattened to generic names
   (blades, long-reach chisels, cutter heads). Sourced from the ds-*.pdf datasheets.
   { partNo: { label: dropdown/card label, use: "best for" application } } */
window.TR_DESC = {
  /* Long-reach scraper blades - 431.xxxx = single assembly, 439.xxxx = pack */
  "431.3504": { label:"102 mm Flat-Edge - single",     use:"Adhesive & paint removal" },
  "439.3504": { label:"102 mm Flat-Edge - pack of 5",  use:"Adhesive & paint removal" },
  "431.3508": { label:"203 mm Flat-Edge - single",     use:"Paint & coating-spillage removal" },
  "439.3508": { label:"203 mm Flat-Edge - pack of 5",  use:"Paint & coating-spillage removal" },
  "431.3512": { label:"305 mm Flat-Edge - single",     use:"Carpet & tile removal" },
  "439.3512": { label:"305 mm Flat-Edge - pack of 4",  use:"Carpet & tile removal" },
  "431.3904": { label:"102 mm Bevelled - single",      use:"Stubborn adhesive removal" },
  "439.3524": { label:"102 mm Bevelled - pack of 5",   use:"Stubborn adhesive removal" },
  "431.3908": { label:"203 mm Bevelled - single",      use:"Carpet & tile removal" },
  "439.3528": { label:"203 mm Bevelled - pack of 5",   use:"Carpet & tile removal" },
  "431.3912": { label:"305 mm Bevelled - single",      use:"Stubborn adhesive removal" },
  "439.3522": { label:"305 mm Bevelled - pack of 4",   use:"Stubborn adhesive removal" },
  /* Long-reach chisels */
  "705.1100": { label:"229 mm, 50 mm blade - aluminium-bronze", use:"Spark-resistant, hazardous areas" },
  "705.1101": { label:"229 mm, 25 mm flat blade",              use:"Sand-cast chipping" },
  "705.1102": { label:"203 mm, 100 mm blade",                  use:"General chipping, asphalt, paint" },
  "705.1106": { label:"229 mm, 50 mm blade",                   use:"Linoleum removal from floor base" },
  "705.1112": { label:"203 mm, 100 mm blade - aluminium-bronze", use:"Spark-resistant, hazardous areas" },
  "705.2102": { label:"Cranked 203 mm, 100 mm blade",          use:"Floor-tile removal" },
  "708.1100": { label:"203 mm with comb insert",              use:"Use with comb insert" },
  "708.1101": { label:"25 mm with 38 mm comb insert",         use:"Brick cleaning & reclamation" },
  /* Scaling/deck-hammer cutter heads & pistons (two share the name 'Cruciform Taper Fit Cutter Head') */
  "426.5351": { label:"Cruciform - tungsten carbide",                 use:"Fracturing & coating removal" },
  "606.5303": { label:"Cruciform - beryllium copper (spark-resistant)", use:"Explosive / ATEX areas" },
  "426.5352": { label:"Bush hammer - tungsten carbide",               use:"Creates a heavier surface key" },
  "612.5301": { label:"Piston to fit cutter heads" },
  "612.5305": { label:"Single-piece steel piston" },
  /* TFP200 scarifier cutters (ds-tfp200) */
  "320.5500": { use:"Concrete texturing, scabbling, planing & grooving" },
  "320.3658": { use:"Paint, coatings & laitance; deck descaling" },
  "320.5120": { use:"Paint, coatings, grease, dirt & ice removal" },
  "320.9622": { use:"General cleaning & light surface rust" },
  "320.9612": { use:"General cleaning & light surface rust" },
  "320.4140": { label:"Spacer (sets cutter gap)", use:"Creates the gap between cutters" },
  "320.1020ST": { use:"Pre-assembled TCT-cutter drum" },
  "320.1020SS": { use:"Pre-assembled star-cutter drum" },
  "320.1020SB": { use:"Pre-assembled beam-cutter drum" },
  "320.9620": { use:"Pre-assembled twisted-knot wire-brush drum" },
  "320.9610": { use:"Pre-assembled crimped-wire-brush drum" },
  /* PPT peening cutters (ds-ppt) */
  "312.S200": { use:"Aggressive removal of thick coatings" },
  "312.R200": { use:"Hard coatings - less aggressive than star" },
  "312.MRPC": { use:"Paint & rust to a near-white-metal finish" },
  "438.0220": { use:"Hub c/w star cutters - thick coatings" },
  "438.0420": { use:"Hub c/w star cutters - thick coatings" },
  "438.0225": { use:"Hub c/w beam cutters - hard coatings" },
  "438.0425": { use:"Hub c/w beam cutters - hard coatings" },
  "438.0235": { use:"Rotopeen C-flap assembly - paint & rust to bare metal" },
  "438.0435": { use:"Rotopeen C-flap assembly - paint & rust to bare metal" },
  /* Angle-grinder discs & brushes (ds-angle-grinder) */
  "491.4005": { use:"Coating & rust removal without damaging the steel" },
  "851.4065": { use:"Feathering surface rust" },
  "851.4060": { use:"Feathering surface rust" },
  "491.4050": { use:"Grinding & cutting (4-inch)" },
  "491.4055": { use:"Grinding & cutting (5-inch)" },
  "491.4070": { use:"Grinding & cutting (7-inch)" },
  /* Trident Neptune heads & brushes (ds-trident-neptune) */
  "340.550": { use:"Heavy chipping & descaling" },
  "340.581": { use:"Rapid descaling" },
  "340.160": { use:"Wire brushing & finishing" },
  "340.163": { use:"Wire brushing & finishing" },
  "340.166": { use:"Wire brushing & finishing" },
  "340.167": { use:"Wire brushing & finishing" }
};
