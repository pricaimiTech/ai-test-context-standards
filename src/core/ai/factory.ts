import { AIProvider } from './interfaces.js';
import { OpenAIProvider } from './providers/openai.js';
import { QAConfig } from '../../config/defaultConfig.js';

export class AIFactory {
  static create(config: QAConfig['ai']): AIProvider {
    switch (config.provider) {
      case 'openai':
        return new OpenAIProvider(config.apiKey!, config.model);
      
      default:
        throw new Error(`Provider não suportado neste MVP: ${config.provider}`);
    }
  }
}