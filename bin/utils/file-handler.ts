import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { CliOptions } from '../cli';

const TEMPLATE_DIR = path.join(__dirname, '../../templates');

/**
 * Copia os templates para o diretório alvo
 * @param options - As opções da CLI
 * @returns void
 */
export async function copyTemplates(options: CliOptions): Promise<void> {
  const { targetDirectory, language, testTypes, aiPlatforms, overwriteExisting } = options;

  try {
    // Criar estrutura de diretórios para testes
    const aiDir = path.join(targetDirectory, '.ai');
    await fs.ensureDir(aiDir);
    await fs.ensureDir(path.join(aiDir, 'test-patterns'));
    await fs.ensureDir(path.join(aiDir, 'heuristics'));
    await fs.ensureDir(path.join(aiDir, 'techniques', 'black-box'));
    await fs.ensureDir(path.join(aiDir, 'techniques', 'white-box'));
    await fs.ensureDir(path.join(aiDir, 'approaches'));
    await fs.ensureDir(path.join(aiDir, 'commands'));
    await fs.ensureDir(path.join(aiDir, 'custom'));

    // Criar estrutura .claude/commands para Claude Code
    if (aiPlatforms.includes('claude')) {
      await fs.ensureDir(path.join(targetDirectory, '.claude', 'commands'));
    }

    // Copiar padrões de teste baseados na seleção
    await copyTestPatterns(aiDir, language, testTypes, overwriteExisting);

    // Copiar heurísticas (individuais)
    await copyHeuristics(aiDir, language, overwriteExisting);

    // Copiar técnicas Black Box e White Box
    await copyTechniques(aiDir, language, overwriteExisting);

    // Copiar abordagens
    await copyApproaches(aiDir, language, overwriteExisting);

    // Copiar comandos slash
    await copySlashCommands(aiDir, language, overwriteExisting);

    // Copiar comandos para .claude/commands se Claude for selecionado
    if (aiPlatforms.includes('claude')) {
      await copyClaudeCommands(targetDirectory, language, overwriteExisting);
    }

    // Criar arquivos de configuração para IAs
    await createAIConfigFiles(targetDirectory, aiPlatforms, language, overwriteExisting);

    // Criar arquivo README no diretório .ai
    await createReadme(aiDir, language, overwriteExisting);

    // Criar arquivo de customização exemplo
    await createCustomizationExample(aiDir, language, overwriteExisting);

    console.log(chalk.green('✅ Todos os arquivos foram criados com sucesso!'));
  } catch (error) {
    console.error(chalk.red('❌ Erro ao copiar templates:'), error);
    throw error;
  }
}

/**
 * Copia as técnicas de teste (Black Box e White Box) para o diretório .ai
 * @param aiDir - O diretório .ai
 * @param language - O idioma do projeto
 * @param overwrite - Se deve sobrescrever os arquivos existentes
 * @returns void
 */
async function copyTechniques(
  aiDir: string,
  language: string,
  overwrite: boolean
): Promise<void> {
  console.log(chalk.gray(`  Copiando técnicas de teste...`));

  // Black Box techniques
  const blackBoxDir = path.join(aiDir, 'techniques', 'black-box');
  const templateBlackBoxDir = path.join(TEMPLATE_DIR, language, 'techniques', 'black-box');

  if (await fs.pathExists(templateBlackBoxDir)) {
    await fs.copy(templateBlackBoxDir, blackBoxDir, { overwrite });
  }

  // White Box techniques
  const whiteBoxDir = path.join(aiDir, 'techniques', 'white-box');
  const templateWhiteBoxDir = path.join(TEMPLATE_DIR, language, 'techniques', 'white-box');

  if (await fs.pathExists(templateWhiteBoxDir)) {
    await fs.copy(templateWhiteBoxDir, whiteBoxDir, { overwrite });
  }
}

/**
 * Copia as abordagens de teste para o diretório .ai
 * @param aiDir - O diretório .ai
 * @param language - O idioma do projeto
 * @param overwrite - Se deve sobrescrever os arquivos existentes
 * @returns void
 */
async function copyApproaches(
  aiDir: string,
  language: string,
  overwrite: boolean
): Promise<void> {
  const approachesDir = path.join(aiDir, 'approaches');
  const templateApproachesDir = path.join(TEMPLATE_DIR, language, 'approaches');

  console.log(chalk.gray(`  Copiando abordagens de teste...`));

  if (await fs.pathExists(templateApproachesDir)) {
    await fs.copy(templateApproachesDir, approachesDir, { overwrite });
  }
}

/**
 * Copia os comandos slash para o diretório .ai
 * @param aiDir - O diretório .ai
 * @param language - O idioma do projeto
 * @param overwrite - Se deve sobrescrever os arquivos existentes
 * @returns void
 */
async function copySlashCommands(
  aiDir: string,
  language: string,
  overwrite: boolean
): Promise<void> {
  const commandsDir = path.join(aiDir, 'commands');
  const templateCommandsDir = path.join(TEMPLATE_DIR, language, 'commands');

  console.log(chalk.gray(`  Copiando comandos slash...`));

  if (await fs.pathExists(templateCommandsDir)) {
    await fs.copy(templateCommandsDir, commandsDir, { overwrite });
  }
}

/**
 * Copia comandos individuais para .claude/commands/
 * @param targetDirectory - O diretório alvo
 * @param language - O idioma do projeto
 * @param overwrite - Se deve sobrescrever os arquivos existentes
 * @returns void
 */
async function copyClaudeCommands(
  targetDirectory: string,
  language: string,
  overwrite: boolean
): Promise<void> {
  const claudeCommandsDir = path.join(targetDirectory, '.claude', 'commands');

  console.log(chalk.gray(`  Criando comandos Claude Code (.claude/commands/)...`));

  // Criar comandos individuais para cada heurística
  const heuristics = ['sfdipot', 'crud', '0-1-many', 'goldilocks', 'stride', 'owasp-top10'];
  for (const heuristic of heuristics) {
    const commandFile = path.join(claudeCommandsDir, `heuristica-${heuristic}.md`);
    if (overwrite || !(await fs.pathExists(commandFile))) {
      await fs.writeFile(commandFile, getClaudeHeuristicCommand(heuristic, language), 'utf-8');
    }
  }

  // Criar comandos individuais para cada técnica
  const techniques = [
    'boundary-analysis',
    'equivalence-partitioning',
    'state-transition',
    'statement-coverage',
    'branch-coverage',
    'path-coverage'
  ];
  for (const technique of techniques) {
    const commandFile = path.join(claudeCommandsDir, `tecnica-${technique}.md`);
    if (overwrite || !(await fs.pathExists(commandFile))) {
      await fs.writeFile(commandFile, getClaudeTechniqueCommand(technique, language), 'utf-8');
    }
  }

  // Criar comandos individuais para cada abordagem
  const approaches = ['exploratory', 'pairwise', 'property-based'];
  for (const approach of approaches) {
    const commandFile = path.join(claudeCommandsDir, `abordagem-${approach}.md`);
    if (overwrite || !(await fs.pathExists(commandFile))) {
      await fs.writeFile(commandFile, getClaudeApproachCommand(approach, language), 'utf-8');
    }
  }
}

/**
 * Copia os arquivos de padrões de teste para o diretório .ai
 * @param aiDir - O diretório .ai
 * @param language - O idioma do projeto
 * @param testTypes - Os tipos de teste
 * @param overwrite - Se deve sobrescrever os arquivos existentes
 * @returns void
 */
async function copyTestPatterns(
  aiDir: string,
  language: string,
  testTypes: string[],
  overwrite: boolean
): Promise<void> {
  const testPatternsDir = path.join(aiDir, 'test-patterns');

  console.log(chalk.gray(`  Copiando padrões de teste...`));

  for (const testType of testTypes) {
    const templateTestFile = path.join(TEMPLATE_DIR, language, 'test-patterns', `${testType}.md`);
    const targetTestFile = path.join(testPatternsDir, `${testType}.md`);

    if (await fs.pathExists(templateTestFile)) {
      await fs.copy(templateTestFile, targetTestFile, { overwrite });
    } else {
      // Criar arquivo padrão se não existir
      await createDefaultTestPattern(targetTestFile, testType, language);
    }
  }
}

/**
 * Copia os arquivos de heurísticas para o diretório .ai
 * @param aiDir - O diretório .ai
 * @param language - O idioma do projeto
 * @param overwrite - Se deve sobrescrever os arquivos existentes
 * @returns void
 */
async function copyHeuristics(
  aiDir: string,
  language: string,
  overwrite: boolean
): Promise<void> {
  const heuristicsDir = path.join(aiDir, 'heuristics');
  const templateHeuristicsDir = path.join(TEMPLATE_DIR, language, 'heuristics');

  console.log(chalk.gray(`  Copiando heurísticas de QA...`));

  if (await fs.pathExists(templateHeuristicsDir)) {
    await fs.copy(templateHeuristicsDir, heuristicsDir, { overwrite });
  }
}

/**
 * Cria os arquivos de configuração para as IAs
 * @param targetDirectory - O diretório alvo
 * @param aiPlatforms - As plataformas de IA
 * @param language - O idioma do projeto
 * @param overwrite - Se deve sobrescrever os arquivos existentes
 * @returns void
 */
async function createAIConfigFiles(
  targetDirectory: string,
  aiPlatforms: string[],
  language: string,
  overwrite: boolean
): Promise<void> {
  console.log(chalk.gray(`  Criando arquivos de configuração para IAs...`));

  // Cursor AI (.cursorrules)
  if (aiPlatforms.includes('cursor')) {
    const cursorRulesFile = path.join(targetDirectory, '.cursorrules');
    if (overwrite || !(await fs.pathExists(cursorRulesFile))) {
      await createCursorRules(cursorRulesFile, language);
    }
  }

  // GitHub Copilot
  if (aiPlatforms.includes('copilot')) {
    const githubDir = path.join(targetDirectory, '.github');
    await fs.ensureDir(githubDir);
    const copilotInstructions = path.join(githubDir, 'copilot-instructions.md');
    if (overwrite || !(await fs.pathExists(copilotInstructions))) {
      await createCopilotInstructions(copilotInstructions, language);
    }
  }

  // Claude Code (claude-instructions.md)
  if (aiPlatforms.includes('claude')) {
    const claudeInstructionsFile = path.join(targetDirectory, 'claude-instructions.md');
    if (overwrite || !(await fs.pathExists(claudeInstructionsFile))) {
      await createClaudeInstructions(claudeInstructionsFile, language);
    }
  }

  // Gemini (usando .gemini-context.md)
  if (aiPlatforms.includes('gemini')) {
    const geminiContextFile = path.join(targetDirectory, '.gemini-context.md');
    if (overwrite || !(await fs.pathExists(geminiContextFile))) {
      await createGeminiContext(geminiContextFile, language);
    }
  }
}

/**
 * Cria o arquivo README.md para o diretório .ai
 * @param aiDir - O diretório .ai
 * @param language - O idioma do projeto
 * @param overwrite - Se deve sobrescrever os arquivos existentes
 * @returns void
 */
async function createReadme(
  aiDir: string,
  language: string,
  overwrite: boolean
): Promise<void> {
  const readmePath = path.join(aiDir, 'README.md');

  if (overwrite || !(await fs.pathExists(readmePath))) {
    const content = getReadmeContent(language);
    await fs.writeFile(readmePath, content, 'utf-8');
  }
}

/**
 * Cria o arquivo de customização exemplo para o diretório .ai
 * @param aiDir - O diretório .ai
 * @param language - O idioma do projeto
 * @param overwrite - Se deve sobrescrever os arquivos existentes
 * @returns void
 */
async function createCustomizationExample(
  aiDir: string,
  language: string,
  overwrite: boolean
): Promise<void> {
  const customDir = path.join(aiDir, 'custom');
  const exampleFile = path.join(customDir, 'override-example.md');

  if (overwrite || !(await fs.pathExists(exampleFile))) {
    const content = getCustomizationExampleContent(language);
    await fs.writeFile(exampleFile, content, 'utf-8');
  }
}


/**
 * Cria os arquivos padrão de padrões de teste para o diretório .ai
 * @param filePath - O caminho do arquivo
 * @param testType - O tipo de teste
 * @param language - O idioma do projeto
 * @returns void
 */
async function createDefaultTestPattern(
  filePath: string,
  testType: string,
  language: string
): Promise<void> {
  const content = getTestPatternTemplate(testType, language);
  await fs.writeFile(filePath, content, 'utf-8');
}


/**
 * Cria o arquivo de configuração para o Cursor AI
 * @param filePath - O caminho do arquivo
 * @param language - O idioma do projeto
 * @returns void
 */
async function createCursorRules(filePath: string, language: string): Promise<void> {
  const content = getCursorRulesTemplate(language);
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Cria o arquivo de configuração para o GitHub Copilot
 * @param filePath - O caminho do arquivo
 * @param language - O idioma do projeto
 * @returns void
 */
async function createCopilotInstructions(filePath: string, language: string): Promise<void> {
  const content = getCopilotInstructionsTemplate(language);
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Cria o arquivo de configuração para o Claude Code
 * @param filePath - O caminho do arquivo
 * @param language - O idioma do projeto
 * @returns void
 */
async function createClaudeInstructions(filePath: string, language: string): Promise<void> {
  const content = getClaudeInstructionsTemplate(language);
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Cria o arquivo de configuração para o Google Gemini
 * @param filePath - O caminho do arquivo
 * @param language - O idioma do projeto
 * @returns void
 */
async function createGeminiContext(filePath: string, language: string): Promise<void> {
  const content = getGeminiContextTemplate(language);
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Obtém o conteúdo do arquivo README.md
 * @param language - O idioma do projeto
 * @returns string - O conteúdo do arquivo README.md
 */
function getReadmeContent(language: string): string {
  const translations = {
    'pt-BR': {
      title: '# 🧪 AI Test Context Standards',
      description: 'Este diretório contém padrões, heurísticas, técnicas e abordagens de teste para guiar IAs na geração de testes de qualidade.',
      structure: '## Estrutura',
      testPatterns: '- **test-patterns/**: Padrões específicos para cada tipo de teste (unit, integration, e2e, api)',
      heuristics: '- **heuristics/**: Heurísticas de QA (SFDIPOT, CRUD, 0-1-Many, Goldilocks, STRIDE, OWASP)',
      techniques: '- **techniques/**: Técnicas de teste Black Box e White Box',
      approaches: '- **approaches/**: Abordagens de teste (Exploratory, Pairwise, Property-Based)',
      commands: '- **commands/**: Comandos slash para invocar contextos específicos',
      custom: '- **custom/**: Suas customizações e sobrescritas',
      usage: '## Como Usar',
      usageText: 'As IAs compatíveis lerão automaticamente estes padrões. Use comandos slash (ex: `/heuristica sfdipot`) para invocar contextos específicos.',
      slashCommands: '## Comandos Slash',
      slashExample: '- `/heuristica [nome]` - Aplica uma heurística específica\n- `/tecnica [nome]` - Aplica uma técnica de teste\n- `/abordagem [nome]` - Usa uma abordagem de teste',
    },
    'en-US': {
      title: '# 🧪 AI Test Context Standards',
      description: 'This directory contains testing patterns, heuristics, techniques and approaches to guide AIs in generating quality tests.',
      structure: '## Structure',
      testPatterns: '- **test-patterns/**: Specific patterns for each test type (unit, integration, e2e, api)',
      heuristics: '- **heuristics/**: QA heuristics (SFDIPOT, CRUD, 0-1-Many, Goldilocks, STRIDE, OWASP)',
      techniques: '- **techniques/**: Black Box and White Box testing techniques',
      approaches: '- **approaches/**: Testing approaches (Exploratory, Pairwise, Property-Based)',
      commands: '- **commands/**: Slash commands to invoke specific contexts',
      custom: '- **custom/**: Your customizations and overrides',
      usage: '## How to Use',
      usageText: 'Compatible AIs will automatically read these patterns. Use slash commands (e.g.: `/heuristic sfdipot`) to invoke specific contexts.',
      slashCommands: '## Slash Commands',
      slashExample: '- `/heuristic [name]` - Apply a specific heuristic\n- `/technique [name]` - Apply a testing technique\n- `/approach [name]` - Use a testing approach',
    },
    'es-ES': {
      title: '# 🧪 AI Test Context Standards',
      description: 'Este directorio contiene patrones, heurísticas, técnicas y enfoques de prueba para guiar IAs en la generación de pruebas de calidad.',
      structure: '## Estructura',
      testPatterns: '- **test-patterns/**: Patrones específicos para cada tipo de prueba (unit, integration, e2e, api)',
      heuristics: '- **heuristics/**: Heurísticas de QA (SFDIPOT, CRUD, 0-1-Many, Goldilocks, STRIDE, OWASP)',
      techniques: '- **techniques/**: Técnicas de prueba Black Box y White Box',
      approaches: '- **approaches/**: Enfoques de prueba (Exploratory, Pairwise, Property-Based)',
      commands: '- **commands/**: Comandos slash para invocar contextos específicos',
      custom: '- **custom/**: Sus personalizaciones y sobrescrituras',
      usage: '## Cómo Usar',
      usageText: 'Las IAs compatibles leerán automáticamente estos patrones. Use comandos slash (ej: `/heuristica sfdipot`) para invocar contextos específicos.',
      slashCommands: '## Comandos Slash',
      slashExample: '- `/heuristica [nombre]` - Aplica una heurística específica\n- `/tecnica [nombre]` - Aplica una técnica de prueba\n- `/enfoque [nombre]` - Usa un enfoque de prueba',
    },
  };

  const t = translations[language as keyof typeof translations] || translations['en-US'];

  return `${t.title}

${t.description}

${t.structure}

${t.testPatterns}
${t.heuristics}
${t.techniques}
${t.approaches}
${t.commands}
${t.custom}

${t.usage}

${t.usageText}

${t.slashCommands}

${t.slashExample}
`;
}

/**
 * Obtém o conteúdo do arquivo de customização exemplo
 * @param language - O idioma do projeto
 * @returns string - O conteúdo do arquivo de customização exemplo
 */
function getCustomizationExampleContent(language: string): string {
  const translations = {
    'pt-BR': `# Exemplo de Customização

Este arquivo demonstra como você pode sobrescrever os padrões base.

## Como Funciona

1. Crie um arquivo neste diretório com o mesmo nome do padrão que deseja sobrescrever
2. As IAs priorizarão suas customizações sobre os padrões base
3. Você pode manter referências aos padrões originais e apenas adicionar suas regras específicas

## Exemplo: Sobrescrevendo Padrões de Nomenclatura

\`\`\`markdown
# Meus Padrões de Nomenclatura

- Variáveis: camelCase
- Constantes: UPPER_SNAKE_CASE
- Funções privadas: _prefixoComUnderscore
- Componentes React: PascalCase
\`\`\`

## Exemplo: Adicionando Regras de Teste Específicas

\`\`\`markdown
# Regras Adicionais de Teste

- Sempre mockar chamadas de API externa
- Usar dados de teste realistas (não "foo", "bar")
- Cobrir casos de erro além dos casos de sucesso
\`\`\`
`,
    'en-US': `# Customization Example

This file demonstrates how you can override base standards.

## How It Works

1. Create a file in this directory with the same name as the standard you want to override
2. AIs will prioritize your customizations over base standards
3. You can keep references to original standards and just add your specific rules

## Example: Overriding Naming Conventions

\`\`\`markdown
# My Naming Conventions

- Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Private functions: _underscorePrefix
- React Components: PascalCase
\`\`\`

## Example: Adding Specific Test Rules

\`\`\`markdown
# Additional Test Rules

- Always mock external API calls
- Use realistic test data (not "foo", "bar")
- Cover error cases beyond success cases
\`\`\`
`,
    'es-ES': `# Ejemplo de Personalización

Este archivo demuestra cómo puede sobrescribir los estándares base.

## Cómo Funciona

1. Cree un archivo en este directorio con el mismo nombre del estándar que desea sobrescribir
2. Las IAs priorizarán sus personalizaciones sobre los estándares base
3. Puede mantener referencias a los estándares originales y solo agregar sus reglas específicas

## Ejemplo: Sobrescribiendo Convenciones de Nomenclatura

\`\`\`markdown
# Mis Convenciones de Nomenclatura

- Variables: camelCase
- Constantes: UPPER_SNAKE_CASE
- Funciones privadas: _prefijoConGuionBajo
- Componentes React: PascalCase
\`\`\`

## Ejemplo: Agregando Reglas de Prueba Específicas

\`\`\`markdown
# Reglas Adicionales de Prueba

- Siempre simular llamadas de API externa
- Usar datos de prueba realistas (no "foo", "bar")
- Cubrir casos de error además de casos de éxito
\`\`\`
`,
  };

  return translations[language as keyof typeof translations] || translations['en-US'];
}

/**
 * Obtém o conteúdo do arquivo de padrões de teste
 * @param testType - O tipo de teste
 * @param language - O idioma do projeto
 * @returns string - O conteúdo do arquivo de padrões de teste
 */
function getTestPatternTemplate(testType: string, language: string): string {
  return `# ${testType} Test Patterns\n\nPadrões de teste ${testType} para ${language}`;
}

/**
 * Gera comando Claude para heurística
 * @param heuristic - Nome da heurística
 * @param language - Idioma
 * @returns Conteúdo do comando
 */
function getClaudeHeuristicCommand(heuristic: string, language: string): string {
  const translations: Record<string, Record<string, string>> = {
    'pt-BR': {
      'sfdipot': 'SFDIPOT - Structure, Function, Data, Interface, Platform, Operation, Time',
      'crud': 'CRUD - Create, Read, Update, Delete',
      '0-1-many': '0-1-Many - Zero, One, Many (boundary testing)',
      'goldilocks': 'Goldilocks - Too little, Just right, Too much',
      'stride': 'STRIDE - Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege',
      'owasp-top10': 'OWASP Top 10 - Security vulnerabilities'
    }
  };

  const desc = translations[language]?.[heuristic] || heuristic;

  return `# Heurística: ${desc}

Leia o arquivo completo em \`.ai/heuristics/${heuristic}.md\` e aplique essa heurística aos testes.

## Contexto
Esta heurística está sendo invocada via comando slash para guiar a geração de testes.

## Ação
1. Leia o conteúdo completo de \`.ai/heuristics/${heuristic}.md\`
2. Aplique os conceitos e exemplos aos testes que você vai gerar
3. Siga o checklist fornecido no arquivo
4. Use os exemplos como referência

## Prioridade
Esta heurística tem prioridade sobre padrões genéricos. Use-a como guia principal para os testes solicitados.
`;
}

/**
 * Gera comando Claude para técnica
 * @param technique - Nome da técnica
 * @param language - Idioma
 * @returns Conteúdo do comando
 */
function getClaudeTechniqueCommand(technique: string, language: string): string {
  const isBlackBox = ['boundary-analysis', 'equivalence-partitioning', 'state-transition'].includes(technique);
  const type = isBlackBox ? 'black-box' : 'white-box';

  return `# Técnica: ${technique}

Leia o arquivo completo em \`.ai/techniques/${type}/${technique}.md\` e aplique essa técnica aos testes.

## Contexto
Esta técnica de teste ${type} está sendo invocada via comando slash.

## Ação
1. Leia o conteúdo completo de \`.ai/techniques/${type}/${technique}.md\`
2. Aplique a técnica aos testes que você vai gerar
3. Siga os exemplos e padrões fornecidos
4. Use o checklist para garantir cobertura completa

## Prioridade
Esta técnica tem prioridade sobre abordagens genéricas. Use-a como metodologia principal para os testes solicitados.
`;
}

/**
 * Gera comando Claude para abordagem
 * @param approach - Nome da abordagem
 * @param language - Idioma
 * @returns Conteúdo do comando
 */
function getClaudeApproachCommand(approach: string, language: string): string {
  const translations: Record<string, Record<string, string>> = {
    'pt-BR': {
      'exploratory': 'Teste Exploratório - Descobrir bugs não óbvios',
      'pairwise': 'Pairwise Testing - Reduzir combinações de teste',
      'property-based': 'Property-Based Testing - Testar propriedades matemáticas'
    }
  };

  const desc = translations[language]?.[approach] || approach;

  return `# Abordagem: ${desc}

Leia o arquivo completo em \`.ai/approaches/${approach}.md\` e use essa abordagem para os testes.

## Contexto
Esta abordagem de teste está sendo invocada via comando slash.

## Ação
1. Leia o conteúdo completo de \`.ai/approaches/${approach}.md\`
2. Aplique a abordagem aos testes que você vai gerar
3. Siga os exemplos práticos fornecidos
4. Use as estratégias e templates do arquivo

## Prioridade
Esta abordagem tem prioridade sobre métodos genéricos. Use-a como estratégia principal para os testes solicitados.
`;
}

/**
 * Obtém o conteúdo do arquivo de configuração para o Cursor AI
 * @param language - O idioma do projeto
 * @returns string - O conteúdo do arquivo de configuração para o Cursor AI
 */
function getCursorRulesTemplate(language: string): string {
  return `# Cursor AI Rules - Test Context Standards

Leia e siga os padrões de teste definidos em .ai/

## Prioridades
1. Consulte .ai/custom/ primeiro (customizações do projeto)
2. Depois consulte .ai/test-patterns/ para padrões de cada tipo de teste
3. Use .ai/heuristics/ para guiar decisões de teste
4. Aplique .ai/techniques/ (black-box/white-box) quando apropriado
5. Considere .ai/approaches/ para estratégias de teste

## Ao Gerar Testes
- Siga os padrões em .ai/test-patterns/ (unit, integration, e2e, api)
- Aplique heurísticas de .ai/heuristics/ (SFDIPOT, CRUD, 0-1-Many, etc)
- Use técnicas apropriadas de .ai/techniques/
- Considere abordagens de .ai/approaches/ (exploratory, pairwise, property-based)
- Mantenha consistência com testes existentes

## Comandos Slash
Suporte comandos como:
- /heuristica [nome] - Aplicar heurística específica
- /tecnica [nome] - Aplicar técnica de teste
- /abordagem [nome] - Usar abordagem de teste

Veja .ai/commands/slash-commands.md para detalhes.
`;
}

/**
 * Obtém o conteúdo do arquivo de configuração para o GitHub Copilot
 * @param language - O idioma do projeto
 * @returns string - O conteúdo do arquivo de configuração para o GitHub Copilot
 */
function getCopilotInstructionsTemplate(language: string): string {
  return `# GitHub Copilot Instructions - Test Context Standards

Please follow the testing standards defined in the .ai/ directory.

## Priorities
1. Check .ai/custom/ first (project customizations)
2. Then consult .ai/test-patterns/ for test type patterns
3. Use .ai/heuristics/ to guide testing decisions
4. Apply .ai/techniques/ (black-box/white-box) when appropriate
5. Consider .ai/approaches/ for testing strategies

## When Generating Tests
- Follow patterns in .ai/test-patterns/ (unit, integration, e2e, api)
- Apply heuristics from .ai/heuristics/ (SFDIPOT, CRUD, 0-1-Many, etc)
- Use appropriate techniques from .ai/techniques/
- Consider approaches from .ai/approaches/ (exploratory, pairwise, property-based)
- Maintain consistency with existing tests

## Slash Commands
Support commands like:
- /heuristic [name] - Apply specific heuristic
- /technique [name] - Apply testing technique
- /approach [name] - Use testing approach

See .ai/commands/slash-commands.md for details.
`;
}

/**
 * Obtém o conteúdo do arquivo de configuração para o Google Gemini
 * @param language - O idioma do projeto
 * @returns string - O conteúdo do arquivo de configuração para o Google Gemini
 */
function getGeminiContextTemplate(language: string): string {
  return `# Gemini Context - Test Standards

This project uses AI Test Context Standards. Please read and follow the testing patterns in .ai/ directory.

Key directories:
- .ai/test-patterns/ - Test patterns (unit, integration, e2e, api)
- .ai/heuristics/ - QA heuristics (SFDIPOT, CRUD, 0-1-Many, Goldilocks, STRIDE, OWASP)
- .ai/techniques/ - Testing techniques (black-box, white-box)
- .ai/approaches/ - Testing approaches (exploratory, pairwise, property-based)
- .ai/commands/ - Slash commands to invoke specific contexts
- .ai/custom/ - Project-specific customizations (highest priority)

## Slash Commands
Support commands like:
- /heuristic [name] - Apply specific heuristic
- /technique [name] - Apply testing technique
- /approach [name] - Use testing approach

See .ai/commands/slash-commands.md for details.
`;
}


/**
 * Obtém o conteúdo do arquivo de configuração para o Claude Code
 * @param language - O idioma do projeto
 * @returns string - O conteúdo do arquivo de configuração para o Claude Code
 */
function getClaudeInstructionsTemplate(language: string): string {
  const translations = {
    'pt-BR': {
      title: '# 🧪 Instruções para Claude Code - Test Context Standards',
      intro: 'Leia e siga os padrões de teste definidos no diretório `.ai/`',
      priorities: '## Ordem de Prioridade',
      priority1: '1. **Customizações primeiro**: Consulte `.ai/custom/` para customizações específicas do projeto',
      priority2: '2. **Padrões de teste**: Use `.ai/test-patterns/` (unit, integration, e2e, api)',
      priority3: '3. **Heurísticas**: Aplique `.ai/heuristics/` (SFDIPOT, CRUD, 0-1-Many, Goldilocks, STRIDE, OWASP)',
      priority4: '4. **Técnicas**: Use `.ai/techniques/` (black-box, white-box)',
      priority5: '5. **Abordagens**: Considere `.ai/approaches/` (exploratory, pairwise, property-based)',
      whenTesting: '## Ao Gerar Testes',
      testingRules: [
        '- Siga o padrão apropriado de `.ai/test-patterns/` para o tipo de teste',
        '- Aplique heurísticas de `.ai/heuristics/` para guiar seus testes',
        '- Use técnicas de `.ai/techniques/black-box/` ou `.ai/techniques/white-box/`',
        '- Considere abordagens de `.ai/approaches/` quando apropriado',
        '- Use padrão AAA (Arrange-Act-Assert) ou Given-When-Then',
        '- Inclua happy path, edge cases e casos de erro',
        '- Busque cobertura significativa (não apenas números)',
        '- Escreva testes legíveis e manuteníveis',
      ],
      slashCommands: '## Comandos Slash',
      slashCommandsDesc: 'Os comandos estão disponíveis em `.claude/commands/`:',
      slashExamples: [
        '- `heuristica-sfdipot` - Aplicar heurística SFDIPOT',
        '- `heuristica-crud` - Aplicar heurística CRUD',
        '- `tecnica-boundary-analysis` - Usar análise de fronteira',
        '- `tecnica-statement-coverage` - Garantir cobertura de statements',
        '- `abordagem-exploratory` - Teste exploratório',
        '- `abordagem-pairwise` - Teste combinatório pairwise',
      ],
      slashCommandsNote: 'Os comandos em `.claude/commands/` referenciam os arquivos completos em `.ai/`. Veja `.ai/commands/slash-commands.md` para documentação completa.',
      quality: '## Qualidade dos Testes',
      qualityRules: [
        '- Testes devem ser independentes (não dependem uns dos outros)',
        '- Testes devem ser repetíveis (sempre mesmo resultado)',
        '- Testes devem ser rápidos (feedback rápido)',
        '- Testes devem ser claros (nome descritivo)',
        '- Mocks/stubs apenas quando necessário',
        '- Dados de teste realistas (não "foo", "bar")',
      ],
      examples: '## Exemplos',
      examplesDesc: 'Use os arquivos em `.ai/` como exemplos. Cada arquivo contém exemplos práticos e checklist.',
    },
    'en-US': {
      title: '# 🧪 Claude Code Instructions - Test Context Standards',
      intro: 'Read and follow the testing standards defined in the `.ai/` directory',
      priorities: '## Priority Order',
      priority1: '1. **Custom rules first**: Check `.ai/custom/` for project-specific customizations',
      priority2: '2. **Test patterns**: Use `.ai/test-patterns/` (unit, integration, e2e, api)',
      priority3: '3. **Heuristics**: Apply `.ai/heuristics/` (SFDIPOT, CRUD, 0-1-Many, Goldilocks, STRIDE, OWASP)',
      priority4: '4. **Techniques**: Use `.ai/techniques/` (black-box, white-box)',
      priority5: '5. **Approaches**: Consider `.ai/approaches/` (exploratory, pairwise, property-based)',
      whenTesting: '## When Generating Tests',
      testingRules: [
        '- Follow the appropriate pattern from `.ai/test-patterns/` for the test type',
        '- Apply heuristics from `.ai/heuristics/` to guide your testing',
        '- Use techniques from `.ai/techniques/black-box/` or `.ai/techniques/white-box/`',
        '- Consider approaches from `.ai/approaches/` when appropriate',
        '- Use AAA pattern (Arrange-Act-Assert) or Given-When-Then',
        '- Include happy path, edge cases, and error cases',
        '- Aim for meaningful coverage (not just numbers)',
        '- Write readable and maintainable tests',
      ],
      slashCommands: '## Slash Commands',
      slashCommandsDesc: 'Commands are available in `.claude/commands/`:',
      slashExamples: [
        '- `heuristica-sfdipot` - Apply SFDIPOT heuristic',
        '- `heuristica-crud` - Apply CRUD heuristic',
        '- `tecnica-boundary-analysis` - Use boundary analysis',
        '- `tecnica-statement-coverage` - Ensure statement coverage',
        '- `abordagem-exploratory` - Exploratory testing',
        '- `abordagem-pairwise` - Pairwise combinatorial testing',
      ],
      slashCommandsNote: 'Commands in `.claude/commands/` reference complete files in `.ai/`. See `.ai/commands/slash-commands.md` for full documentation.',
      quality: '## Test Quality',
      qualityRules: [
        '- Tests should be independent (don\'t depend on each other)',
        '- Tests should be repeatable (always same result)',
        '- Tests should be fast (quick feedback)',
        '- Tests should be clear (descriptive name)',
        '- Mocks/stubs only when necessary',
        '- Realistic test data (not "foo", "bar")',
      ],
      examples: '## Examples',
      examplesDesc: 'Use files in `.ai/` as examples. Each file contains practical examples and checklists.',
    },
    'es-ES': {
      title: '# 🧪 Instrucciones para Claude Code - Test Context Standards',
      intro: 'Lea y siga los estándares de prueba definidos en el directorio `.ai/`',
      priorities: '## Orden de Prioridad',
      priority1: '1. **Personalizaciones primero**: Consulte `.ai/custom/` para personalizaciones específicas del proyecto',
      priority2: '2. **Patrones de prueba**: Use `.ai/test-patterns/` (unit, integration, e2e, api)',
      priority3: '3. **Heurísticas**: Aplique `.ai/heuristics/` (SFDIPOT, CRUD, 0-1-Many, Goldilocks, STRIDE, OWASP)',
      priority4: '4. **Técnicas**: Use `.ai/techniques/` (black-box, white-box)',
      priority5: '5. **Enfoques**: Considere `.ai/approaches/` (exploratory, pairwise, property-based)',
      whenTesting: '## Al Generar Pruebas',
      testingRules: [
        '- Siga el patrón apropiado de `.ai/test-patterns/` para el tipo de prueba',
        '- Aplique heurísticas de `.ai/heuristics/` para guiar sus pruebas',
        '- Use técnicas de `.ai/techniques/black-box/` o `.ai/techniques/white-box/`',
        '- Considere enfoques de `.ai/approaches/` cuando sea apropiado',
        '- Use patrón AAA (Arrange-Act-Assert) o Given-When-Then',
        '- Incluya happy path, casos extremos y casos de error',
        '- Busque cobertura significativa (no solo números)',
        '- Escriba pruebas legibles y mantenibles',
      ],
      slashCommands: '## Comandos Slash',
      slashCommandsDesc: 'Los comandos están disponibles en `.claude/commands/`:',
      slashExamples: [
        '- `heuristica-sfdipot` - Aplicar heurística SFDIPOT',
        '- `heuristica-crud` - Aplicar heurística CRUD',
        '- `tecnica-boundary-analysis` - Usar análisis de fronteras',
        '- `tecnica-statement-coverage` - Garantizar cobertura de statements',
        '- `abordagem-exploratory` - Prueba exploratoria',
        '- `abordagem-pairwise` - Prueba combinatoria pairwise',
      ],
      slashCommandsNote: 'Los comandos en `.claude/commands/` referencian archivos completos en `.ai/`. Vea `.ai/commands/slash-commands.md` para documentación completa.',
      quality: '## Calidad de las Pruebas',
      qualityRules: [
        '- Las pruebas deben ser independientes (no dependen unas de otras)',
        '- Las pruebas deben ser repetibles (siempre mismo resultado)',
        '- Las pruebas deben ser rápidas (feedback rápido)',
        '- Las pruebas deben ser claras (nombre descriptivo)',
        '- Mocks/stubs solo cuando sea necesario',
        '- Datos de prueba realistas (no "foo", "bar")',
      ],
      examples: '## Ejemplos',
      examplesDesc: 'Use los archivos en `.ai/` como ejemplos. Cada archivo contiene ejemplos prácticos y checklists.',
    },
  };

  const t = translations[language as keyof typeof translations] || translations['en-US'];

  return `${t.title}

${t.intro}

${t.priorities}

${t.priority1}
${t.priority2}
${t.priority3}
${t.priority4}
${t.priority5}

${t.whenTesting}

${t.testingRules.join('\n')}

${t.slashCommands}

${t.slashCommandsDesc}

${t.slashExamples.join('\n')}

${t.slashCommandsNote}

${t.quality}

${t.qualityRules.join('\n')}

${t.examples}

${t.examplesDesc}

---

**Lembre-se**: Estas regras são diretrizes. Sempre considere o contexto específico e os requisitos da tarefa em questão.
`;
}
