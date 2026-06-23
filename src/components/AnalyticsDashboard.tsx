import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { BenchmarkResult } from '../types/bench';
import { GlassCard } from './ui/GlassCard';
import { Clock, CheckCircle, DollarSign, TrendingUp, Trash2 } from 'lucide-react';

interface AnalyticsDashboardProps {
  results: BenchmarkResult[];
  onClearHistory?: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ results, onClearHistory }) => {
  const stats = useMemo(() => {
    const modelStats: Record<string, { 
      totalLatency: number; 
      totalCost: number;
      count: number; 
      successCount: number;
      failures: number;
    }> = {};

    results.forEach(r => {
      if (!modelStats[r.modelId]) {
        modelStats[r.modelId] = { totalLatency: 0, totalCost: 0, count: 0, successCount: 0, failures: 0 };
      }
      modelStats[r.modelId].totalLatency += r.latencyMs;
      modelStats[r.modelId].totalCost += r.cost || 0;
      modelStats[r.modelId].count += 1;
      if (r.success) {
        modelStats[r.modelId].successCount += 1;
      } else {
        modelStats[r.modelId].failures += 1;
      }
    });

    return Object.entries(modelStats).map(([modelId, data]) => ({
      name: modelId.split('/').pop() || modelId, // Shorten name
      avgLatency: Math.round(data.totalLatency / data.count),
      successRate: Math.round((data.successCount / data.count) * 100),
      costPer1k: (data.totalCost / data.count) * 1000, // Cost per 1000 runs
      total: data.count
    }));
  }, [results]);

  const trendData = useMemo(() => {
    // Group by timestamp (bucketed by minute or just sequence)
    // For simplicity, let's just take the last 20 runs
    return results
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-20)
      .map((r, i) => ({
        id: i + 1,
        model: r.modelId.split('/').pop() || r.modelId,
        latency: Math.round(r.latencyMs),
        success: r.success ? 1 : 0
      }));
  }, [results]);

  if (results.length === 0) return null;

  return (
    <div className="space-y-6 mb-8 animate-fade-in">
      <div className="flex justify-end">
        {onClearHistory && (
          <button 
            onClick={onClearHistory}
            className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors"
          >
            <Trash2 size={12} />
            Clear All History
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Chart */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-blue-500" size={20} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Average Latency (ms)</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={stats} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" horizontal={false} />
                <XAxis type="number" stroke="#888888" fontSize={12} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#888888" 
                  fontSize={11} 
                  width={80}
                  tickFormatter={(val) => val.length > 12 ? val.substring(0, 12) + '...' : val}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                  cursor={{ fill: '#ffffff10' }}
                />
                <Bar dataKey="avgLatency" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.avgLatency > 2000 ? '#ef4444' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Success Rate Chart */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="text-green-500" size={20} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Success Rate (%)</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={stats} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#888888" fontSize={12} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#888888" 
                  fontSize={11} 
                  width={80}
                  tickFormatter={(val) => val.length > 12 ? val.substring(0, 12) + '...' : val}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                  cursor={{ fill: '#ffffff10' }}
                />
                <Bar dataKey="successRate" fill="#10b981" radius={[0, 4, 4, 0]}>
                   {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.successRate < 100 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Chart */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="text-yellow-500" size={20} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Est. Cost per 1k Runs ($)</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={stats} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" horizontal={false} />
                <XAxis type="number" stroke="#888888" fontSize={12} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#888888" 
                  fontSize={11} 
                  width={80}
                  tickFormatter={(val) => val.length > 12 ? val.substring(0, 12) + '...' : val}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                  cursor={{ fill: '#ffffff10' }}
                  formatter={(value: number) => [`$${value.toFixed(4)}`, 'Cost/1k']}
                />
                <Bar dataKey="costPer1k" fill="#eab308" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Latency Trend */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-purple-500" size={20} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Latency Trend (Last 20 Runs)</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={trendData} margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="id" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="latency" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
