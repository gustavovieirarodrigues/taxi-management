# Sistema de Gerenciamento de Táxis

Um aplicativo web completo para gerenciamento de corridas de táxi, desenvolvido com React, Vite e Supabase.

## Funcionalidades

✅ **Autenticação de Usuários**
- Login e registro de usuários
- Diferenciação entre gerentes e motoristas
- Proteção de rotas

✅ **Painel do Gerente**
- Cadastro e gerenciamento de agendamentos
- Atribuição de motoristas às corridas
- Visualização de clientes e histórico de corridas
- Estatísticas em tempo real

✅ **Painel do Motorista**
- Visualização de corridas atribuídas
- Gerenciamento de status das corridas
- Histórico de corridas realizadas
- Interface intuitiva

✅ **Notificações**
- Notificações visuais em tempo real
- Aviso automático quando uma corrida é atribuída
- Sistema pronto para integração com email

## Pré-requisitos

- Node.js 16+ instalado
- Conta no Supabase
- Credenciais do Supabase configuradas

## Instalação e Setup

### 1. Instalar dependências

```bash
cd taxi-management
npm install
```

### 2. Configurar Supabase

#### 2.1. Criar as tabelas no Supabase

1. Acesse sua conta no Supabase (https://supabase.com)
2. Vá para "SQL Editor"
3. Crie uma nova query
4. Copie todo o conteúdo do arquivo `schema.sql`
5. Execute a query

#### 2.2. Variáveis de ambiente

O arquivo `.env.local` já está configurado com suas credenciais Supabase.

### 3. Iniciar o projeto

```bash
npm run dev
```

O aplicativo estará disponível em: `http://localhost:5173`

## Como Usar

### Para Gerentes

1. **Criar conta de gerente**
   - Clique em "Registre-se aqui"
   - Preencha seus dados
   - Selecione "Gerente" como tipo de conta

2. **Agendar corridas**
   - Clique em "Agendar Nova Corrida"
   - Preencha os dados do cliente e da corrida

3. **Atribuir motoristas**
   - Na tabela de corridas, selecione um motorista
   - O motorista receberá uma notificação automática

### Para Motoristas

1. **Criar conta de motorista**
   - Clique em "Registre-se aqui"
   - Preencha seus dados
   - Selecione "Motorista" como tipo de conta

2. **Visualizar corridas atribuídas**
   - Veja as corridas atribuídas no seu painel

3. **Gerenciar corridas**
   - Marque como "Concluir" ou "Recusar"

## Estrutura do Projeto

```
taxi-management/
├── src/
│   ├── components/           # Componentes reutilizáveis
│   ├── contexts/             # Contextos React
│   ├── pages/                # Páginas
│   ├── services/             # Serviços (Supabase, notificações)
│   ├── App.jsx               # Componente raiz
│   └── main.jsx              # Ponto de entrada
├── schema.sql                # Schema do banco de dados
├── .env.local                # Variáveis de ambiente
└── package.json
```

## Tecnologias Utilizadas

- **React 18** - Frontend framework
- **Vite** - Build tool
- **React Router** - Navegação
- **Bootstrap 5** - UI
- **Supabase** - Backend e autenticação

## Scripts Disponíveis

```bash
npm run dev      # Iniciar desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
```

---

**Sistema de Gerenciamento de Táxis**
