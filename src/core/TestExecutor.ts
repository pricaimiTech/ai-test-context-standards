// src/core/TestExecutor.ts
import { GithubLoader } from '../utils/githubLoader.js';
import { AIProvider } from './ai/interfaces.js';
import { PlanResult } from './TestPlanner.js';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

/**
 * @description Classe para executar o plano de teste e criar os casos de teste
 * Aqui o Agente irá aplicar as heurísticas e criar os casos de teste com base no arquivo de estratégia de teste
 */
export class TestExecutor {
  constructor(
    private loader: GithubLoader,
    private ai: AIProvider
  ) {}

  /**
   * @description Executa o plano de teste e cria os casos de teste
   * @param plan - a estratégia de teste criada pelo TestPlanner
   * @param prdContent - O conteúdo do PRD/REQUISITO
   * @param outputDir - O diretório de saída onde os casos de teste serão salvos
   * @returns Os casos de teste gerados
   */
  async executePlan(plan: PlanResult, prdContent: string, outputDir: string) {
    const allTestCases = [];

    console.log(chalk.yellow(`\n⚡ Executando plano de testes...`));
    
    // Garante que a pasta existe
    await fs.mkdir(outputDir, { recursive: true });

    for (const item of plan.selectedHeuristics) {
      console.log(chalk.blue(`   📘 Aplicando Heurística: ${item.name.toUpperCase()}`));

      try {
        const heuristicContent = await this.loader.load('heuristics', item.name);

        const systemPrompt = `
          Você é um QA Automation Engineer Sênior.
          
          USE ESTA HEURÍSTICA COMO GUIA:
          ${heuristicContent}
          
          REGRAS DE NEGÓCIO ALVO:
          ${JSON.stringify(plan.businessRules)}
          
          TAREFA:
          Gere casos de teste detalhados para o PRD fornecido.
          Siga estritamente o template de saída definido na heurística.
        `;

        const response = await this.ai.generate(systemPrompt, prdContent, false); // False = Markdown puro
        
        // Salva o resultado direto na pasta specs
        const fileName = `${item.name}_tests.md`;
        const filePath = path.join(outputDir, fileName);
        
        await fs.writeFile(filePath, response.content);
        
        console.log(chalk.green(`      ✅ Testes salvos em: ${filePath}`));
        allTestCases.push(filePath);

      } catch (e: any) {
        console.error(chalk.red(`      ❌ Falha ao aplicar ${item.name}: ${e.message}`));
      }
    }

    return allTestCases;
  }
}