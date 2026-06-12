"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ScrollText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const sections = [
  {
    icon: "✅",
    title: "1. Acceptance of Terms",
    content: `By creating an account or using Innovator, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use the platform.

These terms apply to all users of Innovator, including visitors, registered users, vendors, and instructors.`,
  },
  {
    icon: "🪪",
    title: "2. Eligibility",
    content: `You must be at least 13 years old to use Innovator. Users between 13–18 must have parental or guardian consent. By using the platform, you represent that you meet these requirements.

We reserve the right to suspend or terminate accounts that do not meet eligibility requirements.`,
  },
  {
    icon: "📋",
    title: "3. Account Registration",
    content: `To access most features of Innovator, you must register for an account. You agree to:

- Provide accurate, current, and complete information during registration
- Keep your password secure and confidential
- Notify us immediately of any unauthorized use of your account
- Be responsible for all activity that occurs under your account

You may also register using Google OAuth. By doing so, you authorize Innovator to access your Google account information as described in our Privacy Policy.`,
  },
  {
    icon: "✏️",
    title: "4. User Content",
    content: `Innovator allows you to create, share, and interact with content including posts, reels, comments, messages, and course materials. By submitting content, you:

- Retain ownership of your original content
- Grant Innovator a non-exclusive, royalty-free, worldwide license to use, display, and distribute your content on the platform
- Confirm that your content does not violate any third-party rights or applicable laws

**Prohibited Content:** You may not post content that is illegal, harmful, threatening, abusive, harassing, defamatory, obscene, or otherwise objectionable. We reserve the right to remove any content that violates these terms.`,
  },
  {
    icon: "💬",
    title: "5. Social Features",
    content: `Innovator's social features — including the feed, reels, reactions, comments, and messaging — are intended for respectful, lawful interaction. You agree not to:

- Harass, bully, or intimidate other users
- Spam or send unsolicited messages
- Impersonate any person or entity
- Use automated scripts or bots to interact with the platform
- Scrape or collect user data without permission`,
  },
  {
    icon: "🛒",
    title: "6. E-Commerce & Orders",
    content: `Innovator's shop allows users to browse and purchase IoT products and electronics. By placing an order, you agree to:

- Provide accurate shipping and payment information
- Pay the listed price including any applicable taxes
- Accept our return and refund policy as communicated at checkout

**Vendor Responsibility:** Vendors listing products on Innovator are responsible for the accuracy of their listings. Innovator acts as a platform and is not liable for disputes between buyers and vendors, though we will assist in resolution where possible.`,
  },
  {
    icon: "🎓",
    title: "7. E-Learning & Courses",
    content: `Innovator offers online courses created by instructors and vendors. By enrolling in a course, you agree to:

- Use course materials for personal, non-commercial learning only
- Not redistribute, resell, or share course content without permission
- Understand that course availability may change over time

**Instructor Responsibility:** Instructors are responsible for the accuracy and quality of their course content. Innovator does not guarantee the outcomes of any course.

Free courses are available without payment. Paid courses require successful payment before access is granted.`,
  },
  {
    icon: "💳",
    title: "8. Payments & Refunds",
    content: `All payments on Innovator are processed securely. Prices are listed in Nepalese Rupees (NPR) unless otherwise stated.

**Refund Policy:**
- Digital course purchases are non-refundable once content has been accessed
- Physical product orders may be eligible for return within 7 days of delivery if the item is defective or not as described
- To request a refund, contact support@innovator.app with your order details

Innovator reserves the right to update pricing at any time. Changes will not affect orders already placed.`,
  },
  {
    icon: "©️",
    title: "9. Intellectual Property",
    content: `All content, branding, logos, UI design, and platform code on Innovator are the intellectual property of Innovator and its licensors. You may not copy, reproduce, modify, or distribute any part of the platform without prior written permission.

User-generated content remains the property of the respective creators. By posting on Innovator, you grant us the rights described in Section 4.`,
  },
  {
    icon: "🔬",
    title: "10. Research Hub",
    content: `The Research Hub on Innovator provides access to curated technology articles, publications, and resources. Content in the Research Hub is provided for informational purposes only.

Innovator does not guarantee the accuracy, completeness, or timeliness of research content. Users are encouraged to verify information independently before acting on it.`,
  },
  {
    icon: "🔔",
    title: "11. Messaging & Notifications",
    content: `Innovator provides real-time messaging and notification features via WebSocket technology. By using these features, you acknowledge that:

- Messages are stored to enable message history
- You will not use messaging to send spam, illegal content, or harassment
- Innovator may access messages if required by law or to investigate violations of these terms`,
  },
  {
    icon: "🚫",
    title: "12. Termination",
    content: `We reserve the right to suspend or terminate your account at any time, with or without notice, for violations of these Terms of Service or for any conduct we deem harmful to the platform or its users.

You may delete your account at any time from your profile settings. Upon deletion, your data will be handled as described in our Privacy Policy.`,
  },
  {
    icon: "⚠️",
    title: "13. Disclaimers",
    content: `Innovator is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. We do not warrant that:

- The platform will be uninterrupted or error-free
- Any content or information on the platform is accurate or complete
- The platform is free of viruses or other harmful components

To the fullest extent permitted by law, Innovator disclaims all warranties, express or implied.`,
  },
  {
    icon: "🛡️",
    title: "14. Limitation of Liability",
    content: `To the maximum extent permitted by applicable law, Innovator shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform, including but not limited to loss of data, loss of revenue, or loss of goodwill.

Our total liability to you for any claim arising from these terms shall not exceed the amount you paid to Innovator in the 30 days preceding the claim.`,
  },
  {
    icon: "⚖️",
    title: "15. Governing Law",
    content: `These Terms of Service are governed by the laws of Nepal. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts located in Lalitpur, Bagmati Province, Nepal.`,
  },
  {
    icon: "📝",
    title: "16. Changes to Terms",
    content: `We may update these Terms of Service from time to time. When we do, we will update the "Last updated" date at the top of this page. Continued use of Innovator after changes constitutes your acceptance of the updated terms.

For significant changes, we will notify you via email or an in-app notification.`,
  },
  {
    icon: "📬",
    title: "17. Contact Us",
    content: `If you have any questions about these Terms of Service, please contact us:

**Email:** legal@innovator.app
**Address:** Lalitpur, Bagmati Province, Nepal

We aim to respond to all inquiries within 7 business days.`,
  },
];

const renderContent = (content: string) =>
  content.split("\n").map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <p key={i}>
        {parts.map((part, j) =>
          j % 2 === 1 ? (
            <strong key={j} className="text-foreground font-semibold">
              {part}
            </strong>
          ) : (
            part
          ),
        )}
      </p>
    );
  });

export default function TermsOfServicePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-12">
        <button
          onClick={() => router.back()}
          className="md:hidden inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <ScrollText className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Terms of Service
            </h1>
          </div>
          <p className="text-muted-foreground text-xs mb-4">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-muted-foreground leading-relaxed text-sm border-l-2 border-primary/40 pl-4">
            Welcome to Innovator. These Terms of Service govern your use of our
            platform — including social features, e-learning, e-commerce,
            real-time messaging, and the research hub. Please read them
            carefully before using Innovator.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {sections.map((section) => (
            <Card
              key={section.title}
              className="transition-all duration-200 hover:shadow-md hover:ring-primary/20 hover:-translate-y-0.5 cursor-default"
            >
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2.5">
                  <span className="text-lg">{section.icon}</span>
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line space-y-2 pt-1">
                  {renderContent(section.content)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            By using Innovator, you agree to these Terms of Service and our{" "}
            <Link
              href="/privacy"
              className="text-primary hover:underline font-medium"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
