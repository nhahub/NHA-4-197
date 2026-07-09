import type {
  ChatMessage,
  ChatResponse,
  CityFormData,
  CitySimulationResponse,
  ImageAnalysisResponse,
} from "@/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function parseError(res: Response): Promise<never> {
  let detail = `Request failed with status ${res.status}.`;
  try {
    const body = await res.json();
    if (body?.detail) detail = body.detail;
  } catch {
    // response wasn't JSON — keep the default message
  }
  throw new ApiError(detail, res.status);
}

export async function sendChatMessage(
  messages: ChatMessage[]
): Promise<ChatResponse> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function simulateCity(
  data: CityFormData
): Promise<CitySimulationResponse> {
  const res = await fetch(`${API_URL}/api/simulate-city`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function analyzePollution(
  file: File
): Promise<ImageAnalysisResponse> {
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(`${API_URL}/api/analyze-pollution`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function analyzeRecycling(
  file: File
): Promise<ImageAnalysisResponse> {
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(`${API_URL}/api/analyze-recycling`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) await parseError(res);
  return res.json();
}
