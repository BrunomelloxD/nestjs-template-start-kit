# NestJS Project Starter Kit

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  Um template inicial para aplicações backend escaláveis utilizando <a href="http://nodejs.org" target="_blank">Node.js</a> e o framework <a href="https://github.com/nestjs/nest">NestJS</a>.
</p>

## 📖 Descrição

Este projeto é um **starter kit para aplicações backend modernas com NestJS**, pensado para acelerar o desenvolvimento de APIs escaláveis, seguras e bem estruturadas.  

O objetivo é fornecer uma base sólida que já inclua:  

- ⚡ **NestJS + TypeScript** → Estrutura modular, tipagem forte e arquitetura limpa.  
- 🗄️ **Prisma ORM** → Gerenciamento de banco de dados moderno e intuitivo.  
- 🐳 **Ambiente Dockerizado** → Suba a aplicação e o banco de dados com um único comando, garantindo consistência entre ambientes de desenvolvimento.  
- 🔐 **Autenticação e Autorização** → Fluxo de login, recuperação e reset de senha já implementados.  
- 📬 **Integração com envio de e-mails** → Serviço de e-mail configurável para notificações.  
- 🧪 **Testes Unitários e E2E** → Estrutura pronta para manter qualidade e confiabilidade do código.  
- 📦 **Boas práticas e padrões** → ESLint, Prettier, DTOs, Guards, Decorators e modularização.  

Com isso, você pode focar no que importa: **construir as regras de negócio da sua aplicação**, sem se preocupar em configurar tudo do zero. 

---

## 📂 Estrutura do Projeto

```
├── 📁 prisma/
│   ├── 📁 migrations/
│   │   ├── 📁 20250807003811_init/
│   │   │   └── 🗄️ migration.sql
│   │   ├── 📁 20250807011946_init/
│   │   │   └── 🗄️ migration.sql
│   │   ├── 📁 20250808004553_create_table_password_reset_code/
│   │   │   └── 🗄️ migration.sql
│   │   └── ⚙️ migration_lock.toml
│   └── 📄 schema.prisma
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📄 app.module.ts
│   │   └── 📄 main.ts
│   ├── 📁 common/
│   │   ├── 📁 config/
│   │   │   └── 📄 env.config.ts
│   │   ├── 📁 decorators/
│   │   │   ├── 📄 get-user-id.decorator.ts
│   │   │   └── 📄 public.decorator.ts
│   │   ├── 📁 dtos/
│   │   │   ├── 📄 paginated-response.dto.ts
│   │   │   └── 📄 pagination.dto.ts
│   │   ├── 📁 guards/
│   │   │   └── 📄 auth.guard.ts
│   │   └── 📁 prisma/
│   │       └── 📁 services/
│   │           └── 📄 prisma.service.ts
│   └── 📁 modules/
│       ├── 📁 auth/
│       │   ├── 📁 controllers/
│       │   │   ├── 📄 auth.controller.spec.ts
│       │   │   └── 📄 auth.controller.ts
│       │   ├── 📁 dtos/
│       │   │   ├── 📄 login-user.dto.ts
│       │   │   ├── 📄 recovery-password.dto.ts
│       │   │   ├── 📄 reset-password.dto.ts
│       │   │   └── 📄 verify-recovery-code.dto.ts
│       │   ├── 📁 repositories/
│       │   │   ├── 📄 password-recovery.repository.interface.ts
│       │   │   ├── 📄 password-recovery.repository.spec.ts
│       │   │   └── 📄 password-recovery.repository.ts
│       │   ├── 📁 services/
│       │   │   ├── 📄 auth.service.spec.ts
│       │   │   ├── 📄 auth.service.ts
│       │   │   ├── 📄 password.service.spec.ts
│       │   │   ├── 📄 password.service.ts
│       │   │   ├── 📄 token.service.spec.ts
│       │   │   └── 📄 token.service.ts
│       │   ├── 📁 types/
│       │   │   └── 📄 auth.types.ts
│       │   └── 📄 auth.module.ts
│       ├── 📁 health/
│       │   ├── 📁 controllers/
│       │   │   └── 📄 health.controller.ts
│       │   └── 📄 health.module.ts
│       ├── 📁 mail/
│       │   ├── 📁 services/
│       │   │   └── 📄 mail.service.ts
│       │   └── 📄 mail.module.ts
│       └── 📁 users/
│           ├── 📁 controllers/
│           │   ├── 📄 user.controller.spec.ts
│           │   └── 📄 user.controller.ts
│           ├── 📁 dtos/
│           │   ├── 📁 response/
│           │   │   └── 📄 user-response.dto.ts
│           │   ├── 📄 create-user.dto.ts
│           │   └── 📄 update-user.dto.ts
│           ├── 📁 repositories/
│           │   ├── 📄 user.repository.interface.ts
│           │   ├── 📄 user.repository.ts
│           │   └── 📄 users.repository.spec.ts
│           ├── 📁 services/
│           │   ├── 📄 user.service.spec.ts
│           │   └── 📄 user.service.ts
│           └── 📄 user.module.ts
├── 📁 test/
│   ├── 📄 app.e2e-spec.ts
│   └── 📄 jest-e2e.json
├── 🔒 .env
├── 📄 .env.example
├── 🚫 .gitignore
├── 📄 .prettierrc
├── 🐳 Dockerfile
├── 📖 README.md
├── ⚙️ docker-compose.yml
├── 📄 eslint.config.mjs
├── 📄 nest-cli.json
├── 📄 package-lock.json
├── 📄 package.json
├── 📄 tsconfig.json
``` 

---

## 🚀 Rodando a Aplicação com Docker (Recomendado)

### Pré-requisitos

-   [Docker](https://www.docker.com/get-started)
-   [Docker Compose](https://docs.docker.com/compose/install/)

### 1. Configuração Inicial

```bash
cp .env.example .env
```

### 2. Build e Execução

```bash
docker-compose up --build
```

A aplicação estará disponível em `http://localhost:3000`.

---

## 🛠️ Rodando Localmente (Alternativo)

### 1. Instalação

```bash
npm install
```

### 2. Banco de Dados

Configure o `DATABASE_URL` no `.env` e rode:

```bash
npx prisma migrate dev
```

### 3. Execução

```bash
npm run start:dev
```

---

## 🧪 Testes

```bash
npm run test       # unitários
npm run test:e2e   # e2e
npm run test:cov   # cobertura
```

## Licença

[MIT](https://github.com/nestjs/nest/blob/master/LICENSE)
