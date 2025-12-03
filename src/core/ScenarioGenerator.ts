import { AIProvider } from './ai/interfaces.js';
import { PlanResult } from './TestPlanner.js';
import chalk from 'chalk';

/**
 * @description Classe para gerar cenários de teste pela IA com base na interface
 * @param ai - O provedor de IA
 * @returns Os cenários de teste
 */
export class ScenarioGenerator {
  constructor(private ai: AIProvider) {}

  /**
   * @description Gera cenários de teste pela IA
   * @param plan - A estratégia de teste
   * @param prdContent - O conteúdo do PRD
   * @param figmaUrl - O URL do protótipo Figma
   * @returns Os cenários de teste
   */
  async generateScenarios(
    plan: PlanResult, 
    prdContent: string, 
    figmaUrl?: string
  ): Promise<any[]> {
    
    console.log(chalk.blue('🗺️  Mapeando Cenários de Teste (Alto Nível)...'));
    
    const designContext = figmaUrl 
      ? `PROTÓTIPO FIGMA: O design visual está em: ${figmaUrl}.`
      : 'DESIGN: Nenhum protótipo fornecido.';

    const systemPrompt = `
      Você é um QA Lead experiente desenhando o MAPA DE TESTES.
      
      --- ESTRATÉGIA DEFINIDA ---
      ${plan.selectedHeuristics.map(h => `- ${h.name}: ${h.reason}`).join('\n')}

      --- CONTEXTO EXTRA ---
      ${designContext}

      --- REGRAS DE CLASSIFICAÇÃO (TIPO) ---
      1. **E2E**: Se o teste cobrir uma jornada completa do usuário passando por múltiplas telas ou serviços.
      2. **Funcional**: Se o teste validar uma regra de negócio específica, validação de campo ou comportamento isolado.

      --- REGRAS DE SAÍDA (OBRIGATÓRIO) ---
      1. Gere uma lista de cenários cobrindo os requisitos.
      2. **ID**: Deve seguir estritamente o formato baseado no tipo:
         - Se Funcional: "CT-{sequencial_4_digitos}-F" (Ex: CT-0001-F)
         - Se E2E: "CT-{sequencial_4_digitos}-E" (Ex: CT-0001-E)
         *Mantenha o sequencial incremental independente do tipo.*
      3. **severity**: Critical, High, Medium, Low.
      4. **isClickUp**: DEVE SER SEMPRE false.

      RETORNE APENAS JSON:
      {
        "scenarios": [
          {
            "id": "CT-0001-F",
            "requirement": "Resumo da regra",
            "testName": "Nome do teste",
            "description": "Objetivo do teste",
            "heuristic": "Nome da heurística",
            "severity": "Critical",
            "type": "Funcional",
            "isClickUp": false
          }
        ]
      }
    `;

    try {
      const response = await this.ai.generate(
        systemPrompt, 
        `DOCUMENTO DE REQUISITOS (PRD):\n${prdContent}`, 
        true 
      );

      const result = JSON.parse(response.content);
      const scenarios = result.scenarios || [];

      console.log(chalk.green(`   ✅ ${scenarios.length} cenários identificados.`));
      return scenarios;

    } catch (error: any) {
      console.error(chalk.red('   ❌ Erro ao gerar cenários:'), error.message);
      throw error;
    }
  }
}