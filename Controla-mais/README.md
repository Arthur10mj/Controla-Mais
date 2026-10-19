# Controla+

Controle financeiro pessoal com **site + API Node.js + banco PostgreSQL no Neon**.

## Como rodar

Requisitos: Node.js 18 ou mais novo.

```bash
npm install
npm start
```

Abra http://localhost:3000. O servidor entrega o site e a API juntos (não use mais o Live Server).
O arquivo `.env` já vem com a conexão do banco `controla` (projeto `controla-mais` no Neon).

> **Atenção:** o `.env` contém a senha do banco. Ele está no `.gitignore`; não envie para o GitHub nem compartilhe o zip.
> Se precisar trocar a senha, gere outra no Console do Neon e atualize o `DATABASE_URL`.

## Banco de dados (Neon)

Esquema em `db/schema.sql` (idempotente; `npm run db:setup` aplica em qualquer banco novo):

| Tabela | Para que serve |
|---|---|
| `users` | contas (nome, e-mail único sem diferenciar maiúsculas, hash da senha) |
| `sessions` | sessões de login (guarda só o SHA-256 do token; expiram em 30 dias) |
| `transactions` | lançamentos de entrada/saída, sempre ligados a um usuário (`ON DELETE CASCADE`) |

O banco também garante as regras: valor > 0, status compatível com a direção (Entrada: Recebido/A receber; Saída: Pago/Em aberto/Quitado) e data de pagamento só em itens quitados.

## API

| Método | Rota | |
|---|---|---|
| POST | `/api/auth/register` · `/api/auth/login` · `/api/auth/logout` | cadastro, login, sair |
| GET / PATCH | `/api/auth/me` | usuário logado / alterar nome |
| GET / POST | `/api/transactions` | listar / criar |
| PUT / DELETE | `/api/transactions/:id` | editar / excluir um |
| DELETE | `/api/transactions` | apagar todos os lançamentos da conta |
| GET | `/api/health` | testa a conexão com o banco |

Segurança: senha com scrypt + sal; sessão em cookie `HttpOnly` + `SameSite=Lax` (`Secure` em produção); consultas parametrizadas; cada usuário só acessa os próprios dados; limite de tentativas de login; validação de tudo no servidor; cabeçalhos CSP.

## Publicar

Em Render, Railway, Fly.io etc.: comando de início `npm start`, variáveis `DATABASE_URL` e `NODE_ENV=production` (a hospedagem precisa servir em HTTPS).

## O que mudou no site

- Novos logos (menu, login, aba do navegador e ícone do celular) e paleta ajustada às cores deles; versão branca do logo para o tema escuro e para o login.
- Dados agora ficam no Neon: acesso de qualquer dispositivo, login de verdade.
- Dashboard: gráfico de colunas, "Próximos vencimentos" com botão **Pagar/Receber**, selo **Vencido** para contas atrasadas.
- Movimentações: busca por texto, botão de marcar como pago/recebido na linha.
- Tela de carregamento, aviso de erro de conexão e sessão expirada tratados.

## Estrutura

```
server/   API (index.js, auth.js, validate.js, db.js)
db/       schema.sql
public/   site (index.html, css/, js/, assets/)
scripts/  setup-db.js
```
