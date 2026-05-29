import { notFound } from "next/navigation";
import ProfilePage from "./ProfileClient";

const STATIC_ROUTES = new Set([
  "cart",
  "checkout",
  "courses",
  "events",
  "faq",
  "following",
  "messages",
  "notifications",
  "orders",
  "posts",
  "products",
  "reels",
  "research",
  "search",
  "settings",
]);

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (STATIC_ROUTES.has(id)) {
    notFound();
  }

  return <ProfilePage />;
}
