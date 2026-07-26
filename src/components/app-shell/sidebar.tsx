"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LineChart, LogOut, User, UserCircle2, Home } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { COACH_META_LIST } from "@/lib/coaches/meta";
import { cn } from "@/lib/utils";

export interface SidebarSessionSummary {
  id: string;
  coachId: string;
  title: string | null;
}

interface SidebarProps {
  recentSessions?: SidebarSessionSummary[];
}

function SidebarContent({ recentSessions = [] }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col gap-6 px-3 py-6 text-sidebar-foreground">
      <Link href="/dashboard" className="flex items-center gap-2 px-3">
        <span className="font-display text-lg font-semibold tracking-tight text-sidebar-foreground">
          Business Buddy
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm transition-colors ease-[var(--ease-snap)] duration-150",
            pathname === "/dashboard"
              ? "bg-sidebar-accent text-sidebar-foreground font-medium"
              : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}
        >
          <Home className="size-4" />
          Home
        </Link>
      </nav>

      <nav className="flex flex-col gap-1">
        <p className="px-3 pb-1 text-xs font-medium tracking-wide text-sidebar-foreground/60 uppercase">
          Coaches
        </p>
        {COACH_META_LIST.map((coach) => {
          const href = `/coaches/${coach.id}`;
          const active = pathname === href || pathname?.startsWith(`${href}/`);
          const Icon = coach.icon;
          return (
            <Link
              key={coach.id}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm transition-colors ease-[var(--ease-snap)] duration-150",
                active
                  ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-sidebar-accent text-sidebar-primary">
                <Icon className="size-4" />
              </span>
              {coach.name}
            </Link>
          );
        })}
      </nav>

      {recentSessions.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-xs font-medium tracking-wide text-sidebar-foreground/60 uppercase">
            Recenti
          </p>
          {recentSessions.slice(0, 5).map((s) => (
            <Link
              key={s.id}
              href={`/coaches/${s.coachId}/sessions/${s.id}`}
              className={cn(
                "truncate rounded-sm px-2.5 py-1.5 text-sm transition-colors ease-[var(--ease-snap)] duration-150",
                pathname === `/coaches/${s.coachId}/sessions/${s.id}`
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              {s.title || "Nuova sessione"}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-auto flex flex-col gap-1 border-t border-sidebar-border pt-3">
        <p className="px-3 pb-1 text-xs font-medium tracking-wide text-sidebar-foreground/60 uppercase">
          Account
        </p>
        <Link
          href={`/coaches/${COACH_META_LIST[0].id}/progress`}
          className={cn(
            "flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm transition-colors ease-[var(--ease-snap)] duration-150",
            pathname?.endsWith("/progress")
              ? "bg-sidebar-accent text-sidebar-foreground font-medium"
              : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}
        >
          <LineChart className="size-4" />
          Progress
        </Link>

        <Link
          href="/settings/advisor-profile"
          className={cn(
            "flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm transition-colors ease-[var(--ease-snap)] duration-150",
            pathname === "/settings/advisor-profile"
              ? "bg-sidebar-accent text-sidebar-foreground font-medium"
              : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}
        >
          <UserCircle2 className="size-4" />
          Profilo advisor
        </Link>

        <div className="flex items-center gap-2.5 truncate px-2.5 py-2 text-sm text-sidebar-foreground/75">
          <User className="size-4 shrink-0" />
          <span className="truncate">
            {session?.user?.name || session?.user?.email || "Account"}
          </span>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-sm text-sidebar-foreground/75 transition-colors ease-[var(--ease-snap)] duration-150 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function Sidebar({ recentSessions = [] }: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3 text-sidebar-foreground md:hidden">
        <Link href="/dashboard" className="font-display text-base font-semibold tracking-tight">
          Business Buddy
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex size-9 items-center justify-center rounded-sm hover:bg-sidebar-accent"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="ease-[var(--ease-settle)] relative flex h-full w-72 max-w-[85vw] flex-col bg-sidebar shadow-xl duration-200">
            <div className="flex items-center justify-end px-3 pt-3">
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex size-9 items-center justify-center rounded-sm text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <SidebarContent recentSessions={recentSessions} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:flex">
        <div className="flex w-full flex-col">
          <SidebarContent recentSessions={recentSessions} />
        </div>
      </aside>
    </>
  );
}
