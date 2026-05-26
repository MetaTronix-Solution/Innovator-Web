"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import {
  User,
  ShoppingCart,
  BookOpen,
  CalendarDays,
  FileText,
  HelpCircle,
  Search,
  ArrowRight,
  ArrowBigLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const faqSections = [
  {
    id: "general",
    label: "General",
    icon: HelpCircle,
    color:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
    badge:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
    faqs: [
      {
        q: "What is Innovator?",
        a: "Innovator is a social media web application built for tech enthusiasts and students. It combines a community platform with a shop, e-learning courses, events, and a research paper hub — all in one place.",
      },
      {
        q: "Who can use Innovator?",
        a: "Anyone can sign up — students, researchers, developers, and IoT enthusiasts are all welcome. Some features like paid courses or purchases require an active account.",
      },
      {
        q: "Is Innovator free to use?",
        a: "Signing up and using the social features is free. The shop and paid courses require payment, while many courses and community features remain free of charge.",
      },
    ],
  },
  {
    id: "account",
    label: "Account",
    icon: User,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    faqs: [
      {
        q: "How do I create an account?",
        a: "Click 'Sign Up' on the homepage, fill in your name, email address, and a password, then verify your email. Your account will be ready immediately after verification.",
      },
      {
        q: "How do I update my profile information?",
        a: "Go to your profile page and click 'Edit Profile'. You can update your name, bio, profile photo, and contact details from there.",
      },
      {
        q: "How do I reset my password?",
        a: 'On the login page, click "Forgot password?" and enter your registered email. You\'ll receive a reset link within a few minutes.',
      },
      {
        q: "Can I delete my account?",
        a: "Yes. Go to Settings → Account → Delete Account. Please note that deleting your account is permanent and will remove all your posts, enrollments, and purchase history.",
      },
    ],
  },
  {
    id: "shop",
    label: "Shop",
    icon: ShoppingCart,
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    faqs: [
      {
        q: "What kind of items are available in the shop?",
        a: "The shop offers a curated selection of IoT-related products including hardware components, development kits, sensors, modules, and accessories for makers and developers.",
      },
      {
        q: "How do I place an order?",
        a: "Browse the shop, add items to your cart, and proceed to checkout. You'll need to be logged in and provide a shipping address and payment details to complete your order.",
      },
      {
        q: "What payment methods are accepted?",
        a: "We accept major credit/debit cards and other payment options available at checkout. Payment methods may vary by region.",
      },
      {
        q: "Can I return or exchange a product?",
        a: "Yes. Returns and exchanges are accepted within a set period after delivery, provided the item is unused and in its original packaging. Contact support to initiate a return.",
      },
    ],
  },
  {
    id: "elearning",
    label: "E-learning",
    icon: BookOpen,
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    faqs: [
      {
        q: "How do I find and enroll in a course?",
        a: "Go to the E-learning section, browse or search for a course, and click 'Enroll'. Free courses are available instantly; paid courses require checkout before access is granted.",
      },
      {
        q: "What is the difference between free and paid courses?",
        a: "Free courses are available to all registered users at no cost. Paid courses offer more in-depth content, additional resources, and may include a certificate of completion.",
      },
      {
        q: "Can I access course content offline?",
        a: "Currently, courses are available online through the platform. Offline access may be available for select downloadable materials within certain courses.",
      },
      {
        q: "Will I receive a certificate after completing a course?",
        a: "Certificates are issued upon completion of eligible courses. Check the course details page to see if a certificate is included.",
      },
    ],
  },
  {
    id: "events",
    label: "Events",
    icon: CalendarDays,
    color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    badge: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    faqs: [
      {
        q: "Where can I see upcoming events?",
        a: "The Events section lists all upcoming events sorted by date. You can filter by category, location, or event type to find what's relevant to you.",
      },
      {
        q: "How do I register for an event?",
        a: "Open the event page and click 'Register'. Some events are free; others may require a ticket purchase. You'll receive a confirmation once registered.",
      },
      {
        q: "Can I host or submit an event on Innovator?",
        a: "Yes. Registered users can submit events for review. Once approved by the admin team, your event will be listed publicly on the platform.",
      },
    ],
  },
  {
    id: "research",
    label: "Research",
    icon: FileText,
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    badge:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    faqs: [
      {
        q: "Who can submit a research paper?",
        a: "Any registered student or researcher can submit a paper to the Research section. Papers go through a review process before being published on the platform.",
      },
      {
        q: "What file formats are accepted for research submissions?",
        a: "Research papers should be submitted in PDF format. Make sure your paper includes an abstract, author information, and references before submitting.",
      },
      {
        q: "Can other users view and comment on my research paper?",
        a: "Yes. Once published, your paper is visible to the Innovator community. Other users can read, like, and leave comments to encourage academic discussion.",
      },
      {
        q: "How long does the review process take?",
        a: "The review process typically takes a few business days. You'll be notified by email once your paper is approved or if any changes are requested.",
      },
    ],
  },
];

export default function FAQPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredSections = useMemo(() => {
    if (!search) return faqSections;
    return faqSections
      .map((section) => ({
        ...section,
        faqs: section.faqs.filter(
          (faq) =>
            faq.q.toLowerCase().includes(search.toLowerCase()) ||
            faq.a.toLowerCase().includes(search.toLowerCase()),
        ),
      }))
      .filter((section) => section.faqs.length > 0);
  }, [search]);

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <section className="relative px-4 pt-2 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        <div className="md:hidden max-w-2xl mx-auto relative z-10 text-left mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium text-sm"
          >
            <ArrowBigLeft size={20} />
            Back
          </button>
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">
            Help & Support
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Got questions? We've got answers. Browse our knowledge base or get
            in touch.
          </p>
          <div className="relative group">
            <Search
              className="absolute left-4 top-4 text-muted-foreground group-focus-within:text-primary transition-colors"
              size={22}
            />
            <Input
              placeholder="Search for answers..."
              className="pl-12 py-7 text-lg rounded-3xl border-border bg-card shadow-lg focus:ring-2 focus:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-[280px,1fr] gap-16">
        <aside className="hidden md:block">
          <div className="sticky top-24 space-y-6">
            {/* <nav className="space-y-1">
              {faqSections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-center justify-between p-3 text-sm font-medium hover:bg-muted rounded-xl transition-colors"
                >
                  {s.label}
                  <ChevronRight size={16} className="text-muted-foreground" />
                </a>
              ))}
            </nav> */}
            <div className="p-6 rounded-3xl bg-primary text-primary-foreground">
              <h4 className="font-bold mb-2">Still stuck?</h4>
              <p className="text-primary-foreground/80 text-xs mb-4">
                Our support team is available 24/7.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
              >
                Contact Us <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </aside>

        <section className="space-y-12">
          {filteredSections.map((section) => (
            <div key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className={`p-2 rounded-xl ${section.color}`}>
                  <section.icon size={20} />
                </span>
                {section.label}
              </h2>
              <Accordion type="single" collapsible className="space-y-4">
                {section.faqs.map((faq, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`${section.id}-${idx}`}
                    className="bg-card border border-border rounded-2xl px-6 data-[state=open]:border-primary/50 data-[state=open]:shadow-md transition-all duration-300"
                  >
                    <AccordionTrigger className="hover:no-underline py-6 font-semibold">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-[15px]">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </section>
        <div></div>
      </div>
    </main>
  );
}
