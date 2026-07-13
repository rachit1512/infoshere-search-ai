import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bot, Loader2, LogOut, Monitor, Moon, Palette, Search, Sun, Trash2, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { clearHistory } from "@/lib/queries";
import {
  deleteAccount,
  getPreferences,
  getProfile,
  updatePreferences,
  updateProfile,
  type Preferences,
} from "@/lib/user-queries";
import { useTheme, type Theme } from "@/lib/theme";
import { ChangePasswordDialog } from "@/routes/_authenticated/profile";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — InfoSphere AI" },
      { name: "description", content: "Appearance, account, search and AI preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [p, prof] = await Promise.all([getPreferences(), getProfile()]);
        setPrefs(p);
        setDisplayName(prof?.display_name ?? "");
        if (p.theme && p.theme !== theme) setTheme(p.theme);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not load settings");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patch = async (p: Partial<Omit<Preferences, "user_id">>) => {
    if (!prefs) return;
    const next = { ...prefs, ...p };
    setPrefs(next);
    try {
      await updatePreferences(p);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    }
  };

  const saveDisplayName = async () => {
    setSavingName(true);
    try {
      await updateProfile({ display_name: displayName });
      toast.success("Display name updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSavingName(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.navigate({ to: "/" });
  };

  const doClearHistory = async () => {
    try {
      await clearHistory();
      toast.success("Search history cleared");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const doDelete = async () => {
    try {
      await deleteAccount();
      toast.success("Account data deleted");
      router.navigate({ to: "/" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  if (loading || !prefs) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <header className="mb-8 animate-fade-up">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Settings</h1>
        <p className="mt-1 text-muted-foreground">Personalize InfoSphere AI to your liking.</p>
      </header>

      <Section icon={<Palette className="h-4 w-4" />} title="Appearance" subtitle="Choose how InfoSphere AI looks.">
        <div className="grid grid-cols-3 gap-3">
          {(["light", "dark", "system"] as Theme[]).map((t) => {
            const active = theme === t;
            const Icon = t === "light" ? Sun : t === "dark" ? Moon : Monitor;
            return (
              <button
                key={t}
                onClick={() => {
                  setTheme(t);
                  void patch({ theme: t });
                }}
                className={`glass flex flex-col items-center gap-2 rounded-2xl p-4 transition ${
                  active ? "shine-border shadow-glow" : "hover:border-brand/40"
                }`}
              >
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${active ? "bg-gradient-brand text-white" : "bg-muted text-foreground"}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium capitalize">{t}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section icon={<UserIcon className="h-4 w-4" />} title="Account" subtitle="Manage your account details.">
        <div className="space-y-4">
          <div>
            <Label htmlFor="display">Display name</Label>
            <div className="mt-1 flex gap-2">
              <Input id="display" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-11 rounded-xl" />
              <Button onClick={saveDisplayName} disabled={savingName} className="rounded-xl bg-gradient-brand text-white hover:opacity-90">
                {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <ChangePasswordDialog />
            <Button variant="outline" className="rounded-xl" onClick={signOut}>
              <LogOut className="h-4 w-4" /> Logout
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="rounded-xl text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" /> Delete account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently removes your profile, bookmarks, history and preferences. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={doDelete} className="rounded-xl bg-destructive text-destructive-foreground hover:opacity-90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </Section>

      <Section icon={<Search className="h-4 w-4" />} title="Search" subtitle="How your searches behave.">
        <Row label="Enable search suggestions" description="Show suggested topics as you type.">
          <Switch checked={prefs.enable_suggestions} onCheckedChange={(v) => patch({ enable_suggestions: v })} />
        </Row>
        <Row label="Save search history" description="Keep a history of your queries.">
          <Switch checked={prefs.save_history} onCheckedChange={(v) => patch({ save_history: v })} />
        </Row>
        <Row label="Clear search history" description="Delete all saved searches immediately.">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="rounded-xl">Clear</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Clear search history?</AlertDialogTitle>
                <AlertDialogDescription>All your saved searches will be permanently removed.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={doClearHistory} className="rounded-xl bg-gradient-brand text-white hover:opacity-90">
                  Clear
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Row>
      </Section>

      <Section icon={<Bot className="h-4 w-4" />} title="AI" subtitle="Fine-tune AI-generated summaries.">
        <Row label="Enable AI summaries" description="Show AI-generated snippets on search results.">
          <Switch checked={prefs.enable_ai_summary} onCheckedChange={(v) => patch({ enable_ai_summary: v })} />
        </Row>
        <Row label="Summary length" description="How detailed AI summaries should be.">
          <Select value={prefs.summary_length} onValueChange={(v) => patch({ summary_length: v as Preferences["summary_length"] })}>
            <SelectTrigger className="w-36 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="long">Long</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      </Section>
    </div>
  );
}

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass mb-5 rounded-3xl p-6 sm:p-8 animate-fade-up">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand text-white shadow-glow">{icon}</span>
        <div>
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border bg-card/40 p-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}
