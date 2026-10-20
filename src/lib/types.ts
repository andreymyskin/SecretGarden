export type Photo = {
  id: string;
  url: string;
  caption: string;
};

/** A titled card with a cover and its own gallery (a studio location or a photo project). */
export type CollectionItem = {
  id: string;
  title: string;
  description: string;
  cover: string;
  photos: Photo[];
};

export type Zone = CollectionItem;

export type EquipmentItem = {
  id: string;
  title: string;
  description: string;
  image: string;
};

/** A run of text; `bold` marks a fragment the admin highlighted. */
export type TextPart = {
  text: string;
  bold: boolean;
};

export const STRENGTH_ICONS = ["camera", "building", "piano", "map", "dress", "price"] as const;
export type StrengthIcon = (typeof STRENGTH_ICONS)[number];

export function isStrengthIcon(value: string): value is StrengthIcon {
  return (STRENGTH_ICONS as readonly string[]).includes(value);
}

/** One line in the hero list under the studio title. */
export type HeroPoint = {
  id: string;
  icon: StrengthIcon;
  parts: TextPart[];
};

/** One offer card in the price section. */
export type PriceCard = {
  id: string;
  title: string;
  price: string;
  description: TextPart[];
};

export type GallerySection = "hero" | "studio" | "wardrobe" | "light";
export type CollectionKind = "zones" | "projects";

/** Landing blocks that can be hidden from publication in the admin panel. */
export type ToggleableSection = "studio" | "projects" | "zones" | "wardrobe" | "equipment" | "light";
export type SectionVisibility = Record<ToggleableSection, boolean>;

export const TOGGLEABLE_SECTIONS: ToggleableSection[] = [
  "studio",
  "projects",
  "zones",
  "wardrobe",
  "equipment",
  "light",
];

export function isToggleableSection(value: string): value is ToggleableSection {
  return (TOGGLEABLE_SECTIONS as string[]).includes(value);
}

/** Landing blocks whose order on the page can be changed in the admin panel. «Правила» and «Контакты» always close the page. */
export type OrderableSection = ToggleableSection | "price";

export const ORDERABLE_SECTIONS: OrderableSection[] = [...TOGGLEABLE_SECTIONS, "price"];

export function isOrderableSection(value: string): value is OrderableSection {
  return (ORDERABLE_SECTIONS as string[]).includes(value);
}

/** Whether a block is currently published; «Стоимость» cannot be hidden. */
export function isSectionVisible(sections: SectionVisibility, section: OrderableSection): boolean {
  return section === "price" || sections[section];
}

/**
 * Turns an arbitrary stored value into a full permutation of ORDERABLE_SECTIONS:
 * unknown entries and duplicates are dropped, missing blocks are appended in default order.
 */
export function normalizeSectionOrder(value: unknown): OrderableSection[] {
  const result: OrderableSection[] = [];
  if (Array.isArray(value)) {
    for (const entry of value) {
      if (typeof entry === "string" && isOrderableSection(entry) && !result.includes(entry)) {
        result.push(entry);
      }
    }
  }
  for (const section of ORDERABLE_SECTIONS) {
    if (!result.includes(section)) result.push(section);
  }
  return result;
}

export type SiteContent = {
  hero: { photos: Photo[]; points: HeroPoint[] };
  studio: { photos: Photo[] };
  projects: CollectionItem[];
  zones: CollectionItem[];
  wardrobe: { photos: Photo[] };
  equipment: EquipmentItem[];
  light: { photos: Photo[] };
  sections: SectionVisibility;
  sectionOrder: OrderableSection[];
  priceCards: PriceCard[];
  updatedAt: string;
};

/** Target of a photo list: a top-level gallery section or a collection item's gallery. */
export type PhotoTarget =
  | { kind: "section"; section: GallerySection }
  | { kind: "collection"; collection: CollectionKind; itemId: string };

export const GALLERY_SECTIONS: GallerySection[] = ["hero", "studio", "wardrobe", "light"];
export const COLLECTION_KINDS: CollectionKind[] = ["zones", "projects"];

export function isGallerySection(value: string): value is GallerySection {
  return (GALLERY_SECTIONS as string[]).includes(value);
}

export function isCollectionKind(value: string): value is CollectionKind {
  return (COLLECTION_KINDS as string[]).includes(value);
}

/** Parses an API target segment: `hero` | `studio` | `wardrobe` | `light` | `zones-<id>` | `projects-<id>`. */
export function parsePhotoTarget(segment: string): PhotoTarget | null {
  if (isGallerySection(segment)) return { kind: "section", section: segment };
  const dash = segment.indexOf("-");
  if (dash > 0) {
    const collection = segment.slice(0, dash);
    const itemId = segment.slice(dash + 1);
    if (isCollectionKind(collection) && itemId) return { kind: "collection", collection, itemId };
  }
  return null;
}

export function photoTargetSegment(target: PhotoTarget): string {
  return target.kind === "section" ? target.section : `${target.collection}-${target.itemId}`;
}
