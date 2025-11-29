# 🤖 Configuração do Claude Code

## O que mudou?

Anteriormente, Claude Code e GitHub Copilot compartilhavam o mesmo arquivo de configuração (`.github/copilot-instructions.md`). Agora, cada IA tem seu próprio arquivo de configuração dedicado.

## Arquivos de Configuração por IA

### Cursor AI
**Arquivo**: `.cursorrules`
**Localização**: Raiz do projeto
**Selecionado por padrão**: ✅ Sim

### Claude Code (Anthropic)
**Arquivo**: `claude-instructions.md`
**Localização**: Raiz do projeto
**Selecionado por padrão**: ✅ Sim

### GitHub Copilot
**Arquivo**: `copilot-instructions.md`
**Localização**: `.github/` (diretório)
**Selecionado por padrão**: ❌ Não

### Google Gemini
**Arquivo**: `.gemini-context.md`
**Localização**: Raiz do projeto
**Selecionado por padrão**: ❌ Não

## Mudanças Técnicas

### 1. Separação de Arquivos

**Antes:**
```typescript
// Claude e Copilot compartilhavam o mesmo arquivo
if (aiPlatforms.includes('copilot') || aiPlatforms.includes('claude')) {
  // Criava apenas .github/copilot-instructions.md
}
```

**Depois:**
```typescript
// Copilot - arquivo próprio
if (aiPlatforms.includes('copilot')) {
  // Cria .github/copilot-instructions.md
}

// Claude - arquivo próprio
if (aiPlatforms.includes('claude')) {
  // Cria claude-instructions.md
}
```

### 2. Templates Específicos

Cada IA agora tem um template dedicado com instruções específicas:

**Claude Instructions** (`claude-instructions.md`):
- Instruções detalhadas em múltiplos idiomas (PT, EN, ES)
- Ordem de prioridade clara (.ai/custom/ → .ai/standards/ → etc)
- Guidelines para geração de código
- Guidelines para geração de testes
- Foco em qualidade e segurança

**Copilot Instructions** (`.github/copilot-instructions.md`):
- Mantém formato compatível com GitHub
- Instruções focadas em padrões
- Simplicidade e clareza

### 3. Seleção por Padrão

Os valores padrão ao executar a CLI agora são:
- ✅ **Cursor AI** - checked: true
- ✅ **Claude Code** - checked: true
- ❌ **GitHub Copilot** - checked: false
- ❌ **Google Gemini** - checked: false

## Como Usar

### 1. Executar a CLI

```bash
npx ai-test-context-standards
```

### 2. Selecionar IAs

Ao chegar na etapa de seleção de IAs:

```
? Selecione as plataformas de IA que você utiliza:
  ◉ Cursor AI
  ◉ Claude Code (Anthropic)
  ◯ GitHub Copilot
  ◯ Google Gemini
  ◯ Todas as acima
```

**Por padrão**, Cursor e Claude já vêm selecionados (marcados com ◉).

### 3. Arquivos Gerados

Dependendo da sua seleção:

**Se selecionou Claude:**
```
seu-projeto/
├── claude-instructions.md    ← Novo arquivo!
└── .ai/
    └── ...
```

**Se selecionou Copilot:**
```
seu-projeto/
├── .github/
│   └── copilot-instructions.md
└── .ai/
    └── ...
```

## Vantagens da Separação

### 1. **Clareza**
Cada IA tem instruções específicas sem confusão

### 2. **Flexibilidade**
Você pode selecionar apenas as IAs que usa

### 3. **Manutenção**
Mais fácil atualizar instruções específicas de cada IA

### 4. **Organização**
```
.
├── .cursorrules                 # Cursor
├── claude-instructions.md       # Claude
├── .github/
│   └── copilot-instructions.md  # Copilot
└── .gemini-context.md           # Gemini
```

## Conteúdo do claude-instructions.md

O arquivo gerado contém:

### 🎯 Ordem de Prioridade
1. Customizações (`.ai/custom/`)
2. Padrões (`.ai/standards/`)
3. Padrões de teste (`.ai/test-patterns/`)
4. Heurísticas (`.ai/heuristics/`)

### 💻 Ao Gerar Código
- Convenções de nomenclatura
- Padrões arquiteturais
- Melhores práticas
- Consistência com código existente

### 🧪 Ao Gerar Testes
- Padrões apropriados de teste
- Heurísticas de QA
- Padrão AAA
- Happy path + edge cases + error cases
- Cobertura significativa

### ✨ Qualidade de Código
- Código limpo e manutenível
- TypeScript type safety
- Tratamento de erros
- Auto-documentação
- Comentários quando necessário

### 🔒 Segurança
- Validação de inputs
- Sem secrets no código
- Variáveis de ambiente
- Sanitização de dados
- OWASP guidelines

## Multi-idioma

O arquivo é gerado no idioma que você selecionou:

- **Português (pt-BR)**: Instruções completas em português
- **English (en-US)**: Full instructions in English
- **Español (es-ES)**: Instrucciones completas en español

## Exemplo de Uso com Claude

Depois de gerar o arquivo, você pode referenciar explicitamente:

```
Prompt: "Siga as instruções em claude-instructions.md e 
crie testes unitários para UserService seguindo os padrões 
definidos em .ai/test-patterns/unit.md"
```

Ou Claude lerá automaticamente o arquivo se estiver configurado para isso.

## Migração de Projetos Antigos

Se você já tinha usado a versão anterior e quer migrar:

### 1. Re-executar a CLI

```bash
cd seu-projeto
npx ai-test-context-standards
```

### 2. Selecionar Claude

Certifique-se de marcar "Claude Code (Anthropic)"

### 3. Confirmar Sobrescrita

```
? Deseja sobrescrever arquivos existentes (se houver)? Yes
```

### 4. Verificar Arquivos

Agora você terá:
- ✅ `claude-instructions.md` (novo!)
- ✅ `.github/copilot-instructions.md` (se selecionou Copilot)

## Troubleshooting

### Arquivo não foi criado

**Problema**: Executei a CLI mas o `claude-instructions.md` não foi criado.

**Solução**:
1. Verifique se selecionou "Claude Code (Anthropic)" na CLI
2. Verifique se não cancelou a operação
3. Execute novamente e confirme a instalação

### Ainda criando arquivo antigo

**Problema**: Está criando `.github/copilot-instructions.md` para Claude.

**Solução**:
1. Atualize o pacote: `npm install -g ai-test-context-standards@latest`
2. Ou execute com npx para garantir versão mais recente: `npx ai-test-context-standards@latest`

### Copilot sendo selecionado automaticamente

**Problema**: GitHub Copilot vem selecionado por padrão.

**Solução**:
- Na versão atualizada, Copilot vem **desmarcado** por padrão
- Apenas Cursor e Claude vêm pré-selecionados
- Você pode marcar/desmarcar conforme necessário usando ↑↓ e SPACE

## Próximos Passos

1. ✅ Execute a CLI: `npx ai-test-context-standards`
2. ✅ Selecione Claude Code
3. ✅ Verifique o arquivo `claude-instructions.md` gerado
4. ✅ Revise e customize se necessário
5. ✅ Commit no git
6. ✅ Use Claude com contexto dos padrões!

---

**Dúvidas?** Abra uma [issue no GitHub](https://github.com/qajonatasmartins/ai-test-context-standards/issues)

