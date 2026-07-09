export default function Footer() {
  return (
    <footer className="border-t border-line bg-canopy text-paper/70">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-lg text-paper">GreenCycle</p>
          <p className="font-mono text-xs uppercase tracking-widest">
            waste · pollution · city carbon · advisory
          </p>
        </div>
        <p className="mt-4 max-w-2xl text-xs leading-relaxed text-paper/50">
          GreenCycle is a student research platform. Readings come from a
          vision-language model and a rule-based carbon model — treat results
          as guidance, not a certified environmental assessment.
        </p>
      </div>
    </footer>
  );
}
