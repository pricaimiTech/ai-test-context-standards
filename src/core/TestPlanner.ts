import { GithubLoader } from '../utils/githubLoader.js';
import { AIProvider } from './ai/interfaces.js';
import chalk from 'chalk';

export interface PlanResult {
  businessRules: string[];
  selectedHeuristics: {
    name: string;   // O ID do arquivo (ex: 'constraints')
    reason: string; // A justificativa da IA
  }[];
}

export class TestPlanner {
  constructor(
    private loader: GithubLoader,
    private ai: AIProvider
  ) {}

  /**
   * Analisa o PRD e define a estratégia de testes baseada no manifesto de ferramentas
   */
  async createStrategy(prdContent: string): Promise<PlanResult> {
    console.log(chalk.blue('🧠 Analisando Regras de Negócio e definindo Estratégia...'));

    // 1. Carrega o Manifesto Inteligente (Metadados das Heurísticas)
    // Isso é muito mais rápido e barato do que baixar todos os arquivos MD
    let tools = await this.loader.loadManifest();
    
    // Fallback de segurança: Se o manifesto vier vazio ou der erro,
    // tentamos listar os arquivos crus para não travar o processo.
    if (!tools || tools.length === 0) {
      console.log(chalk.yellow('   ⚠️  Manifesto vazio ou não encontrado. Usando listagem simples...'));
      const simpleFiles = await this.loader.listHeuristics();
      tools = simpleFiles.map(f => ({
        id: f,
        name: f,
        description: "Heurística de teste padrão.",
        triggers: [f]
      }));
    }

    if (tools.length === 0) {
      throw new Error('Nenhuma heurística encontrada no repositório remoto.');
    }

    // 2. Prepara o Menu de Ferramentas para a IA
    // Formata o JSON do manifesto em um texto legível para o LLM
    const menuContext = tools.map((t: any) => 
      `- ID: "${t.id}"\n  Nome: ${t.name}\n  Descrição: ${t.description}\n  Gatilhos de Uso: ${t.triggers ? t.triggers.join(', ') : 'Geral'}`
    ).join('\n\n');

    console.log(chalk.gray(`   🛠️  Analisando ${tools.length} ferramentas disponíveis no manifesto...`));

    // 3. O Prompt do "QA Architect"
    const systemPrompt = `
      Você é um QA Architect Sênior (Arquiteto de Qualidade).
      
      --- SUA CAIXA DE FERRAMENTAS (HEURÍSTICAS) ---
      ${menuContext}
      ----------------------------------------------
      
      OBJETIVO:
      1. Analise o PRD/Requisito do usuário profundamente.
      2. Identifique as Regras de Negócio e Riscos.
      3. Selecione no MENU acima quais heurísticas (pelo ID) são ideais para cobrir esses riscos.
      4. Justifique a escolha cruzando os "Gatilhos" da ferramenta com o Requisito.
      
      IMPORTANTE:
      - Seja preciso. Não selecione ferramentas aleatoriamente.
      - Se houver regras de banco de dados/integridade, priorize ferramentas com gatilhos de "backend/integridade".
      - Se houver regras de datas/valores, priorize ferramentas de "limites/boundary".
      
      RETORNE APENAS JSON NESTE FORMATO:
      {
        "businessRules": ["Regra identificada 1", "Regra identificada 2"],
        "selectedHeuristics": [
          { 
            "name": "ID_DA_FERRAMENTA_AQUI", 
            "reason": "Explicação curta do porquê esta ferramenta se aplica a este PRD." 
          }
        ]
      }
    `;

    // 4. Executa a IA
    const response = await this.ai.generate(
      systemPrompt, 
      `CONTEXTO DO PROJETO (PRD):\n${prdContent}`, 
      true // Força JSON Mode
    );

    // 5. Tratamento de Erro de Parse
    try {
      return JSON.parse(response.content) as PlanResult;
    } catch (e) {
      console.error(chalk.red('   ❌ A IA não retornou um JSON válido no Planejamento.'));
      console.error(chalk.dim(response.content));
      throw new Error('Falha ao processar estratégia de teste (Parse Error).');
    }
  }
}