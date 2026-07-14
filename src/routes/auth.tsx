import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { AuthShell } from "@/components/AuthShell";
import { PasswordInput } from "@/components/PasswordInput";
import { PasswordStrength, scorePassword } from "@/components/PasswordStrength";

const emailSchema = z.string().trim().email("Enter a valid email").max(160);

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    mode: (s.mode === "signup" ? "signup" : "signin") as "signin" | "signup",
  }),
  head: () => ({
    meta: [
      { title: "Sign in — InfoSphere AI" },
      { name: "description", content: "Sign in or create your InfoSphere AI account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const [pending, setPending] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showEmail, setShowEmail] = useState(false);

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const pw = String(fd.get("password") ?? "");
    const remember = fd.get("remember") === "on";
    const ep = emailSchema.safeParse(email);
    if (!ep.success) return toast.error(ep.error.issues[0].message);
    if (!pw) return toast.error("Enter your password");

    setPending(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) throw error;
      try {
        if (remember) localStorage.setItem("infosphere:remember", "1");
        else localStorage.removeItem("infosphere:remember");
      } catch {
        /* ignore */
      }
      toast.success("Welcome back.");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setPending(false);
    }
  };

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const fullName = String(fd.get("full_name") ?? "").trim();
    const pw = password;
    const cf = confirm;
    const ep = emailSchema.safeParse(email);
    if (!ep.success) return toast.error(ep.error.issues[0].message);
    if (scorePassword(pw) < 2) return toast.error("Password is too weak");
    if (pw !== cf) return toast.error("Passwords do not match");
    if (!fullName) return toast.error("Enter your full name");

    setPending(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pw,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { display_name: fullName, full_name: fullName },
        },
      });
      if (error) throw error;
      if (data.session) {
        toast.success("Account created — you're signed in.");
        navigate({ to: "/" });
      } else {
        toast.success("Check your email for a verification code.");
        navigate({ to: "/verify-otp", search: { email } });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setPending(false);
    }
  };

  const google = async () => {
    setPending(true);
    // Reveal the email login option as soon as the user engages with Google —
    // it acts as an immediate fallback if the OAuth popup is blocked or fails.
    setShowEmail(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message ?? "Google sign-in failed — use email below");
      setPending(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  };

  return (
    <AuthShell
      title={search.mode === "signup" ? "Create your account" : "Welcome back"}
      subtitle={
        search.mode === "signup"
          ? "Join InfoSphere AI to save bookmarks, history and preferences."
          : "Sign in to continue your journey."
      }
      footer={
        search.mode === "signup" ? (
          <>Already have an account? <Link to="/auth" search={{ mode: "signin" }} className="text-brand font-medium hover:underline">Sign in</Link></>
        ) : (
          <>New to InfoSphere AI? <Link to="/auth" search={{ mode: "signup" }} className="text-brand font-medium hover:underline">Create an account</Link></>
        )
      }
    >
      <Button
        onClick={google}
        disabled={pending}
        variant="outline"
        className="h-11 w-full rounded-xl"
        type="button"
      >
        <GoogleIcon /> Continue with Google
      </Button>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> OR CONTINUE WITH EMAIL <div className="h-px flex-1 bg-border" />
      </div>

      <Tabs value={search.mode} onValueChange={(v) => navigate({ to: "/auth", search: { mode: v as "signin" | "signup" } })}>
        <TabsList className="grid w-full grid-cols-2 rounded-xl">
          <TabsTrigger value="signin" className="rounded-lg">Sign in</TabsTrigger>
          <TabsTrigger value="signup" className="rounded-lg">Create account</TabsTrigger>
        </TabsList>

        <TabsContent value="signin">
          <form onSubmit={handleSignIn} className="mt-5 space-y-4">
            <Field name="email" label="Email" type="email" icon={<Mail className="h-4 w-4" />} />
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-brand hover:underline">Forgot password?</Link>
              </div>
              <PasswordInput id="password" name="password" required className="mt-1 h-11 rounded-xl" />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox name="remember" defaultChecked /> Remember me
            </label>
            <Button disabled={pending} className="h-11 w-full rounded-xl bg-gradient-brand text-white shadow-glow hover:opacity-90 animate-gradient">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup">
          <form onSubmit={handleSignUp} className="mt-5 space-y-4">
            <Field name="full_name" label="Full name" type="text" placeholder="Jane Doe" />
            <Field name="email" label="Email" type="email" icon={<Mail className="h-4 w-4" />} />
            <div>
              <Label htmlFor="new-password">Password</Label>
              <PasswordInput
                id="new-password"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 h-11 rounded-xl"
              />
              <PasswordStrength password={password} />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm password</Label>
              <PasswordInput
                id="confirm-password"
                name="confirm"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 h-11 rounded-xl"
              />
              {confirm && confirm !== password && (
                <p className="mt-1 text-xs text-destructive">Passwords do not match</p>
              )}
            </div>
            <Button disabled={pending} className="h-11 w-full rounded-xl bg-gradient-brand text-white shadow-glow hover:opacity-90 animate-gradient">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create account <ArrowRight className="h-4 w-4" /></>}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              By continuing you agree to our Terms and Privacy Policy.
            </p>
          </form>
        </TabsContent>
      </Tabs>
    </AuthShell>
  );
}

function Field({
  name,
  label,
  type,
  placeholder,
  icon,
}: {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <div className="relative mt-1">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>}
        <Input id={name} name={name} type={type} required placeholder={placeholder} className={`h-11 rounded-xl ${icon ? "pl-10" : ""}`} />
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.5 14.7 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12S6.8 21.5 12 21.5c6.9 0 9.4-4.8 9.4-7.3 0-.5-.1-.9-.1-1.3H12z" />
    </svg>
  );
}
