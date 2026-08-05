import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { GalleryItem } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const GALLERY_FILE = path.join(DATA_DIR, "gallery.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

async function ensureStorage() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  try {
    await fs.access(GALLERY_FILE);
  } catch {
    await fs.writeFile(GALLERY_FILE, "[]", "utf8");
  }
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  await ensureStorage();
  const raw = await fs.readFile(GALLERY_FILE, "utf8");
  const items = JSON.parse(raw) as GalleryItem[];
  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getGalleryItem(id: string): Promise<GalleryItem | null> {
  const items = await getGalleryItems();
  return items.find((item) => item.id === id) ?? null;
}

export async function createGalleryItem(input: {
  title: string;
  description: string;
  imageUrl: string;
}): Promise<GalleryItem> {
  const items = await getGalleryItems();
  const now = new Date().toISOString();
  const item: GalleryItem = {
    id: randomUUID(),
    title: input.title.trim(),
    description: input.description.trim(),
    imageUrl: input.imageUrl,
    createdAt: now,
    updatedAt: now,
  };
  items.unshift(item);
  await fs.writeFile(GALLERY_FILE, JSON.stringify(items, null, 2), "utf8");
  return item;
}

export async function updateGalleryItem(
  id: string,
  input: Partial<Pick<GalleryItem, "title" | "description" | "imageUrl">>,
): Promise<GalleryItem | null> {
  const items = await getGalleryItems();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const current = items[index];
  const updated: GalleryItem = {
    ...current,
    title: input.title?.trim() ?? current.title,
    description: input.description?.trim() ?? current.description,
    imageUrl: input.imageUrl ?? current.imageUrl,
    updatedAt: new Date().toISOString(),
  };
  items[index] = updated;
  await fs.writeFile(GALLERY_FILE, JSON.stringify(items, null, 2), "utf8");
  return updated;
}

export async function deleteGalleryItem(id: string): Promise<boolean> {
  const items = await getGalleryItems();
  const item = items.find((entry) => entry.id === id);
  if (!item) return false;

  const next = items.filter((entry) => entry.id !== id);
  await fs.writeFile(GALLERY_FILE, JSON.stringify(next, null, 2), "utf8");

  if (item.imageUrl.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", item.imageUrl);
    try {
      await fs.unlink(filePath);
    } catch {
      // File may already be missing
    }
  }

  return true;
}

export async function saveUploadedImage(file: File): Promise<string> {
  await ensureStorage();
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)
    ? ext
    : ".jpg";
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${safeExt}`;
  const filePath = path.join(UPLOADS_DIR, filename);
  await fs.writeFile(filePath, bytes);
  return `/uploads/${filename}`;
}
