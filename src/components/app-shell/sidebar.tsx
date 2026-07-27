"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  LineChart,
  LogOut,
  User,
  UserCircle2,
  Home,
  Briefcase,
} from "lucide-react";
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
            "flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm transition-colors ease-[var(--ease-snap)] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
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
                "flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm transition-colors ease-[var(--ease-snap)] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
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
                "truncate rounded-sm px-2.5 py-1.5 text-sm transition-colors ease-[var(--ease-snap)] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
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
            "flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm transition-colors ease-[var(--ease-snap)] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
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
            "flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm transition-colors ease-[var(--ease-snap)] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
            pathname === "/settings/advisor-profile"
              ? "bg-sidebar-accent text-sidebar-foreground font-medium"
              : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}
        >
          <UserCircle2 className="size-4" />
          Profilo advisor
        </Link>

        <Link
          href="/settings/business-profile"
          className={cn(
            "flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm transition-colors ease-[var(--ease-snap)] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
            pathname === "/settings/business-profile"
              ? "bg-sidebar-accent text-sidebar-foreground font-medium"
              : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}
        >
          <Briefcase className="size-4" />
          Il tuo business
        </Link>

        <div className="flex items-center gap-2.5 truncate px-2.5 py-2 text-sm text-sidebar-foreground/75">
          <User className="size-4 shrink-0" />
          <span className="truncate">
            {session?.user?.name || session?.user?.email || "Account"}
          </span>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-sm text-sidebar-foreground/75 outline-none transition-colors ease-[var(--ease-snap)] duration-150 hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  function closeDrawer() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;

    // Focus the first focusable element inside the drawer.
    const focusables = drawerRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])'
    );
    focusables?.[0]?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeDrawer();
        return;
      }
      if (e.key !== "Tab") return;

      const nodes = drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3 text-sidebar-foreground md:hidden">
        <Link href="/dashboard" className="font-display text-base font-semibold tracking-tight">
          Business Buddy
        </Link>
        <button
          ref={triggerRef}
          onClick={() => setOpen(true)}
          aria-label="Apri il menu"
          aria-expanded={open}
          className="flex size-9 items-center justify-center rounded-sm transition-colors ease-[var(--ease-snap)] duration-150 hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring outline-none"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Chiudi il menu"
            className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150 absolute inset-0 bg-black/40"
            onClick={closeDrawer}
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu di navigazione"
            className="ease-[var(--ease-settle)] motion-safe:animate-in motion-safe:slide-in-from-left relative flex h-full w-72 max-w-[85vw] flex-col bg-sidebar shadow-xl duration-200"
          >
            <div className="flex items-center justify-end px-3 pt-3">
              <button
                onClick={closeDrawer}
                aria-label="Chiudi il menu"
                className="flex size-9 items-center justify-center rounded-sm text-sidebar-foreground transition-colors ease-[var(--ease-snap)] duration-150 hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring outline-none"
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
