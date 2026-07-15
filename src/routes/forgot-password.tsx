import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
      { name: "description", content: "Reset your InfoSphere AI account password with an OTP code." },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const ep = emailSchema.safeParse(email);
    if (!ep.success) return toast.error(ep.error.issues[0].message);

    setPending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("We sent a 6-digit code to your inbox.");
      navigate({ to: "/reset-password", search: { email } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reset code");
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we'll send a 6-digit code to reset your password."
      footer={
        <Link to="/auth" search={{ mode: "signin" }} className="inline-flex items-center gap-1 text-brand hover:underline">
          <ArrowLeft className="h-3 w-3" /> Back to sign in
        </Link>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" name="email" type="email" required className="h-11 rounded-xl pl-10" />
          </div>
        </div>
        <Button disabled={pending} className="h-11 w-full rounded-xl bg-gradient-brand text-white shadow-glow hover:opacity-90 animate-gradient">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset code"}
        </Button>
      </form>
    </AuthShell>
  );
}
