import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { SessionProvider } from "@/components/session/session-provider";
import { SiteHeader } from "@/components/shell/site-header";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Nearstage",
    template: "%s · Nearstage",
  },
  description:
    "A fictional demo of location-based events, with map previews, video posts, and demo tickets.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <SessionProvider>
          <div className="flex min-h-dvh flex-col">
            <SiteHeader />
            <div className="flex-1">{children}</div>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
