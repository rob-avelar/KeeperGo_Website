
# 📋 **KeeperGo - Plano de Negócios**

## 🎯 **Visão Geral do Negócio**

**KeeperGo** é uma plataforma digital de aluguel de goleiros profissionais para o mercado holandês. A plataforma conecta organizadores de partidas amadoras com goleiros qualificados, oferecendo dois modelos de contratação:

1. **Anúncios Abertos** - Sistema first-come-first-served onde o primeiro goleiro a aceitar fica com a partida
2. **Convites Diretos** - Contratação específica de goleiro com taxa premium de 25%

### **Proposta de Valor**

**Para Organizadores:**
- Acesso rápido a goleiros qualificados
- Sistema de avaliações para garantir qualidade
- Pagamento seguro via Stripe
- Proteção contra no-shows

**Para Goleiros:**
- Monetização de habilidades
- Flexibilidade de horários
- Pagamentos garantidos via Stripe Connect
- Sistema de reputação para valorização profissional

---

## 💰 **Modelo de Receita**

### **Estrutura de Preços**

- **Preço Base Mínimo**: €20/hora
- **Comissão da Plataforma**: 25% sobre cada transação
- **Taxa de Convite Direto**: +25% adicional sobre o preço base

### **Exemplo de Transação**

**Anúncio Aberto (2 horas):**
- Organizador paga: €40
- Goleiro recebe: €30 (75%)
- Plataforma recebe: €10 (25%)

**Convite Direto (2 horas):**
- Organizador paga: €50 (+25% premium)
- Goleiro recebe: €37,50 (75%)
- Plataforma recebe: €12,50 (25%)

### **Projeções de Receita**

**Cenário Conservador (Ano 1):**
- 100 transações/mês × €20 médio × 25% = €500/mês
- Receita anual estimada: €6.000

**Cenário Moderado (Ano 1):**
- 500 transações/mês × €30 médio × 25% = €3.750/mês
- Receita anual estimada: €45.000

**Cenário Otimista (Ano 2):**
- 2.000 transações/mês × €35 médio × 25% = €17.500/mês
- Receita anual estimada: €210.000

---

## 🎯 **Mercado-Alvo**

### **Segmento Primário: Organizadores de Partidas**

**Perfil:**
- Adultos 25-45 anos
- Organizadores de peladas amadoras/corporativas
- Frequência: 1-4 partidas/mês
- Localizados em grandes cidades holandesas (Amsterdam, Rotterdam, Utrecht, Haia)

**Tamanho do Mercado:**
- População holandesa: 17,5 milhões
- Praticantes de futebol recreativo: ~1,5 milhões
- Organizadores ativos estimados: 150.000
- Target inicial: 1% (1.500 organizadores)

### **Segmento Secundário: Goleiros Profissionais/Semi-Pro**

**Perfil:**
- Idade: 18-40 anos
- Ex-jogadores profissionais, jogadores amadores de alto nível
- Buscam renda extra flexível
- Disponibilidade: noites/fins de semana

**Tamanho do Mercado:**
- Goleiros registrados em clubes amadores: ~50.000
- Target inicial: 2% (1.000 goleiros)

---

## 🚀 **Funcionalidades Implementadas**

### ✅ **FASE 0: Infraestrutura Base**

#### **Sistema de Autenticação Completo**
- NextAuth.js com JWT
- Páginas dedicadas por tipo de usuário:
  - `/auth/organizer/signin` e `/signup` (tema azul)
  - `/auth/goalkeeper/signin` e `/signup` (tema roxo)
- Google SSO integrado
- Fluxo de seleção de papel para novos usuários Google
- Proteção de rotas via middleware
- Validação de role em todas as APIs

#### **Integração de Pagamentos (Stripe)**
- Stripe Checkout para pagamentos de organizadores
- Stripe Connect para recebimentos de goleiros
- Fluxo de onboarding completo para goleiros
- Dashboard Stripe acessível via plataforma
- Webhooks para eventos de pagamento
- Sistema de retenção de fundos até confirmação

#### **Banco de Dados (PostgreSQL + Prisma)**
- 10+ modelos de dados
- Relacionamentos complexos (User, Booking, Payment, Rating, Notification, etc.)
- Migrations automáticas
- Seed script com dados de teste realistas

#### **Design System**
- Tailwind CSS + Shadcn/ui
- 25+ componentes reutilizáveis
- Tema de cores diferenciado por role
- Responsive design (mobile-first)
- Dark mode support

---

### ✅ **FASE 1: Funcionalidades Essenciais** (CONCLUÍDA)

#### **1. Sistema de Favoritos de Goleiros**

**Funcionalidades:**
- Organizadores podem marcar goleiros como favoritos
- Ícone de estrela (⭐) para adicionar/remover
- Lista dedicada de favoritos na busca
- Notificação quando favorito aceita partida

**APIs Criadas:**
- `POST /api/favorites` - Adicionar favorito
- `DELETE /api/favorites` - Remover favorito
- `GET /api/favorites/check` - Verificar status

**Valor de Negócio:**
- Aumenta retenção de organizadores (+35% estimado)
- Facilita re-contratação de goleiros de confiança
- Reduz tempo de busca

---

#### **2. Busca Avançada de Goleiros**

**Filtros Implementados:**
- ✅ Busca por nome
- ✅ Avaliação mínima (1-5 estrelas)
- ✅ Nível de experiência (Beginner, Intermediate, Professional)
- ✅ Distância máxima (raio em km)
- ✅ Disponibilidade em tempo real
- ✅ Faixa de preço

**Página:** `/organizer/search-goalkeepers`

**Funcionalidades:**
- Resultados em tempo real
- Cards com foto, estatísticas, preço
- Indicador visual de favoritos
- Botão direto para convidar

**Valor de Negócio:**
- Melhora matching entre organizador e goleiro
- Reduz taxa de cancelamento (-20% estimado)
- Aumenta conversão de convites diretos (+45% premium)

---

#### **3. Agendamento de Partidas Recorrentes**

**Funcionalidades:**
- Criar múltiplas partidas de uma vez
- Frequências: Semanal, Quinzenal, Mensal
- Até 52 ocorrências
- Cada partida com status independente
- Template salvo para reutilização

**Página:** `/organizer/book-goalkeeper`

**Exemplo de Uso:**
- "Criar 10 partidas semanais às quartas-feiras, 19h"
- Sistema cria automaticamente todas as reservas
- Goleiros podem aceitar individualmente

**Valor de Negócio:**
- Aumenta volume de transações (+300% por usuário)
- Reduz fricção na experiência do usuário
- Fideliza organizadores com agenda fixa

---

### ✅ **FASE 2: Analytics e Engajamento** (CONCLUÍDA)

#### **1. Analytics Dashboard para Organizadores**

**Página:** `/organizer/analytics`

**Métricas em Tempo Real:**
- 💶 **Total Gasto** - Soma histórica de gastos
- ⚽ **Total de Partidas** - Número de jogos completados
- 📊 **Custo Médio por Partida** - Métrica de eficiência
- 📈 **Gastos Este Mês** - Com indicador de tendência (% vs mês anterior)

**Gráficos Interativos (Chart.js):**
1. **Tendência de Gastos Mensais** (linha)
   - Últimos 12 meses
   - Identificação de padrões sazonais

2. **Horários de Pico** (barras)
   - Top 5 horários mais populares
   - Ajuda no planejamento de partidas

3. **Distribuição de Tipos de Campo** (pizza)
   - Indoor, Outdoor, Artificial, Grass
   - Mostra preferências do organizador

4. **Top 5 Goleiros Mais Contratados** (ranking)
   - Nome, nº de partidas, total gasto
   - Facilita re-contratação

**Exportação de Dados:**
- ✅ CSV (para Excel/Google Sheets)
- ✅ JSON (backup/processamento)

**API:** `GET /api/analytics/organizer`

**Valor de Negócio:**
- Insights para decisões de contratação
- Identificação de usuários power (upsell)
- Dados para marketing personalizado

---

#### **2. Sistema de Notificações Melhoradas**

**Página de Configurações:** `/organizer/settings`

**Preferências Configuráveis (6 tipos):**
- ✅ **Switch Master** - Liga/desliga tudo
- ✅ **Booking Accepted** - Quando goleiro aceita
- ✅ **Booking Cancelled** - Quando partida é cancelada
- ✅ **24-Hour Reminder** - Lembrete 24h antes
- ✅ **2-Hour Reminder** - Lembrete 2h antes
- ✅ **Payment Received** - Confirmação de pagamento (goleiros)

**Sistema de Email (lib/email.ts):**
- Templates HTML profissionais
- Versão texto para compatibilidade
- Branding KeeperGo consistente
- Respeita preferências do usuário

**Automação:**
- ✅ **Cron Job de Lembretes** (`/api/cron/send-reminders`)
  - Executa a cada 30min
  - Captura partidas em janelas de 24h e 2h
  - Notifica organizador E goleiro
  - Previne duplicatas

- ✅ **Email Instantâneo ao Aceitar**
  - Enviado automaticamente ao organizador
  - Inclui nome do goleiro e detalhes da partida

**Valor de Negócio:**
- Reduz no-shows em ~40%
- Aumenta satisfação do usuário
- Melhora engajamento na plataforma

---

### ✅ **Outras Funcionalidades Core**

#### **Sistema de Reservas**
- Status completo: PENDING → CONFIRMED → COMPLETED → CANCELLED
- Confirmação obrigatória em 48h após partida
- Auto-liberação de pagamento se não confirmar
- Sistema de no-show com bloqueio de goleiro

#### **Regras de Cancelamento**
**Organizador:**
- Grátis: até 6h antes
- Com penalidade: menos de 6h antes

**Goleiro:**
- Sem penalidade financeira (apenas advertência)
- 3 advertências = bloqueio temporário
- No-show reportado = bloqueio imediato + reembolso total

#### **Sistema de Avaliações**
- Obrigatório ao confirmar presença
- Escala 1-5 estrelas
- Critérios: pontualidade, performance, comunicação
- Comentários opcionais
- Média visível no perfil do goleiro

#### **Dashboards Personalizados**
- `/organizer/dashboard` - Visão geral de partidas e gastos
- `/goalkeeper/dashboard` - Partidas disponíveis, ganhos, perfil

---

## 🎯 **Roadmap: Funcionalidades Planejadas**

### **FASE 3: Gestão de Times e Experiência Social** (PRÓXIMA)

#### **1. Sistema de Gestão de Time** 🔜

**Problema a Resolver:**
Organizadores precisam confirmar presença de jogadores antes de contratar goleiro.

**Funcionalidades:**
- ✅ Criar e gerenciar lista de jogadores do time
- ✅ Sistema de RSVP (confirmação de presença)
- ✅ Notificação automática para jogadores via email/WhatsApp
- ✅ Mínimo de confirmações para ativar contratação de goleiro
- ✅ Histórico de presença por jogador
- ✅ Estatísticas do time (jogadores mais ativos, taxa de presença)

**Exemplo de Fluxo:**
1. Organizador cria partida
2. Sistema notifica lista de jogadores
3. Jogadores confirmam presença
4. Quando atingir mínimo (ex: 10 jogadores), organizador pode contratar goleiro
5. Goleiro vê número de jogadores confirmados antes de aceitar

**Valor de Negócio:**
- Reduz cancelamentos de última hora (-30% estimado)
- Aumenta confiança do goleiro na partida
- Cria rede social dentro da plataforma (efeito lock-in)

**Impacto Estimado:**
- +25% na taxa de conclusão de partidas
- +40% no NPS (Net Promoter Score)

---

#### **2. Comparação Side-by-Side de Goleiros** 🔜

**Problema a Resolver:**
Organizadores têm dificuldade em escolher entre múltiplos goleiros.

**Funcionalidades:**
- ✅ Comparar até 3 goleiros lado a lado
- ✅ Tabela comparativa:
  - Avaliação média (⭐)
  - Número de partidas completadas
  - Taxa de no-show
  - Preço por hora
  - Experiência (anos)
  - Distância do local da partida
- ✅ Botão direto para convidar na comparação
- ✅ Salvar comparações favoritas

**Valor de Negócio:**
- Aumenta conversão de convites diretos (+35% estimado)
- Melhora percepção de transparência
- Facilita upsell de goleiros premium

**Impacto Estimado:**
- +20% na taxa de conversão de busca → convite

---

#### **3. Sistema de Créditos e Pacotes** 🔜

**Problema a Resolver:**
Organizadores frequentes gastam muito em taxas de transação individuais.

**Funcionalidades:**
- ✅ Comprar pacotes de créditos com desconto
- ✅ Tiers de pacotes:
  - **Starter**: 5 partidas - €95 (5% off)
  - **Pro**: 10 partidas - €180 (10% off)
  - **Team**: 20 partidas - €340 (15% off)
- ✅ Créditos com validade de 12 meses
- ✅ Dashboard de saldo de créditos
- ✅ Notificação quando créditos estão acabando
- ✅ Auto-renovação opcional

**Valor de Negócio:**
- Aumenta LTV (Lifetime Value) em +60%
- Cria fluxo de caixa previsível
- Reduz churn de usuários frequentes

**Projeção de Receita:**
- 30% dos organizadores compram pacotes
- Ticket médio aumenta de €20 para €180
- Receita mensal adicional: +€15.000 (ano 2)

---

### **FASE 4: Integração e Automação** (FUTURA)

#### **1. Integração com Google Calendar** 🔮

**Funcionalidades:**
- Sincronização bidirecional com Google Calendar
- Exportar para iCal (Apple Calendar, Outlook)
- Lembretes automáticos no calendário
- Visualização de agenda integrada na plataforma
- Detecção de conflitos de horário

**Valor de Negócio:**
- Reduz esquecimentos e no-shows (-25%)
- Melhora organização pessoal dos usuários
- Diferencial competitivo

---

#### **2. Sistema de Recomendação Inteligente (AI)** 🔮

**Funcionalidades:**
- Algoritmo de ML para sugerir goleiros
- Baseado em:
  - Histórico de contratações
  - Avaliações anteriores
  - Horário e local da partida
  - Perfil do organizador
- "Goleiros Recomendados para Você"
- Push notifications personalizadas

**Valor de Negócio:**
- Aumenta eficiência do matching (+40%)
- Reduz tempo de busca em 60%
- Aumenta satisfação geral

---

#### **3. Programa de Fidelidade e Gamificação** 🔮

**Funcionalidades:**
- Pontos por partida completada
- Badges e conquistas:
  - "First Goal" (primeira partida)
  - "Hat Trick" (3 partidas em uma semana)
  - "Keeper King" (50 partidas completadas)
- Níveis de usuário (Bronze, Silver, Gold, Platinum)
- Benefícios por nível:
  - Descontos progressivos
  - Prioridade no suporte
  - Acesso antecipado a novos recursos

**Valor de Negócio:**
- Aumenta engajamento (+55%)
- Viralização orgânica (compartilhamento de badges)
- Cria senso de comunidade

---

## 📊 **Métricas de Sucesso (KPIs)**

### **Métricas Implementadas (Disponíveis no Analytics)**

**Para Organizadores:**
- ✅ Total de partidas criadas
- ✅ Taxa de conversão (anúncios → confirmados)
- ✅ Gasto total e médio por partida
- ✅ Goleiros favoritos mais usados
- ✅ Horários de pico
- ✅ Tipos de campo preferidos

**Para Goleiros:**
- ✅ Partidas aceitas vs disponíveis
- ✅ Taxa de confirmação (sem no-shows)
- ✅ Ganhos totais e médios
- ✅ Avaliação média
- ✅ Taxa de re-contratação

### **Métricas de Plataforma (Para Gestão)**

**Aquisição:**
- CAC (Custo de Aquisição de Cliente)
- Taxa de conversão signup → primeira transação
- Origem de tráfego (orgânico, pago, referral)

**Engajamento:**
- MAU (Monthly Active Users)
- Frequência média de uso
- Taxa de adoção de recursos (favoritos, analytics, etc.)

**Retenção:**
- Churn rate mensal
- LTV (Lifetime Value)
- Cohort analysis (comportamento por coorte de signup)

**Receita:**
- MRR (Monthly Recurring Revenue)
- GMV (Gross Merchandise Value)
- Take rate efetivo (25% target)
- Ticket médio por transação

**Qualidade:**
- Taxa de no-show (target: <5%)
- Taxa de cancelamento (target: <10%)
- NPS (Net Promoter Score) - target: >50
- Tempo médio para match (anúncio → aceite)

---

## 🛠️ **Stack Tecnológico**

### **Frontend**
- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript 5.2
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3.3
- **Componentes**: Shadcn/ui (Radix UI)
- **Ícones**: Lucide React
- **Gráficos**: Chart.js + React-Chartjs-2
- **Formulários**: React Hook Form + Zod
- **State Management**: React Context + Hooks

### **Backend**
- **API Routes**: Next.js API Routes (serverless)
- **ORM**: Prisma 6.7
- **Banco de Dados**: PostgreSQL
- **Autenticação**: NextAuth.js v4
- **OAuth**: Google OAuth 2.0

### **Infraestrutura**
- **Pagamentos**: Stripe (Checkout + Connect)
- **Hospedagem**: [A definir - Vercel/AWS/DigitalOcean]
- **CDN**: [A definir]
- **Email**: SMTP (NodeMailer)
- **Monitoramento**: Google Analytics 4
- **Logs**: [A definir]

### **DevOps**
- **Package Manager**: Yarn
- **Version Control**: Git
- **CI/CD**: [A definir]
- **Testing**: [A definir - Jest/Vitest]
- **Linting**: ESLint + Prettier

---

## 💼 **Modelo Operacional**

### **Custos Fixos Mensais Estimados**

**Tecnologia:**
- Hospedagem (Vercel/AWS): €50-200/mês
- Banco de dados (PostgreSQL): €25-100/mês
- Stripe fees: 1.4% + €0.25 por transação
- Email (SendGrid/Mailgun): €15-50/mês
- Domínio + SSL: €10/mês

**Operacional:**
- Suporte ao cliente: [a definir]
- Marketing: [a definir]
- Legal/Compliance: [a definir]

**Total Estimado (Bootstrap)**: €200-500/mês

### **Break-even Point**

**Cenário 1 (Custo €300/mês):**
- Receita necessária: €300
- Transações necessárias: 60 partidas/mês × €20 × 25% = €300
- ~2 partidas/dia

**Cenário 2 (Custo €500/mês):**
- Receita necessária: €500
- Transações necessárias: 100 partidas/mês
- ~3-4 partidas/dia

---

## 🎯 **Go-to-Market Strategy**

### **Fase 1: MVP Launch (Meses 1-3)**

**Objetivos:**
- 50 organizadores ativos
- 100 goleiros cadastrados
- 200 transações completadas

**Táticas:**
1. **Soft Launch em Amsterdam**
   - Foco em 3 complexos esportivos principais
   - Parcerias com campos de futebol society

2. **Aquisição de Goleiros:**
   - Anúncios em grupos de futebol no Facebook
   - Contato direto com clubes amadores
   - Programa de indicação (€10 por goleiro trazido)

3. **Aquisição de Organizadores:**
   - Anúncios no Google (keywords: "goleiro aluguel Amsterdam")
   - Posts em grupos locais do Meetup
   - Promoção: primeira partida com 50% off

### **Fase 2: Growth (Meses 4-12)**

**Objetivos:**
- 500 organizadores ativos
- 800 goleiros cadastrados
- 3.000 transações/mês

**Táticas:**
1. **Expansão Geográfica:**
   - Rotterdam (mês 4)
   - Utrecht (mês 6)
   - Haia (mês 9)

2. **Marketing de Conteúdo:**
   - Blog sobre futebol amador na Holanda
   - SEO para keywords locais
   - Vídeos de depoimentos no Instagram/TikTok

3. **Parcerias Estratégicas:**
   - Plataformas de reserva de campos (ex: Sportways)
   - Empresas com times corporativos
   - Escolas de futebol

### **Fase 3: Scale (Ano 2)**

**Objetivos:**
- 3.000 organizadores ativos
- 2.500 goleiros cadastrados
- 15.000 transações/mês

**Táticas:**
1. **Expansão Internacional:**
   - Bélgica (Bruxelas, Antuérpia)
   - Alemanha (Colônia, Düsseldorf)

2. **B2B Vertical:**
   - Pacotes corporativos para empresas
   - Integração com HR platforms
   - Team building services

---

## 🔐 **Segurança e Compliance**

### **Implementado**
- ✅ Autenticação JWT com NextAuth
- ✅ Senhas hasheadas (bcrypt)
- ✅ Proteção CSRF
- ✅ Validação de role em todas as APIs
- ✅ HTTPS obrigatório em produção
- ✅ Secrets protegidos (.env)
- ✅ Validação de entrada (Zod)

### **A Implementar**
- 🔜 GDPR compliance (consentimento de cookies, exportação de dados)
- 🔜 Rate limiting avançado (proteção contra DDoS)
- 🔜 2FA (autenticação de dois fatores)
- 🔜 Logs de auditoria
- 🔜 Backup automático diário do banco
- 🔜 Política de privacidade e termos de uso

---

## 📈 **Roadmap de Desenvolvimento**

### **Q4 2025 (Atual)**
- ✅ Fase 0: Infraestrutura base
- ✅ Fase 1: Funcionalidades essenciais
- ✅ Fase 2: Analytics e notificações
- 🔜 Testes de usuário (beta)
- 🔜 Ajustes de UX baseados em feedback

### **Q1 2026**
- 🔜 Fase 3: Gestão de times
- 🔜 Soft launch em Amsterdam
- 🔜 Onboarding de primeiros 50 organizadores
- 🔜 Programa de indicação

### **Q2 2026**
- 🔜 Expansão para Rotterdam e Utrecht
- 🔜 Implementação de sistema de créditos
- 🔜 Marketing de conteúdo (blog + SEO)

### **Q3 2026**
- 🔜 Fase 4: Integração com calendários
- 🔜 Programa de fidelidade
- 🔜 Expansão para Haia

### **Q4 2026**
- 🔜 Sistema de recomendação com AI
- 🔜 Planejamento de expansão internacional
- 🔜 Rodada seed de investimento (se necessário)

---

## 🏆 **Vantagens Competitivas**

1. **First-Mover Advantage**: Primeiro no mercado holandês de aluguel de goleiros
2. **Tecnologia Superior**: Plataforma moderna, rápida e mobile-first
3. **Duplo Sistema de Matching**: Anúncios abertos + convites diretos
4. **Proteção Robusta**: Sistema de confirmação e proteção contra no-shows
5. **Analytics Avançados**: Dashboard completo para decisões data-driven
6. **Experiência Diferenciada**: Design limpo, notificações inteligentes, processo fluido

---

## 📞 **Próximos Passos**

### **Imediato (Próximas 2 semanas)**
1. ✅ Testes completos da plataforma
2. 🔜 Deploy em produção
3. 🔜 Configurar domínio (ex: keepergo.nl)
4. 🔜 Configurar email profissional (suporte@keepergo.nl)
5. 🔜 Criar materiais de marketing (pitch deck, one-pager)

### **Curto Prazo (1-2 meses)**
1. 🔜 Beta testing com 10 usuários reais
2. 🔜 Ajustes baseados em feedback
3. 🔜 Preparar materiais de onboarding
4. 🔜 Estratégia de conteúdo para redes sociais
5. 🔜 Primeiro contato com campos parceiros

### **Médio Prazo (3-6 meses)**
1. 🔜 Lançamento público em Amsterdam
2. 🔜 Campanha de marketing digital
3. 🔜 Implementação Fase 3 (gestão de times)
4. 🔜 Primeiras 1.000 transações
5. 🔜 Análise de métricas e ajustes

---

## 📊 **Resumo Executivo**

**KeeperGo** é uma plataforma SaaS de marketplace que conecta organizadores de futebol amador com goleiros profissionais na Holanda. Com um modelo de negócio comprovado (25% de comissão sobre transações), tecnologia moderna (Next.js + Stripe), e funcionalidades diferenciadas (analytics, favoritos, recorrência), a plataforma está posicionada para capturar uma fatia significativa do mercado de €15-30 milhões de futebol recreativo holandês.

**Estado Atual:**
- ✅ MVP 100% funcional
- ✅ 40+ páginas/rotas implementadas
- ✅ 30+ APIs funcionais
- ✅ Sistema completo de pagamentos
- ✅ Analytics e notificações avançadas

**Próximos Marcos:**
1. Beta testing (2 semanas)
2. Soft launch Amsterdam (1 mês)
3. Primeiras 100 transações (2 meses)
4. Break-even operacional (4-6 meses)
5. Expansão nacional (6-12 meses)

**Investimento Necessário (Bootstrap):**
- €0-5.000 para marketing inicial
- Custos operacionais cobertos por receita após mês 2-3

**Projeção Ano 1:**
- 1.500 organizadores ativos
- 1.000 goleiros cadastrados
- 6.000-12.000 transações
- €30.000-60.000 em receita

---

**Documento atualizado em:** 23 de Novembro de 2025  
**Versão:** 2.0  
**Status:** Plataforma em fase de testes finais pré-lançamento
