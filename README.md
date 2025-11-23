# BMIA Dashboard

Dashboard web para visualização de estatísticas do bot BMIA Discord, com autenticação via Discord OAuth e acesso restrito a administradores.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Type safety
- **NextAuth.js v5** - Autenticação Discord OAuth
- **Supabase** - Database PostgreSQL
- **Tailwind CSS** - Styling
- **Recharts** - Gráficos e visualizações
- **Lucide React** - Ícones

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Discord Developer Portal
- Projeto Supabase configurado
- Bot Discord com permissões adequadas

## 🔧 Configuração

### 1. Configurar Discord OAuth Application

1. Acesse [Discord Developer Portal](https://discord.com/developers/applications)
2. Clique em **"New Application"**
3. Dê um nome (ex: "BMIA Dashboard")
4. Vá para **OAuth2** → **General**
5. Em **Redirects**, adicione:
   - `http://localhost:3000/api/auth/callback/discord` (desenvolvimento)
   - `https://seu-dominio.vercel.app/api/auth/callback/discord` (produção)
6. Copie o **CLIENT ID** e **CLIENT SECRET**

### 2. Configurar Bot Token

1. No Discord Developer Portal, vá para **Bot**
2. Habilite **SERVER MEMBERS INTENT**
3. Copie o **TOKEN** do bot

### 3. Obter Guild ID

1. No Discord, ative o **Modo Desenvolvedor** (Configurações → Avançado)
2. Clique com botão direito no seu servidor
3. Clique em **"Copiar ID"**

### 4. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha as variáveis:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here  # Gere com: openssl rand -base64 32

# Discord OAuth
DISCORD_CLIENT_ID=seu-client-id
DISCORD_CLIENT_SECRET=seu-client-secret
DISCORD_BOT_TOKEN=seu-bot-token

# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Discord Server ID
DISCORD_GUILD_ID=seu-server-id
```

### 5. Instalar Dependências

```bash
npm install
```

## 🏃 Executar Localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📦 Build para Produção

```bash
npm run build
npm start
```

## 🚢 Deploy na Vercel

### Via GitHub

1. Faça push do código para um repositório GitHub
2. Acesse [Vercel](https://vercel.com)
3. Clique em **"New Project"**
4. Importe o repositório
5. Configure as variáveis de ambiente
6. Clique em **"Deploy"**

### Variáveis de Ambiente na Vercel

Adicione todas as variáveis do `.env.local` nas configurações do projeto:

- Settings → Environment Variables
- Adicione cada variável
- **IMPORTANTE**: Atualize `NEXTAUTH_URL` para o domínio da Vercel
- **IMPORTANTE**: Adicione o callback URL da Vercel no Discord OAuth

## 🔒 Segurança

- ✅ Apenas administradores do servidor Discord podem acessar
- ✅ Verificação de permissões via Discord API
- ✅ Rotas protegidas por middleware
- ✅ Tokens e secrets em variáveis de ambiente

## 📊 Funcionalidades

### Dashboard Principal
- Total de mensagens
- Total de membros
- Membros ativos
- Total de canais
- Top 5 usuários mais ativos
- Top 5 canais mais ativos

### Página de Usuários
- Lista completa dos top 20 usuários
- Contagem de mensagens
- Última atividade

### Página de Canais
- Lista completa dos top 20 canais
- Contagem de mensagens
- Última atividade

## 🗂️ Estrutura do Projeto

```
bmia-dashboard/
├── app/
│   ├── (auth)/
│   │   └── login/          # Página de login
│   ├── (dashboard)/
│   │   ├── dashboard/      # Dashboard principal
│   │   └── stats/          # Páginas de estatísticas
│   └── api/
│       ├── auth/           # NextAuth routes
│       └── stats/          # API de estatísticas
├── components/
│   ├── dashboard/          # Componentes do dashboard
│   └── ui/                 # Componentes UI reutilizáveis
├── lib/
│   ├── auth.ts            # Configuração NextAuth
│   ├── supabase.ts        # Cliente Supabase
│   └── utils.ts           # Funções utilitárias
├── hooks/
│   └── useStats.ts        # Hooks customizados
├── types/
│   └── index.ts           # Definições TypeScript
└── middleware.ts          # Proteção de rotas
```

## 🐛 Troubleshooting

### Erro de autenticação
- Verifique se o CLIENT_ID e CLIENT_SECRET estão corretos
- Confirme que o callback URL está configurado no Discord
- Verifique se o NEXTAUTH_SECRET está definido

### Erro de permissões
- Confirme que o bot tem SERVER MEMBERS INTENT habilitado
- Verifique se o BOT_TOKEN está correto
- Confirme que você é administrador do servidor

### Erro ao buscar dados
- Verifique as credenciais do Supabase
- Confirme que as tabelas existem no banco
- Verifique os logs do Supabase

## 📝 Licença

Este projeto é privado e de uso exclusivo do servidor BMIA.

## 🤝 Contribuindo

Para contribuir com o projeto:

1. Crie uma branch para sua feature
2. Faça commit das mudanças
3. Abra um Pull Request

## 📧 Suporte

Para dúvidas ou problemas, entre em contato com os administradores do servidor.
