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
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { COACH_META_LIST } from "@/lib/coaches/meta";
import { TRACK_META, type TrackSlug } from "@/lib/coaches/track";
import { cn } from "@/lib/utils";
import { DEFAULT_SESSION_TITLE } from "@/lib/copy";
import { ThemeToggle } from "@/components/app-shell/theme-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface SidebarSessionSummary {
  id: string;
  coachId: string;
  title: string | null;
}

interface SidebarProps {
  recentSessions?: SidebarSessionSummary[];
}

const COLLAPSE_STORAGE_KEY = "bb-sidebar-collapsed";

/** Desktop-only collapsed/expanded state, persisted in localStorage. Same
 * one-time-read-on-mount pattern as `useCoachmark`. */
function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from localStorage on mount
      setCollapsed(window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1");
    } catch {
      // localStorage unavailable — keep expanded.
    }
    setMounted(true);
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }

  return { collapsed: mounted && collapsed, toggle, mounted };
}

/** Wraps its child in a tooltip only when `active` (rail/collapsed mode). */
function RailTooltip({
  label,
  active,
  children,
}: {
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  if (!active) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

function SidebarContent({
  recentSessions = [],
  collapsed = false,
}: SidebarProps & { collapsed?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  // "Progress" follows whichever coach the user is currently looking at
  // (/coaches/{id}/...), instead of always pointing at the first coach —
  // otherwise clicking it from another coach's page silently jumps you
  // to a different coach's data.
  const activeCoachMatch = pathname?.match(/^\/coaches\/([^/]+)/);
  const progressCoachId = activeCoachMatch?.[1] ?? COACH_META_LIST[0].id;
  const progressHref = `/coaches/${progressCoachId}/progress`;

  const linkBase =
    "flex items-center gap-2.5 rounded-sm py-2 text-sm transition-colors ease-[var(--ease-snap)] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring";
  const linkPad = collapsed ? "justify-center px-2" : "px-2.5";

  return (
    <div
      className={cn(
        "flex h-full flex-col gap-6 py-6 text-sidebar-foreground",
        collapsed ? "px-2" : "px-3"
      )}
    >
      <Link
        href="/dashboard"
        className={cn(
          "flex items-center gap-2",
          collapsed ? "justify-center px-0" : "px-3"
        )}
      >
        {collapsed ? (
          <span className="font-display text-lg font-semibold tracking-tight text-sidebar-foreground">
            BB
          </span>
        ) : (
          <span className="font-display text-lg font-semibold tracking-tight text-sidebar-foreground">
            Business Buddy
          </span>
        )}
      </Link>

      <nav className="flex flex-col gap-1">
        <RailTooltip label="Home" active={collapsed}>
          <Link
            href="/dashboard"
            className={cn(
              linkBase,
              linkPad,
              pathname === "/dashboard"
                ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            <Home className="size-4 shrink-0" />
            {!collapsed && "Home"}
          </Link>
        </RailTooltip>
      </nav>

      <nav className="flex flex-col gap-1">
        {!collapsed && (
          <p className="px-3 pb-1 text-xs font-medium tracking-wide text-sidebar-foreground/60 uppercase">
            Coaches
          </p>
        )}
        {COACH_META_LIST.map((coach) => {
          const href = `/coaches/${coach.id}`;
          const active = pathname === href || pathname?.startsWith(`${href}/`);
          const Icon = coach.icon;
          const trackSlugs: TrackSlug[] = ["training", "coaching"];
          return (
            <div key={coach.id} className="flex flex-col gap-0.5">
              <RailTooltip label={coach.name} active={collapsed}>
                <Link
                  href={href}
                  className={cn(
                    linkBase,
                    linkPad,
                    active
                      ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-sidebar-accent text-sidebar-primary">
                    <Icon className="size-4" />
                  </span>
                  {!collapsed && coach.name}
                </Link>
              </RailTooltip>
              {!collapsed && (
                <div className="ml-9 flex flex-col gap-0.5">
                  {trackSlugs.map((slug) => {
                    const subHref = `${href}/${slug}`;
                    const subActive = pathname === subHref || pathname?.startsWith(`${subHref}/`);
                    return (
                      <Link
                        key={slug}
                        href={subHref}
                        className={cn(
                          "truncate rounded-sm px-2.5 py-1.5 text-sm transition-colors ease-[var(--ease-snap)] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                          subActive
                            ? "bg-sidebar-accent text-sidebar-foreground"
                            : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        )}
                      >
                        {TRACK_META[slug].label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {!collapsed && recentSessions.length > 0 && (
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
              {s.title || DEFAULT_SESSION_TITLE}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-auto flex flex-col gap-1 border-t border-sidebar-border pt-3">
        {!collapsed && (
          <p className="px-3 pb-1 text-xs font-medium tracking-wide text-sidebar-foreground/60 uppercase">
            Account
          </p>
        )}
        <RailTooltip label="Progress" active={collapsed}>
          <Link
            href={progressHref}
            className={cn(
              linkBase,
              linkPad,
              pathname?.endsWith("/progress")
                ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            <LineChart className="size-4 shrink-0" />
            {!collapsed && "Progress"}
          </Link>
        </RailTooltip>

        <RailTooltip label="Il tuo profilo" active={collapsed}>
          <Link
            href="/settings/advisor-profile"
            className={cn(
              linkBase,
              linkPad,
              pathname?.startsWith("/settings/")
                ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            <UserCircle2 className="size-4 shrink-0" />
            {!collapsed && "Il tuo profilo"}
          </Link>
        </RailTooltip>

        {collapsed ? (
          <RailTooltip label="Tema" active={collapsed}>
            <div className="flex justify-center py-1">
              <ThemeToggle compact />
            </div>
          </RailTooltip>
        ) : (
          <ThemeToggle />
        )}

        {!collapsed && (
          <div className="flex items-center gap-2.5 truncate px-2.5 py-2 text-sm text-sidebar-foreground/75">
            <User className="size-4 shrink-0" />
            <span className="truncate">
              {session?.user?.name || session?.user?.email || "Account"}
            </span>
          </div>
        )}

        <RailTooltip label="Sign out" active={collapsed}>
          <button
            onClick={handleSignOut}
            className={cn(
              linkBase,
              linkPad,
              "text-left text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            <LogOut className="size-4 shrink-0" />
            {!collapsed && "Sign out"}
          </button>
        </RailTooltip>
      </div>
    </div>
  );
}

export function Sidebar({ recentSessions = [] }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const { collapsed, toggle, mounted } = useSidebarCollapsed();

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

      {/* Mobile drawer (always expanded, unaffected by desktop collapse state) */}
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
      <aside
        className={cn(
          "hidden shrink-0 border-r border-sidebar-border bg-sidebar transition-[width] ease-[var(--ease-settle)] duration-200 md:flex",
          collapsed ? "w-[68px]" : "w-64"
        )}
      >
        <div className="flex min-h-0 w-full flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <SidebarContent recentSessions={recentSessions} collapsed={collapsed} />
          </div>
          {mounted && (
            <div className="border-t border-sidebar-border p-2">
              <button
                type="button"
                onClick={toggle}
                aria-label={collapsed ? "Espandi la barra laterale" : "Comprimi la barra laterale"}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-sm py-2 text-xs text-sidebar-foreground/70 outline-none transition-colors ease-[var(--ease-snap)] duration-150 hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                )}
              >
                {collapsed ? (
                  <ChevronsRight className="size-4" />
                ) : (
                  <>
                    <ChevronsLeft className="size-4" />
                    Comprimi
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
