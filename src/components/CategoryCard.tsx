import { Link } from "@tanstack/react-router";
import type { Category } from "@/lib/categories";

export function CategoryCard({ category }: { category: Category }) {
  const Icon = category.icon;
  return (
    <Link
      to="/search"
      search={{ q: "", category: category.slug, page: 1 }}
      className="card-hover group relative block overflow-hidden rounded-2xl border bg-card p-6 shadow-soft"
    >
      <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${category.color} opacity-20 blur-2xl transition group-hover:opacity-40`} />
      <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${category.color} text-white shadow-glow`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{category.name}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{category.description}</p>
      <div className="mt-4 text-sm font-medium text-primary opacity-0 transition group-hover:opacity-100">
        Explore →
      </div>
    </Link>
  );
}
