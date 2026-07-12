import { Link, useRouter } from "@tanstack/react-router";
import { Bookmark, Clock, LogIn, LogOut, Menu, Search, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

const links = [
  { to: "/", label: "Home" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-brand shadow-glow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">
              InfoSphere <span className="text-gradient-brand">AI</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
                activeProps={{ className: "text-foreground font-medium" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
            {email && (
              <>
                <Link
                  to="/bookmarks"
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
                  activeProps={{ className: "text-foreground font-medium" }}
                >
                  Bookmarks
                </Link>
                <Link
                  to="/history"
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
                  activeProps={{ className: "text-foreground font-medium" }}
                >
                  History
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {email ? (
              <Button variant="ghost" size="sm" onClick={signOut} className="hidden sm:inline-flex">
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            ) : (
              <Button asChild size="sm" className="hidden sm:inline-flex bg-gradient-brand text-white hover:opacity-90">
                <Link to="/auth">
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Link>
              </Button>
            )}
            <button
              onClick={() => setOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-md border md:hidden"
              aria-label="Menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
                >
                  {l.label}
                </Link>
              ))}
              {email ? (
                <>
                  <Link to="/bookmarks" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-accent">
                    <Bookmark className="mr-2 inline h-4 w-4" />Bookmarks
                  </Link>
                  <Link to="/history" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-accent">
                    <Clock className="mr-2 inline h-4 w-4" />History
                  </Link>
                  <button onClick={signOut} className="rounded-md px-3 py-2 text-left text-sm hover:bg-accent">
                    <LogOut className="mr-2 inline h-4 w-4" />Sign out
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-accent">
                  <Search className="mr-2 inline h-4 w-4" />Sign in
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
