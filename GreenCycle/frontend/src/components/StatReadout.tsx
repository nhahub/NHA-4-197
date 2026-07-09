interface StatReadoutProps {
  label: string;
  value: string;
  unit?: string;
}

export default function StatReadout({ label, value, unit }: StatReadoutProps) {
  return (
    <div className="border border-line bg-paper px-5 py-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-fern">
        {label}
      </p>
      <p className="readout mt-1 font-mono text-2xl font-medium text-canopy">
        {value}
        {unit && <span className="ml-1 text-sm text-fern">{unit}</span>}
      </p>
    </div>
  );
}
