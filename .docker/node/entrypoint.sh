#!/bin/sh
set -e

echo "📦 Instalando dependências..."
npm install

echo "🔄 Gerando Prisma Client..."
npx prisma generate

echo "📜 Rodando migrations..."
npx prisma migrate deploy

echo "🚀 Iniciando NestJS..."
npm run start:dev
