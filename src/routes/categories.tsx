import { createFileRoute } from "@tanstack/react-router";
import { CategoryCard } from "@/components/CategoryCard";
import { CATEGORIES } from "@/lib/categories";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — InfoSphere AI" },
      { name: "description", content: "Browse InfoSphere AI knowledge categories: AI, Programming, Technology, Education, Science, Health." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Explore <span className="text-gradient-brand">categories</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          Curated collections across the fields we love the most. Pick one to dive in.
        </p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => (
          <CategoryCard key={c.slug} category={c} />
        ))}
      </div>
    </div>
  );
}
