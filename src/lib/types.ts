export type Photo = {
  id: string;
  url: string;
  caption: string;
};

export type Zone = {
  id: string;
  title: string;
  description: string;
  cover: string;
  photos: Photo[];
};

export type EquipmentItem = {
  id: string;
  title: string;
  description: string;
  image: string;
};

export type GallerySection = "studio" | "wardrobe" | "light";

export type SiteContent = {
  studio: { photos: Photo[] };
  zones: Zone[];
  wardrobe: { photos: Photo[] };
  equipment: EquipmentItem[];
  light: { photos: Photo[] };
  updatedAt: string;
};

/** Target of a photo collection: a top-level gallery section or a zone's gallery. */
export type PhotoTarget =
  | { kind: "section"; section: GallerySection }
  | { kind: "zone"; zoneId: string };

export const GALLERY_SECTIONS: GallerySection[] = ["studio", "wardrobe", "light"];

export function isGallerySection(value: string): value is GallerySection {
  return (GALLERY_SECTIONS as string[]).includes(value);
}

/** Parses an API target segment: `studio` | `wardrobe` | `light` | `zone-<id>`. */
export function parsePhotoTarget(segment: string): PhotoTarget | null {
  if (isGallerySection(segment)) return { kind: "section", section: segment };
  if (segment.startsWith("zone-") && segment.length > 5) {
    return { kind: "zone", zoneId: segment.slice(5) };
  }
  return null;
}

export function photoTargetSegment(target: PhotoTarget): string {
  return target.kind === "section" ? target.section : `zone-${target.zoneId}`;
}
