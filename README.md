# LLM Bench

LLM Bench is a client-side React benchmarking playground designed to evaluate, validate, and compare LLM prompt execution, latency, cost, and capability in real time across multiple providers and models. The application interfaces directly with API endpoints (OpenAI, Anthropic, Google Gemini, OpenRouter, and Local API instances) to track response accuracy and execution speed.

---

## Features

- **Parallel Benchmarking**: Run prompt execution tests across multiple models simultaneously, measuring latency in milliseconds and validating output content based on expected criteria.
- **Unified Scenario Builder**: Create, edit, and delete custom test scenarios. Each scenario defines a system instruction, user prompt, and specific substring validation checks to measure output correctness.
- **Searchable Model Selection**: Select and manage active models from a searchable dropdown selector. Live connection states are displayed for each model.
- **Model Status Detection**:
  - **Connected**: API keys are detected in the environment.
  - **Demo**: Fallback mode for live deployments where a pre-configured Gemini key is used.
  - **Offline**: Missing environment credentials.
- **Head-to-Head Comparison**: Compare two model responses side-by-side, or toggle to the historical run dashboard to view latency trendlines and cost-per-run comparisons generated via Recharts.
- **Custom Model Manager**: Register custom models under supported providers (OpenAI, Anthropic, Google, OpenRouter, Local) by specifying the provider API type, Model ID, and a display name.
- **Responsive Drawer Navigation**: Toggleable side panel containing navigation routes (Benchmark Suite, Benchmark History, Compare Models), model customization launcher, and an appearance theme toggle (Light / Dark mode).
- **Direct Client-side Execution**: Queries are executed directly from the browser using the official `@google/genai` SDK or native `fetch` requests. No intermediate server or backend database is used.

---

## Architecture and Tech Stack

- **Core**: React 19 (TypeScript), Vite 6
- **Styling**: Tailwind CSS (loaded and configured client-side)
- **Charts & Visualization**: Recharts (used for rendering comparative latency trendlines and cost metrics)
- **Integrations**:
  - `@google/genai` (native Gemini SDK integrations)
  - Native `fetch` integrations for Anthropic (`/v1/messages`) and OpenAI-compatible endpoints (`/v1/chat/completions`)
  - Lucide React for UI iconography

---

## Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (version 18 or higher is recommended).

### 2. Installation
Clone the repository and install project dependencies:
```bash
git clone https://github.com/yourusername/LLM-Bench.git
cd LLM-Bench
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

Define the API keys for the providers you want to test:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
LOCAL_ENDPOINT=http://localhost:11434/v1
```

#### How Environment Variables are Exposed
To keep API credentials secure and clean, keys must be set in the host environment. By default, Vite only exposes variables prefixed with `VITE_` to client-side code. This project customizes the Vite configuration in `vite.config.ts` using the `envPrefix` array:
```typescript
envPrefix: ['VITE_', 'GEMINI_', 'OPENAI_', 'ANTHROPIC_', 'OPENROUTER_', 'LOCAL_']
```
This configuration allows the application to read standard API key environment variables via `import.meta.env`.

### 4. Running Locally
Start the local development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000` (or the port specified by the dev server).

---

## Deployment

The application is fully static and can be deployed to Vercel, Netlify, or any static hosting platform.

### Vercel Deployment

1. Import the repository into your Vercel Dashboard.
2. The framework preset will automatically be detected as **Vite**.
3. Set the **Build Command** to: `npm run build`
4. Set the **Output Directory** to: `dist`
5. Configure fallback keys (e.g., `GEMINI_API_KEY`) in the Vercel Environment Variables tab to enable public demo functionality if desired.

### Routing Configuration
The project contains a `vercel.json` file to manage clean client-side routing rewrites and cache headers for assets:
```json
{
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
