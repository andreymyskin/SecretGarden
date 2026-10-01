import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { defaultHeroPoints, defaultPriceCards } from "@/content/defaults";
import type {
  CollectionItem,
  CollectionKind,
  EquipmentItem,
  HeroPoint,
  OrderableSection,
  Photo,
  PhotoTarget,
  PriceCard,
  SectionVisibility,
  SiteContent,
  TextPart,
  ToggleableSection,
} from "./types";
import { ORDERABLE_SECTIONS, TOGGLEABLE_SECTIONS, isOrderableSection, isStrengthIcon, normalizeSectionOrder } from "./types";
import { MAX_RICH_TEXT_LENGTH, normalizeParts, partsToPlain } from "./rich-text";

const DATA_DIR = path.join(process.cwd(), "data");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const MAX_IMAGE_WIDTH = 1800;

const allVisible = (): SectionVisibility =>
  Object.fromEntries(TOGGLEABLE_SECTIONS.map((section) => [section, true])) as SectionVisibility;

const emptyContent = (): SiteContent => ({
  hero: { photos: [], points: defaultHeroPoints() },
  studio: { photos: [] },
  projects: [],
  zones: [],
  wardrobe: { photos: [] },
  equipment: [],
  light: { photos: [] },
  sections: allVisible(),
  sectionOrder: [...ORDERABLE_SECTIONS],
  priceCards: defaultPriceCards(),
  updatedAt: new Date().toISOString(),
});

function normalizeHeroPoints(value: unknown): HeroPoint[] | null {
  if (value === undefined) return null;
  if (!Array.isArray(value)) return null;
  const points: HeroPoint[] = [];
  value.forEach((entry, index) => {
    if (!entry || typeof entry !== "object") return;
    const raw = entry as { id?: unknown; icon?: unknown; parts?: unknown; text?: unknown };
    const parts = normalizeParts(raw.parts ?? raw.text);
    if (!partsToPlain(parts).trim()) return;
    const icon = typeof raw.icon === "string" && isStrengthIcon(raw.icon) ? raw.icon : "camera";
    const id = typeof raw.id === "string" && raw.id ? raw.id : `hero-${index + 1}`;
    points.push({ id, icon, parts });
  });
  return points;
}

function normalizePriceCards(value: unknown): PriceCard[] | null {
  if (value === undefined) return null;
  if (!Array.isArray(value)) return null;
  const cards: PriceCard[] = [];
  value.forEach((entry, index) => {
    if (!entry || typeof entry !== "object") return;
    const raw = entry as { id?: unknown; title?: unknown; price?: unknown; description?: unknown };
    const title = typeof raw.title === "string" ? raw.title.trim() : "";
    const price = typeof raw.price === "string" ? raw.price.trim() : "";
    if (!title || !price) return;
    const id = typeof raw.id === "string" && raw.id ? raw.id : `price-${index + 1}`;
    cards.push({ id, title, price, description: normalizeParts(raw.description) });
  });
  return cards;
}

function normalizeSections(value: unknown): SectionVisibility {
  const result = allVisible();
  if (value && typeof value === "object") {
    for (const section of TOGGLEABLE_SECTIONS) {
      const flag = (value as Record<string, unknown>)[section];
      if (typeof flag === "boolean") result[section] = flag;
    }
  }
  return result;
}

async function ensureStorage() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  try {
    await fs.access(CONTENT_FILE);
  } catch {
    await fs.writeFile(CONTENT_FILE, JSON.stringify(emptyContent(), null, 2), "utf8");
  }
}

export async function getContent(): Promise<SiteContent> {
  await ensureStorage();
  const raw = await fs.readFile(CONTENT_FILE, "utf8");
  const parsed = JSON.parse(raw) as Partial<SiteContent>;
  const base = emptyContent();
  return {
    hero: {
      photos: parsed.hero?.photos ?? base.hero.photos,
      points: normalizeHeroPoints(parsed.hero?.points) ?? defaultHeroPoints(),
    },
    studio: parsed.studio ?? base.studio,
    projects: parsed.projects ?? base.projects,
    zones: parsed.zones ?? base.zones,
    wardrobe: parsed.wardrobe ?? base.wardrobe,
    equipment: parsed.equipment ?? base.equipment,
    light: parsed.light ?? base.light,
    sections: normalizeSections(parsed.sections),
    sectionOrder: normalizeSectionOrder(parsed.sectionOrder),
    priceCards: normalizePriceCards(parsed.priceCards) ?? defaultPriceCards(),
    updatedAt: parsed.updatedAt ?? base.updatedAt,
  };
}

export async function setSectionVisibility(
  section: ToggleableSection,
  visible: boolean,
): Promise<SectionVisibility> {
  return mutate((content) => {
    content.sections[section] = visible;
    return content.sections;
  });
}

/** Replaces the page order of the main blocks; `order` must list every orderable block exactly once. */
export async function setSectionOrder(order: unknown): Promise<OrderableSection[]> {
  if (!Array.isArray(order) || order.length !== ORDERABLE_SECTIONS.length) {
    throw new ContentError("Порядок должен содержать все основные разделы");
  }
  const seen = new Set<string>();
  for (const entry of order) {
    if (typeof entry !== "string" || !isOrderableSection(entry)) {
      throw new ContentError("Неизвестный раздел", 404);
    }
    if (seen.has(entry)) throw new ContentError("Раздел указан дважды");
    seen.add(entry);
  }
  const next = order as OrderableSection[];
  return mutate((content) => {
    content.sectionOrder = [...next];
    return content.sectionOrder;
  });
}

const MAX_HERO_POINTS = 12;
const MAX_PRICE_CARDS = 24;

function requireRichText(value: unknown, label: string, allowEmpty: boolean): TextPart[] {
  const parts = normalizeParts(value);
  const plain = partsToPlain(parts);
  if (!allowEmpty && !plain.trim()) throw new ContentError(`Заполните поле «${label}»`);
  if (plain.length > MAX_RICH_TEXT_LENGTH) {
    throw new ContentError(`Поле «${label}» длиннее ${MAX_RICH_TEXT_LENGTH} символов`);
  }
  return parts;
}

function freshId(value: unknown): string {
  return typeof value === "string" && /^[\w-]{1,80}$/.test(value) ? value : randomUUID();
}

/** Replaces the hero list under the title. */
export async function setHeroPoints(input: unknown): Promise<HeroPoint[]> {
  if (!Array.isArray(input)) throw new ContentError("Передайте список пунктов");
  if (input.length > MAX_HERO_POINTS) throw new ContentError(`Не больше ${MAX_HERO_POINTS} пунктов`);
  const seen = new Set<string>();
  const points: HeroPoint[] = input.map((entry, index) => {
    if (!entry || typeof entry !== "object") throw new ContentError("Некорректный пункт");
    const raw = entry as { id?: unknown; icon?: unknown; parts?: unknown };
    if (typeof raw.icon !== "string" || !isStrengthIcon(raw.icon)) {
      throw new ContentError(`Выберите иконку для пункта ${index + 1}`);
    }
    const parts = requireRichText(raw.parts, `Пункт ${index + 1}`, false);
    let id = freshId(raw.id);
    if (seen.has(id)) id = randomUUID();
    seen.add(id);
    return { id, icon: raw.icon, parts };
  });
  return mutate((content) => {
    content.hero.points = points;
    return content.hero.points;
  });
}

function readPriceCard(input: { title?: unknown; price?: unknown; description?: unknown }, id: string): PriceCard {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const price = typeof input.price === "string" ? input.price.trim() : "";
  if (!title) throw new ContentError("Укажите заголовок карточки");
  if (title.length > 160) throw new ContentError("Заголовок карточки длиннее 160 символов");
  if (!price) throw new ContentError("Укажите стоимость");
  if (price.length > 40) throw new ContentError("Стоимость длиннее 40 символов");
  return { id, title, price, description: requireRichText(input.description, "Описание", true) };
}

export async function createPriceCard(input: {
  title?: unknown;
  price?: unknown;
  description?: unknown;
}): Promise<PriceCard> {
  const card = readPriceCard(input, randomUUID());
  return mutate((content) => {
    if (content.priceCards.length >= MAX_PRICE_CARDS) {
      throw new ContentError(`Не больше ${MAX_PRICE_CARDS} карточек`);
    }
    content.priceCards.push(card);
    return card;
  });
}

export async function updatePriceCard(
  id: string,
  input: { title?: unknown; price?: unknown; description?: unknown; move?: "up" | "down" },
): Promise<PriceCard> {
  return mutate((content) => {
    const index = content.priceCards.findIndex((card) => card.id === id);
    if (index === -1) throw new ContentError("Карточка не найдена", 404);
    const current = content.priceCards[index];
    const next = readPriceCard(
      {
        title: input.title === undefined ? current.title : input.title,
        price: input.price === undefined ? current.price : input.price,
        description: input.description === undefined ? current.description : input.description,
      },
      id,
    );
    content.priceCards[index] = next;
    if (input.move) {
      const to = input.move === "up" ? index - 1 : index + 1;
      if (to >= 0 && to < content.priceCards.length) {
        content.priceCards.splice(index, 1);
        content.priceCards.splice(to, 0, next);
      }
    }
    return next;
  });
}

export async function deletePriceCard(id: string): Promise<void> {
  await mutate((content) => {
    const index = content.priceCards.findIndex((card) => card.id === id);
    if (index === -1) throw new ContentError("Карточка не найдена", 404);
    content.priceCards.splice(index, 1);
  });
}

// Writes are serialized so concurrent admin requests never clobber each other.
let writeQueue: Promise<unknown> = Promise.resolve();

function mutate<T>(fn: (content: SiteContent) => T | Promise<T>): Promise<T> {
  const run = async () => {
    const content = await getContent();
    const result = await fn(content);
    content.updatedAt = new Date().toISOString();
    await fs.writeFile(CONTENT_FILE, JSON.stringify(content, null, 2), "utf8");
    return result;
  };
  const next = writeQueue.then(run, run);
  writeQueue = next.catch(() => undefined);
  return next;
}

export class ContentError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function photosOf(content: SiteContent, target: PhotoTarget): Photo[] {
  if (target.kind === "section") return content[target.section].photos;
  const item = content[target.collection].find((entry) => entry.id === target.itemId);
  if (!item) throw new ContentError(collectionLabels[target.collection].notFound, 404);
  return item.photos;
}

const collectionLabels: Record<
  CollectionKind,
  { notFound: string; needTitle: string; needCover: string }
> = {
  zones: {
    notFound: "Локация не найдена",
    needTitle: "Укажите название локации",
    needCover: "Загрузите обложку локации",
  },
  projects: {
    notFound: "Фотопроект не найден",
    needTitle: "Укажите название фотопроекта",
    needCover: "Загрузите обложку фотопроекта",
  },
};

/* ---------- files ---------- */

export function validateImageFile(file: unknown): asserts file is File {
  if (!(file instanceof File) || file.size === 0) {
    throw new ContentError("Загрузите изображение");
  }
  if (!file.type.startsWith("image/")) {
    throw new ContentError(`Файл «${file.name}» не является изображением`);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ContentError(`Файл «${file.name}» больше 12 МБ`);
  }
}

export async function saveUploadedImage(file: File): Promise<string> {
  await ensureStorage();
  const input = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.webp`;
  const target = path.join(UPLOADS_DIR, filename);
  try {
    await sharp(input)
      .rotate()
      .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(target);
  } catch {
    throw new ContentError(`Не удалось обработать файл «${file.name}»`);
  }
  return `/uploads/${filename}`;
}

async function removeUploadedFile(url: string) {
  if (!url.startsWith("/uploads/")) return;
  const filePath = path.join(process.cwd(), "public", url);
  try {
    await fs.unlink(filePath);
  } catch {
    // Already gone — nothing to clean up.
  }
}

/* ---------- photos ---------- */

export async function addPhotos(target: PhotoTarget, files: File[]): Promise<Photo[]> {
  if (files.length === 0) throw new ContentError("Выберите хотя бы одно изображение");
  files.forEach(validateImageFile);
  const urls: string[] = [];
  for (const file of files) urls.push(await saveUploadedImage(file));
  return mutate((content) => {
    const list = photosOf(content, target);
    const created = urls.map((url) => ({ id: randomUUID(), url, caption: "" }));
    list.push(...created);
    return created;
  });
}

export async function updatePhoto(
  target: PhotoTarget,
  photoId: string,
  patch: { caption?: string; move?: "up" | "down" },
): Promise<Photo> {
  return mutate((content) => {
    const list = photosOf(content, target);
    const index = list.findIndex((p) => p.id === photoId);
    if (index === -1) throw new ContentError("Фото не найдено", 404);
    if (typeof patch.caption === "string") list[index].caption = patch.caption.trim();
    if (patch.move) {
      const to = patch.move === "up" ? index - 1 : index + 1;
      if (to >= 0 && to < list.length) {
        const [item] = list.splice(index, 1);
        list.splice(to, 0, item);
        return item;
      }
    }
    return list[index];
  });
}

export async function removePhoto(target: PhotoTarget, photoId: string): Promise<void> {
  const removed = await mutate((content) => {
    const list = photosOf(content, target);
    const index = list.findIndex((p) => p.id === photoId);
    if (index === -1) throw new ContentError("Фото не найдено", 404);
    return list.splice(index, 1)[0];
  });
  await removeUploadedFile(removed.url);
}

/* ---------- collections (locations & photo projects) ---------- */

export async function createCollectionItem(
  collection: CollectionKind,
  input: { title: string; description: string; cover: File | null },
): Promise<CollectionItem> {
  const labels = collectionLabels[collection];
  const title = input.title.trim();
  if (!title) throw new ContentError(labels.needTitle);
  if (!input.cover) throw new ContentError(labels.needCover);
  validateImageFile(input.cover);
  const cover = await saveUploadedImage(input.cover);
  return mutate((content) => {
    const item: CollectionItem = {
      id: randomUUID(),
      title,
      description: input.description.trim(),
      cover,
      photos: [],
    };
    content[collection].push(item);
    return item;
  });
}

export async function updateCollectionItem(
  collection: CollectionKind,
  id: string,
  input: { title?: string; description?: string; cover?: File | null; move?: "up" | "down" },
): Promise<CollectionItem> {
  let newCover: string | null = null;
  if (input.cover) {
    validateImageFile(input.cover);
    newCover = await saveUploadedImage(input.cover);
  }
  const { item, oldCover } = await mutate((content) => {
    const list = content[collection];
    const index = list.findIndex((entry) => entry.id === id);
    if (index === -1) throw new ContentError(collectionLabels[collection].notFound, 404);
    const item = list[index];
    const oldCover = item.cover;
    if (typeof input.title === "string" && input.title.trim()) item.title = input.title.trim();
    if (typeof input.description === "string") item.description = input.description.trim();
    if (newCover) item.cover = newCover;
    if (input.move) {
      const to = input.move === "up" ? index - 1 : index + 1;
      if (to >= 0 && to < list.length) {
        list.splice(index, 1);
        list.splice(to, 0, item);
      }
    }
    return { item, oldCover };
  });
  if (newCover && oldCover !== newCover) await removeUploadedFile(oldCover);
  return item;
}

export async function deleteCollectionItem(collection: CollectionKind, id: string): Promise<void> {
  const item = await mutate((content) => {
    const list = content[collection];
    const index = list.findIndex((entry) => entry.id === id);
    if (index === -1) throw new ContentError(collectionLabels[collection].notFound, 404);
    return list.splice(index, 1)[0];
  });
  await removeUploadedFile(item.cover);
  for (const photo of item.photos) await removeUploadedFile(photo.url);
}

/* ---------- equipment ---------- */

export async function createEquipment(input: {
  title: string;
  description: string;
  image: File | null;
}): Promise<EquipmentItem> {
  const title = input.title.trim();
  if (!title) throw new ContentError("Укажите название");
  if (!input.image) throw new ContentError("Загрузите фото оборудования");
  validateImageFile(input.image);
  const image = await saveUploadedImage(input.image);
  return mutate((content) => {
    const item: EquipmentItem = {
      id: randomUUID(),
      title,
      description: input.description.trim(),
      image,
    };
    content.equipment.push(item);
    return item;
  });
}

export async function updateEquipment(
  id: string,
  input: { title?: string; description?: string; image?: File | null; move?: "up" | "down" },
): Promise<EquipmentItem> {
  let newImage: string | null = null;
  if (input.image) {
    validateImageFile(input.image);
    newImage = await saveUploadedImage(input.image);
  }
  const { item, oldImage } = await mutate((content) => {
    const index = content.equipment.findIndex((e) => e.id === id);
    if (index === -1) throw new ContentError("Позиция не найдена", 404);
    const item = content.equipment[index];
    const oldImage = item.image;
    if (typeof input.title === "string" && input.title.trim()) item.title = input.title.trim();
    if (typeof input.description === "string") item.description = input.description.trim();
    if (newImage) item.image = newImage;
    if (input.move) {
      const to = input.move === "up" ? index - 1 : index + 1;
      if (to >= 0 && to < content.equipment.length) {
        content.equipment.splice(index, 1);
        content.equipment.splice(to, 0, item);
      }
    }
    return { item, oldImage };
  });
  if (newImage && oldImage !== newImage) await removeUploadedFile(oldImage);
  return item;
}

export async function deleteEquipment(id: string): Promise<void> {
  const item = await mutate((content) => {
    const index = content.equipment.findIndex((e) => e.id === id);
    if (index === -1) throw new ContentError("Позиция не найдена", 404);
    return content.equipment.splice(index, 1)[0];
  });
  await removeUploadedFile(item.image);
}
