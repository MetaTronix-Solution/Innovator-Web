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

export default function Page({ params }: { params: { id: string } }) {
  if (STATIC_ROUTES.has(params.id)) {
    notFound();
  }

  return <ProfilePage />;
}
