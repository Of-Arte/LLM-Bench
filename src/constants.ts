import { Model } from './types';

export const MODELS: Model[] = [
  // ── Google Gemini ──────────────────────────────────────────────────────────
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    provider: 'google',
    costInput: 0.075,
    costOutput: 0.30,
    contextWindow: 1000000,
    isGeminiNative: true
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    provider: 'google',
    costInput: 1.25,
    costOutput: 10.00,
    contextWindow: 1000000,
    isGeminiNative: true
  },
  // ── OpenAI GPT-5.6 ────────────────────────────────────────────────────────
  {
    id: 'gpt-5.6-sol',
    name: 'GPT-5.6 Sol',
    provider: 'openai',
    costInput: 5.00,
    costOutput: 30.00,
    contextWindow: 1050000
  },
  {
    id: 'gpt-5.6-terra',
    name: 'GPT-5.6 Terra',
    provider: 'openai',
    costInput: 2.50,
    costOutput: 15.00,
    contextWindow: 1050000
  },
  {
    id: 'gpt-5.6-luna',
    name: 'GPT-5.6 Luna',
    provider: 'openai',
    costInput: 1.00,
    costOutput: 6.00,
    contextWindow: 1050000
  },
  // ── Anthropic Claude ──────────────────────────────────────────────────────
  {
    id: 'claude-opus-4-5-20251101',
    name: 'Claude Opus 4.5',
    provider: 'anthropic',
    costInput: 5.00,
    costOutput: 25.00,
    contextWindow: 200000
  },
  {
    id: 'claude-sonnet-4-5-20250929',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    costInput: 3.00,
    costOutput: 15.00,
    contextWindow: 200000
  },
  {
    id: 'claude-haiku-4-5-20251001',
    name: 'Claude Haiku 4.5',
    provider: 'anthropic',
    costInput: 1.00,
    costOutput: 5.00,
    contextWindow: 200000
  },
];

export const MOCK_LOADING_MESSAGES = [
  "Analyzing context...",
  "Generating insights...",
  "Calculating vectors...",
  "Optimizing response...",
  "Finalizing output..."
];
