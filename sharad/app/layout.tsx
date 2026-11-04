import type { Metadata } from "next";
import "./globals.css";
import { AnalyticsTracker } from "./components/analytics-tracker";
import { ScrollMotion } from "./components/scroll-motion";

export const metadata: Metadata = {
  title: "Sharad Pandey — Learn, Build, Grow",
  description: "Practical learning in digital marketing, website building, and growing a freelance business.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased"><AnalyticsTracker /><ScrollMotion />{children}</body>
    </html>
  );
}
