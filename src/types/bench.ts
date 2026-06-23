export type TestDifficulty = 'basic' | 'intermediate' | 'advanced' | 'expert';

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  difficulty: TestDifficulty;
  prompt: string;
  expectedContains?: string[];
}

export interface BenchmarkResult {
  scenarioId: string;
  modelId: string;
  success: boolean;
  latencyMs: number;
  cost: number;
  rawResponse: string;
  timestamp: number;
  apiFailed?: boolean;
}
