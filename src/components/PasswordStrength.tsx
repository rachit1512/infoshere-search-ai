import { useMemo } from "react";
import { Check, X } from "lucide-react";

export function scorePassword(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const LABELS = ["Very weak", "Weak", "Okay", "Strong", "Excellent"];
const COLORS = [
  "bg-destructive",
  "bg-destructive/80",
  "bg-amber-500",
  "bg-brand",
  "bg-gradient-brand",
];

export function PasswordStrength({ password }: { password: string }) {
  const score = useMemo(() => scorePassword(password), [password]);
  const checks = [
    { ok: password.length >= 8, label: "At least 8 characters" },
    { ok: /[A-Z]/.test(password) && /[a-z]/.test(password), label: "Upper & lowercase" },
    { ok: /\d/.test(password), label: "A number" },
    { ok: /[^A-Za-z0-9]/.test(password), label: "A symbol" },
  ];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i < score ? COLORS[score] : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Strength: <span className="font-medium text-foreground">{LABELS[score]}</span>
      </p>
      <ul className="grid grid-cols-2 gap-1 text-xs">
        {checks.map((c) => (
          <li
            key={c.label}
            className={`flex items-center gap-1.5 ${c.ok ? "text-foreground" : "text-muted-foreground"}`}
          >
            {c.ok ? (
              <Check className="h-3 w-3 text-brand" />
            ) : (
              <X className="h-3 w-3 opacity-50" />
            )}
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
