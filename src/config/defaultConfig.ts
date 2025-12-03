import dotenv from 'dotenv';
dotenv.config();

export interface QAConfig {
  ai: {
    provider: 'openai'; 
    model: string;
    apiKey?: string;
    temperature: number;
  };
  standards: {
    source: 'github' | 'local';
    owner: string;
    repo: string;
    branch: string;
    paths: {
      heuristics: string;
    };
    githubToken?: string;
  };
  output: {
    baseDir: string;
  }
}

const config: QAConfig = {
  ai: {
    provider: 'openai',
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0.7,
  },
  standards: {
    source: 'github',
    owner: 'qajonatasmartins',
    repo: process.env.STANDARDS_REPO || 'ai-test-context-standards',
    branch: 'main', 
    paths: {
      heuristics: process.env.HEURISTICAS_PATH || '05-ESPECIALIDADES/agentTesting/heuristicas/',
    },
    githubToken: process.env.GITHUB_TOKEN,
  },
  output: {
    baseDir: process.env.QA_OUTPUT_DIR || 'qa-output'
  }
};

export default config;