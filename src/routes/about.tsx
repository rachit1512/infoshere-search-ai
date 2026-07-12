import { createFileRoute } from "@tanstack/react-router";
import { Brain, Cpu, Database, Layers, Rocket, Sparkles, Workflow } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — InfoSphere AI" },
      { name: "description", content: "About InfoSphere AI: our vision, features, technology stack, and roadmap." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Our story
        </div>
        <h1 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
          About <span className="text-gradient-brand">InfoSphere AI</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          A premium AI-powered search experience built to make knowledge feel delightful again.
        </p>
      </div>

      <Section title="Project objective">
        InfoSphere AI reimagines how students, developers, and curious minds discover information.
        We combine fast keyword search with AI summaries, elegant categories, and personal tools
        like bookmarks and history — all wrapped in a modern, minimal interface.
      </Section>

      <Section title="Features">
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            "Fast, case-insensitive keyword search",
            "AI-generated summaries on every result",
            "Category filtering and trending queries",
            "Personal bookmarks and search history",
            "Dark and light modes with smooth transitions",
            "Responsive, mobile-first design",
          ].map((f) => (
            <li key={f} className="flex items-start gap-2 rounded-xl border bg-card p-3 text-sm">
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-gradient-brand" />
              {f}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Technologies used">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Layers, label: "React 19 + TanStack" },
            { icon: Cpu, label: "TypeScript" },
            { icon: Brain, label: "AI summaries" },
            { icon: Database, label: "Cloud database" },
          ].map((t) => (
            <div key={t.label} className="card-hover rounded-xl border bg-card p-4 text-center">
              <div className="mx-auto grid h-10 w-10 place-items-center rounded-lg bg-gradient-brand text-white">
                <t.icon className="h-5 w-5" />
              </div>
              <div className="mt-2 text-sm font-medium">{t.label}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="How it works">
        <div className="rounded-2xl border bg-card p-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <Step icon={Sparkles} title="1. Ask" text="Type a keyword or a question — anything goes." />
            <Step icon={Workflow} title="2. Match" text="We search the indexed corpus with partial, case-insensitive matching." />
            <Step icon={Rocket} title="3. Summarize" text="Each result comes with an AI-crafted summary you can scan in seconds." />
          </div>
        </div>
      </Section>

      <Section title="Future scope">
        Semantic embeddings, personal collections, real-time collaborative highlights, and
        long-form AI answers with citations — coming to the sphere.
      </Section>

      <Section title="Developer">
        Built with love as a B.Tech final-year project — designed and engineered with a focus on
        UI craft, clean architecture, and an experience that feels like a real product.
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-xl font-bold sm:text-2xl">{title}</h2>
      <div className="mt-4 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function Step({ icon: Icon, title, text }: { icon: typeof Sparkles; title: string; text: string }) {
  return (
    <div>
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-white">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 font-display font-semibold text-foreground">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
