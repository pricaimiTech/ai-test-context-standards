# Regras para escrever um Caso de Teste (CT) com clareza e padronização

## 1. Estrutura e formatação

Sempre iniciar o título com “Validar”, seguido de uma ação e comportamento esperado. Exemplo: `Validar lançamento de entrada de consumação antecipada [Pagar depois].`

Usar seções padrão:

- **Prioridade:** [High, Medium, Low]
- **Severidade:** [Blocker, Critical, Minor, Normal, Trivial]
- **Tipo de teste:** [API - E2E, API - Contrato, API - Funcional, Web - E2E, Web - Regressão Visual, Mobile E2E, Mobile - Regressão Visual, Mobile - Performance, N/D]
- **Heurística:** 
- **Tipo:** 
- **Pré-condições:**
- **Step by step:**
- **Resultado Esperado:** 


Utilizar markdown ou identação clara para facilitar leitura em documentos, planilhas ou ClickUp.

## 2. Escrita do step by step

- Usar colchetes [ ] ao mencionar botões, opções ou menus clicáveis.
 Exemplo: `Clicar em [Check-in/Check-out] >> [Cadastrar].`
- Usar aspas duplas " " para identificar nomes de tela, campos e labels.
  Exemplo: `No campo 'Nome', informar o nome do baladeiro.`
- Evitar gerúndio (ex.: “clicando”, “abrindo”). Preferir verbos no infinitivo: `Clicar`, `Selecionar`, `Confirmar`.
- Utilizar linguagem ubiqua para escrita dos passos
- Descrever valores concretos usados no teste.
  Exemplo: `Selecionar o produto "Água 500ml" ou Definir valor "R$ 22,33".`
- Nunca deixar o passo depender de interpretação. Escreva o que deve ser feito e o que deve acontecer.
- Seguir a sequência exata da interface. Cada passo deve refletir a jornada real do usuário no PDV, sem saltos ou lacunas.

## 3. Escrita do Resultado Esperado
- Sempre iniciar com o estado final esperado e não com o processo.
  Exemplo: `O sistema deve exibir a mensagem 'Entrada lançada com sucesso'.`
- Incluir onde validar o resultado.
  Exemplo: `Pode ser validado no Dashboard → Relatórios → Contas abertas → Aba Entradas.`
- Usar linguagem acessível para todos os perfis (QA técnico e funcional). Evitar termos como paidValue ou endpoint, e descrever o comportamento visual e funcional.
- Ser objetivo e mensurável. Todo resultado deve permitir que outro QA saiba se o teste passou ou falhou.

## 4. Clareza e consistência

- Usar sempre o mesmo padrão de verbos de ação: `Abrir`, `Clicar`, `Selecionar`, `Confirmar`, `Verificar`, `Aguardar`, `Validar`.
- Manter nomes de telas e menus idênticos aos exibidos no produto. Evita confusão e garante rastreabilidade com a aplicação.
- Indicar contexto quando necessário. Exemplo: nível de validação: evento, place, cliente, etc. Exemplo: `Validar no Dashboard (nível de evento).`
- Evitar repetições desnecessárias.Se o contexto for claro, mantenha o passo direto.

## 5. Complementos recomendados

- Título curto alternativo: sempre sugerir uma versão curta e direta do nome (para uso no board ou planilha).
- Alinhamento com automação: verificar se o CT reflete o mesmo comportamento validado pelos testes automatizados.
- Criticidade e tipo de teste: se aplicável, incluir tags como `blocker`, `major`, `regression`, `smoke` etc.
- Linguagem neutra e profissional: sem abreviações ou termos informais.
- Evitar "recomendações" dentro do corpo do CT. Se precisar explicar algo adicional, colocar como nota no final, fora dos passos principais.


## Exemplo:

[ZIGPDV-455] - Validar lançamento de entrada de consumação antecipada [Pagar depois]

```
Pré-condições
* No Admin (Dashboard): permissão “Cobrar entradas” ativada.
* Evento aberto.
* Operador com acesso ao PDV.
* Entrada “Consumação antecipada” cadastrada no valor de R$ 22,33.
* ZigCard físico vinculado a um baladeiro válido.

Step by step
1. Abrir o app e logar no PDV com as credenciais do operador.
2. Clicar em [Check-in/Check-out] >> [Cadastrar].
3. No campo 'Nome', cadastrar um baladeiro anônimo.
4. Retornar à Home.
5. Clicar em [Caixa e Recepção] >> [Lançar entrada].
6. Aproximar o ZigCard do baladeiro.
7. Selecionar a entrada “Consumação antecipada” e marcar [Pagar depois].
8. Confirmar a operação e aguardar mensagem de sucesso.

Resultado esperado
- O sistema exibe a mensagem “Entrada lançada com sucesso”.
- O baladeiro possui uma dívida pendente de R$ 22,33.
- No Dashboard >> Relatórios >> Contas abertas >> Aba Entradas, a entrada aparece com status “Pagar depois”.
- Em Dashboard >> Clientes >> Aba “Entradas consumidas”, consta a entrada “Consumação antecipada” com valor R$ 22,33 e status em aberto.
- Nenhum pagamento foi realizado e o saldo de consumo permanece zerado.
```


