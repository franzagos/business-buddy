"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { AlertCircle, ArrowUp, FlagOff, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { CoachId } from "@/lib/coaches";
import {
  SessionRecapDialog,
  type SessionRecap,
} from "@/components/chat/session-recap-dialog";
import { Coachmark, useCoachmark } from "@/components/ui/coachmark";

const BOARD_MESSAGE_PREFIX = "[[board]]\n";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AdvisorOption {
  id: string;
  name: string;
}

interface ChatTranscriptProps {
  coachId: CoachId;
  sessionId: string;
  initialMessages: ChatMessage[];
  advisors: AdvisorOption[];
  hasOwnAdvisorProfile: boolean;
}

export function ChatTranscript({
  coachId,
  sessionId,
  initialMessages,
  advisors,
  hasOwnAdvisorProfile,
}: ChatTranscriptProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnding, setIsEnding] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>([]);
  const [boardProblem, setBoardProblem] = useState("");
  const [isConsulting, setIsConsulting] = useState(false);
  const [recap, setRecap] = useState<SessionRecap | null>(null);
  const [recapOpen, setRecapOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionCoachmark = useCoachmark("session-memory");
  const boardCoachmark = useCoachmark("advisory-board");

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming, isConsulting]);

  // Pre-fill the input from an open topic the user resumed from the
  // dashboard (?draft=...) — never auto-sent, the user still reviews it.
  useEffect(() => {
    const draft = searchParams.get("draft");
    if (!draft) return;
    setInput(draft);
    const next = new URL(window.location.href);
    next.searchParams.delete("draft");
    router.replace(`${next.pathname}${next.search}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Streams a response from `url` into a new assistant bubble. */
  async function streamInto(
    url: string,
    body: Record<string, unknown>
  ): Promise<void> {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      if (res.status === 429) {
        throw new Error(
          "Sessione di oggi conclusa. Anche il miglior coach non ti farebbe allenare 40 round di fila — ci si rivede domani."
        );
      }
      if (res.status === 401) {
        throw new Error("Sessione scaduta. Effettua di nuovo l'accesso.");
      }
      if (res.status === 400) {
        const body = await res.json().catch(() => null);
        const contentErrors: string[] | undefined =
          body?.details?.content ?? body?.details?.problem;
        if (contentErrors?.length) {
          throw new Error(
            contentErrors[0].includes("20000")
              ? "Messaggio troppo lungo (massimo 20.000 caratteri). Prova ad accorciarlo o a dividerlo in più messaggi."
              : contentErrors[0]
          );
        }
      }
      throw new Error(
        "Qualcosa è andato storto durante l'invio del messaggio. Riprova."
      );
    }

    if (!res.body) throw new Error("Risposta vuota dal server.");

    const assistantId = `local-${Date.now()}-assistant`;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      accumulated += decoder.decode(value, { stream: true });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: accumulated } : m
        )
      );
    }

    router.refresh();
  }

  async function handleSend() {
    const content = input.trim();
    if (!content || isStreaming) return;

    setError(null);
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, role: "user", content },
    ]);
    setIsStreaming(true);

    try {
      await streamInto(
        `/api/coaches/${coachId}/sessions/${sessionId}/messages`,
        { content }
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Qualcosa è andato storto. Riprova."
      );
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleEndSession() {
    setIsEnding(true);
    try {
      const res = await fetch(
        `/api/coaches/${coachId}/sessions/${sessionId}/end`,
        { method: "POST" }
      );
      if (!res.ok) {
        toast.error("Non sono riuscito a salvare i progressi. Riprova.");
        return;
      }
      const data = (await res.json()) as { recap: SessionRecap | null };
      if (data.recap) {
        setRecap(data.recap);
        setRecapOpen(true);
      } else {
        toast.info(
          "Sessione chiusa. Troppo breve per un recap, ma è tutto salvato."
        );
      }
      router.refresh();
    } catch {
      toast.error("Non sono riuscito a salvare i progressi. Riprova.");
    } finally {
      setIsEnding(false);
    }
  }

  function toggleAdvisor(id: string) {
    setSelectedAdvisors((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  async function handleConsult() {
    const problem = boardProblem.trim();
    if (!problem || selectedAdvisors.length === 0 || isConsulting) return;

    setError(null);
    setBoardOpen(false);
    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, role: "user", content: problem },
    ]);
    setIsConsulting(true);

    try {
      await streamInto(
        `/api/coaches/${coachId}/sessions/${sessionId}/consult`,
        { problem, advisorIds: selectedAdvisors }
      );
      setBoardProblem("");
      setSelectedAdvisors([]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Qualcosa è andato storto con l'Advisory Board. Riprova."
      );
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsConsulting(false);
    }
  }

  const busy = isStreaming || isConsulting;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mx-auto w-full max-w-3xl flex-1 space-y-6 overflow-y-auto px-6 py-8">
        {messages.map((m) => {
          const isBoard =
            m.role === "assistant" && m.content.startsWith(BOARD_MESSAGE_PREFIX);
          const displayContent = isBoard
            ? m.content.slice(BOARD_MESSAGE_PREFIX.length)
            : m.content;

          return (
            <div
              key={m.id}
              className={cn(
                "flex",
                m.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {m.role === "assistant" ? (
                <div
                  className={cn(
                    "max-w-[85%] rounded-md border px-4 py-3 text-[15px]",
                    isBoard
                      ? "border-accent/40 bg-accent/5 text-card-foreground"
                      : "border-border bg-card text-card-foreground"
                  )}
                >
                  {isBoard && (
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium tracking-wide text-accent uppercase">
                      <Users className="size-3.5" />
                      Advisory Board
                    </p>
                  )}
                  {displayContent ? (
                    <div className="space-y-2 leading-relaxed [&_a]:text-accent [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_h1]:font-display [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:font-display [&_h2]:text-base [&_h2]:font-semibold [&_h3]:font-semibold [&_li]:ml-4 [&_ol]:list-decimal [&_ol]:space-y-1 [&_p]:leading-relaxed [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-1">
                      <ReactMarkdown>{displayContent}</ReactMarkdown>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-3.5 animate-spin" />
                      Sta scrivendo…
                    </span>
                  )}
                </div>
              ) : (
                <div className="max-w-[85%] rounded-md bg-primary px-4 py-3 text-[15px] whitespace-pre-wrap text-primary-foreground">
                  {m.content}
                </div>
              )}
            </div>
          );
        })}

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      <div className="border-t border-border bg-background px-6 py-4">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 pb-2">
          <div className="relative">
            {boardCoachmark.visible && (
              <div className="absolute bottom-full left-0 z-40 mb-2">
                <Coachmark
                  title="Convoca l'Advisory Board"
                  description="Chiedi il parere di più esperti, incluso il tuo advisor personale creato nel profilo, per mettere alla prova un'idea invece di deciderla da solo."
                  onDismiss={boardCoachmark.dismiss}
                />
              </div>
            )}
            <Popover open={boardOpen} onOpenChange={setBoardOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => {
                    if (boardCoachmark.visible) boardCoachmark.dismiss();
                  }}
                >
                  <Users className="size-4" />
                  Advisory Board
                </Button>
              </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Convoca l&apos;Advisory Board
                </p>
                {!hasOwnAdvisorProfile && (
                  <p className="rounded-sm bg-secondary px-3 py-2 text-xs text-secondary-foreground">
                    Prima di sentire gli altri pareri, il tuo qual è?{" "}
                    <Link
                      href="/settings/advisor-profile"
                      className="font-medium underline underline-offset-2"
                    >
                      Crea la tua voce
                    </Link>
                  </p>
                )}
                {advisors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nessun advisor disponibile.
                  </p>
                ) : (
                  <div className="max-h-40 space-y-2 overflow-y-auto">
                    {advisors.map((a) => (
                      <div key={a.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`advisor-${a.id}`}
                          checked={selectedAdvisors.includes(a.id)}
                          onCheckedChange={() => toggleAdvisor(a.id)}
                        />
                        <Label
                          htmlFor={`advisor-${a.id}`}
                          className="text-sm font-normal"
                        >
                          {a.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
                <Textarea
                  value={boardProblem}
                  onChange={(e) => setBoardProblem(e.target.value)}
                  placeholder="Descrivi il caso reale su cui vuoi il loro parere…"
                  rows={3}
                  className="resize-none"
                />
                <Button
                  onClick={handleConsult}
                  disabled={
                    !boardProblem.trim() ||
                    selectedAdvisors.length === 0 ||
                    isConsulting
                  }
                  size="sm"
                  className="w-full"
                >
                  {isConsulting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Users className="size-4" />
                  )}
                  Consulta
                </Button>
              </div>
            </PopoverContent>
            </Popover>
          </div>

          <Button
            onClick={handleEndSession}
            disabled={isEnding}
            variant="outline"
            size="sm"
          >
            {isEnding ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FlagOff className="size-4" />
            )}
            Termina sessione e salva progressi
          </Button>
        </div>

        <div className="relative mx-auto flex max-w-3xl items-end gap-2">
          {sessionCoachmark.visible && (
            <div className="absolute bottom-full left-0 z-40 mb-2">
              <Coachmark
                title="Il coach ricorda le sessioni precedenti"
                description="Ogni scambio viene salvato: il coach tiene traccia dei tuoi progressi nel tempo e li ritrovi nella pagina Progress."
                onDismiss={sessionCoachmark.dismiss}
              />
            </div>
          )}
          <label htmlFor="chat-message-input" className="sr-only">
            Messaggio per il coach
          </label>
          <textarea
            id="chat-message-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (sessionCoachmark.visible) sessionCoachmark.dismiss();
            }}
            disabled={busy}
            placeholder="Scrivi il tuo messaggio…"
            rows={2}
            className="flex-1 resize-none rounded-sm border border-input bg-card px-3 py-2 text-[15px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          />
          <Button
            onClick={handleSend}
            disabled={busy || !input.trim()}
            size="icon"
            className="shrink-0"
            aria-label="Invia messaggio"
          >
            {isStreaming ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowUp className="size-4" />
            )}
          </Button>
        </div>
      </div>

      <SessionRecapDialog
        recap={recap}
        open={recapOpen}
        onOpenChange={setRecapOpen}
      />
    </div>
  );
}
