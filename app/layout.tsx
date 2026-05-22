import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppProvider from "@/lib/Provider";

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
    <html lang="en" className={`${inter.className}  h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
