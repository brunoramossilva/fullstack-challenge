# 🛒 Product Manager — Avaliação Técnica Full-Stack Perpart

Sistema completo de gerenciamento de produtos, categorias e usuários, desenvolvido como avaliação técnica Full-Stack. A aplicação conta com autenticação JWT, controle de acesso por perfis, auditoria de ações, upload de arquivos, notificações e interface construída com a biblioteca **UI-GovPE**.

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Tecnologias](#-tecnologias)
- [Funcionalidades](#-funcionalidades)
- [Regras de Negócio](#-regras-de-negócio)
- [Modelagem de Dados](#-modelagem-de-dados)
- [Pré-requisitos](#-pré-requisitos)
- [Como Rodar o Projeto](#-como-rodar-o-projeto)
- [Credenciais para Teste](#-credenciais-para-teste)
- [Documentação da API](#-documentação-da-api)
- [Perfis de Acesso](#-perfis-de-acesso)
- [Upload de Arquivos](#-upload-de-arquivos)
- [Auditoria e Relatórios](#-auditoria-e-relatórios)
- [Fluxo Git](#-fluxo-git)

---

## 🔭 Visão Geral

O **Product Manager** é uma aplicação web full-stack que permite o gerenciamento centralizado de produtos, categorias e usuários. O sistema possui dois perfis de acesso — **USER** e **ADMIN** — com permissões distintas, rastreamento completo de ações e suporte a upload de imagens.

### Telas disponíveis

| Rota | Descrição |
|------|-----------|
| `/login` | Autenticação com e-mail e senha |
| `/dashboard` | Visão geral do sistema (totais) |
| `/dashboard/products` | Listagem de produtos com busca, paginação, favoritos, upload de imagem e vínculo de categoria |
| `/dashboard/categories` | Listagem de categorias com busca e paginação |
| `/dashboard/users` | Listagem de usuários — exclusivo ADMIN |
| `/dashboard/audit` | Relatório de auditoria — exclusivo ADMIN |

---

## 🚀 Tecnologias

### Backend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| NestJS | ^11 | Framework principal |
| Prisma | ^7 | ORM |
| PostgreSQL | 15 | Banco de dados |
| JWT + Passport | — | Autenticação |
| Bcrypt | — | Hash de senhas |
| Multer | — | Upload de arquivos |
| Class Validator | — | Validação de DTOs |
| Swagger | — | Documentação interativa da API |
| Faker.js | — | Seed de dados |

### Frontend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Next.js | 16 | Framework React |
| TypeScript | — | Tipagem estática |
| UI-GovPE | — | Biblioteca de componentes |
| Axios | — | Requisições HTTP |
| React Hook Form | — | Gerenciamento de formulários |
| Zod | — | Validação de schemas |
| Tailwind CSS | — | Estilização |

### Infraestrutura
| Tecnologia | Uso |
|------------|-----|
| Docker | Containerização |
| Docker Compose | Orquestração dos serviços |

---

## ✅ Funcionalidades

### Autenticação e Autorização
- Login com e-mail e senha via JWT
- Proteção de rotas no backend com `JwtAuthGuard`
- Proteção de rotas no frontend com middleware Next.js
- Controle de acesso por perfil com `RolesGuard`
- Token armazenado em `localStorage` e cookie para compatibilidade SSR

### CRUD Completo
- **Usuários** — criar, listar, buscar, atualizar e deletar
- **Categorias** — criar, listar, buscar, atualizar e deletar
- **Produtos** — criar, listar, buscar, atualizar, deletar, favoritar, vincular categoria e fazer upload de imagem

### Listagens Avançadas
- Paginação em todas as listagens
- Barra de pesquisa em tempo real
- Filtros por entidade, ação e usuário (auditoria)
- Filtro por categoria em produtos

### Auditoria e Relatórios
- Rastreamento automático de todas as ações de escrita (CREATE, UPDATE, DELETE)
- Registro de quem fez, o que fez e quando
- Filtros por entidade, tipo de ação e usuário
- Acesso exclusivo para ADMIN

### Upload de Arquivos
- Upload de avatar para usuários
- Upload de imagem para produtos diretamente na tela de criação/edição
- Arquivos servidos como assets estáticos via `/uploads`

### Favoritos e Notificações
- Usuários podem favoritar N produtos
- Notificações geradas automaticamente quando um usuário interage com entidade de outro usuário (ex: favorita um produto)
- Notificação enviada ao dono do recurso afetado
- Indicador visual de notificações não lidas

### Perfis
- **USER** — gerencia seus próprios produtos e categorias, favorita produtos
- **ADMIN** — cadastra e exclui usuários, acessa auditoria, pode excluir qualquer produto, visão geral do sistema

### Mobile First
- Interface totalmente responsiva
- Colunas da tabela ocultadas progressivamente em telas menores
- Layout adaptável via breakpoint configurado no `LayoutProvider`

---

## 📐 Regras de Negócio

### Perfil USER
- Pode cadastrar Produtos e criar Categorias
- Pode visualizar todos os Produtos e Categorias do sistema
- Pode favoritar N Produtos
- Só pode editar e deletar seus próprios recursos

### Perfil ADMIN
- Pode cadastrar, editar e deletar Usuários
- Pode editar e deletar qualquer recurso do sistema
- Pode gerar relatórios detalhados de auditoria
- Tem acesso à visão geral do sistema (totais de Produtos, Categorias e Usuários)

---

## 🗄️ Modelagem de Dados

```
User
├── id (uuid)
├── name (string)
├── email (string, unique)
├── password (string, hashed)
├── role (USER | ADMIN)
├── avatar (string, optional)
├── createdAt
└── updatedAt

Category
├── id (uuid)
├── name (string)
├── ownerId → User
├── createdAt
└── updatedAt

Product
├── id (uuid)
├── name (string)
├── description (string, optional)
├── imageUrl (string, optional)
├── ownerId → User
├── createdAt
└── updatedAt

ProductCategory (N:N)
├── productId → Product
└── categoryId → Category

Favorite (N:N)
├── userId → User
└── productId → Product

AuditLog
├── id (uuid)
├── action (CREATE | UPDATE | DELETE)
├── entity (User | Product | Category)
├── entityId (string)
├── performedBy → User
└── createdAt

Notification
├── id (uuid)
├── message (string)
├── read (boolean)
├── userId → User (destinatário)
└── createdAt
```

### Relacionamentos (cardinalidade 1:N)
- Um **Usuário** pode possuir N **Produtos**
- Um **Usuário** pode possuir N **Categorias**
- Um **Produto** pode possuir N **Categorias** (via ProductCategory)

---

## 📦 Pré-requisitos

- [Docker](https://www.docker.com/) — versão 24 ou superior
- [Docker Compose](https://docs.docker.com/compose/) — versão 2 ou superior
- [Git](https://git-scm.com/)

> Node.js **não é necessário**. Tudo roda dentro dos containers, incluindo migrations e seed.

---

## ▶️ Como Rodar o Projeto

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/fullstack-challenge.git
cd fullstack-challenge
```

### 2. Suba o ambiente completo

```bash
docker compose up --build
```

Isso irá:
- Subir o banco de dados PostgreSQL
- Executar as migrations automaticamente
- Popular o banco com dados de seed (usuários, produtos e categorias via Faker.js)
- Iniciar o backend e o frontend

Aguarde até ver a mensagem:

```
🚀 Application is running!
📦 Backend:  http://localhost:3001
🗄️  Database: PostgreSQL connected
🌐 Frontend: http://localhost:3000
```

> Nenhuma configuração de `.env` é necessária — os valores padrão já estão embutidos para ambiente local.

### 3. Acesse a aplicação

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend (API) | http://localhost:3001 |
| Swagger (docs) | http://localhost:3001/api |
| Banco de dados | localhost:5432 |

### Parar o ambiente

```bash
docker compose down
```

### Parar e limpar volumes (reset completo)

```bash
docker compose down -v
```

---

## 🔐 Credenciais para Teste

As seguintes contas são criadas automaticamente pelo seed:

### ADMIN
| Campo | Valor |
|-------|-------|
| E-mail | `admin@admin.com` |
| Senha | `123456` |

### USER
| Campo | Valor |
|-------|-------|
| E-mail | `user@user.com` |
| Senha | `123456` |

---

## 📡 Documentação da API

A documentação interativa está disponível via **Swagger** em http://localhost:3001/api após subir o Docker.

Para testar rotas protegidas no Swagger:
1. Clique em **Authorize** no canto superior direito
2. Cole o token JWT obtido em `/auth/login`
3. Clique em **Authorize** e feche
4. Todos os endpoints protegidos passarão a usar o token automaticamente

### Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/auth/register` | Criar conta | ❌ |
| POST | `/auth/login` | Login, retorna JWT | ❌ |

### Usuários

| Método | Endpoint | Descrição | Auth | Role |
|--------|----------|-----------|------|------|
| GET | `/users` | Listar usuários | ✅ | ANY |
| GET | `/users/:id` | Buscar usuário | ✅ | ANY |
| POST | `/users` | Criar usuário | ✅ | ADMIN |
| PATCH | `/users/:id` | Atualizar usuário | ✅ | ADMIN |
| DELETE | `/users/:id` | Deletar usuário | ✅ | ADMIN |

**Query params disponíveis em `GET /users`:**
- `page` — número da página (padrão: 1)
- `limit` — itens por página (padrão: 10)
- `search` — busca por nome ou e-mail
- `role` — filtro por perfil (`USER` | `ADMIN`)

### Categorias

| Método | Endpoint | Descrição | Auth | Role |
|--------|----------|-----------|------|------|
| GET | `/categories` | Listar categorias | ✅ | ANY |
| GET | `/categories/:id` | Buscar categoria | ✅ | ANY |
| POST | `/categories` | Criar categoria | ✅ | ANY |
| PATCH | `/categories/:id` | Atualizar categoria | ✅ | ANY |
| DELETE | `/categories/:id` | Deletar categoria | ✅ | ANY |

**Query params disponíveis em `GET /categories`:**
- `page`, `limit`, `search`

### Produtos

| Método | Endpoint | Descrição | Auth | Role |
|--------|----------|-----------|------|------|
| GET | `/products` | Listar produtos | ✅ | ANY |
| GET | `/products/favorites` | Listar favoritos do usuário | ✅ | ANY |
| GET | `/products/:id` | Buscar produto | ✅ | ANY |
| POST | `/products` | Criar produto | ✅ | ANY |
| PATCH | `/products/:id` | Atualizar produto | ✅ | ANY |
| DELETE | `/products/:id` | Deletar produto | ✅ | ANY |
| POST | `/products/:id/favorite` | Favoritar/desfavoritar | ✅ | ANY |

**Query params disponíveis em `GET /products`:**
- `page`, `limit`, `search`, `categoryId`

### Upload

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/upload/user/avatar` | Upload de avatar | ✅ |
| POST | `/upload/product/:id/image` | Upload de imagem | ✅ |

> Requisições de upload devem usar `multipart/form-data` com o campo `file`.

### Auditoria

| Método | Endpoint | Descrição | Auth | Role |
|--------|----------|-----------|------|------|
| GET | `/audit-logs` | Listar logs de auditoria | ✅ | ADMIN |

**Query params disponíveis:**
- `page`, `limit`, `entity` (`User` | `Product` | `Category`), `action` (`CREATE` | `UPDATE` | `DELETE`), `userId`

### Notificações

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/notifications` | Listar notificações do usuário | ✅ |
| PATCH | `/notifications/:id/read` | Marcar como lida | ✅ |
| PATCH | `/notifications/read-all` | Marcar todas como lidas | ✅ |

---

## 👥 Perfis de Acesso

### USER
- Acessa: Produtos, Categorias
- Pode criar, editar e deletar seus próprios recursos
- Pode favoritar qualquer produto
- Recebe notificações quando alguém interage com seus recursos

### ADMIN
- Acessa: tudo que o USER acessa, mais Usuários e Auditoria
- Pode criar, editar e deletar qualquer recurso do sistema, incluindo usuários e produtos de terceiros
- Acessa o painel de auditoria com relatórios filtráveis
- Acessa a visão geral com totais do sistema

---

## 📁 Upload de Arquivos

Os arquivos enviados são armazenados localmente na pasta `/uploads` dentro do container do backend e servidos como assets estáticos.

### Como fazer upload via Insomnia/Postman

1. Método: `POST`
2. URL: `http://localhost:3001/upload/user/avatar`
3. Aba Auth: Bearer Token com o JWT
4. Aba Body: `Form Data`
5. Campo: `file` → tipo `File` → selecione a imagem

Após o upload, o campo `avatar` ou `imageUrl` do registro é atualizado automaticamente.

> ⚠️ Os arquivos ficam armazenados dentro do container. Ao rodar `docker compose down -v`, os arquivos são perdidos. Para persistência, configure um volume externo.

---

## 📊 Auditoria e Relatórios

O sistema rastreia automaticamente todas as operações de escrita:

| Ação | Quando é registrada |
|------|---------------------|
| `CREATE` | Ao criar um usuário, produto ou categoria |
| `UPDATE` | Ao atualizar qualquer entidade |
| `DELETE` | Ao deletar qualquer entidade |

Cada log contém:
- **Quem** realizou a ação (usuário + e-mail)
- **O que** foi feito (ação + entidade)
- **Qual registro** foi afetado (entityId)
- **Quando** aconteceu (timestamp)

O relatório pode ser filtrado por entidade, tipo de ação e usuário, e está disponível em `/dashboard/audit` para usuários ADMIN.

---

## 🌿 Fluxo Git

Este projeto segue o fluxo de branches com PRs:

```
main          ← código estável
develop       ← branch de integração
  └── feature/*
  └── chore/*
  └── docs/*
```

### Convenção de commits (Conventional Commits)

```
feat: nova funcionalidade
fix: correção de bug
chore: configuração, setup
docs: documentação
refactor: refatoração sem mudança de comportamento
```

### Branches criadas neste projeto

| Branch | Descrição |
|--------|-----------|
| `chore/project-setup` | Scaffold inicial do monorepo |
| `feature/database-schema` | Schema Prisma e migrations |
| `feature/auth-jwt` | Autenticação JWT com guards |
| `feature/crud-users` | CRUD de usuários |
| `feature/crud-categories` | CRUD de categorias |
| `feature/crud-products` | CRUD de produtos com favoritos |
| `feature/audit-log` | Sistema de auditoria |
| `feature/file-upload` | Upload de arquivos |
| `feature/notifications` | Notificações ao dono do recurso |
| `feature/swagger` | Documentação interativa com Swagger |
| `feature/seed` | Seed com dados fictícios via Faker.js |
| `feature/frontend-auth` | Tela de login |
| `feature/frontend-dashboard` | Dashboard completo |
| `docs/readme` | Este README |

---

## 🐳 Docker

O projeto conta com três serviços orquestrados via Docker Compose:

| Serviço | Imagem | Porta |
|---------|--------|-------|
| `db` | postgres:15 | 5432 |
| `backend` | node:20-slim (build local) | 3001 |
| `frontend` | node:20-slim (build local) | 3000 |

### Comandos úteis

```bash
# Subir todos os serviços
docker compose up

# Subir e forçar rebuild das imagens
docker compose up --build

# Subir em background
docker compose up -d

# Ver logs do backend
docker logs challenge_backend -f

# Acessar o banco de dados
docker exec -it challenge_db psql -U postgres -d challenge_db

# Derrubar os serviços
docker compose down

# Derrubar e remover volumes (reset do banco)
docker compose down -v
```

---

## 🙏 Agradecimento

Obrigado pela oportunidade e pelo tempo dedicado à avaliação deste projeto. Foi um prazer desenvolver cada etapa com atenção aos detalhes e cuidado com a qualidade. Fico à disposição para qualquer dúvida ou conversa sobre as decisões tomadas.
