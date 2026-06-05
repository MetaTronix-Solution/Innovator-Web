import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import AppProvider from "@/lib/Provider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "Innovator — A social platform to connect, share ideas, and grow together.",
  description:
    "Innovator — a social platform to connect, share ideas, and grow together.",
  icons: {
    icon: [{ url: "/logo1.png", sizes: "512x512", type: "image/png" }],
  },
  keywords: ["social media", "community", "connect", "ideas", "innovator"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.className}  h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
                (function() {
                  try {
                    const persisted = localStorage.getItem('persist:root');
                    if (persisted) {
                      const state = JSON.parse(persisted);
                      const themeState = state.theme ? JSON.parse(state.theme) : null;
                      if (themeState && themeState.mode === 'dark') {
                        document.documentElement.classList.add('dark');
                      } else {
                        document.documentElement.classList.remove('dark');
                      }
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  } catch (e) {}
                })();
              `,
          }}
        />
        <AppProvider>
          {children}
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
