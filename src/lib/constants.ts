/** SQLite has no enum type. These literals are the source of truth. */

export const PRODUCT_CONDITIONS = ["NEW", "REFURBISHED"] as const;
export type ProductCondition = (typeof PRODUCT_CONDITIONS)[number];

export const ENQUIRY_KINDS = ["QUOTE", "CONTACT"] as const;
export type EnquiryKind = (typeof ENQUIRY_KINDS)[number];

export const ENQUIRY_STATUSES = ["NEW", "CONTACTED", "QUOTED", "CLOSED"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const HOMEPAGE_SECTION_TYPES = [
  "HERO",
  "HIGHLIGHTS",
  "FEATURED",
  "CATEGORY_GRID",
  "BRANDS",
  "SERVICES",
  "TRUST",
  "CTA",
] as const;

/** Key inside HomepageSection.dataJson for the HIGHLIGHTS product picker. */
export const HIGHLIGHTS_SECTION_TYPE = "HIGHLIGHTS";
export type HomepageSectionType = (typeof HOMEPAGE_SECTION_TYPES)[number];

export const PRODUCT_SORTS = [
  "relevance",
  "price-asc",
  "price-desc",
  "name-asc",
  "newest",
] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export const PAGE_SIZE = 24;

/** Shown wherever a price appears. Esquire's own price lists carry this caveat. */
export const PRICE_DISCLAIMER = "Indicative — subject to change";

export const ADMIN_COOKIE = "esq_admin";
export const MODE_STORAGE_KEY = "esq-mode";
export const INTRO_STORAGE_KEY = "esq-intro";
