import type { Metadata } from "next";
import { AdminPanel } from "@/components/AdminPanel";

export const metadata: Metadata = {
  title: "Админ-панель",
  description: "Управление контентом сайта Secret Garden",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminPage() {
  return <AdminPanel />;
}
