export interface Model {
  id: string;
  name: string;
  provider: string;
  costInput: number; // per 1M tokens
  costOutput: number; // per 1M tokens
  contextWindow: number;
  isGeminiNative?: boolean;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface BenchmarkMetrics {
  timeToFirstToken?: number; // ms
  totalTime: number; // ms
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  speedScore: number; // 0-100
  qualityScore?: number; // 1-5
}

export interface ModelResponse {
  modelId: string;
  response: string;
  metrics: BenchmarkMetrics;
  error?: string;
  timestamp: number;
}

export interface HistoryItem {
  id: string;
  prompt: string;
  date: number;
  results: ModelResponse[];
}

export interface AppSettings {
  theme: 'light' | 'dark';
  favoriteModels: string[];
  blindMode: boolean;
  enabledModelIds?: string[];
  customModels?: Model[];
}
