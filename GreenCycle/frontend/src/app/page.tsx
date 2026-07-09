import Link from "next/link";
import HorizonDivider from "@/components/HorizonDivider";
import StatReadout from "@/components/StatReadout";
import ModuleCard from "@/components/ModuleCard";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pt-24">
        <span className="font-mono text-xs uppercase tracking-widest text-fern">
          Field log · environmental intelligence
        </span>
        <h1 className="mt-4 max-w-3xl font-display text-5xl font-medium leading-[1.05] text-canopy sm:text-6xl">
          Point your camera at waste.{" "}
          <em className="italic text-moss">Get a straight answer</em> on
          whether it belongs in the bin.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/70">
          GreenCycle reads a photo of an item or a scene, and turns it into a
          recycling or pollution reading you can act on — plus a carbon model
          for entire cities, and an advisor to ask follow-up questions.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/recycling"
            className="focus-ring bg-canopy px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-moss"
          >
            Scan an item
          </Link>
          <Link
            href="/dashboard"
            className="focus-ring border border-canopy px-6 py-3 text-sm font-medium text-canopy transition-colors hover:bg-canopy hover:text-paper"
          >
            View all modules
          </Link>
        </div>

        {/* Signature instrument-panel readout — real figures from the project's
            own model training runs, not decorative numbers */}
        <div className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatReadout label="Waste categories" value="10" />
          <StatReadout label="Classifier val. accuracy" value="87.89" unit="%" />
          <StatReadout label="Carbon model R²" value="0.990" />
          <StatReadout label="Live AI modules" value="04" />
        </div>
      </section>

      <HorizonDivider />

      {/* Problem / solution */}
      <section className="bg-canopy py-20 text-paper">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 sm:grid-cols-2">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-fern">
                The problem
              </span>
              <h2 className="mt-3 font-display text-3xl font-medium">
                Most people can&apos;t tell what&apos;s actually recyclable.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-paper/70">
                Recycling rules vary by material, contamination, and local
                facility — so items get binned wrong, recyclables get
                landfilled, and cities lose track of where their emissions
                are really coming from.
              </p>
            </div>
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-amber">
                The approach
              </span>
              <h2 className="mt-3 font-display text-3xl font-medium">
                Ask the image, not the guidebook.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-paper/70">
                GreenCycle sends a photo to a vision-language model trained to
                reason about materials and pollution, gives you a direct
                verdict, and backs city-level decisions with a transparent
                carbon-accounting model built on real emissions factors.
              </p>
            </div>
          </div>
        </div>
      </section>

      <HorizonDivider flip />

      {/* Modules */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <span className="font-mono text-xs uppercase tracking-widest text-fern">
          Modules
        </span>
        <h2 className="mt-3 font-display text-3xl font-medium text-canopy">
          Four tools, one backend.
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <ModuleCard
            href="/recycling"
            eyebrow="Computer vision"
            title="Recycling Scan"
            description="Upload a photo of an item. Get its material type, recycling code, and whether it's recyclable."
            status="live"
          />
          <ModuleCard
            href="/pollution"
            eyebrow="Computer vision"
            title="Pollution Scan"
            description="Upload a scene photo. Get pollution type, severity, and estimated affected percentage."
            status="live"
          />
          <ModuleCard
            href="/city"
            eyebrow="Carbon model"
            title="City Simulator"
            description="Enter population, vehicles, factories, and tree cover. Get a CO2 emissions and AQI projection."
            status="live"
          />
          <ModuleCard
            href="/chatbot"
            eyebrow="Assistant"
            title="Eco Advisor"
            description="Ask follow-up questions about any reading, or general recycling and sustainability questions."
            status="live"
          />
        </div>
      </section>
    </div>
  );
}
