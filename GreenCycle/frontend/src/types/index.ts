export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatResponse {
  response: string;
}

export interface CityFormData {
  population: number;
  cars: number;
  factories: number;
  trees: number;
  energy_usage: number;
}

export interface CitySimulationResponse {
  simulation: string;
}

export interface ImageAnalysisResponse {
  analysis: string;
}

export interface ApiError {
  detail: string;
}
