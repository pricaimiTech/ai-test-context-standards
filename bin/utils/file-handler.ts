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
    // Criar estrutura de diretórios
    const aiDir = path.join(targetDirectory, '.ai');
    await fs.ensureDir(aiDir);
    await fs.ensureDir(path.join(aiDir, 'standards'));
    await fs.ensureDir(path.join(aiDir, 'test-patterns'));
    await fs.ensureDir(path.join(aiDir, 'heuristics'));
    await fs.ensureDir(path.join(aiDir, 'custom'));

    // Copiar padrões de desenvolvimento
    await copyStandardsFiles(aiDir, language, overwriteExisting);

    // Copiar padrões de teste baseados na seleção
    await copyTestPatterns(aiDir, language, testTypes, overwriteExisting);

    // Copiar heurísticas
    await copyHeuristics(aiDir, language, overwriteExisting);

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
 * Copia os arquivos de padrões de desenvolvimento para o diretório .ai
 * @param aiDir - O diretório .ai
 * @param language - O idioma do projeto
 * @param overwrite - Se deve sobrescrever os arquivos existentes
 * @returns void
 */
async function copyStandardsFiles(
  aiDir: string,
  language: string,
  overwrite: boolean
): Promise<void> {
  const standardsDir = path.join(aiDir, 'standards');
  const templateStandardsDir = path.join(TEMPLATE_DIR, language, 'standards');

  console.log(chalk.gray(`  Copiando padrões de desenvolvimento (${language})...`));

  // Verificar se o diretório de templates existe
  if (await fs.pathExists(templateStandardsDir)) {
    await fs.copy(templateStandardsDir, standardsDir, { overwrite });
    return
  }

  // Se não existir, criar arquivos padrão
  await createDefaultStandards(standardsDir, language);
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
    return
  }

  await createDefaultHeuristics(heuristicsDir, language);
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
 * Cria os arquivos padrão de padrões de desenvolvimento para o diretório .ai
 * @param dir - O diretório .ai
 * @param language - O idioma do projeto
 * @returns void
 */
async function createDefaultStandards(dir: string, language: string): Promise<void> {
  const files = [
    { name: 'coding-standards.md', content: getCodingStandardsTemplate(language) },
    { name: 'architecture-patterns.md', content: getArchitecturePatternsTemplate(language) },
    { name: 'best-practices.md', content: getBestPracticesTemplate(language) },
  ];

  for (const file of files) {
    await fs.writeFile(path.join(dir, file.name), file.content, 'utf-8');
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
 * Cria os arquivos padrão de heurísticas para o diretório .ai
 * @param dir - O diretório .ai
 * @param language - O idioma do projeto
 * @returns void
 */
async function createDefaultHeuristics(dir: string, language: string): Promise<void> {
  const content = getHeuristicsTemplate(language);
  await fs.writeFile(path.join(dir, 'qa-heuristics.md'), content, 'utf-8');
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
      title: '# 🤖 AI Test Context Standards',
      description: 'Este diretório contém padrões, práticas e contextos de teste para guiar IAs na geração de código de qualidade.',
      structure: '## Estrutura',
      standards: '- **standards/**: Padrões de desenvolvimento e arquitetura',
      testPatterns: '- **test-patterns/**: Padrões específicos para cada tipo de teste',
      heuristics: '- **heuristics/**: Heurísticas de QA e estratégias de teste',
      custom: '- **custom/**: Suas customizações e sobrescritas',
      usage: '## Como Usar',
      usageText: 'As IAs compatíveis lerão automaticamente estes padrões. Você pode customizar qualquer arquivo em `custom/` para sobrescrever os padrões base.',
    },
    'en-US': {
      title: '# 🤖 AI Test Context Standards',
      description: 'This directory contains standards, practices, and test contexts to guide AIs in generating quality code.',
      structure: '## Structure',
      standards: '- **standards/**: Development and architecture standards',
      testPatterns: '- **test-patterns/**: Specific patterns for each test type',
      heuristics: '- **heuristics/**: QA heuristics and test strategies',
      custom: '- **custom/**: Your customizations and overrides',
      usage: '## How to Use',
      usageText: 'Compatible AIs will automatically read these standards. You can customize any file in `custom/` to override base standards.',
    },
    'es-ES': {
      title: '# 🤖 AI Test Context Standards',
      description: 'Este directorio contiene estándares, prácticas y contextos de prueba para guiar IAs en la generación de código de calidad.',
      structure: '## Estructura',
      standards: '- **standards/**: Estándares de desarrollo y arquitectura',
      testPatterns: '- **test-patterns/**: Patrones específicos para cada tipo de prueba',
      heuristics: '- **heuristics/**: Heurísticas de QA y estrategias de prueba',
      custom: '- **custom/**: Sus personalizaciones y sobrescrituras',
      usage: '## Cómo Usar',
      usageText: 'Las IAs compatibles leerán automáticamente estos estándares. Puede personalizar cualquier archivo en `custom/` para sobrescribir los estándares base.',
    },
  };

  const t = translations[language as keyof typeof translations] || translations['en-US'];

  return `${t.title}

${t.description}

${t.structure}

${t.standards}
${t.testPatterns}
${t.heuristics}
${t.custom}

${t.usage}

${t.usageText}
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
 * Obtém o conteúdo do arquivo de padrões de desenvolvimento
 * @param language - O idioma do projeto
 * @returns string - O conteúdo do arquivo de padrões de desenvolvimento
 */
function getCodingStandardsTemplate(language: string): string {
  // Esta função será expandida com templates completos
  return `# Coding Standards\n\nPadrões de codificação para ${language}`;
}

/**
 * Obtém o conteúdo do arquivo de padrões de arquitetura
 * @param language - O idioma do projeto
 * @returns string - O conteúdo do arquivo de padrões de arquitetura
 */
function getArchitecturePatternsTemplate(language: string): string {
  return `# Architecture Patterns\n\nPadrões de arquitetura para ${language}`;
}

/**
 * Obtém o conteúdo do arquivo de melhores práticas
 * @param language - O idioma do projeto
 * @returns string - O conteúdo do arquivo de melhores práticas
 */
function getBestPracticesTemplate(language: string): string {
  return `# Best Practices\n\nMelhores práticas para ${language}`;
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
 * Obtém o conteúdo do arquivo de heurísticas
 * @param language - O idioma do projeto
 * @returns string - O conteúdo do arquivo de heurísticas
 */
function getHeuristicsTemplate(language: string): string {
  return `# QA Heuristics\n\nHeurísticas de QA para ${language}`;
}

/**
 * Obtém o conteúdo do arquivo de configuração para o Cursor AI
 * @param language - O idioma do projeto
 * @returns string - O conteúdo do arquivo de configuração para o Cursor AI
 */
function getCursorRulesTemplate(language: string): string {
  return `# Cursor AI Rules

Leia e siga os padrões definidos em .ai/

## Prioridades
1. Consulte .ai/custom/ primeiro (customizações do projeto)
2. Depois consulte .ai/standards/ e .ai/test-patterns/
3. Use .ai/heuristics/ para guiar decisões de teste

## Ao Gerar Testes
- Siga os padrões em .ai/test-patterns/
- Aplique as heurísticas de .ai/heuristics/
- Mantenha consistência com o código existente
`;
}

/**
 * Obtém o conteúdo do arquivo de configuração para o GitHub Copilot
 * @param language - O idioma do projeto
 * @returns string - O conteúdo do arquivo de configuração para o GitHub Copilot
 */
function getCopilotInstructionsTemplate(language: string): string {
  return `# GitHub Copilot Instructions

Please follow the standards defined in the .ai/ directory.

## Priorities
1. Check .ai/custom/ first (project customizations)
2. Then consult .ai/standards/ and .ai/test-patterns/
3. Use .ai/heuristics/ to guide testing decisions

## When Generating Tests
- Follow patterns in .ai/test-patterns/
- Apply heuristics from .ai/heuristics/
- Maintain consistency with existing code
`;
}

/**
 * Obtém o conteúdo do arquivo de configuração para o Google Gemini
 * @param language - O idioma do projeto
 * @returns string - O conteúdo do arquivo de configuração para o Google Gemini
 */
function getGeminiContextTemplate(language: string): string {
  return `# Gemini Context

This project uses AI Test Context Standards. Please read and follow the patterns in .ai/ directory.

Key directories:
- .ai/standards/ - Development standards
- .ai/test-patterns/ - Test patterns
- .ai/heuristics/ - QA heuristics
- .ai/custom/ - Project-specific customizations (highest priority)
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
      title: '# Instruções para Claude Code',
      intro: 'Leia e siga os padrões definidos no diretório `.ai/`',
      priorities: '## Ordem de Prioridade',
      priority1: '1. **Customizações primeiro**: Consulte `.ai/custom/` para customizações específicas do projeto',
      priority2: '2. **Padrões**: Depois consulte `.ai/standards/` para padrões de codificação e arquitetura',
      priority3: '3. **Padrões de teste**: Use `.ai/test-patterns/` ao gerar testes',
      priority4: '4. **Heurísticas**: Aplique `.ai/heuristics/` para guiar decisões de teste',
      whenCoding: '## Ao Gerar Código',
      codingRules: [
        '- Siga as convenções de nomenclatura de `.ai/standards/coding-standards.md`',
        '- Aplique padrões arquiteturais de `.ai/standards/architecture-patterns.md`',
        '- Use melhores práticas de `.ai/standards/best-practices.md`',
        '- Mantenha consistência com o código existente',
      ],
      whenTesting: '## Ao Gerar Testes',
      testingRules: [
        '- Siga o padrão apropriado de `.ai/test-patterns/`',
        '- Aplique heurísticas de QA de `.ai/heuristics/qa-heuristics.md`',
        '- Use padrão AAA (Arrange-Act-Assert)',
        '- Inclua happy path, edge cases e casos de erro',
        '- Busque cobertura significativa',
      ],
      quality: '## Qualidade de Código',
      qualityRules: [
        '- Escreva código limpo e manutenível',
        '- Use TypeScript para type safety',
        '- Trate erros apropriadamente',
        '- Escreva código auto-documentado',
        '- Adicione comentários apenas quando necessário para explicar "porquê", não "o quê"',
      ],
      security: '## Segurança',
      securityRules: [
        '- Valide todas as entradas',
        '- Nunca exponha secrets no código',
        '- Use variáveis de ambiente para configuração',
        '- Sanitize dados de usuário',
        '- Siga guidelines OWASP',
      ],
    },
    'en-US': {
      title: '# Claude Code Instructions',
      intro: 'Read and follow the standards defined in the `.ai/` directory',
      priorities: '## Priority Order',
      priority1: '1. **Custom rules first**: Check `.ai/custom/` for project-specific customizations',
      priority2: '2. **Standards**: Then consult `.ai/standards/` for coding standards and architecture patterns',
      priority3: '3. **Test patterns**: Use `.ai/test-patterns/` when generating tests',
      priority4: '4. **Heuristics**: Apply `.ai/heuristics/` to guide testing decisions',
      whenCoding: '## When Generating Code',
      codingRules: [
        '- Follow naming conventions from `.ai/standards/coding-standards.md`',
        '- Apply architectural patterns from `.ai/standards/architecture-patterns.md`',
        '- Use best practices from `.ai/standards/best-practices.md`',
        '- Maintain consistency with existing codebase',
      ],
      whenTesting: '## When Generating Tests',
      testingRules: [
        '- Follow the appropriate test pattern from `.ai/test-patterns/`',
        '- Apply QA heuristics from `.ai/heuristics/qa-heuristics.md`',
        '- Use AAA pattern (Arrange-Act-Assert)',
        '- Include happy path, edge cases, and error cases',
        '- Aim for meaningful test coverage',
      ],
      quality: '## Code Quality',
      qualityRules: [
        '- Write clean, maintainable code',
        '- Use TypeScript for type safety',
        '- Handle errors appropriately',
        '- Write self-documenting code',
        '- Add comments only when necessary to explain "why", not "what"',
      ],
      security: '## Security',
      securityRules: [
        '- Validate all inputs',
        '- Never expose secrets in code',
        '- Use environment variables for configuration',
        '- Sanitize user data',
        '- Follow OWASP guidelines',
      ],
    },
    'es-ES': {
      title: '# Instrucciones para Claude Code',
      intro: 'Lea y siga los estándares definidos en el directorio `.ai/`',
      priorities: '## Orden de Prioridad',
      priority1: '1. **Personalizaciones primero**: Consulte `.ai/custom/` para personalizaciones específicas del proyecto',
      priority2: '2. **Estándares**: Luego consulte `.ai/standards/` para estándares de codificación y patrones de arquitectura',
      priority3: '3. **Patrones de prueba**: Use `.ai/test-patterns/` al generar pruebas',
      priority4: '4. **Heurísticas**: Aplique `.ai/heuristics/` para guiar decisiones de prueba',
      whenCoding: '## Al Generar Código',
      codingRules: [
        '- Siga las convenciones de nomenclatura de `.ai/standards/coding-standards.md`',
        '- Aplique patrones arquitecturales de `.ai/standards/architecture-patterns.md`',
        '- Use mejores prácticas de `.ai/standards/best-practices.md`',
        '- Mantenga consistencia con el código existente',
      ],
      whenTesting: '## Al Generar Pruebas',
      testingRules: [
        '- Siga el patrón apropiado de `.ai/test-patterns/`',
        '- Aplique heurísticas de QA de `.ai/heuristics/qa-heuristics.md`',
        '- Use patrón AAA (Arrange-Act-Assert)',
        '- Incluya happy path, casos extremos y casos de error',
        '- Busque cobertura de prueba significativa',
      ],
      quality: '## Calidad del Código',
      qualityRules: [
        '- Escriba código limpio y mantenible',
        '- Use TypeScript para type safety',
        '- Maneje errores apropiadamente',
        '- Escriba código auto-documentado',
        '- Agregue comentarios solo cuando sea necesario para explicar "por qué", no "qué"',
      ],
      security: '## Seguridad',
      securityRules: [
        '- Valide todas las entradas',
        '- Nunca exponga secretos en el código',
        '- Use variables de entorno para configuración',
        '- Sanitice datos de usuario',
        '- Siga las pautas de OWASP',
      ],
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

${t.whenCoding}

${t.codingRules.join('\n')}

${t.whenTesting}

${t.testingRules.join('\n')}

${t.quality}

${t.qualityRules.join('\n')}

${t.security}

${t.securityRules.join('\n')}

---

**Lembre-se**: Estas regras são diretrizes. Sempre considere o contexto específico e os requisitos da tarefa em questão.
`;
}
