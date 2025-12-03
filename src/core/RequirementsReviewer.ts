import { GithubLoader } from '../utils/githubLoader.js';
import { AIProvider } from './ai/interfaces.js';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

/**
 * @description Classe para analisar o PRD e gerar perguntas para o time de desenvolvimento
 * @param loader - O loader de heurísticas
 * @param ai - O provider de IA
 * @returns O relatório de análise e as perguntas geradas
 */
export class RequirementsReviewer {
  constructor(
    private loader: GithubLoader,
    private ai: AIProvider
  ) {}

  async review(prdContent: string, outputDir: string, figmaUrl?: string) {
    console.log(chalk.blue('🕵️  Iniciando Análise de Refinamento (360º)...'));

    let tools: any[] = [];
    
    /**@step 1 - Carrega o manifesto de heurísticas disponíveis no repositório remoto ou local */
    try {
        const manifest = await this.loader.loadManifest();
        tools = manifest.filter((t: any) => t.type === 'review');
    } catch (e) {
        console.log(chalk.yellow('   ⚠️  Sem manifesto remoto.'));
    }

    if (tools.length === 0) {
      tools.push({ id: 'prd-analysis', name: 'Review Padrão (Local)', type: 'review', isLocal: true });
    }

    /**@step 2 - Seleciona as heurísticas baseadas no contexto do Figma ou do PRD */
    let selectedTools: any[] = [];
    const contextInfo = figmaUrl 
      ? `O usuário FORNECEU um link do Figma (${figmaUrl}). VALIDE Visual vs Texto.`
      : `O usuário NÃO forneceu design. Focar na lógica e regras.`;

    /**@step 3 - Seleciona a melhor heurística para analisar o PRD */
    if (tools.length > 0) {
      console.log(chalk.gray(`   🧠 Selecionando lentes de análise...`));
      
      const selectionPrompt = `
        Você é um QA Lead moderando um Refinamento.
        CONTEXTO: ${contextInfo}
        PRD PREVIEW: ${prdContent.substring(0, 500)}...
        FERRAMENTAS:
        ${tools.map(t => `- ID: ${t.id} | Nome: ${t.name}`).join('\n')}
        
        TAREFA: Escolha a MELHOR ferramenta para este caso. 
        Se necessário, escolha no máximo 2, mas apenas se tiverem focos muito diferentes (ex: Técnica vs Negócio).
        Evite redundância.
        
        Retorne JSON: { "ids": ["id_escolhido"] }
      `;

      try {
        const decision = await this.ai.generate(
            selectionPrompt, 
            "Selecione as ferramentas com base na lógica.", 
            { jsonMode: true, temperature: 0 } 
        );
        
        /**@step 4 - Obtém a escolha da IA */
        const choice = JSON.parse(decision.content);
        selectedTools = tools.filter((t: any) => choice.ids.includes(t.id));
        if (selectedTools.length === 0) selectedTools = [tools[0]];
        
        console.log(chalk.cyan(`   🎯 Heurísticas Selecionadas:`));
        selectedTools.forEach(t => console.log(chalk.cyan(`      - ${t.name}`)));

      } catch (e) {
        selectedTools = tools;
      }
    }

    await fs.mkdir(outputDir, { recursive: true });

    /**@step 4 - Executa as heurísticas selecionadas */
    for (const tool of selectedTools) {
      console.log(chalk.magenta(`\n   🚀 Aplicando: ${tool.name}`));
      
      try {
        let heuristicContent = await this.resolveHeuristicContent(tool);

        const systemPrompt = `
          ATUE COMO UM QA LEAD EM REFINAMENTO TÉCNICO.
          
          --- FERRAMENTA (${tool.name}) ---
          ${heuristicContent}
          
          --- CONTEXTO EXTRA ---
          ${figmaUrl ? `Figma: ${figmaUrl}` : 'Apenas texto.'}

          --- TAREFA ---
          Analise o PRD e gere questionamentos RELEVANTES.
          Se a documentação estiver perfeita sob esta ótica, retorne listas vazias.
          
          --- SAÍDA JSON ---
          {
            "summary": "Parecer geral",
            "gaps": [{ "topic": "Item", "description": "O que falta?", "impact": "High/Medium/Low" }],
            "risks": [{ "category": "Tech/Biz", "description": "Detalhe", "mitigation": "Sugestão" }],
            "questions": ["Pergunta 1", "Pergunta 2"]
          }
        `;

        const response = await this.ai.generate(systemPrompt, prdContent, true);
        const report = JSON.parse(response.content);
        
        /**@step 5 - Filtra os resultados relevantes */
        const hasGaps = report.gaps && report.gaps.length > 0;
        const hasRisks = report.risks && report.risks.length > 0;
        const hasQuestions = report.questions && report.questions.length > 0;

        if (!hasGaps && !hasRisks && !hasQuestions) {
            console.log(chalk.yellow(`      ⚠️  Relatório vazio gerado por ${tool.name}.`));
            console.log(chalk.dim(`          A IA não encontrou problemas relevantes com esta lente. Arquivo descartado.`));
            continue; /**@step 6 - Pula para a próxima heurística */
        }

        /**@step 7 - Formata o relatório em markdown */
        const reportMD = this.formatReportToMarkdown(report, tool.name);
        const filePath = path.join(outputDir, `refinement_${tool.id}.md`);
        await fs.writeFile(filePath, reportMD);
        /**@step 8 - Salva o relatório em um arquivo */
        console.log(chalk.green(`      ✅ Relatório salvo em: ${filePath}`));

      } catch (error: any) {
        console.error(chalk.red(`      ❌ Erro: ${error.message}`));
      }
    }
  }

  /**@helper - Carrega o conteúdo da heurística */

  private async resolveHeuristicContent(tool: any): Promise<string> {
    if (tool.isLocal) return this.loadLocalHeuristic(tool.id);
    try { return await this.loader.load('heuristics', tool.id); } 
    catch { return this.loadLocalHeuristic(tool.id); }
  }

  /**@helper - Carrega a heurística local */
  private async loadLocalHeuristic(id: string): Promise<string> {
    // Solução robusta sem import.meta
    const possiblePaths = [
        path.resolve(process.cwd(), 'dist/heuristics', `${id}.md`),
        path.resolve(process.cwd(), 'src/heuristics', `${id}.md`),
        path.resolve(process.cwd(), 'node_modules/qa-ai-lib/dist/heuristics', `${id}.md`)
    ];
    for (const p of possiblePaths) {
        try { await fs.access(p); return await fs.readFile(p, 'utf-8'); } catch { continue; }
    }
    throw new Error(`Heurística local '${id}.md' não encontrada.`);
  }

  /**@helper - Formata o relatório em markdown */
  private formatReportToMarkdown(json: any, toolName: string): string {
    const date = new Date().toLocaleDateString('pt-BR');

    const questionsSection = json.questions?.length 
      ? json.questions.map((q: string) => `- [ ] 🙋 **${q}**`).join('\n') 
      : '> _Nenhuma dúvida levantada._';

    const gapsSection = json.gaps?.length 
      ? json.gaps.map((g: any) => `### ${this.getImpactIcon(g.impact)} ${g.topic}\n**Impacto:** ${g.impact || 'Medium'}\n> ${g.description}`).join('\n\n') 
      : '> _Nenhum gap crítico identificado._';

    const risksSection = json.risks?.length 
        ? json.risks.map((r: any) => `- [${r.category || 'Risco'}] **${r.description}**\n  *Mitigação:* ${r.mitigation}`).join('\n') 
        : '> _Nenhum risco evidente._';

    return `
# 🕵️ Relatório de Refinamento

| **Lente de Análise** | **Data** | **Status** |
| :--- | :--- | :--- |
| ${toolName} | ${date} | 🚦 Em Análise |

> 📝 **Veredito da IA:**
> ${json.summary || 'Análise concluída.'}

---

## ❓ Questionamentos para o Time
${questionsSection}

---

## 🚨 Pontos de Atenção (Gaps)
${gapsSection}

---

## ⚠️ Riscos Mapeados
${risksSection}

---
*Gerado automaticamente por **QA AI Agent** 🤖*
    `.trim();
  }

  /**@helper - Obtém o ícone de impacto */
  private getImpactIcon(impact: string): string {
    const i = impact?.toLowerCase() || '';
    if (i.includes('high') || i.includes('critical')) return '🔴';
    if (i.includes('medium')) return '🟡';
    return '🔵';
  }
}