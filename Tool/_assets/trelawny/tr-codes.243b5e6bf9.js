/* Trelawny IMPA procurement codes — part number -> {impa}.
   Source: trelawny.com/codes/, re-scraped 23 Sep 2026 via the Browser pane (server-side
   fetch still 403s). Shared across all redesigned pages.

   IMPA only, by policy. Nine SKUs that Trelawny lists with a procurement code but no IMPA
   were dropped from this map rather than left present-but-codeless; see the note file kept
   alongside the page sources. */
window.TR_CODES = {
  /* Angle grinders are not on /codes/; these two IMPA codes come from ds-angle-grinder.pdf. */
  "170.4050": { impa:"59.03.01" },
  "170.4071": { impa:"59.03.02" },
  "418.3040": { impa:"59.25.02" },
  "418.2200": { impa:"59.25.01" },
  "418.3003": { impa:"59.25.07" },
  "418.2003": { impa:"59.25.06" },
  "704.3103": { impa:"59.19.02" },
  "704.3101": { impa:"59.19.01" },
  "704.3107": { impa:"59.19.05" },
  "704.3110": { impa:"59.19.03" },
  "704.3205": { impa:"59.19.04" },
  "426.5351": { impa:"59.03.85" },
  "606.5303": { impa:"59.03.89" },
  /* Tools are not on /codes/; this one is from the SF product-page spec table. */
  "196.5095": { impa:"59.03.84" },
  "320.002H": { impa:"59.22.47" },
  "320.0020": { impa:"59.22.49" },
  "340.550": { impa:"59.12.75" },
  "340.581": { impa:"59.12.86" },
  "340.285": { impa:"59.12.99" },
  "340.160": { impa:"59.12.93" },
  "340.163": { impa:"59.12.91" },
  "340.166": { impa:"59.12.97" },
  "340.167": { impa:"59.12.95" },
  "320.5500": { impa:"59.22.41" },
  "320.3658": { impa:"59.22.42" },
  "320.5120": { impa:"59.22.43" },
  "320.9610": { impa:"59.22.44" },
  "320.9620": { impa:"59.22.45" },
  "438.0209": { impa:"59.22.91" },
  "438.0409": { impa:"59.22.92" },
  "312.S200": { impa:"59.22.56" },
  "312.MRPC": { impa:"59.22.58" },
  "312.R200": { impa:"59.22.57" },
  "438.0405": { impa:"59.22.94" },
  "438.0205": { impa:"59.22.93" },
  "453.2110": { impa:"59.04.87" },
  "453.3110": { impa:"59.04.88" },
  "453.1110": { impa:"59.04.89" },
  "705.1101": { impa:"59.25.21" },
  "705.1102": { impa:"59.04.56" },
  "705.1106": { impa:"59.04.55" },
  "431.3904": { impa:"59.25.25" },
  "431.3512": { impa:"59.04.58" },
  "431.3508": { impa:"59.04.57" },
  "431.3504": { impa:"59.04.45" },
  "705.1112": { impa:"59.04.30" },
  "431.3912": { impa:"59.25.27" },
  "431.3908": { impa:"59.25.26" },
  "415.3532": { impa:"59.04.85" },
  "704.1101": { impa:"59.05.91" },
  "708.1101": { impa:"59.25.24" },
  "708.1100": { impa:"59.25.23" },
  "705.2102": { impa:"59.25.22" },
  "704.1107": { impa:"59.02.92" },
  "704.1103": { impa:"59.05.93" },
  "704.1105": { impa:"59.05.94" },
  "704.2105": { impa:"55.05.95" },
  "704.1110": { impa:"59.05.97" },
  /* Hold cleaning — Hydraflex. Trelawny's own product page prints "55.07.42"
     against 342.HY50, which is a typo for 59.07.42: the IMPA Marine Stores Guide
     maps 590742 to the kit on tripod. Accessory codes 590746-590750 follow the
     IMPA catalogue, not trelawny.com, which does not publish them. */
  "342.HY50": { impa:"59.07.42" },
  "342.HY03": { impa:"59.07.46" },
  "342.HY04": { impa:"59.07.47" },
  "342.HY05": { impa:"59.07.48" },
  "342.HY07": { impa:"59.07.49" },
  "342.HY60A": { impa:"59.07.50" },
  /* Trident Neptune machines — the consumable heads are already listed above */
  "340.490/S": { impa:"59.12.81" },
  "340.TN/S/110": { impa:"59.12.41" },
  "340.TN/S/220": { impa:"59.12.42" }
};
