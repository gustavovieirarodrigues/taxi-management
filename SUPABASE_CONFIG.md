# Configuração Supabase - Instruções Importantes

## 1. Desabilitar Email Confirmation (IMPORTANTE!)

Para permitir que os usuários se registrem sem confirmar o email:

1. Vá para **Supabase Dashboard**
2. Clique em **Authentication** (no menu lateral)
3. Vá para a aba **Providers**
4. Encontre **Email** e clique para expandir
5. **Desative** "Confirm email" (marque como OFF)
6. Clique em **Save**

### Ou execute este SQL:

```sql
-- Alterar configuração de confirmação de email
UPDATE auth.config
SET email_autoconfirm = true
WHERE id = '00000000-0000-0000-0000-000000000001';
```

## 2. Configurar Email Sender (Opcional)

Se quiser enviar notificações por email depois:

1. Vá em **Authentication > Email Templates**
2. Configure o email de origem que desejar

## 3. Habilitar Sign-up Público

Para permitir que qualquer um se registre:

1. Vá em **Authentication > Policies**
2. Verifique que **Enable signup** está ativado
3. Salve as mudanças

## 4. Executar o Schema SQL

Se ainda não executou, execute o arquivo `schema.sql` completo:

1. Vá em **SQL Editor**
2. Copie todo o conteúdo de `schema.sql`
3. Cole e execute a query

## Após essas configurações:

✅ Usuários podem se registrar sem confirmar email
✅ Usuários podem fazer login imediatamente
✅ Sistema de notificações está configurado e pronto

---

## Troubleshooting

### Erro: "Email not confirmed"
- Verifique se desabilitou o email confirmation conforme acima

### Erro: "Row-level security"
- Execute novamente as políticas RLS fornecidas

### Usuários não recebem notificações
- Abra o console do navegador (F12) e verifique os erros
- Verifique se as corridas estão sendo criadas corretamente
