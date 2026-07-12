/// <reference types="vite/client" />
import { GoogleGenAI } from "@google/genai";
import { Model } from "../types";
import { TestScenario, BenchmarkResult } from "../types/bench";

export const runBenchmark = async (
  model: Model,
  scenario: TestScenario
): Promise<BenchmarkResult> => {
  const startTime = performance.now();
  let rawResponse = "";
  let cost = 0;

  try {
    const status = getModelStatus(model);
    const isDemoMode = status === 'demo';

    if (model.provider === 'google' || isDemoMode) {
      const apiKey = import.meta.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) throw new Error("Gemini API Key required in environment. Configure it in the codebase.");
      
      const ai = new GoogleGenAI({ apiKey });
      
      // Map hypothetical/fictional model IDs to actual working Gemini models
      let targetModelId = isDemoMode ? 'gemini-3.1-flash' : model.id;
      if (targetModelId === 'gemini-3.1-flash') {
        targetModelId = 'gemini-2.5-flash';
      }

      const response = await ai.models.generateContent({
        model: targetModelId,
        contents: scenario.prompt,
        config: {
          temperature: 0
        }
      });

      rawResponse = response.text || "";

    } else if (model.provider === 'anthropic') {
      const apiKey = import.meta.env.ANTHROPIC_API_KEY || import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error("Anthropic API Key required in environment. Configure it in the codebase.");

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
      // OpenAI, Local, OpenRouter all use OpenAI-compatible endpoints
      let baseUrl = "";
      let apiKey = "";
      let headers: Record<string, string> = {
        "Content-Type": "application/json"
      };

      if (model.provider === 'openai') {
        apiKey = import.meta.env.OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY || '';
        if (!apiKey) throw new Error("OpenAI API Key required in environment. Configure it in the codebase.");
        baseUrl = "https://api.openai.com/v1";
        headers["Authorization"] = `Bearer ${apiKey}`;
      } 
      else if (model.provider === 'local') {
        baseUrl = import.meta.env.LOCAL_ENDPOINT || import.meta.env.VITE_LOCAL_ENDPOINT || 'http://localhost:11434/v1';
        if (!baseUrl) throw new Error("Local API Endpoint URL required in environment. Configure LOCAL_ENDPOINT in the codebase.");
        // Strip trailing slash
        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
      }
      else {
        // openrouter (or default fallback)
        apiKey = import.meta.env.OPENROUTER_API_KEY || import.meta.env.VITE_OPENROUTER_API_KEY || '';
        if (!apiKey) throw new Error("OpenRouter API Key required in environment. Configure it in the codebase.");
        baseUrl = import.meta.env.OPENROUTER_ENDPOINT || import.meta.env.VITE_OPENROUTER_ENDPOINT || "https://openrouter.ai/api/v1";
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

    // Estimate tokens (rough approximation: 4 chars = 1 token)
    const inputChars = scenario.prompt.length;
    const outputChars = rawResponse.length;
    
    const inputTokens = Math.ceil(inputChars / 4);
    const outputTokens = Math.ceil(outputChars / 4);

    // Calculate cost (Model costs are usually per 1M tokens)
    const inputCost = (inputTokens / 1000000) * model.costInput;
    const outputCost = (outputTokens / 1000000) * model.costOutput;
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
    console.warn("Benchmark run skipped or failed: ", error.message || error);
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

export const isModelConnected = (model: Model): boolean => {
  const provider = model.provider?.toLowerCase();
  switch (provider) {
    case 'google':
      return !!(
        import.meta.env.GEMINI_API_KEY ||
        import.meta.env.VITE_GEMINI_API_KEY ||
        (typeof process !== 'undefined' && process.env && (process.env.API_KEY || process.env.GEMINI_API_KEY))
      );
    case 'openai':
      return !!(import.meta.env.OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY);
    case 'anthropic':
      return !!(import.meta.env.ANTHROPIC_API_KEY || import.meta.env.VITE_ANTHROPIC_API_KEY);
    case 'openrouter':
      return !!(import.meta.env.OPENROUTER_API_KEY || import.meta.env.VITE_OPENROUTER_API_KEY);
    case 'local':
      return true;
    default:
  }
};

export type ModelStatus = 'connected' | 'demo' | 'offline';

export const getModelStatus = (model: Model): ModelStatus => {
  if (isModelConnected(model)) {
    return 'connected';
  }

  const hasGeminiKey = !!(
    import.meta.env.GEMINI_API_KEY ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    (typeof process !== 'undefined' && process.env && (process.env.API_KEY || process.env.GEMINI_API_KEY))
  );

  const isLive = typeof window !== 'undefined' && (
    (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') ||
    window.location.search.includes('demo=true')
  );

  if (isLive && hasGeminiKey) {
    return 'demo';
  }

  return 'offline';
};


