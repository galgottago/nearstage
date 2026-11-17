"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SeedCatalog } from "@/domain/seed";
import { cn } from "cn";

const links = [
  { href: "/", label: "Map" },
  { href: "/posts", label: "Videos" },
  { href: "/orders", label: "Tickets" },
  { href: "/profile", label: "Profile" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const user = SeedCatalog.currentUser();

  return (
    <header className="sticky top-0 z-[1100] border-b border-white/10 bg-[#1c3a32] text-[#f6f1e7]">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="mr-auto flex items-baseline gap-3">
          <span className="font-heading text-2xl leading-none">Nearstage</span>
          <span className="hidden text-xs tracking-wide text-[#d7c7a4] sm:inline">
            Portland events, pinned
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3 py-1.5",
                  active ? "bg-[#f6f1e7] text-[#1c3a32]" : "text-[#f6f1e7]/85 hover:bg-white/10",
                )}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/profile"
          className="text-sm text-[#f3e2b8] underline-offset-4 hover:underline"
        >
          {user.displayName}
        </Link>
      </div>
      <p className="border-t border-white/10 px-4 py-1.5 text-[11px] tracking-wide text-[#d7c7a4] sm:px-6">
        Fictional demo · Meta is a stub · ticket checkout does not charge anyone
      </p>
    </header>
  );
}
