import { GithubLoader } from '../utils/githubLoader.js';
import { AIProvider } from './ai/interfaces.js';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export class RequirementsReviewer {
    constructor(
        private loader: GithubLoader,
        private ai: AIProvider
    ) { }

    /**
     * Executa a análise crítica do PRD usando ferramentas remotas ou locais
     */
    async review(prdContent: string, outputDir: string) {
        console.log(chalk.blue('🕵️  Iniciando Análise Crítica do PRD...'));

        let tools: any[] = [];

        // ---------------------------------------------------------
        // 1. TENTATIVA DE CARREGAR O MANIFESTO (CLOUD -> LOCAL)
        // ---------------------------------------------------------
        try {
            console.log(chalk.gray('   📡 Buscando lista de ferramentas no GitHub...'));
            const manifest = await this.loader.loadManifest();
            // Filtra apenas ferramentas do tipo "review"
            tools = manifest.filter((t: any) => t.type === 'review');

            if (tools.length > 0) {
                console.log(chalk.dim(`      Ferramentas encontradas: ${tools.map(t => t.name).join(', ')}`));
            }
        } catch (e: any) {
            console.log(chalk.yellow(`   ⚠️  Falha ao conectar no GitHub (${e.message}).`));
            console.log(chalk.gray('   🔄 Alternando para modo OFFLINE (Fallback Local)...'));
        }

        // Se falhou o download ou o manifesto não tem tools de review, usa o Default Local
        if (tools.length === 0) {
            tools.push({
                id: 'prd-analysis',
                name: 'Análise de Gaps e Riscos (Local)',
                type: 'review'
            });
        }

        // Garante que a pasta de saída existe
        await fs.mkdir(outputDir, { recursive: true });

        // ---------------------------------------------------------
        // 2. ITERAÇÃO SOBRE AS FERRAMENTAS
        // ---------------------------------------------------------
        for (const tool of tools) {
            console.log(chalk.magenta(`   🧠 Analista Ativo: ${tool.name}`));

            let heuristicContent = '';

            try {
                // TENTA BAIXAR O CONTEÚDO REMOTO
                // (Só tenta se viemos de um manifesto remoto, senão vai direto pro local)
                // O loader já lança erro se não achar
                heuristicContent = await this.loader.load('heuristics', tool.id);
                console.log(chalk.dim('      ☁️  Usando definição remota (GitHub)'));

            } catch (error) {
                // SE FALHAR (Erro 404 ou Network Error), TENTA LOCAL
                console.log(chalk.yellow('      ⚠️  Definição remota indisponível. Buscando arquivo local...'));

                try {
                    heuristicContent = await this.loadLocalHeuristic(tool.id);
                    console.log(chalk.dim('      💾 Usando definição local (Built-in)'));
                } catch (localError) {
                    console.error(chalk.red(`      ❌ Falha crítica: Heurística '${tool.id}' não encontrada nem no GitHub nem localmente.`));
                    console.error(chalk.dim(`         Verifique se o arquivo src/heuristics/${tool.id}.md existe.`));
                    continue; // Pula para a próxima ferramenta sem quebrar o processo
                }
            }

            // ---------------------------------------------------------
            // 3. EXECUÇÃO DA IA
            // ---------------------------------------------------------
            try {
                const systemPrompt = `
          ATUE COMO UM PRODUCT MANAGER TÉCNICO E ARQUITETO DE SOFTWARE.
          
          --- SEU GUIA DE ANÁLISE ---
          ${heuristicContent}
          
          --- TAREFA ---
          Analise o PRD fornecido procurando falhas, riscos, ambiguidades e gaps.
          Seja crítico, direto e técnico.
          
          RETORNE APENAS JSON.
        `;

                const response = await this.ai.generate(systemPrompt, prdContent, true);

                // Parse seguro do JSON
                let report;
                try {
                    report = JSON.parse(response.content);
                } catch (parseError) {
                    throw new Error('A IA não retornou um JSON válido.');
                }

                // Formata para Markdown (Leitura Humana)
                const reportMD = this.formatReportToMarkdown(report, tool.name);

                // Salva o arquivo
                const filePath = path.join(outputDir, `review_${tool.id}.md`);
                await fs.writeFile(filePath, reportMD);

                console.log(chalk.green(`      ✅ Relatório salvo em: ${filePath}`));

            } catch (aiError: any) {
                console.error(chalk.red(`      ❌ Erro na geração da IA: ${aiError.message}`));
            }
        }
    }

    /**
     * @description Helper robusto para encontrar arquivos locais
     * @param id - O ID da heurística
     * @returns O conteúdo da heurística
     */
    private async loadLocalHeuristic(id: string): Promise<string> {

        const possiblePaths = [
            // Tentativa 1: Caminho relativo padrão da lib compilada (dist)
            path.resolve(process.cwd(), 'dist/heuristics', `${id}.md`),
            // Tentativa 2: Caminho relativo padrão de desenvolvimento (src)
            path.resolve(process.cwd(), 'src/heuristics', `${id}.md`),
            // Tentativa 3: Caminho dentro de node_modules (se instalada como dep)
            path.resolve(process.cwd(), 'node_modules/qa-ai-lib/dist/heuristics', `${id}.md`)
        ];

        for (const p of possiblePaths) {
            try {
                await fs.access(p);
                return await fs.readFile(p, 'utf-8');
            } catch {
                continue;
            }
        }

        // Se falhar tudo, lança erro detalhado
        throw new Error(`Heurística local '${id}.md' não encontrada. Verifique se o arquivo existe em src/heuristics.`);
    }

    /**
     * @description Converte o JSON cru da IA em um Markdown bonito
     * @param json - O JSON da IA
     * @param toolName - O nome da ferramenta
     * @returns O Markdown bonito
     */
    private formatReportToMarkdown(json: any, toolName: string): string {
        const gaps = json.gaps?.length
            ? json.gaps.map((g: any) => `- **${g.topic}** (${g.impact || 'Medium'}): ${g.description}`).join('\n')
            : '_Nenhum gap crítico identificado._';

        const risks = json.risks?.length
            ? json.risks.map((r: any) => `- [${r.category || 'General'}] **${r.description}**\n  *Mitigação:* ${r.mitigation}`).join('\n')
            : '_Nenhum risco evidente._';

        const questions = json.questions?.length
            ? json.questions.map((q: string) => `- [ ] ${q}`).join('\n')
            : '_Nenhuma dúvida gerada._';

        return `
# Relatório de Análise: ${toolName}
> **Nota de Qualidade do Documento:** ${json.summary || 'N/A'}

## 🚨 Gaps e Lacunas (O que falta?)
${gaps}

## ⚠️ Riscos Identificados
${risks}

## ❓ Questionamentos para o PO
${questions}
    `.trim();
    }
}