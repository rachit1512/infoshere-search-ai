import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export const Route = createFileRoute("/verify-otp")({
  validateSearch: (s: Record<string, unknown>) => ({
    email: typeof s.email === "string" ? s.email : "",
  }),
  head: () => ({
    meta: [
      { title: "Verify email — InfoSphere AI" },
      { name: "description", content: "Enter the code we sent to verify your account." },
    ],
  }),
  component: VerifyOtpPage,
});

function VerifyOtpPage() {
  const navigate = useNavigate();
  const { email } = Route.useSearch();
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [resending, setResending] = useState(false);

  const verify = async () => {
    if (code.length !== 6) return toast.error("Enter the 6-digit code");
    setPending(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "signup",
      });
      if (error) throw error;
      toast.success("Email verified — welcome!");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid or expired code");
    } finally {
      setPending(false);
    }
  };

  const resend = async () => {
    if (!email) return toast.error("Missing email");
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
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
      title="Verify your email"
      subtitle={email ? `Enter the 6-digit code we sent to ${email}.` : "Enter the 6-digit code we sent to your inbox."}
      footer={
        <Link to="/auth" search={{ mode: "signin" }} className="inline-flex items-center gap-1 text-brand hover:underline">
          <ArrowLeft className="h-3 w-3" /> Back to sign in
        </Link>
      }
    >
      <div className="space-y-5">
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} className="h-12 w-12 rounded-xl text-lg" />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          onClick={verify}
          disabled={pending || code.length !== 6}
          className="h-11 w-full rounded-xl bg-gradient-brand text-white shadow-glow hover:opacity-90 animate-gradient"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify email"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Didn't get it?{" "}
          <button onClick={resend} disabled={resending} className="text-brand hover:underline disabled:opacity-50">
            {resending ? "Sending…" : "Resend code"}
          </button>
        </p>
      </div>
    </AuthShell>
  );
}
