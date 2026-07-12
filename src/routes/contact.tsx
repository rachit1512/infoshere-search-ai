import { createFileRoute } from "@tanstack/react-router";
import { Github, Linkedin, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(160),
  message: z.string().trim().min(5, "Message is a bit short").max(1000),
});

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — InfoSphere AI" },
      { name: "description", content: "Get in touch with the InfoSphere AI team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      message: fd.get("message"),
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) errs[i.path[0] as string] = i.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setPending(true);
    setTimeout(() => {
      setPending(false);
      toast.success("Message sent — we'll get back to you soon.");
      (e.target as HTMLFormElement).reset();
    }, 700);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Let's <span className="text-gradient-brand">connect</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Questions, feedback, or ideas — we'd love to hear from you.
        </p>
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-[1fr_320px]">
        <form onSubmit={onSubmit} className="rounded-2xl border bg-card p-6 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Ada Lovelace" className="mt-1" />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@domain.com" className="mt-1" />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" rows={5} placeholder="Tell us anything…" className="mt-1" />
            {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="mt-5 w-full bg-gradient-brand text-white hover:opacity-90"
          >
            <Send className="h-4 w-4" />
            {pending ? "Sending…" : "Send message"}
          </Button>
        </form>

        <aside className="rounded-2xl border bg-card p-6 shadow-soft">
          <h3 className="font-display text-lg font-semibold">Elsewhere</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Find us across the web — always open to a good conversation.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <a
              href="https://github.com"
              target="_blank" rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border p-3 text-sm transition hover:border-primary/40"
            >
              <Github className="h-4 w-4" /> GitHub
            </a>
            <a
              href="https://linkedin.com"
              target="_blank" rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border p-3 text-sm transition hover:border-primary/40"
            >
              <Linkedin className="h-4 w-4" /> LinkedIn
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
