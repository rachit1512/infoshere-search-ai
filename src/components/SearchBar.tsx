import { Search } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

export function SearchBar({
  autoFocus,
  defaultValue = "",
  size = "lg",
}: {
  autoFocus?: boolean;
  defaultValue?: string;
  size?: "lg" | "md";
}) {
  const [value, setValue] = useState(defaultValue);
  const navigate = useNavigate();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    navigate({ to: "/search", search: { q, category: undefined, page: 1 } });
  };

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className={`shine-border rounded-2xl bg-card/60 backdrop-blur-xl ${size === "lg" ? "p-1.5" : "p-1"}`}>
        <div className="flex items-center gap-2 rounded-[calc(theme(borderRadius.2xl)-4px)]">
          <div className="pl-4 text-muted-foreground">
            <Search className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
          </div>
          <input
            autoFocus={autoFocus}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ask anything — knowledge, code, science, ideas…"
            className={`flex-1 bg-transparent outline-none placeholder:text-muted-foreground ${
              size === "lg" ? "py-4 text-base" : "py-2.5 text-sm"
            }`}
          />
          <button
            type="submit"
            className={`rounded-xl bg-gradient-brand font-medium text-white transition hover:opacity-90 ${
              size === "lg" ? "px-5 py-3 text-sm" : "px-4 py-2 text-sm"
            }`}
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
