import React, { useState, useMemo } from 'react';
import { BenchmarkResult } from '../types/bench';
import { GlassCard } from './ui/GlassCard';
import { 
  CheckCircle, 
  XCircle, 
  Trophy, 
  ArrowRight, 
  Code,
  Activity,
  FileText,
  DollarSign,
  TrendingUp,
  Network
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface ComparisonViewProps {
  results: BenchmarkResult[];
  onClose: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ results, onClose }) => {
  // Get unique models and scenarios from results
  const availableModels = useMemo(() => Array.from(new Set(results.map(r => r.modelId))), [results]);
  const availableScenarios = useMemo(() => Array.from(new Set(results.map(r => r.scenarioId))), [results]);

  const [leftId, setLeftId] = useState<string>(() => results[0]?.modelId || '');
  const [rightId, setRightId] = useState<string>(() => results[1]?.modelId || results[0]?.modelId || '');
  const [scenarioId, setScenarioId] = useState<string>(() => results[0]?.scenarioId || '');
  const [showGraphs, setShowGraphs] = useState<boolean>(false);

  // Sync state if initial arrays load later or change
  React.useEffect(() => {
    if (!leftId && availableModels.length > 0) {
      setLeftId(availableModels[0]);
    }
    if (!rightId && availableModels.length > 0) {
      setRightId(availableModels[1] || availableModels[0]);
    }
    if (!scenarioId && availableScenarios.length > 0) {
      setScenarioId(availableScenarios[0]);
    }
  }, [availableModels, availableScenarios, leftId, rightId, scenarioId]);

  const leftResult = results.find(r => r.modelId === leftId && r.scenarioId === scenarioId);
  const rightResult = results.find(r => r.modelId === rightId && r.scenarioId === scenarioId);

  // Get historical data for selected scenario & selected models
  const leftHistory = useMemo(() => {
    return results
      .filter(r => r.modelId === leftId && r.scenarioId === scenarioId)
      .sort((a, b) => a.timestamp - b.timestamp); // Chronological order
  }, [results, leftId, scenarioId]);

  const rightHistory = useMemo(() => {
    return results
      .filter(r => r.modelId === rightId && r.scenarioId === scenarioId)
      .sort((a, b) => a.timestamp - b.timestamp); // Chronological order
  }, [results, rightId, scenarioId]);

  // Short names for models to display in charts / cards
  const leftShortName = useMemo(() => leftId.split('/').pop() || leftId || 'Model A', [leftId]);
  const rightShortName = useMemo(() => rightId.split('/').pop() || rightId || 'Model B', [rightId]);

  // Aggregate stats
  const leftStats = useMemo(() => {
    if (leftHistory.length === 0) return null;
    const totalLatency = leftHistory.reduce((sum, r) => sum + r.latencyMs, 0);
    const totalCost = leftHistory.reduce((sum, r) => sum + (r.cost || 0), 0);
    const passed = leftHistory.filter(r => r.success).length;
    return {
      avgLatency: Math.round(totalLatency / leftHistory.length),
      avgCost: totalCost / leftHistory.length,
      successRate: Math.round((passed / leftHistory.length) * 100),
      totalRuns: leftHistory.length,
    };
  }, [leftHistory]);

  const rightStats = useMemo(() => {
    if (rightHistory.length === 0) return null;
    const totalLatency = rightHistory.reduce((sum, r) => sum + r.latencyMs, 0);
    const totalCost = rightHistory.reduce((sum, r) => sum + (r.cost || 0), 0);
    const passed = rightHistory.filter(r => r.success).length;
    return {
      avgLatency: Math.round(totalLatency / rightHistory.length),
      avgCost: totalCost / rightHistory.length,
      successRate: Math.round((passed / rightHistory.length) * 100),
      totalRuns: rightHistory.length,
    };
  }, [rightHistory]);

  // Align history data points for Recharts LineChart
  const chartData = useMemo(() => {
    const maxLen = Math.max(leftHistory.length, rightHistory.length);
    return Array.from({ length: maxLen }, (_, idx) => {
      const leftRun = leftHistory[idx];
      const rightRun = rightHistory[idx];
      return {
        runIndex: idx + 1,
        runName: `Run ${idx + 1}`,
        leftLatency: leftRun ? Math.round(leftRun.latencyMs) : null,
        rightLatency: rightRun ? Math.round(rightRun.latencyMs) : null,
        leftCost: leftRun ? leftRun.cost || 0 : null,
        rightCost: rightRun ? rightRun.cost || 0 : null,
        leftDate: leftRun ? new Date(leftRun.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        rightDate: rightRun ? new Date(rightRun.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      };
    });
  }, [leftHistory, rightHistory]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="text-yellow-500 shrink-0" />
          <span>Head-to-Head Comparison</span>
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          {(leftHistory.length > 0 || rightHistory.length > 0) && (
            <button 
              onClick={() => setShowGraphs(!showGraphs)}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs sm:text-sm bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-colors flex items-center justify-center gap-1.5 font-semibold"
            >
              {showGraphs ? <FileText size={15} /> : <Activity size={15} />}
              <span>
                <span className="hidden xs:inline">{showGraphs ? 'View Detailed Comparison' : 'View Graph Comparison'}</span>
                <span className="inline xs:hidden">{showGraphs ? 'View Details' : 'View Graphs'}</span>
              </span>
            </button>
          )}
          <button 
            onClick={onClose}
            className="flex-1 sm:flex-initial px-3 py-2 text-xs sm:text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors border border-gray-200 dark:border-white/10 text-center font-medium"
          >
            <span className="hidden xs:inline">Back to Dashboard</span>
            <span className="inline xs:hidden">Back</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <GlassCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Model A</label>
            <select 
              value={leftId}
              onChange={(e) => setLeftId(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 outline-none"
            >
              {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          
          <div className="text-center">
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Scenario</label>
            <select 
              value={scenarioId}
              onChange={(e) => setScenarioId(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 outline-none text-center font-bold"
            >
              {availableScenarios.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Model B</label>
            <select 
              value={rightId}
              onChange={(e) => setRightId(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 outline-none md:text-right"
            >
              {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Comparison Area */}
      {showGraphs ? (
        <div className="space-y-6">
          {/* Summary Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Average Latency Card */}
            <GlassCard className="p-5 flex flex-col justify-between">
              <div>
                <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Network size={14} className="text-blue-500" />
                  Avg Latency
                </div>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-1">
                    <span className="text-xs text-gray-500 truncate max-w-[140px]" title={leftId}>{leftShortName}</span>
                    <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                      {leftStats ? `${leftStats.avgLatency}ms` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-xs text-gray-500 truncate max-w-[140px]" title={rightId}>{rightShortName}</span>
                    <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                      {rightStats ? `${rightStats.avgLatency}ms` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              {leftStats && rightStats && (
                <div className="mt-4 text-xs border-t border-gray-100 dark:border-white/5 pt-2 text-gray-500">
                  {leftStats.avgLatency < rightStats.avgLatency ? (
                    <span className="text-green-500 font-semibold">{leftShortName} is {Math.round(((rightStats.avgLatency - leftStats.avgLatency) / rightStats.avgLatency) * 100)}% faster</span>
                  ) : leftStats.avgLatency > rightStats.avgLatency ? (
                    <span className="text-green-500 font-semibold">{rightShortName} is {Math.round(((leftStats.avgLatency - rightStats.avgLatency) / leftStats.avgLatency) * 100)}% faster</span>
                  ) : (
                    <span>Both have identical latencies</span>
                  )}
                </div>
              )}
            </GlassCard>

            {/* Success Rate Card */}
            <GlassCard className="p-5 flex flex-col justify-between">
              <div>
                <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-green-500" />
                  Success Rate
                </div>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-1">
                    <span className="text-xs text-gray-500 truncate max-w-[140px]" title={leftId}>{leftShortName}</span>
                    <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                      {leftStats ? `${leftStats.successRate}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-xs text-gray-500 truncate max-w-[140px]" title={rightId}>{rightShortName}</span>
                    <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                      {rightStats ? `${rightStats.successRate}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              {leftStats && rightStats && (
                <div className="mt-4 text-xs border-t border-gray-100 dark:border-white/5 pt-2 text-gray-500 font-semibold">
                  {leftStats.successRate > rightStats.successRate ? (
                    <span className="text-green-500">{leftShortName} is more reliable</span>
                  ) : leftStats.successRate < rightStats.successRate ? (
                    <span className="text-green-500">{rightShortName} is more reliable</span>
                  ) : (
                    <span className="text-gray-500">Equal reliability ({leftStats.successRate}%)</span>
                  )}
                </div>
              )}
            </GlassCard>

            {/* Average Cost Card */}
            <GlassCard className="p-5 flex flex-col justify-between">
              <div>
                <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <DollarSign size={14} className="text-yellow-500" />
                  Avg Cost / Run
                </div>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-1">
                    <span className="text-xs text-gray-500 truncate max-w-[140px]" title={leftId}>{leftShortName}</span>
                    <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                      {leftStats ? `$${leftStats.avgCost.toFixed(5)}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-xs text-gray-500 truncate max-w-[140px]" title={rightId}>{rightShortName}</span>
                    <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                      {rightStats ? `$${rightStats.avgCost.toFixed(5)}` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              {leftStats && rightStats && (
                <div className="mt-4 text-xs border-t border-gray-100 dark:border-white/5 pt-2 text-gray-500">
                  {leftStats.avgCost < rightStats.avgCost ? (
                    <span className="text-green-500 font-semibold">{leftShortName} is more cost-effective</span>
                  ) : leftStats.avgCost > rightStats.avgCost ? (
                    <span className="text-green-500 font-semibold">{rightShortName} is more cost-effective</span>
                  ) : (
                    <span>Equal cost per run</span>
                  )}
                </div>
              )}
            </GlassCard>

            {/* Total Runs Card */}
            <GlassCard className="p-5 flex flex-col justify-between">
              <div>
                <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-purple-500" />
                  Runs Analyzed
                </div>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-1">
                    <span className="text-xs text-gray-500 truncate max-w-[140px]" title={leftId}>{leftShortName}</span>
                    <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                      {leftStats ? `${leftStats.totalRuns}` : '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-xs text-gray-500 truncate max-w-[140px]" title={rightId}>{rightShortName}</span>
                    <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                      {rightStats ? `${rightStats.totalRuns}` : '0'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-xs border-t border-gray-100 dark:border-white/5 pt-2 text-gray-500 font-medium">
                Comparing all historical executions
              </div>
            </GlassCard>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Latency Trend Chart */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Network className="text-blue-500" size={18} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Latency Trend</h3>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="runName" stroke="#888888" fontSize={11} />
                    <YAxis stroke="#888888" fontSize={11} unit="ms" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#15181f', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px' }}
                      labelClassName="font-bold text-xs text-gray-400"
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Line 
                      name={leftShortName} 
                      type="monotone" 
                      dataKey="leftLatency" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      activeDot={{ r: 8 }}
                      connectNulls 
                    />
                    <Line 
                      name={rightShortName} 
                      type="monotone" 
                      dataKey="rightLatency" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      activeDot={{ r: 8 }}
                      connectNulls 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Cost Comparison Chart */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <DollarSign className="text-yellow-500" size={18} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cost per Run ($)</h3>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="runName" stroke="#888888" fontSize={11} />
                    <YAxis stroke="#888888" fontSize={11} tickFormatter={(v) => `$${v.toFixed(4)}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#15181f', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px' }}
                      labelClassName="font-bold text-xs text-gray-400"
                      formatter={(value: any) => [`$${value.toFixed(5)}`, 'Cost']}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Line 
                      name={leftShortName} 
                      type="monotone" 
                      dataKey="leftCost" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      activeDot={{ r: 8 }}
                      connectNulls 
                    />
                    <Line 
                      name={rightShortName} 
                      type="monotone" 
                      dataKey="rightCost" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      activeDot={{ r: 8 }}
                      connectNulls 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        </div>
      ) : (
        /* Comparison Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Side */}
          <ResultColumn result={leftResult} />
          
          {/* Right Side */}
          <ResultColumn result={rightResult} />
        </div>
      )}
    </div>
  );
};

const ResultColumn: React.FC<{ result?: BenchmarkResult }> = ({ result }) => {
  if (!result) {
    return (
      <GlassCard className="p-8 flex items-center justify-center min-h-[400px] border-dashed">
        <div className="text-center text-gray-400">
          <div className="mb-2">No Data Available</div>
          <div className="text-xs">Run this scenario for this model to see results</div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{result.modelId}</h3>
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold uppercase ${result.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {result.success ? <CheckCircle size={12} /> : <XCircle size={12} />}
            {result.success ? 'Passed' : 'Failed'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
            {Math.round(result.latencyMs)}<span className="text-sm text-gray-500 ml-1">ms</span>
          </div>
          <div className="text-xs text-gray-500">Latency</div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-xs font-bold uppercase text-gray-500 mb-3">Raw Response</h4>
          <div className="bg-gray-900 text-gray-300 p-4 rounded-lg text-xs font-mono overflow-x-auto max-h-96 whitespace-pre-wrap">
            {result.rawResponse}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
