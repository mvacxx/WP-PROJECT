FROM node:22-alpine AS base
WORKDIR /app

COPY package.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared/package.json ./packages/shared/package.json

RUN npm install --workspaces --include-workspace-root

COPY . .
RUN npm run build -w apps/web

EXPOSE 3000
CMD ["npm", "run", "start", "-w", "apps/web"]
