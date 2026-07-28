"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserCircle2, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/settings/advisor-profile", label: "Profilo advisor", icon: UserCircle2 },
  { href: "/settings/businesses", label: "I tuoi business", icon: Briefcase },
] as const;

/** Tab-style sub-nav shared by every /settings/* route. Active state is
 * prefix-based so /settings/businesses/new and /settings/businesses/[id]
 * still highlight the "I tuoi business" tab. */
export function SettingsTabNav() {
  const pathname = usePathname();

  return (
    <div
      role="tablist"
      aria-label="Sezioni delle impostazioni"
      className="flex gap-1 border-b border-border"
    >
      {TABS.map((tab) => {
        const active = pathname?.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={active}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ease-[var(--ease-snap)] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "border-accent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
