# 📖 Guia de Uso - AI Test Context Standards

## Instalação e Execução

### Opção 1: npx (Recomendado)
```bash
# Execute diretamente sem instalação
npx ai-test-context-standards
```

### Opção 2: Instalação Global
```bash
# Instale globalmente
npm install -g ai-test-context-standards

# Execute
ai-test-standards
```

### Opção 3: Instalação Local
```bash
# Instale como dev dependency
npm install --save-dev ai-test-context-standards

# Execute via npm script
npx ai-test-standards
```

## Passo a Passo

### 1. Execute o Comando

```bash
cd seu-projeto
npx ai-test-context-standards
```

### 2. CLI Interativa

A CLI irá guiá-lo através de algumas perguntas:

#### 2.1 Confirmar Diretório
```
Os arquivos serão adicionados ao diretório: /caminho/do/seu/projeto
Confirmar? (Y/n)
```

#### 2.2 Escolher Idioma
```
? Escolha o idioma padrão para os documentos:
  🇧🇷 Português (Brasil)
  🇺🇸 English (US)
  🇪🇸 Español
```

#### 2.3 Selecionar Tipos de Teste
```
? Selecione os tipos de teste que deseja incluir:
  ◉ Testes Unitários (Unit Tests)
  ◉ Testes de Integração (Integration Tests)
  ◉ Testes de Sistema (System/E2E Tests)
  ◯ Testes de API
  ◯ Testes de Performance
```

#### 2.4 Selecionar Plataformas de IA
```
? Selecione as plataformas de IA que você utiliza:
  ◉ Cursor AI
  ◉ Claude Code (Anthropic)
  ◉ GitHub Copilot
  ◯ Google Gemini
  ◯ Todas as acima
```

#### 2.5 Confirmar Sobrescrita
```
? Deseja sobrescrever arquivos existentes (se houver)? (y/N)
```

### 3. Revisão e Confirmação

A CLI mostrará um resumo das configurações:

```
📋 Resumo das configurações:

  Diretório: /caminho/do/seu/projeto
  Idioma: pt-BR
  Tipos de teste: unit, integration, e2e
  Plataformas de IA: cursor, claude, copilot
  Sobrescrever existentes: Não

? Confirmar e iniciar instalação? (Y/n)
```

### 4. Instalação

A CLI criará os arquivos:

```
⏳ Gerando arquivos...

  Copiando padrões de desenvolvimento (pt-BR)...
  Copiando padrões de teste...
  Copiando heurísticas de QA...
  Criando arquivos de configuração para IAs...

✅ Instalação concluída com sucesso!
```

## Estrutura Criada

Após a execução, você terá:

```
seu-projeto/
├── .ai/
│   ├── standards/
│   │   ├── coding-standards.md       # Convenções e padrões
│   │   ├── architecture-patterns.md  # Padrões de arquitetura
│   │   └── best-practices.md         # Melhores práticas
│   ├── test-patterns/
│   │   ├── unit.md                   # Testes unitários
│   │   ├── integration.md            # Testes de integração
│   │   └── e2e.md                    # Testes E2E
│   ├── heuristics/
│   │   └── qa-heuristics.md          # Heurísticas de QA
│   ├── custom/
│   │   └── override-example.md       # Exemplo de customização
│   └── README.md                     # Índice e instruções
├── .cursorrules                      # Config para Cursor AI
├── .github/
│   └── copilot-instructions.md       # Config para Copilot
└── .gemini-context.md                # Config para Gemini
```

## Como as IAs Usam os Padrões

### Cursor AI
O arquivo `.cursorrules` instrui o Cursor a:
1. Ler padrões de `.ai/custom/` primeiro
2. Depois consultar `.ai/standards/` e `.ai/test-patterns/`
3. Aplicar heurísticas de `.ai/heuristics/`

### GitHub Copilot
O arquivo `.github/copilot-instructions.md` fornece contexto sobre:
- Onde encontrar os padrões
- Ordem de prioridade
- Como aplicar ao gerar código

### Claude / Gemini
Arquivos específicos com instruções contextuais para cada IA.

## Customização

### Sobrescrever Padrões

Crie arquivos em `.ai/custom/` para personalizar:

```markdown
<!-- .ai/custom/my-naming-conventions.md -->
# Minhas Convenções de Nomenclatura

Nosso time usa convenções diferentes:

- Variáveis: snake_case (não camelCase)
- Funções privadas: __prefixoDuploUnderscore
- Constantes: mantém UPPER_SNAKE_CASE

As IAs devem seguir estas convenções ao invés das padrões.
```

### Adicionar Novos Padrões

```markdown
<!-- .ai/custom/our-database-conventions.md -->
# Convenções de Banco de Dados

## Nomenclatura de Tabelas
- Sempre plural: `users`, `posts`, `comments`
- Snake_case: `user_profiles`, `post_tags`

## Nomenclatura de Colunas
- Snake_case: `created_at`, `user_id`
- Timestamps: sempre `created_at` e `updated_at`
```

## Atualizando Padrões

Para atualizar ou adicionar novos padrões:

```bash
# Execute novamente
npx ai-test-context-standards

# Escolha sobrescrever quando perguntado
? Deseja sobrescrever arquivos existentes? Yes
```

## Versionamento

Recomendamos versionar os arquivos gerados:

```bash
git add .ai/ .cursorrules .github/copilot-instructions.md
git commit -m "chore: add AI context standards"
git push
```

Assim toda a equipe terá acesso aos mesmos padrões.

## Dicas de Uso

### 1. Para Novos Projetos
Execute logo no início do projeto para estabelecer padrões desde o começo.

### 2. Para Projetos Existentes
- Execute e revise os padrões gerados
- Customize em `.ai/custom/` conforme necessário
- Atualize gradualmente o código existente

### 3. Em Equipe
- Discuta e customize os padrões com a equipe
- Versione as customizações
- Revise periodicamente e atualize conforme necessário

### 4. Com IAs
- Sempre referencie os padrões ao pedir código
- Exemplo: "Crie testes seguindo os padrões em `.ai/test-patterns/unit.md`"
- As IAs aprenderão com o tempo

## Troubleshooting

### A IA não está seguindo os padrões

1. **Cursor**: Verifique se `.cursorrules` está no diretório raiz
2. **Copilot**: Verifique se `.github/copilot-instructions.md` existe
3. **Referência explícita**: Mencione o arquivo específico ao pedir código

### Arquivos não foram criados

1. Verifique permissões do diretório
2. Execute com `sudo` se necessário (não recomendado)
3. Abra uma issue no GitHub

### Erros durante a execução

1. Verifique versão do Node.js (requer Node 14+)
2. Limpe cache: `npm cache clean --force`
3. Reinstale: `npm install -g ai-test-context-standards`

## Exemplos de Uso

### Pedir para IA Gerar Teste
```
"Crie testes unitários para o UserService seguindo os 
padrões definidos em .ai/test-patterns/unit.md. 
Inclua happy path, edge cases e error cases."
```

### Pedir para IA Gerar Código
```
"Implemente o UserRepository seguindo os padrões de 
.ai/standards/architecture-patterns.md, especificamente 
o Repository Pattern."
```

### Pedir Refatoração
```
"Refatore este código seguindo as melhores práticas de 
.ai/standards/best-practices.md, focando em Clean Code 
e SOLID principles."
```

## Recursos Adicionais

- [Documentação completa](https://github.com/qajonatasmartins/ai-test-context-standards)
- [Reportar bug](https://github.com/qajonatasmartins/ai-test-context-standards/issues)
- [Contribuir](CONTRIBUTING.md)

---

**Dúvidas?** Abra uma issue no GitHub!

