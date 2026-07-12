import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { getBookmarks } from "@/lib/queries";
import { DocumentCard } from "@/components/DocumentCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/bookmarks")({
  head: () => ({ meta: [{ title: "Bookmarks — InfoSphere AI" }] }),
  component: BookmarksPage,
});

function BookmarksPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["bookmarks"], queryFn: getBookmarks });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Bookmarks</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your saved insights, ready when you are.
        </p>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No bookmarks yet"
            description="Tap the bookmark icon on any result to save it here."
            action={
              <Button asChild className="bg-gradient-brand text-white hover:opacity-90">
                <Link to="/">Discover something</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((b) => (
              <DocumentCard
                key={b.id}
                doc={b.document}
                bookmarked
                onToggled={(v) => {
                  if (!v) qc.invalidateQueries({ queryKey: ["bookmarks"] });
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
