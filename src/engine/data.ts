import { TestScenario } from '../types/bench';

export const SCENARIOS: TestScenario[] = [
  {
    id: 'basic-factual',
    name: 'Basic Factual Query',
    description: 'Simple single-turn factual recall test.',
    difficulty: 'basic',
    prompt: 'What is the capital of France? Please answer with just the city name.',
    expectedContains: ['Paris']
  },
  {
    id: 'math-reasoning',
    name: 'Mathematical Reasoning',
    description: 'Testing numeric calculation and logic.',
    difficulty: 'intermediate',
    prompt: 'If I have 5 apples and eat 2, then buy 3 more, how many apples do I have? Answer with just the number.',
    expectedContains: ['6']
  },
  {
    id: 'creative-writing',
    name: 'Creative Writing Constraints',
    description: 'Requires following specific constraints in creative writing.',
    difficulty: 'advanced',
    prompt: 'Write a haiku about the ocean. It must follow the 5-7-5 syllable structure. Do not include any other text.',
    expectedContains: [] 
  },
  {
    id: 'logic-puzzle',
    name: 'Logic Puzzle',
    description: 'Chained logic and deduction.',
    difficulty: 'expert',
    prompt: 'A farmer has a fox, a goose, and a bag of beans. He needs to cross a river with a boat that can only hold himself and one other item. If left alone, the fox will eat the goose, and the goose will eat the beans. Name the first item the farmer must take across the river.',
    expectedContains: ['goose']
  }
];
