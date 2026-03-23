FROM node:22-alpine AS base
WORKDIR /app

COPY package.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY prisma ./prisma

RUN npm install --workspaces --include-workspace-root

COPY . .
RUN npm run build -w apps/api

EXPOSE 3001
CMD ["npm", "run", "start", "-w", "apps/api"]
