## 📊 Resumo da Aplicação

Este sistema tem como objetivo realizar o **controle de orçamentos, itens e medições** de projetos, permitindo acompanhar a execução financeira e física de obras ao longo do tempo.

A aplicação contempla o cadastro de orçamentos, seus itens, medições periódicas e o controle de quantidades executadas.

---

## 🧾 Entidades Principais

### 🧩 Orçamento
Representa o conjunto financeiro de um projeto.

**Campos:**
- Número do protocolo (único)
- Tipo de orçamento (Obra de Edificação, Rodovias, Outros)
- Valor total
- Data de criação
- Status: `ABERTO` ou `FINALIZADO`
- Lista de itens

**Regras:**
- Número de protocolo deve ser único
- Soma dos itens deve ser igual ao valor total do orçamento
- Não pode ser editado após finalizado

---

### 📦 Item do Orçamento
Itens que compõem o orçamento.

**Campos:**
- Descrição
- Quantidade
- Valor unitário
- Valor total (calculado)
- Quantidade acumulada (medida ao longo do tempo)
- Referência ao orçamento

**Regras:**
- Valor total = quantidade × valor unitário
- Soma dos itens não pode ultrapassar o valor do orçamento
- Não pode editar itens de orçamento finalizado

---

### 📏 Medição
Registro do progresso da execução do orçamento.

**Campos:**
- Número da medição (único)
- Data da medição
- Valor total da medição
- Status: `ABERTA` ou `VALIDADA`
- Observações
- Referência ao orçamento

**Regras:**
- Só pode existir **uma medição aberta por orçamento**
- Ao validar, atualiza a quantidade acumulada dos itens
- Não pode medir além da quantidade total do item

---

### 📌 Itens da Medição
Relaciona os itens do orçamento com a medição.

**Campos:**
- Quantidade medida
- Valor total medido
- Item do orçamento
- Medição

**Regras:**
- Cada medição possui múltiplos itens
- Quantidade medida não pode ultrapassar saldo disponível
- Não pode editar após medição validada

---

## ⚙️ Arquitetura da Aplicação

A aplicação é dividida em **Front-end e Back-end desacoplados**, seguindo arquitetura moderna baseada em APIs REST.

---

## 🎨 Front-end

**Tecnologias obrigatórias:**
- Next.js
- Axios
- Redux

**Possíveis melhorias (opcionais):**
- PWA
- TypeScript
- UI com Tailwind, Mantine ou Ant Design
- Responsividade (mobile-first)
- Autenticação com JWT

---

## 🔧 Back-end

**Tecnologias obrigatórias:**
- Spring Boot
- JPA / Hibernate
- DTOs

**Possíveis melhorias (opcionais):**
- Testes automatizados
- Documentação com OpenAPI (Swagger)
- Lombok
- Autenticação com JWT
- Relatórios com JasperReports

---

## 🗄️ Banco de Dados

- SGBD: PostgreSQL
- Scripts SQL incluídos no projeto
- Modelo baseado em relacionamento entre:
  - Orçamento
  - Itens
  - Medições
  - Itens da Medição

---

## 🔀 Versionamento

- Código versionado no GitHub
- Repositórios públicos
- Padrão de commits semânticos:

