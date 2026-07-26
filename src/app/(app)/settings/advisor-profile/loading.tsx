import { Card, CardContent } from "@/components/ui/card";

export default function AdvisorProfileLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div className="space-y-2">
        <div className="h-7 w-64 animate-pulse rounded-sm bg-muted" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded-sm bg-muted" />
      </div>

      <Card className="p-6">
        <CardContent className="space-y-6 p-0">
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded-sm bg-muted" />
            <div className="h-24 w-full animate-pulse rounded-sm bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-28 animate-pulse rounded-sm bg-muted" />
            <div className="h-24 w-full animate-pulse rounded-sm bg-muted" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
