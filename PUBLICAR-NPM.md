# 📦 Como Publicar no NPM

## Pré-requisitos

1. **Conta no NPM**
   ```bash
   npm login
   ```

2. **Verificar se o nome está disponível**
   ```bash
   npm search ai-test-context-standards
   ```

## Checklist Antes de Publicar

- [x] Código compilado (dist/)
- [x] package.json configurado
- [x] README.md atualizado
- [x] Licença definida (ISC)
- [x] .gitignore configurado
- [x] Testes validados
- [ ] Versão definida (ajustar se necessário)
- [ ] CHANGELOG.md criado (opcional mas recomendado)

## Passos para Publicar

### 1. Atualizar Versão (Semver)

```bash
# Patch (1.0.0 -> 1.0.1) - Bug fixes
npm version patch

# Minor (1.0.0 -> 1.1.0) - New features
npm version minor

# Major (1.0.0 -> 2.0.0) - Breaking changes
npm version major
```

### 2. Build Final

```bash
npm run build
```

### 3. Testar Localmente (Importante!)

```bash
# Criar link local
npm link

# Em outro projeto, testar
cd /tmp/test-project
npm link ai-test-context-standards
npx ai-test-standards init

# Verificar se funciona corretamente
```

### 4. Verificar Arquivos que Serão Publicados

```bash
npm pack --dry-run
```

Ou criar um tarball para inspecionar:

```bash
npm pack
tar -xzf ai-test-context-standards-1.0.0.tgz
ls -la package/
rm -rf package/ ai-test-context-standards-1.0.0.tgz
```

### 5. Publicar

```bash
npm publish
```

Se o nome estiver ocupado, você pode usar um scope:

```bash
npm publish --access public
```

### 6. Verificar Publicação

```bash
npm info ai-test-context-standards
```

## Após Publicação

### 1. Criar Tag no Git

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 2. Criar Release no GitHub

1. Ir para GitHub > Releases
2. Criar novo release
3. Adicionar changelog
4. Publicar

### 3. Testar Instalação

```bash
cd /tmp/new-project
npx ai-test-context-standards init
```

## Atualizações Futuras

### Workflow de Atualização

```bash
# 1. Fazer alterações no código
# 2. Testar localmente
npm run build
npm link
cd /tmp/test && npx ai-test-context-standards init

# 3. Atualizar versão
npm version patch  # ou minor/major

# 4. Publicar
npm publish

# 5. Criar tag
git tag v1.0.1
git push origin v1.0.1
```

## Configurações Recomendadas no package.json

```json
{
  "name": "ai-test-context-standards",
  "version": "1.0.0",
  "description": "A CLI that injects optimized QA patterns and test context to guide AIs in generating automated tests.",
  "main": "dist/index.js",
  "bin": {
    "ai-test-standards": "./dist/index.js"
  },
  "files": [
    "dist/",
    "templates/",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "ai",
    "testing",
    "qa",
    "automation",
    "test-patterns",
    "heuristics",
    "cli",
    "cursor",
    "claude",
    "copilot",
    "gemini",
    "typescript"
  ],
  "repository": {
    "type": "git",
    "url": "git+https://github.com/qajonatasmartins/ai-test-context-standards.git"
  },
  "bugs": {
    "url": "https://github.com/qajonatasmartins/ai-test-context-standards/issues"
  },
  "homepage": "https://github.com/qajonatasmartins/ai-test-context-standards#readme",
  "author": "qajonatasmartins",
  "license": "ISC"
}
```

## Badges Recomendadas para README

```markdown
[![npm version](https://badge.fury.io/js/ai-test-context-standards.svg)](https://www.npmjs.com/package/ai-test-context-standards)
[![npm downloads](https://img.shields.io/npm/dm/ai-test-context-standards.svg)](https://www.npmjs.com/package/ai-test-context-standards)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
```

## Troubleshooting

### Erro: "You do not have permission to publish"

```bash
npm whoami  # Verificar se está logado
npm login   # Fazer login novamente
```

### Erro: "Package name already exists"

Opções:
1. Escolher outro nome
2. Usar scoped package: `@seu-username/ai-test-context-standards`

```bash
npm publish --access public
```

### Erro: "Missing required files"

Verificar `.npmignore` ou campo `files` no package.json

## Unpublish (Cuidado!)

❌ **Não recomendado após 72h da publicação**

```bash
npm unpublish ai-test-context-standards@1.0.0
```

**Melhor alternativa**: Publicar versão corrigida

```bash
npm version patch
npm publish
```

## Manutenção

### Deprecar Versão

```bash
npm deprecate ai-test-context-standards@1.0.0 "Please upgrade to 1.0.1"
```

### Transferir Propriedade

```bash
npm owner add <username> ai-test-context-standards
npm owner rm <username> ai-test-context-standards
```

## Recursos

- [NPM Documentation](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)
- [npm publish](https://docs.npmjs.com/cli/v8/commands/npm-publish)

---

**Boa sorte com a publicação! 🚀**

