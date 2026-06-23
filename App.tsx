import React, { useState, useEffect } from 'react';
import { MODELS } from './constants';
import { AppSettings } from './types';
import { BenchmarkResult, TestScenario } from './src/types/bench';
import { SCENARIOS } from './src/engine/data';
import { runBenchmark } from './src/services/benchService';
import { BenchDashboard } from './src/components/BenchDashboard';
import { BenchResults } from './src/components/BenchResults';
import { ComparisonView } from './src/components/ComparisonView';
import { ScenarioBuilder } from './src/components/ScenarioBuilder';
import { ModelManagerModal } from './src/components/ModelManagerModal';
import { LayoutGrid, BarChart2, Sun, Moon, GitCompare, Menu, X, ChevronLeft, ChevronRight, Github } from 'lucide-react';
import { Model } from './types';



const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'results' | 'compare' | 'settings' | 'builder'>('dashboard');
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [customScenarios, setCustomScenarios] = useState<TestScenario[]>([]);
  const [editingScenario, setEditingScenario] = useState<TestScenario | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    favoriteModels: [],
    blindMode: false
  });
  const [hydrated, setHydrated] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Bench state
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isModelManagerOpen, setIsModelManagerOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const activeModels = React.useMemo(() => {
    const combined = [...MODELS, ...(settings.customModels || [])];
    if (settings.enabledModelIds && settings.enabledModelIds.length > 0) {
      return combined.filter(m => settings.enabledModelIds!.includes(m.id));
    }
    return combined;
  }, [settings.enabledModelIds, settings.customModels]);

  // Load state
  useEffect(() => {
    const savedSettings = localStorage.getItem('openclaw_settings');
    const savedResults = localStorage.getItem('openclaw_results');
    const savedScenarios = localStorage.getItem('openclaw_scenarios');
    const scenariosVersion = localStorage.getItem('openclaw_scenarios_version');

    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedResults) setResults(JSON.parse(savedResults));

    if (savedScenarios && scenariosVersion === '2') {
      setCustomScenarios(JSON.parse(savedScenarios));
    } else {
      let initial: TestScenario[] = [...SCENARIOS];
      if (savedScenarios) {
        try {
          const parsed = JSON.parse(savedScenarios) as TestScenario[];
          const customOnly = parsed.filter(s => !SCENARIOS.some(def => def.id === s.id));
          initial = [...SCENARIOS, ...customOnly];
        } catch (e) {
          // ignore parsing errors
        }
      }
      setCustomScenarios(initial);
      localStorage.setItem('openclaw_scenarios', JSON.stringify(initial));
      localStorage.setItem('openclaw_scenarios_version', '2');
    }
    if (window.innerWidth < 768) {
      setIsDrawerOpen(false);
    }
    setHydrated(true);
  }, []);

  // Save state
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('openclaw_settings', JSON.stringify(settings));
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('openclaw_results', JSON.stringify(results));
    }
  }, [results, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('openclaw_scenarios', JSON.stringify(customScenarios));
    }
  }, [customScenarios, hydrated]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleToggleModel = (id: string) => {
    setSelectedModels(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleRemoveModelFromSuite = (id: string) => {
    const allModels = [...MODELS, ...(settings.customModels || [])];
    const currentEnabled = settings.enabledModelIds || allModels.map(m => m.id);
    const nextEnabled = currentEnabled.filter(x => x !== id);
    updateSettings({ enabledModelIds: nextEnabled });
    setSelectedModels(prev => prev.filter(m => m !== id));
  };

  const handleToggleModelEnable = (id: string) => {
    const allModels = [...MODELS, ...(settings.customModels || [])];
    const currentEnabled = settings.enabledModelIds || allModels.map(m => m.id);
    const nextEnabled = currentEnabled.includes(id)
      ? currentEnabled.filter(x => x !== id)
      : [...currentEnabled, id];
    updateSettings({ enabledModelIds: nextEnabled });
  };

  const handleAddCustomModel = (model: Model) => {
    const nextCustom = [...(settings.customModels || []), model];
    const currentEnabled = settings.enabledModelIds || MODELS.map(m => m.id);
    const nextEnabled = [...currentEnabled, model.id];
    updateSettings({
      customModels: nextCustom,
      enabledModelIds: nextEnabled
    });
  };

  const handleDeleteCustomModel = (id: string) => {
    const nextCustom = (settings.customModels || []).filter(m => m.id !== id);
    const currentEnabled = settings.enabledModelIds || [...MODELS, ...(settings.customModels || [])].map(m => m.id);
    const nextEnabled = currentEnabled.filter(x => x !== id);
    updateSettings({
      customModels: nextCustom,
      enabledModelIds: nextEnabled
    });
    setSelectedModels(prev => prev.filter(m => m !== id));
  };

  const handleSaveScenario = (scenario: TestScenario) => {
    setCustomScenarios(prev => {
      const exists = prev.some(s => s.id === scenario.id);
      if (exists) {
        return prev.map(s => s.id === scenario.id ? scenario : s);
      } else {
        return [...prev, scenario];
      }
    });
    setEditingScenario(null);
    setView('dashboard');
  };

  const handleEditScenario = (scenario: TestScenario) => {
    setEditingScenario(scenario);
    setView('builder');
  };

  const handleDeleteScenario = (id: string) => {
    setCustomScenarios(prev => prev.filter(s => s.id !== id));
  };

  const runTests = async (scenarioIds: string[]) => {
    setIsRunning(true);
    setProgress(0);
    setView('results');

    const totalTests = selectedModels.length * scenarioIds.length;
    let completed = 0;

    const allScenarios = customScenarios;

    for (const modelId of selectedModels) {
      const model = activeModels.find(m => m.id === modelId);
      if (!model) continue;

      for (const scenarioId of scenarioIds) {
        const scenario = allScenarios.find(s => s.id === scenarioId);
        if (!scenario) continue;

        // Run benchmark
        const result = await runBenchmark(model, scenario);

        if (result.apiFailed) {
          setNotification({
            message: `API failure for ${model.name} (${scenario.name}): ${result.rawResponse.replace('Error: ', '')}.`,
            type: 'error'
          });
        }

        setResults(prev => {
          const newResults = [result, ...prev];
          // Keep only the last 1000 results to manage storage
          return newResults.slice(0, 1000);
        });

        completed++;
        setProgress((completed / totalTests) * 100);
      }
    }

    setIsRunning(false);
  };

  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1115] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-500 flex overflow-x-hidden">
      {/* Sidebar Spacer for Content Shift (Hidden on mobile to avoid layout compression) */}
      <div className={`transition-all duration-300 ease-in-out shrink-0 hidden md:block ${isDrawerOpen ? 'w-60' : 'w-0'}`} />

      {/* Mobile Sidebar Backdrop Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 animate-fade-in" 
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 bg-white dark:bg-[#111317] border-r border-gray-200/80 dark:border-white/10 flex flex-col transition-all duration-300 ease-in-out ${
        isDrawerOpen ? 'w-60' : 'w-0 border-r-0'
      }`}>
        {/* Toggle Button sits on the center-right border (Hidden on mobile) */}
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#15181f] text-gray-500 hover:text-gray-800 dark:hover:text-white items-center justify-center cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all z-50 hidden md:flex ${
            isDrawerOpen ? 'left-full -translate-x-1/2' : 'left-3 translate-x-0'
          }`}
          title={isDrawerOpen ? 'Collapse Navigation' : 'Expand Navigation'}
        >
          {isDrawerOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Sidebar Content (Translates out and fades to prevent overflow & squashing) */}
        <div className={`w-60 h-full flex flex-col overflow-hidden transition-all duration-300 ${
          isDrawerOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'
        }`}>
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">LLM Bench</span>
          </div>

          {/* Drawer Links */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
            <button
              onClick={() => { setView('dashboard'); if (window.innerWidth < 768) setIsDrawerOpen(false); }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-medium text-sm text-left ${
                view === 'dashboard'
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <LayoutGrid size={18} />
              <span>Benchmark Suite</span>
            </button>

            <button
              onClick={() => { setView('results'); if (window.innerWidth < 768) setIsDrawerOpen(false); }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-medium text-sm text-left ${
                view === 'results'
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <BarChart2 size={18} />
              <span>Benchmark History</span>
            </button>

            <button
              onClick={() => { setView('compare'); if (window.innerWidth < 768) setIsDrawerOpen(false); }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-medium text-sm text-left ${
                view === 'compare'
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <GitCompare size={18} />
              <span>Compare Models</span>
            </button>

            <div className="pt-4 border-t border-gray-200 dark:border-white/10 my-4" />

            <button
              onClick={() => { setIsModelManagerOpen(true); if (window.innerWidth < 768) setIsDrawerOpen(false); }}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-medium text-sm text-left text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className="text-lg">⚙️</span>
              <span>Customize Models</span>
            </button>

            <a
              href="https://github.com/Of-Arte/LLM-Bench"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-medium text-sm text-left text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Github size={18} />
              <span>GitHub Repository</span>
            </a>
          </nav>

          {/* Drawer Footer with Theme Toggle */}
          <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-black/20 space-y-2">
            <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Appearance</span>
            <button
              onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-slate-700/80 text-xs font-semibold text-gray-700 dark:text-gray-300"
            >
              {settings.theme === 'dark' ? (
                <>
                  <Sun size={14} className="text-yellow-500" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon size={14} className="text-blue-500" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-30 backdrop-blur-lg bg-white/10 dark:bg-[#0f1115]/40 border-b border-gray-200/50 dark:border-white/10 px-6 py-3 flex justify-between items-center">
          <div className="flex items-center cursor-pointer" onClick={() => setView('dashboard')}>
            <span className="text-xl font-bold tracking-tight">LLM Bench</span>
          </div>

          <div className="flex items-center gap-3">
            {isRunning && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                <span>Running Test ({Math.round(progress)}%)</span>
              </div>
            )}
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className={`p-3 rounded-xl transition-all duration-300 ${
                isDrawerOpen ? 'bg-white/10 text-emerald-500' : 'hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'
              }`}
              title="Toggle Menu"
            >
              <LayoutGrid size={20} />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow p-4 md:p-5 lg:py-5 lg:px-6 max-w-7xl mx-auto w-full">
          {view === 'dashboard' && (
            <BenchDashboard
              models={activeModels}
              selectedModels={selectedModels}
              customScenarios={customScenarios}
              onToggleModel={handleToggleModel}
              onRemoveModel={handleRemoveModelFromSuite}
              onRun={runTests}
              onCreateScenario={() => { setEditingScenario(null); setView('builder'); }}
              onDeleteScenario={handleDeleteScenario}
              onEditScenario={handleEditScenario}
              onOpenModelManager={() => setIsModelManagerOpen(true)}
              isRunning={isRunning}
              progress={progress}
            />
          )}
          {view === 'results' && (
            <BenchResults
              results={results}
              onClear={() => setResults([])}
            />
          )}
          {view === 'compare' && (
            <ComparisonView
              results={results}
              onClose={() => setView('dashboard')}
            />
          )}
          {view === 'builder' && (
            <ScenarioBuilder
              initialScenario={editingScenario || undefined}
              onSave={handleSaveScenario}
              onCancel={() => { setEditingScenario(null); setView('dashboard'); }}
            />
          )}
        </main>

        {/* Subtle Notification Toast */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 max-w-md bg-white dark:bg-[#15181e] border-l-4 border-red-500 rounded-lg p-4 shadow-2xl flex items-start gap-3 animate-fade-in text-gray-900 dark:text-gray-100">
            <div className="flex-1 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-500">Benchmark Connection Error</h4>
              <p className="text-xs text-gray-500 dark:text-gray-300 mt-1 leading-relaxed">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Model Customizer Modal */}
        <ModelManagerModal
          isOpen={isModelManagerOpen}
          onClose={() => setIsModelManagerOpen(false)}
          defaultModels={MODELS}
          customModels={settings.customModels || []}
          enabledModelIds={settings.enabledModelIds || []}
          onToggleModelEnable={handleToggleModelEnable}
          onAddCustomModel={handleAddCustomModel}
          onDeleteCustomModel={handleDeleteCustomModel}
        />
      </div>
    </div>
  );
};

export default App;
