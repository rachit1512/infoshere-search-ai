import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-brand/20 blur-3xl animate-float" />
        <div className="absolute right-8 bottom-16 h-56 w-56 rounded-full bg-brand-2/20 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <Link to="/" className="mx-auto mb-6 flex items-center gap-2 group">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-brand shadow-glow animate-gradient">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <span className="font-display text-lg font-bold tracking-tight">
          InfoSphere <span className="text-gradient-brand">AI</span>
        </span>
      </Link>

      <div className="animate-fade-up text-center">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="glass mt-6 animate-fade-up rounded-3xl p-6 shadow-glow sm:p-8" style={{ animationDelay: "80ms" }}>
        {children}
      </div>

      {footer && (
        <div className="mt-6 text-center text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: "160ms" }}>
          {footer}
        </div>
      )}
    </div>
  );
}
