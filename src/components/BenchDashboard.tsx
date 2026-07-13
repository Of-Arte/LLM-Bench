import React, { useState, useRef, useEffect } from 'react';
import { Model } from '../types';
import { TestScenario } from '../types/bench';
import { GlassCard } from './ui/GlassCard';
import { Play, CheckCircle, XCircle, Lock, EyeOff, Plus, Trash2, Pencil, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { isModelConnected, getModelStatus } from '../services/benchService';

const CollapsiblePrompt: React.FC<{ prompt: string }> = ({ prompt }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkTruncation = () => {
      const el = textRef.current;
      if (el) {
        if (!isExpanded) {
          setIsTruncated(el.scrollHeight > el.clientHeight);
        }
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [prompt, isExpanded]);

  return (
    <div 
      onClick={(e) => {
        if (isTruncated || isExpanded) {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }
      }}
      className={`text-xs font-mono bg-black/5 dark:bg-white/5 p-2 rounded text-gray-600 dark:text-gray-400 transition-colors ${
        (isTruncated || isExpanded) ? 'cursor-pointer hover:bg-black/10 dark:hover:bg-white/10' : ''
      }`}
    >
      <div 
        ref={textRef}
        className={isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-2'}
      >
        {prompt}
      </div>
      {(isTruncated || isExpanded) && (
        <div className="mt-1 text-[10px] text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-sans font-medium text-right select-none">
          {isExpanded ? 'Show less' : 'Show more'}
        </div>
      )}
    </div>
  );
};

interface BenchDashboardProps {
  models: Model[];
  selectedModels: string[];
  customScenarios?: TestScenario[];
  onToggleModel: (id: string) => void;
  onRemoveModel: (id: string) => void;
  onRun: (scenarioIds: string[]) => void;
  onCreateScenario?: () => void;
  onDeleteScenario?: (id: string) => void;
  onEditScenario?: (scenario: TestScenario) => void;
  onOpenModelManager?: () => void;
  isRunning: boolean;
  progress: number;
}

export const BenchDashboard: React.FC<BenchDashboardProps> = ({
  models,
  selectedModels,
  customScenarios = [],
  onToggleModel,
  onRemoveModel,
  onRun,
  onCreateScenario,
  onDeleteScenario,
  onEditScenario,
  onOpenModelManager,
  isRunning,
  progress
}) => {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleScenario = (id: string) => {
    setSelectedScenario(prev => prev === id ? null : id);
  };

  const handleRun = () => {
    if (selectedModels.length === 0 || !selectedScenario) return;
    onRun([selectedScenario]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredModels = models.filter(m =>
    m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
    m.provider.toLowerCase().includes(modelSearch.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in pb-2">
      {/* Title Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Benchmark Suite
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Compare prompt execution and output quality by running test scenarios against different language models.
        </p>
      </div>

      {/* Sleek Model Selector Dropdown & Run Card */}
      <GlassCard className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 z-20 relative">
        <div className="flex-1 relative" ref={dropdownRef}>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
            Select Models to Test
          </label>
          <button
            type="button"
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/30 border border-gray-200 dark:border-white/10 transition-all font-medium text-xs text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="font-semibold text-gray-900 dark:text-white truncate">
                {selectedModels.length === 0
                  ? 'Choose models...'
                  : `${selectedModels.length} Model${selectedModels.length > 1 ? 's' : ''} Selected`}
              </span>
            </div>
            
            <div className="flex items-center gap-2 shrink-0 ml-auto">
              {/* Previews of active model connection states */}
              <div className="flex items-center gap-1">
                {selectedModels.slice(0, 5).map(id => {
                  const m = models.find(x => x.id === id);
                  if (!m) return null;
                  const status = getModelStatus(m);
                  return (
                    <span
                      key={id}
                      className={`w-1.5 h-1.5 rounded-full ring-1 ring-white/10 ${
                        status === 'connected'
                          ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                          : 'bg-red-500 shadow-sm shadow-red-500/50'
                      }`}
                      title={`${m.name} (${status})`}
                    />
                  );
                })}
                {selectedModels.length > 5 && (
                  <span className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold font-mono">
                    +{selectedModels.length - 5}
                  </span>
                )}
              </div>
              {isModelDropdownOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </button>

          {/* Sleek Custom Dropdown Menu */}
          {isModelDropdownOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-white/95 dark:bg-[#13161c]/95 backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-2xl shadow-2xl z-50 p-2.5 flex flex-col gap-2 max-h-[300px] animate-fade-in-up">
              {/* Search input */}
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search models..."
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Models List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-0.5 pr-1 py-0.5">
                {filteredModels.length === 0 ? (
                  <div className="text-center py-4 text-xs text-gray-400 dark:text-gray-500">
                    No models found
                  </div>
                ) : (
                  filteredModels.map(model => {
                    const isSelected = selectedModels.includes(model.id);
                    const status = getModelStatus(model);
                    return (
                      <div
                        key={model.id}
                        onClick={() => onToggleModel(model.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5 select-none ${
                          isSelected ? 'bg-blue-500/5 dark:bg-blue-500/10' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="rounded border-gray-300 dark:border-white/10 text-blue-600 focus:ring-blue-500 shrink-0"
                        />
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          status === 'connected'
                            ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                            : 'bg-red-500 shadow-sm shadow-red-500/50'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-gray-900 dark:text-white truncate">
                              {model.name}
                            </span>
                            <span className="text-[8px] text-gray-400 dark:text-gray-500 capitalize font-medium">
                              {model.provider}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveModel(model.id);
                          }}
                          className="p-1 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-black/5 dark:hover:bg-white/5"
                          title="Hide from suite"
                        >
                          <EyeOff size={12} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Customize option at the bottom */}
              {onOpenModelManager && (
                <div className="pt-1.5 border-t border-gray-200 dark:border-white/5 mt-0.5 flex justify-between items-center px-1">
                  <span className="text-[8px] text-gray-400 dark:text-gray-500">Configure providers</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModelDropdownOpen(false);
                      onOpenModelManager();
                    }}
                    className="text-[11px] font-bold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                  >
                    <Plus size={10} /> Customize Suite
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Run action button */}
        <div className="flex items-end justify-stretch sm:justify-end sm:pt-4">
          <button
            onClick={handleRun}
            disabled={isRunning || selectedModels.length === 0 || !selectedScenario}
            className={`
              w-full sm:w-auto px-6 py-2 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all text-xs h-[38px]
              ${isRunning || selectedModels.length === 0 || !selectedScenario
                ? 'bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed border border-transparent dark:border-white/5 shadow-none'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 transform hover:scale-[1.02] active:scale-[0.98]'}
            `}
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                <span>Running ({Math.round(progress)}%)</span>
              </>
            ) : (
              <>
                <Play size={12} fill="currentColor" className="opacity-90" />
                <span>Run Benchmark</span>
              </>
            )}
          </button>
        </div>
      </GlassCard>

      {/* Scenario Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Benchmark Scenarios
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Select one scenario to run against your selected models.
            </p>
          </div>
          {onCreateScenario && (
            <button
              onClick={onCreateScenario}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-[10px] font-semibold transition-all border border-transparent dark:border-white/5"
            >
              <Plus size={12} /> Custom Scenario
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customScenarios.map(scenario => {
            const isSelected = selectedScenario === scenario.id;
            return (
              <GlassCard
                key={scenario.id}
                className={`
                  p-4 cursor-pointer transition-all border-2 relative overflow-hidden group/card
                  ${isSelected
                    ? 'border-emerald-500/80 bg-emerald-500/[0.03] shadow-md shadow-emerald-500/5'
                    : 'border-transparent hover:border-gray-200 dark:hover:border-white/10 hover:bg-white/90 dark:hover:bg-[#13161c]/95'}
                `}
                onClick={() => toggleScenario(scenario.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`
                    text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider
                    ${scenario.difficulty === 'basic' ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400' :
                      scenario.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400' :
                      scenario.difficulty === 'advanced' ? 'bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-400' :
                      'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400'}
                  `}>
                    {scenario.difficulty}
                  </span>
                  
                  <div className="flex items-center gap-1 shrink-0">
                    {onEditScenario && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditScenario(scenario);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all opacity-0 group-hover/card:opacity-100"
                        title="Edit Scenario"
                      >
                        <Pencil size={12} />
                      </button>
                    )}
                    {onDeleteScenario && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteScenario(scenario.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all opacity-0 group-hover/card:opacity-100"
                        title="Delete Scenario"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                    {isSelected && (
                      <CheckCircle size={16} className="text-emerald-500 animate-fade-in" />
                    )}
                  </div>
                </div>

                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{scenario.name}</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">{scenario.description}</p>
                <CollapsiblePrompt prompt={scenario.prompt} />
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};
