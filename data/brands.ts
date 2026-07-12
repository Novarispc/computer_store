/**
 * Brand dictionary, drawn from the brand names listed against each category on
 * esquirecomputers.com/products plus the spellings that actually appear inside
 * the price-list PDFs (`VGURD`, `ZEBSTER`, `CONSISTANT`, …).
 *
 * `aliases` are matched, case-insensitively, at the start of a price-list row.
 * Matching is longest-first so "CP PLUS" wins over "CP", and "HI-FOCUS" over "HI".
 */

export type BrandSeed = {
  slug: string;
  name: string;
  aliases: string[];
  featured?: boolean;
};

export const brands: BrandSeed[] = [
  { slug: "hp", name: "HP", aliases: ["HP"], featured: true },
  { slug: "dell", name: "Dell", aliases: ["DELL"], featured: true },
  { slug: "acer", name: "Acer", aliases: ["ACER"], featured: true },
  { slug: "lenovo", name: "Lenovo", aliases: ["LENOVO"], featured: true },
  { slug: "asus", name: "Asus", aliases: ["ASUS"], featured: true },
  { slug: "msi", name: "MSI", aliases: ["MSI"], featured: true },
  { slug: "samsung", name: "Samsung", aliases: ["SAMSUNG"], featured: true },
  { slug: "lg", name: "LG", aliases: ["LG"], featured: true },
  { slug: "toshiba", name: "Toshiba", aliases: ["TOSHIBA"] },

  // Displays
  { slug: "benq", name: "BenQ", aliases: ["BENQ"] },
  { slug: "viewsonic", name: "ViewSonic", aliases: ["VIEWSONIC"] },
  { slug: "aoc", name: "AOC", aliases: ["AOC"] },
  { slug: "foxin", name: "Foxin", aliases: ["FOXIN"] },
  { slug: "zebronics", name: "Zebronics", aliases: ["ZEBRONICS", "ZEBSTER"] },
  { slug: "geonix", name: "Geonix", aliases: ["GEONIX"] },
  { slug: "fingers", name: "Fingers", aliases: ["FINGERS"] },
  { slug: "lapcare", name: "Lapcare", aliases: ["LAPCARE"] },
  { slug: "frontech", name: "Frontech", aliases: ["FRONTECH", "FRONTEC"] },
  { slug: "consistent", name: "Consistent", aliases: ["CONSISTANT", "CONSISTENT"] },

  // Printers
  { slug: "canon", name: "Canon", aliases: ["CANON"], featured: true },
  { slug: "epson", name: "Epson", aliases: ["EPSON"], featured: true },
  { slug: "brother", name: "Brother", aliases: ["BROTHER"] },
  { slug: "ricoh", name: "Ricoh", aliases: ["RICOH"] },
  { slug: "pantum", name: "Pantum", aliases: ["PANTUM"] },
  { slug: "tvse", name: "TVSE", aliases: ["TVSE", "TVS-E", "TVS"] },

  // Power
  { slug: "apc", name: "APC", aliases: ["APC"], featured: true },
  { slug: "v-guard", name: "V-Guard", aliases: ["V-GUARD", "VGUARD", "VGURD"] },
  { slug: "exide", name: "Exide", aliases: ["EXIDE"] },
  { slug: "microtek", name: "Microtek", aliases: ["MICROTEK", "MICROTEC"] },
  { slug: "numeric", name: "Numeric", aliases: ["NUMERIC"] },
  { slug: "hykon", name: "Hykon", aliases: ["HYKON"] },
  { slug: "atec", name: "Atec", aliases: ["ATEC"] },
  { slug: "uniline", name: "Uniline", aliases: ["UNILINE"] },

  // Surveillance
  { slug: "hikvision", name: "Hikvision", aliases: ["HIKVISION"], featured: true },
  { slug: "cp-plus", name: "CP Plus", aliases: ["CP PLUS", "CP-PLUS", "CPPLUS"] },
  { slug: "dahua", name: "Dahua", aliases: ["DAHUA"] },
  { slug: "prama", name: "Prama", aliases: ["PRAMA"] },
  { slug: "uniview", name: "Uniview", aliases: ["UNV", "UNIVIEW"] },
  { slug: "hi-focus", name: "Hi-Focus", aliases: ["HI-FOCUS", "HIFOCUS"] },
  { slug: "honeywell", name: "Honeywell", aliases: ["HONEYWELL"] },
  { slug: "ezviz", name: "Ezviz", aliases: ["EZVIZ"] },
  { slug: "trueview", name: "TrueView", aliases: ["TRUEVIEW"] },
  { slug: "secureye", name: "Secureye", aliases: ["SECUREYE"] },

  // Networking
  { slug: "d-link", name: "D-Link", aliases: ["D-LINK", "DLINK"] },
  { slug: "tp-link", name: "TP-Link", aliases: ["TP-LINK", "TPLINK"] },
  { slug: "cisco", name: "Cisco", aliases: ["CISCO"] },
  { slug: "belkin", name: "Belkin", aliases: ["BELKIN"] },
  { slug: "netgear", name: "Netgear", aliases: ["NETGEAR"] },
  { slug: "aruba", name: "Aruba", aliases: ["ARUBA"] },
  { slug: "ubiquiti", name: "Ubiquiti", aliases: ["UBIQUITI"] },
  { slug: "linksys", name: "Linksys", aliases: ["LINKSYS"] },
  { slug: "syrotech", name: "Syrotech", aliases: ["SYROTECH"] },
  { slug: "digisol", name: "Digisol", aliases: ["DIGISOL"] },
  { slug: "tenda", name: "Tenda", aliases: ["TENDA"] },

  // Security software
  { slug: "quick-heal", name: "Quick Heal", aliases: ["QUICK HEAL", "QUICKHEAL"] },
  { slug: "escan", name: "eScan", aliases: ["E-SCAN", "ESCAN"] },
  { slug: "kaspersky", name: "Kaspersky", aliases: ["KASPERSKY"] },
  { slug: "k7", name: "K7", aliases: ["K7"] },
  { slug: "mcafee", name: "McAfee", aliases: ["MCAFEE"] },
  { slug: "norton", name: "Norton", aliases: ["NORTON"] },
  { slug: "fortinet", name: "Fortinet", aliases: ["FORTINET"] },
  { slug: "sophos", name: "Sophos", aliases: ["SOPHOS"] },
  { slug: "seqrite", name: "Seqrite", aliases: ["SEQRITE"] },

  // Access control
  { slug: "essl", name: "ESSL", aliases: ["ESSL"] },
  { slug: "zion", name: "Zion", aliases: ["ZION"] },
  { slug: "securico", name: "Securico", aliases: ["SECURICO"] },
  { slug: "panasonic", name: "Panasonic", aliases: ["PANASONIC"] },

  // Furniture
  { slug: "furnimate", name: "Furnimate", aliases: ["FURNIMATE"] },
  { slug: "wtc", name: "WTC", aliases: ["WTC"] },

  // Climate
  { slug: "godrej", name: "Godrej", aliases: ["GODREJ"] },
  { slug: "voltas", name: "Voltas", aliases: ["VOLTAS"] },
  { slug: "lloyd", name: "Lloyd", aliases: ["LLOYD"] },
  { slug: "daikin", name: "Daikin", aliases: ["DAIKIN"] },
  { slug: "ifb", name: "IFB", aliases: ["IFB"] },
  { slug: "carrier", name: "Carrier", aliases: ["CARRIER"] },
  { slug: "blue-star", name: "Blue Star", aliases: ["BLUSTER", "BLUE STAR"] },

  // Solar
  { slug: "waaree", name: "Waaree Energies", aliases: ["WAAREE"] },
  { slug: "havells", name: "Havells", aliases: ["HAVELLS"] },
  { slug: "utl", name: "UTL", aliases: ["UTL"] },
];

/** Every alias, longest first, so "CP PLUS" is tried before "CP". */
export const brandAliasIndex: { alias: string; slug: string }[] = brands
  .flatMap((b) => b.aliases.map((alias) => ({ alias: alias.toUpperCase(), slug: b.slug })))
  .sort((a, b) => b.alias.length - a.alias.length);
