import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, TrendingUp, BookOpen, Zap } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { CategoryCard } from "@/components/CategoryCard";
import { CATEGORIES, TRENDING } from "@/lib/categories";
import { getStats, getSearchHistory } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: getStats });
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const { data: recent } = useQuery({
    queryKey: ["recent-history"],
    queryFn: getSearchHistory,
    enabled: signedIn,
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
          <div className="animate-fade-up mx-auto inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">Premium AI-powered discovery</span>
          </div>
          <h1 className="animate-fade-up mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Search the sphere of{" "}
            <span className="text-gradient-brand animate-gradient bg-gradient-brand bg-clip-text">
              human knowledge
            </span>
          </h1>
          <p className="animate-fade-up mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            InfoSphere AI blends fast keyword search with AI-generated summaries across science,
            technology, health and beyond — beautifully organized, always at hand.
          </p>

          <div className="animate-fade-up mx-auto mt-10 max-w-2xl">
            <SearchBar autoFocus size="lg" />
          </div>

          <div className="animate-fade-up mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Trending:</span>
            {TRENDING.map((t) => (
              <Link
                key={t}
                to="/search"
                search={{ q: t, category: undefined, page: 1 }}
                className="rounded-full border bg-card/50 px-3 py-1 transition hover:border-primary/40 hover:text-foreground"
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat icon={BookOpen} label="Documents indexed" value={(stats?.documents ?? 0).toLocaleString()} />
          <Stat icon={Zap} label="Avg. response" value="< 200ms" />
          <Stat icon={Sparkles} label="AI summaries" value="Every result" />
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Popular categories</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Dive into curated topics or wander freely.
            </p>
          </div>
          <Link to="/categories" className="hidden text-sm text-primary hover:underline sm:block">
            View all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <CategoryCard key={c.slug} category={c} />
          ))}
        </div>
      </section>

      {/* Recent searches */}
      {signedIn && recent && recent.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <h2 className="mb-4 font-display text-xl font-bold">Your recent searches</h2>
          <div className="flex flex-wrap gap-2">
            {recent.slice(0, 8).map((h) => (
              <Link
                key={h.id}
                to="/search"
                search={{ q: h.keyword, category: undefined, page: 1 }}
                className="rounded-full border bg-card/70 px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                {h.keyword}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string }) {
  return (
    <div className="card-hover rounded-2xl border bg-card/70 p-5 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-white">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="font-display text-xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
}
