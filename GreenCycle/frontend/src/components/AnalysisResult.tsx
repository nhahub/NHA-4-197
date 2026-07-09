interface AnalysisResultProps {
  text: string;
}

export default function AnalysisResult({ text }: AnalysisResultProps) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="border border-line bg-paper p-6">
      <p className="font-mono text-[10px] uppercase tracking-widest text-fern">
        Reading
      </p>
      <div className="mt-3 space-y-2">
        {lines.map((line, i) => (
          <p key={i} className="text-sm leading-relaxed text-ink/85">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
