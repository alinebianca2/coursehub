# CourseHub — Secure User API

Projeto acadêmico de uma API REST para gerenciamento de usuários de uma
plataforma de cursos online fictícia. Feito para praticar autenticação,
autorização e boas práticas de segurança em uma aplicação web.

## 1. Descrição

O CourseHub é uma plataforma fictícia de cursos online. Neste trabalho não
existem cursos, aulas, matrículas ou pagamentos — o único recurso
implementado é o **cadastro de usuários** da plataforma.

A ideia é manter o projeto simples e colocar o esforço nos conceitos de
segurança pedidos no trabalho: login, permissões por perfil, proteção dos
dados e validação de entrada.

## 2. Objetivo

Este projeto foi feito para demonstrar, na prática:

- uma API REST (métodos HTTP, códigos de status, JSON);
- autenticação de usuários (login com e-mail e senha);
- autorização (o que cada perfil pode ou não fazer);
- uso de JWT (JSON Web Token);
- controle de acesso baseado em perfis (RBAC — Role-Based Access Control);
- boas práticas de segurança de aplicações web;
- integração entre um frontend em React e um backend em Node.js.

## 3. Tecnologias

**Backend**
- Node.js + TypeScript
- Express
- Prisma ORM
- SQLite (banco de dados em arquivo, sem precisar instalar nada)
- JSON Web Token (biblioteca `jsonwebtoken`)
- bcrypt (hash de senha)
- Zod (validação dos dados que chegam na API)

**Frontend**
- React
- Vite
- TypeScript

## 4. Arquitetura

O projeto é um monorepo simples com duas pastas:

```
coursehub/
├── backend/    -> API REST (Node/Express/Prisma)
└── frontend/   -> Interface web (React/Vite)
```

O **backend** expõe a API em `http://localhost:3333` e guarda os dados em um
arquivo SQLite (`backend/prisma/dev.db`). O **frontend** roda em
`http://localhost:5173` e conversa com o backend usando `fetch`, mandando o
token JWT no cabeçalho `Authorization` das requisições que precisam de
login.

Dentro do backend, o código é organizado em camadas:

```
backend/src/
├── controllers/   -> recebe a requisição e chama o service
├── services/      -> regra de negócio (ex: checar e-mail duplicado)
├── routes/        -> define os endpoints e quais middlewares usar
├── middlewares/    -> authenticate (login), authorize (permissão), errorHandler
├── validators/    -> schemas Zod que validam o corpo da requisição
├── utils/         -> funções auxiliares (JWT, erros, DTO de usuário)
└── prisma/        -> cliente do Prisma
```

Essa separação existe para deixar claro onde muda o quê: se é uma regra de
autorização, mexe no middleware; se é uma regra de negócio, mexe no
service; se é validação de dado, mexe no validator.

## 5. Instalação

Pré-requisitos: Node.js 18 ou superior e npm.

```bash
# clonar o repositório
git clone https://github.com/alinebianca2/coursehub.git
cd coursehub

# instalar as dependências do backend
cd backend
npm install

# instalar as dependências do frontend
cd ../frontend
npm install
```

## 6. Configuração

O backend usa variáveis de ambiente. Copie o arquivo de exemplo e ajuste se
quiser:

```bash
cd backend
cp .env.example .env
```

Variáveis do `backend/.env`:

| Variável | Para que serve | Exemplo |
|---|---|---|
| `PORT` | Porta onde a API sobe | `3333` |
| `DATABASE_URL` | Caminho do banco SQLite | `file:./dev.db` |
| `JWT_SECRET` | Segredo usado para assinar o token | uma string longa e aleatória |
| `JWT_EXPIRES_IN` | Tempo de validade do token | `1h` |
| `CORS_ORIGIN` | Origem do frontend liberada no CORS | `http://localhost:5173` |

O `.env` **não é versionado** (está no `.gitignore`), porque contém o
segredo do JWT. Quem for rodar o projeto precisa criar o próprio `.env` a
partir do `.env.example`.

O frontend também tem seu próprio `.env.example` (em `frontend/`), com a
URL da API:

```bash
cd frontend
cp .env.example .env
```

## 7. Banco de dados

O banco é SQLite, então não precisa instalar nenhum serviço de banco à
parte — ele fica em um arquivo local.

Para criar as tabelas (rodar a migration):

```bash
cd backend
npx prisma migrate dev
```

Isso já cria o banco (`dev.db`) e roda o seed automaticamente (populando os
3 usuários de demonstração). Se quiser rodar o seed de novo manualmente:

```bash
npm run prisma:seed
```

Para inspecionar o banco visualmente, dá para usar:

```bash
npm run prisma:studio
```

## 8. Execução

Em dois terminais separados:

```bash
# terminal 1 — backend
cd backend
npm run dev
# API em http://localhost:3333
```

```bash
# terminal 2 — frontend
cd frontend
npm run dev
# Interface em http://localhost:5173
```

Depois é só abrir `http://localhost:5173` no navegador e logar com um dos
usuários de demonstração abaixo.

## 9. Usuários de demonstração

Criados pelo seed, todos com a mesma senha: **`Demo@123`**

| Nome | E-mail | Perfil |
|---|---|---|
| Administrador | `admin@coursehub.com` | ADMIN |
| Operador | `operator@coursehub.com` | OPERATOR |
| Cliente | `client@coursehub.com` | CLIENT |

## 10. Endpoints

| Método | Endpoint | Finalidade | Perfil | Resposta de sucesso |
|---|---|---|---|---|
| POST | `/auth/login` | Autenticar e receber o token | Público (sem login) | 200 + `{ token, user }` |
| POST | `/users` | Cadastrar um novo usuário | ADMIN | 201 + usuário criado |
| GET | `/users` | Listar todos os usuários | ADMIN, OPERATOR | 200 + lista de usuários |
| GET | `/users/:id` | Consultar um usuário | ADMIN, OPERATOR, ou o próprio CLIENT | 200 + usuário |
| PUT | `/users/:id` | Atualizar um usuário | ADMIN, OPERATOR | 200 + usuário atualizado |
| DELETE | `/users/:id` | Excluir um usuário | ADMIN | 204 (sem conteúdo) |

Todas as rotas de `/users` exigem estar logado (token JWT no header
`Authorization`). A rota de login é a única pública.

Códigos de erro usados na API:

| Código | Quando acontece |
|---|---|
| 400 Bad Request | Dado inválido no corpo da requisição (ex: e-mail malformado, senha fraca) |
| 401 Unauthorized | Não está logado, token ausente, inválido ou expirado |
| 403 Forbidden | Está logado, mas o perfil não tem permissão para aquela ação |
| 404 Not Found | O usuário buscado não existe |
| 409 Conflict | E-mail já cadastrado por outro usuário |

## 11. JWT

O JWT é gerado no login (`POST /auth/login`), depois de conferir e-mail e
senha (senha comparada com bcrypt, nunca em texto puro).

**O que vai dentro do token** (o "payload"):

```json
{
  "sub": 1,
  "role": "ADMIN",
  "iat": 1234567890,
  "exp": 1234571490
}
```

- `sub`: id do usuário
- `role`: perfil do usuário (usado para autorização)
- `iat`: quando o token foi criado
- `exp`: quando o token expira

Não colocamos nome, e-mail nem senha dentro do token — só o mínimo
necessário para autenticar e autorizar.

**Expiração: 1 hora.** Foi escolhido esse tempo porque é um meio-termo
razoável: curto o suficiente para limitar o estrago se o token vazar, mas
longo o suficiente para não expirar no meio de uma demonstração ou de um
uso normal do sistema.

**Assinatura:** o token é assinado com HMAC SHA-256 (`HS256`), usando um
segredo (`JWT_SECRET`) guardado em variável de ambiente — nunca no código.

**Validação:** a cada requisição a uma rota protegida, o middleware
`authenticate` lê o header `Authorization: Bearer <token>`, verifica a
assinatura e a expiração do token e, se estiver tudo certo, coloca
`{ id, role }` do usuário em `req.user` para o resto da aplicação usar. Se
o token estiver ausente, inválido ou expirado, a API responde `401`.

## 12. RBAC

A API tem 3 perfis:

**ADMIN** — administra a plataforma. Pode cadastrar, listar, consultar,
editar e excluir qualquer usuário.

**OPERATOR** — funcionário de atendimento. Pode listar, consultar e editar
usuários, mas **não** pode cadastrar nem excluir.

**CLIENT** — aluno da plataforma. Só pode consultar os **próprios** dados.
Não pode listar todos os usuários, nem ver os dados de outro CLIENT, nem
cadastrar, editar ou excluir ninguém.

Matriz de autorização:

| Ação | ADMIN | OPERATOR | CLIENT |
|---|---|---|---|
| Cadastrar usuário | sim | não | não |
| Listar usuários | sim | sim | não |
| Consultar usuário | sim | sim | só o próprio |
| Editar usuário | sim | sim | não |
| Excluir usuário | sim | não | não |

Isso é implementado com dois middlewares:

- `authorize("ADMIN", "OPERATOR")` — libera só para os perfis passados
  como parâmetro; qualquer outro perfil recebe `403`.
- `authorizeSelfOrRoles("ADMIN", "OPERATOR")` — usado só em
  `GET /users/:id`, porque essa rota tem uma regra a mais: além de ADMIN e
  OPERATOR, libera também se o `:id` da URL for o mesmo id do usuário
  logado (regra de **ownership**, para o CLIENT ver só os próprios dados).

Importante: essa checagem é toda feita no **backend**. O frontend até
esconde alguns botões pra melhorar a experiência (por exemplo, um CLIENT
não vê o menu "Usuários"), mas isso é só estética — se alguém tentar chamar
a API direto pelo Postman ou curl sem permissão, a API recusa do mesmo
jeito.

## 13. OAuth 2.0

**OAuth 2.0 não foi implementado neste projeto.** A autenticação usada aqui
é JWT simples (login com e-mail/senha). Esta seção é só uma explicação
conceitual de como o OAuth 2.0 poderia ser usado no futuro, caso uma
aplicação parceira (de terceiros) precisasse acessar a API do CourseHub em
nome de um usuário.

1. **Registro da aplicação parceira**: a empresa parceira cria uma conta de
   desenvolvedor no CourseHub e registra sua aplicação, recebendo um
   `client_id` e um `client_secret`.
2. **Autorização pelo usuário**: quando o usuário usa a aplicação
   parceira, ela redireciona o usuário para uma tela de login do CourseHub,
   onde ele autoriza (ou não) o acesso, sem nunca digitar a senha dentro
   da aplicação parceira.
3. **Obtenção do access token**: depois que o usuário autoriza, o
   CourseHub devolve um código para a aplicação parceira, que troca esse
   código por um `access_token` (fluxo Authorization Code).
4. **Envio do token à API**: a aplicação parceira usa esse `access_token`
   no header `Authorization: Bearer <access_token>` para chamar a API,
   igual ao JWT usado hoje.
5. **Escopos (scopes)**: o token poderia ter escopos, tipo `users:read`,
   limitando o que a aplicação parceira pode fazer — por exemplo, só ler
   dados, sem poder editar ou excluir.
6. **Benefícios**: o usuário controla o que autoriza e pode revogar o
   acesso quando quiser, sem precisar trocar de senha.
7. **Por que evita expor a senha**: com OAuth 2.0, a aplicação parceira
   nunca vê a senha do usuário — ela só recebe um token com permissões
   limitadas. Isso é mais seguro do que o usuário dar a própria senha do
   CourseHub para um sistema de terceiros.

## 14. Segurança

Riscos considerados neste projeto e como cada um foi tratado:

**1. Senha em texto puro**
Se o banco vazasse, as senhas não poderiam ficar expostas.
*Mitigação:* senha sempre passa por bcrypt antes de salvar; nunca é salva
nem devolvida em texto puro. A API também exige senha com no mínimo 8
caracteres, com letra e número.

**2. Roubo do token JWT**
Se alguém conseguir o token de outra pessoa, consegue agir como ela até o
token expirar.
*Mitigação:* expiração curta (1h), segredo forte fora do código
(variável de ambiente), algoritmo de assinatura fixado explicitamente
(`HS256`, para evitar ataques de "confusão de algoritmo"), e recomendação
de usar HTTPS em produção (ver abaixo).

**3. Acesso indevido a endpoints**
Alguém tentar chamar `/users` sem estar logado, ou logado com um perfil
sem permissão.
*Mitigação:* middleware `authenticate` (bloqueia sem token válido) +
middleware `authorize` (bloqueia perfil sem permissão), aplicados sempre
no backend.

**4. IDOR — acesso aos dados de outro usuário**
Um CLIENT tentar ver os dados de outro CLIENT só trocando o `id` na URL.
*Mitigação:* checagem de ownership no backend (`authorizeSelfOrRoles`),
comparando o id do usuário autenticado com o id pedido na URL.

**5. Dados de entrada maliciosos ou malformados**
Alguém mandar um payload estranho tentando quebrar a API ou inserir dado
inválido.
*Mitigação:* validação com Zod em todo endpoint que recebe dados (login,
criar e editar usuário), incluindo formato de e-mail e senha mínima.
Erros de validação voltam como `400`, sem quebrar a aplicação.

**6. Enumeração de usuários pelo login**
Alguém tentar descobrir quais e-mails estão cadastrados testando o login.
*Mitigação:* a mensagem de erro do login é sempre a mesma ("e-mail ou
senha inválidos"), sem dizer se o e-mail existe ou não.

**7. Exposição de dados sensíveis nas respostas**
A senha (hash) acabar aparecendo em alguma resposta da API por engano.
*Mitigação:* o `passwordHash` nunca é incluído nas respostas — as rotas
sempre devolvem um objeto de usuário "público", montado à parte,
sem esse campo.

**Outras práticas usadas:**
- CORS configurado para aceitar só a origem do frontend, e só os
  métodos/headers necessários.
- Erros inesperados não retornam stack trace pro cliente, só uma mensagem
  genérica (o erro completo é logado no servidor).
- **HTTPS**: este projeto roda em HTTP localmente, para fins de estudo.
  Em produção, seria obrigatório usar HTTPS, porque sem ele qualquer dado
  trafegando entre frontend e backend (incluindo o JWT e a senha no
  login) pode ser interceptado na rede.

## 15. Exemplos de requisições

**Login**

```bash
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@coursehub.com","password":"Demo@123"}'
```

Resposta:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Administrador",
    "email": "admin@coursehub.com",
    "role": "ADMIN",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

**Listar usuários** (ADMIN ou OPERATOR)

```bash
curl http://localhost:3333/users \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Criar usuário** (só ADMIN)

```bash
curl -X POST http://localhost:3333/users \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"name":"Novo Aluno","email":"novo@coursehub.com","password":"Senha123","role":"CLIENT"}'
```

**Consultar um usuário**

```bash
curl http://localhost:3333/users/3 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Editar um usuário** (ADMIN ou OPERATOR)

```bash
curl -X PUT http://localhost:3333/users/3 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"name":"Nome Atualizado"}'
```

**Excluir um usuário** (só ADMIN)

```bash
curl -X DELETE http://localhost:3333/users/3 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Tentativa sem token** (exemplo de erro)

```bash
curl http://localhost:3333/users
# 401 Unauthorized
# {"error":"Token de autenticação não informado"}
```

Um script com todos esses cenários (e mais os casos de erro) já rodado e
validado está em `backend/tests/scenarios.sh`.
