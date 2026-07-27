"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2 } from "lucide-react";

interface SessionTitleProps {
  coachId: string;
  sessionId: string;
  initialTitle: string | null;
}

export function SessionTitle({ coachId, sessionId, initialTitle }: SessionTitleProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function startEditing() {
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.select());
  }

  async function save() {
    const next = inputRef.current?.value.trim();
    setEditing(false);
    if (!next || next === title) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/coaches/${coachId}/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: next }),
      });
      if (res.ok) {
        setTitle(next);
        router.refresh(); // updates the sidebar's recent-sessions list too
      }
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <>
        <label htmlFor="session-title-input" className="sr-only">
          Titolo della sessione
        </label>
        <input
          id="session-title-input"
          ref={inputRef}
          defaultValue={title ?? ""}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") setEditing(false);
          }}
          autoFocus
          maxLength={120}
          className="w-full max-w-md rounded-sm border border-input bg-background px-2 py-1 font-display text-lg font-semibold tracking-tight text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </>
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      disabled={saving}
      aria-label={`Rinomina sessione, titolo attuale: ${title || "Nuova sessione"}`}
      className="group flex items-center gap-2 rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
      title="Rinomina sessione"
    >
      <h1 className="font-display text-lg font-semibold tracking-tight text-foreground">
        {title || "Nuova sessione"}
      </h1>
      {saving ? (
        <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
      ) : (
        <Pencil className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  );
}
