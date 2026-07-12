import { SearchX, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  icon: Icon = SearchX,
  action,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-dashed p-10 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-brand text-white shadow-glow">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="mt-5 font-display text-lg font-semibold">{title}</h3>
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
