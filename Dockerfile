FROM node:24-alpine AS base
WORKDIR /app
ENV YARN_CACHE_FOLDER=/root/.yarn
RUN corepack enable


FROM base AS builder
COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile

COPY prisma ./prisma
COPY prisma.config.ts tsconfig.json tsup.config.ts ./
COPY src ./src

RUN yarn build


FROM base AS runner
ENV NODE_ENV=production

COPY package.json yarn.lock ./

RUN --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile --production=true

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

EXPOSE 3000

CMD ["sh", "-c", "yarn prisma:deploy && yarn start"]
