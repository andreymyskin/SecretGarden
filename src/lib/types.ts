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

export type GallerySection = "hero" | "studio" | "wardrobe" | "light";
export type CollectionKind = "zones" | "projects";

export type SiteContent = {
  hero: { photos: Photo[] };
  studio: { photos: Photo[] };
  projects: CollectionItem[];
  zones: CollectionItem[];
  wardrobe: { photos: Photo[] };
  equipment: EquipmentItem[];
  light: { photos: Photo[] };
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
