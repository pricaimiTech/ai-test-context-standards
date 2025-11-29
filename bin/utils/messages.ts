import chalk from 'chalk';
import { CliOptions } from '../cli';

/**
 * Exibe a mensagem de boas-vindas
 * @returns void
 */
export function displayWelcomeMessage(): void {
  console.log(chalk.cyan(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🤖 AI Test Context Standards                               ║
║   📝 Padrões de QA e Testes para IAs                         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `));

  console.log(chalk.white('Esta ferramenta irá configurar padrões de desenvolvimento,'));
  console.log(chalk.white('boas práticas e contextos de teste para auxiliar IAs'));
  console.log(chalk.white('na geração de código de qualidade.\n'));
}

/**
 * Exibe a mensagem de sucesso após a instalação
 * @param options - As opções da CLI
 * @returns void
 */
export function displaySuccessMessage(options: CliOptions): void {
  console.log(chalk.green.bold('\n✅ Instalação concluída com sucesso!\n'));

  console.log(chalk.cyan('📂 Arquivos criados:'));
  console.log(chalk.white('  └─ .ai/ (diretório com padrões e contextos)'));
  console.log(chalk.white('     ├─ standards/ (padrões de desenvolvimento)'));
  console.log(chalk.white('     ├─ test-patterns/ (padrões de teste)'));
  console.log(chalk.white('     ├─ heuristics/ (heurísticas de QA)'));
  console.log(chalk.white('     └─ custom/ (suas customizações)'));

  if (options.aiPlatforms.includes('cursor')) {
    console.log(chalk.white('  └─ .cursorrules (regras para Cursor AI)'));
  }

  if (options.aiPlatforms.includes('claude')) {
    console.log(chalk.white('  └─ claude-instructions.md (instruções para Claude Code)'));
  }

  if (options.aiPlatforms.includes('copilot')) {
    console.log(chalk.white('  └─ .github/copilot-instructions.md (instruções para Copilot)'));
  }

  if (options.aiPlatforms.includes('gemini')) {
    console.log(chalk.white('  └─ .gemini-context.md (contexto para Gemini)'));
  }

  console.log(chalk.cyan('\n📖 Próximos passos:\n'));
  console.log(chalk.white('  1. Revise os padrões gerados em .ai/'));
  console.log(chalk.white('  2. Customize conforme necessário em .ai/custom/'));
  console.log(chalk.white('  3. Commit os arquivos no seu repositório'));
  console.log(chalk.white('  4. As IAs agora terão contexto dos seus padrões!\n'));

  console.log(chalk.gray('💡 Dica: Você pode executar novamente para atualizar ou adicionar novos padrões.\n'));
}

/**
 * Exibe a mensagem de erro
 * @param error - O erro
 * @returns void
 */
export function displayErrorMessage(error: string): void {
  console.log(chalk.red.bold('\n❌ Erro:\n'));
  console.log(chalk.red(error));
  console.log(chalk.yellow('\n💡 Se o problema persistir, abra uma issue em:'));
  console.log(chalk.blue('   https://github.com/qajonatasmartins/ai-test-context-standards/issues\n'));
}

