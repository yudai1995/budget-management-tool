export default function ExpensesLoading() {
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-6 h-8 w-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
      <div className="mb-6 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
          />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
    </div>
  );
}
