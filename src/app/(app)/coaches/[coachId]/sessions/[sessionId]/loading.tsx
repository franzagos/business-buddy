export default function SessionLoading() {
  return (
    <div className="flex h-screen min-h-0 flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="h-3 w-24 animate-pulse rounded-sm bg-muted" />
        <div className="mt-2 h-5 w-48 animate-pulse rounded-sm bg-muted" />
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 space-y-6 overflow-y-auto px-6 py-8">
        <div className="flex justify-start">
          <div className="h-16 w-2/3 max-w-[85%] animate-pulse rounded-md bg-muted" />
        </div>
        <div className="flex justify-end">
          <div className="h-10 w-1/2 max-w-[85%] animate-pulse rounded-md bg-muted" />
        </div>
        <div className="flex justify-start">
          <div className="h-20 w-3/4 max-w-[85%] animate-pulse rounded-md bg-muted" />
        </div>
      </div>

      <div className="border-t border-border bg-background px-6 py-4">
        <div className="mx-auto h-16 max-w-3xl animate-pulse rounded-sm bg-muted" />
      </div>
    </div>
  );
}
