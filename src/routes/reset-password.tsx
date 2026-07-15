import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Mail, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { PasswordInput } from "@/components/PasswordInput";
import { PasswordStrength, scorePassword } from "@/components/PasswordStrength";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (s: Record<string, unknown>) => ({
    email: typeof s.email === "string" ? s.email : "",
  }),
  head: () => ({
    meta: [
      { title: "Reset password — InfoSphere AI" },
      { name: "description", content: "Verify your OTP and choose a new password." },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const { email: initialEmail } = Route.useSearch();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [resending, setResending] = useState(false);
  const [verifiedViaLink, setVerifiedViaLink] = useState(false);

  // If the user clicked the email link, Supabase establishes a recovery session automatically.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setVerifiedViaLink(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setVerifiedViaLink(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (scorePassword(password) < 2) return toast.error("Password is too weak");
    if (password !== confirm) return toast.error("Passwords do not match");

    setPending(true);
    try {
      if (!verifiedViaLink) {
        if (!email) throw new Error("Enter the email you requested the code for");
        if (code.length !== 6) throw new Error("Enter the 6-digit code");
        const { error: vErr } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: code,
          type: "recovery",
        });
        if (vErr) throw vErr;
      }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated — you're signed in.");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reset password");
    } finally {
      setPending(false);
    }
  };

  const resend = async () => {
    if (!email) return toast.error("Enter your email first");
    setResending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("New code sent.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle={
        verifiedViaLink
          ? "You're verified. Choose a new password below."
          : "Enter the 6-digit code we emailed you, then choose a new password."
      }
      footer={
        <Link to="/auth" search={{ mode: "signin" }} className="inline-flex items-center gap-1 text-brand hover:underline">
          <ArrowLeft className="h-3 w-3" /> Back to sign in
        </Link>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        {!verifiedViaLink && (
          <>
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-xl pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Verification code</Label>
              <div className="mt-2 flex justify-center">
                <InputOTP maxLength={6} value={code} onChange={setCode}>
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTPSlot key={i} index={i} className="h-11 w-11 rounded-xl text-lg" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Didn't get it?{" "}
                <button
                  type="button"
                  onClick={resend}
                  disabled={resending}
                  className="text-brand hover:underline disabled:opacity-50"
                >
                  {resending ? "Sending…" : "Resend code"}
                </button>
              </p>
            </div>
          </>
        )}

        <div>
          <Label htmlFor="new-password">New password</Label>
          <PasswordInput
            id="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 h-11 rounded-xl"
          />
          <PasswordStrength password={password} />
        </div>
        <div>
          <Label htmlFor="confirm-password">Confirm password</Label>
          <PasswordInput
            id="confirm-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="mt-1 h-11 rounded-xl"
          />
        </div>

        <Button
          disabled={pending}
          className="h-11 w-full rounded-xl bg-gradient-brand text-white shadow-glow hover:opacity-90 animate-gradient"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" /> Reset password
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
