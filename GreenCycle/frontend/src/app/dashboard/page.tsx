import ModuleCard from "@/components/ModuleCard";
import StatReadout from "@/components/StatReadout";

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <span className="font-mono text-xs uppercase tracking-widest text-fern">
        Overview
      </span>
      <h1 className="mt-3 font-display text-4xl font-medium text-canopy">
        Dashboard
      </h1>
      <p className="mt-3 max-w-2xl text-ink/70">
        A quick-access panel for every service the GreenCycle backend
        exposes, plus the underlying model figures behind the project.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatReadout label="API endpoints" value="04" />
        <StatReadout label="Waste categories" value="10" />
        <StatReadout label="Classifier val. accuracy" value="87.89" unit="%" />
        <StatReadout label="Carbon model R²" value="0.990" />
      </div>

      <h2 className="mt-14 font-display text-2xl font-medium text-canopy">
        Services
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <ModuleCard
          href="/recycling"
          eyebrow="POST /api/analyze-recycling"
          title="Recycling Scan"
          description="Vision-language analysis of an uploaded item photo: material, recycling code, and disposal guidance."
          status="live"
        />
        <ModuleCard
          href="/pollution"
          eyebrow="POST /api/analyze-pollution"
          title="Pollution Scan"
          description="Vision-language analysis of an uploaded scene photo: pollution type, severity, and cause."
          status="live"
        />
        <ModuleCard
          href="/city"
          eyebrow="POST /api/simulate-city"
          title="City Simulator"
          description="Rule-based emissions model (cars, factories, trees, population) narrated into a 5/10-year outlook."
          status="live"
        />
        <ModuleCard
          href="/chatbot"
          eyebrow="POST /api/chat"
          title="Eco Advisor"
          description="General-purpose environmental assistant for recycling, pollution, and sustainability questions."
          status="live"
        />
      </div>

      <div className="mt-14 border border-line bg-canopy/5 p-6">
        <h3 className="font-display text-lg font-medium text-canopy">
          About the trained models
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/70">
          The project also includes a locally trained MobileNetV2 waste
          classifier (87.89% validation accuracy across 10 categories) and a
          Ridge/XGBoost CO2-per-capita regression model (R² up to 0.99),
          developed in the accompanying notebooks. These currently run as
          standalone research notebooks and are not yet wired into the live
          API — the Recycling Scan and Pollution Scan modules above call the
          deployed vision-language backend instead. See the README for how
          to add a model-serving endpoint for them.
        </p>
      </div>
    </div>
  );
}
