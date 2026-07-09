"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/recycling", label: "Recycling Scan" },
  { href: "/pollution", label: "Pollution Scan" },
  { href: "/city", label: "City Simulator" },
  { href: "/chatbot", label: "Eco Advisor" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-baseline gap-2 focus-ring rounded">
          <span className="font-display text-xl font-semibold text-canopy">
            GreenCycle
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-widest text-fern sm:inline">
            field intelligence
          </span>
        </Link>
        <ul className="flex flex-wrap items-center gap-1 text-sm">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`focus-ring rounded px-3 py-2 transition-colors ${
                    active
                      ? "bg-canopy text-paper"
                      : "text-ink/70 hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
