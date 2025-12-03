/**
 * @description Interface para a resposta da IA
 */
export interface AIResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * @description Interface para o provedor de IA
 */
export interface AIProvider {
  /**
   * @param systemPrompt O "Role" (ex: Você é um QA Senior que conhece Seven Dwarfs)
   * @param userPrompt O "Context" (ex: O conteúdo do PRD)
   * @param jsonMode Força saída JSON estruturada
   */
  generate(systemPrompt: string, userPrompt: string, jsonMode?: boolean): Promise<AIResponse>;
}



/**
 * @description Interface para a crição da estratégia de teste pela IA
 */
export interface TestCase {
  id: string;              // Identificador único (ex: SCN-001)
  requirement: string;     // O requisito macro ou ID do PRD
  testName: string;        // Nome curto do teste
  description: string;     // O que será validado (Alto nível)
  heuristic: string;       // Qual heurística sugeriu este teste
  severity: "P0 - BLOCKER" | "P1 - CRITICAL" | "P2 - NORMAL" | "P3 - LOW";
}

/**
 * @description Interface para o cenário de teste pela IA
 */
export interface TestScenario {
  id: string;              // Identificador único (ex: SCN-001)
  requirement: string;     // O requisito macro ou ID do PRD
  testName: string;        // Nome curto do teste
  description: string;     // O que será validado (Alto nível)
  heuristic: string;       // Qual heurística sugeriu este teste
  severity: "P0 - BLOCKER" | "P1 - CRITICAL" | "P2 - NORMAL" | "P3 - LOW";
  type: "Funcional" | "E2E";
  isClickUp: boolean;      // Default: false
}