import inquirer from 'inquirer';
import chalk from 'chalk';
// import path from 'node:path';
import { copyTemplates } from './utils/file-handler';
import { displayWelcomeMessage, displaySuccessMessage } from './utils/messages';

/**
 * Opções da CLI
 * @interface CliOptions
 */
export interface CliOptions {
  targetDirectory: string;
  language: 'pt-BR' | 'en-US' | 'es-ES';
  testTypes: string[];
  aiPlatforms: string[];
  overwriteExisting: boolean;
}

/**
 * Executa a CLI
 * @returns void
 */
export async function runCLI(): Promise<void> {
  try {
    // Mensagem de boas-vindas
    displayWelcomeMessage();

    // 1. Confirmar diretório de instalação
    const { confirmDirectory } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmDirectory',
        message: `Os arquivos serão adicionados ao diretório: ${chalk.yellow(process.cwd())}\nConfirmar?`,
        default: true,
      },
    ]);

    if (!confirmDirectory) {
      console.log(chalk.yellow('\n⚠️  Operação cancelada pelo usuário.\n'));
      process.exit(0);
    }

    // 2. Selecionar idioma
    const { language } = await inquirer.prompt([
      {
        type: 'list',
        name: 'language',
        message: 'Escolha o idioma padrão para os documentos:',
        choices: [
          { name: '🇧🇷 Português (Brasil)', value: 'pt-BR' },
          { name: '🇺🇸 English (US)', value: 'en-US' },
          { name: '🇪🇸 Español', value: 'es-ES' },
        ],
        default: 'pt-BR',
      },
    ]);

    // 3. Selecionar tipos de teste
    const { testTypes } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'testTypes',
        message: 'Selecione os tipos de teste que deseja incluir:',
        choices: [
          { name: 'Testes Unitários (Unit Tests)', value: 'unit', checked: true },
          { name: 'Testes de Integração (Integration Tests)', value: 'integration', checked: true },
          { name: 'Testes de Sistema (System/E2E Tests)', value: 'e2e', checked: true },
          { name: 'Testes de API', value: 'api', checked: false },
          { name: 'Testes de Performance', value: 'performance', checked: false },
        ],
        validate: (answer) => {
          if (answer.length < 1) {
            return 'Você deve escolher pelo menos um tipo de teste.';
          }
          return true;
        },
      },
    ]);

    // 4. Selecionar plataformas de IA
    const { aiPlatforms } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'aiPlatforms',
        message: 'Selecione as plataformas de IA que você utiliza:',
        choices: [
          { name: 'Cursor AI', value: 'cursor', checked: true },
          { name: 'Claude Code (Anthropic)', value: 'claude', checked: true },
          { name: 'GitHub Copilot', value: 'copilot', checked: false },
          { name: 'Google Gemini', value: 'gemini', checked: false },
          { name: 'Todas as acima', value: 'all', checked: false },
        ],
      },
    ]);

    // 5. Confirmar sobrescrita
    const { overwriteExisting } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwriteExisting',
        message: 'Deseja sobrescrever arquivos existentes (se houver)?',
        default: false,
      },
    ]);

    // Configurações finais
    const options: CliOptions = {
      targetDirectory: process.cwd(),
      language,
      testTypes,
      aiPlatforms: aiPlatforms.includes('all') ? ['cursor', 'claude', 'copilot', 'gemini'] : aiPlatforms,
      overwriteExisting,
    };

    // Mostrar resumo
    console.log(chalk.cyan('\n📋 Resumo das configurações:\n'));
    console.log(chalk.white(`  Diretório: ${chalk.yellow(options.targetDirectory)}`));
    console.log(chalk.white(`  Idioma: ${chalk.yellow(language)}`));
    console.log(chalk.white(`  Tipos de teste: ${chalk.yellow(testTypes.join(', '))}`));
    console.log(chalk.white(`  Plataformas de IA: ${chalk.yellow(options.aiPlatforms.join(', '))}`));
    console.log(chalk.white(`  Sobrescrever existentes: ${chalk.yellow(overwriteExisting ? 'Sim' : 'Não')}\n`));

    const { confirmInstall } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmInstall',
        message: 'Confirmar e iniciar instalação?',
        default: true,
      },
    ]);

    if (!confirmInstall) {
      console.log(chalk.yellow('\n⚠️  Instalação cancelada.\n'));
      process.exit(0);
    }

    // Executar a cópia dos templates
    console.log(chalk.cyan('\n⏳ Gerando arquivos...\n'));
    await copyTemplates(options);

    displaySuccessMessage(options);
  } catch (error) {
    if ((error as any).isTtyError) {
      console.error(chalk.red('❌ Este ambiente não suporta CLI interativo.'));
    } else {
      console.error(chalk.red('❌ Erro inesperado:'), error);
    }
    process.exit(1);
  }
}

