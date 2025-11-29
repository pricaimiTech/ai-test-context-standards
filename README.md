# 🤖 AI Test Context Standards

[![npm version](https://img.shields.io/npm/v/ai-test-context-standards.svg)](https://www.npmjs.com/package/ai-test-context-standards)
[![License](https://img.shields.io/npm/l/ai-test-context-standards.svg)](https://github.com/qajonatasmartins/ai-test-context-standards/blob/main/LICENSE)

Uma CLI que injeta padrões de QA otimizados e contexto de testes para guiar IAs (Cursor, Claude, GitHub Copilot, Gemini) na geração de código de qualidade.

A CLI that injects optimized QA patterns and test context to guide AIs (Cursor, Claude, GitHub Copilot, Gemini) in generating quality code.

## ✨ Features

- 🌍 **Multi-idioma**: Português, English, Español
- 🎯 **Padrões de desenvolvimento**: Convenções, arquitetura, melhores práticas
- 🧪 **Padrões de teste**: Unit, Integration, E2E, API, Performance
- 🎲 **Heurísticas de QA**: Técnicas e estratégias de teste
- 🤖 **Compatível com IAs**: Cursor, Claude, Copilot, Gemini
- 🔧 **Customizável**: Sobrescreva padrões conforme necessário
- 📦 **Zero config**: Funciona out-of-the-box

## 🚀 Quickstart

```bash
# Execute com npx (sem instalação)
npx ai-test-context-standards

# Ou instale globalmente
npm install -g ai-test-context-standards
ai-test-standards
```

## 📖 Como Funciona

1. Execute o comando no diretório raiz do seu projeto
2. Escolha o idioma (pt-BR, en-US, es-ES)
3. Selecione tipos de teste (unit, integration, e2e, api, performance)
4. Selecione plataformas de IA que você usa
5. Arquivos serão criados em `.ai/` com padrões e contextos

## 📁 Estrutura Gerada

```
seu-projeto/
├── .ai/
│   ├── standards/
│   │   ├── coding-standards.md
│   │   ├── architecture-patterns.md
│   │   └── best-practices.md
│   ├── test-patterns/
│   │   ├── unit.md
│   │   ├── integration.md
│   │   ├── e2e.md
│   │   ├── api.md
│   │   └── performance.md
│   ├── heuristics/
│   │   └── qa-heuristics.md
│   ├── custom/
│   │   └── override-example.md
│   └── README.md
├── .cursorrules (se selecionou Cursor)
├── claude-instructions.md (se selecionou Claude)
├── .github/
│   └── copilot-instructions.md (se selecionou Copilot)
└── .gemini-context.md (se selecionou Gemini)
```

## 🎨 Customização

Crie arquivos em `.ai/custom/` para sobrescrever padrões base:

```markdown
<!-- .ai/custom/my-naming-conventions.md -->
# Minhas Convenções de Nomenclatura

- Variáveis: snake_case (diferente do padrão)
- Funções: camelCase
- Classes: PascalCase
```

As IAs priorizarão suas customizações sobre os padrões base.

## 🤖 Compatibilidade com IAs

### Cursor AI
Cria `.cursorrules` que instrui o Cursor a ler padrões de `.ai/`

### Claude Code (Anthropic)
Cria `claude-instructions.md` com instruções completas para seguir padrões

### GitHub Copilot
Cria `.github/copilot-instructions.md` com instruções para seguir padrões

### Google Gemini  
Cria `.gemini-context.md` com contexto do projeto

## 📚 Conteúdo dos Padrões

### Coding Standards
- Convenções de nomenclatura
- Estrutura de código
- SOLID principles
- Clean Code practices
- Type Safety (TypeScript)
- Tratamento de erros
- Performance e otimização
- Segurança

### Architecture Patterns
- Repository Pattern
- Service Pattern
- Factory Pattern
- Strategy Pattern
- Dependency Injection
- Clean Architecture
- Component Composition
- Custom Hooks

### Test Patterns

**Unit Tests**: AAA pattern, mocking, parametrização, cobertura

**Integration Tests**: Database, APIs, message queues, file uploads

**E2E Tests**: Page Objects, seletores robustos, Playwright/Cypress

**API Tests**: REST, GraphQL, autenticação, validação, rate limiting

**Performance Tests**: Load, stress, spike testing com k6

### QA Heuristics
- SFDIPOT, FEW HICCUPPS
- Análise de valor limite
- Particionamento de equivalência
- State transition testing
- STRIDE (security)
- OWASP Top 10

## 🛠️ Development

```bash
# Clone o repositório
git clone https://github.com/qajonatasmartins/ai-test-context-standards.git

# Instale dependências
npm install

# Build
npm run build

# Teste localmente
npm run dev
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/amazing`)
3. Commit suas mudanças (`git commit -m 'feat: add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing`)
5. Abra um Pull Request

## 📄 Licença

ISC License - veja [LICENSE](LICENSE)

## 👨‍💻 Autor

**Jônatas Martins** ([@qajonatasmartins](https://github.com/qajonatasmartins))

## 🌟 Apoie o Projeto

Se este projeto te ajudou, considere dar uma ⭐ no GitHub!

---

**Made with ❤️ for the QA community**
