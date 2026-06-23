import React from 'react';
import { BenchmarkResult } from '../types/bench';
import { GlassCard } from './ui/GlassCard';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { CheckCircle, XCircle, Clock, Code, ChevronDown, ChevronUp } from 'lucide-react';

interface BenchResultsProps {
  results: BenchmarkResult[];
  onClear: () => void;
}

export const BenchResults: React.FC<BenchResultsProps> = ({ results, onClear }) => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (results.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <Code size={40} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Results Yet</h3>
        <p className="text-gray-500">Run a benchmark to see how models perform.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Benchmark Results</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={onClear}
            className="flex-1 sm:flex-initial px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/25 text-center font-medium"
          >
            Clear Results
          </button>
        </div>
      </div>

      <AnalyticsDashboard results={results} onClearHistory={onClear} />

      <div className="space-y-4">
        {results.map((result, idx) => {
          const isExpanded = expandedId === `${result.modelId}-${result.scenarioId}-${idx}`;
          const uniqueId = `${result.modelId}-${result.scenarioId}-${idx}`;

          return (
            <GlassCard key={uniqueId} className="overflow-hidden">
              <div 
                className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                onClick={() => toggleExpand(uniqueId)}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${result.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
                  `}>
                    {result.success ? <CheckCircle size={20} /> : <XCircle size={20} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-gray-900 dark:text-white truncate max-w-[180px] sm:max-w-xs md:max-w-none" title={result.modelId}>
                      {result.modelId}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-[180px] sm:max-w-xs md:max-w-none" title={result.scenarioId}>
                      {result.scenarioId}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Clock size={16} />
                    {Math.round(result.latencyMs)}ms
                  </div>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                      <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Raw Response</h4>
                      <pre className="text-sm font-mono bg-white dark:bg-black p-4 rounded border border-gray-200 dark:border-white/10 overflow-x-auto max-h-96 whitespace-pre-wrap">
                        {result.rawResponse}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
