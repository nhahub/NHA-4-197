"use client";

import { useState } from "react";
import UploadBox from "@/components/UploadBox";
import AnalysisResult from "@/components/AnalysisResult";
import { analyzeRecycling, ApiError } from "@/lib/api";

export default function RecyclingPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(selected: File) {
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setResult(null);
    setError(null);
  }

  async function handleAnalyze() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await analyzeRecycling(file);
      setResult(res.analysis);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "Couldn't reach the analysis service. Is the backend running?"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <span className="font-mono text-xs uppercase tracking-widest text-fern">
        Computer vision · POST /api/analyze-recycling
      </span>
      <h1 className="mt-3 font-display text-4xl font-medium text-canopy">
        Recycling Scan
      </h1>
      <p className="mt-3 max-w-xl text-ink/70">
        Upload a photo of a single item. GreenCycle identifies the material,
        whether it&apos;s recyclable, and how to dispose of it properly.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <UploadBox
            onFileSelected={handleFile}
            previewUrl={previewUrl}
            disabled={loading}
          />
          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="focus-ring mt-4 w-full bg-canopy px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-moss disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Analyzing…" : "Analyze item"}
          </button>
        </div>

        <div>
          {error && (
            <div className="border border-clay bg-clay/5 p-4 text-sm text-clay">
              {error}
            </div>
          )}
          {loading && !error && (
            <div className="border border-line bg-paper p-6 text-sm text-ink/60">
              Sending image to the vision model…
            </div>
          )}
          {result && !loading && <AnalysisResult text={result} />}
          {!result && !loading && !error && (
            <div className="flex h-full items-center justify-center border border-dashed border-line p-6 text-center text-sm text-ink/40">
              Your reading will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
