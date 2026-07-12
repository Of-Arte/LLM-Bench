import { Model } from './types';

export const MODELS: Model[] = [
  {
    id: 'gemini-3.1-flash',
    name: 'Gemini 3.1 Flash',
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
    costInput: 2.00,
    costOutput: 12.00,
    contextWindow: 1048576,
    isGeminiNative: true
  },
  {
    id: 'openai/gpt-5.5',
    name: 'ChatGPT 5.5',
    provider: 'openai',
    costInput: 2.00,
    costOutput: 8.00,
    contextWindow: 1050000
  },
  {
    id: 'anthropic/claude-4.6-sonnet',
    name: 'Claude 4.6 Sonnet',
    provider: 'anthropic',
    costInput: 3.00,
    costOutput: 15.00,
    contextWindow: 200000
  },
  {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    costInput: 15.00,
    costOutput: 75.00,
    contextWindow: 200000
  }
];

export const MOCK_LOADING_MESSAGES = [
  "Analyzing context...",
  "Generating insights...",
  "Calculating vectors...",
  "Optimizing response...",
  "Finalizing output..."
];
