import { Link, useRouter } from "@tanstack/react-router";
import { Bookmark, Clock, LogIn, LogOut, Menu, Search, Settings, Sparkles, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const links = [
  { to: "/", label: "Home" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

type SessionUser = { email: string | null; avatar_url: string | null; display_name: string | null };

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return setUser(null);
      const { data: prof } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", data.user.id)
        .maybeSingle();
      setUser({
        email: data.user.email ?? null,
        avatar_url: prof?.avatar_url ?? null,
        display_name: prof?.display_name ?? null,
      });
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) setUser(null);
      else load();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.navigate({ to: "/" });
  };

  const initials = (user?.display_name || user?.email || "?").slice(0, 2).toUpperCase();

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
            {user && (
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
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full outline-none ring-brand/40 transition hover:ring-2" aria-label="Account menu">
                    <Avatar className="h-9 w-9 ring-2 ring-brand/30">
                      <AvatarImage src={user.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-gradient-brand text-white text-xs">{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl">
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    Signed in as<br />
                    <span className="text-foreground font-medium">{user.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile"><User className="h-4 w-4" /> Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/bookmarks"><Bookmark className="h-4 w-4" /> Bookmarks</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/history"><Clock className="h-4 w-4" /> History</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings"><Settings className="h-4 w-4" /> Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="hidden sm:inline-flex bg-gradient-brand text-white hover:opacity-90">
                <Link to="/auth" search={{ mode: "signin" }}>
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
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-accent">
                    <User className="mr-2 inline h-4 w-4" />Profile
                  </Link>
                  <Link to="/bookmarks" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-accent">
                    <Bookmark className="mr-2 inline h-4 w-4" />Bookmarks
                  </Link>
                  <Link to="/history" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-accent">
                    <Clock className="mr-2 inline h-4 w-4" />History
                  </Link>
                  <Link to="/settings" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-accent">
                    <Settings className="mr-2 inline h-4 w-4" />Settings
                  </Link>
                  <button onClick={signOut} className="rounded-md px-3 py-2 text-left text-sm hover:bg-accent">
                    <LogOut className="mr-2 inline h-4 w-4" />Sign out
                  </button>
                </>
              ) : (
                <Link to="/auth" search={{ mode: "signin" }} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-accent">
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
