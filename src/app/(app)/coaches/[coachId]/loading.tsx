import { Card, CardContent } from "@/components/ui/card";

export default function CoachPageLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <Card className="p-6">
        <CardContent className="flex flex-col gap-4 p-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="size-12 shrink-0 animate-pulse rounded-md bg-muted" />
            <div className="space-y-2">
              <div className="h-6 w-40 animate-pulse rounded-sm bg-muted" />
              <div className="h-4 w-56 animate-pulse rounded-sm bg-muted" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-28 animate-pulse rounded-full bg-muted" />
            <div className="h-9 w-32 animate-pulse rounded-full bg-muted" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="h-4 w-32 animate-pulse rounded-sm bg-muted" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <CardContent className="flex items-center justify-between gap-4 p-0">
                <div className="space-y-2">
                  <div className="h-4 w-40 animate-pulse rounded-sm bg-muted" />
                  <div className="h-3 w-24 animate-pulse rounded-sm bg-muted" />
                </div>
                <div className="h-8 w-24 animate-pulse rounded-full bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
