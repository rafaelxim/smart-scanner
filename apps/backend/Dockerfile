FROM node:24-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile

COPY apps/backend apps/backend
COPY packages/shared packages/shared

RUN pnpm --filter @smart-scanner/backend prisma:generate
RUN pnpm --filter @smart-scanner/backend build

EXPOSE 3000

CMD ["pnpm", "--filter", "@smart-scanner/backend", "start"]
