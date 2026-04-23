<p align="center">
  <img src="https://github.com/user-attachments/assets/967ecfab-8c40-42f6-9bf8-29bdc92bce46" width="225" height="225" />
</p>

# 🖥️ Product Manager — Frontend

Interface web do sistema de gerenciamento de produtos, categorias e usuários. Construída com **Next.js** e a biblioteca de componentes **UI-GovPE**, com suporte a autenticação JWT, controle de acesso por perfis e layout totalmente responsivo.

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Tecnologias](#-tecnologias)
- [Telas Disponíveis](#-telas-disponíveis)
- [Funcionalidades](#-funcionalidades)
- [Pré-requisitos](#-pré-requisitos)
- [Como Rodar](#-como-rodar)
- [Credenciais para Teste](#-credenciais-para-teste)
- [Perfis de Acesso](#-perfis-de-acesso)
- [Mobile First](#-mobile-first)

---

## 🔭 Visão Geral

O frontend do **Product Manager** é uma SPA construída sobre Next.js que consome a API REST do backend. Ele oferece autenticação via JWT, proteção de rotas com middleware, controle de acesso por perfil e uma experiência responsiva adaptada para dispositivos móveis e desktop.

---

## 🚀 Tecnologias

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Next.js | 16 | Framework React (SSR + roteamento) |
| TypeScript | — | Tipagem estática |
| UI-GovPE | — | Biblioteca de componentes visuais |
| Axios | — | Requisições HTTP à API |
| React Hook Form | — | Gerenciamento de formulários |
| Zod | — | Validação de schemas |
| Tailwind CSS | — | Estilização utilitária |

---

## 🗺️ Telas Disponíveis

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/login` | Público | Autenticação com e-mail e senha |
| `/dashboard` | USER / ADMIN | Visão geral com totais do sistema |
| `/dashboard/products` | USER / ADMIN | Listagem com busca, paginação, favoritos, upload de imagem e vínculo de categoria |
| `/dashboard/categories` | USER / ADMIN | Listagem com busca e paginação |
| `/dashboard/users` | ADMIN | Gerenciamento de usuários |
| `/dashboard/audit` | ADMIN | Relatório de auditoria com filtros |

---

## ✅ Funcionalidades

### Autenticação e Autorização
- Login com e-mail e senha via JWT
- Token armazenado em `localStorage` e cookie para compatibilidade com SSR
- Proteção de rotas via middleware Next.js
- Redirecionamento automático baseado no perfil do usuário

### Listagens Avançadas
- Paginação em todas as tabelas
- Barra de pesquisa em tempo real
- Filtro por categoria na listagem de produtos
- Filtros por entidade, ação e usuário na auditoria

### Produtos
- Criar, editar e deletar produtos
- Upload de imagem diretamente na tela de criação/edição
- Vincular uma ou mais categorias ao produto
- Favoritar e desfavoritar produtos

### Categorias
- Criar, editar e deletar categorias
- Busca em tempo real

### Usuários (ADMIN)
- Criar, editar e deletar usuários
- Upload de avatar
- Filtro por perfil (USER / ADMIN)

### Notificações
- Indicador visual de notificações não lidas no cabeçalho
- Marcar notificação individual ou todas como lidas
- Notificações geradas quando outro usuário interage com seus recursos

### Auditoria (ADMIN)
- Relatório filtrado por entidade, tipo de ação e usuário
- Exibe quem fez, o que fez e quando

---

## 📦 Pré-requisitos

- [Docker](https://www.docker.com/) — versão 24 ou superior
- [Docker Compose](https://docs.docker.com/compose/) — versão 2 ou superior

> Node.js **não é necessário localmente**. O frontend roda dentro do container Docker.

---

## ▶️ Como Rodar

O frontend faz parte do ambiente orquestrado via Docker Compose na raiz do monorepo.

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/fullstack-challenge.git
cd fullstack-challenge
```

### 2. Suba o ambiente completo

```bash
docker compose up --build
```

### 3. Acesse a aplicação

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend (API) | http://localhost:3001 |

### Parar o ambiente

```bash
docker compose down
```

---

## 🔐 Credenciais para Teste

| Perfil | E-mail | Senha |
|--------|--------|-------|
| ADMIN | `admin@admin.com` | `123456` |
| USER | `user@user.com` | `123456` |

---

## 👥 Perfis de Acesso

### USER
- Acessa as telas de Produtos e Categorias
- Pode criar, editar e deletar seus próprios recursos
- Pode favoritar qualquer produto
- Recebe notificações quando alguém interage com seus recursos

### ADMIN
- Acessa todas as telas, incluindo Usuários e Auditoria
- Pode editar e deletar qualquer recurso do sistema
- Visualiza os totais gerais no dashboard

---

## 📱 Mobile First

A interface foi desenvolvida com foco em responsividade:

- Layout adaptável configurado via `LayoutProvider`
- Colunas das tabelas ocultadas progressivamente em telas menores
- Componentes da UI-GovPE responsivos por padrão

---

## 🌿 Branches Relacionadas

| Branch | Descrição |
|--------|-----------|
| `feature/frontend-auth` | Tela de login e middleware de proteção de rotas |
| `feature/frontend-dashboard` | Dashboard completo com todas as telas |
| `docs/readme` | Documentação |