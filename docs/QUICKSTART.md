# 🚀 Quickstart Guide

## Uso Básico

### 1. Executar (Mais Simples)

```bash
cd seu-projeto
npx ai-test-context-standards
```

### 2. Seguir o Assistente Interativo

```
🚀 Bem-vindo ao AI Test Context Standards!

Os arquivos serão adicionados ao diretório: /seu/projeto
✓ Confirmar? (Y/n) 

? Escolha o idioma:
  ❯ 🇧🇷 Português (Brasil)
    🇺🇸 English (US)
    🇪🇸 Español

? Tipos de teste:
  ❯ ◉ Testes Unitários
    ◉ Testes de Integração
    ◉ Testes E2E
    ◯ Testes de API
    ◯ Testes de Performance

? Plataformas de IA:
  ❯ ◉ Cursor AI
    ◉ Claude Code
    ◉ GitHub Copilot
    ◯ Google Gemini

✓ Confirmar e iniciar instalação? (Y/n)
```

### 3. Pronto! 🎉

Os arquivos foram criados em `.ai/` e os arquivos de configuração das IAs foram adicionados.

## Estrutura Criada

```
seu-projeto/
├── .ai/
│   ├── standards/           # Padrões de desenvolvimento
│   ├── test-patterns/       # Padrões de teste
│   ├── heuristics/          # Heurísticas de QA
│   └── custom/              # Suas customizações
├── .cursorrules             # Config Cursor
└── .github/
    └── copilot-instructions.md
```

## Próximos Passos

### 1. Revisar Padrões
```bash
# Abra e revise os padrões gerados
code .ai/
```

### 2. Customizar
```bash
# Crie suas customizações
touch .ai/custom/my-conventions.md
```

### 3. Versionar
```bash
git add .ai/ .cursorrules .github/
git commit -m "chore: add AI context standards"
```

### 4. Usar com IAs

**Cursor:**
```
"Crie testes seguindo .ai/test-patterns/unit.md"
```

**Copilot:**
```
"Implemente seguindo os padrões em .ai/standards/"
```

## Exemplos de Uso

### Gerar Teste Unitário
```
Prompt: "Crie testes unitários para UserService.createUser() 
seguindo .ai/test-patterns/unit.md. Inclua happy path, 
edge cases (email inválido, duplicado) e mock do repository."
```

### Gerar Componente React
```
Prompt: "Crie componente LoginForm seguindo 
.ai/standards/coding-standards.md e 
.ai/standards/best-practices.md"
```

### Refatorar Código
```
Prompt: "Refatore este código aplicando Clean Code e 
SOLID principles de .ai/standards/best-practices.md"
```

## Dicas

✅ **Faça**: Referencie arquivos específicos ao pedir código  
✅ **Faça**: Customize em `.ai/custom/` conforme necessário  
✅ **Faça**: Versione os padrões no git  
✅ **Faça**: Revise e atualize periodicamente  

❌ **Evite**: Modificar arquivos em `.ai/standards/` diretamente  
❌ **Evite**: Ignorar os padrões depois de criá-los  
❌ **Evite**: Criar padrões que ninguém vai seguir  

## Troubleshooting

**IAs não seguem os padrões?**
- Referencie o arquivo específico no prompt
- Para Cursor: verifique se `.cursorrules` existe
- Para Copilot: verifique `.github/copilot-instructions.md`

**Erro durante execução?**
- Verifique versão Node.js (14+)
- Tente com `sudo` se necessário
- Abra uma issue no GitHub

## Recursos

- 📖 [Documentação Completa](../README.md)
- 📚 [Guia de Uso Detalhado](../USAGE.md)
- 🤝 [Como Contribuir](../CONTRIBUTING.md)
- 🐛 [Reportar Bug](https://github.com/qajonatasmartins/ai-test-context-standards/issues)

---

**Dúvidas?** Abra uma issue! 🚀

