import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { clearHistory, deleteHistoryItem, getSearchHistory } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [{ title: "Search history — InfoSphere AI" }],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["history"], queryFn: getSearchHistory });

  const remove = async (id: string) => {
    await deleteHistoryItem(id);
    qc.invalidateQueries({ queryKey: ["history"] });
    toast.success("Removed");
  };

  const wipe = async () => {
    await clearHistory();
    qc.invalidateQueries({ queryKey: ["history"] });
    toast.success("History cleared");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Search history</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your recent journeys through the sphere.</p>
        </div>
        {data && data.length > 0 && (
          <Button variant="outline" onClick={wipe}>
            <Trash2 className="h-4 w-4" /> Clear all
          </Button>
        )}
      </div>

      <div className="mt-8">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No searches yet"
            description="Your searches will appear here once you start exploring."
            action={
              <Button asChild className="bg-gradient-brand text-white hover:opacity-90">
                <Link to="/">Start searching</Link>
              </Button>
            }
          />
        ) : (
          <ol className="relative border-l pl-6">
            {data.map((h) => (
              <li key={h.id} className="mb-4 last:mb-0">
                <div className="absolute -left-2 mt-2 h-4 w-4 rounded-full bg-gradient-brand" />
                <div className="card-hover flex items-center justify-between gap-3 rounded-xl border bg-card p-4">
                  <Link
                    to="/search"
                    search={{ q: h.keyword, category: undefined, page: 1 }}
                    className="flex min-w-0 items-center gap-3"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted">
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{h.keyword}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(h.created_at).toLocaleString()}
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => remove(h.id)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border hover:bg-accent"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
