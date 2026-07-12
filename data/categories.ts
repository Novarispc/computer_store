/** The 21 categories listed on esquirecomputers.com/products. */

export type CategorySeed = {
  slug: string;
  name: string;
  description: string;
  icon: string; // lucide-react icon name
  featured?: boolean;
};

export const categories: CategorySeed[] = [
  {
    slug: "laptops",
    name: "Laptops",
    description: "Everyday and business notebooks from HP, Dell, Acer, Lenovo, MSI and Asus.",
    icon: "Laptop",
    featured: true,
  },
  {
    slug: "gaming-laptops",
    name: "Gaming Laptops",
    description: "Discrete-graphics machines built for frame rates, with high-refresh panels.",
    icon: "Gamepad2",
    featured: true,
  },
  {
    slug: "refurbished-laptops",
    name: "Refurbished Laptops",
    description: "Tested and reconditioned business-class notebooks at a lower price.",
    icon: "RefreshCw",
    featured: true,
  },
  {
    slug: "laptop-accessories",
    name: "Laptop Accessories",
    description: "Cases, cooling pads, external drives, keyboards, dongles and stands.",
    icon: "Headphones",
  },
  {
    slug: "branded-desktops",
    name: "Branded Desktops",
    description: "Ready-to-deploy tower desktops with warranty and onsite support.",
    icon: "Monitor",
    featured: true,
  },
  {
    slug: "all-in-one-desktops",
    name: "All-in-One Desktops",
    description: "Single-unit desktops that fold the whole machine behind the display.",
    icon: "MonitorSpeaker",
  },
  {
    slug: "custom-desktops",
    name: "Custom-made Desktops",
    description: "Built to your specification: cabinet, board, cooling, storage, peripherals.",
    icon: "Cpu",
    featured: true,
  },
  {
    slug: "desktop-accessories",
    name: "Desktop Accessories",
    description: "Headsets, external drives, dongles and Wi-Fi extenders.",
    icon: "Cable",
  },
  {
    slug: "pc-security",
    name: "PC Security Products",
    description: "Endpoint protection from Quick Heal, Kaspersky, Norton, Sophos and Seqrite.",
    icon: "ShieldCheck",
  },
  {
    slug: "servers",
    name: "Branded Servers",
    description: "Tower and rack servers from HP, Dell, Acer and Lenovo.",
    icon: "Server",
  },
  {
    slug: "monitors",
    name: "Monitors",
    description: "19 to 32 inch panels: TN, VA and IPS, from budget to colour-accurate.",
    icon: "Monitor",
    featured: true,
  },
  {
    slug: "designed-monitors",
    name: "Designed Monitors",
    description: "Curved, borderless and high-refresh panels where the look matters too.",
    icon: "MonitorPlay",
  },
  {
    slug: "printers",
    name: "Printers",
    description: "Inkjet, ink tank, laser, dot matrix, thermal, barcode, card and passbook.",
    icon: "Printer",
    featured: true,
  },
  {
    slug: "pos-machines",
    name: "POS Machines",
    description: "Point-of-sale terminals from TVSE, B-POS and Retisol.",
    icon: "ScanLine",
  },
  {
    slug: "power-backup",
    name: "Power Backup",
    description: "UPS, inverters and batteries from APC, V-Guard, Exide, Numeric and Hykon.",
    icon: "BatteryCharging",
    featured: true,
  },
  {
    slug: "networking",
    name: "Networking Products",
    description: "Routers, switches, access points and firewalls for home and office.",
    icon: "Network",
  },
  {
    slug: "cctv",
    name: "CCTV Products",
    description: "Cameras, recorders and surveillance kits from Hikvision, CP Plus and Dahua.",
    icon: "Cctv",
    featured: true,
  },
  {
    slug: "security-products",
    name: "Security Products",
    description: "Access control, attendance and alarm systems from ESSL, Zion and Panasonic.",
    icon: "Fingerprint",
  },
  {
    slug: "computer-furniture",
    name: "Computer Furniture",
    description: "Ergonomic chairs, workstations and tables built for long hours.",
    icon: "Armchair",
  },
  {
    slug: "air-conditioners",
    name: "Air Conditioners",
    description: "Split and window units from LG, Daikin, Voltas, Samsung and Carrier.",
    icon: "AirVent",
  },
  {
    slug: "solar-panels",
    name: "Solar Panels",
    description: "Rooftop solar from V-Guard, Waaree, Havells and UTL.",
    icon: "SunMedium",
  },
];

/**
 * Which downloadable price list feeds which category, and how its rows are shaped.
 *
 *  - `tabular`   columns are concatenated with no delimiter; rows end at a price token
 *  - `furniture` newline-delimited: code, name, spec paragraph, price
 *  - `skip`      PDF text extraction lost the column association entirely
 *
 * `bareNumbers` allows a comma-grouped number with no rupee sign to terminate a row.
 * It is opt-in per list, because in the rupee-marked lists a bare number is far
 * more likely to be part of a spec than a price.
 */
export type PriceListShape = "tabular" | "furniture" | "skip";

export type PriceList = {
  id: string;
  categorySlug: string;
  shape: PriceListShape;
  bareNumbers?: boolean;
  condition?: "NEW" | "REFURBISHED";
  /** Reason surfaced in the normalizer report when shape is "skip". */
  skipReason?: string;
};

export const priceLists: PriceList[] = [
  { id: "2383", categorySlug: "monitors", shape: "tabular" },
  { id: "4566", categorySlug: "designed-monitors", shape: "tabular" },
  { id: "2680", categorySlug: "laptops", shape: "tabular" },
  { id: "3759", categorySlug: "gaming-laptops", shape: "tabular" },
  {
    id: "2686",
    categorySlug: "refurbished-laptops",
    shape: "tabular",
    bareNumbers: true,
    condition: "REFURBISHED",
  },
  { id: "2682", categorySlug: "branded-desktops", shape: "tabular" },
  { id: "4084", categorySlug: "all-in-one-desktops", shape: "tabular" },
  { id: "2684", categorySlug: "printers", shape: "tabular" },
  { id: "4194", categorySlug: "power-backup", shape: "tabular", bareNumbers: true },
  { id: "4096", categorySlug: "computer-furniture", shape: "furniture", bareNumbers: true },
  {
    id: "4101",
    categorySlug: "cctv",
    shape: "skip",
    skipReason:
      "PDF text extraction emitted every price in one block and every brand/spec label in another, so the row-to-brand association is lost. Pairing them would be guesswork on a real catalogue, so no CCTV products are seeded. Add them via the admin panel.",
  },
];
