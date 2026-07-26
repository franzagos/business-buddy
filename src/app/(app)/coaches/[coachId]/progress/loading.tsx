import { Card, CardContent } from "@/components/ui/card";

export default function ProgressLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div className="space-y-2">
        <div className="h-3 w-24 animate-pulse rounded-sm bg-muted" />
        <div className="h-7 w-40 animate-pulse rounded-sm bg-muted" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded-sm bg-muted" />
      </div>

      {Array.from({ length: 3 }).map((_, i) => (
        <section key={i} className="space-y-3">
          <div className="h-4 w-32 animate-pulse rounded-sm bg-muted" />
          <Card className="p-6">
            <CardContent className="space-y-3 p-0">
              <div className="h-3 w-24 animate-pulse rounded-sm bg-muted" />
              <div className="h-4 w-3/4 animate-pulse rounded-sm bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded-sm bg-muted" />
            </CardContent>
          </Card>
        </section>
      ))}
    </div>
  );
}
