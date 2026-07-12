import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { z } from "zod";
import { SearchBar } from "@/components/SearchBar";
import { DocumentCard } from "@/components/DocumentCard";
import { EmptyState } from "@/components/EmptyState";
import { CATEGORIES } from "@/lib/categories";
import { getBookmarkIds, logSearch, searchDocuments, SEARCH_PAGE_SIZE } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({
  q: z.string().catch(""),
  category: z.string().optional(),
  page: z.number().int().min(1).catch(1),
});

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  head: ({ match }) => ({
    meta: [
      {
        title: match.search.q
          ? `${match.search.q} — InfoSphere AI`
          : "Search — InfoSphere AI",
      },
      { name: "description", content: "Search results across curated knowledge on InfoSphere AI." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q, category, page } = Route.useSearch();
  const navigate = useNavigate();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["search", q, category, page],
    queryFn: () => searchDocuments({ q, category, page }),
  });

  const { data: bookmarkIds } = useQuery({
    queryKey: ["bookmark-ids"],
    queryFn: getBookmarkIds,
  });

  useEffect(() => {
    if (!q.trim()) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) logSearch(q);
    });
  }, [q]);

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / SEARCH_PAGE_SIZE));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <SearchBar defaultValue={q} size="lg" />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate({ to: "/search", search: { q, category: undefined, page: 1 } })}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              !category ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              onClick={() =>
                navigate({ to: "/search", search: { q, category: c.slug, page: 1 } })
              }
              className={`rounded-full border px-3 py-1 text-xs transition ${
                category === c.slug
                  ? "border-primary bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10">
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border bg-card p-5">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="mt-4 h-6 w-3/4" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-5/6" />
                <Skeleton className="mt-6 h-20 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            title="No results found"
            description={
              q
                ? `We couldn't find anything for "${q}". Try a different keyword or clear the category filter.`
                : "Start by typing a query above."
            }
          />
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {data.total.toLocaleString()} result{data.total === 1 ? "" : "s"}
                {q && <> for <span className="text-foreground">“{q}”</span></>}
              </span>
              {isFetching && <span>Refreshing…</span>}
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((d) => (
                <DocumentCard key={d.id} doc={d} bookmarked={bookmarkIds?.has(d.id)} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  const active = p === page;
                  return (
                    <button
                      key={p}
                      onClick={() =>
                        navigate({ to: "/search", search: { q, category, page: p } })
                      }
                      className={`min-w-9 rounded-md px-3 py-1.5 text-sm transition ${
                        active
                          ? "bg-gradient-brand text-white"
                          : "border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
