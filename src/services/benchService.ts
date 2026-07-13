/// <reference types="vite/client" />
import { GoogleGenAI } from "@google/genai";
import { Model } from "../types";
import { TestScenario, BenchmarkResult } from "../types/bench";

// ---------------------------------------------------------------------------
// User-supplied API key storage
// Keys are entered by the user in the UI and stored in localStorage.
// ---------------------------------------------------------------------------

const KEY_STORAGE = 'llmbench_provider_keys';

export interface ProviderKeys {
  gemini?: string;
  openai?: string;
  anthropic?: string;
  openrouter?: string;
  localEndpoint?: string;
}

export const getProviderKeys = (): ProviderKeys => {
  try {
    const stored = localStorage.getItem(KEY_STORAGE);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const saveProviderKeys = (keys: ProviderKeys): void => {
  localStorage.setItem(KEY_STORAGE, JSON.stringify(keys));
};

// ---------------------------------------------------------------------------
// Benchmark runner
// ---------------------------------------------------------------------------

export const runBenchmark = async (
  model: Model,
  scenario: TestScenario
): Promise<BenchmarkResult> => {
  const startTime = performance.now();
  let rawResponse = "";
  let cost = 0;

  try {
    const keys = getProviderKeys();

    if (model.provider === 'google') {
      const apiKey = keys.gemini;
      if (!apiKey) throw new Error("Gemini API Key not configured. Add it via Settings → API Keys.");

      const ai = new GoogleGenAI({ apiKey });

      // Map fictional/preview model IDs to real Gemini model IDs
      let targetModelId = model.id;
      if (targetModelId === 'gemini-3.1-flash') targetModelId = 'gemini-2.5-flash';
      if (targetModelId === 'gemini-3.1-pro-preview') targetModelId = 'gemini-2.5-pro-preview-06-05';

      const response = await ai.models.generateContent({
        model: targetModelId,
        contents: scenario.prompt,
        config: { temperature: 0 }
      });

      rawResponse = response.text || "";

    } else if (model.provider === 'anthropic') {
      const apiKey = keys.anthropic;
      if (!apiKey) throw new Error("Anthropic API Key not configured. Add it via Settings → API Keys.");

      const response = await fetch(`https://api.anthropic.com/v1/messages`, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: model.id,
          max_tokens: 4096,
          temperature: 0,
          messages: [{ role: "user", content: scenario.prompt }]
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `Anthropic API Error (HTTP ${response.status})`);
      }

      const json = await response.json();
      rawResponse = json.content?.[0]?.text || "";

    } else {
      // OpenAI, Local, and OpenRouter all use the OpenAI-compatible chat completions endpoint
      let baseUrl = "";
      let apiKey = "";
      let headers: Record<string, string> = { "Content-Type": "application/json" };

      if (model.provider === 'openai') {
        apiKey = keys.openai || '';
        if (!apiKey) throw new Error("OpenAI API Key not configured. Add it via Settings → API Keys.");
        baseUrl = "https://api.openai.com/v1";
        headers["Authorization"] = `Bearer ${apiKey}`;

      } else if (model.provider === 'local') {
        baseUrl = keys.localEndpoint || 'http://localhost:11434/v1';
        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

      } else {
        // openrouter (default fallback)
        apiKey = keys.openrouter || '';
        if (!apiKey) throw new Error("OpenRouter API Key not configured. Add it via Settings → API Keys.");
        baseUrl = "https://openrouter.ai/api/v1";
        headers["Authorization"] = `Bearer ${apiKey}`;
        headers["HTTP-Referer"] = window.location.href;
        headers["X-Title"] = "LLM Bench";
      }

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: model.id,
          messages: [{ role: "user", content: scenario.prompt }],
          temperature: 0
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `API Error (HTTP ${response.status})`);
      }

      const json = await response.json();
      const choice = json.choices?.[0];
      rawResponse = choice?.message?.content || "";
    }

    // Estimate tokens (rough approximation: 4 chars ≈ 1 token)
    const inputTokens = Math.ceil(scenario.prompt.length / 4);
    const outputTokens = Math.ceil(rawResponse.length / 4);

    // Cost per 1M tokens
    const inputCost = (inputTokens / 1_000_000) * model.costInput;
    const outputCost = (outputTokens / 1_000_000) * model.costOutput;
    cost = inputCost + outputCost;

    const latency = performance.now() - startTime;

    let success = true;
    if (scenario.expectedContains && scenario.expectedContains.length > 0) {
      const lowerResp = rawResponse.toLowerCase();
      success = scenario.expectedContains.every(str => lowerResp.includes(str.toLowerCase()));
    } else {
      success = rawResponse.trim().length > 0;
    }

    return {
      scenarioId: scenario.id,
      modelId: model.id,
      success,
      latencyMs: latency,
      cost,
      rawResponse,
      timestamp: Date.now()
    };

  } catch (error: any) {
    console.warn("Benchmark run skipped or failed:", error.message || error);
    return {
      scenarioId: scenario.id,
      modelId: model.id,
      success: false,
      latencyMs: performance.now() - startTime,
      cost: 0,
      rawResponse: `Error: ${error.message}`,
      timestamp: Date.now(),
      apiFailed: true
    };
  }
};

// ---------------------------------------------------------------------------
// Model connection status
// Reads from user-supplied localStorage keys only — no env vars, no URL params.
// ---------------------------------------------------------------------------

export const isModelConnected = (model: Model): boolean => {
  const keys = getProviderKeys();
  switch (model.provider?.toLowerCase()) {
    case 'google':     return !!keys.gemini;
    case 'openai':     return !!keys.openai;
    case 'anthropic':  return !!keys.anthropic;
    case 'openrouter': return !!keys.openrouter;
    case 'local':      return true; // local endpoint is always "available"
    default:           return false;
  }
};

export type ModelStatus = 'connected' | 'offline';

export const getModelStatus = (model: Model): ModelStatus =>
  isModelConnected(model) ? 'connected' : 'offline';
