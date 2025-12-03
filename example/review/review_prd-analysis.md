# Relatório de Análise: Análise de Gaps e Riscos (Local)
> **Nota de Qualidade do Documento:** 6

## 🚨 Gaps e Lacunas (O que falta?)
- **Validação de Email** (High): Não há definição clara sobre os critérios para um email 'válido'. O que acontece se o formato do email não for válido?
- **Limite de Ocupação** (Medium): Não está claro como o sistema lidará com cenários em que a soma de adultos e crianças excede o limite, especialmente em casos de 'infants'.
- **Tipos de Pagamento** (Medium): A documentação menciona apenas 'CREDIT_CARD' como método de pagamento. Haverá outros métodos disponíveis no futuro? Como será o tratamento?
- **Erros de Validação** (Low): Não está especificado como o sistema deve agir em caso de erro de validação de campos não obrigatórios, como 'children' e 'infants'.

## ⚠️ Riscos Identificados
- [Technical] **Se o sistema não realizar a validação de idempotência corretamente, pode resultar em cobranças duplicadas.**
  *Mitigação:* Implementar testes automatizados para garantir a idempotência e revisar o código relacionado.
- [Business] **Se o sistema não for capaz de lidar com reservas em períodos de alta demanda, pode resultar em perda de receita.**
  *Mitigação:* Implementar um sistema de filas ou priorização de reservas durante períodos de alta demanda.
- [Security] **O tratamento do 'encryptedToken' não está claro. Se não for tratado corretamente, pode expor dados sensíveis.**
  *Mitigação:* Assegurar que o token seja validado e processado em conformidade com as melhores práticas de segurança.

## ❓ Questionamentos para o PO
- [ ] Qual é a lógica de tratamento para emails inválidos?
- [ ] Como o sistema deve se comportar se a ocupação total permitir mais hóspedes do que o limite com a inclusão de 'infants'?
- [ ] Existem planos para suportar outros métodos de pagamento além de 'CREDIT_CARD'?
- [ ] Qual será a lógica de tratamento para erros de campos não obrigatórios?