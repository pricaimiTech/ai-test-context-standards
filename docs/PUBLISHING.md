# 📦 Guia de Publicação no npm

## Antes de Publicar

### 1. Verificar package.json

Certifique-se de que os campos essenciais estão corretos:

```json
{
  "name": "ai-test-context-standards",
  "version": "1.0.0",
  "description": "A CLI that injects optimized QA patterns...",
  "main": "dist/index.js",
  "bin": {
    "ai-test-standards": "./dist/index.js"
  },
  "keywords": [
    "qa-automation",
    "testing",
    "ai",
    "cursor",
    "copilot"
  ],
  "author": "qajonatasmartins",
  "license": "ISC"
}
```

### 2. Testar Localmente

```bash
# Build
npm run build

# Testar localmente
npm link

# Em outro projeto, testar
cd /outro/projeto
ai-test-standards

# Quando terminar de testar
npm unlink -g ai-test-context-standards
```

### 3. Verificar o que será publicado

```bash
npm pack --dry-run
```

Isso mostrará todos os arquivos que serão incluídos no pacote.

## Publicação

### Primeira Publicação

#### 1. Criar conta no npm

Se ainda não tem conta:
```bash
npm adduser
```

Ou login se já tem conta:
```bash
npm login
```

#### 2. Verificar disponibilidade do nome

```bash
npm search ai-test-context-standards
```

Se o nome já existir, você precisará escolher outro nome no `package.json`.

#### 3. Publicar

```bash
# Build final
npm run build

# Publicar
npm publish
```

### Publicações Subsequentes

#### 1. Atualizar versão

Siga [Semantic Versioning](https://semver.org/):

```bash
# Patch (1.0.0 -> 1.0.1) - Bug fixes
npm version patch

# Minor (1.0.0 -> 1.1.0) - New features (backward compatible)
npm version minor

# Major (1.0.0 -> 2.0.0) - Breaking changes
npm version major
```

#### 2. Atualizar CHANGELOG.md

Documente as mudanças:

```markdown
## [1.1.0] - 2025-12-01

### Added
- Novo idioma: Francês
- Suporte para Python templates

### Fixed
- Correção de bug X
```

#### 3. Commit e Tag

```bash
git add .
git commit -m "chore: release v1.1.0"
git push
git push --tags
```

#### 4. Publicar

```bash
npm run build
npm publish
```

## Automação com GitHub Actions

Crie `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      
      - run: npm ci
      - run: npm run build
      - run: npm test
      
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Para usar:
1. Gere token npm: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Adicione token nos GitHub Secrets como `NPM_TOKEN`
3. Ao criar nova tag, GitHub Actions publicará automaticamente

## Checklist Pré-Publicação

- [ ] Código compilado sem erros (`npm run build`)
- [ ] Testes passando (quando houver: `npm test`)
- [ ] README atualizado
- [ ] CHANGELOG atualizado
- [ ] Versão incrementada corretamente
- [ ] Git tags criadas
- [ ] `.npmignore` configurado (não publicar arquivos desnecessários)
- [ ] Testado localmente com `npm link`
- [ ] Licença adicionada (LICENSE)

## Pós-Publicação

### 1. Verificar no npm

```bash
# Ver informações do pacote
npm view ai-test-context-standards

# Instalar e testar
npx ai-test-context-standards@latest
```

### 2. Criar Release no GitHub

1. Acesse: https://github.com/qajonatasmartins/ai-test-context-standards/releases
2. Clique em "Create a new release"
3. Selecione a tag (v1.0.0)
4. Título: "v1.0.0 - Initial Release"
5. Descrição: Copie do CHANGELOG.md
6. Publish release

### 3. Anunciar

- Tweet sobre o lançamento
- Post no LinkedIn
- Compartilhe em comunidades de QA/Testing
- Reddit (r/QualityAssurance, r/javascript)
- Dev.to article

## Comandos Úteis

```bash
# Ver versão atual
npm version

# Ver informações do pacote
npm view ai-test-context-standards

# Ver downloads
npm view ai-test-context-standards downloads

# Deprecar versão antiga
npm deprecate ai-test-context-standards@1.0.0 "Use version 1.1.0+"

# Despublicar (só nas primeiras 72h)
npm unpublish ai-test-context-standards@1.0.0
```

## Boas Práticas

### Versionamento

- **Patch** (1.0.X): Bug fixes, patches de segurança
- **Minor** (1.X.0): Novas features, não quebram compatibilidade
- **Major** (X.0.0): Breaking changes

### Tags npm

```bash
# Publicar versão beta
npm publish --tag beta

# Instalar versão beta
npm install ai-test-context-standards@beta

# Promover beta para latest
npm dist-tag add ai-test-context-standards@1.1.0-beta.1 latest
```

### Escopo

Se quiser namespace:
```json
{
  "name": "@qajonatasmartins/ai-test-context-standards"
}
```

Para publicar scoped packages públicos:
```bash
npm publish --access public
```

## Troubleshooting

**"You do not have permission to publish"**
- Verifique se está logado: `npm whoami`
- Verifique nome do pacote (pode já existir)

**"Package name too similar to existing package"**
- Escolha nome diferente

**"Missing required field"**
- Verifique package.json (name, version, main, bin)

**Build fails**
- `rm -rf dist node_modules`
- `npm install`
- `npm run build`

## Recursos

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [npm-version](https://docs.npmjs.com/cli/v8/commands/npm-version)

---

**Pronto para publicar?** 🚀

```bash
npm run build
npm publish
```

