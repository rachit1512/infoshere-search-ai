import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Bookmark, Camera, Loader2, LogOut, Mail, Search, Settings, ShieldCheck, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  changePassword,
  getPreferences,
  getProfile,
  getUserStats,
  updateProfile,
  uploadAvatar,
  type Profile,
} from "@/lib/user-queries";
import { PasswordInput } from "@/components/PasswordInput";
import { PasswordStrength, scorePassword } from "@/components/PasswordStrength";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — InfoSphere AI" },
      { name: "description", content: "Manage your InfoSphere AI profile, account, and stats." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string>("");
  const [stats, setStats] = useState({ searches: 0, bookmarks: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, u, s] = await Promise.all([
          getProfile(),
          supabase.auth.getUser(),
          getUserStats(),
        ]);
        setProfile(p);
        setEmail(u.data.user?.email ?? "");
        setStats(s);
        setFullName(p?.full_name ?? "");
        setDisplayName(p?.display_name ?? "");
        // Ensure preferences row exists
        await getPreferences().catch(() => undefined);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile({ full_name: fullName, display_name: displayName });
      setProfile((p) => (p ? { ...p, full_name: fullName, display_name: displayName } : p));
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const pickAvatar = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) return toast.error("Image must be under 2 MB");
    setUploading(true);
    try {
      const url = await uploadAvatar(file);
      setProfile((p) => (p ? { ...p, avatar_url: url } : p));
      toast.success("Photo updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.navigate({ to: "/" });
  };

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  const initials = (profile?.display_name || fullName || email || "?").slice(0, 2).toUpperCase();
  const joined = profile?.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "—";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <header className="mb-8 animate-fade-up">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Your profile</h1>
        <p className="mt-1 text-muted-foreground">Manage your account, preferences and activity.</p>
      </header>

      <div className="glass mb-6 flex flex-col items-center gap-6 rounded-3xl p-6 sm:flex-row sm:items-start sm:p-8">
        <div className="relative">
          <Avatar className="h-24 w-24 ring-2 ring-brand/40">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-gradient-brand text-white text-lg">{initials}</AvatarFallback>
          </Avatar>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full bg-gradient-brand text-white shadow-glow transition hover:opacity-90 disabled:opacity-60"
            aria-label="Change photo"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pickAvatar(f);
              e.target.value = "";
            }}
          />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="font-display text-xl font-semibold">{profile?.display_name || fullName || "Your account"}</h2>
          <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start">
            <Mail className="h-3.5 w-3.5" /> {email}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Joined {joined}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/settings"><Settings className="h-4 w-4" /> Settings</Link>
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Total searches" value={stats.searches} icon={<Search className="h-4 w-4" />} />
        <StatCard label="Bookmarks" value={stats.bookmarks} icon={<Bookmark className="h-4 w-4" />} />
        <StatCard label="Member since" value={joined} icon={<User className="h-4 w-4" />} isText />
      </div>

      <section className="glass mb-6 rounded-3xl p-6 sm:p-8">
        <h3 className="font-display text-lg font-semibold">Edit profile</h3>
        <p className="text-sm text-muted-foreground">Update your public details.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 h-11 rounded-xl" />
          </div>
          <div>
            <Label htmlFor="display_name">Display name</Label>
            <Input id="display_name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1 h-11 rounded-xl" />
          </div>
        </div>
        <div className="mt-5">
          <Button onClick={save} disabled={saving} className="rounded-xl bg-gradient-brand text-white shadow-glow hover:opacity-90">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
          </Button>
        </div>
      </section>

      <section className="glass rounded-3xl p-6 sm:p-8">
        <h3 className="font-display text-lg font-semibold">Security</h3>
        <p className="text-sm text-muted-foreground">Update your password.</p>
        <div className="mt-4">
          <ChangePasswordDialog />
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon, isText }: { label: string; value: number | string; icon: React.ReactNode; isText?: boolean }) {
  return (
    <div className="glass rounded-2xl p-5 card-hover">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-brand text-white">{icon}</span>
        {label}
      </div>
      <div className={`mt-3 font-display font-bold ${isText ? "text-sm" : "text-3xl text-gradient-brand"}`}>{value}</div>
    </div>
  );
}

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [cf, setCf] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async () => {
    if (scorePassword(pw) < 2) return toast.error("Password is too weak");
    if (pw !== cf) return toast.error("Passwords do not match");
    setPending(true);
    try {
      await changePassword(pw);
      toast.success("Password updated");
      setOpen(false);
      setPw("");
      setCf("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update");
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl"><ShieldCheck className="h-4 w-4" /> Change password</Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>New password</Label>
            <PasswordInput value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1 h-11 rounded-xl" />
            <PasswordStrength password={pw} />
          </div>
          <div>
            <Label>Confirm password</Label>
            <PasswordInput value={cf} onChange={(e) => setCf(e.target.value)} className="mt-1 h-11 rounded-xl" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={pending} className="rounded-xl bg-gradient-brand text-white hover:opacity-90">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
