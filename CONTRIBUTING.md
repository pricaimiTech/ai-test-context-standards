# Contribuindo para AI Test Context Standards

Obrigado por considerar contribuir para este projeto! 🎉

## Como Contribuir

### 1. Reportar Bugs

Se você encontrar um bug, por favor abra uma [issue](https://github.com/qajonatasmartins/ai-test-context-standards/issues) com:

- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs. atual
- Versão do Node.js e npm
- Sistema operacional

### 2. Sugerir Melhorias

Sugestões de novas features são bem-vindas! Abra uma issue com:

- Descrição clara da feature
- Por que ela seria útil
- Exemplos de uso

### 3. Adicionar ou Melhorar Templates

Os templates são a parte mais importante deste projeto. Para adicionar ou melhorar:

#### Estrutura de Templates

```
templates/
├── pt-BR/          # Português
│   ├── standards/
│   ├── test-patterns/
│   └── heuristics/
├── en-US/          # Inglês
│   ├── standards/
│   ├── test-patterns/
│   └── heuristics/
└── es-ES/          # Espanhol
    ├── standards/
    ├── test-patterns/
    └── heuristics/
```

#### Guidelines para Templates

**Padrões de Desenvolvimento (standards/)**
- Devem ser práticos e aplicáveis
- Incluir exemplos de código
- Mostrar boas práticas vs. más práticas (✅ vs. ❌)
- Focar em TypeScript/JavaScript (mas princípios aplicáveis a outras linguagens)

**Padrões de Teste (test-patterns/)**
- Incluir exemplos completos e funcionais
- Cobrir happy path, edge cases e error cases
- Mostrar setup e teardown quando relevante
- Incluir métricas e thresholds

**Heurísticas (heuristics/)**
- Explicar o "porquê" por trás de cada heurística
- Dar exemplos práticos
- Citar fontes quando apropriado
- Manter formato consistente

### 4. Adicionar Suporte a Novos Idiomas

Para adicionar um novo idioma:

1. Crie diretório em `templates/[código-idioma]/` (ex: `fr-FR` para francês)
2. Adicione o idioma em `bin/cli.ts` nas opções de seleção
3. Traduza todos os templates mantendo a estrutura
4. Atualize a documentação

### 5. Melhorar a CLI

Código da CLI está em `bin/`:

- `index.ts` - Ponto de entrada
- `cli.ts` - Lógica principal e prompts
- `utils/messages.ts` - Mensagens e formatação
- `utils/file-handler.ts` - Manipulação de arquivos

**Ao contribuir para a CLI:**
- Mantenha a experiência do usuário simples
- Adicione validação apropriada
- Teste em diferentes sistemas operacionais
- Documente mudanças

## Processo de Desenvolvimento

### Setup Local

```bash
# Fork e clone o repositório
git clone https://github.com/SEU-USUARIO/ai-test-context-standards.git
cd ai-test-context-standards

# Instale dependências
npm install

# Build
npm run build

# Teste localmente
npm run dev
```

### Criando um Pull Request

1. **Fork** o repositório
2. **Crie uma branch** para sua feature:
   ```bash
   git checkout -b feature/minha-feature
   ```
3. **Faça suas mudanças** e commit:
   ```bash
   git commit -m "feat: adicionar suporte para Python"
   ```
4. **Push** para seu fork:
   ```bash
   git push origin feature/minha-feature
   ```
5. **Abra um Pull Request** no GitHub

### Convenções de Commit

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adicionar nova funcionalidade
fix: corrigir bug
docs: atualizar documentação
style: formatação (sem mudança de código)
refactor: refatoração de código
test: adicionar ou modificar testes
chore: tarefas de manutenção
```

## Código de Conduta

- Seja respeitoso e construtivo
- Aceite feedback com graça
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros da comunidade

## Dúvidas?

Se tiver dúvidas, abra uma [issue](https://github.com/qajonatasmartins/ai-test-context-standards/issues) ou entre em contato.

---

**Obrigado por contribuir! 🚀**

