import React, { useState } from 'react';
import { TestScenario } from '../types/bench';
import { GlassCard } from './ui/GlassCard';
import { Save, X, AlertTriangle, Code } from 'lucide-react';

interface ScenarioBuilderProps {
  onSave: (scenario: TestScenario) => void;
  onCancel: () => void;
  initialScenario?: TestScenario;
}

export const ScenarioBuilder: React.FC<ScenarioBuilderProps> = ({ onSave, onCancel, initialScenario }) => {
  const [name, setName] = useState(initialScenario?.name || '');
  const [description, setDescription] = useState(initialScenario?.description || '');
  const [prompt, setPrompt] = useState(initialScenario?.prompt || '');
  const [expectedContainsText, setExpectedContainsText] = useState(
    initialScenario?.expectedContains ? initialScenario.expectedContains.join(', ') : ''
  );
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    try {
      setError(null);
      
      if (!name || !prompt) {
        throw new Error("Name and Prompt are required.");
      }

      const expectedContains = expectedContainsText
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const newScenario: TestScenario = {
        id: initialScenario?.id || `custom-${Date.now()}`,
        name,
        description,
        difficulty: initialScenario?.difficulty || 'intermediate',
        prompt,
        expectedContains: expectedContains.length > 0 ? expectedContains : undefined
      };

      onSave(newScenario);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <GlassCard className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Code className="text-blue-500" />
            {initialScenario ? 'Edit Scenario' : 'Create Custom Scenario'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertTriangle size={20} />
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Scenario Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Logic Puzzle Test"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Brief description of the test case"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none h-32"
              placeholder="The user prompt to send to the model..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expected Response Substrings (comma separated)</label>
            <input
              type="text"
              value={expectedContainsText}
              onChange={(e) => setExpectedContainsText(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Paris, France"
            />
            <p className="text-xs text-gray-500 mt-2">The test will pass if the model's raw response contains ALL of these strings (case-insensitive). Leave blank to only check that the model doesn't error.</p>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={onCancel}
              className="px-6 py-3 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg transform transition active:scale-95 flex items-center gap-2"
            >
              <Save size={20} />
              Save Scenario
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
