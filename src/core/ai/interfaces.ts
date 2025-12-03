export interface AIResponse {
    content: string;
    usage?: {
      inputTokens: number;
      outputTokens: number;
    };
  }
  
  export interface AIProvider {
    /**
     * @param systemPrompt O "Role" (ex: Você é um QA Senior que conhece Seven Dwarfs)
     * @param userPrompt O "Context" (ex: O conteúdo do PRD)
     * @param jsonMode Força saída JSON estruturada
     */
    generate(systemPrompt: string, userPrompt: string, jsonMode?: boolean): Promise<AIResponse>;
  }