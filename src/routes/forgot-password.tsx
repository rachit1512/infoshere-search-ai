import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emailSchema = z.string().trim().email("Enter a valid email");

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password — InfoSphere AI" },
      { name: "description", content: "Reset your InfoSphere AI account password." },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const ep = emailSchema.safeParse(email);
    if (!ep.success) return toast.error(ep.error.issues[0].message);

    setPending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Reset link sent — check your inbox.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reset email");
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthShell
      title={sent ? "Check your email" : "Forgot your password?"}
      subtitle={
        sent
          ? "We sent you a secure link to reset your password. It expires in 1 hour."
          : "Enter the email associated with your account and we'll send a reset link."
      }
      footer={
        <Link to="/auth" search={{ mode: "signin" }} className="inline-flex items-center gap-1 text-brand hover:underline">
          <ArrowLeft className="h-3 w-3" /> Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="grid place-items-center py-6 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand shadow-glow">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Didn't get it? Check spam, or <button onClick={() => setSent(false)} className="text-brand hover:underline">try again</button>.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" name="email" type="email" required className="h-11 rounded-xl pl-10" />
            </div>
          </div>
          <Button disabled={pending} className="h-11 w-full rounded-xl bg-gradient-brand text-white shadow-glow hover:opacity-90 animate-gradient">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
