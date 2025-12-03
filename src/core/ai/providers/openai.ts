import OpenAI from 'openai';
import { AIProvider, AIResponse } from '../interfaces.js';
import chalk from 'chalk';

/**
 * Note o uso de response_format: { type: "json_object" }. Isso garante que a IA não "alucine" texto fora do JSON, economizando tokens e evitando erros de parse.
 */
export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string) {
    if (!apiKey) throw new Error('API Key da OpenAI é obrigatória.');
    
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async generate(systemPrompt: string, userPrompt: string, jsonMode: boolean = false): Promise<AIResponse> {
    try {
      console.log(chalk.gray(`   🤖 OpenAI (${this.model}) processando... [JSON: ${jsonMode}]`));

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        // 💡 TRUQUE: Força JSON real se solicitado (só funciona nos modelos novos como gpt-4o-mini)
        response_format: jsonMode ? { type: "json_object" } : { type: "text" },
        temperature: 0.7,
      });

      const choice = completion.choices[0];
      const usage = completion.usage;

      // Log de custo para você monitorar
      if (usage) {
        console.log(chalk.dim(`      💰 Tokens: ${usage.total_tokens} (In: ${usage.prompt_tokens}, Out: ${usage.completion_tokens})`));
      }

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