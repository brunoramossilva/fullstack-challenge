<p align="center">
  <img src="https://github.com/user-attachments/assets/967ecfab-8c40-42f6-9bf8-29bdc92bce46" width="225" height="225" />
</p>

# ⚙️ Product Manager — Backend

API REST do sistema de gerenciamento de produtos, categorias e usuários. Construída com **NestJS** e **Prisma**, com autenticação JWT, controle de acesso por perfis, auditoria automática, upload de arquivos e notificações.

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Tecnologias](#-tecnologias)
- [Modelagem de Dados](#-modelagem-de-dados)
- [Regras de Negócio](#-regras-de-negócio)
- [Pré-requisitos](#-pré-requisitos)
- [Como Rodar](#-como-rodar)
- [Documentação da API](#-documentação-da-api)
- [Credenciais para Teste](#-credenciais-para-teste)
- [Upload de Arquivos](#-upload-de-arquivos)
- [Auditoria](#-auditoria)
- [Fluxo Git](#-fluxo-git)

---

## 🔭 Visão Geral

O backend do **Product Manager** expõe uma API REST que gerencia usuários, produtos e categorias, com dois perfis de acesso — **USER** e **ADMIN**. Toda operação de escrita é registrada automaticamente em logs de auditoria, e notificações são geradas quando um usuário interage com recursos de outro.

---

## 🚀 Tecnologias

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
| Faker.js | — | Seed de dados fictícios |

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

### Relacionamentos

- Um **Usuário** pode possuir N **Produtos**
- Um **Usuário** pode possuir N **Categorias**
- Um **Produto** pode pertencer a N **Categorias** (via `ProductCategory`)
- Um **Usuário** pode favoritar N **Produtos** (via `Favorite`)

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

## 📦 Pré-requisitos

- [Docker](https://www.docker.com/) — versão 24 ou superior
- [Docker Compose](https://docs.docker.com/compose/) — versão 2 ou superior

> Node.js **não é necessário localmente**. Tudo roda dentro dos containers, incluindo migrations e seed.

---

## ▶️ Como Rodar

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
- Subir o banco PostgreSQL
- Executar as migrations automaticamente
- Popular o banco com dados de seed via Faker.js
- Iniciar o backend na porta `3001`

Aguarde até ver:

```
🚀 Application is running!
📦 Backend:  http://localhost:3001
🗄️  Database: PostgreSQL connected
```

### Parar o ambiente

```bash
docker compose down
```

### Reset completo (apaga volumes)

```bash
docker compose down -v
```

### Comandos úteis

```bash
# Ver logs do backend
docker logs challenge_backend -f

# Acessar o banco de dados
docker exec -it challenge_db psql -U postgres -d challenge_db
```

---

## 📡 Documentação da API

A documentação interativa está disponível via **Swagger** em http://localhost:3001/api após subir o Docker.

Para testar rotas protegidas no Swagger:
1. Clique em **Authorize** no canto superior direito
2. Cole o token JWT obtido em `POST /auth/login`
3. Clique em **Authorize** e feche o modal

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

**Query params em `GET /users`:** `page`, `limit`, `search`, `role`

### Categorias

| Método | Endpoint | Descrição | Auth | Role |
|--------|----------|-----------|------|------|
| GET | `/categories` | Listar categorias | ✅ | ANY |
| GET | `/categories/:id` | Buscar categoria | ✅ | ANY |
| POST | `/categories` | Criar categoria | ✅ | ANY |
| PATCH | `/categories/:id` | Atualizar categoria | ✅ | ANY |
| DELETE | `/categories/:id` | Deletar categoria | ✅ | ANY |

**Query params em `GET /categories`:** `page`, `limit`, `search`

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

**Query params em `GET /products`:** `page`, `limit`, `search`, `categoryId`

### Upload

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/upload/user/avatar` | Upload de avatar | ✅ |
| POST | `/upload/product/:id/image` | Upload de imagem do produto | ✅ |

> Requisições de upload devem usar `multipart/form-data` com o campo `file`.

### Auditoria

| Método | Endpoint | Descrição | Auth | Role |
|--------|----------|-----------|------|------|
| GET | `/audit-logs` | Listar logs de auditoria | ✅ | ADMIN |

**Query params:** `page`, `limit`, `entity` (`User` | `Product` | `Category`), `action` (`CREATE` | `UPDATE` | `DELETE`), `userId`

### Notificações

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/notifications` | Listar notificações do usuário | ✅ |
| PATCH | `/notifications/:id/read` | Marcar como lida | ✅ |
| PATCH | `/notifications/read-all` | Marcar todas como lidas | ✅ |

---

## 🔐 Credenciais para Teste

As seguintes contas são criadas automaticamente pelo seed:

| Perfil | E-mail | Senha |
|--------|--------|-------|
| ADMIN | `admin@admin.com` | `123456` |
| USER | `user@user.com` | `123456` |

---

## 📁 Upload de Arquivos

Os arquivos são armazenados localmente na pasta `/uploads` dentro do container e servidos como assets estáticos via `/uploads`.

### Como testar via Insomnia/Postman

1. Método: `POST`
2. URL: `http://localhost:3001/upload/user/avatar`
3. Auth: Bearer Token com o JWT
4. Body: `Form Data` → campo `file` → tipo `File` → selecione a imagem

Após o upload, o campo `avatar` ou `imageUrl` do registro é atualizado automaticamente.

> ⚠️ Os arquivos ficam dentro do container. Ao rodar `docker compose down -v`, os arquivos são perdidos. Para persistência, configure um volume externo.

---

## 📊 Auditoria

O sistema rastreia automaticamente todas as operações de escrita:

| Ação | Quando é registrada |
|------|---------------------|
| `CREATE` | Ao criar um usuário, produto ou categoria |
| `UPDATE` | Ao atualizar qualquer entidade |
| `DELETE` | Ao deletar qualquer entidade |

Cada log contém:
- **Quem** realizou a ação (usuário + e-mail)
- **O que** foi feito (ação + entidade)
- **Qual registro** foi afetado (`entityId`)
- **Quando** aconteceu (timestamp)

---

## 🌿 Fluxo Git

```
main          ← código estável
develop       ← branch de integração
  └── feature/*
  └── chore/*
  └── docs/*
```

### Convenção de commits

```
feat: nova funcionalidade
fix: correção de bug
chore: configuração, setup
docs: documentação
refactor: refatoração sem mudança de comportamento
```

### Branches do backend

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
| `feature/swagger` | Documentação com Swagger |
| `feature/seed` | Seed com dados fictícios via Faker.js |