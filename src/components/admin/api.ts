import type { CollectionKind, PhotoTarget, SiteContent } from "@/lib/types";
import { photoTargetSegment } from "@/lib/types";

async function parse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || "Запрос не выполнен");
  return data;
}

export const adminApi = {
  me: () => fetch("/api/auth/me", { cache: "no-store" }).then(parse<{ authenticated: boolean }>),
  login: (password: string) =>
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).then(parse<{ ok: true }>),
  logout: () => fetch("/api/auth/logout", { method: "POST" }).then(parse<{ ok: true }>),
  content: () => fetch("/api/content", { cache: "no-store" }).then(parse<SiteContent>),

  uploadPhotos: (target: PhotoTarget, files: File[]) => {
    const body = new FormData();
    files.forEach((file) => body.append("images", file));
    return fetch(`/api/photos/${photoTargetSegment(target)}`, { method: "POST", body }).then(parse);
  },
  updatePhoto: (target: PhotoTarget, photoId: string, patch: { caption?: string; move?: "up" | "down" }) =>
    fetch(`/api/photos/${photoTargetSegment(target)}/${photoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).then(parse),
  deletePhoto: (target: PhotoTarget, photoId: string) =>
    fetch(`/api/photos/${photoTargetSegment(target)}/${photoId}`, { method: "DELETE" }).then(parse),

  createCollectionItem: (kind: CollectionKind, body: FormData) =>
    fetch(`/api/collections/${kind}`, { method: "POST", body }).then(parse),
  updateCollectionItem: (kind: CollectionKind, id: string, body: FormData) =>
    fetch(`/api/collections/${kind}/${id}`, { method: "PUT", body }).then(parse),
  deleteCollectionItem: (kind: CollectionKind, id: string) =>
    fetch(`/api/collections/${kind}/${id}`, { method: "DELETE" }).then(parse),

  createEquipment: (body: FormData) => fetch("/api/equipment", { method: "POST", body }).then(parse),
  updateEquipment: (id: string, body: FormData) =>
    fetch(`/api/equipment/${id}`, { method: "PUT", body }).then(parse),
  deleteEquipment: (id: string) => fetch(`/api/equipment/${id}`, { method: "DELETE" }).then(parse),
};
