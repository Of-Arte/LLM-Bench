import React, { useState } from 'react';
import { Model } from '../../types';
import { GlassModal } from './ui/GlassModal';
import { Trash2, Plus, AlertCircle } from 'lucide-react';
import { getModelStatus } from '../services/benchService';

interface ModelManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultModels: Model[];
  customModels: Model[];
  enabledModelIds: string[];
  onToggleModelEnable: (id: string) => void;
  onAddCustomModel: (model: Model) => void;
  onDeleteCustomModel: (id: string) => void;
}


export const ModelManagerModal: React.FC<ModelManagerModalProps> = ({
  isOpen,
  onClose,
  defaultModels,
  customModels,
  enabledModelIds,
  onToggleModelEnable,
  onAddCustomModel,
  onDeleteCustomModel
}) => {
  const [modelId, setModelId] = useState('');
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('openrouter');
  const [error, setError] = useState('');



  const allModels = [...defaultModels, ...customModels];
  const activeEnabledIds = enabledModelIds.length > 0
    ? enabledModelIds
    : allModels.map(m => m.id);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!modelId.trim() || !name.trim()) {
      setError('Model ID and Name are required.');
      return;
    }

    if (allModels.some(m => m.id === modelId.trim())) {
      setError('A model with this ID already exists.');
      return;
    }

    const newModel: Model = {
      id: modelId.trim(),
      name: name.trim(),
      provider: provider.trim(),
      costInput: 0,
      costOutput: 0,
      contextWindow: 128000
    };

    onAddCustomModel(newModel);

    // Reset form
    setModelId('');
    setName('');
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Customize Available Models">
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
        {/* Active Models List */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Enabled Models
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Select which models appear in the dashboard. Disabled models will be hidden. <a href="https://github.com/of-arte/LLM-Bench/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-500 underline">Clone the repo</a> to add your own API keys.
          </p>

          <div className="space-y-2 border border-gray-200 dark:border-white/10 rounded-xl p-3 max-h-[40vh] overflow-y-auto bg-black/5 dark:bg-black/20">
            {/* Default Models */}
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 px-2">Default Suite</div>
            {defaultModels.map(model => {
              const isEnabled = activeEnabledIds.includes(model.id);
              const status = getModelStatus(model);
              return (
                <div
                  key={model.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/5 transition-colors"
                >
                  <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => onToggleModelEnable(model.id)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="relative flex items-center justify-center shrink-0 ml-1">
                      <span className={`w-2 h-2 rounded-full ${status === 'connected'
                        ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                        : status === 'demo'
                          ? 'bg-red-500 shadow-sm shadow-red-500/50'
                          : 'bg-red-500 shadow-sm shadow-red-500/50'
                        }`} />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{model.name}</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${status === 'connected'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : status === 'demo'
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                          }`}>
                          {status === 'connected' ? 'Connected' : status === 'demo' ? 'Demo' : 'Offline'}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate block capitalize">{model.provider}</span>
                    </div>
                  </label>
                </div>
              );
            })}

            {/* Custom Models */}
            {customModels.length > 0 && (
              <>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-4 mb-1 px-2 border-t border-gray-200 dark:border-white/10 pt-3">Custom Models</div>
                {customModels.map(model => {
                  const isEnabled = activeEnabledIds.includes(model.id);
                  const status = getModelStatus(model);
                  return (
                    <div
                      key={model.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/5 transition-colors group"
                    >
                      <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => onToggleModelEnable(model.id)}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="relative flex items-center justify-center shrink-0 ml-1">
                          <span className={`w-2 h-2 rounded-full ${status === 'connected'
                            ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                            : status === 'demo'
                              ? 'bg-red-500 shadow-sm shadow-red-500/50'
                              : 'bg-red-500 shadow-sm shadow-red-500/50'
                            }`} />
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{model.name}</span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${status === 'connected'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : status === 'demo'
                                ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                : 'bg-red-500/10 text-red-600 dark:text-red-400'
                              }`}>
                              {status === 'connected' ? 'Connected' : status === 'demo' ? 'Demo' : 'Offline'}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate block">{model.id}</span>
                        </div>
                      </label>
                      <button
                        onClick={() => onDeleteCustomModel(model.id)}
                        className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete custom model"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Add Custom Model */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Add Custom Model
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Register a model for a specific provider and ensure the corresponding API key is set.
          </p>

          <form onSubmit={handleAdd} className="space-y-3 bg-black/5 dark:bg-black/10 p-4 border border-gray-200 dark:border-white/10 rounded-xl">
            {error && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">Provider API</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg p-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="google">Google Gemini API</option>
                <option value="openai">OpenAI Native API</option>
                <option value="anthropic">Anthropic Native API</option>
                <option value="local">Local Endpoint API (e.g. Ollama)</option>
                <option value="openrouter">OpenRouter API</option>
              </select>
            </div>


            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">Model ID</label>
              <input
                type="text"
                placeholder="e.g. gpt-4o or meta-llama/llama-3-8b"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg p-2 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">Display Name</label>
              <input
                type="text"
                placeholder="e.g. GPT-4o"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg p-2 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow"
            >
              <Plus size={14} /> Add Custom Model
            </button>
          </form>
        </div>
      </div>
    </GlassModal>
  );
};
