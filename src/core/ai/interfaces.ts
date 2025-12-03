/**
 * @description Interface para a resposta da IA
 * @param content O conteúdo da resposta
 * @param usage O uso de tokens da resposta
 */
export interface AIResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * @description Opções para a geração de resposta da IA, em alguns casos, a IA precisa ser forçada a seguir uma temperatura pre determinada para gerar uma resposta mais consistente
 * @param temperature A temperatura da geração de resposta
 * @param jsonMode Força saída JSON estruturada
 */
export interface AIOptions {
  temperature?: number;
  jsonMode?: boolean;
}

export interface AIProvider {
  /**
   * @param systemPrompt O "Role" (ex: Você é um QA Senior que conhece Seven Dwarfs)
   * @param userPrompt O "Context" (ex: O conteúdo do PRD)
   * @param options Opções para a geração de resposta da IA
   */
  generate(systemPrompt: string, userPrompt: string, options?: AIOptions | boolean): Promise<AIResponse>;
}