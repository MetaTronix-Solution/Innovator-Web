"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const sections = [
  {
    title: "1. Information We Collect",
    content: `We collect the following types of information when you use Innovator:

**Account Information:** When you register, we collect your full name, username, email address, phone number, date of birth, and gender.

**Content You Create:** Posts, reels, comments, reactions, messages, course activity, orders, and research hub interactions you create or engage with on the platform.

**Authentication Data:** If you sign in with Google, we receive your name, email, and profile picture from Google OAuth.

**Device & Usage Data:** IP address, browser type, device identifiers, pages visited, and actions taken on the platform.

**Communications:** Messages you send through our real-time messaging system. These are stored to enable message history and delivery.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use collected information to:

- Create and manage your account
- Deliver and personalize the Innovator experience (social feed, courses, shop, messaging)
- Process orders and payments
- Send OTP emails for account verification and password reset
- Enable real-time notifications and messaging via WebSocket
- Stream video content through our video delivery provider
- Improve platform features and fix bugs
- Comply with legal obligations`,
  },
  {
    title: "3. How We Share Your Information",
    content: `We do not sell your personal data. We may share information with:

**Service Providers:** Third-party vendors who help us operate Innovator, including video streaming (Bunny Stream), email delivery, and cloud hosting. These providers are bound by confidentiality agreements.

**Google OAuth:** If you sign in with Google, your authentication is handled by Google. Please review Google's Privacy Policy for details.

**Legal Requirements:** We may disclose your information if required by law, court order, or government authority.

**Business Transfers:** In the event of a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction.`,
  },
  {
    title: "4. Data Retention",
    content: `We retain your personal data for as long as your account is active or as needed to provide services. If you delete your account, we will delete or anonymize your data within 30 days, except where retention is required by law.

Unverified accounts (registered but email not confirmed) are automatically deleted after 24 hours.`,
  },
  {
    title: "5. Cookies & Tracking",
    content: `Innovator uses cookies and similar technologies to:

- Keep you logged in (session cookies via NextAuth.js)
- Remember your preferences
- Analyze platform usage and performance

You can control cookies through your browser settings. Disabling cookies may affect certain platform features.`,
  },
  {
    title: "6. Your Rights",
    content: `Depending on your location, you may have the following rights regarding your personal data:

- **Access:** Request a copy of the data we hold about you
- **Correction:** Update inaccurate or incomplete information via your profile settings
- **Deletion:** Request deletion of your account and associated data
- **Portability:** Request your data in a portable format
- **Objection:** Object to certain types of data processing

To exercise any of these rights, contact us at privacy@innovator.app.`,
  },
  {
    title: "7. Data Security",
    content: `We implement industry-standard security measures to protect your data, including:

- HTTPS encryption for all data in transit
- Hashed passwords (never stored in plain text)
- OTP-based email verification for account access
- Server-side authentication via Django REST Framework

No method of transmission over the internet is 100% secure. We encourage you to use a strong, unique password for your account.`,
  },
  {
    title: "8. Children's Privacy",
    content: `Innovator is not intended for users under the age of 13. We do not knowingly collect personal data from children under 13. If we become aware that a child under 13 has provided us with personal information, we will delete it promptly.

Users between 13–18 should use Innovator only with parental or guardian consent.`,
  },
  {
    title: "9. Third-Party Links",
    content: `Innovator may contain links to third-party websites, courses, or products. We are not responsible for the privacy practices of those third parties. We encourage you to review their privacy policies before providing any personal information.`,
  },
  {
    title: "10. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page. Continued use of Innovator after changes constitutes acceptance of the updated policy.

For significant changes, we will notify you via email or an in-app notification.`,
  },
  {
    title: "11. Contact Us",
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:

**Email:** privacy@innovator.app
**Address:** Lalitpur, Bagmati Province, Nepal

We aim to respond to all privacy-related inquiries within 7 business days.`,
  },
];

export default function PrivacyPolicyPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-4 md:py-8">
        <button
          onClick={() => router.back()}
          className="md:hidden inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mb-4 md:mb-10 space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-sm">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Innovator (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is
            committed to protecting your privacy. This Privacy Policy explains
            how we collect, use, share, and protect your personal information
            when you use our platform — including social features, e-learning,
            e-commerce, messaging, and the research hub.
          </p>
        </div>

        <div className="space-y-4 md:space-y-8">
          {sections.map((section) => (
            <section
              key={section.title}
              className="border-t border-border pt-6"
            >
              <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line space-y-2">
                {section.content.split("\n").map((line, i) => {
                  const parts = line.split(/\*\*(.*?)\*\*/g);
                  return (
                    <p key={i}>
                      {parts.map((part, j) =>
                        j % 2 === 1 ? (
                          <strong
                            key={j}
                            className="text-foreground font-medium"
                          >
                            {part}
                          </strong>
                        ) : (
                          part
                        ),
                      )}
                    </p>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            By using Innovator, you agree to this Privacy Policy and our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
