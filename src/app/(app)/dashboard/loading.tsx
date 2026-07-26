import { Card, CardContent } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div className="space-y-2">
        <div className="h-7 w-56 animate-pulse rounded-sm bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-sm bg-muted" />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-6">
            <CardContent className="flex flex-col gap-4 p-0">
              <div className="size-11 animate-pulse rounded-md bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded-sm bg-muted" />
                <div className="h-3 w-32 animate-pulse rounded-sm bg-muted" />
              </div>
              <div className="h-9 w-full animate-pulse rounded-full bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
