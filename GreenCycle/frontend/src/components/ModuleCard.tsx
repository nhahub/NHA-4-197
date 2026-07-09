import Link from "next/link";

interface ModuleCardProps {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  status: "live" | "beta";
}

export default function ModuleCard({
  href,
  eyebrow,
  title,
  description,
  status,
}: ModuleCardProps) {
  return (
    <Link
      href={href}
      className="focus-ring group flex flex-col justify-between border border-line bg-paper p-6 transition-colors hover:border-moss"
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-fern">
            {eyebrow}
          </span>
          <span
            className={`font-mono text-[10px] uppercase tracking-widest ${
              status === "live" ? "text-moss" : "text-amber"
            }`}
          >
            ● {status}
          </span>
        </div>
        <h3 className="mt-3 font-display text-2xl font-medium text-canopy">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">
          {description}
        </p>
      </div>
      <span className="mt-6 inline-flex items-center text-sm font-medium text-canopy group-hover:text-moss">
        Open module <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );
}
