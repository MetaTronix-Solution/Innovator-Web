import Link from "next/link";
import {
  Users,
  Zap,
  ShoppingBag,
  BookOpen,
  MessageSquare,
  Video,
} from "lucide-react";

const features = [
  {
    icon: <Users size={20} />,
    title: "Follow & Connect",
    description:
      "Build your network by following people who inspire you and sharing what matters to you.",
  },
  {
    icon: <Video size={20} />,
    title: "Reels",
    description:
      "Create and discover short videos from creators across the platform.",
  },
  {
    icon: <ShoppingBag size={20} />,
    title: "Shop",
    description: "Browse and buy from independent vendors all in one place.",
  },
  {
    icon: <BookOpen size={20} />,
    title: "E-Learning",
    description:
      "Enroll in courses taught by real experts and grow your skills.",
  },
  {
    icon: <MessageSquare size={20} />,
    title: "Messaging",
    description: "Chat with friends and collaborators in real time.",
  },
  {
    icon: <Zap size={20} />,
    title: "Research Hub",
    description:
      "Discover curated research, articles, and insights from across the web.",
  },
];

export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground tracking-tight mb-3">
          About Innovator
        </h1>
        <p className="text-muted-foreground text-[15px] leading-relaxed">
          Innovator is a unified platform built for creators, learners, and
          entrepreneurs. Whether you're sharing reels, selling products,
          teaching a course, or just catching up with people you follow —
          everything lives in one place.
        </p>
      </div>

      {/* Mission */}
      <div className="mb-10 p-5 rounded-2xl bg-accent border border-border">
        <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
          Our Mission
        </p>
        <p className="text-foreground text-[15px] leading-relaxed">
          To give every person the tools to create, learn, and grow — without
          switching between a dozen different apps to do it.
        </p>
      </div>

      {/* Features */}
      <div className="mb-10">
        <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">
          What you can do
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex gap-3 p-4 rounded-xl border border-border bg-background hover:bg-accent transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-accent text-primary">
                {f.icon}
              </div>
              <div>
                <p className="text-[14px] font-semibold text-foreground">
                  {f.title}
                </p>
                <p className="text-[13px] text-muted-foreground mt-0.5 leading-snug">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-6 text-[13px] text-muted-foreground">
        <p>
          Built by{" "}
          <span className="text-foreground font-medium">Metatronix</span> ·
          Lalitpur, Nepal
        </p>
        <p className="mt-1">
          © {new Date().getFullYear()} Innovator. All rights reserved. ·{" "}
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>{" "}
          ·{" "}
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
        </p>
      </div>
    </main>
  );
}
