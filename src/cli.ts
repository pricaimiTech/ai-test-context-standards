#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import defaultConfig from './config/defaultConfig.js';
import { GithubLoader } from './utils/githubLoader.js';
import { AIFactory } from './core/ai/factory.js';
import { TestPlanner } from './core/TestPlanner.js';
import { TestExecutor } from './core/TestExecutor.js';
import { RequirementsReviewer } from './core/RequirementsReviewer.js';

const program = new Command();

program
  .name('qa-ai')
  .description('QA AI Automation CLI - Agente de Testes Autônomo')
  .version('1.0.0');

/**
 * @description Comando para analisar o PRD procurando Gaps, Riscos e Ambiguidade e criar o relatório de análise
 * @param prdPath - O caminho para o arquivo de requisitos (PRD)
 * @param options - As opções para o comando
 * @param output - O diretório de saída
 * @param figmaUrl - A URL do protótipo Figma (Opcional)
 * @returns O relatório de análise
 */
program.command('review')
  .description('Fase 0: Refinamento Técnico - Identifica Gaps e Riscos no PRD')
  .argument('<prdPath>', 'Caminho do PRD')
  .option('-o, --output <dir>', 'Diretório de saída', defaultConfig.output.baseDir)
  .option('--figma <url>', 'URL do protótipo Figma (Opcional)')
  .action(async (prdPath, options) => {
    try {
      console.log(chalk.blue(`🕵️  Inicializando Refinamento de Requisitos...`));

      const inputPath = path.resolve(process.cwd(), prdPath);
      const outputBase = path.resolve(process.cwd(), options.output);
      const reviewDir = path.join(outputBase, 'review');

      try { await fs.access(inputPath); } catch { throw new Error(`PRD não encontrado: ${inputPath}`); }

      const ai = AIFactory.create(defaultConfig.ai);
      const loader = new GithubLoader(defaultConfig.standards);
      const reviewer = new RequirementsReviewer(loader, ai);

      const prdContent = await fs.readFile(inputPath, 'utf-8');

      await reviewer.review(prdContent, reviewDir, options.figma);

      console.log(chalk.white(`\n🏁 Refinamento concluído! Perguntas salvas em: ${chalk.underline(reviewDir)}`));

    } catch (e: any) {
      console.error(chalk.red('❌ Erro no Review:'), e.message);
    }
  });

/**
 * @description Comando para gerar o plano de teste
 * @param prdPath - O caminho para o arquivo de requisitos (PRD)
 * @param options - As opções para o comando
 * @returns O plano de teste gerado
 */
program.command('plan')
  .description('Fase 1: Gera o Plano de Testes (Estratégia)')
  .argument('<prdPath>', 'Caminho do PRD')
  .option('-o, --output <dir>', 'Diretório de saída', defaultConfig.output.baseDir)
  .action(async (prdPath, options) => {
    try {
      console.log(chalk.blue(`🧠 Inicializando Planejamento...`));

      const inputPath = path.resolve(process.cwd(), prdPath);
      const outputBase = path.resolve(process.cwd(), options.output);
      const strategyDir = path.join(outputBase, 'strategy');

      await fs.mkdir(strategyDir, { recursive: true });
      try { await fs.access(inputPath); } catch { throw new Error(`PRD não encontrado: ${inputPath}`); }

      const ai = AIFactory.create(defaultConfig.ai);
      const loader = new GithubLoader(defaultConfig.standards);
      const planner = new TestPlanner(loader, ai);

      const prdContent = await fs.readFile(inputPath, 'utf-8');
      const plan = await planner.createStrategy(prdContent);

      const planWithMeta = {
        meta: { createdAt: new Date().toISOString(), sourcePrd: inputPath },
        ...plan
      };

      const planPath = path.join(strategyDir, 'test-plan.json');
      await fs.writeFile(planPath, JSON.stringify(planWithMeta, null, 2));

      console.log(chalk.cyan(`\n📋 Estratégia Salva: ${planPath}`));
      console.log(chalk.dim(`Próximo passo: npm run qa:spec -- "${planPath}"`));

    } catch (error: any) {
      console.error(chalk.red('❌ Erro no Planejamento:'), error.message);
    }
  });

/**
 * @description Comando para gerar os casos de teste
 * @param planPath - O caminho para o arquivo de plano de teste gerado no passo anterior
 * @param options - As opções para o comando
 * @returns Os casos de teste gerados
 */
program.command('spec')
  .description('Fase 2: Gera os Casos de Teste (Markdown)')
  .argument('<planPath>', 'Caminho do Plano JSON')
  .option('--prd <prdPath>', 'Caminho do PRD (opcional)')
  .option('-o, --output <dir>', 'Diretório de saída', defaultConfig.output.baseDir)
  .action(async (planPath, options) => {
    try {
      console.log(chalk.yellow(`⚡ Inicializando Geração de Specs...`));

      const planFullPath = path.resolve(process.cwd(), planPath);
      const outputBase = path.resolve(process.cwd(), options.output);
      const specsDir = path.join(outputBase, 'specs');

      const planContent = await fs.readFile(planFullPath, 'utf-8');
      const plan = JSON.parse(planContent);

      let prdPath = options.prd || plan.meta?.sourcePrd;
      if (!prdPath) throw new Error('PRD não encontrado. Use --prd');

      const prdContent = await fs.readFile(prdPath, 'utf-8');

      const ai = AIFactory.create(defaultConfig.ai);
      const loader = new GithubLoader(defaultConfig.standards);
      const executor = new TestExecutor(loader, ai);

      await executor.executePlan(plan, prdContent, specsDir);

      console.log(chalk.magenta(`\n🏁 Specs geradas em: ${chalk.underline(specsDir)}`));

    } catch (error: any) {
      console.error(chalk.red('❌ Erro na Geração:'), error.message);
    }
  });

/**
 * @description Comando para verificar a conexão com o GitHub
 * @returns O resultado da verificação de conexão com o GitHub
 */
program.command('check-connection').action(async () => {
  const loader = new GithubLoader(defaultConfig.standards);
  try {
    await loader.loadManifest();
    console.log(chalk.green('✅ Conexão OK'));
  } catch (e: any) { console.log(chalk.red(e.message)); }
});

/**
 * @description Comando para testar a conexão com a IA
 * @returns O resultado do teste de conexão com a IA
 */
program.command('test-ai').action(async () => {
  const ai = AIFactory.create(defaultConfig.ai);
  try {
    const res = await ai.generate("JSON", "Hi", true);
    console.log(chalk.green('✅ AI OK: ' + res.content));
  } catch (e: any) { console.log(chalk.red(e.message)); }
});

program.parse(process.argv);