# Guia de Setup Completo

## 1. Preparar o Supabase

### Passo 1: Executar o Schema SQL

1. Acesse https://supabase.com e entre em sua conta
2. Vá até seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em "New query"
5. Copie todo o conteúdo do arquivo `schema.sql` do projeto
6. Cole no editor SQL do Supabase
7. Clique em "Run" (ou pressione Ctrl+Enter)
8. Aguarde a conclusão - você deve ver mensagens de sucesso

## 2. Verificar Variáveis de Ambiente

O arquivo `.env.local` já contém:

```
VITE_SUPABASE_URL=https://aekevmvbextwhsganadb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Estes valores estão corretos e já foram configurados.

## 3. Instalar Dependências

No terminal, na pasta do projeto:

```bash
npm install
```

Isso vai instalar todas as dependências necessárias:
- react
- react-router-dom
- @supabase/supabase-js
- bootstrap
- react-bootstrap
- axios

## 4. Iniciar o Projeto

```bash
npm run dev
```

Você verá algo como:

```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

## 5. Acessar o Aplicativo

Abra seu navegador em: **http://localhost:5173/**

## 6. Criar Contas de Teste

### Criar conta de Gerente

1. Clique em "Registre-se aqui"
2. Preencha:
   - Nome: "João Gerente"
   - Email: "gerente@exemplo.com"
   - Tipo: "Gerente"
   - Senha: "senha123"
3. Clique em "Criar Conta"
4. Faça login com essas credenciais

### Criar conta de Motorista

1. Faça logout (clique em Sair)
2. Clique em "Registre-se aqui"
3. Preencha:
   - Nome: "Maria Motorista"
   - Email: "motorista@exemplo.com"
   - Tipo: "Motorista"
   - Senha: "senha123"
4. Clique em "Criar Conta"

## 7. Testar as Funcionalidades

### Com a conta de Gerente:

1. Clique em "Agendar Nova Corrida"
2. Preencha:
   - Cliente: "João da Silva"
   - Origem: "Rua A, 123"
   - Destino: "Rua B, 456"
   - Data/Hora: Selecione um horário
   - Motorista: "Maria Motorista"
3. Clique em "Agendar Corrida"
4. Você verá a confirmação "Corrida agendada com sucesso!"

### Com a conta de Motorista:

1. Faça logout da conta gerente
2. Faça login com a conta de motorista
3. Você verá a corrida agendada pelo gerente
4. Clique em "Concluir" ou "Recusar" para testar
5. Veja o histórico de corridas realizadas

## 8. Resolver Problemas

### Erro: "Failed to fetch user data"

- Confirme que as variáveis de `.env.local` estão corretas
- Reinicie o servidor (`npm run dev`)
- Limpe o cache do navegador

### Erro: "relation "rides" does not exist"

- Verifique se o schema SQL foi executado corretamente no Supabase
- Vá em SQL Editor > View existing queries
- Execute novamente o schema.sql

### Notificações não aparecem

- Abra o console do navegador (F12)
- Verifique se há erros
- As notificações aparecem apenas quando uma corrida é atribuída

### Login não funciona

- Verifique se a conta foi criada corretamente
- Verifique o email de confirmação do Supabase
- Se necessário, redefina a senha no Supabase

## 9. Estrutura de Pastas Criada

```
taxi-management/
├── src/
│   ├── components/
│   │   ├── DriverDashboard.jsx
│   │   ├── ManagerDashboard.jsx
│   │   ├── NotificationCenter.jsx
│   │   └── ProtectedRoute.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Unauthorized.jsx
│   ├── services/
│   │   ├── notificationService.js
│   │   └── supabase.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── public/
├── .env.local
├── schema.sql
├── README.md
├── SETUP.md
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## 10. Próximos Passos (Opcional)

- Integrar com serviço de email (Resend, SendGrid)
- Adicionar Google Maps para localização
- Implementar sistema de pagamento
- Criar app mobile
- Adicionar relatórios

## 11. Contato e Suporte

Qualquer dúvida, consulte:
- Console do navegador (F12)
- Logs do Supabase
- Este arquivo de setup

---

**Pronto! Seu sistema de gerenciamento de táxis está funcionando!**
