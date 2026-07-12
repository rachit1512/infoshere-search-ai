import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

const emailSchema = z.string().trim().email("Enter a valid email").max(160);
const passwordSchema = z.string().min(6, "At least 6 characters").max(72);

export const Route = createFileRoute("/auth")({
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
  const [pending, setPending] = useState(false);

  const handle = async (mode: "signin" | "signup", e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const ep = emailSchema.safeParse(email);
    const pp = passwordSchema.safeParse(password);
    if (!ep.success) return toast.error(ep.error.issues[0].message);
    if (!pp.success) return toast.error(pp.error.issues[0].message);

    setPending(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast.success("Account created — you're signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
      }
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setPending(false);
    }
  };

  const google = async () => {
    setPending(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message ?? "Google sign-in failed");
      setPending(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand shadow-glow">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold">Welcome to InfoSphere AI</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to save bookmarks and history.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border bg-card p-6 shadow-soft">
        <Button
          onClick={google}
          disabled={pending}
          variant="outline"
          className="w-full"
          type="button"
        >
          Continue with Google
        </Button>
        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={(e) => handle("signin", e)} className="mt-4 space-y-3">
              <Field name="email" label="Email" type="email" />
              <Field name="password" label="Password" type="password" />
              <Button disabled={pending} className="w-full bg-gradient-brand text-white hover:opacity-90">
                {pending ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={(e) => handle("signup", e)} className="mt-4 space-y-3">
              <Field name="email" label="Email" type="email" />
              <Field name="password" label="Password" type="password" hint="6+ characters" />
              <Button disabled={pending} className="w-full bg-gradient-brand text-white hover:opacity-90">
                {pending ? "Creating…" : "Create account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Field({ name, label, type, hint }: { name: string; label: string; type: string; hint?: string }) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required className="mt-1" />
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
