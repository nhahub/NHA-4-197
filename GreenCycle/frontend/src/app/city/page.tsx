"use client";

import { useState } from "react";
import AnalysisResult from "@/components/AnalysisResult";
import { simulateCity, ApiError } from "@/lib/api";
import type { CityFormData } from "@/types";

const DEFAULTS: CityFormData = {
  population: 250000,
  cars: 80000,
  factories: 12,
  trees: 40000,
  energy_usage: 500000,
};

const FIELDS: { key: keyof CityFormData; label: string; hint: string }[] = [
  { key: "population", label: "Population", hint: "Residents" },
  { key: "cars", label: "Number of cars", hint: "Registered vehicles" },
  { key: "factories", label: "Number of factories", hint: "Active industrial sites" },
  { key: "trees", label: "Number of trees", hint: "Estimated tree cover" },
  { key: "energy_usage", label: "Energy usage", hint: "MWh / year" },
];

export default function CityPage() {
  const [form, setForm] = useState<CityFormData>(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handleChange(key: keyof CityFormData, value: string) {
    const num = Number(value);
    setForm((prev) => ({ ...prev, [key]: value === "" ? 0 : num }));
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    for (const { key, label } of FIELDS) {
      const v = form[key];
      if (Number.isNaN(v) || v < 0) {
        errs[key] = `${label} must be zero or a positive number.`;
      }
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await simulateCity(form);
      setResult(res.simulation);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "Couldn't reach the simulation service. Is the backend running?"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <span className="font-mono text-xs uppercase tracking-widest text-fern">
        Carbon model · POST /api/simulate-city
      </span>
      <h1 className="mt-3 font-display text-4xl font-medium text-canopy">
        City Simulator
      </h1>
      <p className="mt-3 max-w-xl text-ink/70">
        Enter a city&apos;s profile. GreenCycle applies fixed emissions
        factors (4.6t CO2/car/yr, 10,000t/factory/yr, 21kg absorbed/tree/yr,
        4t/person/yr) and projects a 5 and 10-year outlook.
      </p>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          {FIELDS.map(({ key, label, hint }) => (
            <div key={key}>
              <label
                htmlFor={key}
                className="block text-sm font-medium text-ink"
              >
                {label}
                <span className="ml-2 font-mono text-xs text-fern">
                  {hint}
                </span>
              </label>
              <input
                id={key}
                type="number"
                min={0}
                value={form[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                disabled={loading}
                className="focus-ring mt-1 w-full border border-line bg-paper px-3 py-2 font-mono text-sm text-ink"
              />
              {fieldErrors[key] && (
                <p className="mt-1 text-xs text-clay">{fieldErrors[key]}</p>
              )}
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="focus-ring w-full bg-canopy px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-moss disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Running simulation…" : "Run simulation"}
          </button>
        </form>

        <div>
          {error && (
            <div className="border border-clay bg-clay/5 p-4 text-sm text-clay">
              {error}
            </div>
          )}
          {loading && !error && (
            <div className="border border-line bg-paper p-6 text-sm text-ink/60">
              Modeling emissions and drafting the outlook…
            </div>
          )}
          {result && !loading && <AnalysisResult text={result} />}
          {!result && !loading && !error && (
            <div className="flex h-full items-center justify-center border border-dashed border-line p-6 text-center text-sm text-ink/40">
              Your city&apos;s projection will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
