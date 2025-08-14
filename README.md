# NestJS Project Starter Kit

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  Um template inicial para aplicações backend escaláveis utilizando <a href="http://nodejs.org" target="_blank">Node.js</a> e o framework <a href="https://github.com/nestjs/nest">NestJS</a>.
</p>

## Descrição

Este repositório contém uma aplicação NestJS pré-configurada com TypeScript, Prisma ORM e Docker, pronta para desenvolvimento. O objetivo é fornecer uma base sólida e escalável para novas aplicações, com um ambiente de desenvolvimento conteinerizado para garantir consistência entre diferentes máquinas.

---

## 🚀 Rodando a Aplicação com Docker (Recomendado)

Este método é o mais recomendado, pois configura e executa a aplicação e o banco de dados em contêineres isolados, garantindo um ambiente consistente e sem a necessidade de instalar dependências localmente.

### Pré-requisitos

-   [Docker](https://www.docker.com/get-started) instalado e em execução.
-   [Docker Compose](https://docs.docker.com/compose/install/) (geralmente já vem com o Docker Desktop).

### 1. Configuração Inicial

Primeiro, copie o arquivo de variáveis de ambiente de exemplo. Ele contém a `DATABASE_URL` que o Prisma usará para se conectar ao banco de dados no contêiner.

```bash
cp .env.example .env
```

### 2. Build e Execução

Com o Docker em execução, suba os serviços (API e banco de dados) com um único comando. O `--build` garante que a imagem Docker será construída na primeira vez.

```bash
docker-compose up --build
```

A aplicação estará disponível em `http://localhost:3000`.

O terminal ficará anexado aos logs dos contêineres. Para rodar em segundo plano (detached mode), utilize:

```bash
docker-compose up --build -d
```

### Comandos Úteis do Docker

```bash
# Parar os contêineres
docker-compose down

# Visualizar logs da aplicação
docker-compose logs -f nest-api

# Acessar o terminal do contêiner da API
docker-compose exec nest-api sh
```

---

## 🛠️ Rodando a Aplicação Localmente (Alternativo)

Se preferir não usar Docker, você pode rodar a aplicação localmente.

### Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão LTS recomendada)
-   [npm](https://www.npmjs.com/)
-   Uma instância do PostgreSQL rodando localmente.

### 1. Instalação

```bash
npm install
```

### 2. Configuração do Banco de Dados

Certifique-se de que sua instância PostgreSQL esteja rodando e atualize a variável `DATABASE_URL` no arquivo `.env` para apontar para ela.

### 3. Migrations do Prisma

Aplique as migrações para criar as tabelas no banco de dados:

```bash
npx prisma migrate dev
```

### 4. Execução

```bash
# Modo de desenvolvimento com hot-reload
npm run start:dev

# Modo de produção
npm run start:prod
```

---

## 🧪 Testes

Para executar os testes unitários e de ponta a ponta (e2e):

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Relatório de cobertura de testes
npm run test:cov
```

## Licença

Este projeto é licenciado sob a [Licença MIT](https://github.com/nestjs/nest/blob/master/LICENSE).