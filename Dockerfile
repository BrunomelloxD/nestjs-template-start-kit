FROM node:lts-alpine3.20 AS deps
WORKDIR /home/node/app
COPY package*.json ./
RUN npm install

FROM node:lts-alpine3.20 AS builder
WORKDIR /home/node/app
COPY --from=deps /home/node/app/node_modules ./node_modules
COPY . .

RUN DATABASE_URL="" npx prisma generate

RUN npm run build

FROM node:lts-alpine3.20 AS final
WORKDIR /home/node/app
COPY --from=builder /home/node/app/node_modules ./node_modules
COPY --from=builder /home/node/app/dist ./dist
COPY --from=builder /home/node/app/prisma ./prisma
COPY --from=builder /home/node/app/package*.json ./
COPY --from=builder /home/node/app/nest-cli.json ./
COPY --from=builder /home/node/app/tsconfig.json ./
COPY --from=builder /home/node/app/tsconfig.build.json ./

EXPOSE 3000
