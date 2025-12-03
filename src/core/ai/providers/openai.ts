import OpenAI from 'openai';
import { AIProvider, AIResponse } from '../interfaces.js';
import chalk from 'chalk';

/**
 * @description Provider de IA OpenAI
 * @param apiKey A chave de API da OpenAI
 * @param model O modelo da OpenAI
 * @returns O provider de IA OpenAI
 */
export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  /**
   * @description Construtor do provider de IA OpenAI
   * @param apiKey A chave de API da OpenAI
   * @param model O modelo da OpenAI
   */
  constructor(apiKey: string, model: string) {
    if (!apiKey) throw new Error('API Key da OpenAI é obrigatória.');

    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  /**
   * @description Gera uma resposta da IA
   * @param systemPrompt O prompt do sistema
   * @param userPrompt O prompt do usuário
   * @param options Opções para a geração de resposta da IA
   * @returns A resposta da IA
   */
  async generate(systemPrompt: string, userPrompt: string, options?: any): Promise<AIResponse> {
    const jsonMode = typeof options === 'boolean' ? options : options?.jsonMode;
    const temperature = typeof options === 'object' && options.temperature !== undefined
      ? options.temperature
      : 0.7; /**@default - Padrão se não informado */

    try {
      /**@step 1 - Gera a resposta da IA */
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: jsonMode ? { type: "json_object" } : { type: "text" },
        temperature: temperature, /**@step 2 - Usa a temperatura dinâmica */
      });

      const choice = completion.choices[0];
      /**@step 3 - Obtém o uso de tokens da resposta */
      const usage = completion.usage;

      /**@step 4 - Log de custo para você monitorar */
      if (usage) {
        console.log(chalk.dim(`      💰 Tokens: ${usage.total_tokens} (In: ${usage.prompt_tokens}, Out: ${usage.completion_tokens})`));
      }

      /**@step 5 - Retorna a resposta da IA */
      return {
        content: choice.message.content || '',
        usage: {
          inputTokens: usage?.prompt_tokens || 0,
          outputTokens: usage?.completion_tokens || 0
        }
      };

    } catch (error: any) {
      console.error(chalk.red('Erro na OpenAI:'), error.message);
      throw new Error(`Falha na geração OpenAI: ${error.message}`);
    }
  }
}