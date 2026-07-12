import { Brain, Code2, Cpu, GraduationCap, FlaskConical, HeartPulse, type LucideIcon } from "lucide-react";

export type Category = {
  name: string;
  slug: string;
  description: string;
  icon: LucideIcon;
  color: string;
};

export const CATEGORIES: Category[] = [
  {
    name: "Artificial Intelligence",
    slug: "Artificial Intelligence",
    description: "LLMs, neural nets, and the frontier of intelligent systems.",
    icon: Brain,
    color: "from-blue-500 to-violet-500",
  },
  {
    name: "Programming",
    slug: "Programming",
    description: "Languages, frameworks, and clean-code craft.",
    icon: Code2,
    color: "from-indigo-500 to-cyan-500",
  },
  {
    name: "Technology",
    slug: "Technology",
    description: "Edge, quantum, connectivity, and what ships next.",
    icon: Cpu,
    color: "from-fuchsia-500 to-blue-500",
  },
  {
    name: "Education",
    slug: "Education",
    description: "How we learn better, faster, and for longer.",
    icon: GraduationCap,
    color: "from-emerald-500 to-teal-500",
  },
  {
    name: "Science",
    slug: "Science",
    description: "Physics, biology, and the universe explained.",
    icon: FlaskConical,
    color: "from-amber-500 to-pink-500",
  },
  {
    name: "Health",
    slug: "Health",
    description: "Sleep, nutrition, and the science of feeling well.",
    icon: HeartPulse,
    color: "from-rose-500 to-orange-500",
  },
];

export const TRENDING = [
  "large language models",
  "quantum computing",
  "react hooks",
  "crispr",
  "climate change",
  "edge computing",
];
